import { resolveIngredient } from '../domain/ingredients';
import { Recipe } from '../domain/models';

export type MealDto = Record<string, unknown>;
const stringValue = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

export function safeWebUrl(value: unknown): string | undefined {
  const url = stringValue(value);
  return /^https?:\/\//i.test(url) ? url : undefined;
}

export function mapMeal(meal: MealDto): Recipe {
  const id = stringValue(meal.idMeal);
  const name = stringValue(meal.strMeal);
  if (!id || !name) {
    throw new Error('A receita recebida está incompleta. Tente novamente.');
  }
  const ingredients: Recipe['ingredients'] = [];
  for (let slot = 1; slot <= 20; slot++) {
    const ingredient = stringValue(meal[`strIngredient${slot}`]);
    if (ingredient) {
      ingredients.push({
        ...resolveIngredient(ingredient),
        measure: stringValue(meal[`strMeasure${slot}`]),
      });
    }
  }
  return {
    id,
    name,
    image: safeWebUrl(meal.strMealThumb) ?? '',
    category: stringValue(meal.strCategory),
    area: stringValue(meal.strArea),
    instructions: stringValue(meal.strInstructions)
      .split(/\r?\n+/)
      .map(step => step.trim())
      .filter(Boolean),
    ingredients,
    sourceUrl: safeWebUrl(meal.strSource),
    videoUrl: safeWebUrl(meal.strYoutube),
  };
}
