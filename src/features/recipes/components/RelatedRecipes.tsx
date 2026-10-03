import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import FoodImage from '../../../shared/components/FoodImage';
import Button from '../../../shared/components/Button';
import {
  categoryLabel,
  colors,
  fonts,
  radius,
} from '../../../shared/theme/tokens';
import { Recipe, RecipeRepository } from '../domain/models';
import { useRelatedRecipes } from '../hooks/useRelatedRecipes';

export default function RelatedRecipes({
  recipe,
  repository,
  candidates,
  onOpen,
}: {
  recipe: Recipe;
  repository: RecipeRepository;
  candidates: Recipe[];
  onOpen: (recipe: Recipe) => void;
}) {
  const related = useRelatedRecipes(recipe, repository, candidates);
  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>CONTINUE EXPLORANDO</Text>
        <Text style={styles.title}>Você também pode gostar</Text>
      </View>
      {related.recipes.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
        >
          {related.recipes.map(item => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`Ver receita relacionada ${item.name}`}
              onPress={() => onOpen(item)}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <FoodImage
                uri={item.image}
                label={item.name}
                style={styles.image}
              />
              <Text style={styles.category}>
                {categoryLabel(item.category).toUpperCase()}
              </Text>
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : related.loading ? (
        <View style={styles.status}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={styles.statusText}>Buscando outras ideias…</Text>
        </View>
      ) : related.error ? (
        <View style={styles.status}>
          <Text style={styles.statusText}>
            Não conseguimos buscar outras receitas.
          </Text>
          <Button
            label="Tentar buscar relacionadas"
            variant="ghost"
            onPress={related.retry}
          />
        </View>
      ) : (
        <Text style={styles.statusText}>
          Ainda não há outras receitas para sugerir.
        </Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  section: {
    gap: 18,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 26,
  },
  heading: { gap: 7 },
  eyebrow: {
    fontFamily: fonts.bold,
    color: colors.accent,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  title: {
    fontFamily: fonts.display,
    color: colors.text,
    fontSize: 26,
    lineHeight: 32,
  },
  rail: { gap: 16, paddingBottom: 4 },
  card: { width: 180, gap: 9 },
  image: { width: 180, height: 140, borderRadius: radius.medium },
  category: {
    fontFamily: fonts.medium,
    color: colors.accent,
    fontSize: 9,
    letterSpacing: 1.1,
  },
  name: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  pressed: { opacity: 0.75 },
  status: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
  },
  statusText: {
    fontFamily: fonts.regular,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 19,
  },
});
