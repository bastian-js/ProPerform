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
import { parseDecimal } from "@/src/utils/number";
import { Picker } from "@react-native-picker/picker";

export default function OnboardingStep4() {
  const router = useRouter();

  const [weight, setWeight] = React.useState("");
  const [height, setHeight] = React.useState("");
  const [gender, setGender] = React.useState<
    "male" | "female" | "other" | "not specified"
  >("not specified");

  const [heightError, setHeightError] = React.useState("");
  const [weightError, setWeightError] = React.useState("");

  const handleContinue = async () => {
    const newErrors = {
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

    setHeightError(newErrors.height);
    setWeightError(newErrors.weight);

    if (hasError) return;

    // checks bestanden, heightNum und weightNum können nicht null sein
    const safeHeight = heightNum as number;
    const safeWeight = weightNum as number;

    try {
      await AsyncStorage.multiSet([
        ["onboarding_height", safeHeight.toString()],
        ["onboarding_weight", safeWeight.toString()],
        ["onboarding_gender", gender],
      ]);

      router.push("../(onboarding)/OnboardingStep5");
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
              ></InputField>

              {heightError ? (
                <Text style={styles.errorText}>{heightError}</Text>
              ) : null}

              <InputField
                title="Gewicht (kg)"
                value={weight}
                placeholder="z.B. 80.7"
                onChange={setWeight}
              ></InputField>

              {weightError ? (
                <Text style={styles.errorText}>{weightError}</Text>
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
          </ScrollView>
        </TouchableWithoutFeedback>
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.arrowButton} onPress={handleBack}>
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>

          <ProgressDots total={6} current={3} />

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
  labelPicker: {
    ...typography.label,
    color: colors.black,
    marginBottom: 8,
    marginLeft: 4,
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
});
