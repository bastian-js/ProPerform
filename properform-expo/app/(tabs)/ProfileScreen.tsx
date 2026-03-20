import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SecondaryButton from "@/src/components/secondaryButton";
import { useRouter } from "expo-router";
import { spacing } from "@/src/theme/spacing";
import { colors } from "@/src/theme/colors";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import api from "@/src/utils/axiosInstance";

export default function ProfileScreen() {
  const router = useRouter();

  const [user, setUser] = React.useState<{
    firstname: string;
    email: string;
    profile_image_url: string | null;
    created_at: string;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadingResetPassword, setLoadingResetPassword] = React.useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await api.get("/users/me");
        setUser(response.data);
      } catch (err) {
        console.log("Fehler beim Laden des Profils:", err);
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  const handleResetPassword = async () => {
    if (loadingResetPassword) return;

    try {
      setLoadingResetPassword(true);
      await axios.post("https://api.properform.app/auth/reset-password", {
        email: user?.email,
      });
      Alert.alert("Erfolg", "Wir haben dir einen Link per Email geschickt!");
    } catch (err: any) {
      Alert.alert(
        "Fehler",
        err.response?.data?.error ||
          "Etwas ist schiefgelaufen, versuch es nochmal.",
      );
    } finally {
      setLoadingResetPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("refresh_token");
      await SecureStore.deleteItemAsync("user_id");

      console.log("Logout erfolgreich");

      router.replace("../(auth)/LoginScreen");
    } catch {
      console.log("Fehler Logout", "Logout fehgeschlagen");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: 30,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSection}>
          <Image
            source={
              user?.profile_image_url
                ? { uri: user.profile_image_url }
                : require("../../assets/images/profile_picture.png")
            }
            resizeMode="contain"
            style={styles.profileImage}
          />

          <View>
            <Text style={styles.goodMorning}>Guten Morgen,</Text>
            <Text style={styles.hello}>{user?.firstname ?? "..."}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>PERSÖNLICHE INFORMATIONEN</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Benutzername</Text>
            <Text style={styles.value}>{user?.firstname ?? "..."}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email ?? "..."}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.label}>Trainiert seit</Text>
            <Text style={styles.value}>
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("de-AT")
                : ""}
            </Text>
          </View>
        </View>

        <View style={styles.changePasswordWrap}>
          <SecondaryButton
            onPress={handleResetPassword}
            text={loadingResetPassword ? "Wird gesendet..." : "Passwort ändern"}
            icon={
              loadingResetPassword ? (
                <ActivityIndicator size="small" color={colors.primaryBlue} />
              ) : undefined
            }
          />
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutWrap}>
          <Text style={styles.logoutText}>Abmelden</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: spacing.screenPaddingTop,
  },
  containerImage: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  infoCard: {
    marginTop: 30,
    padding: 20,
    borderWidth: 2,
    borderColor: "#A0A0A0",
    borderRadius: 15,
    backgroundColor: "#fff",
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoCardLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  seperator: {
    height: 1,
    backgroundColor: "#A0A0A0",
    marginVertical: 20,
    width: "100%",
  },
  logoutButton: {
    backgroundColor: "#D32F2F",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },

  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 999,
    marginRight: spacing.lg,
  },

  goodMorning: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    color: colors.textSecondary,
    fontFamily: "Inter",
  },

  hello: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.textPrimary,
    fontFamily: "Inter",
  },

  subline: {
    marginTop: spacing.xs,
    fontSize: 16,
    color: colors.borderGray,
    fontFamily: "Inter",
  },
  infoSection: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 2,
    color: colors.borderGray,
    marginBottom: spacing.lg,
    fontFamily: "Inter",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },

  label: {
    fontSize: 18,
    color: colors.textSecondary,
    fontFamily: "Inter",
  },

  value: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    fontFamily: "Inter",
  },

  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },

  changePasswordWrap: {
    marginBottom: spacing.lg,
  },

  logoutWrap: {
    alignItems: "center",
  },

  logoutText: {
    fontSize: 16,
    color: "#EF4444",
    fontFamily: "Inter",
  },
});
