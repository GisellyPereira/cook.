import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AboutSheet from './components/AboutSheet';
import AppHeader from './components/AppHeader';
import BottomNavigation from './components/BottomNavigation';
import EmptyState from '../shared/components/EmptyState';
import IngredientPicker from '../features/kitchen/components/IngredientPicker';
import Menu from './components/Menu';
import { useKitchen } from '../features/kitchen/context/KitchenProvider';
import { Recipe, RecipeRepository } from '../features/recipes/domain/models';
import { useRecipeSearch } from '../features/recipes/hooks/useRecipeSearch';
import DiscoverScreen from '../features/recipes/screens/DiscoverScreen';
import FavoritesScreen from '../features/recipes/screens/FavoritesScreen';
import PantryScreen from '../features/kitchen/screens/PantryScreen';
import RecipeDetailScreen from '../features/recipes/screens/RecipeDetailScreen';
import ShoppingScreen from '../features/kitchen/screens/ShoppingScreen';
import { colors, fonts } from '../shared/theme/tokens';
import { AppRoute } from './routes';
export default function AppNavigator({
  repository,
}: {
  repository: RecipeRepository;
}) {
  const [route, setRoute] = useState<AppRoute>('discover');
  const [recipeHistory, setRecipeHistory] = useState<Recipe[]>([]);
  const selectedRecipe = recipeHistory[recipeHistory.length - 1];
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const kitchen = useKitchen();
  const search = useRecipeSearch(repository);
  function navigateTo(next: AppRoute) {
    setRoute(next);
    setRecipeHistory([]);
    setMenuOpen(false);
  }
  useEffect(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selectedRecipe) {
        setRecipeHistory(current => current.slice(0, -1));
        return true;
      }
      if (route !== 'discover') {
        setRoute('discover');
        return true;
      }
      return false;
    });
    return () => listener.remove();
  }, [selectedRecipe, route]);
  const openPicker = () => setPickerOpen(true);
  const openRecipe = (recipe: Recipe) =>
    setRecipeHistory(current =>
      current[current.length - 1]?.id === recipe.id
        ? current
        : [...current, recipe],
    );
  function renderScreen() {
    switch (route) {
      case 'discover':
        return (
          <DiscoverScreen
            search={search}
            onAddIngredients={openPicker}
            onOpenRecipe={openRecipe}
            searchVisible={searchVisible}
            active={!selectedRecipe && !menuOpen && !pickerOpen && !aboutOpen}
          />
        );
      case 'pantry':
        return (
          <PantryScreen
            onAddIngredients={openPicker}
            onDiscover={() => navigateTo('discover')}
          />
        );
      case 'favorites':
        return (
          <FavoritesScreen
            onOpenRecipe={openRecipe}
            onDiscover={() => navigateTo('discover')}
          />
        );
      case 'shopping':
        return <ShoppingScreen onDiscover={() => navigateTo('discover')} />;
    }
  }
  return (
    <SafeAreaView
      style={styles.container}
      edges={
        selectedRecipe || !kitchen.hydrated
          ? ['top', 'right', 'bottom', 'left']
          : ['top', 'right', 'left']
      }
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {!kitchen.hydrated ? (
        <View style={styles.startup}>
          {kitchen.loadError ? (
            <EmptyState
              icon="alert-circle"
              title="Não conseguimos abrir sua cozinha"
              description="Houve um problema ao ler os dados deste aparelho. Tente novamente para preservar seus ingredientes e receitas."
              action={{
                label: 'Tentar abrir novamente',
                onPress: kitchen.retryLoad,
              }}
            />
          ) : (
            <>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>Abrindo sua cozinha…</Text>
            </>
          )}
        </View>
      ) : (
        <>
          <AppHeader
            backLabel={
              recipeHistory.length > 1
                ? 'Voltar à receita anterior'
                : 'Voltar às receitas'
            }
            onOpenMenu={() => setMenuOpen(true)}
            onSearch={() => {
              navigateTo('discover');
              setSearchVisible(value => !value);
            }}
            onBack={
              selectedRecipe
                ? () => setRecipeHistory(current => current.slice(0, -1))
                : undefined
            }
          />
          {kitchen.saveError && (
            <View style={styles.warning}>
              <Text style={styles.warningText}>
                Não foi possível guardar suas últimas alterações.
              </Text>
              <Text
                accessibilityRole="button"
                accessibilityLabel="Tentar salvar"
                onPress={kitchen.retrySave}
                style={styles.retry}
              >
                Tentar salvar
              </Text>
            </View>
          )}
          <View style={[styles.screen, selectedRecipe && styles.hiddenScreen]}>
            {renderScreen()}
          </View>
          {selectedRecipe && (
            <RecipeDetailScreen
              key={selectedRecipe.id}
              recipe={selectedRecipe}
              repository={repository}
              candidates={[
                ...search.recipes,
                ...search.featuredRecipes,
                ...kitchen.favorites,
              ]}
              onOpenRecipe={openRecipe}
              onShopping={() => navigateTo('shopping')}
            />
          )}
          {!selectedRecipe && (
            <BottomNavigation
              activeRoute={route}
              onNavigate={navigateTo}
              shoppingCount={
                kitchen.shopping.filter(item => !item.checked).length
              }
            />
          )}
          {menuOpen && (
            <Menu
              visible
              onClose={() => setMenuOpen(false)}
              activeRoute={route}
              onNavigate={navigateTo}
              onAbout={() => {
                setMenuOpen(false);
                setAboutOpen(true);
              }}
            />
          )}
          {pickerOpen && (
            <IngredientPicker visible onClose={() => setPickerOpen(false)} />
          )}
          {aboutOpen && (
            <AboutSheet visible onClose={() => setAboutOpen(false)} />
          )}
        </>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1 },
  hiddenScreen: { display: 'none' },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  startup: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22,
    gap: 16,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  warning: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    backgroundColor: colors.accentSoft,
    flexDirection: 'row',
    gap: 12,
  },
  warningText: {
    flex: 1,
    color: colors.error,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fonts.regular,
  },
  retry: {
    color: colors.error,
    fontSize: 12,
    paddingVertical: 4,
    fontFamily: fonts.bold,
  },
});
