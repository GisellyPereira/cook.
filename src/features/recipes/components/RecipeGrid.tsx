import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Recipe, RecipeMatch } from '../domain/models';
import { useKitchen } from '../../kitchen/context/KitchenProvider';
import RecipeCard from './RecipeCard';
import { useReducedMotion } from '../../../shared/hooks/useReducedMotion';

export default function RecipeGrid({
  matches,
  onOpen,
}: {
  matches: RecipeMatch[];
  onOpen: (recipe: Recipe) => void;
}) {
  const { width } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const entrance = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (reducedMotion !== false) {
      entrance.setValue(1);
      return;
    }
    entrance.setValue(0);
    const animation = Animated.timing(entrance, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    });
    animation.start();
    return () => animation.stop();
  }, [entrance, reducedMotion]);
  const { favorites, pantry, toggleFavorite } = useKitchen();
  const columns = width >= 800 ? 3 : 2;
  const itemWidth = columns === 3 ? '32%' : '48.5%';
  return (
    <Animated.View
      style={[
        styles.grid,
        {
          opacity: entrance,
          transform: [
            {
              translateY: entrance.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 0],
              }),
            },
          ],
        },
      ]}
    >
      {matches.map(match => (
        <View key={match.recipe.id} style={{ width: itemWidth }}>
          <RecipeCard
            match={match}
            saved={favorites.some(recipe => recipe.id === match.recipe.id)}
            hasPantry={pantry.length > 0}
            onOpen={() => onOpen(match.recipe)}
            onSave={() => toggleFavorite(match.recipe)}
          />
        </View>
      ))}
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 24,
  },
});
