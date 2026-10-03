import { describe, expect, jest, test } from '@jest/globals';
import { resolveIngredient } from '../src/features/recipes/domain/ingredients';
import {
  matchRecipe,
  rankRecipes,
} from '../src/features/recipes/domain/matching';
import { mapMeal } from '../src/features/recipes/data/mealDbMapper';
import {
  INGREDIENT_BATCH_SIZE,
  MealDbFetch,
  TheMealDbRepository,
} from '../src/features/recipes/data/TheMealDbRepository';
import { mealDto, recipe } from './fixtures';
import { relatedRecipes } from '../src/features/recipes/domain/recommendations';

test('relacionadas priorizam categoria e ingredientes, sem repetir a receita atual', () => {
  const similar = { ...recipe, id: 'similar', name: 'Another chicken' };
  const categoryOnly = { ...recipe, id: 'category', ingredients: [] };
  const unrelated = {
    ...recipe,
    id: 'unrelated',
    category: 'Dessert',
    ingredients: [],
  };
  const shared = {
    ...recipe,
    id: 'shared',
    category: 'Pasta',
    ingredients: recipe.ingredients.slice(0, 2),
  };
  const original = [categoryOnly, recipe, unrelated, similar, similar, shared];
  expect(relatedRecipes(recipe, original).map(item => item.id)).toEqual([
    'similar',
    'category',
  ]);
  expect(
    relatedRecipes({ ...recipe, category: '' }, [shared, unrelated]).map(
      item => item.id,
    ),
  ).toEqual(['shared']);
  expect(original).toHaveLength(6);
});

describe('compatibilidade real dos ingredientes', () => {
  test('4 de 6 = 67%, mesmo com outros ingredientes na despensa', () => {
    const pantry = ['frango', 'arroz', 'tomate', 'queijo', 'Bacon', 'Milk'].map(
      resolveIngredient,
    );
    const match = matchRecipe(recipe, pantry);
    expect(match.percentage).toBe(67);
    expect(match.available).toHaveLength(4);
    expect(match.missing.map(item => item.label)).toEqual(['Alho', 'Cebola']);
  });
  test('normaliza acentos, espaços e aliases explícitos, sem confundir preparados', () => {
    expect(resolveIngredient('  FRANGO  ').id).toBe(
      resolveIngredient('chicken breast').id,
    );
    expect(resolveIngredient('tomátes').id).not.toBe(
      resolveIngredient('Tomato Puree').id,
    );
    expect(resolveIngredient('Queijo').id).not.toBe(
      resolveIngredient('Mozzarella').id,
    );
    expect(resolveIngredient('Chicken').id).not.toBe(
      resolveIngredient('Chicken Stock').id,
    );
    expect(resolveIngredient('GARLIC CLOVES').id).toBe(
      resolveIngredient('alho').id,
    );
  });
  test('não conta ingredientes repetidos duas vezes e não assume ingredientes básicos', () => {
    const repeated = {
      ...recipe,
      ingredients: [...recipe.ingredients, recipe.ingredients[0]],
    };
    expect(matchRecipe(repeated, []).percentage).toBe(0);
    expect(matchRecipe(repeated, recipe.ingredients).percentage).toBe(100);
    expect(matchRecipe(repeated, recipe.ingredients).available).toHaveLength(6);
    expect(matchRecipe({ ...recipe, ingredients: [] }, []).percentage).toBe(0);
  });
  test('ordena pelo percentual usando os ingredientes completos', () => {
    const simpler = {
      ...recipe,
      id: 'simpler',
      ingredients: recipe.ingredients.slice(0, 2),
    };
    expect(
      rankRecipes([recipe, simpler], [resolveIngredient('Chicken')]).map(
        match => match.recipe.id,
      ),
    ).toEqual(['simpler', recipe.id]);
  });
});

