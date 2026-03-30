import Header from "@/src/components/header";
import ProgressDots from "@/src/components/ProgressDots";
import { OnboardingContext } from "@/src/context/OnboardingContext";
import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { finishOnboarding } = useContext(OnboardingContext);
  const { width, height: screenHeight } = useWindowDimensions();
  const isCompact = width < 380 || screenHeight < 750;

  const [email, setEmail] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);

  useEffect(() => {
    async function loadEmail() {
      const storedEmail = await AsyncStorage.getItem("onboarding_email");
      setEmail(storedEmail);
    }
    loadEmail();
  }, []);

  const handleVerify = async () => {
    setError("");

    // doppelter Schutz (sollte nicht eintreten)
    if (code.length !== 6) {
      setError("Der Code muss 6-stellig sein.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        "https://api.properform.app/auth/check-verification-code",
        {
          email,
          code,
        },
      );

      await AsyncStorage.setItem("onboardingFinished", "true");
      finishOnboarding();
      router.replace("../(tabs)/HomeScreen");
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Bitte gib den richtigen Code ein.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoadingResend(true);
      await axios.post(
        "https://api.properform.app/auth/resend-verification-code",
        {
          email,
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

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "height" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isCompact ? styles.scrollContentCompact : null,
          ]}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "none"}
        >
          <View
            style={[styles.header, isCompact ? styles.headerCompact : null]}
          >
            <Text style={typography.title}>E-Mail bestätigen</Text>
            <Text style={[typography.body, styles.subheader]}>
              Gib den 6-stelligen Code ein
            </Text>
          </View>

          <View style={[styles.card, isCompact ? styles.cardCompact : null]}>
            <Text style={styles.label}>Verifikationscode</Text>

            <TextInput
              style={[styles.input, error ? { borderColor: "red" } : null]}
              value={code}
              onChangeText={(text) => {
                const numbersOnly = text.replace(/[^0-9]/g, "");
                if (numbersOnly.length <= 6) {
                  setCode(numbersOnly);
                }
              }}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="123456"
              placeholderTextColor="#aaa"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <Text style={styles.hintText}>
            E-Mail nicht gefunden? Sieh auch im Spam-Ordner nach.
          </Text>

          <TouchableOpacity
            onPress={handleResend}
            style={styles.resendWrap}
            disabled={loadingResend}
          >
            {loadingResend ? (
              <ActivityIndicator size="small" color={colors.primaryBlue} />
            ) : (
              <Text style={styles.resendText}>Code erneut senden</Text>
            )}
          </TouchableOpacity>

          <View
            style={[
              styles.navigation,
              isCompact ? styles.navigationCompact : null,
            ]}
          >
            <TouchableOpacity style={styles.arrowButton} onPress={handleBack}>
              <Icon name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>

            <ProgressDots total={6} current={6} />

            <TouchableOpacity
              style={[
                styles.arrowButton,
                (code.length !== 6 || loading) && { opacity: 0.4 },
              ]}
              onPress={handleVerify}
              disabled={code.length !== 6 || loading}
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
  scrollContentCompact: {
    paddingTop: spacing.sm,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerCompact: {
    marginBottom: spacing.md,
  },
  subheader: {
    fontSize: 18,
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardCompact: {
    padding: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.black,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 56,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    backgroundColor: "#fff",
  },
  errorText: {
    ...typography.error,
    marginTop: 6,
    marginLeft: 4,
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingTop: spacing.md,
    paddingBottom: spacing.xl + 20,
  },
  navigationCompact: {
    paddingBottom: spacing.xl,
  },
  arrowButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryBlue,
    alignItems: "center",
    justifyContent: "center",
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
