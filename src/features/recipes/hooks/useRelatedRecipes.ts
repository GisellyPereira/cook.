import { useEffect, useMemo, useState } from 'react';
import { Recipe, RecipeRepository } from '../domain/models';
import { relatedRecipes } from '../domain/recommendations';

export function useRelatedRecipes(
  recipe: Recipe,
  repository: RecipeRepository,
  candidates: Recipe[],
) {
  const [result, setResult] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setResult([]);
    setLoading(true);
    setError(false);
    repository
      .related(recipe, controller.signal)
      .then(recipes => {
        if (!controller.signal.aborted) {
          setResult(recipes);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [recipe, repository, attempt]);
  const recipes = useMemo(
    () => relatedRecipes(recipe, [...candidates, ...result]),
    [recipe, candidates, result],
  );
  return {
    recipes,
    loading,
    error,
    retry: () => setAttempt(value => value + 1),
  };
}
