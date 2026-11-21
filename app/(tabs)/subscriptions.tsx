import React, { useState, useMemo } from "react";
import { FlatList, Image, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { icons } from "@/constants/icons";

const SafeAreaView = styled(RNSafeAreaView);

export default function Subscriptions() {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subscriptions;
    return subscriptions.filter(
      (sub) =>
        sub.name.toLowerCase().includes(q) ||
        sub.category?.toLowerCase().includes(q) ||
        sub.plan?.toLowerCase().includes(q) ||
        sub.billing.toLowerCase().includes(q) ||
        sub.status?.toLowerCase().includes(q)
    );
  }, [search, subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      {/* Header */}
      <Text className="subs-page-title">Subscriptions</Text>

      {/* Search bar */}
      <View className="subs-search-bar">
        <Image source={icons.menu} className="subs-search-icon" />
        <TextInput
          className="subs-search-input"
          placeholder="Search subscriptions…"
          placeholderTextColor="rgba(0,0,0,0.35)"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Results count */}
      <Text className="subs-count">
        {filtered.length} subscription{filtered.length !== 1 ? "s" : ""}
        {search.trim() ? ` matching "${search.trim()}"` : ""}
      </Text>

      {/* Subscription list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedId === item.id}
            onPress={() =>
              setExpandedId((prev) => (prev === item.id ? null : item.id))
            }
          />
        )}
        extraData={expandedId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="subs-empty">
            <Text className="subs-empty-title">No results</Text>
            <Text className="subs-empty-subtitle">
              Try a different search term
            </Text>
          </View>
        }
        contentContainerClassName="pb-30"
      />
    </SafeAreaView>
  );
}
