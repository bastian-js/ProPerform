import InputField from "@/src/components/input";
import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import axios from "axios";
import React from "react";
import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ visible, onClose }: Props) {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [internalVisible, setInternalVisible] = React.useState(false);
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    if (visible) {
      setInternalVisible(true);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      backdropOpacity.setValue(0);
      slideAnim.setValue(300);
      setInternalVisible(false);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 280,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setInternalVisible(false);
      onClose();
    });
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Fehler", "Bitte gib deine E-Mail ein.");
      return;
    }

    try {
      setLoading(true);

      await axios.post("https://api.properform.app/auth/reset-password", {
        email: email.trim().toLowerCase(),
      });

      Alert.alert(
        "Erfolg",
        "Falls ein Account existiert, wurde ein Reset-Link gesendet.",
      );

      setEmail("");
      handleClose();
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        "Etwas ist schiefgelaufen. Bitte später erneut versuchen.";
      Alert.alert("Fehler", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={internalVisible} transparent animationType="none">
      <View style={styles.overlay} pointerEvents="box-none">
        <Animated.View
          style={[styles.absoluteFill, { opacity: backdropOpacity }]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            style={styles.fullscreenBackdrop}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>
        <Animated.View
          style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
          <Text style={styles.title}>Passwort zurücksetzen</Text>

          <Text style={styles.description}>
            Gib deine E-Mail-Adresse ein und wir senden dir einen Link.
          </Text>

          <InputField
            title="E-Mail"
            value={email}
            placeholder="max@beispiel.at"
            onChange={setEmail}
          />

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.5 }]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Link senden</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleClose} style={styles.closeWrap}>
            <Text style={styles.closeText}>Abbrechen</Text>
          </TouchableOpacity>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000066",
    justifyContent: "center",
    padding: spacing.lg,
  },
  fullscreenBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#00000066",
    zIndex: 0,
  },

  container: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: spacing.lg,
  },

  title: {
    fontFamily: "Inter",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: spacing.sm,
    color: colors.textPrimary,
  },

  description: {
    fontFamily: "Inter",
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },

  button: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: spacing.sm,
  },

  buttonText: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "800",
    color: colors.white,
  },

  closeWrap: {
    alignItems: "center",
    marginTop: spacing.md,
  },

  closeText: {
    fontFamily: "Inter",
    fontSize: 14,
    color: colors.textSecondary,
  },
  absoluteFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
});
