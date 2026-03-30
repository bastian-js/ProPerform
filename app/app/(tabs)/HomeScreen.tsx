import WorkoutModal from "@/src/components/modals/WorkoutModal";
import SecondaryButton from "@/src/components/secondaryButton";
import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import api from "@/src/utils/axiosInstance";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

const getMondayBasedDayIndex = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDay();

  return day === 0 ? 6 : day - 1;
};

const getLocalDayKey = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
};

const getLocalDayKeyFromDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const buildUniqueLogDayKeys = (logs: { activity_date: string }[]) =>
  [...logs]
    .sort(
      (left, right) =>
        new Date(right.activity_date).getTime() -
        new Date(left.activity_date).getTime(),
    )
    .map((log) => getLocalDayKey(log.activity_date))
    .filter(
      (dayKey, index, allDayKeys) => allDayKeys.indexOf(dayKey) === index,
    );

const buildCompletedDaysFromLogs = (
  logs: { activity_date: string }[],
  currentStreak: number,
) => {
  const completedDays = Array(7).fill(false);
  const uniqueLogDayKeys = buildUniqueLogDayKeys(logs).slice(
    0,
    Math.max(0, currentStreak),
  );

  for (const dayKey of uniqueLogDayKeys) {
    const dayIndex = getMondayBasedDayIndex(dayKey);
    completedDays[dayIndex] = true;
  }

  return completedDays;
};

