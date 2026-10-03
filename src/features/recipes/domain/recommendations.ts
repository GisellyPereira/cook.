import { Recipe } from './models';

export function relatedRecipes(
  recipe: Recipe,
  candidates: Recipe[],
  limit = 6,
) {
  const ingredients = new Set(recipe.ingredients.map(item => item.id));
  const unique = [...new Map(candidates.map(item => [item.id, item])).values()];
  return unique
    .filter(item => item.id !== recipe.id)
    .map(item => {
      const shared = new Set(
        item.ingredients
          .filter(ingredient => ingredients.has(ingredient.id))
          .map(ingredient => ingredient.id),
      ).size;
      const sameCategory =
        !!recipe.category && item.category === recipe.category;
      const sameArea = !!recipe.area && item.area === recipe.area;
      return {
        recipe: item,
        relevant: recipe.category ? sameCategory : shared >= 2,
        score: shared * 3 + (sameArea ? 1 : 0),
      };
    })
    .filter(item => item.relevant)
    .sort(
      (a, b) => b.score - a.score || a.recipe.name.localeCompare(b.recipe.name),
    )
    .slice(0, limit)
    .map(item => item.recipe);
}
