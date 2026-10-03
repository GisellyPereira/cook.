import React, { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import Button from '../../../shared/components/Button';
import FoodImage from '../../../shared/components/FoodImage';
import Icon from '../../../shared/components/Icon';
import IconButton from '../../../shared/components/IconButton';
import Screen from '../../../shared/components/Screen';
import { useKitchen } from '../../kitchen/context/KitchenProvider';
import { matchRecipe } from '../domain/matching';
import { Recipe, RecipeRepository } from '../domain/models';
import RelatedRecipes from '../components/RelatedRecipes';
import {
  categoryLabel,
  colors,
  radius,
  fonts,
} from '../../../shared/theme/tokens';
export default function RecipeDetailScreen({
  recipe,
  onShopping,
  repository,
  candidates,
  onOpenRecipe,
}: {
  recipe: Recipe;
  onShopping: () => void;
  repository: RecipeRepository;
  candidates: Recipe[];
  onOpenRecipe: (recipe: Recipe) => void;
}) {
  const { pantry, favorites, toggleFavorite, toggleIngredient, addMissing } =
    useKitchen();
  const [added, setAdded] = useState(false);
  const [linkError, setLinkError] = useState('');
  const match = matchRecipe(recipe, pantry);
  const saved = favorites.some(item => item.id === recipe.id);
  const pantryIds = new Set(pantry.map(item => item.id));
  const ingredients = [
    ...new Map(
      recipe.ingredients.map(ingredient => [ingredient.id, ingredient]),
    ).values(),
  ];
  const ready = ingredients.length > 0 && match.missing.length === 0;
  async function openLink(url: string) {
    try {
      setLinkError('');
      await Linking.openURL(url);
    } catch {
      setLinkError(
        'Não foi possível abrir o link neste dispositivo. Tente novamente.',
      );
    }
  }
  return (
    <Screen>
      <FoodImage uri={recipe.image} label={recipe.name} style={styles.photo} />
      <View style={styles.heading}>
        <View style={styles.headingText}>
          <Text style={styles.eyebrow}>
            {categoryLabel(recipe.category).toUpperCase()}
            {recipe.area ? ` · ${recipe.area.toUpperCase()}` : ''}
          </Text>
          <Text style={styles.title}>{recipe.name}</Text>
        </View>
        <IconButton
          icon="heart"
          label={saved ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
          active={saved}
          onPress={() => toggleFavorite(recipe)}
        />
      </View>
      <View style={styles.matchCard}>
        <View style={styles.matchTop}>
          <View style={styles.matchText}>
            <Text style={styles.matchTitle}>
              {ready ? 'Sua cozinha está pronta!' : 'Já está na sua cozinha'}
            </Text>
            <Text style={styles.matchDescription}>
              {match.available.length} de {ingredients.length} ingredientes
            </Text>
          </View>
          <Text style={styles.percent}>
            {match.percentage}
            <Text style={styles.percentSymbol}>%</Text>
          </Text>
        </View>
        <View style={styles.track}>
          <View
            style={[
              styles.progress,
              {
                width: `${match.percentage}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.note}>
          A comparação considera os tipos de ingredientes. Confira as
          quantidades abaixo antes de cozinhar.
        </Text>
      </View>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ingredientes</Text>
          <Text style={styles.tag}>{match.missing.length} faltam</Text>
        </View>
        <Text style={styles.note}>
          Marque o que você já tem para atualizar sua cozinha.
        </Text>
        <View style={styles.ingredientList}>
          {recipe.ingredients.map((ingredient, index) => {
            const available = pantryIds.has(ingredient.id);
            return (
              <View
                key={`${ingredient.id}-${index}`}
                style={styles.ingredientRow}
              >
                <View style={[styles.dot, available && styles.availableDot]}>
                  <Icon
                    name={available ? 'check' : 'plus'}
                    size={13}
                    color={available ? colors.primary : colors.accent}
                  />
                </View>
                <View style={styles.ingredientText}>
                  <Text style={styles.ingredientName}>{ingredient.label}</Text>
                  <Text style={styles.measure}>
                    {ingredient.measure || 'Quantidade não informada'}
                  </Text>
                </View>
                <IconButton
                  icon={available ? 'check-circle' : 'plus-circle'}
                  active={available}
                  label={
                    available
                      ? `Remover ${ingredient.label} da cozinha`
                      : `Já tenho ${ingredient.label}`
                  }
                  onPress={() => {
                    toggleIngredient(ingredient);
                    setAdded(false);
                  }}
                />
              </View>
            );
          })}
        </View>
        {match.missing.length > 0 && (
          <Button
            label={
              added ? 'Itens adicionados à lista' : 'Adicionar o que falta'
            }
            icon={added ? 'check' : 'shopping-bag'}
            variant={added ? 'secondary' : 'primary'}
            onPress={() => {
              addMissing(match.missing, recipe.name);
              setAdded(true);
            }}
          />
        )}
        {added && (
          <Button
            label="Ver lista de compras"
            icon="arrow-right"
            variant="ghost"
            onPress={onShopping}
          />
        )}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vamos preparar?</Text>
        <View style={styles.languageNote}>
          <Icon name="globe" color={colors.muted} size={15} />
          <Text style={styles.languageText}>
            Nome, medidas e preparo no idioma original da TheMealDB.
          </Text>
        </View>
        {recipe.instructions.length ? (
          recipe.instructions.map((step, index) => (
            <View key={`${recipe.id}-${index}`} style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>
                  {String(index + 1).padStart(2, '0')}
                </Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.note}>
            Esta receita não tem instruções disponíveis na fonte.
          </Text>
        )}
      </View>
      {(recipe.videoUrl || recipe.sourceUrl) && (
        <View style={styles.section}>
          {recipe.videoUrl && (
            <Button
              label="Assistir ao preparo"
              icon="play"
              variant="secondary"
              onPress={() => openLink(recipe.videoUrl!)}
            />
          )}
          {recipe.sourceUrl && (
            <Button
              label="Ver receita na fonte"
              icon="external-link"
              variant="ghost"
              onPress={() => openLink(recipe.sourceUrl!)}
            />
          )}
          {!!linkError && (
            <Text accessibilityRole="alert" style={styles.error}>
              {linkError}
            </Text>
          )}
        </View>
      )}
      <Text style={styles.credit}>
        Receita e imagem: TheMealDB · Confira o preparo original.
      </Text>
      <RelatedRecipes
        recipe={recipe}
        repository={repository}
        candidates={candidates}
        onOpen={onOpenRecipe}
      />
    </Screen>
  );
}
const styles = StyleSheet.create({
  photo: {
    width: '100%',
    height: 285,
    borderRadius: radius.large,
  },
  heading: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  headingText: {
    flex: 1,
    gap: 10,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 10,
    letterSpacing: 1.6,
    lineHeight: 17,
    fontFamily: fonts.bold,
  },
  title: {
    fontSize: 31,
    lineHeight: 36,
    letterSpacing: -0.8,
    color: colors.text,
    fontFamily: fonts.display,
  },
  matchCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.medium,
    padding: 20,
    gap: 16,
  },
  matchTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  matchText: {
    flex: 1,
    gap: 8,
  },
  matchTitle: {
    color: colors.primary,
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  matchDescription: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  percent: {
    color: colors.primary,
    fontSize: 33,
    letterSpacing: -1,
    fontFamily: fonts.bold,
  },
  percentSymbol: {
    fontSize: 17,
    fontFamily: fonts.regular,
  },
  track: {
    height: 5,
    backgroundColor: '#D5DFCA',
    borderRadius: 3,
  },
  progress: {
    height: 5,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  note: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 20,
    fontFamily: fonts.regular,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 23,
    letterSpacing: -0.5,
    fontFamily: fonts.display,
  },
  tag: {
    color: colors.accent,
    backgroundColor: colors.accentSoft,
    fontSize: 11,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontFamily: fonts.bold,
  },
  ingredientList: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.medium,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  ingredientRow: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dot: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  availableDot: {
    backgroundColor: colors.primarySoft,
  },
  ingredientText: {
    flex: 1,
    gap: 5,
  },
  ingredientName: {
    color: colors.text,
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  measure: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fonts.regular,
  },
  languageNote: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  languageText: {
    color: colors.muted,
    flex: 1,
    fontSize: 11,
    lineHeight: 18,
    fontFamily: fonts.regular,
  },
  step: {
    flexDirection: 'row',
    gap: 14,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 11,
    color: colors.primary,
    fontFamily: fonts.bold,
  },
  stepText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    lineHeight: 24,
    fontFamily: fonts.regular,
  },
  credit: {
    color: colors.muted,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 18,
    fontFamily: fonts.regular,
  },
  error: {
    color: colors.error,
    fontSize: 12,
    lineHeight: 20,
    fontFamily: fonts.regular,
  },
});
