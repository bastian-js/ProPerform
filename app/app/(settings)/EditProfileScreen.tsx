import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import api from "@/src/utils/axiosInstance";
import { parseDecimal } from "@/src/utils/number";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FitnessLevel = "beginner" | "intermediate" | "advanced";
type PrimaryGoal = "build muscle" | "lose weight" | "stay at weight";
type TrainingFrequency = 2 | 4 | 7;

type ProfileResponse = {
  weight: number | string | null;
  height: number | string | null;
  fitness_level: FitnessLevel | null;
  training_frequency: number | string | null;
  primary_goal: string | null;
};

type FormErrors = {
  weight: string;
  height: string;
  fitnessLevel: string;
  trainingFrequency: string;
  primaryGoal: string;
};

const FITNESS_LEVEL_OPTIONS: { label: string; value: FitnessLevel }[] = [
  { label: "Anfänger", value: "beginner" },
  { label: "Fortgeschritten", value: "intermediate" },
  { label: "Experte", value: "advanced" },
];

const TRAINING_FREQUENCY_OPTIONS: {
  label: string;
  value: TrainingFrequency;
}[] = [
  { label: "1-2x pro Woche", value: 2 },
  { label: "3-4x pro Woche", value: 4 },
  { label: "5+ pro Woche", value: 7 },
];

const PRIMARY_GOAL_OPTIONS: { label: string; value: PrimaryGoal }[] = [
  { label: "Muskelaufbau", value: "build muscle" },
  { label: "Abnehmen", value: "lose weight" },
  { label: "Gewicht halten", value: "stay at weight" },
];

const INITIAL_ERRORS: FormErrors = {
  weight: "",
  height: "",
  fitnessLevel: "",
  trainingFrequency: "",
  primaryGoal: "",
};

const toPositiveNumberOrNull = (value: unknown): number | null => {
  if (value == null) return null;

  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  if (typeof value === "string") {
    const parsed = parseDecimal(value);
    return parsed ?? null;
  }

  return null;
};

const hasNumericChange = (
  nextValue: number,
  initialValue: number | null,
  epsilon = 0.000001,
) => {
  if (initialValue === null) return true;
  return Math.abs(nextValue - initialValue) > epsilon;
};

