import React from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";

const DOT_SIZE = 8;
const ACTIVE_WIDTH = 18;
const GAP = 10;
const SLOT_WIDTH = DOT_SIZE + GAP;
const ADJACENT_DOT_OFFSET = 2;

export default function ProgressDots({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  const activeX = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const clamped = Math.min(Math.max(current, 1), total);
    const baseX = (clamped - 1) * SLOT_WIDTH;
    const centeredX = baseX - (ACTIVE_WIDTH - DOT_SIZE) / 2;

    Animated.timing(activeX, {
      toValue: centeredX,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeX, current, total]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {[...Array(total)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < current - 1 ? styles.completedDot : styles.inactiveDot,
              i === current - 2 && {
                transform: [{ translateX: -ADJACENT_DOT_OFFSET }],
              },
              i === current && {
                transform: [{ translateX: ADJACENT_DOT_OFFSET }],
              },
            ]}
          />
        ))}
      </View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.currentDot,
          {
            transform: [{ translateX: activeX }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    marginVertical: spacing.lg,
    minHeight: DOT_SIZE,
    justifyContent: "center",
  },
  container: {
    flexDirection: "row",
    justifyContent: "center",
    gap: GAP,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  currentDot: {
    position: "absolute",
    left: 0,
    width: ACTIVE_WIDTH,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.primaryBlue,
  },
  completedDot: {
    backgroundColor: colors.primaryBlue,
  },
  inactiveDot: {
    backgroundColor: colors.borderLight,
  },
});
