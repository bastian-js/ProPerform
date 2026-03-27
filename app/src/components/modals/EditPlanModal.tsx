import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { colors } from "@/src/theme/colors";
import { typography } from "@/src/theme/typography";
import { spacing } from "@/src/theme/spacing";
import api from "@/src/utils/axiosInstance";

type TrainingPlan = {
  tpid: number;
  name: string;
  description: string;
  sport: string;
  difficulty: string;
  duration_weeks: number;
  sessions_per_week: number;
};

type Exercise = {
  eid: number;
  name: string;
};

type PlanExercise = {
  id: number;
  eid: number;
};

type Props = {
  visible: boolean;
  plan: TrainingPlan | null;
  onClose: () => void;
  onPlanUpdated: () => void;
};

export default function EditPlanModal({
  visible,
  plan,
  onClose,
  onPlanUpdated,
}: Props) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sessionsPerWeek, setSessionsPerWeek] = useState("");

  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [planExercises, setPlanExercises] = useState<PlanExercise[]>([]);
  const [selectedEids, setSelectedEids] = useState<number[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);

  useEffect(() => {
    if (visible && plan) {
      setStep(1);
      setName(plan.name);
      setDescription(plan.description ?? "");
      setSessionsPerWeek(
        plan.sessions_per_week ? String(plan.sessions_per_week) : "",
      );
      setSelectedEids([]);
    }
  }, [visible, plan]);

  useEffect(() => {
    if (step === 2 && plan) {
      loadExercises();
    }
  }, [step]);

  const loadExercises = async () => {
    if (!plan) return;
    try {
      setLoadingExercises(true);

      const [allExRes, planExRes] = await Promise.all([
        api.get("/exercises", {
          params: { limit: 100, filter: plan.sport },
        }),
        api.get(`/training-plans/${plan.tpid}/exercises`),
      ]);

      const all: Exercise[] = allExRes.data.exercises;
      const assigned: PlanExercise[] = planExRes.data.exercises ?? [];

      setAllExercises(all);
      setPlanExercises(assigned);

      setSelectedEids(assigned.map((ex) => ex.eid));
    } catch {
      Alert.alert("Fehler", "Übungen konnten nicht geladen werden.");
    } finally {
      setLoadingExercises(false);
    }
  };

  const handleNextStep = async () => {
    if (!name.trim()) {
      Alert.alert("Fehler", "Bitte gib einen Namen ein.");
      return;
    }
    if (!plan) return;

    try {
      setSaving(true);
      await api.put(`/training-plans/${plan.tpid}`, {
        name: name.trim(),
        description: description.trim(),
        sportId: plan.sport === "gym" ? 1 : 2, // Sport bleibt fix, wenn user ändern will dann löschen und neu anlegen
        difficultyLevelId: 1, // hier fix weil user nicht eingeben
        durationWeeks: 1, // hier fix will user nicht eingeben
        sessionsPerWeek: sessionsPerWeek ? parseInt(sessionsPerWeek) : 1,
      });
      setStep(2);
    } catch (err: any) {
      Alert.alert(
        "Fehler",
        err.response?.data?.message || "Plan konnte nicht gespeichert werden.",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleExercise = (eid: number) => {
    setSelectedEids((prev) =>
      prev.includes(eid) ? prev.filter((id) => id !== eid) : [...prev, eid],
    );
  };

  const handleSaveExercises = async () => {
    if (!plan) return;

    try {
      setSaving(true);

      const toRemove = planExercises.filter(
        (ex) => !selectedEids.includes(ex.eid),
      );

      const existingEids = planExercises.map((ex) => ex.eid);
      const toAdd = selectedEids.filter((eid) => !existingEids.includes(eid));

      await Promise.all([
        ...toRemove.map((ex) =>
          api.delete(`/training-plans/${plan.tpid}/exercises/${ex.id}`),
        ),
        ...toAdd.map((eid, index) =>
          api.post(`/training-plans/${plan.tpid}/exercises`, {
            eid,
            weekNumber: 1,
            dayNumber: 1,
            exerciseOrder: planExercises.length + index + 1,
          }),
        ),
      ]);

      onPlanUpdated();
      onClose();
    } catch (err: any) {
      Alert.alert(
        "Fehler",
        err.response?.data?.message ||
          "Übungen konnten nicht gespeichert werden.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>
              {step === 1 ? "Plan bearbeiten" : "Übungen bearbeiten"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {step === 1 && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
            >
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="z.B. Push Day Workout"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Beschreibung</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Kurze Beschreibung..."
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Sport</Text>
              <View style={styles.sportFixed}>
                <Icon
                  name={
                    plan?.sport === "gym"
                      ? "fitness-center"
                      : "sports-basketball"
                  }
                  size={16}
                  color={colors.primaryBlue}
                />
                <Text style={styles.sportFixedText}>
                  {plan?.sport === "gym" ? "Gym" : "Basketball"}
                </Text>
                <Icon name="lock" size={14} color={colors.textSecondary} />
              </View>

              <Text style={styles.label}>Sessions pro Woche</Text>
              <TextInput
                style={styles.input}
                placeholder="z.B. 4"
                placeholderTextColor={colors.textSecondary}
                value={sessionsPerWeek}
                onChangeText={setSessionsPerWeek}
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={[styles.button, saving && styles.buttonDisabled]}
                onPress={handleNextStep}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Weiter</Text>
                    <Icon name="arrow-forward" size={20} color={colors.white} />
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}

          {step === 2 && (
            <View style={styles.stepTwoContainer}>
              <View style={styles.sportInfo}>
                <Icon
                  name="info-outline"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.sportInfoText}>
                  Nur {plan?.sport === "gym" ? "Gym" : "Basketball"} Übungen
                </Text>
              </View>

              <Text style={styles.selectedCount}>
                {selectedEids.length} ausgewählt
              </Text>

              {loadingExercises ? (
                <ActivityIndicator
                  size="large"
                  color={colors.primaryBlue}
                  style={styles.loader}
                />
              ) : (
                <ScrollView
                  style={styles.stepTwoScroll}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.exerciseList}
                >
                  {allExercises.map((ex) => {
                    const selected = selectedEids.includes(ex.eid);
                    return (
                      <TouchableOpacity
                        key={ex.eid}
                        style={[
                          styles.exerciseRow,
                          selected && styles.exerciseRowSelected,
                        ]}
                        onPress={() => toggleExercise(ex.eid)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.exerciseIcon}>
                          <Icon
                            name="fitness-center"
                            size={18}
                            color={selected ? colors.white : colors.primaryBlue}
                          />
                        </View>
                        <Text
                          style={[
                            styles.exerciseName,
                            selected && styles.exerciseNameSelected,
                          ]}
                        >
                          {ex.name}
                        </Text>
                        {selected && (
                          <Icon
                            name="check-circle"
                            size={22}
                            color={colors.white}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonBottom,
                  saving && styles.buttonDisabled,
                ]}
                onPress={handleSaveExercises}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.buttonText}>Speichern</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
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
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingBottom: spacing.xl,
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
    fontSize: 20,
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: 4,
    fontSize: 14,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: 16,
    ...typography.body,
    fontSize: 16,
    color: colors.textPrimary,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  textArea: {
    height: 90,
    textAlignVertical: "top",
  },
  sportFixed: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sportFixedText: {
    ...typography.body,
    flex: 1,
    fontSize: 16,
    color: colors.textSecondary,
  },
  chipRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  chipActive: {
    backgroundColor: colors.primaryBlue,
  },
  chipText: {
    ...typography.body,
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: "600",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryBlue,
    borderRadius: 999,
    paddingVertical: 18,
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  buttonBottom: {
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "600",
    fontSize: 17,
  },
  stepTwoContainer: {
    flex: 1,
  },
  sportInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  sportInfoText: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  selectedCount: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  loader: {
    marginTop: spacing.xl,
  },
  stepTwoScroll: {
    flex: 1,
  },
  exerciseList: {
    gap: spacing.xs,
    paddingBottom: spacing.lg,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  exerciseRowSelected: {
    backgroundColor: colors.primaryBlue,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F0F4FF",
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseName: {
    ...typography.body,
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  exerciseNameSelected: {
    color: colors.white,
  },
});
