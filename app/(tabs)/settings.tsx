import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from 'nativewind';

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background p-5">
      <Text>settings</Text>
    </SafeAreaView>
  );
};

export default Settings;

const styles = StyleSheet.create({});
