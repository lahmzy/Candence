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
import {
  BrandMark,
  AuthHeading,
  AuthField,
  AuthButton,
} from "@/components/auth/auth-ui";
import { authStyles as s } from "@/components/auth/auth-styles";

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
    if (!isLoaded) {
      Alert.alert(
        "Connecting",
        "Authentication service is still initializing. Please wait a moment."
      );
      return;
    }

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

  const isFormFilled = email.trim().length > 0 && password.length > 0;

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
              title="Welcome back"
              subtitle="Sign in to continue managing your subscriptions"
            />

            {/* Card */}
            <View style={s.card}>
              <View style={s.form}>
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
                    <TextInput
                      style={[
                        s.input,
                        s.inputWithAccessory,
                        passwordFocused && s.inputFocused,
                        !!passwordError && s.inputError,
                      ]}
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
                      style={s.inputAccessory}
                      onPress={() => setPasswordVisible((v) => !v)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={s.inputAccessoryText}>
                        {passwordVisible ? "Hide" : "Show"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </AuthField>

                {/* Forgot password */}
                <TouchableOpacity style={{ alignSelf: "flex-end", marginTop: -4 }}>
                  <Text style={s.link}>Forgot password?</Text>
                </TouchableOpacity>

                {/* CTA */}
                <AuthButton
                  label="Sign in"
                  onPress={handleSignIn}
                  loading={loading}
                  disabled={!isFormFilled || loading}
                />
              </View>
            </View>

            {/* Footer */}
            <View style={s.linkRow}>
              <Text style={s.linkCopy}>New to Candence?</Text>
              <Link href="/(auth)/sign-up" asChild>
                <TouchableOpacity>
                  <Text style={s.link}>Create an account</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
