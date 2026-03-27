import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { typography } from "@/src/theme/typography";
import { spacing } from "@/src/theme/spacing";
import { colors } from "@/src/theme/colors";
import SecondaryButton from "@/src/components/secondaryButton";
import WorkoutModal from "@/src/components/modals/WorkoutModal";
import api from "@/src/utils/axiosInstance";
import { useFocusEffect } from "expo-router";
import { MaterialIcons as Icon } from "@expo/vector-icons";

const getStreakLabel = (days: number) =>
  `${days} ${days === 1 ? "Tag" : "Tage"} aktiv`;

const formatWorkoutDuration = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds} Sek.`;
  }

  return `${minutes} min ${String(seconds).padStart(2, "0")} s`;
};

type LastWorkout = {
  name: string;
  duration: number;
  date: string;
};

type SelectedTrainingPlan = {
  id: number;
  uid: number;
  tpid: number;
  assigned_by_trainer: number | null;
  start_date: string;
  end_date: string | null;
  completion_percentage: number | string;
  status: string;
  is_selected: number;
  created_at: string;
  updated_at: string;
  training_plan: {
    tpid: number;
    name: string;
    description: string;
    duration_weeks: number;
    sessions_per_week: number;
  };
};

export default function HomeScreen() {
  const [user, setUser] = useState<{
    firstname: string;
    profile_image_url: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [streakDays, setStreakDays] = useState(0);
  const [streakLoading, setStreakLoading] = useState(true);
  const [longestStreak, setLongestStreak] = useState(0);
  const [lastActivityDate, setLastActivityDate] = useState<string | null>(null);
  const [completed, setCompleted] = useState<boolean[]>(Array(7).fill(false));
  const [lastWorkout, setLastWorkout] = useState<LastWorkout | null>(null);
  const [selectedTrainingPlan, setSelectedTrainingPlan] =
    useState<SelectedTrainingPlan | null>(null);
  const [selectedTrainingLoading, setSelectedTrainingLoading] = useState(true);
  const [selectedTrainingMissing, setSelectedTrainingMissing] = useState(false);
  const [workoutVisible, setWorkoutVisible] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await api.get("/users/me");
        setUser(response.data);
      } catch (err) {
        console.log("Fehler beim Laden der User-Daten:", err);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  const calculateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Guten Morgen,";
    if (hour < 18) return "Guten Tag,";
    return "Guten Abend,";
  };

  const loadTrainingStreak = useCallback(async () => {
    try {
      setStreakLoading(true);

      const response = await api.post("/users/streaks/training");
      const currentStreak = response.data.current_streak ?? 0;
      const longest = response.data.longest_streak ?? 0;
      const lastActivity = response.data.last_activity_date ?? null;

      setStreakDays(currentStreak);
      setLongestStreak(longest);
      setLastActivityDate(lastActivity);

      let visibleCount = currentStreak % 7;

      if (currentStreak > 0 && visibleCount === 0) {
        visibleCount = 7;
      }

      const nextCompleted = lastActivity
        ? Array.from({ length: 7 }, (_, index) => index < visibleCount)
        : Array(7).fill(false);

      setCompleted(nextCompleted);
    } catch (err: any) {
      Alert.alert(
        "Fehler",
        err.response?.data?.message ||
          "Training-Streak konnte nicht geladen werden.",
      );
      setStreakDays(0);
      setLongestStreak(0);
      setLastActivityDate(null);
      setCompleted(Array(7).fill(false));
    } finally {
      setStreakLoading(false);
    }
  }, []);

  const loadLastWorkout = useCallback(async () => {
    const storedWorkout = await AsyncStorage.getItem("last_workout");

    if (!storedWorkout) {
      setLastWorkout(null);
      return;
    }

    setLastWorkout(JSON.parse(storedWorkout));
  }, []);

  const loadSelectedTrainingPlan = useCallback(async () => {
    try {
      setSelectedTrainingLoading(true);
      const response = await api.get("/users/training-plans/selected");
      setSelectedTrainingPlan(response.data.plan);
      setSelectedTrainingMissing(false);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setSelectedTrainingPlan(null);
        setSelectedTrainingMissing(true);
      } else {
        console.log(
          "Fehler beim Laden des aktiven Trainingsplans:",
          err.response?.data || err.message,
        );
        setSelectedTrainingPlan(null);
        setSelectedTrainingMissing(true);
      }
    } finally {
      setSelectedTrainingLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setGreeting(calculateGreeting());
      void loadTrainingStreak();
      void loadLastWorkout();
      void loadSelectedTrainingPlan();
    }, [loadTrainingStreak, loadLastWorkout, loadSelectedTrainingPlan]),
  );

  const days = ["M", "D", "M", "D", "F", "S", "S"];

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topRow}>
          <View style={styles.avatarIconWrap}>
            <Icon name="person" size={28} color={colors.primaryBlue} />
          </View>

          <View style={styles.greetingBlock}>
            <Text style={styles.goodMorning}>{greeting}</Text>
            <Text style={styles.hello}>{user?.firstname || "..."}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.streakHeader}>
            <Text style={styles.streakTitle}>Trainings-Streak</Text>

            <View style={styles.streakRight}>
              <Text style={styles.fire}>🔥</Text>
              <Text style={styles.streakActive}>
                {streakLoading
                  ? "Lädt..."
                  : `${getStreakLabel(streakDays)} · Bestwert ${longestStreak}`}
              </Text>
            </View>
          </View>

          {lastActivityDate ? (
            <Text style={styles.streakSubtext}>
              Letzte Aktivität:{" "}
              {new Date(lastActivityDate).toLocaleDateString("de-AT")}
            </Text>
          ) : null}

          <View style={styles.streakSquaresRow}>
            {completed.map((isOn, dayIndex) => (
              <View
                key={dayIndex}
                style={[
                  styles.streakSquare,
                  isOn ? styles.streakSquareOn : styles.streakSquareOff,
                ]}
              />
            ))}
          </View>

          <View style={styles.streakDaysRow}>
            {days.map((dayLabel, dayIndex) => (
              <Text key={dayIndex} style={styles.streakDayLabel}>
                {dayLabel}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.lastWorkoutHeader}>
            <Text style={styles.lastWorkoutTitle}>Letztes Workout</Text>
            {lastWorkout ? (
              <View style={styles.lastWorkoutBadge}>
                <Text style={styles.lastWorkoutBadgeText}>
                  {new Date(lastWorkout.date).toLocaleDateString("de-AT")}
                </Text>
              </View>
            ) : null}
          </View>

          {lastWorkout ? (
            <>
              <Text style={styles.lastWorkoutName}>{lastWorkout.name}</Text>
              <View style={styles.lastWorkoutInfoRow}>
                <View style={styles.lastWorkoutInfoCard}>
                  <Text style={styles.lastWorkoutInfoLabel}>Dauer</Text>
                  <Text style={styles.lastWorkoutInfoValue}>
                    {formatWorkoutDuration(lastWorkout.duration)}
                  </Text>
                </View>

                <View style={styles.lastWorkoutInfoCard}>
                  <Text style={styles.lastWorkoutInfoLabel}>Status</Text>
                  <Text style={styles.lastWorkoutInfoValue}>Abgeschlossen</Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.lastWorkoutName}>
                Noch kein Workout gespeichert
              </Text>
              <Text style={styles.lastWorkoutEmptyText}>
                Sobald du ein Training beendest, erscheint es hier.
              </Text>
            </>
          )}
        </View>

        <View style={styles.trainingCard}>
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />

          <View style={styles.trainingTop}>
            <Text style={styles.trainingLabel}>HEUTIGES TRAINING</Text>

            {selectedTrainingLoading ? (
              <View style={styles.durationBadge}>
                <ActivityIndicator size="small" color={colors.white} />
              </View>
            ) : selectedTrainingPlan ? (
              <View style={styles.durationBadge}>
                <Text style={styles.durationIcon}>🗓</Text>
                <Text style={styles.durationText}>
                  {selectedTrainingPlan.training_plan.sessions_per_week}x pro
                  Woche
                </Text>
              </View>
            ) : null}
          </View>

          {selectedTrainingLoading ? (
            <>
              <Text style={styles.trainingMain}>Lade Trainingsplan...</Text>
              <View style={styles.trainingButtonWrap}>
                <SecondaryButton text="TRAINING STARTEN" />
              </View>
            </>
          ) : selectedTrainingPlan ? (
            <>
              <Text style={styles.trainingMain}>
                {selectedTrainingPlan.training_plan.name}
              </Text>
              <Text style={styles.trainingSubtext}>
                {selectedTrainingPlan.training_plan.description ||
                  `${selectedTrainingPlan.training_plan.sessions_per_week}x pro Woche`}
              </Text>

              <View style={styles.trainingButtonWrap}>
                <SecondaryButton
                  text="TRAINING STARTEN"
                  onPress={() => {
                    setWorkoutVisible(true);
                  }}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.trainingMain}>
                Keinen Trainingsplan ausgewählt
              </Text>

              <View style={styles.trainingButtonWrap}>
                <View style={styles.disabledButtonWrap}>
                  <SecondaryButton
                    text={
                      selectedTrainingMissing
                        ? "NICHT AUSGEWÄHLT"
                        : "TRAININGSPLAN AUSWÄHLEN"
                    }
                  />
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <WorkoutModal
        visible={workoutVisible}
        planId={selectedTrainingPlan?.training_plan.tpid ?? null}
        planName={selectedTrainingPlan?.training_plan.name ?? ""}
        onClose={() => {
          setWorkoutVisible(false);
          void loadLastWorkout();
          void loadTrainingStreak();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: spacing.screenPaddingTop,
    paddingBottom: spacing.xl,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  avatarIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: "#EEF2F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  greetingBlock: {
    flex: 1,
  },
  goodMorning: {
    ...typography.secondary,
    textAlign: "left",
    fontSize: 14,
    color: colors.textSecondary,
  },
  hello: {
    ...typography.greeting,
    textAlign: "left",
    fontSize: 28,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  streakTitle: {
    fontFamily: "Inter",
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    flex: 1,
  },
  streakRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  fire: {
    fontSize: 16,
  },
  streakActive: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "700",
    color: colors.accentOrange,
  },
  streakSubtext: {
    fontFamily: "Inter",
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  streakSquaresRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  streakSquare: {
    width: 38,
    height: 38,
    borderRadius: 8,
  },
  streakSquareOn: {
    backgroundColor: colors.primaryBlue,
  },
  streakSquareOff: {
    backgroundColor: "#D1D5DB59",
  },
  streakDaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  streakDayLabel: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "600",
    color: colors.borderGray,
    width: 38,
    textAlign: "center",
  },
  lastWorkoutHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  lastWorkoutTitle: {
    fontFamily: "Inter",
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    flex: 1,
  },
  lastWorkoutBadge: {
    backgroundColor: "#EEF4FF",
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  lastWorkoutBadgeText: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "700",
    color: colors.primaryBlue,
  },
  lastWorkoutName: {
    fontFamily: "Inter",
    fontSize: 24,
    fontWeight: "900",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  lastWorkoutInfoRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  lastWorkoutInfoCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  lastWorkoutInfoLabel: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  lastWorkoutInfoValue: {
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  lastWorkoutEmptyText: {
    fontFamily: "Inter",
    fontSize: 14,
    color: colors.textSecondary,
  },
  trainingCard: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 24,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    overflow: "hidden",
  },
  decoCircle1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    right: -80,
    top: -60,
    backgroundColor: "#FFFFFF14",
  },
  decoCircle2: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 999,
    right: 10,
    bottom: -60,
    backgroundColor: "#FFFFFF0F",
  },
  trainingTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  trainingLabel: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#FFFFFFB3",
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: "#FFFFFF29",
    minHeight: 38,
  },
  durationIcon: {
    fontSize: 14,
  },
  durationText: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "700",
    color: colors.white,
  },
  trainingMain: {
    fontFamily: "Inter",
    fontSize: 28,
    fontWeight: "900",
    color: colors.white,
    marginBottom: spacing.sm,
  },
  trainingSubtext: {
    fontFamily: "Inter",
    fontSize: 14,
    color: "#FFFFFFCC",
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  trainingButtonWrap: {
    marginTop: -spacing.xs,
  },
  disabledButtonWrap: {
    opacity: 0.6,
  },
});
