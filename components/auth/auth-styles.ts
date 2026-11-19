import { StyleSheet } from "react-native";

// Auth screens use plain React Native styles instead of the Tailwind component
// classes in global.css. The component-layer classes compile fine, but on
// Android the `text-*` utilities (font family + line-height variables) make
// text measure at ~0 height, which collapses the whole form column.
//
// Only the two font families that are proven to render on device are used
// here: `sans-extrabold` (headings/CTAs) and `sans-semibold` (body/labels).
export const authColors = {
  background: "#fff9e3",
  card: "#fff8e7",
  accent: "#ea7a53",
  primary: "#081126",
  muted: "rgba(0,0,0,0.6)",
  border: "rgba(0,0,0,0.1)",
  destructive: "#dc2626",
  success: "#16a34a",
} as const;

export const authFonts = {
  strong: "sans-extrabold",
  body: "sans-semibold",
} as const;

export const authStyles = StyleSheet.create({
  // ── Screen scaffolding ────────────────────────────────────────────────────
  safeArea: {
    flex: 1,
    backgroundColor: authColors.background,
  },
  keyboard: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // ── Brand mark ────────────────────────────────────────────────────────────
  brandBlock: {
    marginTop: 8,
    alignItems: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: authColors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  logoMarkText: {
    fontFamily: authFonts.strong,
    fontSize: 26,
    lineHeight: 32,
    color: authColors.background,
  },
  wordmark: {
    fontFamily: authFonts.strong,
    fontSize: 28,
    lineHeight: 33,
    color: authColors.primary,
  },
  wordmarkSub: {
    fontFamily: authFonts.body,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: authColors.muted,
  },

  // ── Heading ───────────────────────────────────────────────────────────────
  heading: {
    marginTop: 28,
    alignItems: "center",
  },
  title: {
    fontFamily: authFonts.strong,
    fontSize: 26,
    lineHeight: 32,
    textAlign: "center",
    color: authColors.primary,
  },
  subtitle: {
    marginTop: 8,
    maxWidth: 320,
    fontFamily: authFonts.body,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    color: authColors.muted,
  },
  subtitleStrong: {
    fontFamily: authFonts.strong,
    color: authColors.primary,
  },

  // ── Card + form ───────────────────────────────────────────────────────────
  card: {
    marginTop: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: authColors.border,
    backgroundColor: authColors.card,
    padding: 20,
  },
  form: {
    gap: 16,
  },
  formLoose: {
    gap: 24,
  },
  field: {
    gap: 8,
  },
  label: {
    fontFamily: authFonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: authColors.primary,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: authColors.border,
    backgroundColor: authColors.background,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: authFonts.body,
    fontSize: 15,
    lineHeight: 20,
    color: authColors.primary,
  },
  inputFocused: {
    borderColor: authColors.accent,
  },
  inputError: {
    borderColor: authColors.destructive,
  },
  inputWithAccessory: {
    paddingRight: 64,
  },
  inputAccessory: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 16,
    justifyContent: "center",
  },
  inputAccessoryText: {
    fontFamily: authFonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: authColors.muted,
  },
  error: {
    fontFamily: authFonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: authColors.destructive,
  },
  helper: {
    fontFamily: authFonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: authColors.muted,
  },

  // ── Buttons ───────────────────────────────────────────────────────────────
  button: {
    marginTop: 4,
    borderRadius: 16,
    backgroundColor: authColors.accent,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: authFonts.strong,
    fontSize: 16,
    lineHeight: 21,
    color: authColors.primary,
  },
  secondaryButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(234,122,83,0.3)",
    backgroundColor: "rgba(234,122,83,0.1)",
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontFamily: authFonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: authColors.accent,
  },

  // ── Divider ───────────────────────────────────────────────────────────────
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: authColors.border,
  },
  dividerText: {
    fontFamily: authFonts.body,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: authColors.muted,
  },

  // ── Footer links ──────────────────────────────────────────────────────────
  linkRow: {
    marginTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  linkCopy: {
    fontFamily: authFonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: authColors.muted,
  },
  link: {
    fontFamily: authFonts.strong,
    fontSize: 13,
    lineHeight: 19,
    color: authColors.accent,
  },

  // ── OTP boxes ─────────────────────────────────────────────────────────────
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  otpBox: {
    flex: 1,
    maxWidth: 48,
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: authColors.border,
    backgroundColor: authColors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  otpBoxActive: {
    borderColor: authColors.accent,
    backgroundColor: "rgba(234,122,83,0.08)",
  },
  otpBoxFilled: {
    borderColor: "rgba(8,17,38,0.3)",
    backgroundColor: authColors.card,
  },
  otpBoxError: {
    borderColor: authColors.destructive,
    backgroundColor: "rgba(220,38,38,0.05)",
  },
  otpDigit: {
    fontFamily: authFonts.strong,
    fontSize: 20,
    lineHeight: 26,
    color: authColors.primary,
  },
  hiddenInput: {
    position: "absolute",
    width: 0,
    height: 0,
    opacity: 0,
  },
});
