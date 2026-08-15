import { createTheme, rem } from "@mantine/core";

// Professional dark-first theme, indigo accent, flat surfaces — matches the
// Quantalog dashboard's visual language so the ecosystem reads as one product.
export const theme = createTheme({
  primaryColor: "indigo",
  primaryShade: { light: 6, dark: 5 },
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  fontFamilyMonospace: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
  headings: {
    fontFamily: "'Space Grotesk', Inter, system-ui, sans-serif",
    fontWeight: "700",
    sizes: {
      h1: { fontSize: rem(30), lineHeight: "1.2" },
      h2: { fontSize: rem(23), lineHeight: "1.25" },
      h3: { fontSize: rem(18), lineHeight: "1.3" },
    },
  },
  defaultRadius: "md",
  cursorType: "pointer",
  colors: {
    indigo: [
      "#eef1ff", "#dbe0fe", "#b6c0fd", "#8e9cfb", "#6c7ef8",
      "#4f63f1", "#4361ee", "#3550d4", "#2a41b0", "#20338c",
    ],
    dark: [
      "#c9ced6", "#a8aeb8", "#8b929e", "#5f6673", "#3a3f4a",
      "#2b2f38", "#22252c", "#1a1c22", "#131519", "#0b0c0f",
    ],
  },
  shadows: {
    md: "0 8px 24px -8px rgba(0,0,0,0.45)",
    lg: "0 16px 40px -12px rgba(0,0,0,0.55)",
  },
  components: {
    Loader: { defaultProps: { type: "oval" } },
    Badge: {
      vars: () => ({
        root: {
          "--badge-bg": "transparent",
          "--badge-bd": "none",
          "--badge-radius": "0",
        },
      }),
      styles: {
        root: {
          paddingInline: 0,
          textTransform: "none",
          fontWeight: 650,
          height: "auto",
          lineHeight: 1.35,
          letterSpacing: "0.01em",
          fontVariantNumeric: "tabular-nums",
        },
      },
    },
    Card: { defaultProps: { radius: "md" } },
    Button: { defaultProps: { radius: "md" } },
    Paper: { defaultProps: { radius: "md" } },
    Input: { defaultProps: { radius: 8 } },
    TextInput: { defaultProps: { radius: 8 } },
    PasswordInput: { defaultProps: { radius: 8 } },
    Select: { defaultProps: { radius: 8 } },
  },
});