export default function EditProfileScreen() {
  const router = useRouter();
  const { width, height: screenHeight } = useWindowDimensions();
  const isCompact = width < 380 || screenHeight < 750;
  const weightInputRef = React.useRef<TextInput>(null);
  const heightInputRef = React.useRef<TextInput>(null);

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [weight, setWeight] = React.useState("");
  const [height, setHeight] = React.useState("");
  const [fitnessLevel, setFitnessLevel] = React.useState<FitnessLevel | null>(
    null,
  );
  const [trainingFrequency, setTrainingFrequency] =
    React.useState<TrainingFrequency | null>(null);
  const [primaryGoal, setPrimaryGoal] = React.useState<PrimaryGoal | null>(
    null,
  );
  const [errors, setErrors] = React.useState<FormErrors>(INITIAL_ERRORS);
  const [focusedInput, setFocusedInput] = React.useState<
    "weight" | "height" | null
  >(null);
  const [initialProfile, setInitialProfile] = React.useState<{
    weight: number | null;
    height: number | null;
    fitness_level: FitnessLevel | null;
    training_frequency: TrainingFrequency | null;
    primary_goal: PrimaryGoal | null;
  } | null>(null);

  const loadProfile = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<ProfileResponse>("/users/me");
      const data = response.data;

      const normalizedWeight = toPositiveNumberOrNull(data.weight);
      const normalizedHeight = toPositiveNumberOrNull(data.height);
      const rawTrainingFrequency =
        typeof data.training_frequency === "string"
          ? Number(data.training_frequency)
          : data.training_frequency;

      const normalizedTrainingFrequency =
        rawTrainingFrequency === 2 ||
        rawTrainingFrequency === 4 ||
        rawTrainingFrequency === 7
          ? rawTrainingFrequency
          : null;

      const normalizedPrimaryGoal =
        data.primary_goal === "build muscle" ||
        data.primary_goal === "lose weight" ||
        data.primary_goal === "stay at weight"
          ? data.primary_goal
          : null;

      setWeight(normalizedWeight != null ? String(normalizedWeight) : "");
      setHeight(normalizedHeight != null ? String(normalizedHeight) : "");
      setFitnessLevel(data.fitness_level ?? null);
      setTrainingFrequency(normalizedTrainingFrequency);
      setPrimaryGoal(normalizedPrimaryGoal);
      setInitialProfile({
        weight: normalizedWeight,
        height: normalizedHeight,
        fitness_level: data.fitness_level ?? null,
        training_frequency: normalizedTrainingFrequency,
        primary_goal: normalizedPrimaryGoal,
      });
      setErrors(INITIAL_ERRORS);
    } catch (err: any) {
      Alert.alert(
        "Fehler",
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Profil konnte nicht geladen werden.",
        [
          {
            text: "Zurück",
            onPress: () => router.back(),
          },
        ],
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const validateForm = () => {
    const nextErrors: FormErrors = { ...INITIAL_ERRORS };

    if (parseDecimal(weight) === null) {
      nextErrors.weight = "Bitte gib ein gültiges Gewicht ein.";
    }

    if (parseDecimal(height) === null) {
      nextErrors.height = "Bitte gib eine gültige Größe ein.";
    }

    if (!fitnessLevel) {
      nextErrors.fitnessLevel = "Bitte wähle dein Fitness-Level.";
    }

    if (!trainingFrequency) {
      nextErrors.trainingFrequency = "Bitte wähle deine Trainingshäufigkeit.";
    }

    if (!primaryGoal) {
      nextErrors.primaryGoal = "Bitte wähle dein primäres Ziel.";
    }

    setErrors(nextErrors);

    return !Object.values(nextErrors).some(Boolean);
  };

  const hasChanges = React.useMemo(() => {
    if (!initialProfile) return false;

    const parsedWeight = parseDecimal(weight);
    const parsedHeight = parseDecimal(height);

    const weightChanged =
      parsedWeight === null
        ? initialProfile.weight !== null
        : hasNumericChange(parsedWeight, initialProfile.weight);

    const heightChanged =
      parsedHeight === null
        ? initialProfile.height !== null
        : hasNumericChange(parsedHeight, initialProfile.height);

    return (
      weightChanged ||
      heightChanged ||
      fitnessLevel !== initialProfile.fitness_level ||
      trainingFrequency !== initialProfile.training_frequency ||
      primaryGoal !== initialProfile.primary_goal
    );
  }, [
    initialProfile,
    weight,
    height,
    fitnessLevel,
    trainingFrequency,
    primaryGoal,
  ]);

  const isSaveDisabled = saving || !hasChanges;

  const handleSave = async () => {
    if (!initialProfile || saving || !hasChanges) return;
    if (!validateForm()) return;

    const parsedWeight = parseDecimal(weight);
    const parsedHeight = parseDecimal(height);

    if (
      parsedWeight === null ||
      parsedHeight === null ||
      !fitnessLevel ||
      !trainingFrequency ||
      !primaryGoal
    ) {
      return;
    }

    const payload: {
      weight?: number;
      height?: number;
      fitness_level?: FitnessLevel;
      training_frequency?: TrainingFrequency;
      primary_goal?: PrimaryGoal;
    } = {};

    if (hasNumericChange(parsedWeight, initialProfile.weight)) {
      payload.weight = parsedWeight;
    }

    if (hasNumericChange(parsedHeight, initialProfile.height)) {
      payload.height = parsedHeight;
    }

    if (fitnessLevel !== initialProfile.fitness_level) {
      payload.fitness_level = fitnessLevel;
    }

    if (trainingFrequency !== initialProfile.training_frequency) {
      payload.training_frequency = trainingFrequency;
    }

    if (primaryGoal !== initialProfile.primary_goal) {
      payload.primary_goal = primaryGoal;
    }

    if (Object.keys(payload).length === 0) {
      Alert.alert("Keine Änderungen", "Es gibt nichts zu speichern.");
      return;
    }

    try {
      setSaving(true);
      await api.put("/users/me", payload);
      Alert.alert("Erfolg", "Dein Profil wurde gespeichert.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      Alert.alert(
        "Fehler",
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Profil konnte nicht gespeichert werden.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profil bearbeiten</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil bearbeiten</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "height" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            isCompact ? styles.contentCompact : null,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        >
          <View
            style={[styles.section, isCompact ? styles.sectionCompact : null]}
          >
            <Text style={styles.sectionTitle}>BASISDATEN</Text>

            <Text style={styles.label}>Gewicht</Text>
            <Pressable
              onPress={() => weightInputRef.current?.focus()}
              style={[
                styles.inputShell,
                focusedInput === "weight" ? styles.inputFocus : null,
                errors.weight ? styles.inputError : null,
              ]}
            >
              <Icon
                name="monitor-weight"
                size={20}
                color={
                  focusedInput === "weight"
                    ? colors.primaryBlue
                    : colors.textSecondary
                }
              />
              <TextInput
                ref={weightInputRef}
                style={styles.input}
                value={weight}
                onChangeText={(value) => {
                  setWeight(value);
                  setErrors((prev) => ({ ...prev, weight: "" }));
                }}
                placeholder="z. B. 78.5"
                placeholderTextColor={colors.borderGray}
                keyboardType="decimal-pad"
                onFocus={() => setFocusedInput("weight")}
                onBlur={() => setFocusedInput(null)}
              />
              <Text style={styles.unitLabel}>kg</Text>
            </Pressable>
            {errors.weight ? (
              <Text style={styles.errorText}>{errors.weight}</Text>
            ) : null}

            <Text style={styles.label}>Größe</Text>
            <Pressable
              onPress={() => heightInputRef.current?.focus()}
              style={[
                styles.inputShell,
                focusedInput === "height" ? styles.inputFocus : null,
                errors.height ? styles.inputError : null,
              ]}
            >
              <Icon
                name="height"
                size={20}
                color={
                  focusedInput === "height"
                    ? colors.primaryBlue
                    : colors.textSecondary
                }
              />
              <TextInput
                ref={heightInputRef}
                style={styles.input}
                value={height}
                onChangeText={(value) => {
                  setHeight(value);
                  setErrors((prev) => ({ ...prev, height: "" }));
                }}
                placeholder="z. B. 182"
                placeholderTextColor={colors.borderGray}
                keyboardType="decimal-pad"
                onFocus={() => setFocusedInput("height")}
                onBlur={() => setFocusedInput(null)}
              />
              <Text style={styles.unitLabel}>cm</Text>
            </Pressable>
            {errors.height ? (
              <Text style={styles.errorText}>{errors.height}</Text>
            ) : null}
          </View>

          <View
            style={[styles.section, isCompact ? styles.sectionCompact : null]}
          >
            <Text style={styles.sectionTitle}>TRAININGSFOKUS</Text>

            <Text style={styles.label}>Fitness-Level</Text>
            <View style={styles.optionContainer}>
              {FITNESS_LEVEL_OPTIONS.map((item) => {
                const isSelected = fitnessLevel === item.value;

                return (
                  <Pressable
                    key={item.value}
                    onPress={() => {
                      setFitnessLevel(item.value);
                      setErrors((prev) => ({ ...prev, fitnessLevel: "" }));
                    }}
                    style={[
                      styles.optionButton,
                      isSelected ? styles.optionButtonSelected : null,
                    ]}
                  >
                    <View style={styles.optionContent}>
                      <View
                        style={[
                          styles.optionIndicator,
                          isSelected ? styles.optionIndicatorSelected : null,
                        ]}
                      >
                        {isSelected ? (
                          <Icon name="check" size={14} color={colors.white} />
                        ) : null}
                      </View>
                      <Text
                        style={[
                          styles.optionText,
                          isSelected ? styles.optionTextSelected : null,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            {errors.fitnessLevel ? (
              <Text style={styles.errorText}>{errors.fitnessLevel}</Text>
            ) : null}

            <Text style={styles.label}>Trainingshäufigkeit</Text>
            <View style={styles.optionContainer}>
              {TRAINING_FREQUENCY_OPTIONS.map((item) => {
                const isSelected = trainingFrequency === item.value;

                return (
                  <Pressable
                    key={item.value}
                    onPress={() => {
                      setTrainingFrequency(item.value);
                      setErrors((prev) => ({ ...prev, trainingFrequency: "" }));
                    }}
                    style={[
                      styles.optionButton,
                      isSelected ? styles.optionButtonSelected : null,
                    ]}
                  >
                    <View style={styles.optionContent}>
                      <View
                        style={[
                          styles.optionIndicator,
                          isSelected ? styles.optionIndicatorSelected : null,
                        ]}
                      >
                        {isSelected ? (
                          <Icon name="check" size={14} color={colors.white} />
                        ) : null}
                      </View>
                      <Text
                        style={[
                          styles.optionText,
                          isSelected ? styles.optionTextSelected : null,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            {errors.trainingFrequency ? (
              <Text style={styles.errorText}>{errors.trainingFrequency}</Text>
            ) : null}

            <Text style={styles.label}>Primäres Ziel</Text>
            <View style={styles.optionContainer}>
              {PRIMARY_GOAL_OPTIONS.map((item) => {
                const isSelected = primaryGoal === item.value;

                return (
                  <Pressable
                    key={item.value}
                    onPress={() => {
                      setPrimaryGoal(item.value);
                      setErrors((prev) => ({ ...prev, primaryGoal: "" }));
                    }}
                    style={[
                      styles.optionButton,
                      isSelected ? styles.optionButtonSelected : null,
                    ]}
                  >
                    <View style={styles.optionContent}>
                      <View
                        style={[
                          styles.optionIndicator,
                          isSelected ? styles.optionIndicatorSelected : null,
                        ]}
                      >
                        {isSelected ? (
                          <Icon name="check" size={14} color={colors.white} />
                        ) : null}
                      </View>
                      <Text
                        style={[
                          styles.optionText,
                          isSelected ? styles.optionTextSelected : null,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            {errors.primaryGoal ? (
              <Text style={styles.errorText}>{errors.primaryGoal}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              isCompact ? styles.saveButtonCompact : null,
              isSaveDisabled ? styles.saveButtonDisabled : null,
            ]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={isSaveDisabled}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Icon name="save" size={20} color={colors.white} />
                <Text style={styles.saveButtonText}>Änderungen speichern</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    fontFamily: "Inter",
  },
  headerSpacer: {
    width: 44,
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  contentCompact: {
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl + spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  sectionCompact: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: colors.textSecondary,
    paddingBottom: spacing.md,
    fontFamily: "Inter",
  },
  label: {
    ...typography.label,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    marginLeft: 4,
    textAlign: "left",
  },
  inputShell: {
    minHeight: 58,
    borderWidth: 1.5,
    borderColor: "#D8E1F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: "Inter",
  },
  inputFocus: {
    borderColor: colors.primaryBlue,
    shadowColor: colors.primaryBlue,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  unitLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
    backgroundColor: "#EFF3FA",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontFamily: "Inter",
  },
  optionContainer: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  optionButton: {
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#D8E1F0",
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
  },
  optionButtonSelected: {
    borderColor: colors.primaryBlue,
    backgroundColor: "#EEF4FF",
    shadowColor: colors.primaryBlue,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  optionIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#C9D6EA",
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  optionIndicatorSelected: {
    borderColor: colors.primaryBlue,
    backgroundColor: colors.primaryBlue,
  },
  optionText: {
    flex: 1,
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 16,
    fontFamily: "Inter",
  },
  optionTextSelected: {
    color: colors.primaryBlue,
  },
  errorText: {
    ...typography.error,
    marginTop: 6,
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 16,
    minHeight: 58,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    shadowColor: colors.primaryBlue,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  saveButtonCompact: {
    minHeight: 54,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.white,
    fontFamily: "Inter",
  },
});
