import { createTheme, type MantineColorsTuple } from "@mantine/core";

// Indigo-blue accent, tuned so shade 6 lands on the brand mark (#4361EE).
const indigo: MantineColorsTuple = [
  "#EEF1FF",
  "#DBE0FE",
  "#B6C0FD",
  "#8E9CFB",
  "#6C7EF8",
  "#4F63F1",
  "#4361EE",
  "#3550D4",
  "#2A41B0",
  "#20338C",
];

export const theme = createTheme({
  primaryColor: "indigo",
  colors: { indigo },
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  fontFamilyMonospace: "'JetBrains Mono', ui-monospace, monospace",
  headings: {
    fontFamily: "'Space Grotesk', Inter, sans-serif",
    fontWeight: "600",
  },
  defaultRadius: "8px",
  components: {
    Paper: { defaultProps: { radius: "md" } },
    Button: { defaultProps: { radius: "8px" } },
  },
});
