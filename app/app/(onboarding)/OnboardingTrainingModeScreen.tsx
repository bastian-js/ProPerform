import Header from "@/src/components/header";
import ProgressDots from "@/src/components/ProgressDots";
import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingTrainingModeScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={typography.title}>Wie möchtest du trainieren?</Text>
          <Text style={[typography.body, styles.subheader]}>
            Du kannst das jederzeit später ändern
          </Text>
        </View>

        <View style={styles.choiceContainer}>
          <TouchableOpacity
            style={styles.choiceCard}
            onPress={() => router.push("/(onboarding)/VerifyEmailScreen")}
            activeOpacity={0.8}
          >
            <View style={styles.choiceIconWrap}>
              <Icon name="person" size={32} color={colors.primaryBlue} />
            </View>
            <Text style={styles.choiceTitle}>Alleine trainieren</Text>
            <Text style={styles.choiceDescription}>
              Erstelle deinen eigenen Trainingsplan
            </Text>
            <View style={styles.choiceArrow}>
              <Icon
                name="arrow-forward"
                size={18}
                color={colors.textSecondary}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.choiceCard, styles.choiceCardBlue]}
            onPress={() =>
              router.push("../(onboarding)/OnboardingTrainerCodeScreen")
            }
            activeOpacity={0.8}
          >
            <View style={[styles.choiceIconWrap, styles.choiceIconWrapBlue]}>
              <Icon name="fitness-center" size={32} color={colors.white} />
            </View>
            <Text style={[styles.choiceTitle, { color: colors.white }]}>
              Mit Trainer
            </Text>
            <Text style={[styles.choiceDescription, { color: "#FFFFFFB3" }]}>
              Verbinde dich mit deinem persönlichen Trainer
            </Text>
            <View style={styles.choiceArrow}>
              <Icon name="arrow-forward" size={18} color={colors.white} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.navigation}>
          <TouchableOpacity style={styles.arrowButton} onPress={handleBack}>
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>

          <ProgressDots total={6} current={5} />

          <View style={{ width: 56 }} />
        </View>
      </ScrollView>
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
  choiceContainer: {
    gap: spacing.md,
  },
  choiceCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  choiceCardBlue: {
    backgroundColor: colors.primaryBlue,
  },
  choiceIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  choiceIconWrapBlue: {
    backgroundColor: "#FFFFFF29",
  },
  choiceTitle: {
    fontFamily: "Inter",
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  choiceDescription: {
    fontFamily: "Inter",
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  choiceArrow: {
    position: "absolute",
    right: spacing.lg,
    top: spacing.lg,
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingTop: spacing.md,
    paddingBottom: spacing.xl + 20,
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
