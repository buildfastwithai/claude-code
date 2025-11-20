/**
 * Theme Configuration
 * Based on the app's design system with dark mode support
 */

const commonTheme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    full: 9999,
  },

  typography: {
    fontFamily: {
      regular: "Lexend_400Regular",
      medium: "Lexend_500Medium",
      semibold: "Lexend_600SemiBold",
      bold: "Lexend_700Bold",
      extrabold: "Lexend_800ExtraBold",
      black: "Lexend_900Black",
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      "2xl": 24,
      "3xl": 30,
      "4xl": 36,
      "5xl": 48,
      "6xl": 60,
    },
    fontWeight: {
      regular: "400" as const,
      medium: "500" as const,
      semibold: "600" as const,
      bold: "700" as const,
      extrabold: "800" as const,
      black: "900" as const,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
  },

  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
  },
} as const;

// Light theme colors
export const lightTheme = {
  ...commonTheme,
  colors: {
    // Primary Colors
    primary: "#8157F9",
    primaryDark: "#6B41E3",
    primaryLight: "#A996FF",

    // Accent Colors
    accent: "#E9AC49",
    accentDark: "#C8891E",
    accentLight: "#F5CE79",

    // Semantic Colors
    success: "#46855A",
    error: "#D55E55",
    warning: "#E9AC49",
    info: "#6C8CFF",

    // Neutral Colors
    black: "#262626",
    white: "#FFFFFF",
    gray: {
      50: "#F8F5F1",
      100: "#ECE7E1",
      200: "#DAD3CC",
      300: "#BFB7AF",
      400: "#9F978F",
      500: "#7F7870",
      600: "#5F5A54",
      700: "#46423D",
      800: "#322E2B",
      900: "#262626",
    },

    // Background Colors
    background: "#F3F0EC",
    backgroundDark: "#E6E0D8",
    surface: "#FFFFFF",
    surfaceDark: "#E8E2DA",

    // Text Colors
    text: {
      primary: "#262626",
      secondary: "#4A4A4A",
      tertiary: "#6F6F6F",
      inverse: "#FFFFFF",
    },

    // Border Colors
    border: "#E0DCD5",
    borderDark: "#262626",

    // Special Colors
    zero: "#D55E55",
    realStuff: "#46855A",
    actuallyFun: "#8157F9",

    // Card backgrounds
    cardBackground: "#FFFFFF",
    cardBorder: "#262626",
    iconBackground: "#E7DEFF",
  },
} as const;

// Dark theme colors
export const darkTheme = {
  ...commonTheme,
  colors: {
    // Primary Colors
    primary: "#9D7FFF",
    primaryDark: "#8157F9",
    primaryLight: "#B7A3FF",

    // Accent Colors
    accent: "#E9AC49",
    accentDark: "#C8891E",
    accentLight: "#F5CE79",

    // Semantic Colors
    success: "#65A97C",
    error: "#F08072",
    warning: "#E9AC49",
    info: "#889CFF",

    // Neutral Colors
    black: "#F3F0EC",
    white: "#000000",
    gray: {
      50: "#1C1C1C",
      100: "#232323",
      200: "#2B2B2B",
      300: "#323232",
      400: "#3A3A3A",
      500: "#4E4E4E",
      600: "#6A6A6A",
      700: "#8E8E8E",
      800: "#BDBDBD",
      900: "#F3F0EC",
    },

    // Background Colors
    background: "#262626",
    backgroundDark: "#1F1F1F",
    surface: "#2E2E2E",
    surfaceDark: "#363636",

    // Text Colors
    text: {
      primary: "#FFFFFF",
      secondary: "#D5D5D5",
      tertiary: "#A3A3A3",
      inverse: "#262626",
    },

    // Border Colors
    border: "#3A3A3A",
    borderDark: "#4A4A4A",

    // Special Colors
    zero: "#F08072",
    realStuff: "#65A97C",
    actuallyFun: "#9D7FFF",

    // Card backgrounds
    cardBackground: "#2E2E2E",
    cardBorder: "#3A3A3A",
    iconBackground: "#3B3460",
  },
} as const;

export type AppTheme = typeof lightTheme;

// Legacy export for backward compatibility
export const theme = lightTheme;
export type Theme = typeof theme;
