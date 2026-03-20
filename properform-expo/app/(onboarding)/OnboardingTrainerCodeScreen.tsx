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
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/src/components/header";
import ProgressDots from "@/src/components/ProgressDots";
import { useRouter } from "expo-router";
import { typography } from "@/src/theme/typography";
import { spacing } from "@/src/theme/spacing";
import { colors } from "@/src/theme/colors";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import api from "@/src/utils/axiosInstance";

export default function OnboardingTrainerCodeScreen() {
  const router = useRouter();

  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [loadingConnect, setLoadingConnect] = React.useState(false);
  const [trainer, setTrainer] = React.useState<{
    tid: number;
    firstname: string;
    lastname: string;
  } | null>(null);
  const [error, setError] = React.useState("");

  const handleBack = () => {
    router.back();
  };

  const handleCheckCode = async () => {
    if (code.length < 6) {
      setError("Bitte gib einen gültigen Code ein.");
      return;
    }
    setError("");
    setTrainer(null);
    try {
      setLoading(true);
      const inviteCode = `TRN-${code.slice(0, 3)}-${code.slice(3)}`;
      const response = await axios.post(
        "https://api.properform.app/trainers/check-invite-code",
        { invite_code: inviteCode },
      );
      if (response.data.success) {
        setTrainer(response.data.trainer);
      } else {
        setError("Ungültiger Einladungscode.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Etwas ist schiefgelaufen.");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setLoadingConnect(true);
      const inviteCode = `TRN-${code.slice(0, 3)}-${code.slice(3)}`;
      await api.post("/trainers/connect", { invite_code: inviteCode });
      router.push("../(onboarding)/VerifyEmailScreen");
    } catch (err: any) {
      console.log("STATUS:", err.response?.status);
      console.log("DATA:", err.response?.data);
      Alert.alert(
        "Fehler",
        err.response?.data?.error || "Verbindung fehlgeschlagen.",
      );
    } finally {
      setLoadingConnect(false);
    }
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
              <Text style={typography.title}>Trainer verbinden</Text>
              <Text style={[typography.body, styles.subheader]}>
                Gib den Code deines Trainers ein
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Trainer-Code</Text>

              <View
                style={[styles.inputRow, error ? { borderColor: "red" } : null]}
              >
                <View style={styles.prefixBox}>
                  <Text style={styles.prefixText}>TRN-</Text>
                </View>
                <TextInput
                  style={styles.codeInput}
                  value={
                    code.length > 3
                      ? `${code.slice(0, 3)}-${code.slice(3)}`
                      : code
                  }
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9A-Za-z]/g, "");
                    if (cleaned.length <= 6) {
                      setCode(cleaned.toUpperCase());
                      setError("");
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
                    (loading || code.length < 6) && { opacity: 0.5 },
                  ]}
                  onPress={handleCheckCode}
                  disabled={loading || code.length < 6}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.checkButtonText}>Prüfen</Text>
                  )}
                </TouchableOpacity>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
            </View>

            <Text style={styles.hintText}>
              Du bekommst den Code von deinem Trainer.
            </Text>

            <View style={styles.navigation}>
              <TouchableOpacity style={styles.arrowButton} onPress={handleBack}>
                <Icon name="arrow-back" size={24} color={colors.white} />
              </TouchableOpacity>

              <ProgressDots total={6} current={5} />

              <TouchableOpacity
                style={[
                  styles.arrowButton,
                  (!trainer || loadingConnect) && { opacity: 0.4 },
                ]}
                onPress={handleConnect}
                disabled={!trainer || loadingConnect}
              >
                {loadingConnect ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Icon name="arrow-forward" size={24} color={colors.white} />
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
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
    gap: spacing.sm,
    shadowColor: colors.black,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  label: {
    ...typography.label,
    color: colors.black,
    marginBottom: 4,
    marginLeft: 4,
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
  codeInput: {
    flex: 1,
    height: 56,
    paddingHorizontal: spacing.md,
    fontSize: 18,
    fontFamily: "Inter",
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: 2,
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
  errorText: {
    fontFamily: "Inter",
    fontSize: 13,
    color: "red",
    marginLeft: 4,
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
    marginTop: spacing.sm,
    textAlign: "center",
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: spacing.lg,
    marginTop: "auto",
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
