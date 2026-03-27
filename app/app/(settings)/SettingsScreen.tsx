import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

  const clearUserSessionData = async () => {
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
    await SecureStore.deleteItemAsync("user_id");
    await SecureStore.deleteItemAsync("push_token");

    await AsyncStorage.multiRemove([
      "onboarding_email",
      "stay_logged_in",
      "home_streak_last_visit",
      "home_streak_current",
      "home_streak_week_visits",
      "last_workout",
    ]);
  };

  const handleLogout = () => {
    Alert.alert(
      "Abmelden",
      "Möchtest du dich wirklich abmelden? Streak und letztes Workout werden gelöscht.",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Abmelden",
          style: "destructive",
          onPress: async () => {
            await clearUserSessionData();
            router.replace("/(auth)/LoginScreen");
          },
        },
      ],
    );
  };

  const handlePasswordReset = async () => {
    const storedEmail = await AsyncStorage.getItem("onboarding_email");

    try {
      const passwordRes = await axios.post(
        "https://api.properform.app/auth/reset-password",
        {
          email: storedEmail,
        },
      );

      if (passwordRes.status === 500) {
        return Alert.alert(
          "Fehler",
          "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.",
        );
      }

      Alert.alert(
        "Passwort zurücksetzen",
        "Anweisungen zum Zurücksetzen wurden gesendet.",
      );
    } catch (err: any) {
      console.log(err.message);

      Alert.alert(
        "Fehler",
        "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.",
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Einstellungen</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KONTO</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/(settings)/EditProfileScreen")}
          >
            <View style={styles.settingLeft}>
              <Icon name="person" size={22} color={colors.primaryBlue} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Profil bearbeiten</Text>
                <Text style={styles.settingDescription}>
                  Deine persönlichen Daten
                </Text>
              </View>
            </View>
            <Icon name="arrow-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handlePasswordReset}
          >
            <View style={styles.settingLeft}>
              <Icon name="lock" size={22} color={colors.primaryBlue} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Passwort ändern</Text>
                <Text style={styles.settingDescription}>
                  Ändere dein Passwort
                </Text>
              </View>
            </View>
            <Icon name="arrow-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BENACHRICHTIGUNGEN</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="notifications" size={22} color={colors.primaryBlue} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Push-Benachrichtigungen</Text>
                <Text style={styles.settingDescription}>
                  Erhalte Training-Updates
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              thumbColor={notificationsEnabled ? colors.primaryBlue : "#ccc"}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="mail" size={22} color={colors.primaryBlue} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>
                  Email-Benachrichtigungen
                </Text>
                <Text style={styles.settingDescription}>
                  Wichtige Updates per Email
                </Text>
              </View>
            </View>
            <Switch
              disabled={true}
              value={false}
              onValueChange={() => {}}
              thumbColor="#ccc"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DARSTELLUNG</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="dark-mode" size={22} color={colors.primaryBlue} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Dunkler Modus</Text>
                <Text style={styles.settingDescription}>Design bevorzugen</Text>
              </View>
            </View>
            <Switch
              value={darkModeEnabled}
              disabled={true}
              onValueChange={setDarkModeEnabled}
              thumbColor={darkModeEnabled ? colors.primaryBlue : "#ccc"}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPORT</Text>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="help" size={22} color={colors.primaryBlue} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Hilfe & Support</Text>
                <Text style={styles.settingDescription}>
                  Häufig gestellte Fragen
                </Text>
              </View>
            </View>
            <Icon name="arrow-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="info" size={22} color={colors.primaryBlue} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Über ProPerform</Text>
                <Text style={styles.settingDescription}>Version 1.0.0</Text>
              </View>
            </View>
            <Icon name="arrow-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Icon name="logout" size={22} color={colors.white} />
            <Text style={styles.logoutText}>Abmelden</Text>
            <Icon name="arrow-forward" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          ProPerform © {new Date().getFullYear()}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  content: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.lg,
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
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    fontFamily: "Inter",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  settingLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    fontFamily: "Inter",
  },
  settingDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontFamily: "Inter",
  },
  logoutSection: {
    marginBottom: spacing.xl,
  },
  logoutButton: {
    backgroundColor: "#DC2626",
    borderRadius: 16,
    minHeight: 58,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#991B1B",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.white,
    fontFamily: "Inter",
    flex: 1,
    marginLeft: spacing.md,
  },
  footer: {
    textAlign: "center",
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    fontWeight: "600",
    fontFamily: "Inter",
  },
});
