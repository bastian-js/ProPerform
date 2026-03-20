import { View, Text, StyleSheet, Button, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStorage from "expo-secure-store";

export default function DevMenu() {
  const router = useRouter();

  const resetStorage = async () => {
    await AsyncStorage.clear();
    await SecureStorage.deleteItemAsync("access_token");
    await SecureStorage.deleteItemAsync("refresh_token");
    await SecureStorage.deleteItemAsync("user_id");
    alert("Speicher erfolgreich gelöscht!");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tabs</Text>
        <View style={styles.buttonGroup}>
          <Button
            title="HomeScreen"
            onPress={() => router.push("/HomeScreen")}
          />
          <Button
            title="ProfileScreen"
            onPress={() => router.push("/ProfileScreen")}
          />
          <Button
            title="ExerciseScreen"
            onPress={() => router.push("/ExerciseScreen")}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Onboarding</Text>
        <View style={styles.buttonGroup}>
          <Button
            title="OnboardingScreen"
            onPress={() => router.push("/OnboardingScreen")}
          />
          <Button
            title="OnboardingStep2"
            onPress={() => router.push("/OnboardingStep2")}
          />
          <Button
            title="OnboardingStep3"
            onPress={() => router.push("/OnboardingStep3")}
          />
          <Button
            title="OnboardingStep4"
            onPress={() => router.push("/OnboardingStep4")}
          />
          <Button
            title="OnboardingStep5"
            onPress={() => router.push("/OnboardingStep5")}
          />
          <Button
            title="OnboardingTrainerCodeScreen"
            onPress={() => router.push("/OnboardingTrainerCodeScreen")}
          />
          <Button
            title="OnboardingTrainingModeScreen"
            onPress={() => router.push("/OnboardingTrainingModeScreen")}
          />

          <Button
            title="VerifyEmailScreen"
            onPress={() => router.push("/(onboarding)/VerifyEmailScreen")}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Auth</Text>
        <Button
          title="LoginScreen"
          onPress={() => router.push("/(auth)/LoginScreen")}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reset</Text>
        <Button
          title="Reset AsyncStorage"
          color="#d9534f"
          onPress={resetStorage}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
  },
  section: {
    marginBottom: 30,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f2f2f2",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  buttonGroup: {
    gap: 10,
  },
});
