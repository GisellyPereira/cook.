import React from 'react';
import EmptyState from '../../../shared/components/EmptyState';
import PageHeading from '../../../shared/components/PageHeading';
import RecipeGrid from '../components/RecipeGrid';
import Screen from '../../../shared/components/Screen';
import { useKitchen } from '../../kitchen/context/KitchenProvider';
import { rankRecipes } from '../domain/matching';
import { Recipe } from '../domain/models';

export default function FavoritesScreen({
  onOpenRecipe,
  onDiscover,
}: {
  onOpenRecipe: (recipe: Recipe) => void;
  onDiscover: () => void;
}) {
  const { pantry, favorites } = useKitchen();
  return (
    <Screen>
      <PageHeading
        eyebrow="Seu caderno de receitas"
        title={'Vale a pena\nfazer de novo.'}
        description={`${favorites.length} ${
          favorites.length === 1 ? 'receita salva' : 'receitas salvas'
        } para quando bater a vontade.`}
      />
      {favorites.length ? (
        <RecipeGrid
          matches={rankRecipes(favorites, pantry)}
          onOpen={onOpenRecipe}
        />
      ) : (
        <EmptyState
          icon="heart"
          title="Guarde o que deu vontade"
          description="Toque no coração de uma receita. Os ingredientes e o preparo ficam salvos neste aparelho para consultar depois."
          action={{ label: 'Explorar receitas', onPress: onDiscover }}
        />
      )}
    </Screen>
  );
}
