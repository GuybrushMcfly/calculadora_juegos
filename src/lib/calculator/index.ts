import type { PurchaseInput, PurchaseResult } from '$lib/types';
import { calculateCourier } from './courier';
import { calculatePuertaPuerta } from './puertaPuerta';

export function calculatePurchase(input: PurchaseInput): PurchaseResult {
  if (input.regimen === 'puerta-puerta') return calculatePuertaPuerta(input);
  return calculateCourier(input);
}
