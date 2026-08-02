import type { Currency, Rates } from '$lib/types';

export function toUSD(amount: number, currency: Currency, rates: Rates): number {
  if (currency === 'EUR') return amount * rates.eurUsd;
  if (currency === 'GBP') return amount * rates.gbpUsd;
  return amount;
}

export function formatMoney(amount: number, currency: Currency | 'ARS'): string {
  const locale = currency === 'ARS' ? 'es-AR' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'ARS' ? 0 : 2
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: 2
  }).format(Number.isFinite(amount) ? amount : 0);
}
