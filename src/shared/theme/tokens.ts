export const colors = {
  background: '#FBF9F5',
  surface: '#FFFFFF',
  text: '#272822',
  muted: '#6D6D63',
  primary: '#364735',
  primarySoft: '#E9EDE3',
  accent: '#AD4C35',
  accentSoft: '#F4E8E0',
  border: '#E6E2D9',
  cream: '#F0ECE3',
  yellow: '#E5D3AD',
  error: '#A7432B',
};

export const fonts = {
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  bold: 'DMSans_700Bold',
  display: 'DMSerifDisplay_400Regular',
};
export const radius = { small: 8, medium: 12, large: 16, pill: 999 };
export const contentWidth = 960;

export const categoryLabels: Record<string, string> = {
  Beef: 'Carne',
  Chicken: 'Frango',
  Dessert: 'Sobremesa',
  Lamb: 'Cordeiro',
  Miscellaneous: 'Variados',
  Pasta: 'Massas',
  Pork: 'Carne suína',
  Seafood: 'Peixes e frutos do mar',
  Side: 'Acompanhamento',
  Starter: 'Entrada',
  Vegan: 'Vegano',
  Vegetarian: 'Vegetariano',
  Breakfast: 'Café da manhã',
  Goat: 'Cabrito',
};

export const categoryLabel = (category: string) =>
  categoryLabels[category] ?? category;
