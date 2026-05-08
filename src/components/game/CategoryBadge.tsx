import type { Category } from '../../lib/types';

const CATEGORY_DISPLAY: Record<Category, { emoji: string; label: string; from: string; to: string; glow: string }> = {
  cities: {
    emoji: '🏙️',
    label: 'Cities',
    from: 'from-sky-100',
    to: 'to-sky-200',
    glow: 'ring-sky-200 dark:ring-sky-700/50 dark:from-sky-900/40 dark:to-sky-800/40 dark:text-sky-100',
  },
  fruits: {
    emoji: '🍍',
    label: 'Fruits',
    from: 'from-sunset-100',
    to: 'to-sunset-200',
    glow: 'ring-sunset-200 dark:ring-sunset-700/50 dark:from-sunset-900/40 dark:to-sunset-800/40 dark:text-sunset-100',
  },
  animals: {
    emoji: '🐼',
    label: 'Animals',
    from: 'from-bamboo-100',
    to: 'to-bamboo-200',
    glow: 'ring-bamboo-200 dark:ring-bamboo-700/50 dark:from-bamboo-900/40 dark:to-bamboo-800/40 dark:text-bamboo-100',
  },
  foods: {
    emoji: '🍜',
    label: 'Foods',
    from: 'from-pink-100',
    to: 'to-berry-200',
    glow: 'ring-berry-200 dark:ring-berry-700/50 dark:from-berry-900/40 dark:to-berry-800/40 dark:text-berry-100',
  },
};

export function CategoryBadge({ category }: { category: Category | null }) {
  if (!category) return null;
  const meta = CATEGORY_DISPLAY[category];
  return (
    <div
      className={`pill mx-auto bg-gradient-to-r ${meta.from} ${meta.to} text-slate-700 ring-1 shadow-sm ${meta.glow}`}
    >
      <span className="text-base drop-shadow-sm">{meta.emoji}</span>
      <span className="font-semibold tracking-wide">{meta.label}</span>
    </div>
  );
}
