import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import api from "@/src/utils/axiosInstance";

type Exercise = {
  eid: number;
  name: string;
  sport: string;
  dlid: number;
  thumbnail_url?: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onPlanCreated: () => void;
};

type UserTrainingPlan = {
  id: number;
  tpid: number;
  status: string;
};

const SPORTS = [
  { id: 1, label: "Gym", value: "gym" },
  { id: 2, label: "Basketball", value: "basketball" },
];

const formatDate = (date: Date) => date.toISOString().split("T")[0];

export default function CreatePlanModal({
  visible,
  onClose,
  onPlanCreated,
}: Props) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [createdPlanId, setCreatedPlanId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sportId, setSportId] = useState(1);
  const [sessionsPerWeek, setSessionsPerWeek] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedEids, setSelectedEids] = useState<number[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [activeFilter, setActiveFilter] = useState("gym");

  useEffect(() => {
    if (visible) {
      setStep(1);
      setName("");
      setDescription("");
      setSportId(1);
      setSessionsPerWeek("");
      setShowDatePicker(false);
      setTempStartDate(new Date());
      setStartDate(null);
      setSelectedEids([]);
      setCreatedPlanId(null);
    }
  }, [visible]);

  useEffect(() => {
    if (step === 2) {
      fetchExercises(activeFilter);
    }
  }, [step, activeFilter]);

  const fetchExercises = async (filter: string) => {
    try {
      setLoadingExercises(true);
      const response = await api.get("/exercises", {
        params: { limit: 100, filter },
      });
      setExercises(response.data.exercises);
    } catch {
      Alert.alert("Fehler", "Übungen konnten nicht geladen werden.");
    } finally {
      setLoadingExercises(false);
    }
  };

  const onStartDateChange = (_: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      if (selectedDate) {
        setTempStartDate(selectedDate);
        setStartDate(selectedDate);
      }
      setShowDatePicker(false);
      return;
    }

    if (selectedDate) {
      setTempStartDate(selectedDate);
    }
  };

  const confirmIOSStartDate = () => {
    setStartDate(tempStartDate);
    setShowDatePicker(false);
  };

  const handleNextStep = async () => {
    if (!name.trim()) {
      Alert.alert("Fehler", "Bitte gib einen Namen ein.");
      return;
    }
    if (!sessionsPerWeek) {
      Alert.alert("Fehler", "Bitte fülle alle Felder aus.");
      return;
    }
    if (!startDate) {
      Alert.alert("Fehler", "Bitte wähle ein Startdatum aus.");
      return;
    }

    try {
      setSaving(true);
      const response = await api.post("/training-plans", {
        name: name.trim(),
        description: description.trim(),
        sportId,
        difficultyLevelId: 1,
        durationWeeks: 1,
        sessionsPerWeek: parseInt(sessionsPerWeek),
      });
      setCreatedPlanId(response.data.planId);
      setStep(2);
    } catch (err: any) {
      Alert.alert(
        "Fehler",
        err.response?.data?.message || "Plan konnte nicht erstellt werden.",
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

  const handleSavePlan = async () => {
    if (!createdPlanId) return;
    if (!startDate) {
      Alert.alert("Fehler", "Bitte wähle ein Startdatum aus.");
      return;
    }
    if (selectedEids.length === 0) {
      Alert.alert("Fehler", "Bitte wähle mindestens eine Übung aus.");
      return;
    }

    try {
      setSaving(true);
      console.log("1: starte exercise save");
      await Promise.all(
        selectedEids.map((eid, index) =>
          api.post(`/training-plans/${createdPlanId}/exercises`, {
            eid,
            weekNumber: 1,
            dayNumber: 1,
            exerciseOrder: index + 1,
          }),
        ),
      );
      console.log("2: exercises gespeichert");

      const assignResponse = await api.post("/users/training-plans", {
        tpid: createdPlanId,
        startDate: formatDate(startDate),
      });

      console.log("3: assign fertig", assignResponse.data);
      console.log("Assign Response", assignResponse.data);

      const userPlansResponse = await api.get("/users/training-plans");

      const assignedPlan = userPlansResponse.data.plans?.find(
        (plan: UserTrainingPlan) => plan.tpid === createdPlanId,
      );

      const userTrainingPlanId = assignedPlan?.id;

      if (!userTrainingPlanId) {
        console.log("User training plans response", userPlansResponse.data);
        return;
      }

      console.log("User training plan id", userTrainingPlanId);

      onPlanCreated();
      onClose();
    } catch (err: any) {
      Alert.alert(
        "Fehler",
        err.response?.data?.message ||
          "Plan konnte nicht vollständig gespeichert werden.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>
              {step === 1 ? "Neuer Trainingsplan" : "Übungen auswählen"}
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

              <Text style={styles.label}>Sport *</Text>
              <View style={styles.chipRow}>
                {SPORTS.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.chip, sportId === s.id && styles.chipActive]}
                    onPress={() => setSportId(s.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        sportId === s.id && styles.chipTextActive,
                      ]}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Sessions pro Woche *</Text>
              <TextInput
                style={styles.input}
                placeholder="z.B. 4"
                placeholderTextColor={colors.textSecondary}
                value={sessionsPerWeek}
                onChangeText={setSessionsPerWeek}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Startdatum *</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    color: startDate
                      ? colors.textPrimary
                      : colors.textSecondary,
                  }}
                >
                  {startDate ? formatDate(startDate) : "YYYY-MM-DD"}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={tempStartDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onStartDateChange}
                    locale="de-DE"
                    themeVariant="light"
                  />
                  {Platform.OS === "ios" && (
                    <TouchableOpacity
                      style={styles.datePickerConfirmButton}
                      onPress={confirmIOSStartDate}
                    >
                      <Text style={styles.datePickerConfirmText}>Fertig</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

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
              <View style={styles.filterRow}>
                {SPORTS.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.chip,
                      activeFilter === s.value && styles.chipActive,
                    ]}
                    onPress={() => setActiveFilter(s.value)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        activeFilter === s.value && styles.chipTextActive,
                      ]}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
                <Text style={styles.selectedCount}>
                  {selectedEids.length} ausgewählt
                </Text>
              </View>

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
                  {exercises.map((ex) => {
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
                onPress={handleSavePlan}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.buttonText}>Plan speichern</Text>
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
  datePickerContainer: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: spacing.sm,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  datePickerConfirmButton: {
    alignSelf: "flex-end",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  datePickerConfirmText: {
    ...typography.body,
    color: colors.primaryBlue,
    fontWeight: "600",
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
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  selectedCount: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: "auto",
  },
  loader: {
    marginTop: spacing.xl,
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
  stepTwoContainer: {
    flex: 1,
  },
  stepTwoScroll: {
    flex: 1,
  },
});
