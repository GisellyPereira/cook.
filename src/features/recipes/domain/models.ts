export type Ingredient = {
  id: string;
  label: string;
  apiName: string;
};

export type RecipeIngredient = Ingredient & { measure: string };

export type Recipe = {
  id: string;
  name: string;
  image: string;
  category: string;
  area: string;
  instructions: string[];
  ingredients: RecipeIngredient[];
  sourceUrl?: string;
  videoUrl?: string;
};

export type RecipeMatch = {
  recipe: Recipe;
  available: RecipeIngredient[];
  missing: RecipeIngredient[];
  percentage: number;
};

export type RecipeBatch = {
  recipes: Recipe[];
  nextCursor?: string;
};

export interface RecipeRepository {
  featured(signal: AbortSignal, cursor?: string): Promise<RecipeBatch>;
  byIngredient(
    ingredient: Ingredient,
    signal: AbortSignal,
    cursor?: string,
  ): Promise<RecipeBatch>;
  byName(name: string, signal: AbortSignal): Promise<Recipe[]>;
  related(recipe: Recipe, signal: AbortSignal): Promise<Recipe[]>;
}
