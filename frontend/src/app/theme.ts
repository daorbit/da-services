import { createTheme, rem } from "@mantine/core";

// Flat, light SaaS-admin theme — indigo accent, thin borders, no heavy elevation.
export const theme = createTheme({
  primaryColor: "indigo",
  primaryShade: 6,
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  fontFamilyMonospace: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
  headings: {
    fontFamily: "Inter, system-ui, sans-serif",
    fontWeight: "700",
    sizes: {
      h1: { fontSize: rem(26), lineHeight: "1.25" },
      h2: { fontSize: rem(21), lineHeight: "1.3" },
      h3: { fontSize: rem(16), lineHeight: "1.35" },
    },
  },
  defaultRadius: "8px",
  cursorType: "pointer",
  colors: {
    indigo: [
      "#eef0ff", "#dcdffe", "#b9befd", "#949bfb", "#767ff9",
      "#5f69f5", "#4f5fee", "#3f4dd6", "#333fb0", "#28328c",
    ],
  },
  shadows: {
    sm: "0 1px 2px rgba(16,24,40,0.04)",
    md: "0 1px 3px rgba(16,24,40,0.06), 0 4px 16px -4px rgba(16,24,40,0.06)",
  },
  components: {
    Loader: { defaultProps: { type: "oval" } },
    Card: { defaultProps: { radius: "md" }, styles: { root: { border: "1px solid var(--border)" } } },
    Paper: { defaultProps: { radius: "md" } },
    Button: { defaultProps: { radius: "8px" } },
    Input: { defaultProps: { radius: "8px" } },
    TextInput: { defaultProps: { radius: "8px" } },
    PasswordInput: { defaultProps: { radius: "8px" } },
    Select: { defaultProps: { radius: "8px" } },
    Badge: {
      defaultProps: { radius: "6px" },
      styles: {
        root: {
          textTransform: "uppercase",
          fontWeight: 700,
          fontSize: "10px",
          letterSpacing: "0.02em",
        },
      },
    },
  },
});
