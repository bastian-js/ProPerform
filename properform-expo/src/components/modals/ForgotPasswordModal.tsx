import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from "react-native";
import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import InputField from "@/src/components/input";
import axios from "axios";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ visible, onClose }: Props) {
  const [email, setEmail] = React.useState("");

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Fehler", "Bitte gib deine E-Mail ein.");
      return;
    }

    try {
      await axios.post("https://api.properform.app/auth/reset-password", {
        email: email.trim().toLowerCase(),
      });

      Alert.alert(
        "Erfolg",
        "Falls ein Account existiert, wurde ein Reset-Link gesendet.",
      );

      setEmail("");
      onClose();
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        "Etwas ist schiefgelaufen. Bitte später erneut versuchen.";
      Alert.alert("Fehler", message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
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

          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
            <Text style={styles.buttonText}>Link senden</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.closeWrap}>
            <Text style={styles.closeText}>Abbrechen</Text>
          </TouchableOpacity>
        </View>
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
});
