import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Ingredient,
  Recipe,
  RecipeBatch,
  RecipeRepository,
} from '../domain/models';

type Search =
  | { type: 'featured'; cursor?: string }
  | { type: 'ingredient'; ingredient: Ingredient; cursor?: string }
  | { type: 'name'; name: string };

export function useRecipeSearch(repository: RecipeRepository) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [search, setSearch] = useState<Search>({ type: 'featured' });
  const [retryVersion, setRetryVersion] = useState(0);
  const requestVersion = useRef(0);
  const seenFeaturedIds = useRef(new Set<string>());

  useEffect(() => {
    const version = ++requestVersion.current;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setRecipes([]);
    setNextCursor(undefined);
    if (search.type === 'featured' && !search.cursor) {
      seenFeaturedIds.current.clear();
    }

    async function fetchBatch(): Promise<RecipeBatch> {
      if (search.type === 'ingredient') {
        return repository.byIngredient(
          search.ingredient,
          controller.signal,
          search.cursor,
        );
      }
      if (search.type === 'name') {
        return {
          recipes: await repository.byName(search.name, controller.signal),
        };
      }
      let cursor = search.cursor;
      while (!controller.signal.aborted && version === requestVersion.current) {
        const batch = await repository.featured(controller.signal, cursor);
        const fresh = batch.recipes.filter(
          recipe => !seenFeaturedIds.current.has(recipe.id),
        );
        if (fresh.length || !batch.nextCursor) {
          return { recipes: fresh, nextCursor: batch.nextCursor };
        }
        cursor = batch.nextCursor;
      }
      throw new Error('Busca cancelada');
    }

    fetchBatch()
      .then(batch => {
        if (!controller.signal.aborted && version === requestVersion.current) {
          setRecipes(batch.recipes);
          setNextCursor(batch.nextCursor);
          if (search.type === 'featured') {
            batch.recipes.forEach(recipe =>
              seenFeaturedIds.current.add(recipe.id),
            );
          }
          if (search.type === 'featured' && !search.cursor) {
            setFeaturedRecipes(batch.recipes.slice(0, 5));
          }
        }
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted && version === requestVersion.current) {
          setError(
            reason instanceof Error
              ? reason.message
              : 'Não foi possível buscar receitas. Tente novamente.',
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted && version === requestVersion.current) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [repository, search, retryVersion]);

  const findByIngredient = useCallback(
    (ingredient: Ingredient) => setSearch({ type: 'ingredient', ingredient }),
    [],
  );
  const findByName = useCallback(
    (name: string) => setSearch({ type: 'name', name }),
    [],
  );
  const showFeatured = useCallback(() => setSearch({ type: 'featured' }), []);
  const retry = useCallback(() => setRetryVersion(value => value + 1), []);
  const loadMore = useCallback(() => {
    if (!loading && nextCursor && search.type !== 'name') {
      setSearch({ ...search, cursor: nextCursor });
    }
  }, [loading, nextCursor, search]);
  return {
    recipes,
    featuredRecipes,
    loading,
    error,
    search,
    findByIngredient,
    findByName,
    showFeatured,
    retry,
    loadMore,
    hasMore: !!nextCursor,
  };
}
