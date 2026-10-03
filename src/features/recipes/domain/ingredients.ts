import { Ingredient } from './models';

export function normalizeIngredient(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

type CatalogEntry = Ingredient & { aliases: string[]; group: string };

function entry(
  apiName: string,
  label: string,
  group: string,
  aliases: string[] = [],
): CatalogEntry {
  return { id: normalizeIngredient(apiName), apiName, label, group, aliases };
}

// Only explicit aliases are equivalent. Tomato puree and chicken stock, for
// example, remain different from tomatoes and chicken.
export const ingredientCatalog: CatalogEntry[] = [
  entry('Chicken', 'Frango', 'Proteínas', [
    'chicken breast',
    'chicken breasts',
    'chicken thighs',
  ]),
  entry('Beef', 'Carne bovina', 'Proteínas'),
  entry('Minced Beef', 'Carne moída', 'Proteínas', [
    'beef mince',
    'ground beef',
  ]),
  entry('Pork', 'Carne suína', 'Proteínas'),
  entry('Bacon', 'Bacon', 'Proteínas'),
  entry('Salmon', 'Salmão', 'Proteínas'),
  entry('Tuna', 'Atum', 'Proteínas'),
  entry('Prawns', 'Camarão', 'Proteínas', ['shrimp', 'prawn']),
  entry('Eggs', 'Ovos', 'Proteínas', ['egg']),
  entry('Tofu', 'Tofu', 'Proteínas'),
  entry('Rice', 'Arroz', 'Grãos e massas'),
  entry('Basmati Rice', 'Arroz basmati', 'Grãos e massas'),
  entry('Brown Rice', 'Arroz integral', 'Grãos e massas'),
  entry('Pasta', 'Macarrão', 'Grãos e massas'),
  entry('Spaghetti', 'Espaguete', 'Grãos e massas'),
  entry('Penne Rigate', 'Penne', 'Grãos e massas', ['penne']),
  entry('Lentils', 'Lentilha', 'Grãos e massas', ['lentil']),
  entry('Chickpeas', 'Grão-de-bico', 'Grãos e massas', ['chickpea']),
  entry('Bread', 'Pão', 'Grãos e massas'),
  entry('Plain Flour', 'Farinha de trigo', 'Grãos e massas'),
  entry('Oats', 'Aveia', 'Grãos e massas'),
  entry('Tomatoes', 'Tomate', 'Hortifruti', ['tomato']),
  entry('Onion', 'Cebola', 'Hortifruti', ['onions']),
  entry('Red Onions', 'Cebola roxa', 'Hortifruti', ['red onion']),
  entry('Garlic', 'Alho', 'Hortifruti', ['garlic clove', 'garlic cloves']),
  entry('Potatoes', 'Batata', 'Hortifruti', ['potato']),
  entry('Sweet Potatoes', 'Batata-doce', 'Hortifruti', ['sweet potato']),
  entry('Carrots', 'Cenoura', 'Hortifruti', ['carrot']),
  entry('Broccoli', 'Brócolis', 'Hortifruti'),
  entry('Spinach', 'Espinafre', 'Hortifruti'),
  entry('Mushrooms', 'Cogumelo', 'Hortifruti', ['mushroom']),
  entry('Courgettes', 'Abobrinha', 'Hortifruti', ['courgette', 'zucchini']),
  entry('Aubergine', 'Berinjela', 'Hortifruti', ['eggplant']),
  entry('Red Pepper', 'Pimentão vermelho', 'Hortifruti'),
  entry('Green Pepper', 'Pimentão verde', 'Hortifruti'),
  entry('Lettuce', 'Alface', 'Hortifruti'),
  entry('Cucumber', 'Pepino', 'Hortifruti'),
  entry('Lemon', 'Limão-siciliano', 'Hortifruti', ['lemons']),
  entry('Lime', 'Limão', 'Hortifruti', ['limes']),
  entry('Apples', 'Maçã', 'Hortifruti', ['apple']),
  entry('Banana', 'Banana', 'Hortifruti', ['bananas']),
  entry('Avocado', 'Abacate', 'Hortifruti'),
  entry('Ginger', 'Gengibre', 'Hortifruti'),
  entry('Cheese', 'Queijo', 'Laticínios'),
  entry('Mozzarella', 'Muçarela', 'Laticínios', ['mozzarella cheese']),
  entry('Parmesan', 'Parmesão', 'Laticínios', ['parmesan cheese']),
  entry('Cheddar Cheese', 'Cheddar', 'Laticínios', ['cheddar']),
  entry('Milk', 'Leite', 'Laticínios'),
  entry('Butter', 'Manteiga', 'Laticínios'),
  entry('Yogurt', 'Iogurte', 'Laticínios', ['yoghurt']),
  entry('Cream', 'Creme de leite', 'Laticínios'),
  entry('Double Cream', 'Creme de leite fresco', 'Laticínios'),
  entry('Olive Oil', 'Azeite', 'Temperos'),
  entry('Vegetable Oil', 'Óleo vegetal', 'Temperos'),
  entry('Salt', 'Sal', 'Temperos'),
  entry('Black Pepper', 'Pimenta-do-reino', 'Temperos'),
  entry('Sugar', 'Açúcar', 'Temperos'),
  entry('Basil', 'Manjericão', 'Temperos'),
  entry('Parsley', 'Salsinha', 'Temperos'),
  entry('Coriander', 'Coentro', 'Temperos'),
  entry('Cumin', 'Cominho', 'Temperos'),
  entry('Paprika', 'Páprica', 'Temperos'),
  entry('Cinnamon', 'Canela', 'Temperos'),
  entry('Soy Sauce', 'Molho de soja', 'Temperos'),
  entry('Honey', 'Mel', 'Temperos'),
  entry('Tomato Puree', 'Purê de tomate', 'Temperos'),
  entry('Chicken Stock', 'Caldo de frango', 'Temperos'),
  entry('Vegetable Stock', 'Caldo de legumes', 'Temperos'),
  entry('Coconut Milk', 'Leite de coco', 'Temperos'),
];

const aliasIndex = new Map<string, CatalogEntry>();
ingredientCatalog.forEach(ingredient => {
  [ingredient.apiName, ingredient.label, ...ingredient.aliases].forEach(alias =>
    aliasIndex.set(normalizeIngredient(alias), ingredient),
  );
});

export function resolveIngredient(name: string): Ingredient {
  const normalized = normalizeIngredient(name);
  const known = aliasIndex.get(normalized);
  return known
    ? { id: known.id, label: known.label, apiName: known.apiName }
    : { id: normalized, label: name.trim(), apiName: name.trim() };
}

export function searchIngredients(query: string): CatalogEntry[] {
  const normalized = normalizeIngredient(query);
  return ingredientCatalog.filter(ingredient =>
    [ingredient.label, ingredient.apiName, ...ingredient.aliases].some(value =>
      normalizeIngredient(value).includes(normalized),
    ),
  );
}

export const quickIngredients = [
  'Chicken',
  'Rice',
  'Tomatoes',
  'Cheese',
  'Eggs',
  'Onion',
].map(resolveIngredient);
