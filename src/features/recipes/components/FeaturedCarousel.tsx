import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  AppState,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useReducedMotion } from '../../../shared/hooks/useReducedMotion';
import { colors } from '../../../shared/theme/tokens';
import { Recipe } from '../domain/models';
import FeaturedRecipe from './FeaturedRecipe';

export default function FeaturedCarousel({
  recipes,
  active,
  onOpen,
}: {
  recipes: Recipe[];
  active: boolean;
  onOpen: (recipe: Recipe) => void;
}) {
  const scroll = useRef<ScrollView>(null);
  const reducedMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const [foreground, setForeground] = useState(
    AppState.currentState !== 'background',
  );
  const [screenReader, setScreenReader] = useState(true);
  const automatic =
    active &&
    foreground &&
    !paused &&
    !screenReader &&
    reducedMotion === false &&
    width > 0 &&
    recipes.length > 1;

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isScreenReaderEnabled()
      .then(enabled => {
        if (mounted) {
          setScreenReader(enabled);
        }
      })
      .catch(() => {});
    const accessibility = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setScreenReader,
    );
    const appState = AppState.addEventListener('change', state =>
      setForeground(state === 'active'),
    );
    return () => {
      mounted = false;
      accessibility.remove();
      appState.remove();
      clearTimeout(resumeTimer.current);
    };
  }, []);
  useEffect(() => {
    setIndex(0);
  }, [recipes]);
  useEffect(() => {
    scroll.current?.scrollTo({
      x: index * width,
      animated: reducedMotion === false,
    });
  }, [index, width, reducedMotion]);
  useEffect(() => {
    if (!automatic) {
      return;
    }
    const timer = setInterval(
      () => setIndex(current => (current + 1) % recipes.length),
      6000,
    );
    return () => clearInterval(timer);
  }, [automatic, recipes.length]);

  function pauseTemporarily() {
    setPaused(true);
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), 12000);
  }
  return (
    <View style={styles.container}>
      <View
        testID="featured-carousel"
        onLayout={event => setWidth(event.nativeEvent.layout.width)}
      >
        {recipes.length ? (
          <ScrollView
            ref={scroll}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScrollBeginDrag={pauseTemporarily}
            onTouchStart={pauseTemporarily}
            onMomentumScrollEnd={event => {
              if (width) {
                setIndex(
                  Math.max(
                    0,
                    Math.min(
                      recipes.length - 1,
                      Math.round(event.nativeEvent.contentOffset.x / width),
                    ),
                  ),
                );
              }
            }}
          >
            {recipes.map((recipe, position) => (
              <View
                key={recipe.id}
                style={{ width }}
                aria-hidden={position !== index}
                accessibilityElementsHidden={position !== index}
                importantForAccessibility={
                  position === index ? 'auto' : 'no-hide-descendants'
                }
              >
                <FeaturedRecipe recipe={recipe} onOpen={onOpen} />
              </View>
            ))}
          </ScrollView>
        ) : (
          <FeaturedRecipe onOpen={onOpen} />
        )}
      </View>
      {recipes.length > 1 && (
        <View
          style={styles.dots}
          accessibilityLabel={`Destaque ${index + 1} de ${recipes.length}`}
        >
          {recipes.map((recipe, position) => (
            <Pressable
              key={recipe.id}
              accessibilityRole="button"
              accessibilityLabel={`Mostrar destaque ${position + 1}: ${
                recipe.name
              }`}
              accessibilityState={{ selected: position === index }}
              onPress={() => {
                pauseTemporarily();
                setIndex(position);
              }}
              style={styles.dotTarget}
            >
              <View
                style={[styles.dot, position === index && styles.activeDot]}
              />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { gap: 4 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotTarget: {
    width: 28,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.border },
  activeDot: { width: 18, backgroundColor: colors.primary },
});
