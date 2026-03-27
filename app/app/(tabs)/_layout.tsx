import { MaterialIcons as Icon } from "@expo/vector-icons";
import axios from "axios";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Tabs } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function TabLayout() {
  useEffect(() => {
    console.log("🚀 TabLayout mounted");

    const registerPush = async () => {
      try {
        console.log("🔔 Starting push registration...");

        const projectId = Constants.expoConfig?.extra?.eas?.projectId;

        console.log("📦 projectId:", projectId);

        const { status } = await Notifications.getPermissionsAsync();
        console.log("📋 Current permission status:", status);

        let finalStatus = status;

        if (status !== "granted") {
          console.log("🟡 Requesting permission...");
          const request = await Notifications.requestPermissionsAsync();
          finalStatus = request.status;
          console.log("📋 New permission status:", finalStatus);
        }

        if (finalStatus !== "granted") {
          console.log("❌ Permission not granted. Stopping.");
          return;
        }

        console.log("✅ Permission granted");

        const tokenResponse = await Notifications.getExpoPushTokenAsync({
          projectId,
        });

        const token = tokenResponse.data;

        console.log("🎟 Expo push token:", token);

        const jwt = await SecureStore.getItemAsync("access_token");
        console.log("🔐 JWT found:", !!jwt);

        if (!jwt) {
          console.log("❌ No JWT found. Stopping.");
          return;
        }

        console.log("📡 Sending token to backend...");

        const response = await axios.post(
          "https://api.properform.app/auth/push-token",
          { token, projectId: "9cbe62d4-1247-44a2-b565-489d1d9f311f" },
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
              "Content-Type": "application/json",
            },
          },
        );

        console.log("✅ Backend response:", response.status);

        await SecureStore.setItemAsync("push_token", token);
        console.log("💾 Token saved locally");
      } catch (err) {
        console.log("💥 Push registration error:", err);
      }
    };

    registerPush();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#F9FAFB",
          borderRadius: 40,
          marginHorizontal: 20,
          marginBottom: "2%",
          height: 70,
          paddingBottom: 0,
          paddingTop: 18,
          position: "absolute",
          shadowColor: "#000",
          shadowRadius: 12,
          shadowOpacity: 0.1,
          elevation: 8,
        },
        tabBarActiveTintColor: "#F97316",
        tabBarInactiveTintColor: "#8899bb",
      }}
    >
      <Tabs.Screen
        name="HomeScreen"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Icon name="home" color={color} size={28} />
          ),
        }}
      />

      <Tabs.Screen
        name="ExerciseScreen"
        options={{
          title: "Exercises",
          tabBarIcon: ({ color }) => (
            <Icon name="fitness-center" color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="TrainingScreen"
        options={{
          title: "Training",
          tabBarIcon: ({ color }) => (
            <Icon name="assignment" color={color} size={28} />
          ),
        }}
      />

      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Icon name="person" color={color} size={28} />
          ),
        }}
      />
    </Tabs>
  );
}
