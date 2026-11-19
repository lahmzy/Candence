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
import { useSignUp } from "@clerk/expo/legacy";
import { useRouter, Link } from "expo-router";
import clsx from "clsx";
import { BrandMark, AuthField, AuthButton } from "@/components/auth/auth-ui";

// ─── Validation ───────────────────────────────────────────────────────────────

function validateName(name: string): string | null {
  if (!name.trim()) return "Full name is required.";
  if (name.trim().length < 2) return "Name must be at least 2 characters.";
  return null;
}

function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return "Enter a valid email address.";
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Include at least one uppercase letter.";
  if (!/[0-9]/.test(password)) return "Include at least one number.";
  return null;
}

// ─── Password Strength ────────────────────────────────────────────────────────

function passwordStrength(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
  if (password.length >= 12 && /[^A-Za-z0-9]/.test(password)) score++;
  return score as 0 | 1 | 2 | 3;
}

const strengthLabels = ["", "Weak", "Fair", "Strong"] as const;
const strengthColors = [
  "",
  "bg-destructive",
  "bg-yellow-500",
  "bg-success",
] as const;

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = passwordStrength(password);
  if (!password) return null;
  return (
    <View className="mt-2 gap-1">
      <View className="flex-row gap-1.5">
        {[1, 2, 3].map((level) => (
          <View
            key={level}
            className={clsx(
              "h-1 flex-1 rounded-full",
              level <= strength ? strengthColors[strength] : "bg-border"
            )}
          />
        ))}
      </View>
      <Text className="text-xs font-sans-medium text-muted-foreground">
        {strengthLabels[strength]}
      </Text>
    </View>
  );
}

// ─── Sign Up Screen ───────────────────────────────────────────────────────────

export default function SignUpScreen() {
  const { isLoaded, signUp } = useSignUp();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleSignUp = useCallback(async () => {
    if (!isLoaded) return;

    // Validate before hitting the network
    const nErr = validateName(name);
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setNameError(nErr);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (nErr || eErr || pErr) return;

    setLoading(true);
    try {
      // Split name into first / last
      const nameParts = name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || undefined;

      await signUp.create({
        emailAddress: email.trim().toLowerCase(),
        password,
        firstName,
        lastName,
      });

      // Send email verification OTP
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Navigate to verify screen, passing email for display
      router.push({
        pathname: "/(auth)/verify",
        params: { email: email.trim().toLowerCase(), context: "sign-up" },
      });
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message: string; code?: string }> };
      const msg =
        clerkErr?.errors?.[0]?.message ??
        "Something went wrong. Please try again.";
      Alert.alert("Sign up failed", msg);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, name, email, password, signUp, router]);

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
              <Text className="auth-title">Create account</Text>
              <Text className="auth-subtitle">
                Start tracking your subscriptions in seconds
              </Text>
            </View>

            {/* Card */}
            <View className="auth-card">
              <View className="auth-form">
                {/* Full Name */}
                <AuthField label="Full name" error={nameError ?? undefined}>
                  <TextInput
                    className={clsx(
                      "auth-input",
                      nameError && "auth-input-error",
                      nameFocused && "border-accent"
                    )}
                    placeholder="Enter your name"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    value={name}
                    onChangeText={(t) => {
                      setName(t);
                      if (nameError) setNameError(null);
                    }}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => {
                      setNameFocused(false);
                      setNameError(validateName(name));
                    }}
                    autoCapitalize="words"
                    textContentType="name"
                    returnKeyType="next"
                  />
                </AuthField>

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
                  <View>
                    <View className="relative">
                      <TextInput
                        className={clsx(
                          "auth-input",
                          passwordError && "auth-input-error",
                          passwordFocused && "border-accent"
                        )}
                        placeholder="Create a password"
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
                        textContentType="newPassword"
                        returnKeyType="done"
                        onSubmitEditing={handleSignUp}
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
                    <PasswordStrengthBar password={password} />
                  </View>
                </AuthField>

                {/* Helper */}
                <Text className="auth-helper">
                  By continuing you agree to our Terms of Service and Privacy
                  Policy.
                </Text>

                {/* CTA */}
                <AuthButton
                  label="Create account"
                  onPress={handleSignUp}
                  loading={loading}
                  disabled={!isLoaded}
                />
              </View>
            </View>

            {/* Footer */}
            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account?</Text>
              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity>
                  <Text className="auth-link">Sign in</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

