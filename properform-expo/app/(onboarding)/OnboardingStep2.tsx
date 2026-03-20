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

export default function OnboardingStep2() {
  const router = useRouter();

  const [firstName, setFirstName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordRepeat, setPasswordRepeat] = React.useState("");
  const [email, setEmail] = React.useState("");

  const [errors, setErrors] = React.useState({
    firstName: "",
    password: "",
    passwordRepeat: "",
    email: "",
  });

  const handleContinue = async () => {
    const newErrors = {
      firstName: "",
      password: "",
      passwordRepeat: "",
      email: "",
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
    if (hasError) return;

    try {
      await AsyncStorage.setItem("onboarding_firstName", firstName);
      await AsyncStorage.setItem("onboarding_email", email);
      await AsyncStorage.setItem("onboarding_password", password);

      router.push("../(onboarding)/OnboardingStep3");
    } catch (error: any) {
      console.error(error);
      Alert.alert("Fehler", "Speichern fehlgeschlagen.");
    }
  };

  const handleBack = () => {
    router.back();
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
          </ScrollView>
        </TouchableWithoutFeedback>
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.arrowButton} onPress={handleBack}>
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>

          <ProgressDots total={6} current={1} />

          <TouchableOpacity style={styles.arrowButton} onPress={handleContinue}>
            <Icon name="arrow-forward" size={24} color={colors.white} />
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
