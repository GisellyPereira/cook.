import { IconName } from '../shared/components/Icon';

export type AppRoute = 'discover' | 'pantry' | 'favorites' | 'shopping';
export const appRoutes: { id: AppRoute; label: string; icon: IconName }[] = [
  { id: 'discover', label: 'Descobrir', icon: 'compass' },
  { id: 'pantry', label: 'Cozinha', icon: 'box' },
  { id: 'favorites', label: 'Salvas', icon: 'heart' },
  { id: 'shopping', label: 'Compras', icon: 'shopping-bag' },
];
