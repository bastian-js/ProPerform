import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export default function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <Image
            source={require("../../assets/images/logo_ohne_bg.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>ProPerform</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginHorizontal: 2,
    marginBottom: 10,
    borderRadius: 24,
    backgroundColor: "#15306e",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FFFFFF",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  logo: {
    width: 36,
    height: 36,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
});
