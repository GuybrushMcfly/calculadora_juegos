export type Regimen = 'courier' | 'puerta-puerta';
export type StoreId = 'amazon' | 'philibert' | 'magicmadhouse' | 'otro';
export type Currency = 'USD' | 'EUR' | 'GBP';
export type DollarKind = 'oficial' | 'blue' | 'mep' | 'tarjeta';

export type Store = {
  id: StoreId;
  name: string;
  country: string;
  currency: Currency;
  prepaidImportFees: boolean;
  defaultHandlingUSD: number;
  note: string;
};

export type Rates = {
  eurUsd: number;
  gbpUsd: number;
  dollars: Record<DollarKind, number>;
  updatedAt: string;
  source: string;
};

export type PurchaseInput = {
  regimen: Regimen;
  store: Store;
  products: number;
  shipping: number;
  shippingIsFree: boolean;
  currency: Currency;
  dollarKind: DollarKind;
  rates: Rates;
  courierHandlingUSD: number;
  postalServiceFeeARS: number;
};

export type PurchaseResult = {
  shopTotalOriginal: number;
  shopTotalUSD: number;
  shopTotalARS: number;
  fobUSD: number;
  cifUSD: number;
  taxableShippingUSD: number;
  ivaUSD: number;
  handlingUSD: number;
  importTotalUSD: number;
  importTotalARS: number;
  totalUSD: number;
  totalARS: number;
  exchangeARS: number;
  appliedPrepaidMode: boolean;
  note: string;
};
