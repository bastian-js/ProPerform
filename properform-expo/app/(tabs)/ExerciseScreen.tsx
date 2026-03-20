import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { colors } from "@/src/theme/colors";
import { typography } from "@/src/theme/typography";
import { spacing } from "@/src/theme/spacing";
import ExerciseDetailModal from "@/src/components/modals/ExerciseDetailModal";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import api from "@/src/utils/axiosInstance";

type MuscleGroup = {
  mgid: number;
  name: string;
  is_primary: number;
};

type Exercise = {
  eid: number;
  name: string;
  description: string;
  instructions: string;
  equipment_needed: string;
  thumbnail_url?: string;
  video_url?: string;
  muscle_groups: MuscleGroup[];
  sid: number;
  dlid: number;
};

const getSportName = (sid: number) => {
  const sports: Record<number, string> = {
    1: "Gym",
    2: "Basketball",
  };
  return sports[sid] ?? "Unbekannt"; // falls unbekannt
};

const getDifficultyLabel = (dlid: number) => {
  const levels: Record<number, string> = {
    1: "Beginner",
    2: "Intermediate",
    3: "Advanced",
    4: "Expert",
  };
  return levels[dlid] ?? "Unbekannt";
};

const categoryToFilter = (category: string): string => {
  const map: Record<string, string> = {
    Gym: "gym",
    Basketball: "basketball",
  };
  return map[category] ?? "gym";
};

const categories = ["Gym", "Basketball"];
const LIMIT = 10;

export default function ExerciseScreen() {
  const [activeCategory, setActiveCategory] = useState("Gym");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchExercises = useCallback(
    async (category: string, pageNum: number) => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/exercises", {
          params: {
            filter: categoryToFilter(category),
            page: pageNum,
            limit: LIMIT,
          },
        });

        if (pageNum === 1) {
          setExercises(response.data.exercises);
        } else {
          setExercises((prev) => [...prev, ...response.data.exercises]);
        }
        setTotalPages(response.data.totalPages);
      } catch (err: any) {
        setError(err.response?.data?.error || "Fehler beim Laden der Übungen.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    setPage(1);
    fetchExercises(activeCategory, 1);
  }, [activeCategory]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setSearchQuery("");
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchExercises(activeCategory, nextPage);
    }
  };

  const handleExercisePress = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setModalVisible(true);
  };

  const filtered = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={typography.title}>Übungen</Text>
        <TouchableOpacity onPress={() => setSearchVisible(!searchVisible)}>
          <Icon
            name={searchVisible ? "close" : "search"}
            size={24}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {searchVisible && (
        <View style={styles.searchContainer}>
          <Icon name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Übung suchen..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      )}

      <View style={styles.categories}>
        {categories.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.categoryChip,
              activeCategory === c && styles.categoryChipActive,
            ]}
            onPress={() => handleCategoryChange(c)}
          >
            <Text
              style={[
                styles.categoryText,
                activeCategory === c && styles.categoryTextActive,
              ]}
            >
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchExercises(activeCategory, 1)}>
            <Text style={styles.retryText}>Erneut versuchen</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {loading && page === 1 ? (
          <ActivityIndicator
            size="large"
            color={colors.primaryBlue}
            style={styles.loader}
          />
        ) : (
          <>
            {filtered.map((exercise) => (
              <TouchableOpacity
                key={exercise.eid}
                style={styles.exerciseCard}
                onPress={() => handleExercisePress(exercise)}
                activeOpacity={0.7}
              >
                <View style={styles.exerciseImage}>
                  {exercise.thumbnail_url ? (
                    <Image
                      source={{ uri: exercise.thumbnail_url }}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 12,
                      }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Icon
                      name="fitness-center"
                      size={22}
                      color={colors.primaryBlue}
                    />
                  )}
                </View>

                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  {/* muscle group api not working
                  <Text style={styles.exerciseMuscle}>
                    {(exercise.muscle_groups ?? []).find(
                      (mg) => mg.is_primary === 1,
                    )?.name ?? ""}
                  </Text>
                  */}
                </View>

                <Icon
                  name="chevron-right"
                  size={22}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            ))}

            {page < totalPages && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={handleLoadMore}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.loadMoreText}>Mehr laden</Text>
                )}
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      {selectedExercise && (
        <ExerciseDetailModal
          visible={modalVisible}
          exercise={selectedExercise}
          onClose={() => setModalVisible(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screenPaddingHorizontal,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  categories: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryChip: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.lg,
    borderRadius: 999,
    backgroundColor: colors.white,
    alignItems: "center",
    flex: 1,
  },
  categoryChipActive: {
    backgroundColor: colors.primaryBlue,
  },
  categoryText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.white,
    fontWeight: "700",
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.sm,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  exerciseImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F0F4FF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
    fontSize: 15,
  },
  exerciseMuscle: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  loader: {
    marginTop: spacing.xl,
  },
  errorContainer: {
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  errorText: {
    ...typography.body,
    color: "red",
    fontSize: 14,
  },
  retryText: {
    ...typography.body,
    color: colors.primaryBlue,
    fontWeight: "600",
    fontSize: 14,
  },
  loadMoreButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 999,
    paddingVertical: spacing.sm,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  loadMoreText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
});
