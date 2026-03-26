import React from "react";
import {
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/src/components/header";
import InputField from "@/src/components/input";
import ProgressDots from "@/src/components/ProgressDots";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { typography } from "@/src/theme/typography";
import { spacing } from "@/src/theme/spacing";
import { colors } from "@/src/theme/colors";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { parseDecimal } from "@/src/utils/number";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

export default function OnboardingStep2() {
  const router = useRouter();
  const LOG_PREFIX = "[OnboardingWizard]";
  const [currentStep, setCurrentStep] = React.useState(1);

  const [firstName, setFirstName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordRepeat, setPasswordRepeat] = React.useState("");
  const [email, setEmail] = React.useState("");

  const [birthDate, setBirthDate] = React.useState("");

  const [weight, setWeight] = React.useState("");
  const [height, setHeight] = React.useState("");
  const [gender, setGender] = React.useState<
    "male" | "female" | "other" | "not specified"
  >("not specified");

  const [fitnessLevel, setFitnessLevel] = React.useState("");
  const [trainingFrequency, setTrainingFrequency] = React.useState<number | "">(
    "",
  );
  const [primaryGoal, setPrimaryGoal] = React.useState("");
  const [stayLoggedIn, setStayLoggedIn] = React.useState(false);

  const [errors, setErrors] = React.useState({
    firstName: "",
    password: "",
    passwordRepeat: "",
    email: "",
    birthDate: "",
    height: "",
    weight: "",
    fitnessLevel: "",
    trainingFrequency: "",
    primaryGoal: "",
  });

  const [loading, setLoading] = React.useState(false);

  const validateStep1 = () => {
    const newErrors = {
      firstName: "",
      password: "",
      passwordRepeat: "",
      email: "",
      birthDate: "",
      height: "",
      weight: "",
      fitnessLevel: "",
      trainingFrequency: "",
      primaryGoal: "",
    };

    let hasError = false;

    if (!firstName.trim()) {
      newErrors.firstName = "Bitte gib deinen Vornamen ein.";
      hasError = true;
    }

    if (!email.includes("@")) {
      newErrors.email = "Bitte gib eine gültige E-Mail-Adresse ein.";
      hasError = true;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

    if (!passwordRegex.test(password)) {
      newErrors.password =
        "Passwort muss mind. 8 Zeichen, 1 Großbuchstaben, 1 Kleinbuchstaben, 1 Zahl und 1 Sonderzeichen enthalten.";
      hasError = true;
    }

    if (password !== passwordRepeat) {
      newErrors.passwordRepeat = "Passwörter stimmen nicht überein.";
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) return false;

    return true;
  };

  const validateStep2 = () => {
    const newErrors = {
      ...errors,
      birthDate: "",
    };
    let hasError = false;

    if (!birthDate) {
      newErrors.birthDate = "Bitte gib dein Geburtsdatum ein.";
      hasError = true;
    } else {
      const selectedDate = new Date(birthDate);
      const today = new Date();
      if (selectedDate >= today) {
        newErrors.birthDate = "Bitte gib ein gültiges Geburtsdatum ein.";
        hasError = true;
      } else {
        const tenYearsAgo = new Date();
        tenYearsAgo.setFullYear(today.getFullYear() - 10);
        if (selectedDate > tenYearsAgo) {
          newErrors.birthDate = "Du musst mindestens 10 Jahre alt sein.";
          hasError = true;
        }
      }
    }

    setErrors(newErrors);
    return !hasError;
  };

  const validateStep3 = () => {
    const newErrors = {
      ...errors,
      height: "",
      weight: "",
    };
    let hasError = false;

    const heightNum = parseDecimal(height);
    const weightNum = parseDecimal(weight);

    if (heightNum === null || heightNum < 100 || heightNum > 250) {
      newErrors.height = "Bitte gib eine gültige Größe ein.";
      hasError = true;
    }

    if (weightNum === null || weightNum < 30 || weightNum > 300) {
      newErrors.weight = "Bitte gib eine gültiges Gewicht ein.";
      hasError = true;
    }

    setErrors(newErrors);
    return !hasError;
  };

  const validateStep4 = () => {
    const newErrors = {
      ...errors,
      fitnessLevel: "",
      trainingFrequency: "",
      primaryGoal: "",
    };
    let hasError = false;

    if (!fitnessLevel) {
      newErrors.fitnessLevel = "Bitte wähle dein Fitness-Level.";
      hasError = true;
    }

    if (!trainingFrequency) {
      newErrors.trainingFrequency = "Bitte wähle deine Trainingshäufigkeit.";
      hasError = true;
    }

    if (!primaryGoal) {
      newErrors.primaryGoal = "Bitte wähle dein primäres Ziel.";
      hasError = true;
    }

    setErrors(newErrors);
    return !hasError;
  };

  const submitOnboarding = async () => {
    let requestBodyForLog: Record<string, unknown> | null = null;

    if (!validateStep4()) return;

    try {
      setLoading(true);
      console.log(`${LOG_PREFIX} submitOnboarding called`, {
        firstName,
        email,
        birthDate,
        height,
        weight,
        gender,
        fitnessLevel,
        trainingFrequency,
        primaryGoal,
        stayLoggedIn,
      });

      const heightNum = parseDecimal(height) as number;
      const weightNum = parseDecimal(weight) as number;

      await AsyncStorage.multiSet([
        ["onboarding_firstName", firstName],
        ["onboarding_email", email],
        ["onboarding_password", password],
        ["onboarding_birthDate", birthDate],
        ["onboarding_height", heightNum.toString()],
        ["onboarding_weight", weightNum.toString()],
        ["onboarding_gender", gender],
        ["onboarding_fitnessLevel", fitnessLevel],
        ["onboarding_trainingFrequency", trainingFrequency.toString()],
        ["onboarding_primaryGoal", primaryGoal],
      ]);

      const requestBody = {
        firstname: firstName,
        birthdate: birthDate,
        email,
        password,
        weight: weightNum,
        height: heightNum,
        gender,
        onboarding_completed: true,
        fitness_level: fitnessLevel,
        training_frequency: Number(trainingFrequency),
        primary_goal: primaryGoal,
        stayLoggedIn,
      };

      requestBodyForLog = {
        ...requestBody,
        password: "[redacted]",
      };

      console.log(`${LOG_PREFIX} register request body`, requestBodyForLog);

      const response = await axios.post(
        "https://api.properform.app/auth/register",
        requestBody,
      );

      const { access_token, refresh_token, uid } = response.data;

      await SecureStore.setItemAsync("access_token", String(access_token));
      await SecureStore.setItemAsync("refresh_token", String(refresh_token));
      await SecureStore.setItemAsync("user_id", String(uid));
      await AsyncStorage.removeItem("onboarding_password");

      console.log(`${LOG_PREFIX} register success`, {
        status: response.status,
        uid,
      });

      router.push("../(onboarding)/OnboardingTrainingModeScreen");
    } catch (error: any) {
      console.log(`${LOG_PREFIX} register failed`, {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
        requestBody: requestBodyForLog,
      });

      Alert.alert(
        "Fehler",
        error.response?.data?.error || "Registrierung fehlgeschlagen.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!validateStep2()) return;
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      if (!validateStep3()) return;
      setCurrentStep(4);
      return;
    }

    await submitOnboarding();
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      return;
    }

    router.back();
  };

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <>
          <View style={styles.header}>
            <Text style={typography.title}>Account erstellen</Text>
            <Text style={[typography.body, styles.subheader]}>
              Bitte gib deine persönlichen Daten ein
            </Text>
          </View>

          <View style={styles.card}>
            <InputField
              title="Vorname"
              value={firstName}
              placeholder="Max Mustermann"
              onChange={setFirstName}
            />
            {errors.firstName ? (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            ) : null}

            <InputField
              title="E-Mail"
              value={email}
              placeholder="max@beispiel.at"
              onChange={setEmail}
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}

            <InputField
              title="Passwort"
              value={password}
              placeholder="********"
              onChange={setPassword}
            />
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}

            <InputField
              title="Passwort wiederholen"
              value={passwordRepeat}
              placeholder="********"
              onChange={setPasswordRepeat}
            />
            {errors.passwordRepeat ? (
              <Text style={styles.errorText}>{errors.passwordRepeat}</Text>
            ) : null}

            <View style={styles.hintBox}>
              <Text style={styles.hintText}>• Mind. 8 Zeichen</Text>
              <Text style={styles.hintText}>• 1 Sonderzeichen</Text>
              <Text style={styles.hintText}>• 1 Großbuchstabe</Text>
            </View>
          </View>
        </>
      );
    }

    if (currentStep === 2) {
      return (
        <>
          <View style={styles.header}>
            <Text style={typography.title}>Geburtsdatum</Text>
            <Text style={[typography.body, styles.subheader]}>
              Wann wurdest du geboren?
            </Text>
          </View>

          <View style={styles.card}>
            <InputField
              title="Geburtsdatum"
              value={birthDate}
              placeholder="TT.MM.JJJJ"
              onChange={setBirthDate}
            />

            {errors.birthDate ? (
              <Text style={styles.errorText}>{errors.birthDate}</Text>
            ) : null}
          </View>
        </>
      );
    }

    if (currentStep === 3) {
      return (
        <>
          <View style={styles.header}>
            <Text style={typography.title}>Über dich</Text>
            <Text style={[typography.body, styles.subheader]}>
              Gewicht, Größe & Geschlecht
            </Text>
          </View>

          <View style={styles.card}>
            <InputField
              title="Größe (cm)"
              value={height}
              placeholder="z.B. 180.4"
              onChange={setHeight}
            />

            {errors.height ? (
              <Text style={styles.errorText}>{errors.height}</Text>
            ) : null}

            <InputField
              title="Gewicht (kg)"
              value={weight}
              placeholder="z.B. 80.7"
              onChange={setWeight}
            />

            {errors.weight ? (
              <Text style={styles.errorText}>{errors.weight}</Text>
            ) : null}

            <Text style={styles.labelPicker}>Geschlecht</Text>

            <View style={styles.inputContainer}>
              <Picker
                selectedValue={gender}
                onValueChange={(value) => setGender(value)}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Keine Angabe" value="not specified" />
                <Picker.Item label="Männlich" value="male" />
                <Picker.Item label="Weiblich" value="female" />
                <Picker.Item label="Divers" value="other" />
              </Picker>
            </View>
          </View>
        </>
      );
    }

    return (
      <>
        <View style={styles.header}>
          <Text style={typography.title}>Fast geschafft!</Text>
          <Text style={[typography.body, styles.subheader]}>
            Nur noch deine Fitnessziele
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.labelPicker}>Fitness-Level</Text>

          <View style={styles.inputContainer}>
            <Picker
              selectedValue={fitnessLevel}
              onValueChange={(value) => setFitnessLevel(value)}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Bitte wählen" value="" />
              <Picker.Item label="Anfänger" value="beginner" />
              <Picker.Item label="Fortgeschritten" value="intermediate" />
              <Picker.Item label="Experte" value="advanced" />
            </Picker>
          </View>

          {errors.fitnessLevel ? (
            <Text style={styles.errorText}>{errors.fitnessLevel}</Text>
          ) : null}

          <Text style={styles.labelPicker}>Trainingshäufigkeit</Text>

          <View style={styles.inputContainer}>
            <Picker
              selectedValue={trainingFrequency}
              onValueChange={(value) => setTrainingFrequency(value)}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Bitte wählen" value={""} />
              <Picker.Item label="1–2x pro Woche" value={2} />
              <Picker.Item label="3–4x pro Woche" value={4} />
              <Picker.Item label="5+ pro Woche" value={7} />
            </Picker>
          </View>

          {errors.trainingFrequency ? (
            <Text style={styles.errorText}>{errors.trainingFrequency}</Text>
          ) : null}

          <Text style={styles.labelPicker}>Primäres Ziel</Text>

          <View style={styles.inputContainer}>
            <Picker
              selectedValue={primaryGoal}
              onValueChange={(value) => setPrimaryGoal(value)}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Bitte wählen" value={""} />
              <Picker.Item label="Muskelaufbau" value="build muscle" />
              <Picker.Item label="Abnehmen" value="lose weight" />
              <Picker.Item label="Gewicht halten" value="stay at weight" />
            </Picker>
          </View>

          {errors.primaryGoal ? (
            <Text style={styles.errorText}>{errors.primaryGoal}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setStayLoggedIn((prev) => !prev)}
          activeOpacity={0.8}
        >
          <Icon
            name={stayLoggedIn ? "check-box" : "check-box-outline-blank"}
            size={24}
            color={colors.primaryBlue}
          />
          <Text style={styles.checkboxLabel}>Stay logged in</Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
          >
            {renderStepContent()}
          </ScrollView>
        </TouchableWithoutFeedback>
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.arrowButton} onPress={handleBack}>
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>

          <ProgressDots total={6} current={currentStep} />

          <TouchableOpacity
            style={[styles.arrowButton, loading && { opacity: 0.5 }]}
            onPress={handleContinue}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Icon name="arrow-forward" size={24} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screenPaddingHorizontal,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  subheader: {
    fontSize: 18,
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.xs,
    shadowColor: colors.black,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  errorText: {
    ...typography.error,
    marginTop: -spacing.xs,
    marginLeft: spacing.xs,
  },
  hintBox: {
    marginTop: -spacing.xs,
    paddingLeft: spacing.xs,
  },
  hintText: {
    ...typography.hint,
    color: colors.textSecondary,
  },
  labelPicker: {
    ...typography.label,
    color: colors.black,
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 4,
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  pickerItem: {
    fontSize: 16,
    color: "#333",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.lg,
    marginLeft: 4,
    gap: spacing.xs,
  },
  checkboxLabel: {
    ...typography.body,
    color: colors.black,
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: spacing.lg,
    paddingTop: spacing.lg,
  },
  arrowButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryBlue,
    alignItems: "center",
    justifyContent: "center",
  },
});
