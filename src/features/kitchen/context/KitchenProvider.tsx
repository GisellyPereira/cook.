import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Ingredient,
  Recipe,
  RecipeIngredient,
} from '../../recipes/domain/models';
import { emptyKitchen, KitchenState, KitchenStorage } from '../domain/models';

type KitchenContextValue = KitchenState & {
  hydrated: boolean;
  loadError: boolean;
  saveError: boolean;
  retryLoad: () => void;
  retrySave: () => void;
  toggleIngredient: (ingredient: Ingredient) => void;
  toggleFavorite: (recipe: Recipe) => void;
  addMissing: (ingredients: RecipeIngredient[], recipeName: string) => void;
  toggleShopping: (id: string) => void;
  removeShopping: (id: string) => void;
  movePurchasedToPantry: () => void;
};

const KitchenContext = createContext<KitchenContextValue | undefined>(
  undefined,
);

export function KitchenProvider({
  children,
  storage,
}: {
  children: React.ReactNode;
  storage: KitchenStorage;
}) {
  const [state, setState] = useState<KitchenState>(emptyKitchen);
  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [loadVersion, setLoadVersion] = useState(0);
  const [saveVersion, setSaveVersion] = useState(0);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const saveSequence = useRef(0);

  useEffect(() => {
    let active = true;
    setLoadError(false);
    storage
      .load()
      .then(saved => {
        if (active) {
          setState(saved);
          setHydrated(true);
        }
      })
      .catch(() => {
        if (active) {
          setLoadError(true);
        }
      });
    return () => {
      active = false;
    };
  }, [storage, loadVersion]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    let active = true;
    const sequence = ++saveSequence.current;
    saveQueue.current = saveQueue.current
      .catch(() => {})
      .then(() => storage.save(state));
    saveQueue.current
      .then(() => {
        if (active && sequence === saveSequence.current) {
          setSaveError(false);
        }
      })
      .catch(() => {
        if (active && sequence === saveSequence.current) {
          setSaveError(true);
        }
      });
    return () => {
      active = false;
    };
  }, [state, hydrated, storage, saveVersion]);

  const toggleIngredient = useCallback((ingredient: Ingredient) => {
    setState(current => ({
      ...current,
      pantry: current.pantry.some(item => item.id === ingredient.id)
        ? current.pantry.filter(item => item.id !== ingredient.id)
        : [...current.pantry, ingredient],
    }));
  }, []);

  const toggleFavorite = useCallback((recipe: Recipe) => {
    setState(current => ({
      ...current,
      favorites: current.favorites.some(item => item.id === recipe.id)
        ? current.favorites.filter(item => item.id !== recipe.id)
        : [recipe, ...current.favorites],
    }));
  }, []);

  const addMissing = useCallback(
    (ingredients: RecipeIngredient[], recipeName: string) => {
      setState(current => {
        const shopping = new Map(current.shopping.map(item => [item.id, item]));
        ingredients.forEach(ingredient => {
          const existing = shopping.get(ingredient.id);
          shopping.set(ingredient.id, {
            id: ingredient.id,
            label: ingredient.label,
            apiName: ingredient.apiName,
            checked: existing?.checked ?? false,
            recipes: [...new Set([...(existing?.recipes ?? []), recipeName])],
          });
        });
        return { ...current, shopping: [...shopping.values()] };
      });
    },
    [],
  );

  const toggleShopping = useCallback((id: string) => {
    setState(current => ({
      ...current,
      shopping: current.shopping.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    }));
  }, []);

  const removeShopping = useCallback((id: string) => {
    setState(current => ({
      ...current,
      shopping: current.shopping.filter(item => item.id !== id),
    }));
  }, []);

  const movePurchasedToPantry = useCallback(() => {
    setState(current => {
      const pantry = new Map(current.pantry.map(item => [item.id, item]));
      current.shopping
        .filter(item => item.checked)
        .forEach(item =>
          pantry.set(item.id, {
            id: item.id,
            label: item.label,
            apiName: item.apiName,
          }),
        );
      return {
        ...current,
        pantry: [...pantry.values()],
        shopping: current.shopping.filter(item => !item.checked),
      };
    });
  }, []);

  return (
    <KitchenContext.Provider
      value={{
        ...state,
        hydrated,
        loadError,
        saveError,
        retryLoad: () => setLoadVersion(value => value + 1),
        retrySave: () => setSaveVersion(value => value + 1),
        toggleIngredient,
        toggleFavorite,
        addMissing,
        toggleShopping,
        removeShopping,
        movePurchasedToPantry,
      }}
    >
      {children}
    </KitchenContext.Provider>
  );
}

export function useKitchen() {
  const context = useContext(KitchenContext);
  if (!context) {
    throw new Error('useKitchen precisa estar dentro de KitchenProvider');
  }
  return context;
}
