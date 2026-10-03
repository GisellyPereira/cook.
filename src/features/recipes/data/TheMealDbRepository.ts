import {
  Ingredient,
  Recipe,
  RecipeBatch,
  RecipeRepository,
} from '../domain/models';
import { mapMeal, MealDto } from './mealDbMapper';

export const INGREDIENT_BATCH_SIZE = 12;

export type MealDbFetch = (
  url: string,
  options?: RequestInit,
) => Promise<Response>;

export class TheMealDbRepository implements RecipeRepository {
  private cache = new Map<string, Recipe>();
  private categoryIds = new Map<string, string[]>();
  private ingredientIds = new Map<string, string[]>();

  constructor(
    private apiKey = '1',
    private request: MealDbFetch = (url, options) => fetch(url, options),
  ) {}

  private async get(endpoint: string, signal: AbortSignal): Promise<MealDto[]> {
    const timeoutController = new AbortController();
    const cancel = () => timeoutController.abort();
    signal.addEventListener('abort', cancel, { once: true });
    if (signal.aborted) {
      cancel();
    }
    const timeout = setTimeout(cancel, 15000);
    try {
      const response = await this.request(
        `https://www.themealdb.com/api/json/v1/${encodeURIComponent(
          this.apiKey,
        )}/${endpoint}`,
        { signal: timeoutController.signal },
      );
      if (!response.ok) {
        throw new Error(
          'A TheMealDB está indisponível. Tente novamente em instantes.',
        );
      }
      const data: unknown = await response.json();
      if (!data || typeof data !== 'object' || !('meals' in data)) {
        throw new Error('Não foi possível ler as receitas. Tente novamente.');
      }
      const meals = (data as { meals: unknown }).meals;
      if (meals === null) {
        return [];
      }
      if (
        !Array.isArray(meals) ||
        meals.some(meal => !meal || typeof meal !== 'object')
      ) {
        throw new Error(
          'A lista de receitas está incompleta. Tente novamente.',
        );
      }
      return meals as MealDto[];
    } catch (error) {
      if (signal.aborted) {
        throw error;
      }
      if (timeoutController.signal.aborted) {
        throw new Error(
          'A busca demorou demais. Confira sua conexão e tente novamente.',
        );
      }
      if (error instanceof Error && error.message.startsWith('A ')) {
        throw error;
      }
      if (error instanceof Error && error.message.startsWith('Não ')) {
        throw error;
      }
      throw new Error(
        'Não conseguimos conectar à TheMealDB. Confira sua internet e tente novamente.',
      );
    } finally {
      clearTimeout(timeout);
      signal.removeEventListener('abort', cancel);
    }
  }

  private async details(id: string, signal: AbortSignal): Promise<Recipe> {
    const cached = this.cache.get(id);
    if (cached) {
      return cached;
    }
    const meals = await this.get(
      `lookup.php?i=${encodeURIComponent(id)}`,
      signal,
    );
    if (!meals.length) {
      throw new Error('A receita não está mais disponível. Tente outra busca.');
    }
    const recipe = mapMeal(meals[0]);
    this.cache.set(id, recipe);
    return recipe;
  }

  async featured(signal: AbortSignal, cursor?: string): Promise<RecipeBatch> {
    // The free API supports browsing by first letter, not server-side pages.
    // Start with its discovery sample, then walk the alphabet, skipping empty letters.
    let letter = cursor ? cursor.charCodeAt(0) - 97 : -1;
    if (cursor && (!/^[a-z]$/.test(cursor) || letter > 25)) {
      throw new Error('Não foi possível abrir este grupo de receitas.');
    }
    while (letter <= 25) {
      const meals = await this.get(
        letter === -1
          ? 'search.php?s='
          : `search.php?f=${String.fromCharCode(97 + letter)}`,
        signal,
      );
      letter++;
      if (meals.length) {
        const recipes = [
          ...new Map(
            meals.map(meal => {
              const recipe = mapMeal(meal);
              this.cache.set(recipe.id, recipe);
              return [recipe.id, recipe] as const;
            }),
          ).values(),
        ];
        return {
          recipes,
          nextCursor:
            letter <= 25 ? String.fromCharCode(97 + letter) : undefined,
        };
      }
    }
    return { recipes: [] };
  }

  async byIngredient(
    ingredient: Ingredient,
    signal: AbortSignal,
    cursor?: string,
  ): Promise<RecipeBatch> {
    const offset = cursor === undefined ? 0 : Number(cursor);
    if (
      cursor !== undefined &&
      (!/^\d+$/.test(cursor) || !Number.isSafeInteger(offset))
    ) {
      throw new Error('Não foi possível abrir este grupo de receitas.');
    }
    let ids = this.ingredientIds.get(ingredient.apiName);
    if (!ids) {
      const meals = await this.get(
        `filter.php?i=${encodeURIComponent(ingredient.apiName)}`,
        signal,
      );
      ids = [
        ...new Set(
          meals.map(meal => String(meal.idMeal ?? '')).filter(Boolean),
        ),
      ];
      if (!signal.aborted) {
        this.ingredientIds.set(ingredient.apiName, ids);
      }
    }
    const end = offset + INGREDIENT_BATCH_SIZE;
    return {
      recipes: await this.hydrate(ids.slice(offset, end), signal),
      nextCursor: end < ids.length ? String(end) : undefined,
    };
  }

  private async hydrate(ids: string[], signal: AbortSignal): Promise<Recipe[]> {
    const recipes: Recipe[] = [];
    // Four requests at a time; the free endpoint only returns summaries.
    for (let index = 0; index < ids.length; index += 4) {
      if (signal.aborted) {
        throw new Error('Busca cancelada');
      }
      recipes.push(
        ...(await Promise.all(
          ids.slice(index, index + 4).map(id => this.details(id, signal)),
        )),
      );
    }
    return recipes;
  }

  async related(recipe: Recipe, signal: AbortSignal): Promise<Recipe[]> {
    if (!recipe.category) {
      const ingredient = recipe.ingredients[0];
      return ingredient
        ? (await this.byIngredient(ingredient, signal)).recipes.filter(
            item => item.id !== recipe.id,
          )
        : [];
    }
    let ids = this.categoryIds.get(recipe.category);
    if (!ids) {
      const meals = await this.get(
        `filter.php?c=${encodeURIComponent(recipe.category)}`,
        signal,
      );
      ids = [
        ...new Set(
          meals.map(meal => String(meal.idMeal ?? '')).filter(Boolean),
        ),
      ];
      if (!signal.aborted) {
        this.categoryIds.set(recipe.category, ids);
      }
    }
    return this.hydrate(
      ids.filter(id => id !== recipe.id).slice(0, 12),
      signal,
    );
  }

  async byName(name: string, signal: AbortSignal): Promise<Recipe[]> {
    const meals = await this.get(
      `search.php?s=${encodeURIComponent(name.trim())}`,
      signal,
    );
    return meals.map(meal => {
      const recipe = mapMeal(meal);
      this.cache.set(recipe.id, recipe);
      return recipe;
    });
  }
}
