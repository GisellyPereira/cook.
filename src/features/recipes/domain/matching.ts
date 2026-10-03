import { Ingredient, Recipe, RecipeMatch } from './models';

export function matchRecipe(recipe: Recipe, pantry: Ingredient[]): RecipeMatch {
  const pantryIds = new Set(pantry.map(ingredient => ingredient.id));
  const uniqueIngredients = [
    ...new Map(
      recipe.ingredients.map(ingredient => [ingredient.id, ingredient]),
    ).values(),
  ];
  const available = uniqueIngredients.filter(ingredient =>
    pantryIds.has(ingredient.id),
  );
  const missing = uniqueIngredients.filter(
    ingredient => !pantryIds.has(ingredient.id),
  );
  return {
    recipe,
    available,
    missing,
    percentage: uniqueIngredients.length
      ? Math.round((available.length / uniqueIngredients.length) * 100)
      : 0,
  };
}

export function rankRecipes(
  recipes: Recipe[],
  pantry: Ingredient[],
): RecipeMatch[] {
  return recipes
    .map(recipe => matchRecipe(recipe, pantry))
    .sort(
      (a, b) =>
        b.percentage - a.percentage ||
        a.missing.length - b.missing.length ||
        a.recipe.name.localeCompare(b.recipe.name),
    );
}
