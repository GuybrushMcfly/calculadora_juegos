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
    note: 'DHL Express Zona 3: envio estimado segun subtotal de productos.'
  },
  {
    id: 'magicmadhouse',
    name: 'Magic Madhouse',
    country: 'Reino Unido',
    currency: 'GBP',
    prepaidImportFees: false,
    defaultHandlingUSD: 15,
    note: 'Envio fijo estimado: GBP 2.07.'
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
