import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  useWindowDimensions,
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
  const { width, height: screenHeight } = useWindowDimensions();
  const isCompact = width < 380 || screenHeight < 750;
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
        <View style={[styles.sheet, isCompact ? styles.sheetCompact : null]}>
          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            <View style={styles.headerCenter} />
            <TouchableOpacity style={styles.iconButton} onPress={onClose}>
              <Icon name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.content,
              isCompact ? styles.contentCompact : null,
            ]}
          >
            <View style={styles.imageContainer}>
              {exercise.thumbnail_url ? (
                <Image
                  source={{ uri: exercise.thumbnail_url }}
                  style={[styles.image, isCompact ? styles.imageCompact : null]}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.imagePlaceholder,
                    isCompact ? styles.imageCompact : null,
                  ]}
                >
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
              <Text
                style={[styles.name, isCompact ? styles.nameCompact : null]}
              >
                {exercise.name}
              </Text>
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
                  style={[styles.video, isCompact ? styles.videoCompact : null]}
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
    paddingTop: spacing.md,
    maxHeight: "85%",
  },
  sheetCompact: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerSpacer: {
    width: 42,
    height: 42,
  },
  headerCenter: {
    flex: 1,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  content: {
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  contentCompact: {
    gap: spacing.sm,
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
  imageCompact: {
    width: 220,
    height: 140,
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
  nameCompact: {
    fontSize: 26,
    lineHeight: 32,
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
  videoCompact: {
    height: 170,
  },
});
