import { argentinaRules } from '$lib/config/argentina';
import type { PurchaseInput, PurchaseResult } from '$lib/types';
import { toUSD } from './money';

export function calculatePuertaPuerta(input: PurchaseInput): PurchaseResult {
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
  const ivaUSD = cifUSD * argentinaRules.iva;
  const postalFeeUSD = input.postalServiceFeeARS / exchangeARS;
  const importTotalUSD = ivaUSD + postalFeeUSD;
  const importTotalARS = ivaUSD * exchangeARS + input.postalServiceFeeARS;
  const totalARS = shopTotalARS + importTotalARS;

  return {
    shopTotalOriginal,
    shopTotalUSD,
    shopTotalARS,
    fobUSD,
    cifUSD,
    taxableShippingUSD: shippingUSD,
    ivaUSD,
    handlingUSD: postalFeeUSD,
    prepaidImportFeesUSD: 0,
    prepaidImportFeesARS: 0,
    importTotalUSD,
    importTotalARS,
    totalUSD: totalARS / exchangeARS,
    totalARS,
    exchangeARS,
    appliedPrepaidMode: false,
    note: 'Correo Argentino liquida la tasa de servicio y almacenaje en el portal e-pago.'
  };
}
