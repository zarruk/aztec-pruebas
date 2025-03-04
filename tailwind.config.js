import defaultTheme from "tailwindcss/defaultTheme";
import { theme } from "./src/lib/theme";

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: theme.colors.border,
        input: theme.colors.border,
        ring: theme.colors.primary[300],
        background: theme.colors.background,
        foreground: theme.colors.text.primary,
        primary: {
          DEFAULT: theme.colors.primary.DEFAULT,
          foreground: "white",
          ...theme.colors.primary
        },
        secondary: {
          DEFAULT: theme.colors.secondary.DEFAULT,
          foreground: theme.colors.text.primary,
          ...theme.colors.secondary
        },
        destructive: {
          DEFAULT: "hsl(0, 84%, 60%)",
          foreground: "white",
        },
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: theme.colors.text.muted,
        },
        accent: {
          DEFAULT: theme.colors.secondary[200],
          foreground: theme.colors.text.primary,
        },
        popover: {
          DEFAULT: "white",
          foreground: theme.colors.text.primary,
        },
        card: {
          DEFAULT: theme.colors.card,
          foreground: theme.colors.text.primary,
        },
      },
      borderRadius: {
        lg: theme.radii.lg,
        md: theme.radii.md,
        sm: theme.radii.sm,
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
        heading: [theme.fonts.heading],
        body: [theme.fonts.body],
      },
      boxShadow: {
        sm: theme.shadows.sm,
        md: theme.shadows.md,
        lg: theme.shadows.lg,
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}; 