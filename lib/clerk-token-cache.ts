import * as SecureStore from "expo-secure-store";
import type { TokenCache } from "@clerk/expo";

/**
 * Secure token cache for Clerk using expo-secure-store.
 * Keys are stored encrypted in the device keychain (iOS) / keystore (Android).
 */
export const tokenCache: TokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // silent — token will just not persist
    }
  },
  async clearToken(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // silent
    }
  },
};

