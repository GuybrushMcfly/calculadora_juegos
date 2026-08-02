<script lang="ts">
  import { onMount } from 'svelte';
  import { Banknote, Check, ChevronRight, Globe2, Package, ShieldCheck, Store, Truck } from '@lucide/svelte';
  import { calculatePurchase } from '$lib/calculator';
  import { formatMoney, formatNumber } from '$lib/calculator/money';
  import { courierStores } from '$lib/config/stores';
  import type { Currency, DollarKind, Rates, Regimen, Store as StoreType } from '$lib/types';

  const fallbackRates: Rates = {
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

  let regimen: Regimen = $state('courier');
  let selectedStoreId = $state<StoreType['id']>('amazon');
  let products = $state<number | null>(null);
  let shipping = $state<number | null>(null);
  let shippingIsFree = $state(false);
  let prepaidImportFees = $state<number | null>(null);
  let dollarKind = $state<DollarKind>('oficial');
  let postalServiceFeeARS = $state(0);
  let postalCurrency = $state<Currency>('USD');
  let rates = $state<Rates>(fallbackRates);
  let loadingRates = $state(true);
  let rateError = $state('');

  function clampPrice(value: number | null): number | null {
    if (value === null || !Number.isFinite(value)) return null;
    return Math.min(Math.max(value, 0), 9999.99);
  }
  function getPhilibertZone3ShippingEUR(amount: number): number | null {
    if (amount < 60) return 35;
    if (amount <= 120) return 50;
    if (amount <= 200) return 60;
    if (amount <= 300) return 75;
    return null;
  }

  $effect(() => {
    const nextProducts = clampPrice(products);
    const nextShipping = clampPrice(shipping);
    const nextPrepaidImportFees = clampPrice(prepaidImportFees);
    const nextPostalServiceFeeARS = clampPrice(postalServiceFeeARS);

    if (nextProducts !== products) products = nextProducts;
    if (nextShipping !== shipping) shipping = nextShipping;
    if (nextPrepaidImportFees !== prepaidImportFees) prepaidImportFees = nextPrepaidImportFees;
    if (nextPostalServiceFeeARS !== postalServiceFeeARS) postalServiceFeeARS = nextPostalServiceFeeARS ?? 0;
  });

  const safeProducts = $derived(clampPrice(products));
  const safeShipping = $derived(clampPrice(shipping));
  const safePrepaidImportFees = $derived(clampPrice(prepaidImportFees));
  const safePostalServiceFeeARS = $derived(clampPrice(postalServiceFeeARS));
  const selectedStore = $derived(courierStores.find((store) => store.id === selectedStoreId) ?? courierStores[0]);
  const currency = $derived<Currency>(regimen === 'puerta-puerta' ? postalCurrency : selectedStore.currency);
  const handling = $derived(selectedStore.defaultHandlingUSD);
  const isPhilibert = $derived(regimen === 'courier' && selectedStore.id === 'philibert');
  const isMagicMadhouse = $derived(regimen === 'courier' && selectedStore.id === 'magicmadhouse');
  const hasAutomaticShipping = $derived(isPhilibert || isMagicMadhouse);
  const philibertShipping = $derived(safeProducts !== null ? getPhilibertZone3ShippingEUR(safeProducts) : null);
  const automaticShipping = $derived(isPhilibert ? philibertShipping : isMagicMadhouse ? 2.07 : null);
  const effectiveShipping = $derived(hasAutomaticShipping ? (automaticShipping ?? 0) : (safeShipping ?? 0));
  const needsPhilibertQuote = $derived(isPhilibert && safeProducts !== null && safeProducts > 300);
  const hasRequiredInputs = $derived(
    safeProducts !== null &&
      safeProducts > 0 &&
      (hasAutomaticShipping ? automaticShipping !== null : safeShipping !== null && safeShipping >= 0)
  );
  const result = $derived(
    calculatePurchase({
      regimen,
      store: selectedStore,
      products: safeProducts ?? 0,
      shipping: effectiveShipping,
      shippingIsFree: hasAutomaticShipping ? false : shippingIsFree,
      currency,
      dollarKind,
      rates,
      courierHandlingUSD: handling,
      prepaidImportFees: selectedStore.prepaidImportFees ? (safePrepaidImportFees ?? 0) : 0,
      postalServiceFeeARS
    })
  );

  const amazonTaxDifferenceUSD = $derived(result.prepaidImportFeesUSD - result.ivaUSD);

  const dollarLabels: Record<DollarKind, string> = {
    oficial: 'Oficial',
    blue: 'Blue',
    mep: 'MEP',
    tarjeta: 'Tarjeta'
  };

  async function loadRates() {
    loadingRates = true;
    rateError = '';

    try {
      const response = await fetch('/api/rates');
      if (!response.ok) throw new Error('No se pudieron traer las cotizaciones');
      rates = await response.json();
    } catch {
      rates = fallbackRates;
      rateError = 'Usando valores de respaldo hasta que responda la API.';
    } finally {
      loadingRates = false;
    }
  }

  onMount(loadRates);
</script>

<svelte:head>
  <meta
    name="description"
    content="Calculadora dark responsive para estimar compras de juegos de mesa por courier o puerta a puerta."
  />
</svelte:head>

<main class="shell">
  <section class="hero">
    <div>
      <h1>&iquest;Cu&aacute;nto gasto en juegos?</h1>
    </div>
  </section>

  <div class="workspace">
    <section class="panel form-panel">
      <div class="section-title">
        <span class="step">1</span>
        <div>
          <h2>Regimen</h2>

        </div>
      </div>

      <div class="regimen-grid">
        <button class:active={regimen === 'courier'} type="button" onclick={() => (regimen = 'courier')}>
          <Truck size={22} />
          <span>Courier</span>
          <small>DHL, FedEx, UPS o Amazon Global</small>
          {#if regimen === 'courier'}<Check size={18} />{/if}
        </button>
        <button class:active={regimen === 'puerta-puerta'} type="button" onclick={() => (regimen = 'puerta-puerta')}>
          <Package size={22} />
          <span>Puerta a puerta</span>
          <small>Correo Argentino</small>
          {#if regimen === 'puerta-puerta'}<Check size={18} />{/if}
        </button>
      </div>

      {#if regimen === 'courier'}
        <div class="section-title compact">
          <span class="step">2</span>
          <div>
            <h2>Tienda</h2>

          </div>
        </div>

        <div class="store-list">
          {#each courierStores as store}
            <button
              type="button"
              class:active={selectedStoreId === store.id}
              onclick={() => (selectedStoreId = store.id)}
            >
              <span class="store-icon"><Store size={19} /></span>
              <span>
                <strong>{store.name}</strong>
                <small>{store.country} - {store.currency}</small>
              </span>
              <ChevronRight size={18} />
            </button>
          {/each}
        </div>
      {:else}
        <div class="coming-soon">
          <Package size={22} />
          <div>
            <strong>Puerta a puerta por Correo Argentino.</strong>
            <p>Usa productos + envio como base. La tasa del Correo se carga aparte cuando el portal la liquide.</p>
          </div>
        </div>
      {/if}

      <div class="section-title compact">
        <span class="step">3</span>
        <div>
          <h2>Compra</h2>
          <p>Productos y envio en {currency}.</p>
        </div>
      </div>

      {#if regimen === 'puerta-puerta'}
        <div class="currency-grid" aria-label="Moneda de la compra">
          <button type="button" class:active={postalCurrency === 'USD'} onclick={() => (postalCurrency = 'USD')}>USD</button>
          <button type="button" class:active={postalCurrency === 'EUR'} onclick={() => (postalCurrency = 'EUR')}>EUR</button>
          <button type="button" class:active={postalCurrency === 'GBP'} onclick={() => (postalCurrency = 'GBP')}>GBP</button>
        </div>
      {/if}

      <div class="input-grid purchase-grid" class:amazon-grid={regimen === 'courier' && selectedStore.prepaidImportFees}>
        <label>
          <span>Productos</span>
          <input type="number" min="0.01" max="9999.99" step="0.01" required bind:value={products} />
        </label>
        <label>
          <span>{isPhilibert ? 'Envio Zona 3' : isMagicMadhouse ? 'Envio fijo' : 'Envio'}</span>
          {#if hasAutomaticShipping}
            <input type="text" readonly value={automaticShipping === null ? 'Cotizar' : formatMoney(automaticShipping, currency)} />
          {:else}
            <input type="number" min="0" max="9999.99" step="0.01" required bind:value={shipping} />
          {/if}
        </label>
        {#if !hasAutomaticShipping}
          <div class="free-shipping">
            <span>Envio gratis</span>
            <div class="binary-buttons" aria-label="Envio gratis">
              <button type="button" class:active={shippingIsFree} onclick={() => (shippingIsFree = true)}>Si</button>
              <button type="button" class:active={!shippingIsFree} onclick={() => (shippingIsFree = false)}>No</button>
            </div>
          </div>
        {/if}
        {#if regimen === 'courier' && selectedStore.prepaidImportFees}
          <label>
            <span>Impuestos Amazon</span>
            <input type="number" min="0" max="9999.99" step="0.01" bind:value={prepaidImportFees} />
          </label>
        {/if}
      </div>

      {#if regimen === 'puerta-puerta'}
        <div class="section-title compact">
          <span class="step">4</span>
          <div>
            <h2>Correo Argentino</h2>
            <p>Tasa de servicio y almacenaje en pesos.</p>
          </div>
        </div>

        <div class="input-grid postal-grid">
          <label>
            <span>Tasa Correo ARS</span>
            <input type="number" min="0" max="9999.99" step="100" bind:value={postalServiceFeeARS} />
          </label>
          <div class="postal-note">
            ARCA informa que Correo cobra una tasa en todos los casos, pero el monto lo genera el portal e-pago en la liquidacion.
          </div>
        </div>
      {/if}

      <div class="section-title compact">
        <span class="step">{regimen === 'puerta-puerta' ? '5' : '4'}</span>
        <div>
          <h2>Dolar</h2>

        </div>
      </div>

      <div class="dollar-grid">
        {#each Object.entries(dollarLabels) as [key, label]}
          <button
            type="button"
            class:active={dollarKind === key}
            onclick={() => (dollarKind = key as DollarKind)}
          >
            <span>{label}</span>
            <strong>{formatMoney(rates.dollars[key as DollarKind], 'ARS')}</strong>
          </button>
        {/each}
      </div>

      {#if needsPhilibertQuote}
        <p class="warning">Philibert pide cotizacion para Zona 3 cuando la compra supera EUR 300 sin impuestos.</p>
      {/if}

      {#if rateError}
        <p class="warning">{rateError}</p>
      {/if}
    </section>

    <aside class="panel result-panel">
      <div class="result-top">
        <span class="store-pill"><Globe2 size={15} /> {regimen === 'puerta-puerta' ? 'Correo Argentino' : selectedStore.name}</span>
        <span class="store-pill"><Banknote size={15} /> {currency}</span>
        {#if shippingIsFree}<span class="store-pill"><Truck size={15} /> Envio gratis</span>{/if}
      </div>

      {#if hasRequiredInputs}
        <div class="total-block">
          <span>Total estimado</span>
          <strong>{formatMoney(result.totalARS, 'ARS')}</strong>
          <small>{formatMoney(result.totalUSD, 'USD')}</small>
        </div>

        <div class="breakdown">
          <div>
            <span>Pagas a la tienda</span>
            <strong>{formatMoney(result.shopTotalOriginal, currency)}</strong>
            <small>{formatMoney(result.shopTotalUSD, 'USD')} - {formatMoney(result.shopTotalARS, 'ARS')}</small>
          </div>
          <div>
            <span>FOB / productos</span>
            <strong>{formatMoney(result.fobUSD, 'USD')}</strong>
            <small>Limite de referencia: USD 400 FOB</small>
          </div>
          <div>
            <span>Envio para base</span>
            <strong>{formatMoney(result.taxableShippingUSD, 'USD')}</strong>
            <small>{isPhilibert ? 'Tarifa DHL Express Zona 3 segun subtotal' : isMagicMadhouse ? 'Envio fijo de Magic Madhouse' : shippingIsFree ? 'Esta bonificado en tienda, pero cuenta para la base' : 'Se paga y tambien cuenta para la base'}</small>
          </div>
          <div>
            <span>Base CIF / IVA</span>
            <strong>{formatMoney(result.cifUSD, 'USD')}</strong>
            <small>Productos + envio, incluso si el envio esta bonificado</small>
          </div>
          <div>
            <span>IVA estimado</span>
            <strong>{formatMoney(result.ivaUSD, 'USD')}</strong>
            <small>{formatMoney(result.ivaUSD * result.exchangeARS, 'ARS')}</small>
          </div>
          {#if selectedStore.prepaidImportFees}
            <div>
              <span>Impuestos Amazon</span>
              <strong>{formatMoney(result.prepaidImportFeesUSD, 'USD')}</strong>
              <small>Diferencia vs IVA: {formatMoney(amazonTaxDifferenceUSD, 'USD')}</small>
            </div>
          {/if}
          <div>
            <span>{regimen === 'puerta-puerta' ? 'Tasa Correo' : 'Gestion courier'}</span>
            <strong>{regimen === 'puerta-puerta' ? formatMoney(safePostalServiceFeeARS ?? 0, 'ARS') : formatMoney(result.handlingUSD, 'USD')}</strong>
            <small>{regimen === 'puerta-puerta' ? 'La informa Correo en e-pago' : selectedStore.prepaidImportFees ? 'No se suma en Amazon' : 'Valor estimado'}</small>
          </div>
          <div>
            <span>Pagas al ingresar</span>
            <strong>{formatMoney(result.importTotalARS, 'ARS')}</strong>
            <small>{formatMoney(result.importTotalUSD, 'USD')}</small>
          </div>
        </div>

        <div class="notice" class:success={result.appliedPrepaidMode}>
          <ShieldCheck size={20} />
          <p>{result.note}</p>
        </div>
      {/if}

      <div class="meta-row">
        <span>EUR/USD {formatNumber(rates.eurUsd)}</span>
        <span>GBP/USD {formatNumber(rates.gbpUsd)}</span>
      </div>
    </aside>
  </div>
</main>
