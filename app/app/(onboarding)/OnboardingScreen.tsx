import Header from "@/src/components/header";
import ProgressDots from "@/src/components/ProgressDots";
import { OnboardingContext } from "@/src/context/OnboardingContext";
import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import api from "@/src/utils/axiosInstance";
import { parseDecimal } from "@/src/utils/number";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type FormStep = 2 | 3 | 4;

const STEP_TITLES: Record<FormStep, string> = {
  2: "Erstelle dein Konto",
  3: "Deine Basisdaten",
  4: "Dein Trainingsfokus",
};

const STEP_SUBTITLES: Record<FormStep, string> = {
  2: "Vorname, E-Mail und Passwort",
  3: "Groesse, Gewicht und Geburtsdatum",
  4: "Primary Goal, Fitness Level und Trainingshaeufigkeit",
};

const STEP_5_TITLE = "Wie möchtest du trainieren?";
const STEP_5_SUBTITLE = "Du kannst das jederzeit später ändern";
const STEP_6_TITLE = "E-Mail bestätigen";
const STEP_6_SUBTITLE = "Gib den 6-stelligen Code ein";
const STEP_7_TITLE = "Trainer verbinden";
const STEP_7_SUBTITLE = "Gib den Code deines Trainers ein";

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { finishOnboarding } = React.useContext(OnboardingContext);

  const defaultBirthDate = React.useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d;
  }, []);

  const [step, setStep] = React.useState<Step>(1);
  const [loading, setLoading] = React.useState(false);
  const [focusedInput, setFocusedInput] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const [firstName, setFirstName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [height, setHeight] = React.useState("");
  const [weight, setWeight] = React.useState("");
  const [birthDate, setBirthDate] = React.useState(defaultBirthDate);
  const [fitnessLevel, setFitnessLevel] = React.useState("");
  const [trainingFrequency, setTrainingFrequency] = React.useState<number | "">(
    "",
  );
  const [primaryGoal, setPrimaryGoal] = React.useState("");
  const [stayLoggedIn, setStayLoggedIn] = React.useState(false);

  // Step 5 - Training Mode
  const [trainingMode, setTrainingMode] = React.useState<
    "solo" | "trainer" | null
  >(null);

  // Step 6 - Email Verification
  const [verificationCode, setVerificationCode] = React.useState("");
  const [verifyError, setVerifyError] = React.useState("");
  const [loadingResend, setLoadingResend] = React.useState(false);

  // Step 7 - Trainer Code
  const [trainerCode, setTrainerCode] = React.useState("");
  const [trainerCodeError, setTrainerCodeError] = React.useState("");
  const [loadingCheck, setLoadingCheck] = React.useState(false);
  const [trainer, setTrainer] = React.useState<{
    tid: number;
    firstname: string;
    lastname: string;
  } | null>(null);

  const [errors, setErrors] = React.useState({
    firstName: "",
    email: "",
    password: "",
    height: "",
    weight: "",
    birthDate: "",
    fitnessLevel: "",
    trainingFrequency: "",
    primaryGoal: "",
  });

  const contentTranslateX = React.useRef(new Animated.Value(0)).current;
  const contentOpacity = React.useRef(new Animated.Value(1)).current;
  const buttonArrowX = React.useRef(new Animated.Value(0)).current;
  const firstNameInputRef = React.useRef<TextInput>(null);
  const emailInputRef = React.useRef<TextInput>(null);
  const passwordInputRef = React.useRef<TextInput>(null);
  const heightInputRef = React.useRef<TextInput>(null);
  const weightInputRef = React.useRef<TextInput>(null);

  const animateToStep = (nextStep: Step) => {
    const direction = nextStep > step ? 1 : -1;

    Animated.sequence([
      Animated.parallel([
        Animated.timing(contentTranslateX, {
          toValue: -22 * direction,
          duration: 130,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(contentTranslateX, {
        toValue: 22 * direction,
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(contentTranslateX, {
          toValue: 0,
          duration: 220,
          easing: Easing.bezier(0.2, 0.8, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    setStep(nextStep);
  };

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonArrowX, {
          toValue: 6,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(buttonArrowX, {
          toValue: 0,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [buttonArrowX]);

  const validateFirstName = (value: string) => {
    if (value.trim().length < 2) return "Bitte gib deinen Vornamen ein.";
    return "";
  };

  const validateEmail = (value: string) => {
    const normalizedEmail = value.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail))
      return "Bitte gib eine gueltige E-Mail ein.";
    return "";
  };

  const validatePassword = (value: string) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_.-])[A-Za-z\d@$!%*?&#_.-]{8,}$/;

    if (value.length < 8) return "Mindestens 8 Zeichen erforderlich.";
    if (!/[A-Z]/.test(value))
      return "Mindestens ein Grossbuchstabe erforderlich.";
    if (!/[a-z]/.test(value))
      return "Mindestens ein Kleinbuchstabe erforderlich.";
    if (!/[0-9]/.test(value)) return "Mindestens eine Zahl erforderlich.";
    if (!/[@$!%*?&#_.-]/.test(value))
      return "Mindestens ein Sonderzeichen erforderlich (@$!%*?&#_.-)";
    if (!passwordRegex.test(value))
      return "Passwort erfüllt die Anforderungen nicht.";
    return "";
  };

  const validateStep2 = () => {
    const next = {
      ...errors,
      firstName: validateFirstName(firstName),
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(next);
    return !Boolean(next.firstName || next.email || next.password);
  };

  const validateStep3 = () => {
    const next = { ...errors, height: "", weight: "", birthDate: "" };
    let hasError = false;

    const heightNum = parseDecimal(height);
    const weightNum = parseDecimal(weight);
    const selectedDate = new Date(birthDate);
    const today = new Date();

    if (heightNum === null || heightNum < 100 || heightNum > 250) {
      next.height = "Bitte gib eine gueltige Groesse ein (100-250 cm).";
      hasError = true;
    }
    if (weightNum === null || weightNum < 30 || weightNum > 300) {
      next.weight = "Bitte gib ein gueltiges Gewicht ein (30-300 kg).";
      hasError = true;
    }

    if (selectedDate >= today) {
      next.birthDate = "Bitte gib ein gueltiges Geburtsdatum ein.";
      hasError = true;
    } else {
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(today.getFullYear() - 10);
      if (selectedDate > tenYearsAgo) {
        next.birthDate = "Du musst mindestens 10 Jahre alt sein.";
        hasError = true;
      }
    }

    setErrors(next);
    return !hasError;
  };

  const validateStep4 = () => {
    const next = {
      ...errors,
      fitnessLevel: fitnessLevel ? "" : "Bitte waehle dein Fitness-Level.",
      trainingFrequency: trainingFrequency
        ? ""
        : "Bitte waehle deine Trainingshaeufigkeit.",
      primaryGoal: primaryGoal ? "" : "Bitte waehle dein primaeres Ziel.",
    };
    setErrors(next);
    return !Boolean(
      next.fitnessLevel || next.trainingFrequency || next.primaryGoal,
    );
  };

  const handleNext = async () => {
    if (step === 1) {
      animateToStep(2);
      return;
    }

    if (step === 2) {
      if (!validateStep2()) return;
      animateToStep(3);
      return;
    }

    if (step === 3) {
      if (!validateStep3()) return;
      animateToStep(4);
      return;
    }

    if (step === 4) {
      if (!validateStep4()) return;
      try {
        setLoading(true);

        await AsyncStorage.multiSet([
          ["onboarding_firstName", firstName.trim()],
          ["onboarding_email", email.trim().toLowerCase()],
          ["onboarding_password", password],
          ["onboarding_height", String(parseDecimal(height))],
          ["onboarding_weight", String(parseDecimal(weight))],
          ["onboarding_birthDate", formatDate(birthDate)],
          ["onboarding_gender", "not specified"],
          ["onboarding_fitnessLevel", fitnessLevel],
          ["onboarding_trainingFrequency", String(trainingFrequency)],
          ["onboarding_primaryGoal", primaryGoal],
        ]);

        const requestBody = {
          firstname: firstName.trim(),
          birthdate: formatDate(birthDate),
          email: email.trim().toLowerCase(),
          password,
          weight: Number(parseDecimal(weight)),
          height: Number(parseDecimal(height)),
          gender: "not specified",
          onboarding_completed: true,
          fitness_level: fitnessLevel,
          training_frequency: Number(trainingFrequency),
          primary_goal: primaryGoal,
          stayLoggedIn,
        };

        const response = await axios.post(
          "https://api.properform.app/auth/register",
          requestBody,
        );

        const { access_token, refresh_token, uid } = response.data;
        await SecureStore.setItemAsync("access_token", String(access_token));
        await SecureStore.setItemAsync("refresh_token", String(refresh_token));
        await SecureStore.setItemAsync("user_id", String(uid));
        await AsyncStorage.removeItem("onboarding_password");

        animateToStep(5);
      } catch (error: any) {
        Alert.alert(
          "Fehler",
          error?.response?.data?.error ||
            "Registrierung fehlgeschlagen. Bitte pruefe deine Daten.",
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === 5) {
      if (!trainingMode) {
        Alert.alert("Fehler", "Bitte wähle eine Option");
        return;
      }
      if (trainingMode === "solo") {
        animateToStep(6);
      } else {
        animateToStep(7);
      }
      return;
    }

    if (step === 6) {
      if (verificationCode.length !== 6) {
        setVerifyError("Der Code muss 6-stellig sein.");
        return;
      }
      await handleVerifyEmail();
      return;
    }

    if (step === 7) {
      if (!trainer) {
        Alert.alert("Fehler", "Bitte prüfe zuerst den Trainer-Code");
        return;
      }
      await handleConnectTrainer();
      return;
    }
  };

  const handleVerifyEmail = async () => {
    setVerifyError("");
    try {
      setLoading(true);

      const storedEmail = await AsyncStorage.getItem("onboarding_email");
      await axios.post(
        "https://api.properform.app/auth/check-verification-code",
        {
          email: storedEmail,
          code: verificationCode,
        },
      );

      await AsyncStorage.setItem("onboardingFinished", "true");
      finishOnboarding();
      router.replace("../(tabs)/HomeScreen");
    } catch (err: any) {
      setVerifyError(
        err.response?.data?.error || "Bitte gib den richtigen Code ein.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setLoadingResend(true);
      const storedEmail = await AsyncStorage.getItem("onboarding_email");
      await axios.post(
        "https://api.properform.app/auth/resend-verification-code",
        {
          email: storedEmail,
        },
      );
      Alert.alert("Erfolg", "Code wurde erneut gesendet");
    } catch (err: any) {
      Alert.alert(
        "Fehler",
        err.response?.data?.error || "Etwas ist schiefgelaufen.",
      );
    } finally {
      setLoadingResend(false);
    }
  };

  const handleCheckTrainerCode = async () => {
    if (trainerCode.length < 6) {
      setTrainerCodeError("Bitte gib einen gültigen Code ein.");
      return;
    }
    setTrainerCodeError("");
    setTrainer(null);
    try {
      setLoadingCheck(true);
      const inviteCode = `TRN-${trainerCode.slice(0, 3)}-${trainerCode.slice(3)}`;
      const response = await axios.post(
        "https://api.properform.app/trainers/check-invite-code",
        { invite_code: inviteCode },
      );
      if (response.data.success) {
        setTrainer(response.data.trainer);
      } else {
        setTrainerCodeError("Ungültiger Einladungscode.");
      }
    } catch (err: any) {
      setTrainerCodeError(
        err.response?.data?.message || "Etwas ist schiefgelaufen.",
      );
    } finally {
      setLoadingCheck(false);
    }
  };

  const handleConnectTrainer = async () => {
    try {
      setLoading(true);
      const inviteCode = `TRN-${trainerCode.slice(0, 3)}-${trainerCode.slice(3)}`;
      await api.post("/trainers/connect", { invite_code: inviteCode });
      animateToStep(6);
    } catch (err: any) {
      Alert.alert(
        "Fehler",
        err.response?.data?.error || "Verbindung fehlgeschlagen.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (loading) return;
    if (step === 1) {
      router.back();
      return;
    }
    if (step === 6 || step === 7) {
      animateToStep(5);
      return;
    }
    animateToStep((step - 1) as Step);
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={step === 1 ? ["top", "bottom"] : ["top"]}
    >
      {step === 1 ? (
        <>
          <View style={styles.decoCircleLarge} />
          <View style={styles.decoCircleSmall} />

          <View style={styles.topSection}>
            <View style={styles.logoWrap}>
              <Image
                source={require("../../assets/images/logo_ohne_bg.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.ProPerform}>ProPerform</Text>
          </View>

          <View style={styles.mainSection}>
            <Text style={styles.mainTitle}>
              Trainiere{"\n"}smarter.{"\n"}Nicht harder.
            </Text>
            <Text style={styles.mainSubtitle}>
              Erstelle dein Profil und werde die beste Version von dir.
            </Text>
          </View>

          <View style={styles.bottomSection}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
              <Text style={styles.primaryButtonText}>LOS GEHT&apos;S</Text>
              <Animated.View
                style={{
                  transform: [{ translateX: buttonArrowX }],
                }}
              >
                <Icon
                  name="arrow-forward"
                  size={20}
                  weight={1000}
                  color={colors.white}
                />
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("/(auth)/LoginScreen")}
            >
              <Text style={styles.secondaryButtonText}>
                Bereits ein Konto? Anmelden
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Header />

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={
                Platform.OS === "ios" ? "interactive" : "none"
              }
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.header}>
                <Text style={typography.title}>
                  {step === 5
                    ? STEP_5_TITLE
                    : step === 6
                      ? STEP_6_TITLE
                      : step === 7
                        ? STEP_7_TITLE
                        : STEP_TITLES[step as FormStep]}
                </Text>
                <Text style={[typography.body, styles.subheader]}>
                  {step === 5
                    ? STEP_5_SUBTITLE
                    : step === 6
                      ? STEP_6_SUBTITLE
                      : step === 7
                        ? STEP_7_SUBTITLE
                        : STEP_SUBTITLES[step as FormStep]}
                </Text>
              </View>

              <Animated.View
                style={{
                  transform: [{ translateX: contentTranslateX }],
                  opacity: contentOpacity,
                }}
              >
                <View style={styles.card}>
                  {step === 2 ? (
                    <>
                      <Text style={styles.label}>Vorname</Text>
                      <Pressable
                        onPress={() => firstNameInputRef.current?.focus()}
                        style={[
                          styles.inputShell,
                          focusedInput === "firstName"
                            ? styles.inputFocus
                            : null,
                          errors.firstName ? styles.inputError : null,
                        ]}
                      >
                        <Icon
                          name="person-outline"
                          size={20}
                          color={
                            focusedInput === "firstName"
                              ? colors.primaryBlue
                              : colors.textSecondary
                          }
                        />
                        <TextInput
                          ref={firstNameInputRef}
                          style={styles.input}
                          value={firstName}
                          onChangeText={(value) => {
                            setFirstName(value);
                            setErrors((prev) => ({
                              ...prev,
                              firstName: validateFirstName(value),
                            }));
                          }}
                          placeholder="Max"
                          placeholderTextColor={colors.textSecondary}
                          autoCapitalize="words"
                          autoCorrect={false}
                          onFocus={() => setFocusedInput("firstName")}
                          onBlur={() => setFocusedInput(null)}
                        />
                      </Pressable>
                      {errors.firstName ? (
                        <Text style={styles.errorText}>{errors.firstName}</Text>
                      ) : null}

                      <Text style={styles.label}>E-Mail</Text>
                      <Pressable
                        onPress={() => emailInputRef.current?.focus()}
                        style={[
                          styles.inputShell,
                          focusedInput === "email" ? styles.inputFocus : null,
                          errors.email ? styles.inputError : null,
                        ]}
                      >
                        <Icon
                          name="mail-outline"
                          size={20}
                          color={
                            focusedInput === "email"
                              ? colors.primaryBlue
                              : colors.textSecondary
                          }
                        />
                        <TextInput
                          ref={emailInputRef}
                          style={styles.input}
                          value={email}
                          onChangeText={(value) => {
                            setEmail(value);
                            setErrors((prev) => ({
                              ...prev,
                              email: validateEmail(value),
                            }));
                          }}
                          placeholder="max@email.com"
                          placeholderTextColor={colors.textSecondary}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          onFocus={() => setFocusedInput("email")}
                          onBlur={() => setFocusedInput(null)}
                        />
                      </Pressable>
                      {errors.email ? (
                        <Text style={styles.errorText}>{errors.email}</Text>
                      ) : null}

                      <Text style={styles.label}>Passwort</Text>
                      <Pressable
                        onPress={() => passwordInputRef.current?.focus()}
                        style={[
                          styles.inputShell,
                          focusedInput === "password"
                            ? styles.inputFocus
                            : null,
                          errors.password ? styles.inputError : null,
                        ]}
                      >
                        <Icon
                          name="lock-outline"
                          size={20}
                          color={
                            focusedInput === "password"
                              ? colors.primaryBlue
                              : colors.textSecondary
                          }
                        />
                        <TextInput
                          ref={passwordInputRef}
                          style={styles.input}
                          value={password}
                          onChangeText={(value) => {
                            setPassword(value);
                            setErrors((prev) => ({
                              ...prev,
                              password: validatePassword(value),
                            }));
                          }}
                          placeholder="Mindestens 8 Zeichen"
                          placeholderTextColor={colors.textSecondary}
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          onFocus={() => setFocusedInput("password")}
                          onBlur={() => setFocusedInput(null)}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword((prev) => !prev)}
                          style={styles.visibilityToggle}
                          activeOpacity={0.7}
                        >
                          <Icon
                            name={
                              showPassword ? "visibility-off" : "visibility"
                            }
                            size={20}
                            color={colors.textSecondary}
                          />
                        </TouchableOpacity>
                      </Pressable>
                      {errors.password ? (
                        <Text style={styles.errorText}>{errors.password}</Text>
                      ) : null}
                    </>
                  ) : null}

                  {step === 3 ? (
                    <>
                      <Text style={styles.label}>Groesse (cm)</Text>
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
                          onChangeText={setHeight}
                          placeholder="180.4"
                          placeholderTextColor={colors.textSecondary}
                          keyboardType="decimal-pad"
                          onFocus={() => setFocusedInput("height")}
                          onBlur={() => setFocusedInput(null)}
                        />
                        <Text style={styles.unitLabel}>cm</Text>
                      </Pressable>
                      {errors.height ? (
                        <Text style={styles.errorText}>{errors.height}</Text>
                      ) : null}

                      <Text style={styles.label}>Gewicht (kg)</Text>
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
                          onChangeText={setWeight}
                          placeholder="80.7"
                          placeholderTextColor={colors.textSecondary}
                          keyboardType="decimal-pad"
                          onFocus={() => setFocusedInput("weight")}
                          onBlur={() => setFocusedInput(null)}
                        />
                        <Text style={styles.unitLabel}>kg</Text>
                      </Pressable>
                      {errors.weight ? (
                        <Text style={styles.errorText}>{errors.weight}</Text>
                      ) : null}

                      <Text style={styles.label}>Geburtsdatum</Text>
                      <View
                        style={[
                          styles.datePickerWrap,
                          errors.birthDate ? styles.inputError : null,
                        ]}
                      >
                        <View style={styles.datePickerCenterWrap}>
                          <DateTimePicker
                            value={birthDate}
                            mode="date"
                            display={
                              Platform.OS === "ios" ? "spinner" : "default"
                            }
                            onChange={(_, selectedDate) => {
                              if (selectedDate) setBirthDate(selectedDate);
                            }}
                            locale="de-DE"
                            themeVariant="light"
                            maximumDate={new Date()}
                            style={styles.datePicker}
                          />
                        </View>
                      </View>
                      {errors.birthDate ? (
                        <Text style={styles.errorText}>{errors.birthDate}</Text>
                      ) : null}
                    </>
                  ) : null}

                  {step === 4 ? (
                    <>
                      <Text style={styles.label}>Fitness-Level</Text>
                      <View style={styles.optionContainer}>
                        {["Anfaenger", "Fortgeschritten", "Experte"].map(
                          (item) => (
                            <Pressable
                              key={item}
                              onPress={() =>
                                setFitnessLevel(
                                  item === "Anfaenger"
                                    ? "beginner"
                                    : item === "Fortgeschritten"
                                      ? "intermediate"
                                      : "advanced",
                                )
                              }
                              style={[
                                styles.optionButton,
                                {
                                  backgroundColor:
                                    fitnessLevel ===
                                    (item === "Anfaenger"
                                      ? "beginner"
                                      : item === "Fortgeschritten"
                                        ? "intermediate"
                                        : "advanced")
                                      ? colors.primaryBlue
                                      : "#1A2332",
                                },
                              ]}
                            >
                              <Text style={styles.optionText}>{item}</Text>
                            </Pressable>
                          ),
                        )}
                      </View>
                      {errors.fitnessLevel ? (
                        <Text style={styles.errorText}>
                          {errors.fitnessLevel}
                        </Text>
                      ) : null}

                      <Text style={styles.label}>Trainingshaeufigkeit</Text>
                      <View style={styles.optionContainer}>
                        {[
                          { label: "1-2x pro Woche", value: 2 },
                          { label: "3-4x pro Woche", value: 4 },
                          { label: "5+ pro Woche", value: 7 },
                        ].map((item) => (
                          <Pressable
                            key={item.value}
                            onPress={() => setTrainingFrequency(item.value)}
                            style={[
                              styles.optionButton,
                              {
                                backgroundColor:
                                  trainingFrequency === item.value
                                    ? colors.primaryBlue
                                    : "#1A2332",
                              },
                            ]}
                          >
                            <Text style={styles.optionText}>{item.label}</Text>
                          </Pressable>
                        ))}
                      </View>
                      {errors.trainingFrequency ? (
                        <Text style={styles.errorText}>
                          {errors.trainingFrequency}
                        </Text>
                      ) : null}

                      <Text style={styles.label}>Primaeres Ziel</Text>
                      <View style={styles.optionContainer}>
                        {[
                          { label: "Muskelaufbau", value: "build muscle" },
                          { label: "Abnehmen", value: "lose weight" },
                          { label: "Gewicht halten", value: "stay at weight" },
                        ].map((item) => (
                          <Pressable
                            key={item.value}
                            onPress={() => setPrimaryGoal(item.value)}
                            style={[
                              styles.optionButton,
                              {
                                backgroundColor:
                                  primaryGoal === item.value
                                    ? colors.primaryBlue
                                    : "#1A2332",
                              },
                            ]}
                          >
                            <Text style={styles.optionText}>{item.label}</Text>
                          </Pressable>
                        ))}
                      </View>
                      {errors.primaryGoal ? (
                        <Text style={styles.errorText}>
                          {errors.primaryGoal}
                        </Text>
                      ) : null}

                      <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => setStayLoggedIn((prev) => !prev)}
                        activeOpacity={0.8}
                      >
                        <Icon
                          name={
                            stayLoggedIn
                              ? "check-box"
                              : "check-box-outline-blank"
                          }
                          size={24}
                          color={colors.primaryBlue}
                        />
                        <Text style={styles.checkboxLabel}>
                          Eingeloggt bleiben
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : null}

                  {step === 5 ? (
                    <View style={styles.choiceContainer}>
                      <TouchableOpacity
                        style={[
                          styles.choiceCard,
                          trainingMode === "solo" && styles.choiceCardSelected,
                        ]}
                        onPress={() => setTrainingMode("solo")}
                        activeOpacity={0.8}
                      >
                        <View style={styles.choiceIconWrap}>
                          <Icon
                            name="person"
                            size={32}
                            color={colors.primaryBlue}
                          />
                        </View>
                        <Text style={styles.choiceTitle}>
                          Alleine trainieren
                        </Text>
                        <Text style={styles.choiceDescription}>
                          Erstelle deinen eigenen Trainingsplan
                        </Text>
                        <View style={styles.choiceArrow}>
                          <Icon
                            name="arrow-forward"
                            size={18}
                            color={colors.textSecondary}
                          />
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.choiceCard,
                          styles.choiceCardBlue,
                          trainingMode === "trainer" &&
                            styles.choiceCardSelectedBlue,
                        ]}
                        onPress={() => setTrainingMode("trainer")}
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            styles.choiceIconWrap,
                            styles.choiceIconWrapBlue,
                          ]}
                        >
                          <Icon
                            name="fitness-center"
                            size={32}
                            color={colors.white}
                          />
                        </View>
                        <Text
                          style={[styles.choiceTitle, { color: colors.white }]}
                        >
                          Mit Trainer
                        </Text>
                        <Text
                          style={[
                            styles.choiceDescription,
                            { color: "#FFFFFFB3" },
                          ]}
                        >
                          Verbinde dich mit deinem persönlichen Trainer
                        </Text>
                        <View style={styles.choiceArrow}>
                          <Icon
                            name="arrow-forward"
                            size={18}
                            color={colors.white}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  {step === 6 ? (
                    <>
                      <Text style={styles.label}>Verifikationscode</Text>
                      <TextInput
                        style={[
                          styles.codeInput,
                          verifyError ? { borderColor: "red" } : null,
                        ]}
                        value={verificationCode}
                        onChangeText={(text) => {
                          const numbersOnly = text.replace(/[^0-9]/g, "");
                          if (numbersOnly.length <= 6) {
                            setVerificationCode(numbersOnly);
                          }
                        }}
                        keyboardType="number-pad"
                        maxLength={6}
                        placeholder="123456"
                        placeholderTextColor="#aaa"
                      />
                      {verifyError ? (
                        <Text style={styles.errorText}>{verifyError}</Text>
                      ) : null}

                      <Text style={styles.hintText}>
                        E-Mail nicht gefunden? Sieh auch im Spam-Ordner nach.
                      </Text>

                      <TouchableOpacity
                        onPress={handleResendCode}
                        style={styles.resendWrap}
                        disabled={loadingResend}
                      >
                        {loadingResend ? (
                          <ActivityIndicator
                            size="small"
                            color={colors.primaryBlue}
                          />
                        ) : (
                          <Text style={styles.resendText}>
                            Code erneut senden
                          </Text>
                        )}
                      </TouchableOpacity>
                    </>
                  ) : null}

                  {step === 7 ? (
                    <>
                      <Text style={styles.label}>Trainer-Code</Text>

                      <View
                        style={[
                          styles.inputRow,
                          trainerCodeError ? { borderColor: "red" } : null,
                        ]}
                      >
                        <View style={styles.prefixBox}>
                          <Text style={styles.prefixText}>TRN-</Text>
                        </View>
                        <TextInput
                          style={styles.codeInput}
                          value={
                            trainerCode.length > 3
                              ? `${trainerCode.slice(0, 3)}-${trainerCode.slice(3)}`
                              : trainerCode
                          }
                          onChangeText={(text) => {
                            const cleaned = text.replace(/[^0-9A-Za-z]/g, "");
                            if (cleaned.length <= 6) {
                              setTrainerCode(cleaned.toUpperCase());
                              setTrainerCodeError("");
                              setTrainer(null);
                            }
                          }}
                          placeholder="ABC-DEF"
                          placeholderTextColor="#aaa"
                          autoCapitalize="characters"
                          maxLength={7}
                        />
                        <TouchableOpacity
                          style={[
                            styles.checkButton,
                            (loadingCheck || trainerCode.length < 6) && {
                              opacity: 0.5,
                            },
                          ]}
                          onPress={handleCheckTrainerCode}
                          disabled={loadingCheck || trainerCode.length < 6}
                        >
                          {loadingCheck ? (
                            <ActivityIndicator
                              size="small"
                              color={colors.white}
                            />
                          ) : (
                            <Text style={styles.checkButtonText}>Prüfen</Text>
                          )}
                        </TouchableOpacity>
                      </View>

                      {trainerCodeError ? (
                        <Text style={styles.errorText}>{trainerCodeError}</Text>
                      ) : null}

                      {trainer && (
                        <View style={styles.trainerFound}>
                          <View style={styles.trainerAvatar}>
                            <Text style={styles.trainerAvatarText}>
                              {trainer.firstname[0]}
                              {trainer.lastname[0]}
                            </Text>
                          </View>
                          <View style={styles.trainerInfo}>
                            <Text style={styles.trainerFoundLabel}>
                              Trainer gefunden
                            </Text>
                            <Text style={styles.trainerName}>
                              {trainer.firstname} {trainer.lastname}
                            </Text>
                          </View>
                          <Icon
                            name="check-circle"
                            size={24}
                            color={colors.primaryBlue}
                          />
                        </View>
                      )}

                      <Text style={styles.hintText}>
                        Du bekommst den Code von deinem Trainer.
                      </Text>
                    </>
                  ) : null}
                </View>
              </Animated.View>

              <View style={styles.navigation}>
                <TouchableOpacity
                  style={styles.arrowButton}
                  onPress={handleBack}
                >
                  <Icon name="arrow-back" size={24} color={colors.white} />
                </TouchableOpacity>

                <ProgressDots total={6} current={step} />

                <TouchableOpacity
                  style={[styles.arrowButton, loading && { opacity: 0.5 }]}
                  onPress={handleNext}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Icon name="arrow-forward" size={24} color={colors.white} />
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </>
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

  decoCircleLarge: {
    position: "absolute",
    width: 480,
    height: 480,
    borderRadius: 999,
    backgroundColor: colors.primaryBlue,
    top: -220,
    right: -150,
    opacity: 0.08,
  },
  decoCircleSmall: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 999,
    backgroundColor: colors.accentOrange,
    top: -90,
    left: -100,
    opacity: 0.08,
  },

  topSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.screenPaddingTop,
    gap: spacing.sm,
  },
  logoWrap: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 72,
    height: 72,
  },
  ProPerform: {
    fontFamily: "Inter",
    fontSize: 36,
    fontWeight: "900",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },

  mainSection: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: spacing.xl,
  },
  mainTitle: {
    fontFamily: "Inter",
    fontSize: 48,
    fontWeight: "900",
    color: colors.textPrimary,
    lineHeight: 54,
    letterSpacing: -1,
    marginBottom: spacing.lg,
  },
  mainSubtitle: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "400",
    color: colors.textSecondary,
    lineHeight: 24,
    maxWidth: "85%",
  },

  bottomSection: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
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
    backgroundColor: "#F9FBFF",
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "#E8EEF9",
    shadowColor: "#0B3B8A",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  label: {
    ...typography.label,
    color: colors.black,
    marginBottom: 8,
    marginTop: spacing.sm,
    marginLeft: 4,
  },
  inputShell: {
    height: 58,
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
  },
  optionContainer: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  optionButton: {
    padding: spacing.md,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 16,
  },
  unitLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
    backgroundColor: "#EFF3FA",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  datePickerWrap: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#D8E1F0",
    overflow: "hidden",
    paddingVertical: spacing.xs,
  },
  datePickerCenterWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  datePicker: {
    alignSelf: "center",
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
  visibilityToggle: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  errorText: {
    ...typography.error,
    marginTop: 6,
    marginLeft: 4,
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
    color: colors.textPrimary,
    fontWeight: "600",
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingTop: spacing.md,
    paddingBottom: spacing.xl + 20,
  },
  arrowButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 999,
    paddingVertical: 18,
    paddingHorizontal: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    shadowColor: colors.primaryBlue,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  primaryButtonText: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: 1,
  },
  secondaryButton: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "500",
    color: colors.textSecondary,
  },

  // Step 5 - Choice Cards
  choiceContainer: {
    gap: spacing.md,
  },
  choiceCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  choiceCardSelected: {
    borderWidth: 2,
    borderColor: colors.primaryBlue,
  },
  choiceCardBlue: {
    backgroundColor: colors.primaryBlue,
  },
  choiceCardSelectedBlue: {
    borderWidth: 2,
    borderColor: colors.white,
  },
  choiceIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  choiceIconWrapBlue: {
    backgroundColor: "#FFFFFF29",
  },
  choiceTitle: {
    fontFamily: "Inter",
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  choiceDescription: {
    fontFamily: "Inter",
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  choiceArrow: {
    position: "absolute",
    right: spacing.lg,
    top: spacing.lg,
  },

  // Step 6 & 7 - Code Inputs
  codeInput: {
    height: 56,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    backgroundColor: "#fff",
    fontWeight: "700",
    letterSpacing: 2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
  },
  prefixBox: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: spacing.md,
    height: 56,
    justifyContent: "center",
    borderRightWidth: 2,
    borderRightColor: "#E5E7EB",
  },
  prefixText: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  checkButton: {
    backgroundColor: colors.primaryBlue,
    paddingHorizontal: spacing.md,
    height: 56,
    justifyContent: "center",
  },
  checkButtonText: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "800",
    color: colors.white,
  },
  trainerFound: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  trainerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  trainerAvatarText: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "800",
    color: colors.white,
  },
  trainerInfo: {
    flex: 1,
  },
  trainerFoundLabel: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  trainerName: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  hintText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: "center",
  },
  resendWrap: {
    alignSelf: "center",
    marginTop: spacing.sm,
  },
  resendText: {
    fontFamily: "Inter",
    fontSize: 14,
    color: colors.primaryBlue,
  },
});
