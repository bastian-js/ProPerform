import { useWorkout } from "@/src/context/WorkoutContext";
import { colors } from "@/src/theme/colors";
import { typography } from "@/src/theme/typography";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MARGIN = 16;
const TAB_BAR_HEIGHT = 90;

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (minutes === 0) return `${secs} sek`;
  return `${minutes} min ${String(secs).padStart(2, "0")} sek`;
};

export default function ActiveWorkoutPill() {
  const { isActive, seconds, showModal } = useWorkout();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [pillSize, setPillSize] = useState({ width: 150, height: 36 });

  // 4 snap corners: [topLeft, topRight, bottomLeft, bottomRight]
  const corners = useMemo(
    () => [
      { x: MARGIN, y: insets.top + MARGIN },
      { x: width - pillSize.width - MARGIN, y: insets.top + MARGIN },
      { x: MARGIN, y: height - pillSize.height - TAB_BAR_HEIGHT - MARGIN },
      {
        x: width - pillSize.width - MARGIN,
        y: height - pillSize.height - TAB_BAR_HEIGHT - MARGIN,
      },
    ],
    [width, height, insets.top, pillSize],
  );

  // Init position at top-right (index 1)
  const position = useRef(
    new Animated.ValueXY({ x: width - 150 - MARGIN, y: insets.top + MARGIN }),
  ).current;

  const currentCornerRef = useRef(1);

  // Stable ref for snapToCorner so panResponder can always call the latest version
  const snapToCornerRef = useRef<(index: number, animated?: boolean) => void>(
    () => {},
  );

  const snapToCorner = useCallback(
    (index: number, animated = true) => {
      currentCornerRef.current = index;
      const target = corners[index];
      if (animated) {
        Animated.spring(position, {
          toValue: target,
          useNativeDriver: false,
          friction: 7,
          tension: 80,
        }).start();
      } else {
        position.setValue(target);
      }
    },
    [corners, position],
  );

  // Keep ref in sync
  snapToCornerRef.current = snapToCorner;

  // Re-snap immediately when corners update (layout measured, orientation change, etc.)
  useEffect(() => {
    snapToCornerRef.current(currentCornerRef.current, false);
  }, [corners]);

  const snapToNearest = useCallback(() => {
    const x = (position.x as any)._value;
    const y = (position.y as any)._value;
    let nearest = 0;
    let minDist = Infinity;
    corners.forEach((corner, i) => {
      const dist = (x - corner.x) ** 2 + (y - corner.y) ** 2;
      if (dist < minDist) {
        minDist = dist;
        nearest = i;
      }
    });
    snapToCorner(nearest);
  }, [corners, position, snapToCorner]);

  // Stable refs for panResponder (created once, must not go stale)
  const snapToNearestRef = useRef(snapToNearest);
  snapToNearestRef.current = snapToNearest;
  const showModalRef = useRef(showModal);
  showModalRef.current = showModal;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        position.setOffset({
          x: (position.x as any)._value,
          y: (position.y as any)._value,
        });
        position.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false },
      ),
      onPanResponderRelease: (_, gestureState) => {
        position.flattenOffset();
        // Small movement = tap → open modal
        if (Math.abs(gestureState.dx) < 6 && Math.abs(gestureState.dy) < 6) {
          showModalRef.current();
        } else {
          snapToNearestRef.current();
        }
      },
      onPanResponderTerminate: () => {
        position.flattenOffset();
        snapToNearestRef.current();
      },
    }),
  ).current;

  const onLayout = useCallback((e: any) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setPillSize({ width: w, height: h });
  }, []);

  if (!isActive) return null;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      onLayout={onLayout}
      style={[styles.pill, { transform: position.getTranslateTransform() }]}
    >
      <View style={styles.dot} />
      <Text style={styles.text}>{formatTime(seconds)}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: "absolute",
    top: 0,
    left: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryBlue,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    zIndex: 999,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
  },
  text: {
    ...typography.body,
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
