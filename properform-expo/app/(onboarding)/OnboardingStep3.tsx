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

export default function OnboardingStep3() {
  const router = useRouter();

  const [birthDate, setBirthDate] = React.useState("");
  const [birthDateError, setBirthDateError] = React.useState("");

  const handleContinue = async () => {
    const newErrors = {
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
    setBirthDateError(newErrors.birthDate);
    if (hasError) return;

    try {
      await AsyncStorage.setItem("onboarding_birthDate", birthDate);

      router.push("../(onboarding)/OnboardingStep4");
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Fehler",
        error.response?.data?.error || "Speichern fehlgeschlagen.",
      );
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
              ></InputField>

              {birthDateError ? (
                <Text style={styles.errorText}>{birthDateError}</Text>
              ) : null}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.arrowButton} onPress={handleBack}>
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>

          <ProgressDots total={6} current={2} />

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
