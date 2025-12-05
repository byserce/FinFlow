import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currencyCode: string = 'USD', locale: string = 'en-US') {
  // Handle TRY manually to ensure the '₺' symbol is always used.
  if (currencyCode === 'TRY') {
    const formattedAmount = new Intl.NumberFormat('tr-TR', {
      style: 'decimal', // Use decimal to avoid currency symbol/code
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `₺${formattedAmount}`;
  }

  // Use standard Intl for other currencies
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
  }).format(amount);
}
