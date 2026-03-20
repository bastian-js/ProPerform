import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { spacing } from "@/src/theme/spacing";
import { colors } from "@/src/theme/colors";
import { MaterialIcons as Icon } from "@expo/vector-icons";

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.decoCircleLarge} />
      <View style={styles.decoCircleSmall} />
      {/* wird eventuell verändert durch logo oder was anderem */}
      <View style={styles.topSection}>
        <View style={styles.logoWrap}>
          <Icon name="fitness-center" size={36} color={colors.white} />
        </View>
        <Text style={styles.ProPerform}>ProPerform</Text>
      </View>
      <View style={styles.mainSection}>
        <Text style={styles.mainTitle}>
          Trainiere{"\n"}smarter.{"\n"}Nicht harder.
        </Text>
        <Text style={styles.mainSubtitle}>
          Erstelle dein Profil und werde die beste Version von dir.
        </Text>
      </View>
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/(onboarding)/OnboardingStep2")}
        >
          <Text style={styles.primaryButtonText}>LOS GEHT'S</Text>
          <Icon name="arrow-forward" size={20} color={colors.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/(auth)/LoginScreen")}
        >
          <Text style={styles.secondaryButtonText}>
            Bereits ein Konto? Anmelden
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screenPaddingHorizontal,
  },

  decoCircleLarge: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: 999,
    backgroundColor: colors.primaryBlue,
    top: -180,
    right: -120,
    opacity: 0.08,
  },
  decoCircleSmall: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 999,
    backgroundColor: colors.accentOrange,
    top: -60,
    left: -80,
    opacity: 0.08,
  },

  topSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.screenPaddingTop,
    gap: spacing.sm,
  },
  logoWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primaryBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  ProPerform: {
    fontFamily: "Inter",
    fontSize: 22,
    fontWeight: "900",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },

  mainSection: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: spacing.xl,
  },
  mainTitle: {
    fontFamily: "Inter",
    fontSize: 48,
    fontWeight: "900",
    color: colors.textPrimary,
    lineHeight: 54,
    letterSpacing: -1,
    marginBottom: spacing.lg,
  },
  mainSubtitle: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "400",
    color: colors.textSecondary,
    lineHeight: 24,
    maxWidth: "85%",
  },

  bottomSection: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 999,
    paddingVertical: 18,
    paddingHorizontal: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    shadowColor: colors.primaryBlue,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  primaryButtonText: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: 1,
  },
  secondaryButton: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "500",
    color: colors.textSecondary,
  },
});
