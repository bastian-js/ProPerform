import { Stack, useRouter } from "expo-router";
import { OnboardingContext } from "../src/context/OnboardingContext";

export default function RootLayout() {
  const router = useRouter();

  return (
    <OnboardingContext.Provider
      value={{
        finishOnboarding: () => router.replace("/(tabs)/HomeScreen"),
        resetOnboarding: () => router.replace("/(onboarding)/OnboardingScreen"),
      }}
    >
      <Stack screenOptions={{ headerShown: false }} />
    </OnboardingContext.Provider>
  );
}
