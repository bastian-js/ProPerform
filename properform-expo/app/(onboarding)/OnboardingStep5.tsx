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
import ProgressDots from "@/src/components/ProgressDots";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { typography } from "@/src/theme/typography";
import { spacing } from "@/src/theme/spacing";
import { colors } from "@/src/theme/colors";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

export default function OnboardingStep5() {
  const router = useRouter();

  const LOG_PREFIX = "[OnboardingStep5]";

  const [fitnessLevel, setFitnessLevel] = React.useState("");
  const [trainingFrequency, setTrainingFrequency] = React.useState<number | "">(
    "",
  );
  const [primaryGoal, setPrimaryGoal] = React.useState("");
  const [stayLoggedIn, setStayLoggedIn] = React.useState(false);

  const [errors, setErrors] = React.useState({
    fitnessLevel: "",
    trainingFrequency: "",
    primaryGoal: "",
  });

  const [loading, setLoading] = React.useState(false);

  const submitOnboarding = async () => {
    let requestBodyForLog: Record<string, unknown> | null = null;

    console.log(`${LOG_PREFIX} submitOnboarding called`, {
      fitnessLevel,
      trainingFrequency,
      primaryGoal,
      stayLoggedIn,
    });

    const newErrors = {
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
      newErrors.primaryGoal = "Bitte wähle deine primäres Ziel.";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) {
      console.log(`${LOG_PREFIX} validation failed`, newErrors);
      return;
    }

    try {
      setLoading(true);
      console.log(
        `${LOG_PREFIX} loading=true, starting persistence + register`,
      );

      await AsyncStorage.multiSet([
        ["onboarding_fitnessLevel", fitnessLevel],
        ["onboarding_trainingFrequency", trainingFrequency.toString()],
        ["onboarding_primaryGoal", primaryGoal],
      ]);
      console.log(
        `${LOG_PREFIX} onboarding step values persisted in AsyncStorage`,
      );

      const entries = await AsyncStorage.multiGet([
        "onboarding_firstName",
        "onboarding_email",
        "onboarding_password",
        "onboarding_birthDate",
        "onboarding_height",
        "onboarding_weight",
        "onboarding_gender",
      ]);

      const data = Object.fromEntries(entries);
      console.log(`${LOG_PREFIX} loaded onboarding base data`, {
        onboarding_firstName: data.onboarding_firstName,
        onboarding_email: data.onboarding_email,
        onboarding_password_present: Boolean(data.onboarding_password),
        onboarding_password_length: data.onboarding_password?.length ?? 0,
        onboarding_birthDate: data.onboarding_birthDate,
        onboarding_height: data.onboarding_height,
        onboarding_weight: data.onboarding_weight,
        onboarding_gender: data.onboarding_gender,
      });

      if (
        !data.onboarding_firstName ||
        !data.onboarding_email ||
        !data.onboarding_password ||
        !data.onboarding_birthDate ||
        !data.onboarding_height ||
        !data.onboarding_weight ||
        !data.onboarding_gender
      ) {
        console.log(`${LOG_PREFIX} missing onboarding data`, data);
        Alert.alert("Fehler", "Onboarding-Daten fehlen.");
        return;
      }

      const requestBody = {
        firstname: data.onboarding_firstName,
        birthdate: data.onboarding_birthDate,
        email: data.onboarding_email,
        password: data.onboarding_password,
        weight: Number(data.onboarding_weight),
        height: Number(data.onboarding_height),
        gender: data.onboarding_gender,
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
      console.log(`${LOG_PREFIX} register request body`, {
        ...requestBodyForLog,
      });

      console.log(`${LOG_PREFIX} sending POST /auth/register`);
      const response = await axios.post(
        "https://api.properform.app/auth/register",
        requestBody,
      );
      console.log(`${LOG_PREFIX} register success`, {
        status: response.status,
        hasAccessToken: Boolean(response.data?.access_token),
        hasRefreshToken: Boolean(response.data?.refresh_token),
        uid: response.data?.uid,
      });

      const { access_token, refresh_token, uid } = response.data;

      // await AsyncStorage.setItem("auth_token", token);
      // await AsyncStorage.setItem("user_id", String(uid));
      await SecureStore.setItemAsync("access_token", String(access_token));
      await SecureStore.setItemAsync("refresh_token", String(refresh_token));
      await SecureStore.setItemAsync("user_id", String(uid));
      await AsyncStorage.removeItem("onboarding_password");
      console.log(`${LOG_PREFIX} tokens saved, onboarding password removed`);

      router.push("../(onboarding)/OnboardingTrainingModeScreen");
      console.log(`${LOG_PREFIX} navigated to OnboardingTrainingModeScreen`);
    } catch (error: any) {
      console.log(`${LOG_PREFIX} register failed`, {
        message: error?.message,
        code: error?.code,
        name: error?.name,
      });

      if (error.response) {
        console.log("STATUS:", error.response.status);
        console.log("DATA:", error.response.data);
        console.log("HEADERS:", error.response.headers);
        console.log("REQUEST URL:", error.config?.url);
        console.log("REQUEST METHOD:", error.config?.method);
        console.log("REQUEST BODY:", requestBodyForLog);

        Alert.alert("Serverfehler bei der Registrierung");
      } else {
        console.log("ERROR:", error.message);
        console.log("NETWORK/UNKNOWN ERROR FULL:", error);
        Alert.alert(
          "Keine Antwort vom Server. Bitte überprüfe deine Internetverbindung.",
        );
      }
    } finally {
      setLoading(false);
      console.log(`${LOG_PREFIX} loading=false`);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header></Header>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
          >
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
          </ScrollView>
        </TouchableWithoutFeedback>
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.arrowButton} onPress={handleBack}>
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>

          <ProgressDots total={6} current={4} />

          <TouchableOpacity
            style={[styles.arrowButton, loading && { opacity: 0.5 }]}
            onPress={submitOnboarding}
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
    marginTop: 6,
    marginLeft: spacing.xs,
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
});
