import { Stack, useRouter } from "expo-router";
import { OnboardingContext } from "../src/context/OnboardingContext";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  const router = useRouter();

  return (
    <OnboardingContext.Provider
      value={{
        finishOnboarding: () => router.replace("/(tabs)/HomeScreen"),
      }}
    >
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </OnboardingContext.Provider>
  );
}
