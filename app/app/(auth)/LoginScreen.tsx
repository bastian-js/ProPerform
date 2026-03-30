import Header from "@/src/components/header";
import InputField from "@/src/components/input";
import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const { width, height: screenHeight } = useWindowDimensions();
  const isCompact = width < 380 || screenHeight < 750;

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [stayLoggedIn, setStayLoggedIn] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleForgotPassword = () => {
    if (!email.trim()) {
      Alert.alert("Fehler", "Bitte gib zuerst deine E-Mail im Feld ein.");
      return;
    }

    Alert.alert(
      "Bestätigung",
      `Falls ein Account mit ${email.trim().toLowerCase()} existiert, wurde eine Zurücksetzung angefordert.`,
    );
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        "https://api.properform.app/auth/login",
        {
          email: email.trim().toLowerCase(),
          password,
          stayLoggedIn,
        },
      );

      const { access_token, refresh_token, uid } = response.data;
      console.log("Login success for UID:", uid);

      // await AsyncStorage.setItem("auth_token", token);
      // await AsyncStorage.setItem("user_id", String(uid));
      // ^ switch to secure store for sensitive data
      await SecureStore.setItemAsync("access_token", String(access_token));
      await SecureStore.setItemAsync("refresh_token", String(refresh_token));
      await SecureStore.setItemAsync("user_id", String(uid));

      if (stayLoggedIn) await AsyncStorage.setItem("stay_logged_in", "true");

      await AsyncStorage.setItem("onboardingFinished", "true");

      router.replace("/(tabs)/HomeScreen");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
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
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "none"}
        >
          <View
            style={[
              styles.headerSection,
              isCompact ? styles.headerSectionCompact : null,
            ]}
          >
            <Text style={typography.title}>Willkommen zurück</Text>
            <Text style={[typography.body, styles.subheader]}>
              Melde dich mit deinem Account an
            </Text>
          </View>

          <View style={[styles.card, isCompact ? styles.cardCompact : null]}>
            <InputField
              title="E-Mail"
              value={email}
              placeholder="max@beispiel.at"
              onChange={setEmail}
            />
            <InputField
              title="Passwort"
              value={password}
              placeholder="********"
              onChange={setPassword}
            />
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setStayLoggedIn(!stayLoggedIn)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  stayLoggedIn && styles.checkboxChecked,
                ]}
              >
                {stayLoggedIn && (
                  <Icon name="check" size={16} color={colors.white} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Angemeldet bleiben</Text>
            </TouchableOpacity>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPasswordWrap}
            >
              <Text style={styles.forgotPasswordText}>Passwort vergessen?</Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.navigation,
              isCompact ? styles.navigationCompact : null,
            ]}
          >
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("../(onboarding)/OnboardingScreen");
                }
              }}
            >
              <Icon name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.arrowButton, loading && { opacity: 0.5 }]}
              onPress={handleLogin}
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
  headerSection: {
    marginBottom: spacing.lg,
  },
  headerSectionCompact: {
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
    gap: spacing.sm,
    shadowColor: colors.black,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardCompact: {
    padding: spacing.sm,
    gap: spacing.xs,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primaryBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: colors.primaryBlue,
  },
  checkboxLabel: {
    ...typography.body,
    fontSize: 14,
  },
  errorText: {
    ...typography.error,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: spacing.lg,
    marginTop: "auto",
    paddingTop: spacing.lg,
  },
  navigationCompact: {
    paddingBottom: spacing.md,
    paddingTop: spacing.md,
  },
  arrowButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  forgotPasswordWrap: {
    alignSelf: "flex-end",
    marginTop: spacing.xs,
  },

  forgotPasswordText: {
    fontFamily: "Inter",
    fontSize: 14,
    color: colors.primaryBlue,
  },
});
