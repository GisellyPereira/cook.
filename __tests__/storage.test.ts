import { describe, expect, jest, test } from '@jest/globals';
import {
  AsyncStorageKitchenStorage,
  parseKitchen,
} from '../src/features/kitchen/data/AsyncStorageKitchenStorage';
import { emptyKitchen } from '../src/features/kitchen/domain/models';
import { resolveIngredient } from '../src/features/recipes/domain/ingredients';
import { recipe } from './fixtures';

describe('persistência da cozinha', () => {
  test('restaura despensa, receitas completas e compras no mesmo formato', async () => {
    let raw: string | null = null;
    const driver = {
      getItem: jest.fn<() => Promise<string | null>>(async () => raw),
      setItem: jest.fn<(key: string, value: string) => Promise<void>>(
        async (_, value) => {
          raw = value;
        },
      ),
    };
    const storage = new AsyncStorageKitchenStorage(driver);
    expect(await storage.load()).toEqual(emptyKitchen());
    const state = {
      pantry: [resolveIngredient('Rice')],
      favorites: [recipe],
      shopping: [
        {
          ...resolveIngredient('Garlic'),
          checked: false,
          recipes: [recipe.name],
        },
      ],
    };
    await storage.save(state);
    expect(await storage.load()).toEqual(state);
  });
  test('recusa dados inválidos em vez de sobrescrever o caderno salvo', () => {
    expect(() => parseKitchen('{')).toThrow();
    expect(() =>
      parseKitchen(JSON.stringify({ version: 2, state: emptyKitchen() })),
    ).toThrow();
    expect(() =>
      parseKitchen(
        JSON.stringify({
          version: 1,
          state: { ...emptyKitchen(), pantry: [{ id: 'broken' }] },
        }),
      ),
    ).toThrow();
    expect(() =>
      parseKitchen(
        JSON.stringify({
          version: 1,
          state: {
            ...emptyKitchen(),
            favorites: [{ ...recipe, ingredients: null }],
          },
        }),
      ),
    ).toThrow();
  });
});
