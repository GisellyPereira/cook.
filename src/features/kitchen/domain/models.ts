import { Ingredient, Recipe } from '../../recipes/domain/models';

export type ShoppingItem = Ingredient & {
  checked: boolean;
  recipes: string[];
};

export type KitchenState = {
  pantry: Ingredient[];
  favorites: Recipe[];
  shopping: ShoppingItem[];
};

export const emptyKitchen = (): KitchenState => ({
  pantry: [],
  favorites: [],
  shopping: [],
});

export interface KitchenStorage {
  load(): Promise<KitchenState>;
  save(state: KitchenState): Promise<void>;
}
