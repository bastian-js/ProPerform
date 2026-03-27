import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const DEV_MODE_STATUS = false;

export default function Index() {
  const [status, setStatus] = useState<
    "loading" | "home" | "login" | "onboarding" | "dev"
  >("loading");

  useEffect(() => {
    (async () => {
      if (__DEV__ && DEV_MODE_STATUS) {
        setStatus("dev");
        return;
      }

      const token = await SecureStore.getItemAsync("access_token");
      if (token) {
        setStatus("home");
        return;
      }

      const value = await AsyncStorage.getItem("onboardingFinished");
      if (value === "true") {
        setStatus("login");
      } else {
        setStatus("onboarding");
      }
    })();
  }, []);

  if (status === "loading") return null;
  if (status === "dev") return <Redirect href="/dev-menu" />;
  if (status === "home") return <Redirect href="/(tabs)/HomeScreen" />;
  if (status === "login") return <Redirect href="/(auth)/LoginScreen" />;
  return <Redirect href="/(onboarding)/OnboardingScreen" />;
}
