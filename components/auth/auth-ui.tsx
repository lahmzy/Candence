import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import clsx from "clsx";

// ─── BrandMark ───────────────────────────────────────────────────────────────

export function BrandMark() {
  return (
    <View className="auth-brand-block">
      <View className="auth-logo-wrap">
        <View className="auth-logo-mark">
          <Text className="auth-logo-mark-text">C</Text>
        </View>
        <View>
          <Text className="auth-wordmark">Candence</Text>
          <Text className="auth-wordmark-sub">Smart Subscriptions</Text>
        </View>
      </View>
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
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>
      {children}
      {error ? <Text className="auth-error">{error}</Text> : null}
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
      className={clsx("auth-button", (disabled || loading) && "auth-button-disabled")}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      <Text className="auth-button-text">
        {loading ? "Please wait…" : label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── AuthDivider ─────────────────────────────────────────────────────────────

export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <View className="auth-divider-row">
      <View className="auth-divider-line" />
      <Text className="auth-divider-text">{label}</Text>
      <View className="auth-divider-line" />
    </View>
  );
}

