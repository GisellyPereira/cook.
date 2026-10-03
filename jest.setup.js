/* eslint-env jest */
jest.mock('expo/virtual/env', () => ({ env: process.env }));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('./src/shared/components/Icon', () => () => null);
jest.mock('expo-font', () => ({ useFonts: () => [true, null] }));
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(async () => {}),
  hideAsync: jest.fn(async () => {}),
  setOptions: jest.fn(),
}));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: require('react-native').View,
}));

const { AccessibilityInfo } = require('react-native');
jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
jest.spyOn(AccessibilityInfo, 'isScreenReaderEnabled').mockResolvedValue(false);

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaProvider: ({ children }) => children,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 34, left: 0 }),
    SafeAreaView: React.forwardRef((props, ref) =>
      React.createElement(View, { ...props, ref }),
    ),
  };
});
