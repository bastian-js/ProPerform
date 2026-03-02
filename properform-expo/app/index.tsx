import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEV_MODE_STATUS = true; // false setzen für normal, true dev mode

export default function Index() {
  const [ready, setReady] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    (async () => {
      const value = await AsyncStorage.getItem("onboardingFinished");
      setFinished(value === "true");
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  if (__DEV__ && DEV_MODE_STATUS) {
    return <Redirect href="/dev-menu" />;
  }

  if (!finished) {
    return <Redirect href="/(onboarding)/OnboardingScreen" />;
  }

  return <Redirect href="/(tabs)/HomeScreen" />;
}
