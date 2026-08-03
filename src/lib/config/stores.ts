import type { Store } from '$lib/types';

export const courierStores: Store[] = [
  {
    id: 'amazon',
    name: 'Amazon',
    country: 'Global',
    currency: 'USD',
    prepaidImportFees: true,
    defaultHandlingUSD: 0,
    logoPath: '/logos/amazon.png',
    note: 'Usa el total mostrado por Amazon. No suma gestión courier adicional.'
  },
  {
    id: 'philibert',
    name: 'Philibert',
    country: 'Francia',
    currency: 'EUR',
    prepaidImportFees: false,
    defaultHandlingUSD: 15,
    logoPath: '/logos/philibert.png',
    note: 'DHL Express Zona 3: envío estimado según subtotal de productos.'
  },
  {
    id: 'magicmadhouse',
    name: 'Magic Madhouse',
    country: 'Reino Unido',
    currency: 'GBP',
    prepaidImportFees: false,
    defaultHandlingUSD: 15,
    logoPath: '/logos/magicmadhouse-icon.png',
    note: 'Envío fijo estimado: GBP 2.07.'
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

