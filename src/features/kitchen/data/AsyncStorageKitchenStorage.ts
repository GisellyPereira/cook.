import AsyncStorage from '@react-native-async-storage/async-storage';
import { emptyKitchen, KitchenState, KitchenStorage } from '../domain/models';

const STORAGE_KEY = '@cook-from-this/kitchen/v1';
type StorageDriver = Pick<typeof AsyncStorage, 'getItem' | 'setItem'>;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object';
const isString = (value: unknown) => typeof value === 'string';
const isStringArray = (value: unknown) =>
  Array.isArray(value) && value.every(isString);
const isIngredient = (value: unknown): boolean =>
  isRecord(value) &&
  ['id', 'label', 'apiName'].every(key => isString(value[key])) &&
  !!value.id;
const isRecipe = (value: unknown): boolean =>
  isRecord(value) &&
  ['id', 'name', 'image', 'category', 'area'].every(key =>
    isString(value[key]),
  ) &&
  isStringArray(value.instructions) &&
  Array.isArray(value.ingredients) &&
  value.ingredients.every(
    ingredient =>
      isIngredient(ingredient) &&
      isRecord(ingredient) &&
      isString(ingredient.measure),
  ) &&
  [value.sourceUrl, value.videoUrl].every(
    url =>
      url === undefined ||
      (isString(url) && /^https?:\/\//i.test(url as string)),
  );

export function parseKitchen(raw: string | null): KitchenState {
  if (!raw) {
    return emptyKitchen();
  }
  const envelope: unknown = JSON.parse(raw);
  if (
    !isRecord(envelope) ||
    envelope.version !== 1 ||
    !isRecord(envelope.state)
  ) {
    throw new Error('Dados locais inválidos');
  }
  const state = envelope.state;
  if (
    !Array.isArray(state.pantry) ||
    !state.pantry.every(isIngredient) ||
    !Array.isArray(state.favorites) ||
    !state.favorites.every(isRecipe) ||
    !Array.isArray(state.shopping) ||
    !state.shopping.every(
      item =>
        isIngredient(item) &&
        isRecord(item) &&
        typeof item.checked === 'boolean' &&
        isStringArray(item.recipes),
    )
  ) {
    throw new Error('Dados locais inválidos');
  }
  return state as KitchenState;
}

export class AsyncStorageKitchenStorage implements KitchenStorage {
  constructor(private driver: StorageDriver = AsyncStorage) {}

  async load() {
    return parseKitchen(await this.driver.getItem(STORAGE_KEY));
  }

  async save(state: KitchenState) {
    await this.driver.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, state }),
    );
  }
}
