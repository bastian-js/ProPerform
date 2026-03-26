import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { colors } from "@/src/theme/colors";
import { typography } from "@/src/theme/typography";
import { spacing } from "@/src/theme/spacing";
import { useVideoPlayer, VideoView } from "expo-video";

type MuscleGroup = {
  mgid: number;
  name: string;
  is_primary: number;
};
type Exercise = {
  eid: number;
  name: string;
  description: string;
  instructions: string;
  equipment_needed: string;
  thumbnail_url?: string;
  video_url?: string;
  muscle_groups?: MuscleGroup[];
  sid: number;
  dlid: number;
};

const getSportName = (sid: number) => {
  const sports: Record<number, string> = { 1: "Gym", 2: "Basketball" };
  return sports[sid] ?? "Unbekannt";
};

const getDifficultyLabel = (dlid: number) => {
  const levels: Record<number, string> = {
    1: "Beginner",
    2: "Intermediate",
    3: "Advanced",
    4: "Expert",
  };
  return levels[dlid] ?? "Unbekannt";
};

type Props = {
  visible: boolean;
  exercise: Exercise | null;
  onClose: () => void;
};

export default function ExerciseDetailModal({
  visible,
  exercise,
  onClose,
}: Props) {
  const player = useVideoPlayer(exercise?.video_url ?? null, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  React.useEffect(() => {
    if (visible && player) {
      player.play();
    } else {
      player?.pause();
    }
  }, [visible, player, exercise]);

  if (!exercise) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          {/* handle + close button */}
          <View style={styles.handle} />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <View style={styles.imageContainer}>
              {exercise.thumbnail_url ? (
                <Image
                  source={{ uri: exercise.thumbnail_url }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon
                    name="fitness-center"
                    size={48}
                    color={colors.primaryBlue}
                  />
                </View>
              )}
            </View>

            {/* name + category + muscle group */}
            <View style={styles.infoSection}>
              <Text style={styles.category}>{getSportName(exercise.sid)}</Text>
              <Text style={styles.name}>{exercise.name}</Text>
              {/* muscle group api not working
              <View style={styles.badge}>
                <Icon
                  name="sports-gymnastics"
                  size={14}
                  color={colors.primaryBlue}
                />
                <Text style={styles.badgeText}>
                  {" "}
                  {(exercise.muscle_groups ?? []).find(
                    (mg) => mg.is_primary === 1,
                  )?.name ?? ""}
                </Text>
              </View>
              */}

              {/* difficulty */}
              <View style={styles.badge}>
                <Icon name="bar-chart" size={14} color={colors.primaryBlue} />
                <Text style={styles.badgeText}>
                  {getDifficultyLabel(exercise.dlid)}
                </Text>
              </View>
            </View>

            {/* desc */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Beschreibung</Text>
              <Text style={styles.cardText}>{exercise.description}</Text>
            </View>

            {/* instructions */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Anleitung</Text>
              <Text style={styles.cardText}>{exercise.instructions}</Text>
            </View>

            {/* equipment */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Equipment</Text>
              <View style={styles.equipmentRow}>
                <Icon
                  name="fitness-center"
                  size={16}
                  color={colors.primaryBlue}
                />
                <Text style={styles.cardText}>{exercise.equipment_needed}</Text>
              </View>
            </View>

            {/* Videoanleitung */}
            {exercise.video_url && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Videoanleitung</Text>
                <VideoView
                  player={player}
                  style={styles.video}
                  allowsFullscreen
                  allowsPictureInPicture
                  startsPictureInPictureAutomatically
                />
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingBottom: spacing.xl,
    maxHeight: "85%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
    alignSelf: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: spacing.xs,
  },
  content: {
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  imageContainer: {
    borderRadius: 16,
    overflow: "hidden",
    alignSelf: "center",
  },
  image: {
    width: 260,
    height: 160,
  },
  imagePlaceholder: {
    width: 260,
    height: 160,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  infoSection: {
    gap: spacing.xs,
  },
  category: {
    ...typography.body,
    fontSize: 13,
    color: colors.primaryBlue,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  name: {
    ...typography.title,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.white,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    ...typography.body,
    fontSize: 13,
    color: colors.primaryBlue,
    fontWeight: "500",
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.xs,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
  cardText: {
    ...typography.body,
    lineHeight: 22,
    fontSize: 13,

    color: colors.textSecondary,
  },
  equipmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  video: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
});
