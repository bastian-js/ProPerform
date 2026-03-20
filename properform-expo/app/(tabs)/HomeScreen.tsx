import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { typography } from "@/src/theme/typography";
import { spacing } from "@/src/theme/spacing";
import { colors } from "@/src/theme/colors";
import SecondaryButton from "@/src/components/secondaryButton";
import api from "@/src/utils/axiosInstance";
import { useFocusEffect } from "expo-router";

export default function HomeScreen() {
  const [user, setUser] = useState<{
    firstname: string;
    profile_image_url: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await api.get("/users/me");
        setUser(response.data);
      } catch (err) {
        console.log("Fehler beim Laden der User-Daten:", err);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  const calculateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Guten Morgen,";
    if (hour < 18) return "Guten Tag,";
    return "Guten Abend,";
  };

  useFocusEffect(
    useCallback(() => {
      setGreeting(calculateGreeting());
    }, []),
  );

  // dummy values for streak
  const streakDays = 4;
  const days = ["M", "D", "M", "D", "F", "S", "S"];
  const completed = [true, true, true, true, false, false, false];

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* top row (profile, greeting, name) */}
        <View style={styles.topRow}>
          <Image
            source={
              user?.profile_image_url
                ? { uri: user.profile_image_url }
                : require("../../assets/images/profile_picture.png")
            }
            style={styles.avatarImage}
          />

          <View style={styles.greetingBlock}>
            <Text style={styles.goodMorning}>{greeting}</Text>
            <Text style={styles.hello}>{user?.firstname || "..."}</Text>
          </View>
        </View>

        {/* streak card noch dummy */}
        <View style={styles.card}>
          <View style={styles.streakHeader}>
            <Text style={styles.streakTitle}>Wochen-Streak</Text>

            <View style={styles.streakRight}>
              <Text style={styles.fire}>🔥</Text>
              <Text style={styles.streakActive}>{streakDays} Tage aktiv</Text>
            </View>
          </View>

          <View style={styles.streakSquaresRow}>
            {completed.map((isOn, dayIndex) => (
              <View
                key={dayIndex}
                style={[
                  styles.streakSquare,
                  isOn ? styles.streakSquareOn : styles.streakSquareOff,
                ]}
              />
            ))}
          </View>

          <View style={styles.streakDaysRow}>
            {days.map((dayLabel, dayIndex) => (
              <Text key={dayIndex} style={styles.streakDayLabel}>
                {dayLabel}
              </Text>
            ))}
          </View>
        </View>

        {/* wöchentliches ziel noch dummy */}
        <View style={styles.weeklyGoalWrap}>
          {/* dummy progresscircle */}
          <View style={styles.goalDummyCircle}>
            <Text style={styles.goalPercent}>50%</Text>
            <Text style={styles.goalLabel}>WÖCHENTLICHES ZIEL</Text>
          </View>
        </View>

        {/* heutiges vorgeschlagenes training dummy */}
        <View style={styles.trainingCard}>
          {/* Deko Kreise */}
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />

          <View style={styles.trainingTop}>
            <Text style={styles.trainingLabel}>HEUTIGES TRAINING</Text>

            <View style={styles.durationBadge}>
              <Text style={styles.durationIcon}>🕒</Text>
              <Text style={styles.durationText}>45 min.</Text>
            </View>
          </View>

          <Text style={styles.trainingMain}>Brust & Trizeps</Text>

          <View style={styles.trainingButtonWrap}>
            <SecondaryButton text="TRAINING STARTEN" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  scrollContent: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: spacing.screenPaddingTop,
    paddingBottom: spacing.xl,
  },

  // top row (profile, greeting, name)
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 999,
    marginRight: spacing.md,
  },

  greetingBlock: {
    flex: 1,
  },

  goodMorning: {
    ...typography.secondary,
    textAlign: "left",
    fontSize: 14,
    color: colors.textSecondary,
  },

  hello: {
    ...typography.greeting,
    textAlign: "left",
    fontSize: 28,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  // streak card
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },

  // streak
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },

  streakTitle: {
    fontFamily: "Inter",
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    flex: 1,
  },

  streakRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  fire: {
    fontSize: 16,
  },

  streakActive: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "700",
    color: colors.accentOrange,
  },

  streakSquaresRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },

  streakSquare: {
    width: 38,
    height: 38,
    borderRadius: 8,
  },

  streakSquareOn: {
    backgroundColor: colors.primaryBlue,
  },

  streakSquareOff: {
    backgroundColor: "#D1D5DB59",
  },

  streakDaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  streakDayLabel: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "600",
    color: colors.borderGray,
    width: 38,
    textAlign: "center",
  },

  // weekly goal
  weeklyGoalWrap: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },

  goalDummyCircle: {
    width: 200,
    height: 200,
    borderRadius: 999,
    borderWidth: 16,
    borderColor: "#D1D5DB40",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  goalPercent: {
    fontFamily: "Inter",
    fontSize: 40,
    fontWeight: "900",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  goalLabel: {
    fontFamily: "Inter",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    color: colors.textSecondary,
  },

  // training card
  trainingCard: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 28,
    padding: spacing.xl,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    overflow: "hidden",
  },

  decoCircle1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    right: -80,
    top: -60,
    backgroundColor: "#FFFFFF14",
  },

  decoCircle2: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 999,
    right: 10,
    bottom: -60,
    backgroundColor: "#FFFFFF0F",
  },

  trainingTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },

  trainingLabel: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#FFFFFFB3",
  },

  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: "#FFFFFF29",
  },

  durationIcon: {
    fontSize: 14,
  },

  durationText: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "700",
    color: colors.white,
  },

  trainingMain: {
    fontFamily: "Inter",
    fontSize: 28,
    fontWeight: "900",
    color: colors.white,
    marginBottom: spacing.md,
  },

  trainingButtonWrap: {
    marginTop: -spacing.xs,
  },
});
