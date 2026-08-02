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
  let products = $state(120);
  let shipping = $state(35);
  let shippingIsFree = $state(false);
  let dollarKind = $state<DollarKind>('oficial');
  let postalServiceFeeARS = $state(0);
  let rates = $state<Rates>(fallbackRates);
  let loadingRates = $state(true);
  let rateError = $state('');

  const selectedStore = $derived(courierStores.find((store) => store.id === selectedStoreId) ?? courierStores[0]);
  const currency = $derived<Currency>(regimen === 'puerta-puerta' ? 'USD' : selectedStore.currency);
  const handling = $derived(selectedStore.defaultHandlingUSD);
  const result = $derived(
    calculatePurchase({
      regimen,
      store: selectedStore,
      products,
      shipping,
      shippingIsFree,
      currency,
      dollarKind,
      rates,
      courierHandlingUSD: handling,
      postalServiceFeeARS
    })
  );

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
      <h1>Calculadora de compra de juegos</h1>
    </div>
  </section>

  <div class="workspace">
    <section class="panel form-panel">
      <div class="section-title">
        <span class="step">1</span>
        <div>
          <h2>Regimen</h2>
          <p>Primero elegimos como entra el paquete.</p>
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
            <p>Amazon no suma extras; las otras estiman ingreso courier.</p>
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

      <div class="input-grid purchase-grid">
        <label>
          <span>Productos</span>
          <input type="number" min="0" step="0.01" bind:value={products} />
        </label>
        <label>
          <span>Envio</span>
          <input type="number" min="0" step="0.01" bind:value={shipping} />
        </label>
        <label class="free-shipping">
          <span>Envio bonificado</span>
          <button type="button" class:active={shippingIsFree} onclick={() => (shippingIsFree = !shippingIsFree)}>
            <strong>{shippingIsFree ? 'Gratis' : 'Pago'}</strong>
            <small>{shippingIsFree ? 'No lo pagas, pero integra la base' : 'Se suma al pago de tienda'}</small>
          </button>
        </label>
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
            <input type="number" min="0" step="100" bind:value={postalServiceFeeARS} />
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
          <p>Sin valor manual: elegis la cotizacion.</p>
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
          <small>{shippingIsFree ? 'Esta bonificado en tienda, pero cuenta para la base' : 'Se paga y tambien cuenta para la base'}</small>
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
        <div>
          <span>{regimen === 'puerta-puerta' ? 'Tasa Correo' : 'Gestion courier'}</span>
          <strong>{regimen === 'puerta-puerta' ? formatMoney(postalServiceFeeARS, 'ARS') : formatMoney(result.handlingUSD, 'USD')}</strong>
          <small>{regimen === 'puerta-puerta' ? 'La informa Correo en e-pago' : selectedStore.prepaidImportFees ? 'No se suma en Amazon' : 'Valor sugerido por tienda, configurable luego'}</small>
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

      <div class="meta-row">
        <span>EUR/USD {formatNumber(rates.eurUsd)}</span>
        <span>GBP/USD {formatNumber(rates.gbpUsd)}</span>
      </div>
    </aside>
  </div>
</main>
