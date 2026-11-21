import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useAuth, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import dayjs from "dayjs";
import images from "@/constants/images";
import { useSubscriptionStore } from "@/lib/subscriptionStore";

const SafeAreaView = styled(RNSafeAreaView);

export default function Settings() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const subscriptionsCount = useSubscriptionStore(
    (state) => state.subscriptions.length
  );

  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "User";

  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "No email registered";

  const memberSince = user?.createdAt
    ? dayjs(user.createdAt).format("MMM DD, YYYY")
    : "Recently";

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out of Candence?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            setLoggingOut(true);
            await signOut();
            router.replace("/(auth)/sign-in");
          } catch (error) {
            Alert.alert("Error", "Could not sign out. Please try again.");
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-6 pt-4 pb-36"
      >
        {/* Header */}
        <Text className="mb-6 text-3xl font-sans-bold text-primary">
          Settings
        </Text>

        {/* User Card */}
        <View className="mb-6 items-center rounded-3xl border border-border bg-card p-6 overflow-hidden">
          <View className="relative mb-4">
            <Image
              source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
              className="size-24 rounded-full border-2 border-accent"
            />
            <View className="absolute bottom-0 right-0 size-6 items-center justify-center rounded-full border-2 border-card bg-success">
              <Text className="text-[10px] text-white">✓</Text>
            </View>
          </View>

          <Text className="text-xl font-sans-bold text-primary">
            {displayName}
          </Text>
          <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
            {email}
          </Text>

          <View className="mt-3 rounded-full bg-accent/15 px-3 py-1">
            <Text className="text-xs font-sans-semibold text-accent">
              Active Member
            </Text>
          </View>
        </View>

        {/* Basic Details Section */}
        <Text className="mb-3 text-sm font-sans-semibold uppercase tracking-wider text-muted-foreground">
          Account Details
        </Text>
        <View className="mb-6 rounded-2xl border border-border bg-card p-5 overflow-hidden">
          <View className="flex-row items-center justify-between py-2.5">
            <Text className="text-sm font-sans-medium text-muted-foreground">
              Full Name
            </Text>
            <Text className="text-sm font-sans-bold text-primary">
              {displayName}
            </Text>
          </View>

          <View className="h-px bg-border/60" />

          <View className="flex-row items-center justify-between py-2.5">
            <Text className="text-sm font-sans-medium text-muted-foreground">
              Email
            </Text>
            <Text className="max-w-[200px] text-sm font-sans-bold text-primary" numberOfLines={1}>
              {email}
            </Text>
          </View>

          <View className="h-px bg-border/60" />

          <View className="flex-row items-center justify-between py-2.5">
            <Text className="text-sm font-sans-medium text-muted-foreground">
              Member Since
            </Text>
            <Text className="text-sm font-sans-bold text-primary">
              {memberSince}
            </Text>
          </View>

          <View className="h-px bg-border/60" />

          <View className="flex-row items-center justify-between py-2.5">
            <Text className="text-sm font-sans-medium text-muted-foreground">
              Active Subscriptions
            </Text>
            <Text className="text-sm font-sans-bold text-accent">
              {subscriptionsCount}
            </Text>
          </View>
        </View>

        {/* App Info Section */}
        <Text className="mb-3 text-sm font-sans-semibold uppercase tracking-wider text-muted-foreground">
          Preferences & About
        </Text>
        <View className="mb-6 rounded-2xl border border-border bg-card p-5 overflow-hidden">
          <View className="flex-row items-center justify-between py-2.5">
            <Text className="text-sm font-sans-medium text-muted-foreground">
              Currency
            </Text>
            <Text className="text-sm font-sans-bold text-primary">
              USD ($)
            </Text>
          </View>

          <View className="h-px bg-border/60" />

          <View className="flex-row items-center justify-between py-2.5">
            <Text className="text-sm font-sans-medium text-muted-foreground">
              Version
            </Text>
            <Text className="text-sm font-sans-bold text-primary">
              1.0.0
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <Pressable
          className="items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10 py-4 active:opacity-80 overflow-hidden"
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator color="#dc2626" />
          ) : (
            <Text className="text-base font-sans-bold text-destructive">
              Log Out
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
