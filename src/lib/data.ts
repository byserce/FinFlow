import type { Transaction } from './types';
import { subDays, formatISO } from 'date-fns';

const today = new Date();

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    amount: 5000,
    type: 'income',
    category: 'Salary',
    date: formatISO(subDays(today, 15)),
    note: 'Monthly salary',
  },
  {
    id: '2',
    amount: 25.5,
    type: 'expense',
    category: 'Food',
    date: formatISO(subDays(today, 1)),
    note: 'Lunch with colleagues',
  },
  {
    id: '3',
    amount: 12.0,
    type: 'expense',
    category: 'Transport',
    date: formatISO(subDays(today, 1)),
    note: 'Subway fare',
  },
  {
    id: '4',
    amount: 250,
    type: 'expense',
    category: 'Shopping',
    date: formatISO(subDays(today, 3)),
    note: 'New shoes',
  },
  {
    id: '5',
    amount: 75,
    type: 'expense',
    category: 'Entertainment',
    date: formatISO(subDays(today, 4)),
    note: 'Movie tickets',
  },
  {
    id: '6',
    amount: 15.0,
    type: 'expense',
    category: 'Food',
    date: formatISO(today.toISOString()),
    note: 'Coffee and pastry',
  },
  {
    id: '7',
    amount: 900,
    type: 'expense',
    category: 'Housing',
    date: formatISO(subDays(today, 10)),
    note: 'Rent payment',
  },
];
