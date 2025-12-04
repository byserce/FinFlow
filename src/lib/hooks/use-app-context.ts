import { AppContext } from '@/context/app-provider';
import { useContext } from 'react';

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const useBudget = (budgetId: string) => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useBudget must be used within an AppProvider');
    }
    const budget = context.budgets.find((b) => b.id === budgetId);
    
    return { budget, isLoading: context.isLoading };
}
