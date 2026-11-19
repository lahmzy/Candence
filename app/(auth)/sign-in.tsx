import React, { useState, useCallback } from "react";
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
import { useSignIn } from "@clerk/expo/legacy";
import { useRouter, Link } from "expo-router";
import clsx from "clsx";
import { BrandMark, AuthField, AuthButton } from "@/components/auth/auth-ui";

// ─── Validation ───────────────────────────────────────────────────────────────

function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return "Enter a valid email address.";
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  return null;
}

// ─── Sign In Screen ───────────────────────────────────────────────────────────

export default function SignInScreen() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleSignIn = useCallback(async () => {
    if (!isLoaded) return;

    // Validate before hitting the network
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: email.trim().toLowerCase(),
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)");
      } else {
        // Needs additional factor (MFA etc.) — surface to user
        Alert.alert(
          "Additional step required",
          "Please complete the additional verification step."
        );
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message: string; code?: string }> };
      const msg =
        clerkErr?.errors?.[0]?.message ??
        "Something went wrong. Please try again.";
      Alert.alert("Sign in failed", msg);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, email, password, signIn, setActive, router]);

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="auth-screen"
      >
        <ScrollView
          className="auth-scroll"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-content">
            {/* Brand */}
            <BrandMark />

            {/* Heading */}
            <View className="mt-8 items-center">
              <Text className="auth-title">Welcome back</Text>
              <Text className="auth-subtitle">
                Sign in to continue managing your subscriptions
              </Text>
            </View>

            {/* Card */}
            <View className="auth-card">
              <View className="auth-form">
                {/* Email */}
                <AuthField label="Email" error={emailError ?? undefined}>
                  <TextInput
                    className={clsx(
                      "auth-input",
                      emailError && "auth-input-error",
                      emailFocused && "border-accent"
                    )}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      if (emailError) setEmailError(null);
                    }}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => {
                      setEmailFocused(false);
                      setEmailError(validateEmail(email));
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    returnKeyType="next"
                  />
                </AuthField>

                {/* Password */}
                <AuthField label="Password" error={passwordError ?? undefined}>
                  <View className="relative">
                    <TextInput
                      className={clsx(
                        "auth-input",
                        passwordError && "auth-input-error",
                        passwordFocused && "border-accent"
                      )}
                      placeholder="Enter your password"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      value={password}
                      onChangeText={(t) => {
                        setPassword(t);
                        if (passwordError) setPasswordError(null);
                      }}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => {
                        setPasswordFocused(false);
                        setPasswordError(validatePassword(password));
                      }}
                      secureTextEntry={!passwordVisible}
                      textContentType="password"
                      returnKeyType="done"
                      onSubmitEditing={handleSignIn}
                    />
                    <TouchableOpacity
                      className="absolute right-4 top-4"
                      onPress={() => setPasswordVisible((v) => !v)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text className="text-sm font-sans-semibold text-muted-foreground">
                        {passwordVisible ? "Hide" : "Show"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </AuthField>

                {/* Forgot password */}
                <TouchableOpacity className="self-end -mt-2">
                  <Text className="text-sm font-sans-semibold text-accent">
                    Forgot password?
                  </Text>
                </TouchableOpacity>

                {/* CTA */}
                <AuthButton
                  label="Sign in"
                  onPress={handleSignIn}
                  loading={loading}
                  disabled={!isLoaded}
                />
              </View>
            </View>

            {/* Footer */}
            <View className="auth-link-row">
              <Text className="auth-link-copy">New to Candence?</Text>
              <Link href="/(auth)/sign-up" asChild>
                <TouchableOpacity>
                  <Text className="auth-link">Create an account</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

