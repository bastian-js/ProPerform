import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import api from "@/src/utils/axiosInstance";
import CreatePlanModal from "@/src/components/modals/CreatePlanModal";
import EditPlanModal from "@/src/components/modals/EditPlanModal";
import WorkoutModal from "@/src/components/modals/WorkoutModal";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

type TrainingPlan = {
  tpid: number;
  name: string;
  description: string;
  sport: string;
  difficulty: string;
  duration_weeks: number;
  sessions_per_week: number;
};

type UserTrainingPlan = {
  id: number;
  tpid: number;
  is_selected: number;
  status: string;
};

type WorkoutHistoryEntry = {
  planId: number | null;
  planName: string;
  totalSets: number;
  completedSets: number;
  completedAt: string;
};

const getSportIcon = (sport: string) => {
  const map: Record<string, string> = {
    gym: "fitness-center",
    basketball: "sports-basketball",
  };

  return (map[sport] ?? "sports") as any;
};

export default function TrainingScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const [activeTab, setActiveTab] = useState("Eigene Pläne");
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [userPlans, setUserPlans] = useState<UserTrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [workoutVisible, setWorkoutVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [editPlan, setEditPlan] = useState<TrainingPlan | null>(null);
  const [hasTrainer, setHasTrainer] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryEntry[]>(
    [],
  );

  const tabs = hasTrainer ? ["Eigene Pläne", "Trainer"] : ["Eigene Pläne"];

  const startWorkout = (plan: TrainingPlan) => {
    setSelectedPlan({ id: plan.tpid, name: plan.name });
    setWorkoutVisible(true);
  };

  const getUserPlanForTrainingPlan = useCallback(
    (tpid: number) => userPlans.find((plan) => plan.tpid === tpid),
    [userPlans],
  );

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

  const fetchUserPlans = useCallback(async () => {
    try {
      const response = await api.get("/users/training-plans");
      setUserPlans(response.data.plans);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setUserPlans([]);
      } else {
        Alert.alert("Fehler", "User-Pläne konnten nicht geladen werden.");
      }
    }
  }, []);

  const fetchTrainer = useCallback(async () => {
    try {
      await api.get("/users/me/trainer");
      setHasTrainer(true);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setHasTrainer(false);
      }
    }
  }, []);

  const refreshAllPlans = useCallback(async () => {
    await Promise.all([fetchPlans(), fetchUserPlans()]);
  }, [fetchPlans, fetchUserPlans]);

  const loadWorkoutHistory = useCallback(async () => {
    const historyRaw = await AsyncStorage.getItem("workout_history");

    if (!historyRaw) {
      setWorkoutHistory([]);
      return;
    }

    setWorkoutHistory(JSON.parse(historyRaw));
  }, []);

  const handleActivatePlan = async (plan: TrainingPlan) => {
    const userPlan = getUserPlanForTrainingPlan(plan.tpid);

    if (!userPlan) {
      Alert.alert(
        "Fehler",
        "Kein zugewiesener User-Plan für diesen Trainingsplan gefunden.",
      );
      return;
    }

    if (userPlan.is_selected === 1) {
      Alert.alert("Info", "Plan bereits ausgewählt.");
      return;
    }

    try {
      const response = await api.patch(
        `/users/training-plans/${userPlan.id}/select`,
      );

      await fetchUserPlans();
    } catch (err: any) {
      Alert.alert(
        "Fehler",
        err.response?.data?.message || "Plan konnte nicht aktiviert werden.",
      );
    }
  };

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
              await refreshAllPlans();
            } catch {
              Alert.alert("Fehler", "Plan konnte nicht gelöscht werden.");
            }
          },
        },
      ],
    );
  };

  const handleMorePress = (plan: TrainingPlan) => {
    const userPlan = getUserPlanForTrainingPlan(plan.tpid);
    const isSelected = userPlan?.is_selected === 1;
    const selectAction = {
      text: isSelected ? "Plan bereits ausgewählt" : "Plan auswählen",
      onPress: () => {
        if (isSelected) {
          Alert.alert("Info", "Plan ist bereits aktiv.");
          return;
        }
        void handleActivatePlan(plan);
      },
    };
    const editAction = {
      text: "Bearbeiten",
      onPress: () => {
        setEditPlan(plan);
        setEditVisible(true);
      },
    };

    if (Platform.OS === "android") {
      Alert.alert(plan.name, "Was möchtest du tun?", [
        { text: "Abbrechen", style: "cancel" },
        selectAction,
        {
          text: "Mehr",
          onPress: () => {
            Alert.alert(plan.name, "Weitere Aktionen", [
              { text: "Abbrechen", style: "cancel" },
              editAction,
              {
                text: "Löschen",
                style: "destructive",
                onPress: () => handleDeletePlan(plan.tpid),
              },
            ]);
          },
        },
      ]);
      return;
    }

    Alert.alert(plan.name, "Was möchtest du tun?", [
      { text: "Abbrechen", style: "cancel" },
      selectAction,
      editAction,
      {
        text: "Löschen",
        style: "destructive",
        onPress: () => handleDeletePlan(plan.tpid),
      },
    ]);
  };

  useEffect(() => {
    fetchPlans();
    fetchUserPlans();
    fetchTrainer();
    void loadWorkoutHistory();
  }, [fetchPlans, fetchUserPlans, fetchTrainer, loadWorkoutHistory]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={typography.title}>Trainingspläne</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => setHistoryVisible(true)}
          >
            <Icon name="history" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="add" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Workout History Modal */}
      <Modal
        visible={historyVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setHistoryVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setHistoryVisible(false)}
          />

          <View style={styles.modalSheet}>
            <SafeAreaView style={styles.modalContainer} edges={["bottom"]}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderSpacer} />

                <View style={styles.modalHeaderCenter}>
                  <Text style={styles.modalTitle}>Trainingsverlauf</Text>
                  <Text style={styles.modalSubtitle}>
                    Deine abgeschlossenen Workouts
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setHistoryVisible(false)}
                >
                  <Icon name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              {workoutHistory.length === 0 ? (
                <View style={styles.historyEmptyState}>
                  <Icon
                    name="history-toggle-off"
                    size={56}
                    color={colors.borderLight}
                  />
                  <Text style={styles.emptyTitle}>
                    Noch kein abgeschlossenes Training
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    Sobald du ein Workout beendest, erscheint es hier.
                  </Text>
                </View>
              ) : (
                <ScrollView
                  contentContainerStyle={styles.historyList}
                  showsVerticalScrollIndicator={false}
                >
                  {workoutHistory.map((entry, index) => (
                    <View
                      key={`${entry.completedAt}-${entry.planId ?? "no-plan"}-${index}`}
                      style={styles.historyCard}
                    >
                      <View style={styles.historyCardTop}>
                        <View style={styles.historyContent}>
                          <Text style={styles.historyPlanName} numberOfLines={1}>
                            {entry.planName}
                          </Text>
                          <Text style={styles.historySets}>
                            Sets erledigt: {entry.completedSets}/{entry.totalSets}
                          </Text>
                        </View>
                        <Text style={styles.historyDate}>
                          {new Date(entry.completedAt).toLocaleDateString(
                            "de-AT",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            },
                          )}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}
            </SafeAreaView>
          </View>
        </View>
      </Modal>
      {/* End Workout History Modal */}

      <View style={styles.categories}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.categoryChip,
              activeTab === tab && styles.categoryChipActive,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.categoryText,
                activeTab === tab && styles.categoryTextActive,
              ]}
            >
              {tab}
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
              contentContainerStyle={[
                styles.list,
                { paddingBottom: tabBarHeight + spacing.xl },
              ]}
            >
              {plans.map((plan) => {
                const userPlan = getUserPlanForTrainingPlan(plan.tpid);
                const isSelected = userPlan?.is_selected === 1;

                return (
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

                    <View style={styles.rightActions}>
                      {isSelected && <View style={styles.activeDot} />}
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
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </>
      )}

      <CreatePlanModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onPlanCreated={refreshAllPlans}
      />

      <EditPlanModal
        visible={editVisible}
        plan={editPlan}
        onClose={() => setEditVisible(false)}
        onPlanUpdated={refreshAllPlans}
      />

      <WorkoutModal
        visible={workoutVisible}
        planId={selectedPlan?.id ?? null}
        planName={selectedPlan?.name ?? ""}
        onClose={() => {
          setWorkoutVisible(false);
          void loadWorkoutHistory();
        }}
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
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
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#22C55E",
  },
  morevert: {
    marginLeft: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: "72%",
  },
  modalContainer: {
    flex: 1,
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  modalHeaderSpacer: {
    width: 42,
  },
  modalHeaderCenter: {
    flex: 1,
    alignItems: "center",
  },
  modalTitle: {
    ...typography.body,
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  modalSubtitle: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalCloseButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  historyEmptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  historyList: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  historyCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  historyCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  historyContent: {
    flex: 1,
  },
  historyPlanName: {
    ...typography.body,
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  historyDate: {
    ...typography.body,
    width: 88,
    textAlign: "center",
    fontSize: 12,
    color: colors.textSecondary,
  },
  historySets: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