describe('fronteira da TheMealDB', () => {
  test('relacionadas usam categoria, excluem a receita atual e reutilizam detalhes e catálogo', async () => {
    const request = jest.fn<MealDbFetch>().mockImplementation(
      async url =>
        ({
          ok: true,
          json: async () => ({
            meals: url.includes('filter.php')
              ? [
                  { idMeal: mealDto.idMeal },
                  { idMeal: 'next' },
                  { idMeal: 'next' },
                  { idMeal: 'another' },
                ]
              : [{ ...mealDto, idMeal: url.split('i=')[1] }],
          }),
        } as Response),
    );
    const repository = new TheMealDbRepository('1', request);
    const current = mapMeal(mealDto);
    const signal = new AbortController().signal;
    expect(
      (await repository.related(current, signal)).map(item => item.id),
    ).toEqual(['next', 'another']);
    expect(request.mock.calls[0][0]).toContain('filter.php?c=Chicken');
    await repository.related(current, signal);
    expect(request).toHaveBeenCalledTimes(3);
  });
  test('descobertas usam endpoints gratuitos, avançam o cursor e pulam letras vazias', async () => {
    const request = jest.fn<MealDbFetch>().mockImplementation(
      async url =>
        ({
          ok: true,
          json: async () => ({
            meals: url.endsWith('f=a') ? null : [mealDto, mealDto],
          }),
        } as Response),
    );
    const repository = new TheMealDbRepository('1', request);
    const signal = new AbortController().signal;
    const initial = await repository.featured(signal);
    expect(initial.recipes).toHaveLength(1);
    expect(initial.nextCursor).toBe('a');
    expect(request.mock.calls[0][0]).toContain('search.php?s=');
    const next = await repository.featured(signal, initial.nextCursor);
    expect(next.nextCursor).toBe('c');
    expect(
      request.mock.calls.slice(1).map(call => call[0].split('?')[1]),
    ).toEqual(['f=a', 'f=b']);
    expect((await repository.featured(signal, 'z')).nextCursor).toBeUndefined();
    await expect(repository.featured(signal, 'invalid')).rejects.toThrow(
      'grupo',
    );
  });
  test('mapeia os 20 campos, ignora vazios e preserva medidas e instruções', () => {
    const mapped = mapMeal(mealDto);
    expect(mapped.ingredients.map(item => item.label)).toEqual([
      'Frango',
      'Cebola',
      'Tomate',
      'Sal',
    ]);
    expect(mapped.ingredients[0].measure).toBe('1.2 kg');
    expect(mapped.instructions).toEqual(['Prepare chicken.', 'Cook gently.']);
    expect(mapped.sourceUrl).toBeUndefined();
    expect(
      mapMeal({ ...mealDto, strYoutube: 'tel:+551100000000' }).videoUrl,
    ).toBeUndefined();
    expect(() => mapMeal({ strMeal: 'Incomplete' })).toThrow('incompleta');
  });
  test('busca um ingrediente, carrega detalhes e reutiliza o cache', async () => {
    const request = jest.fn<MealDbFetch>().mockImplementation(
      async url =>
        ({
          ok: true,
          json: async () => ({
            meals: String(url).includes('filter.php')
              ? [{ idMeal: mealDto.idMeal }, { idMeal: mealDto.idMeal }]
              : [mealDto],
          }),
        } as Response),
    );
    const repository = new TheMealDbRepository('1', request);
    const signal = new AbortController().signal;
    const first = await repository.byIngredient(
      resolveIngredient('Chicken'),
      signal,
    );
    expect(first.recipes[0].ingredients).toHaveLength(4);
    await repository.byIngredient(resolveIngredient('Chicken'), signal);
    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls[0][0]).toContain('/v1/1/filter.php?i=Chicken');
  });
  test('percorre todos os ingredientes em lotes, sem cortar após 24 e com quatro consultas simultâneas', async () => {
    let active = 0;
    let maximum = 0;
    const request: MealDbFetch = async url => {
      if (String(url).includes('filter.php')) {
        return {
          ok: true,
          json: async () => ({
            meals: Array.from({ length: 40 }, (_, i) => ({
              idMeal: String(i + 1),
            })),
          }),
        } as Response;
      }
      active++;
      maximum = Math.max(maximum, active);
      await Promise.resolve();
      active--;
      return {
        ok: true,
        json: async () => ({
          meals: [{ ...mealDto, idMeal: String(url).split('i=')[1] }],
        }),
      } as Response;
    };
    const repository = new TheMealDbRepository('1', request);
    const signal = new AbortController().signal;
    const ingredient = resolveIngredient('Chicken');
    let batch = await repository.byIngredient(ingredient, signal);
    expect(batch.recipes).toHaveLength(INGREDIENT_BATCH_SIZE);
    const ids = batch.recipes.map(item => item.id);
    while (batch.nextCursor) {
      batch = await repository.byIngredient(
        ingredient,
        signal,
        batch.nextCursor,
      );
      ids.push(...batch.recipes.map(item => item.id));
    }
    expect(ids).toHaveLength(40);
    expect(new Set(ids).size).toBe(40);
    expect(batch.nextCursor).toBeUndefined();
    expect(maximum).toBeLessThanOrEqual(4);
  });
  test('a busca pelo nome preserva todos os resultados retornados pela API', async () => {
    const request = jest.fn<MealDbFetch>().mockResolvedValue({
      ok: true,
      json: async () => ({
        meals: Array.from({ length: 40 }, (_, index) => ({
          ...mealDto,
          idMeal: String(index),
        })),
      }),
    } as Response);
    const recipes = await new TheMealDbRepository('1', request).byName(
      'chicken',
      new AbortController().signal,
    );
    expect(recipes).toHaveLength(40);
    expect(request).toHaveBeenCalledTimes(1);
  });
  test('retorna vazio para nenhuma receita e mostra falhas de rede/serviço', async () => {
    const request = jest.fn<MealDbFetch>().mockResolvedValue({
      ok: true,
      json: async () => ({ meals: null }),
    } as Response);
    const repository = new TheMealDbRepository('1', request);
    const signal = new AbortController().signal;
    expect(await repository.byName('does-not-exist', signal)).toEqual([]);
    request.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(repository.byName('chicken', signal)).rejects.toThrow(
      'internet',
    );
    request.mockResolvedValueOnce({ ok: false } as Response);
    await expect(repository.byName('chicken', signal)).rejects.toThrow(
      'indisponível',
    );
  });
});
