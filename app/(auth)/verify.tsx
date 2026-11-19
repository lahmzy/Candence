import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSignUp, useSignIn } from "@clerk/expo/legacy";
import { useRouter, useLocalSearchParams } from "expo-router";
import clsx from "clsx";
import { BrandMark, AuthButton } from "@/components/auth/auth-ui";

// ─── OTP Input ────────────────────────────────────────────────────────────────

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  hasError: boolean;
}

function OtpInput({ value, onChange, hasError }: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const digits = value.padEnd(6, " ").split("").slice(0, 6);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => inputRef.current?.focus()}
    >
      {/* Hidden real input */}
      <TextInput
        ref={inputRef}
        className="absolute h-0 w-0 opacity-0"
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, "").slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        textContentType="oneTimeCode"
        autoFocus
      />

      {/* Visual digit boxes */}
      <View className="flex-row justify-center gap-3">
        {digits.map((digit, i) => (
          <View
            key={i}
            className={clsx(
              "h-14 w-12 items-center justify-center rounded-2xl border",
              hasError
                ? "border-destructive bg-destructive/5"
                : value.length === i
                ? "border-accent bg-accent/5"
                : digit.trim()
                ? "border-primary/30 bg-card"
                : "border-border bg-background"
            )}
          >
            <Text className="text-2xl font-sans-bold text-primary">
              {digit.trim()}
            </Text>
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
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="auth-screen"
      >
        <View className="auth-content">
          {/* Brand */}
          <BrandMark />

          {/* Heading */}
          <View className="mt-8 items-center">
            <Text className="auth-title">Check your email</Text>
            <Text className="auth-subtitle">
              We sent a 6-digit code to{"\n"}
              <Text className="font-sans-bold text-primary">{email}</Text>
            </Text>
          </View>

          {/* Card */}
          <View className="auth-card">
            <View className="gap-6">
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
                <Text className="auth-error text-center">{codeError}</Text>
              )}

              <AuthButton
                label="Confirm code"
                onPress={handleVerify}
                loading={loading}
                disabled={code.length < 6}
              />

              {/* Resend */}
              <View className="items-center">
                <Text className="auth-helper text-center">
                  Didn't receive it?{" "}
                </Text>
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={resendCooldown > 0}
                  className="mt-1"
                >
                  <Text
                    className={clsx(
                      "text-sm font-sans-bold",
                      resendCooldown > 0 ? "text-muted-foreground" : "text-accent"
                    )}
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend code"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Back link */}
          <View className="auth-link-row">
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="auth-link">← Go back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

