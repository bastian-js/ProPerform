import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { colors } from "@/src/theme/colors";
import { typography } from "@/src/theme/typography";
import { spacing } from "@/src/theme/spacing";
import api from "@/src/utils/axiosInstance";
import CreatePlanModal from "@/src/components/modals/CreatePlanModal";
import WorkoutModal from "@/src/components/modals/WorkoutModal";

type TrainingPlan = {
  tpid: number;
  name: string;
  description: string;
  sport: string;
  difficulty: string;
  duration_weeks: number;
  sessions_per_week: number;
};

const getSportIcon = (sport: string) => {
  const map: Record<string, string> = {
    gym: "fitness-center",
    basketball: "sports-basketball",
  };

  return (map[sport] ?? "sports") as any;
};

const tabs = ["Eigene Pläne", "Trainer"];

export default function TrainingScreen() {
  const [activeTab, setActiveTab] = useState("Eigene Pläne");
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [workoutVisible, setWorkoutVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const startWorkout = (plan: TrainingPlan) => {
    setSelectedPlan({ id: plan.tpid, name: plan.name });
    setWorkoutVisible(true);
  };

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/training-plans");
      setPlans(response.data.plans);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setPlans([]);
      } else {
        setError("Fehler beim Laden der Trainingspläne.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeletePlan = async (tpid: number) => {
    Alert.alert(
      "Plan löschen",
      "Möchtest du diesen Trainingsplan wirklich unwiderruflich löschen?",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Löschen",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/training-plans/${tpid}`);
              fetchPlans(); // Liste aktualisieren
            } catch (err) {
              Alert.alert("Fehler", "Plan konnte nicht gelöscht werden.");
            }
          },
        },
      ],
    );
  };

  const handleMorePress = (plan: TrainingPlan) => {
    Alert.alert(plan.name, "Was möchtest du tun?", [
      { text: "Abbrechen", style: "cancel" },
      {
        text: "Bearbeiten",
        onPress: () => {
          // TODO: Edit
          console.log("Edit plan", plan.tpid);
        },
      },
      {
        text: "Löschen",
        style: "destructive",
        onPress: () => handleDeletePlan(plan.tpid),
      },
    ]);
  };

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={typography.title}>Trainingspläne</Text>

        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Icon name="add" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.categories}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.categoryChip,
              activeTab === t && styles.categoryChipActive,
            ]}
            onPress={() => setActiveTab(t)}
          >
            <Text
              style={[
                styles.categoryText,
                activeTab === t && styles.categoryTextActive,
              ]}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "Trainer" ? (
        <View style={styles.centeredContent}>
          <Icon name="construction" size={64} color={colors.borderLight} />
          <Text style={styles.emptyTitle}>In Bearbeitung</Text>
          <Text style={styles.emptySubtitle}>
            Dieser Bereich wird gerade für dich vorbereitet.
          </Text>
        </View>
      ) : (
        <>
          {loading && (
            <ActivityIndicator
              size="large"
              color={colors.primaryBlue}
              style={styles.loader}
            />
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={fetchPlans}>
                <Text style={styles.retryText}>Erneut versuchen</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && !error && plans.length === 0 && (
            <View style={styles.emptyContainer}>
              <Icon
                name="fitness-center"
                size={64}
                color={colors.borderLight}
              />
              <Text style={styles.emptyTitle}>Kein Trainingsplan</Text>
              <Text style={styles.emptySubtitle}>
                Erstelle deinen ersten Trainingsplan
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setModalVisible(true)}
              >
                <Icon name="add" size={20} color={colors.white} />
                <Text style={styles.emptyButtonText}>Neuer Plan</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && plans.length > 0 && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.list}
            >
              {plans.map((plan) => (
                <TouchableOpacity
                  key={plan.tpid}
                  style={styles.planCard}
                  onPress={() => startWorkout(plan)}
                  activeOpacity={0.7}
                >
                  <View style={styles.leftBlock}>
                    <View style={styles.planIcon}>
                      <Icon
                        name={getSportIcon(plan.sport)}
                        size={20}
                        color={colors.primaryBlue}
                      />
                    </View>
                    <Text style={styles.sportText}>{plan.sport}</Text>
                  </View>

                  <View style={styles.planContent}>
                    <Text style={styles.planName} numberOfLines={1}>
                      {plan.name}
                    </Text>
                    <Text style={styles.planDetailsText}>
                      {plan.sessions_per_week}x pro Woche
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleMorePress(plan);
                    }}
                    style={styles.morevert}
                  >
                    <Icon
                      name="more-vert"
                      size={24}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </>
      )}

      <CreatePlanModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onPlanCreated={fetchPlans}
      />

      <WorkoutModal
        visible={workoutVisible}
        planId={selectedPlan?.id ?? null}
        planName={selectedPlan?.name ?? ""}
        onClose={() => setWorkoutVisible(false)}
      />
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
  loader: {
    marginTop: spacing.xl,
  },
  errorContainer: {
    alignItems: "center",
    marginTop: spacing.xl,
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
  centeredContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
    gap: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  emptyTitle: {
    ...typography.title,
    fontSize: 20,
    marginTop: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryBlue,
    borderRadius: 999,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  emptyButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "600",
    fontSize: 15,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  leftBlock: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    gap: 2,
  },
  planIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0F4FF",
    alignItems: "center",
    justifyContent: "center",
  },
  sportText: {
    ...typography.body,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500",
    paddingTop: spacing.xs,
    textTransform: "capitalize",
  },
  planContent: {
    flex: 1,
    gap: 2,
  },
  planName: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
    fontSize: 15,
  },
  planDetailsText: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  morevert: {
    marginLeft: spacing.xs,
  },
});
