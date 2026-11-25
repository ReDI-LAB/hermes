import type { ReactElement } from 'react';
import { CategoryIcon } from './components/CategoryIcon';
import type { CATEGORY_ICONS } from './types/categoryIcons';
import type { Category } from './types/types';

const LABELS: Record<string, string> = {
  C001: 'Drinks',
  C003: 'Foods',
  C004: 'Rides',
  C005: 'Games',
  C006: 'Souvenirs',
};

const ICON_KEYS: Record<string, keyof typeof CATEGORY_ICONS> = {
  C001: 'drinks',
  C003: 'foods',
  C004: 'rides',
  C005: 'games',
  C006: 'souvenirs',
};

export const categoryLabel = (
  c: Pick<Category, 'category_id' | 'category_name'>,
) => LABELS[c.category_id] ?? c.category_name;

export const categoryIcon = (id: string, size = 50): ReactElement => (
  <CategoryIcon category={ICON_KEYS[id] ?? 'souvenirs'} size={size} />
);

// Rides/Games/Souvenirs expand their vendors inside the list; Drinks/Foods open a separate vendor page
export const INLINE_CATEGORIES = new Set(['C004', 'C005', 'C006']);

// Filter chips per category. The ids "A001"... are attribute_id values sent to the backend.
// "_adult" / "_family" are not attributes: they are filtered in the browser using activity_details.family_friendly.
export const CATEGORY_CHIPS: Record<string, { id: string; name: string }[]> = {
  C001: [
    { id: 'A001', name: 'Alcoholic' },
    { id: 'A002', name: 'Non-Alcoholic' },
  ],
  C003: [
    { id: 'A003', name: 'Vegan' },
    { id: 'A004', name: 'Non-Vegan' },
  ],
  C004: [
    { id: '_adult', name: 'Adult-Friendly' },
    { id: '_family', name: 'Family-Friendly' },
  ],
  C005: [
    { id: '_adult', name: 'Adult-Friendly' },
    { id: '_family', name: 'Family-Friendly' },
  ],
  C006: [],
};
