import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Recipe } from '../domain/models';
import FoodImage from '../../../shared/components/FoodImage';
import Icon from '../../../shared/components/Icon';
import {
  categoryLabel,
  colors,
  fonts,
  radius,
} from '../../../shared/theme/tokens';

export default function FeaturedRecipe({
  recipe,
  onOpen,
}: {
  recipe?: Recipe;
  onOpen: (recipe: Recipe) => void;
}) {
  if (!recipe) {
    return (
      <View
        style={[styles.hero, styles.skeleton]}
        accessibilityRole="progressbar"
        accessibilityLabel="Carregando receitas em destaque"
      >
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonSubtitle} />
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Explorar destaque ${recipe.name}`}
      onPress={() => onOpen(recipe)}
      style={({ pressed }) => [styles.hero, pressed && styles.pressed]}
    >
      <FoodImage
        uri={recipe.image}
        label={recipe.name}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.08)', 'rgba(0,0,0,0.78)']}
        locations={[0, 0.3, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.tag}>
        <Text style={styles.tagText}>EM DESTAQUE</Text>
      </View>
      <View style={styles.bottom}>
        <View style={styles.copy}>
          <Text style={styles.category}>
            {categoryLabel(recipe.category).toUpperCase()}
          </Text>
          <Text style={styles.title} numberOfLines={2}>
            {recipe.name}
          </Text>
          <Text style={styles.link}>Explore a receita</Text>
        </View>
        <View style={styles.arrow}>
          <Icon name="arrow-up-right" color={colors.text} size={21} />
        </View>
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  hero: {
    height: 244,
    borderRadius: radius.large,
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: 22,
    backgroundColor: colors.primary,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 9,
  },
  tagText: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 9,
    letterSpacing: 1.6,
  },
  bottom: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  copy: { flex: 1, gap: 6 },
  category: {
    color: '#F3E9D8',
    fontFamily: fonts.medium,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  title: {
    color: colors.surface,
    fontFamily: fonts.display,
    fontSize: 29,
    lineHeight: 33,
    letterSpacing: -0.3,
  },
  link: {
    color: '#FFF9EF',
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 5,
  },
  arrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  skeleton: {
    backgroundColor: colors.cream,
    justifyContent: 'flex-end',
    gap: 12,
  },
  skeletonTitle: {
    width: '65%',
    height: 22,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  skeletonSubtitle: {
    width: '40%',
    height: 12,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
});
