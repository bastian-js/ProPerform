import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import api from "@/src/utils/axiosInstance";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();

  const [user, setUser] = React.useState<{
    firstname: string;
    email: string;
    profile_image_url: string | null;
    created_at: string;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

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
          <View style={styles.profileIconWrap}>
            <Icon name="person" size={48} color={colors.primaryBlue} />
          </View>

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
                ? new Date(user.created_at).toLocaleDateString("de-AT", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : ""}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push("/(settings)/SettingsScreen")}
          activeOpacity={0.7}
        >
          <Icon name="settings" size={24} color={colors.primaryBlue} />
          <Text style={styles.settingsButtonText}>Einstellungen</Text>
          <Icon name="arrow-forward" size={20} color={colors.primaryBlue} />
        </TouchableOpacity>

        <Text style={styles.copyRightText}>
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

  profileIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 999,
    backgroundColor: "#EEF2F7",
    alignItems: "center",
    justifyContent: "center",
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

  copyRightText: {
    textAlign: "center",
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xl,
    fontWeight: "800",
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: "#f0f4f8",
    borderRadius: 12,
    borderColor: colors.primaryBlue,
    borderWidth: 1.5,
  },
  settingsButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginLeft: spacing.lg,
    fontFamily: "Inter",
  },
});
