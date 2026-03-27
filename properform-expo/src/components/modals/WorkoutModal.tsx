import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "@/src/theme/colors";
import { typography } from "@/src/theme/typography";
import { spacing } from "@/src/theme/spacing";
import api from "@/src/utils/axiosInstance";

type PlanExerciseResponse = {
  id: number;
  eid: number;
  name?: string;
  reps?: number | null;
};

type SetData = {
  reps: string;
  isDone: boolean;
};

type ExerciseProgress = {
  id: number;
  eid: number;
  name: string;
  sets: SetData[];
};

type Props = {
  visible: boolean;
  planId: number | null;
  planName: string;
  onClose: () => void;
};

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export default function WorkoutModal({
  visible,
  planId,
  planName,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [workoutData, setWorkoutData] = useState<ExerciseProgress[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setSeconds(0);
    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  }, [stopTimer]);

  const resetWorkout = useCallback(() => {
    stopTimer();
    setWorkoutData([]);
    setSeconds(0);
    setIsFinished(false);
    setLoading(false);
  }, [stopTimer]);

  const loadExercises = useCallback(async () => {
    if (!planId) {
      return;
    }

    try {
      setLoading(true);

      const response = await api.get(`/training-plans/${planId}/exercises`);
      const exercises: PlanExerciseResponse[] = response.data.exercises ?? [];

      const initialData: ExerciseProgress[] = exercises.map(
        (exercise, index) => ({
          id: exercise.id ?? index,
          eid: exercise.eid,
          name: exercise.name || `Übung ${index + 1}`,
          sets: [
            { reps: exercise.reps ? String(exercise.reps) : "", isDone: false },
            { reps: exercise.reps ? String(exercise.reps) : "", isDone: false },
          ],
        }),
      );

      setWorkoutData(initialData);
    } catch {
      Alert.alert("Fehler", "Übungen konnten nicht geladen werden.");
      onClose();
    } finally {
      setLoading(false);
    }
  }, [onClose, planId]);

  useEffect(() => {
    if (!visible || !planId) {
      stopTimer();
      return;
    }

    setWorkoutData([]);
    setIsFinished(false);
    void loadExercises();
    startTimer();

    return () => stopTimer();
  }, [visible, planId, loadExercises, startTimer, stopTimer]);

  const handleClose = () => {
    resetWorkout();
    onClose();
  };

  const addSet = (exerciseIndex: number) => {
    const newSet = { reps: "", isDone: false };

    setWorkoutData((previousExercises) =>
      previousExercises.map((exercise, index) => {
        if (index !== exerciseIndex) {
          return exercise;
        }

        return {
          ...exercise,
          sets: [...exercise.sets, newSet],
        };
      }),
    );
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    setWorkoutData((previousExercises) =>
      previousExercises.map((exercise, index) => {
        if (index !== exerciseIndex) {
          return exercise;
        }

        if (exercise.sets.length <= 1) {
          return exercise;
        }

        const updatedSets = exercise.sets.filter(
          (_, currentSetIndex) => currentSetIndex !== setIndex,
        );

        return {
          ...exercise,
          sets: updatedSets,
        };
      }),
    );
  };

  const toggleSetDone = (exerciseIndex: number, setIndex: number) => {
    setWorkoutData((prev) =>
      prev.map((exercise, index) =>
        index === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.map((set, currentIndex) =>
                currentIndex === setIndex
                  ? { ...set, isDone: !set.isDone }
                  : set,
              ),
            }
          : exercise,
      ),
    );
  };

  const updateReps = (
    exerciseIndex: number,
    setIndex: number,
    value: string,
  ) => {
    setWorkoutData((previousExercises) =>
      previousExercises.map((exercise, index) => {
        if (index !== exerciseIndex) {
          return exercise;
        }

        const updatedSets = exercise.sets.map((set, currentSetIndex) => {
          if (currentSetIndex !== setIndex) {
            return set;
          }

          return {
            ...set,
            reps: value,
          };
        });

        return {
          ...exercise,
          sets: updatedSets,
        };
      }),
    );
  };

  const completedSets = workoutData.reduce(
    (sum, exercise) => sum + exercise.sets.filter((set) => set.isDone).length,
    0,
  );

  const totalSets = workoutData.reduce(
    (sum, exercise) => sum + exercise.sets.length,
    0,
  );

  const finishWorkout = async () => {
    try {
      await AsyncStorage.setItem(
        "last_workout",
        JSON.stringify({
          name: planName || "Workout",
          duration: seconds,
          date: new Date().toISOString(),
        }),
      );

      const streakResponse = await api.post("/users/streaks/update", {
        type: "training",
      });

      console.log("Streak update response", streakResponse.data);
    } catch (err: any) {
      console.log(
        "Streak update error",
        err.response?.status,
        err.response?.data,
        err.message,
      );
      Alert.alert(
        "Hinweis",
        err.response?.data?.message ||
          "Streak konnte nicht aktualisiert werden.",
      );
    } finally {
      stopTimer();
      setIsFinished(true);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={handleClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <SafeAreaView style={styles.container} edges={["bottom"]}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.iconButton} onPress={handleClose}>
                <Icon name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>

              <View style={styles.headerCenter}>
                <Text style={styles.headerTitle}>{planName || "Workout"}</Text>
                <Text style={styles.headerSubtitle}>
                  {completedSets}/{totalSets} Sets erledigt
                </Text>
              </View>

              {!isFinished ? (
                <View style={styles.timerBadge}>
                  <Icon name="timer" size={16} color={colors.primaryBlue} />
                  <Text style={styles.timerText}>{formatTime(seconds)}</Text>
                </View>
              ) : (
                <View style={styles.headerSpacer} />
              )}
            </View>

            {loading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.primaryBlue} />
              </View>
            ) : isFinished ? (
              <View style={styles.summary}>
                <View style={styles.summaryIcon}>
                  <Icon
                    name="emoji-events"
                    size={44}
                    color={colors.primaryBlue}
                  />
                </View>
                <Text style={styles.summaryTitle}>Workout abgeschlossen</Text>
                <Text style={styles.summaryText}>
                  Dauer: {formatTime(seconds)}
                </Text>
                <Text style={styles.summaryText}>
                  Sets: {completedSets}/{totalSets}
                </Text>

                <TouchableOpacity
                  style={styles.mainButton}
                  onPress={handleClose}
                >
                  <Text style={styles.mainButtonText}>Training schliessen</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <ScrollView
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {workoutData.map((exercise, exerciseIndex) => (
                    <View key={exercise.id} style={styles.exerciseCard}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>

                      {exercise.sets.map((set, setIndex) => (
                        <View
                          key={`${exercise.id}-${setIndex}`}
                          style={styles.setRow}
                        >
                          <Text style={styles.setLabel}>
                            Satz {setIndex + 1}
                          </Text>

                          <TextInput
                            style={styles.repsInput}
                            placeholder="Wdh."
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="numeric"
                            value={set.reps}
                            onChangeText={(value) =>
                              updateReps(exerciseIndex, setIndex, value)
                            }
                          />

                          <TouchableOpacity
                            style={styles.smallIconButton}
                            onPress={() => removeSet(exerciseIndex, setIndex)}
                          >
                            <Icon
                              name="remove"
                              size={18}
                              color={colors.textSecondary}
                            />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.checkCircle,
                              set.isDone && styles.checkCircleActive,
                            ]}
                            onPress={() =>
                              toggleSetDone(exerciseIndex, setIndex)
                            }
                          >
                            <Icon
                              name="check"
                              size={18}
                              color={
                                set.isDone ? colors.white : colors.textSecondary
                              }
                            />
                          </TouchableOpacity>
                        </View>
                      ))}

                      <TouchableOpacity
                        style={styles.addSetButton}
                        onPress={() => addSet(exerciseIndex)}
                      >
                        <Icon name="add" size={18} color={colors.primaryBlue} />
                        <Text style={styles.addSetText}>Satz hinzufügen</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  {workoutData.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>
                        Dieser Trainingsplan hat noch keine Übungen.
                      </Text>
                    </View>
                  ) : null}
                </ScrollView>

                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[
                      styles.mainButton,
                      workoutData.length === 0 && styles.mainButtonDisabled,
                    ]}
                    onPress={finishWorkout}
                    disabled={workoutData.length === 0}
                  >
                    <Text style={styles.mainButtonText}>Workout beenden</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "80%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
    alignSelf: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screenPaddingHorizontal,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  iconButton: {
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
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    ...typography.body,
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  headerSubtitle: {
    ...typography.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  timerBadge: {
    minWidth: 78,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  timerText: {
    ...typography.body,
    fontSize: 14,
    color: colors.primaryBlue,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 78,
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  exerciseCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  exerciseName: {
    ...typography.body,
    textAlign: "left",
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  setLabel: {
    ...typography.body,
    textAlign: "left",
    width: 56,
    fontSize: 14,
    color: colors.textSecondary,
  },
  repsInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    ...typography.body,
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: "center",
  },
  smallIconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.borderLight,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircleActive: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  addSetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
  },
  addSetText: {
    ...typography.body,
    fontSize: 14,
    color: colors.primaryBlue,
  },
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  emptyStateText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  summary: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.screenPaddingHorizontal,
  },
  summaryIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#F0F4FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  summaryTitle: {
    ...typography.title,
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  summaryText: {
    ...typography.body,
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  mainButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  mainButtonDisabled: {
    opacity: 0.5,
  },
  mainButtonText: {
    ...typography.body,
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
