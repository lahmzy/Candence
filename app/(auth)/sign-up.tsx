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
import {
  BrandMark,
  AuthHeading,
  AuthField,
  AuthButton,
} from "@/components/auth/auth-ui";
import {
  authColors,
  authStyles as s,
} from "@/components/auth/auth-styles";

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
  "transparent",
  authColors.destructive,
  "#eab308",
  authColors.success,
] as const;

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = passwordStrength(password);
  if (!password) return null;

  return (
    <View style={{ marginTop: 8, gap: 4 }}>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {[1, 2, 3].map((level) => (
          <View
            key={level}
            style={{
              height: 4,
              flex: 1,
              borderRadius: 999,
              backgroundColor:
                level <= strength ? strengthColors[strength] : "#0000001a",
            }}
          />
        ))}
      </View>
      <Text style={s.helper}>{strengthLabels[strength]}</Text>
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
    if (!isLoaded) {
      Alert.alert(
        "Connecting",
        "Authentication service is still initializing. Please wait a moment."
      );
      return;
    }

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

  const isFormFilled =
    name.trim().length > 0 && email.trim().length > 0 && password.length > 0;

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
              title="Create account"
              subtitle="Start tracking your subscriptions in seconds"
            />

            {/* Card */}
            <View style={s.card}>
              <View style={s.form}>
                {/* Full Name */}
                <AuthField label="Full name" error={nameError ?? undefined}>
                  <TextInput
                    style={[
                      s.input,
                      nameFocused && s.inputFocused,
                      !!nameError && s.inputError,
                    ]}
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
                    style={[
                      s.input,
                      emailFocused && s.inputFocused,
                      !!emailError && s.inputError,
                    ]}
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
                    <View>
                      <TextInput
                        style={[
                          s.input,
                          s.inputWithAccessory,
                          passwordFocused && s.inputFocused,
                          !!passwordError && s.inputError,
                        ]}
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
                        style={s.inputAccessory}
                        onPress={() => setPasswordVisible((v) => !v)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={s.inputAccessoryText}>
                          {passwordVisible ? "Hide" : "Show"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <PasswordStrengthBar password={password} />
                  </View>
                </AuthField>

                {/* Helper */}
                <Text style={s.helper}>
                  By continuing you agree to our Terms of Service and Privacy
                  Policy.
                </Text>

                {/* CTA */}
                <AuthButton
                  label="Create account"
                  onPress={handleSignUp}
                  loading={loading}
                  disabled={!isFormFilled || loading}
                />
              </View>
            </View>

            {/* Footer */}
            <View style={s.linkRow}>
              <Text style={s.linkCopy}>Already have an account?</Text>
              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity>
                  <Text style={s.link}>Sign in</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
