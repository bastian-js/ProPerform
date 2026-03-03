import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/src/components/header";
import SecondaryButton from "@/src/components/secondaryButton";
import { useRouter } from "expo-router";
import { typography } from "@/src/theme/typography";
import { spacing } from "@/src/theme/spacing";
import { colors } from "@/src/theme/colors";

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        <Header />
        <Text style={typography.title}>Willkommen bei {"\n"}ProPerform</Text>
        <Text style={[typography.body, { marginTop: spacing.lg }]}>
          Erstelle dein Trainingsprofil um einen passenden Trainingsplan zu
          erhalten und direkt loszulegen!
        </Text>

        <SecondaryButton
          text="LOS GEHT'S!"
          onPress={() => {
            router.push("/(onboarding)/OnboardingStep2");
          }}
        />

        <Text style={[typography.secondary, { marginTop: spacing.lg }]}>
          Haben Sie bereits ein Konto?
        </Text>

        <SecondaryButton
          text="ANMELDEN"
          color="#ff984fff"
          onPress={() => {
            router.push("/(auth)/LoginScreen");
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: spacing.screenPaddingTop,
  },
});
