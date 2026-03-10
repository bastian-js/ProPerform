import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { colors } from "@/src/theme/colors";
import { typography } from "@/src/theme/typography";
import { spacing } from "@/src/theme/spacing";
import ExerciseDetailModal from "@/src/components/modals/ExerciseDetailModal";

type Exercise = {
  eid: number;
  name: string;
  description: string;
  instructions: string;
  equipment_needed: string;
  thumbnail_url?: string;
  video_url?: string;
  muscleGroup: string;
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

const categories = ["Gym", "Basketball"];

// dummy daten, TODO: gerpüfte Erklärungen benutzen + API
const exercises: Exercise[] = [
  {
    eid: 1,
    name: "Bankdrücken",
    muscleGroup: "Brust",
    sid: 1,
    dlid: 2,
    description:
      "Bankdrücken ist eine grundlegende Kraftübung für die Brustmuskulatur. Du legst dich auf eine Bank, greifst die Hantelstange schulterbreit und drückst das Gewicht kontrolliert nach oben und wieder herunter.",
    instructions:
      "Lege dich auf die Bank, greife die Stange schulterbreit, senke sie zur Brust und drücke kontrolliert nach oben.",
    equipment_needed: "Langhantel, Bank",
  },
  {
    eid: 2,
    name: "Kniebeugen",
    muscleGroup: "Beine",
    sid: 1,
    dlid: 1,
    description:
      "Kniebeugen trainieren die gesamte Beinmuskulatur. Stelle deine Füße schulterbreit auseinander und senke deinen Körper kontrolliert ab.",
    instructions:
      "Füße schulterbreit, Knie beugen, Oberschenkel parallel zum Boden, Rücken gerade halten.",
    equipment_needed: "Langhantel, Squat Rack",
  },
  {
    eid: 3,
    name: "Klimmzüge",
    muscleGroup: "Rücken",
    sid: 1,
    dlid: 3,
    description:
      "Klimmzüge sind eine effektive Übung für den Rücken. Greife die Stange breiter als schulterbreit und ziehe dich nach oben.",
    instructions:
      "Stange breiter als schulterbreit greifen, Körper nach oben ziehen bis das Kinn über der Stange ist.",
    equipment_needed: "Klimmzugstange",
  },
  {
    eid: 4,
    name: "Kreuzheben",
    muscleGroup: "Ganzkörper",
    sid: 1,
    dlid: 3,
    description:
      "Kreuzheben ist eine der effektivsten Ganzkörperübungen. Du hebst eine Langhantel vom Boden auf.",
    instructions:
      "Füße hüftbreit, Rücken gerade, Hüfte strecken und Stange kontrolliert vom Boden heben.",
    equipment_needed: "Langhantel",
  },
  {
    eid: 5,
    name: "Dribbling",
    muscleGroup: "Ballhandling",
    sid: 2,
    dlid: 1,
    description:
      "Dribbling ist die grundlegende Technik im Basketball. Tippe den Ball rhythmisch mit den Fingerkuppen auf den Boden.",
    instructions:
      "Ball mit Fingerkuppen tippen, Blick nach vorne, Körper leicht gebeugt.",
    equipment_needed: "Basketball",
  },
  {
    eid: 6,
    name: "Crossover Drills",
    muscleGroup: "Ballhandling",
    sid: 2,
    dlid: 2,
    description:
      "Crossover Drills verbessern deine Ballkontrolle. Wechsle den Ball schnell von einer Hand zur anderen.",
    instructions:
      "Ball schnell zwischen den Händen wechseln, tief bleiben, Blick nach vorne.",
    equipment_needed: "Basketball",
  },
  {
    eid: 7,
    name: "Freiwürfe",
    muscleGroup: "Wurftechnik",
    sid: 2,
    dlid: 1,
    description:
      "Freiwürfe erfordern Konzentration und eine konsistente Wurfroutine.",
    instructions:
      "An die Freiwurflinie stellen, Knie leicht beugen, Ball mit gleichmäßiger Bewegung in den Korb werfen.",
    equipment_needed: "Basketball, Korb",
  },
];

export default function ExerciseScreen() {
  const [activeCategory, setActiveCategory] = useState("Gym");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  const filtered = exercises.filter(
    (ex) =>
      getSportName(ex.sid) === activeCategory &&
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleExercisePress = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setModalVisible(true);
  };

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
            onPress={() => setActiveCategory(c)}
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
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
                  style={{ width: "100%", height: "100%", borderRadius: 12 }}
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
              <Text style={styles.exerciseMuscle}>{exercise.muscleGroup}</Text>
            </View>

            <Icon name="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
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
});