const buildCalendarDaysForMonth = (monthDate: Date) => {
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const daysInMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0,
  ).getDate();
  const firstDayIndex = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1;
  const days = [];
  const today = new Date();

  for (let index = 0; index < firstDayIndex; index += 1) {
    days.push({
      key: `empty-${index}`,
      label: "",
      dateKey: null,
      isToday: false,
    });
  }

  for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
    const date = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth(),
      dayNumber,
    );
    const dateKey = getLocalDayKeyFromDate(date);
    const isToday =
      dayNumber === today.getDate() &&
      monthDate.getMonth() === today.getMonth() &&
      monthDate.getFullYear() === today.getFullYear();

    days.push({
      key: dateKey,
      label: String(dayNumber),
      dateKey,
      isToday,
    });
  }

  while (days.length % 7 !== 0) {
    days.push({
      key: `tail-empty-${days.length}`,
      label: "",
      dateKey: null,
      isToday: false,
    });
  }

  return {
    monthLabel: monthDate.toLocaleDateString("de-AT", {
      month: "long",
      year: "numeric",
    }),
    days,
  };
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
  const tabBarHeight = useBottomTabBarHeight();
  const { width, height: screenHeight } = useWindowDimensions();
  const isCompact = width < 380 || screenHeight < 750;
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
  const [streakLogDayKeys, setStreakLogDayKeys] = useState<string[]>([]);
  const [lastWorkout, setLastWorkout] = useState<LastWorkout | null>(null);
  const [selectedTrainingPlan, setSelectedTrainingPlan] =
    useState<SelectedTrainingPlan | null>(null);
  const [selectedTrainingLoading, setSelectedTrainingLoading] = useState(true);
  const [selectedTrainingMissing, setSelectedTrainingMissing] = useState(false);
  const [workoutVisible, setWorkoutVisible] = useState(false);
  const [streakCalendarVisible, setStreakCalendarVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

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

      const response = await api.get("/users/streaks/training");
      const responseData = response.data ?? {};
      const streak = responseData.streak ?? {};
      const logs = Array.isArray(responseData.logs) ? responseData.logs : [];
      const currentStreak = streak.current_streak ?? 0;
      const longest = streak.longest_streak ?? 0;
      const lastActivity = streak.last_activity_date ?? null;

      setStreakDays(currentStreak);
      setLongestStreak(longest);
      setLastActivityDate(lastActivity);
      setStreakLogDayKeys(buildUniqueLogDayKeys(logs));

      const nextCompleted = logs.length
        ? buildCompletedDaysFromLogs(logs, currentStreak)
        : Array(7).fill(false);

      setCompleted(nextCompleted);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        return;
      }
      setStreakDays(0);
      setLongestStreak(0);
      setLastActivityDate(null);
      setStreakLogDayKeys([]);
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
  const calendarWeekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const { monthLabel, days: currentMonthDays } =
    buildCalendarDaysForMonth(calendarMonth);
  const streakLogDayKeySet = new Set(streakLogDayKeys);

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
        contentContainerStyle={[
          styles.scrollContent,
          isCompact ? styles.scrollContentCompact : null,
          { paddingBottom: tabBarHeight + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.topRow, isCompact ? styles.topRowCompact : null]}>
          <View
            style={[
              styles.avatarIconWrap,
              isCompact ? styles.avatarIconWrapCompact : null,
            ]}
          >
            <Icon name="person" size={28} color={colors.primaryBlue} />
          </View>

          <View style={styles.greetingBlock}>
            <Text style={styles.goodMorning}>{greeting}</Text>
            <Text
              style={[styles.hello, isCompact ? styles.helloCompact : null]}
            >
              {user?.firstname || "..."}
            </Text>
          </View>
        </View>

        <View style={[styles.card, isCompact ? styles.cardCompact : null]}>
          <View style={styles.streakHeader}>
            <Text style={styles.streakTitle}>Trainings-Streak</Text>

            {streakDays > 0 && !streakLoading ? (
              <View style={styles.streakRight}>
                <Text style={styles.fire}>🔥</Text>
                <Text style={styles.streakActive}>
                  {streakLoading
                    ? "Lädt..."
                    : `${getStreakLabel(streakDays)} · Bestwert ${longestStreak}`}
                </Text>
              </View>
            ) : null}
          </View>

          {lastActivityDate ? (
            <Text style={styles.streakSubtext}>
              Letzte Aktivität:{" "}
              {new Date(lastActivityDate).toLocaleDateString("de-AT", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
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

          <TouchableOpacity
            style={styles.streakCalendarButton}
            onPress={() => {
              const now = new Date();
              setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
              setStreakCalendarVisible(true);
            }}
          >
            <Text style={styles.streakCalendarButtonText}>Monat ansehen</Text>
            <Icon name="calendar-month" size={18} color={colors.primaryBlue} />
          </TouchableOpacity>
        </View>

        <View style={[styles.card, isCompact ? styles.cardCompact : null]}>
          <View style={styles.lastWorkoutHeader}>
            <Text style={styles.lastWorkoutTitle}>Letztes Workout</Text>
            {lastWorkout ? (
              <View style={styles.lastWorkoutBadge}>
                <Text style={styles.lastWorkoutBadgeText}>
                  {new Date(lastWorkout.date).toLocaleDateString("de-AT", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </Text>
              </View>
            ) : null}
          </View>

          {lastWorkout ? (
            <>
              <Text
                style={[
                  styles.lastWorkoutName,
                  isCompact ? styles.lastWorkoutNameCompact : null,
                ]}
              >
                {lastWorkout.name}
              </Text>
              <View style={styles.lastWorkoutInfoRow}>
                <View style={styles.lastWorkoutInfoCard}>
                  <Text style={styles.lastWorkoutInfoLabel}>Dauer</Text>
                  <Text style={styles.lastWorkoutInfoValue}>
                    {formatWorkoutDuration(lastWorkout.duration)}
                  </Text>
                </View>

                <View style={styles.lastWorkoutInfoCard}>
                  <Text style={styles.lastWorkoutInfoLabel}>Status</Text>
                  <Icon
                    name="check-circle"
                    size={16}
                    color={colors.primaryBlue}
                  />
                </View>
              </View>
            </>
          ) : (
            <>
              <Text
                style={[
                  styles.lastWorkoutName,
                  isCompact ? styles.lastWorkoutNameCompact : null,
                ]}
              >
                Noch kein Workout gespeichert
              </Text>
              <Text style={styles.lastWorkoutEmptyText}>
                Sobald du ein Training beendest, erscheint es hier.
              </Text>
            </>
          )}
        </View>

        <View
          style={[
            styles.trainingCard,
            isCompact ? styles.trainingCardCompact : null,
          ]}
        >
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />

          <View
            style={[
              styles.trainingTop,
              isCompact ? styles.trainingTopCompact : null,
            ]}
          >
            <Text style={styles.trainingLabel}>HEUTIGES TRAINING</Text>

            {selectedTrainingLoading ? (
              <View style={styles.durationBadge}>
                <ActivityIndicator size="small" color={colors.white} />
              </View>
            ) : selectedTrainingPlan ? (
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>
                  {selectedTrainingPlan.training_plan.sessions_per_week}x pro
                  Woche
                </Text>
              </View>
            ) : null}
          </View>

          {selectedTrainingLoading ? (
            <>
              <Text
                style={[
                  styles.trainingMain,
                  isCompact ? styles.trainingMainCompact : null,
                ]}
              >
                Lade Trainingsplan...
              </Text>
              <View style={styles.trainingButtonWrap}>
                <SecondaryButton text="TRAINING STARTEN" disabled />
              </View>
            </>
          ) : selectedTrainingPlan ? (
            <>
              <Text
                style={[
                  styles.trainingMain,
                  isCompact ? styles.trainingMainCompact : null,
                ]}
              >
                {selectedTrainingPlan.training_plan.name}
              </Text>
              <Text
                style={[
                  styles.trainingSubtext,
                  isCompact ? styles.trainingSubtextCompact : null,
                ]}
              >
                {selectedTrainingPlan.training_plan.description ||
                  `${selectedTrainingPlan.training_plan.sessions_per_week}x/Woche`}
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
              <Text
                style={[
                  styles.trainingMain,
                  isCompact ? styles.trainingMainCompact : null,
                ]}
              >
                Keinen Trainingsplan ausgewählt
              </Text>

              <View style={styles.trainingButtonWrap}>
                <View style={styles.disabledButtonWrap} pointerEvents="none">
                  <SecondaryButton
                    text={
                      selectedTrainingMissing
                        ? "NICHT AUSGEWÄHLT"
                        : "TRAININGSPLAN AUSWÄHLEN"
                    }
                    disabled
                  />
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Kalender Modal für Streak-Ansicht */}
      <Modal
        visible={streakCalendarVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setStreakCalendarVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setStreakCalendarVisible(false)}
          />

          <View style={styles.modalSheet}>
            <SafeAreaView style={styles.modalContainer} edges={["bottom"]}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderCenter}>
                  <Text style={styles.modalTitle}>Trainingskalender</Text>
                  <View style={styles.modalMonthRow}>
                    <TouchableOpacity
                      style={styles.modalMonthNavButton}
                      onPress={() =>
                        setCalendarMonth(
                          (previousMonth) =>
                            new Date(
                              previousMonth.getFullYear(),
                              previousMonth.getMonth() - 1,
                              1,
                            ),
                        )
                      }
                    >
                      <Icon
                        name="chevron-left"
                        size={20}
                        color={colors.primaryBlue}
                      />
                    </TouchableOpacity>

                    <Text style={styles.modalSubtitle}>{monthLabel}</Text>

                    <TouchableOpacity
                      style={styles.modalMonthNavButton}
                      onPress={() =>
                        setCalendarMonth(
                          (previousMonth) =>
                            new Date(
                              previousMonth.getFullYear(),
                              previousMonth.getMonth() + 1,
                              1,
                            ),
                        )
                      }
                    >
                      <Icon
                        name="chevron-right"
                        size={20}
                        color={colors.primaryBlue}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setStreakCalendarVisible(false)}
                >
                  <Icon name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <View style={styles.calendarCard}>
                <View style={styles.calendarWeekdaysRow}>
                  {calendarWeekdays.map((dayLabel) => (
                    <Text key={dayLabel} style={styles.calendarWeekday}>
                      {dayLabel}
                    </Text>
                  ))}
                </View>

                <View style={styles.calendarGrid}>
                  {currentMonthDays.map((day) => {
                    const isMarked =
                      day.dateKey !== null &&
                      streakLogDayKeySet.has(day.dateKey);

                    return (
                      <View
                        key={day.key}
                        style={[
                          styles.calendarDay,
                          !day.dateKey && styles.calendarDayEmpty,
                        ]}
                      >
                        <View
                          style={[
                            styles.calendarDayInner,
                            isMarked && styles.calendarDayInnerMarked,
                            day.isToday &&
                              !isMarked &&
                              styles.calendarDayInnerToday,
                          ]}
                        >
                          <Text
                            style={[
                              styles.calendarDayText,
                              !day.dateKey && styles.calendarDayTextEmpty,
                              isMarked && styles.calendarDayTextMarked,
                              day.isToday &&
                                !isMarked &&
                                styles.calendarDayTextToday,
                            ]}
                          >
                            {day.label}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </SafeAreaView>
          </View>
        </View>
      </Modal>
      {/* Kalender Modal Ende */}

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
  },
  scrollContentCompact: {
    paddingTop: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  topRowCompact: {
    marginBottom: spacing.md,
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
  avatarIconWrapCompact: {
    width: 42,
    height: 42,
    marginRight: spacing.sm,
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
  helloCompact: {
    fontSize: 24,
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
  cardCompact: {
    padding: spacing.sm,
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
  streakCalendarButton: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: "#EEF4FF",
  },
  streakCalendarButtonText: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "700",
    color: colors.primaryBlue,
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
  lastWorkoutNameCompact: {
    fontSize: 20,
    marginBottom: spacing.sm,
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
  trainingCardCompact: {
    padding: spacing.sm,
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
  trainingTopCompact: {
    marginBottom: spacing.sm,
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
    fontSize: 12,
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
  trainingMainCompact: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  trainingSubtext: {
    fontFamily: "Inter",
    fontSize: 16,
    color: "#FFFFFFCC",
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  trainingSubtextCompact: {
    fontSize: 13,
    marginTop: 0,
    lineHeight: 18,
  },
  trainingButtonWrap: {
    marginTop: -spacing.xs,
  },
  disabledButtonWrap: {
    opacity: 0.6,
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
  modalHeaderCenter: {
    flex: 1,
    alignItems: "center",
    marginLeft: 42,
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
    textTransform: "capitalize",
  },
  modalMonthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: 4,
  },
  modalMonthNavButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
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
  calendarCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  calendarWeekdaysRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  calendarWeekday: {
    flex: 1,
    textAlign: "center",
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDay: {
    width: "14.285%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarDayEmpty: {
    backgroundColor: "transparent",
  },
  calendarDayInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarDayInnerMarked: {
    backgroundColor: colors.primaryBlue,
  },
  calendarDayInnerToday: {
    borderWidth: 1.5,
    borderColor: colors.primaryBlue,
    backgroundColor: "#EEF4FF",
  },
  calendarDayText: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  calendarDayTextEmpty: {
    color: "transparent",
  },
  calendarDayTextMarked: {
    color: colors.white,
  },
  calendarDayTextToday: {
    color: colors.primaryBlue,
  },
});
