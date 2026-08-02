import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { DollarKind, Rates } from '$lib/types';

const fallback: Rates = {
  eurUsd: 1.14,
  gbpUsd: 1.32,
  dollars: {
    oficial: 1500,
    blue: 1500,
    mep: 1500,
    tarjeta: 1950
  },
  updatedAt: new Date().toISOString(),
  source: 'fallback'
};

type DolarApiItem = {
  casa: string;
  venta: number;
};

const dollarMap: Record<string, DollarKind> = {
  oficial: 'oficial',
  blue: 'blue',
  bolsa: 'mep',
  tarjeta: 'tarjeta'
};

export const GET: RequestHandler = async ({ fetch, setHeaders }) => {
  setHeaders({
    'cache-control': 'public, max-age=900'
  });

  try {
    const [fxResponse, dollarsResponse] = await Promise.all([
      fetch('https://api.frankfurter.app/latest?from=EUR&to=USD,GBP'),
      fetch('https://dolarapi.com/v1/dolares')
    ]);

    if (!fxResponse.ok || !dollarsResponse.ok) {
      return json(fallback);
    }

    const fx = await fxResponse.json();
    const dolarApi = (await dollarsResponse.json()) as DolarApiItem[];
    const dollars = { ...fallback.dollars };

    for (const item of dolarApi) {
      const key = dollarMap[item.casa?.toLowerCase()];
      if (key && Number.isFinite(item.venta)) {
        dollars[key] = item.venta;
      }
    }

    const eurUsd = Number(fx.rates?.USD) || fallback.eurUsd;
    const eurGbp = Number(fx.rates?.GBP);
    const gbpUsd = eurGbp ? eurUsd / eurGbp : fallback.gbpUsd;

    return json({
      eurUsd,
      gbpUsd,
      dollars,
      updatedAt: new Date().toISOString(),
      source: 'frankfurter+dolarapi'
    } satisfies Rates);
  } catch {
    return json(fallback);
  }
};
