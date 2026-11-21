import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ImageSourcePropType,
} from 'react-native';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { icons } from '@/constants/icons';
import { useSubscriptionStore } from '@/lib/subscriptionStore';

type Frequency = 'Monthly' | 'Yearly';

const CATEGORIES = [
  'Entertainment',
  'AI Tools',
  'Developer Tools',
  'Design',
  'Productivity',
  'Other',
] as const;

type Category = (typeof CATEGORIES)[number];

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: '#ff6b6b',
  'AI Tools': '#b8d4e3',
  'Developer Tools': '#e8def8',
  Design: '#f5c542',
  Productivity: '#95e1d3',
  Other: '#d4d4d4',
};

function getSubscriptionIcon(name: string): ImageSourcePropType {
  const lower = name.toLowerCase();
  if (lower.includes('spotify')) return icons.spotify;
  if (lower.includes('figma')) return icons.figma;
  if (lower.includes('github')) return icons.github;
  if (lower.includes('claude')) return icons.claude;
  if (lower.includes('notion')) return icons.notion;
  if (lower.includes('adobe')) return icons.adobe;
  if (lower.includes('canva')) return icons.canva;
  if (lower.includes('dropbox')) return icons.dropbox;
  if (lower.includes('openai') || lower.includes('chatgpt')) return icons.openai;
  if (lower.includes('medium')) return icons.medium;
  return icons.plus;
}

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onSubmit,
}: CreateSubscriptionModalProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('Monthly');
  const [category, setCategory] = useState<Category>('Other');

  const addSubscription = useSubscriptionStore((state) => state.addSubscription);

  const isValidPrice = () => {
    const trimmed = price.trim();
    if (!trimmed) return false;
    const num = Number(trimmed);
    return Number.isFinite(num) && num > 0;
  };

  const isFormValid = name.trim().length > 0 && isValidPrice();

  const resetForm = () => {
    setName('');
    setPrice('');
    setFrequency('Monthly');
    setCategory('Other');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!isFormValid) return;

    const priceValue = parseFloat(Number(price.trim()).toFixed(2));
    const now = dayjs();
    const renewalDate =
      frequency === 'Monthly'
        ? now.add(1, 'month').toISOString()
        : now.add(1, 'year').toISOString();

    const newSub: Subscription = {
      id: `sub-${Date.now()}`,
      name: name.trim(),
      price: priceValue,
      currency: 'USD',
      billing: frequency,
      category,
      status: 'active',
      startDate: now.toISOString(),
      renewalDate,
      icon: getSubscriptionIcon(name),
      color: CATEGORY_COLORS[category] || '#d4d4d4',
    };

    addSubscription(newSub);
    onSubmit?.(newSub);
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <Pressable className="modal-overlay" onPress={handleClose}>
          <Pressable className="modal-container" onPress={() => {}}>
            {/* Header */}
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable className="modal-close" onPress={handleClose}>
                <Text className="modal-close-text">✕</Text>
              </Pressable>
            </View>

            {/* Form */}
            <ScrollView
              className="p-5"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ gap: 20, paddingBottom: 24 }}
            >
              {/* Name field */}
              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <TextInput
                  className="auth-input"
                  placeholder="e.g. Netflix, Spotify"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              {/* Price field */}
              <View className="auth-field">
                <Text className="auth-label">Price ($)</Text>
                <TextInput
                  className="auth-input"
                  placeholder="0.00"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Frequency field - 2 pressables side by side */}
              <View className="auth-field">
                <Text className="auth-label">Frequency</Text>
                <View className="picker-row">
                  <Pressable
                    className={clsx(
                      'picker-option',
                      frequency === 'Monthly' && 'picker-option-active'
                    )}
                    onPress={() => setFrequency('Monthly')}
                  >
                    <Text
                      className={clsx(
                        'picker-option-text',
                        frequency === 'Monthly' && 'picker-option-text-active'
                      )}
                    >
                      Monthly
                    </Text>
                  </Pressable>

                  <Pressable
                    className={clsx(
                      'picker-option',
                      frequency === 'Yearly' && 'picker-option-active'
                    )}
                    onPress={() => setFrequency('Yearly')}
                  >
                    <Text
                      className={clsx(
                        'picker-option-text',
                        frequency === 'Yearly' && 'picker-option-text-active'
                      )}
                    >
                      Yearly
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Category field */}
              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat}
                      className={clsx(
                        'category-chip',
                        category === cat && 'category-chip-active'
                      )}
                      onPress={() => setCategory(cat)}
                    >
                      <Text
                        className={clsx(
                          'category-chip-text',
                          category === cat && 'category-chip-text-active'
                        )}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Submit Button */}
              <Pressable
                className={clsx(
                  'auth-button',
                  !isFormValid && 'auth-button-disabled'
                )}
                onPress={handleSubmit}
                disabled={!isFormValid}
              >
                <Text className="auth-button-text">Add Subscription</Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateSubscriptionModal;
