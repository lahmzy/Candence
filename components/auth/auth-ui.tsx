import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  authColors,
  authStyles as s,
} from "@/components/auth/auth-styles";

// ─── BrandMark ───────────────────────────────────────────────────────────────

export function BrandMark() {
  return (
    <View style={s.brandBlock}>
      <View style={s.logoRow}>
        <View style={s.logoMark}>
          <Text style={s.logoMarkText}>C</Text>
        </View>
        <View>
          <Text style={s.wordmark}>Candence</Text>
          <Text style={s.wordmarkSub}>Smart Subscriptions</Text>
        </View>
      </View>
    </View>
  );
}

// ─── AuthHeading ─────────────────────────────────────────────────────────────

interface AuthHeadingProps {
  title: string;
  subtitle?: React.ReactNode;
}

export function AuthHeading({ title, subtitle }: AuthHeadingProps) {
  return (
    <View style={s.heading}>
      <Text style={s.title}>{title}</Text>
      {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

// ─── AuthField ───────────────────────────────────────────────────────────────

interface AuthFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
}

export function AuthField({ label, children, error }: AuthFieldProps) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      {children}
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}

// ─── AuthButton ──────────────────────────────────────────────────────────────

interface AuthButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function AuthButton({
  label,
  onPress,
  disabled,
  loading,
}: AuthButtonProps) {
  return (
    <TouchableOpacity
      style={[s.button, (disabled || loading) && s.buttonDisabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      <Text style={s.buttonText}>{loading ? "Please wait…" : label}</Text>
    </TouchableOpacity>
  );
}

// ─── AuthDivider ─────────────────────────────────────────────────────────────

export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <View style={s.dividerRow}>
      <View style={s.dividerLine} />
      <Text style={s.dividerText}>{label}</Text>
      <View style={s.dividerLine} />
    </View>
  );
}

// Re-exported so screens can keep using the palette from one place.
export { authColors };
