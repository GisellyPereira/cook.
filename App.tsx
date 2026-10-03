import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/app/AppNavigator';
import { AsyncStorageKitchenStorage } from './src/features/kitchen/data/AsyncStorageKitchenStorage';
import { KitchenStorage } from './src/features/kitchen/domain/models';
import { KitchenProvider } from './src/features/kitchen/context/KitchenProvider';
import { TheMealDbRepository } from './src/features/recipes/data/TheMealDbRepository';
import { RecipeRepository } from './src/features/recipes/domain/models';
import { colors } from './src/shared/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 250, fade: true });

const fontSources = {
  DMSans_400Regular: require('@expo-google-fonts/dm-sans/400Regular/DMSans_400Regular.ttf'),
  DMSans_500Medium: require('@expo-google-fonts/dm-sans/500Medium/DMSans_500Medium.ttf'),
  DMSans_700Bold: require('@expo-google-fonts/dm-sans/700Bold/DMSans_700Bold.ttf'),
  DMSerifDisplay_400Regular: require('@expo-google-fonts/dm-serif-display/400Regular/DMSerifDisplay_400Regular.ttf'),
};

const defaultRepository = new TheMealDbRepository(
  process.env.EXPO_PUBLIC_MEALDB_API_KEY || '1',
);
const defaultStorage = new AsyncStorageKitchenStorage();

type AppProps = {
  repository?: RecipeRepository;
  storage?: KitchenStorage;
};

export default function App({
  repository = defaultRepository,
  storage = defaultStorage,
}: AppProps = {}) {
  const [fontsLoaded, fontError] = useFonts(fontSources);
  if (!fontsLoaded && !fontError) {
    return null;
  }
  return (
    <SafeAreaProvider>
      <View
        style={styles.container}
        onLayout={() => {
          SplashScreen.hideAsync().catch(() => {});
        }}
      >
        <KitchenProvider storage={storage}>
          <AppNavigator repository={repository} />
        </KitchenProvider>
      </View>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
