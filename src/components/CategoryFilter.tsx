'use client';

interface CategoryFilterProps {
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const categories = [
  { id: null, label: 'Todos' },
  { id: 'yogurt', label: 'Yogurts' },
  { id: 'queso', label: 'Quesos' },
  { id: 'mantequilla', label: 'Mantequilla' },
  { id: 'manjar', label: 'Manjar' }
];

export function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(category => (
        <button
          key={category.id ?? 'all'}
          onClick={() => onCategoryChange(category.id)}
          className={`px-4 py-2 text-sm transition-all ${
            activeCategory === category.id
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'border border-neutral-300 bg-white text-neutral-600 hover:border-black hover:text-black dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:text-white'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
