import type { Store } from '$lib/types';

export const courierStores: Store[] = [
  {
    id: 'amazon',
    name: 'Amazon',
    country: 'Global',
    currency: 'USD',
    prepaidImportFees: true,
    defaultHandlingUSD: 0,
    note: 'Usa el total mostrado por Amazon. No suma gestion courier adicional.'
  },
  {
    id: 'philibert',
    name: 'Philibert',
    country: 'Francia',
    currency: 'EUR',
    prepaidImportFees: false,
    defaultHandlingUSD: 15,
    note: 'Pensado para envios por DHL/FedEx/UPS con cargos editables por operador.'
  },
  {
    id: 'magicmadhouse',
    name: 'Magic Madhouse',
    country: 'Reino Unido',
    currency: 'GBP',
    prepaidImportFees: false,
    defaultHandlingUSD: 15,
    note: 'Convierte desde libras y estima ingreso por courier.'
  },
  {
    id: 'otro',
    name: 'Otro',
    country: 'Exterior',
    currency: 'USD',
    prepaidImportFees: false,
    defaultHandlingUSD: 15,
    note: 'Para tiendas sin comportamiento preconfigurado.'
  }
];
