import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSignUp, useSignIn } from "@clerk/expo/legacy";
import { useRouter, useLocalSearchParams } from "expo-router";
import { BrandMark, AuthHeading, AuthButton } from "@/components/auth/auth-ui";
import { authStyles as s } from "@/components/auth/auth-styles";

// ─── OTP Input ────────────────────────────────────────────────────────────────

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  hasError: boolean;
}

function OtpInput({ value, onChange, hasError }: OtpInputProps) {
  const inputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const digits = value.padEnd(6, " ").split("").slice(0, 6);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => inputRef.current?.focus()}
    >
      {/* Hidden real input */}
      <TextInput
        ref={inputRef}
        style={s.hiddenInput}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, "").slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        textContentType="oneTimeCode"
        autoFocus
      />

      {/* Visual digit boxes */}
      <View style={s.otpRow}>
        {digits.map((digit, i) => (
          <View
            key={i}
            style={[
              s.otpBox,
              hasError
                ? s.otpBoxError
                : value.length === i
                ? s.otpBoxActive
                : digit.trim()
                ? s.otpBoxFilled
                : null,
            ]}
          >
            <Text style={s.otpDigit}>{digit.trim()}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

// ─── Verify Screen ────────────────────────────────────────────────────────────

export default function VerifyScreen() {
  const { signUp, setActive: signUpSetActive } = useSignUp();
  const { signIn, setActive: signInSetActive } = useSignIn();
  const router = useRouter();
  const { email, context } = useLocalSearchParams<{
    email: string;
    context: "sign-up" | "sign-in";
  }>();

  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resend
  const startResendCooldown = useCallback(() => {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          clearInterval(interval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  // `router.back()` throws "The action 'GO_BACK' was not handled by any
  // navigator" when verify is the *initial* route — e.g. after a reload, or
  // when Expo Go re-launches the app on this path — because there is no entry
  // in the stack behind it. Fall back to the home screen instead.
  const handleGoBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  }, [router]);

  const handleVerify = useCallback(async () => {
    if (code.length !== 6) {
      setCodeError("Please enter the full 6-digit code.");
      return;
    }
    setCodeError(null);
    setLoading(true);

    try {
      if (context === "sign-up" && signUp) {
        const result = await signUp.attemptEmailAddressVerification({ code });
        if (result.status === "complete") {
          await signUpSetActive!({ session: result.createdSessionId });
          router.replace("/(tabs)");
        } else {
          setCodeError("Verification incomplete. Please try again.");
        }
      } else if (context === "sign-in" && signIn) {
        const result = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code,
        });
        if (result.status === "complete") {
          await signInSetActive!({ session: result.createdSessionId });
          router.replace("/(tabs)");
        } else {
          setCodeError("Verification incomplete. Please try again.");
        }
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message: string }> };
      const msg = clerkErr?.errors?.[0]?.message ?? "Invalid code. Please try again.";
      setCodeError(msg);
    } finally {
      setLoading(false);
    }
  }, [code, context, signUp, signIn, signUpSetActive, signInSetActive, router]);

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0) return;
    try {
      if (context === "sign-up" && signUp) {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      } else if (context === "sign-in" && signIn) {
        // For sign-in email_code flow — handled by parent; resend may differ
        Alert.alert("Code resent", "A new verification code has been sent.");
        startResendCooldown();
        return;
      }
      startResendCooldown();
      Alert.alert("Code resent", "A new verification code has been sent to your email.");
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message: string }> };
      Alert.alert("Error", clerkErr?.errors?.[0]?.message ?? "Failed to resend code.");
    }
  }, [resendCooldown, context, signUp, signIn, startResendCooldown]);

  return (
    <SafeAreaView style={s.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={s.keyboard}
      >
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.content}>
            {/* Brand */}
            <BrandMark />

            {/* Heading */}
            <AuthHeading
              title="Check your email"
              subtitle={
                <>
                  We sent a 6-digit code to{"\n"}
                  <Text style={s.subtitleStrong}>{email}</Text>
                </>
              }
            />

            {/* Card */}
            <View style={s.card}>
              <View style={s.formLoose}>
                {/* OTP input */}
                <OtpInput
                  value={code}
                  onChange={(v) => {
                    setCode(v);
                    if (codeError) setCodeError(null);
                    // Auto-submit when 6 digits entered
                    if (v.length === 6) {
                      setTimeout(() => handleVerify(), 100);
                    }
                  }}
                  hasError={!!codeError}
                />

                {/* Error message */}
                {codeError && (
                  <Text style={[s.error, { textAlign: "center" }]}>
                    {codeError}
                  </Text>
                )}

                <AuthButton
                  label="Confirm code"
                  onPress={handleVerify}
                  loading={loading}
                  disabled={code.length < 6}
                />

                {/* Resend */}
                <View style={{ alignItems: "center" }}>
                  <Text style={[s.helper, { textAlign: "center" }]}>
                    Didn&apos;t receive it?{" "}
                  </Text>
                  <TouchableOpacity
                    onPress={handleResend}
                    disabled={resendCooldown > 0}
                    style={{ marginTop: 4 }}
                  >
                    <Text style={s.link}>
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : "Resend code"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Back link */}
            <View style={s.linkRow}>
              <TouchableOpacity onPress={handleGoBack}>
                <Text style={s.link}>← Go back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
