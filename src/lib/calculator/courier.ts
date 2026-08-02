import { argentinaRules } from '$lib/config/argentina';
import type { PurchaseInput, PurchaseResult } from '$lib/types';
import { toUSD } from './money';

export function calculateCourier(input: PurchaseInput): PurchaseResult {
  const productsUSD = toUSD(input.products, input.currency, input.rates);
  const shippingUSD = toUSD(input.shipping, input.currency, input.rates);
  const paidShippingOriginal = input.shippingIsFree ? 0 : input.shipping;
  const paidShippingUSD = input.shippingIsFree ? 0 : shippingUSD;
  const shopTotalOriginal = input.products + paidShippingOriginal;
  const shopTotalUSD = productsUSD + paidShippingUSD;
  const exchangeARS = input.rates.dollars[input.dollarKind];
  const shopTotalARS = shopTotalUSD * exchangeARS;
  const fobUSD = productsUSD;
  const cifUSD = productsUSD + shippingUSD;

  if (input.store.prepaidImportFees) {
    return {
      shopTotalOriginal,
      shopTotalUSD,
      shopTotalARS,
      fobUSD,
      cifUSD,
      taxableShippingUSD: shippingUSD,
      ivaUSD: 0,
      handlingUSD: 0,
      importTotalUSD: 0,
      importTotalARS: 0,
      totalUSD: shopTotalUSD,
      totalARS: shopTotalARS,
      exchangeARS,
      appliedPrepaidMode: true,
      note: input.store.note
    };
  }

  const ivaUSD = cifUSD * argentinaRules.iva;
  const handlingUSD = input.courierHandlingUSD;
  const importTotalUSD = ivaUSD + handlingUSD;
  const totalUSD = shopTotalUSD + importTotalUSD;

  return {
    shopTotalOriginal,
    shopTotalUSD,
    shopTotalARS,
    fobUSD,
    cifUSD,
    taxableShippingUSD: shippingUSD,
    ivaUSD,
    handlingUSD,
    importTotalUSD,
    importTotalARS: importTotalUSD * exchangeARS,
    totalUSD,
    totalARS: totalUSD * exchangeARS,
    exchangeARS,
    appliedPrepaidMode: false,
    note: input.store.note
  };
}
