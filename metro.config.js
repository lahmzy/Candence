const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// withNativewind() turns on react-native-css's "globalClassNamePolyfill",
// which rewrites EVERY `import … from "react-native"` to its own
// `react-native-css/components` shim. That shim only re-exports a hand-picked
// list of RN APIs — `AssetRegistry` is not one of them — so any package in
// node_modules that imports it gets `undefined`.
//
// expo-asset does exactly that (AssetRegistry.getAssetByID), which is what
// crashes expo-font's `useFonts()` with:
//   TypeError: Cannot read property 'getAssetByID' of undefined
// and leaves Plus Jakarta Sans unloaded on device.
//
// Fix: keep the shim for first-party app code (where `className` is used),
// but let packages inside node_modules resolve `react-native` to the real
// module. Wrapping the resolver (instead of replacing it) keeps every other
// react-native-css behaviour — css imports, the override module, the
// react-native-safe-area-context shim — intact.
const withNativewindConfig = withNativewind(config);
const nativeWindResolve = withNativewindConfig.resolver?.resolveRequest;

withNativewindConfig.resolver = {
  ...withNativewindConfig.resolver,
  resolveRequest: (context, moduleName, platform) => {
    const origin = context.originModulePath ?? "";
    const fromNodeModules = origin.includes(`${path.sep}node_modules${path.sep}`);
    const fromReactNativeCss = origin.includes(`${path.sep}react-native-css${path.sep}`);

    if (
      fromNodeModules &&
      !fromReactNativeCss &&
      (moduleName === "react-native" || moduleName.startsWith("react-native/"))
    ) {
      // Resolve against the real react-native, bypassing the shim.
      const baseResolve =
        config.resolver?.resolveRequest ?? context.resolveRequest;
      if (baseResolve) {
        return baseResolve(context, moduleName, platform);
      }
      return { type: "sourceFile", filePath: require.resolve("react-native") };
    }

    if (nativeWindResolve) {
      return nativeWindResolve(context, moduleName, platform);
    }
    const baseResolve =
      config.resolver?.resolveRequest ?? context.resolveRequest;
    if (baseResolve) {
      return baseResolve(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = withNativewindConfig;
