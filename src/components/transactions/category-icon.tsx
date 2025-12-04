import { CATEGORY_INFO } from '@/lib/constants';
import type { Category } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CategoryIconProps {
  category: Category;
  size?: 'sm' | 'md' | 'lg';
}

export function CategoryIcon({ category, size = 'md' }: CategoryIconProps) {
  const info = CATEGORY_INFO[category];
  if (!info) return null;

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full',
        sizeClasses[size],
        info.color.replace('text-', 'bg-') + '/10'
      )}
    >
      <info.icon className={cn(iconSizeClasses[size], info.color)} />
    </div>
  );
}
