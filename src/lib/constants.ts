import type { Category, CategoryInfo } from '@/lib/types';
import {
  Briefcase,
  Utensils,
  Car,
  Home,
  Film,
  ShoppingBag,
  HeartPulse,
  MoreHorizontal,
} from 'lucide-react';

export const CATEGORY_INFO: Record<Category, CategoryInfo> = {
  Salary: { icon: Briefcase, color: 'text-green-500' },
  Food: { icon: Utensils, color: 'text-orange-500' },
  Transport: { icon: Car, color: 'text-blue-500' },
  Housing: { icon: Home, color: 'text-purple-500' },
  Entertainment: { icon: Film, color: 'text-red-500' },
  Shopping: { icon: ShoppingBag, color: 'text-pink-500' },
  Health: { icon: HeartPulse, color: 'text-indigo-500' },
  Other: { icon: MoreHorizontal, color: 'text-gray-500' },
};

export const CATEGORIES: Category[] = Object.keys(CATEGORY_INFO) as Category[];
