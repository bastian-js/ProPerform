import { colors } from "@/src/theme/colors";
import React from "react";
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

const DOT_SIZE = 8;
const ACTIVE_WIDTH = 22;
const GAP = 10;
const EXTRA_SPACE = 8;
const WRAPPER_HEIGHT = 18;
const ACTIVE_TOP = (WRAPPER_HEIGHT - DOT_SIZE) / 2;
const GLOW_TOP = (WRAPPER_HEIGHT - (DOT_SIZE + 4)) / 2;

export default function ProgressDots({
  total,
  current,
  style,
}: {
  total: number;
  current: number;
  style?: StyleProp<ViewStyle>;
}) {
  const activeX = React.useRef(new Animated.Value(0)).current;
  const pillScale = React.useRef(new Animated.Value(1)).current;
  const pillOpacity = React.useRef(new Animated.Value(1)).current;
  const glowAnim = React.useRef(new Animated.Value(0)).current;

  const getX = (index: number, currentVal: number) => {
    let x = 0;
    for (let i = 0; i < index; i++) {
      const isNearActive = i === currentVal - 2 || i === currentVal - 1;
      x += DOT_SIZE + GAP + (isNearActive ? EXTRA_SPACE : 0);
    }
    return x;
  };

  React.useEffect(() => {
    const clamped = Math.min(Math.max(current, 1), total);
    const baseX = getX(clamped - 1, clamped);
    const centeredX = baseX - (ACTIVE_WIDTH - DOT_SIZE) / 2;

    Animated.parallel([
      Animated.timing(activeX, {
        toValue: centeredX,
        duration: 360,
        easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(pillScale, {
          toValue: 1.14,
          duration: 110,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(pillScale, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(pillOpacity, {
          toValue: 0.82,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(pillOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [current, total]);

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();

    return () => {
      pulse.stop();
    };
  }, [glowAnim]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.4, 0],
  });

  const clampedCurrent = Math.min(Math.max(current, 1), total);

  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.container}>
        {[...Array(total)].map((_, i) => {
          const isNearActive =
            i === clampedCurrent - 2 || i === clampedCurrent - 1;
          const isActiveDot = i === clampedCurrent - 1;

          return (
            <View
              key={i}
              style={[
                styles.pill,
                {
                  marginRight:
                    i !== total - 1
                      ? GAP + (isNearActive ? EXTRA_SPACE : 0)
                      : 0,
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.dot,
                  i < clampedCurrent - 1
                    ? styles.completedDot
                    : styles.inactiveDot,
                  isActiveDot ? styles.hiddenActiveDot : null,
                ]}
              />
            </View>
          );
        })}
      </View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            transform: [{ translateX: activeX }, { scale: pillScale }],
            opacity: glowOpacity,
          },
        ]}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.activePill,
          {
            transform: [{ translateX: activeX }, { scale: pillScale }],
            opacity: pillOpacity,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    marginTop: 0,
    marginBottom: 0,
    justifyContent: "center",
    alignItems: "center",
    height: WRAPPER_HEIGHT,
  },
  container: {
    flexDirection: "row",
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  pill: {
    marginBottom: 0,
  },
  completedDot: {
    backgroundColor: colors.primaryBlue,
  },
  inactiveDot: {
    backgroundColor: colors.borderLight,
  },
  activePill: {
    position: "absolute",
    top: ACTIVE_TOP,
    left: 0,
    width: ACTIVE_WIDTH,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.primaryBlue,
  },
  glow: {
    position: "absolute",
    top: GLOW_TOP,
    left: 0,
    width: ACTIVE_WIDTH,
    height: DOT_SIZE + 4,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.primaryBlue,
  },
  hiddenActiveDot: {
    opacity: 0,
  },
});
