import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RecipeMatch } from '../domain/models';
import {
  categoryLabel,
  colors,
  fonts,
  radius,
} from '../../../shared/theme/tokens';
import FoodImage from '../../../shared/components/FoodImage';
import Icon from '../../../shared/components/Icon';
import IconButton from '../../../shared/components/IconButton';

export default function RecipeCard({
  match,
  saved,
  hasPantry,
  onOpen,
  onSave,
}: {
  match: RecipeMatch;
  saved: boolean;
  hasPantry: boolean;
  onOpen: () => void;
  onSave: () => void;
}) {
  const { recipe, available, missing, percentage } = match;
  const ready = available.length > 0 && missing.length === 0;
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver receita ${recipe.name}`}
        onPress={onOpen}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <View style={styles.photo}>
          <FoodImage
            uri={recipe.image}
            label={recipe.name}
            style={styles.image}
          />
          {hasPantry && (
            <View style={[styles.badge, ready && styles.ready]}>
              <Text style={styles.badgeText}>
                {ready ? 'Você tem tudo' : `${percentage}% na sua cozinha`}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.body}>
          <Text style={styles.category} numberOfLines={1}>
            {categoryLabel(recipe.category).toUpperCase()}
          </Text>
          <Text style={styles.name} numberOfLines={2}>
            {recipe.name}
          </Text>
          <View style={styles.matchRow}>
            <Icon
              name={hasPantry ? (ready ? 'check-circle' : 'pie-chart') : 'list'}
              size={13}
              color={hasPantry ? colors.primary : colors.muted}
            />
            <Text
              style={[styles.matchText, hasPantry && styles.matchActive]}
              numberOfLines={2}
            >
              {hasPantry
                ? `${available.length} de ${
                    available.length + missing.length
                  } ingredientes`
                : `${available.length + missing.length} ingredientes`}
            </Text>
          </View>
          {hasPantry && (
            <View style={styles.track}>
              <View style={[styles.progress, { width: `${percentage}%` }]} />
            </View>
          )}
        </View>
      </Pressable>
      <View style={styles.save}>
        <IconButton
          icon="heart"
          label={`${saved ? 'Remover' : 'Salvar'} receita ${recipe.name}`}
          onPress={onSave}
          active={saved}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  card: { backgroundColor: 'transparent' },
  photo: { borderRadius: radius.medium, overflow: 'hidden' },
  image: { width: '100%', aspectRatio: 1.08 },
  body: { paddingTop: 12, paddingBottom: 6, gap: 7 },
  category: {
    fontFamily: fonts.medium,
    fontSize: 9,
    letterSpacing: 1.1,
    color: colors.accent,
    lineHeight: 14,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 21,
    color: colors.text,
    minHeight: 42,
    letterSpacing: -0.3,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minHeight: 28,
  },
  matchText: {
    fontFamily: fonts.regular,
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  matchActive: { color: colors.primary },
  track: { height: 3, backgroundColor: colors.primarySoft, borderRadius: 2 },
  progress: { height: 3, backgroundColor: colors.primary, borderRadius: 2 },
  save: { position: 'absolute', right: 8, top: 8 },
  badge: {
    position: 'absolute',
    bottom: 9,
    left: 8,
    right: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 4,
  },
  ready: { backgroundColor: colors.primarySoft },
  badgeText: {
    fontFamily: fonts.bold,
    color: colors.primary,
    fontSize: 9,
    lineHeight: 14,
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.985 }] },
});
