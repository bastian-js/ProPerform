import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEV_MODE_STATUS = false;

export default function Index() {
  const [finished, setFinished] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const value = await AsyncStorage.getItem("onboardingFinished");
      setFinished(value === "true");
    })();
  }, []);

  if (finished === null) return null;

  if (__DEV__ && DEV_MODE_STATUS) {
    return <Redirect href="/dev-menu" />;
  }

  return finished ? (
    <Redirect href="/(tabs)/HomeScreen" />
  ) : (
    <Redirect href="/(onboarding)/OnboardingScreen" />
  );
}
