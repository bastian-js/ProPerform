import { colors } from "./colors";

export const typography = {
  title: {
    fontFamily: "Inter",
    fontSize: 32,
    fontWeight: "bold" as const,
    textAlign: "center" as const,
    color: colors.textPrimary,
  },

  body: {
    fontFamily: "Inter",
    fontSize: 20,
    fontWeight: "500" as const,
    textAlign: "center" as const,
    color: colors.textSecondary,
  },

  secondary: {
    fontFamily: "Inter",
    fontSize: 18,
    fontWeight: "500" as const,
    textAlign: "center" as const,
    color: colors.textSecondary,
  },

  greeting: {
    fontFamily: "Inter",
    fontSize: 24,
    fontWeight: "600" as const,
    color: colors.textPrimary,
    textAlign: "center" as const,
  },

  label: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "500" as const,
    color: colors.textPrimary,
  },

  error: {
    fontFamily: "Inter",
    fontSize: 13,
    color: "red",
  },

  hint: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "500" as const,
    color: colors.textPrimary,
    lineHeight: 20,
  },
};
