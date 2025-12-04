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
  Gift,
  DollarSign,
  TrendingUp,
  Award,
} from 'lucide-react';

export const CATEGORY_INFO: Record<Category, CategoryInfo> = {
  // Income
  Salary: { icon: Briefcase, color: 'text-green-500', type: 'income', label: 'Salary' },
  Gifts: { icon: Gift, color: 'text-yellow-500', type: 'income', label: 'Gifts' },
  Freelance: { icon: DollarSign, color: 'text-blue-500', type: 'income', label: 'Freelance' },
  Investments: { icon: TrendingUp, color: 'text-purple-500', type: 'income', label: 'Investments' },
  'Other Income': { icon: Award, color: 'text-indigo-500', type: 'income', label: 'Other Income' },
  
  // Expense
  Food: { icon: Utensils, color: 'text-orange-500', type: 'expense', label: 'Food' },
  Transport: { icon: Car, color: 'text-blue-500', type: 'expense', label: 'Transport' },
  Housing: { icon: Home, color: 'text-purple-500', type: 'expense', label: 'Housing' },
  Entertainment: { icon: Film, color: 'text-red-500', type: 'expense', label: 'Entertainment' },
  Shopping: { icon: ShoppingBag, color: 'text-pink-500', type: 'expense', label: 'Shopping' },
  Health: { icon: HeartPulse, color: 'text-indigo-500', type: 'expense', label: 'Health' },
  Other: { icon: MoreHorizontal, color: 'text-gray-500', type: 'expense', label: 'Other' },
};

export const CATEGORIES: Category[] = Object.keys(CATEGORY_INFO) as Category[];

export const INCOME_CATEGORIES = CATEGORIES.filter(c => CATEGORY_INFO[c].type === 'income');
export const EXPENSE_CATEGORIES = CATEGORIES.filter(c => CATEGORY_INFO[c].type === 'expense');
