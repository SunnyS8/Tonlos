import { TnvedItem, TnvedDutyCalculationResult } from '../types/tnved';
import { searchTnvedCatalog, getTnvedByCode, TNVED_CATALOG } from '../data/tnvedCatalog';
import { getCustomsFee2026 } from '../data/customsTariffs';
import { CurrencyRates } from '../types';

export interface SearchTnvedOptions {
  query: string;
  limit?: number;
  useAi?: boolean;
}

export interface SearchTnvedResponse {
  items: TnvedItem[];
  source: 'eaeu_tariff_db' | 'eaeu_ai_lookup' | 'local_fallback';
  fromApi: boolean;
}

/**
 * Searches TNVED codes via API with graceful local fallback
 */
export async function fetchTnvedCodes(
  options: SearchTnvedOptions
): Promise<SearchTnvedResponse> {
  const { query, limit = 12, useAi = false } = options;

  try {
    const res = await fetch('/api/tnved/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, limit, useAi }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.items) && data.items.length > 0) {
        return {
          items: data.items,
          source: data.source || 'eaeu_tariff_db',
          fromApi: true,
        };
      }
    }
  } catch (err) {
    console.warn('API /api/tnved/search unreachable, using local database:', err);
  }

  // Graceful fallback to rich local catalog
  const fallbackItems = searchTnvedCatalog(query, limit);
  return {
    items: fallbackItems,
    source: 'local_fallback',
    fromApi: false,
  };
}

/**
 * Calculates duty and customs payments for a given TNVED code and values via API / local
 */
export async function calculateTnvedDutyApi(params: {
  code: string;
  dutyRatePercent?: number;
  vatRatePercent?: number;
  invoiceAmount: number;
  invoiceCurrency: 'USD' | 'CNY' | 'RUB';
  freightAmount: number;
  freightCurrency: 'USD' | 'RUB';
  insuranceRub?: number;
  rates: CurrencyRates;
}): Promise<TnvedDutyCalculationResult> {
  const {
    code,
    dutyRatePercent: overrideDuty,
    vatRatePercent: overrideVat,
    invoiceAmount,
    invoiceCurrency,
    freightAmount,
    freightCurrency,
    insuranceRub = 0,
    rates,
  } = params;

  try {
    const res = await fetch('/api/tnved/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        dutyRatePercent: overrideDuty,
        vatRatePercent: overrideVat,
        invoiceAmount,
        invoiceCurrency,
        freightAmount,
        freightCurrency,
        insuranceRub,
        rates,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.calculation) {
        return data.calculation;
      }
    }
  } catch (err) {
    console.warn('API /api/tnved/calculate unreachable, calculating locally:', err);
  }

  // Local calculation fallback
  const item = getTnvedByCode(code);
  const dutyRate = typeof overrideDuty === 'number' ? overrideDuty : item?.dutyRatePercent ?? 12.0;
  const vatRate = typeof overrideVat === 'number' ? overrideVat : item?.vatRatePercent ?? 20.0;

  let invoiceRub = 0;
  if (invoiceCurrency === 'USD') {
    invoiceRub = invoiceAmount * rates.usdRub;
  } else if (invoiceCurrency === 'CNY') {
    invoiceRub = invoiceAmount * rates.cnyRub;
  } else {
    invoiceRub = invoiceAmount;
  }

  let freightRub = 0;
  if (freightCurrency === 'USD') {
    freightRub = freightAmount * rates.usdRub;
  } else {
    freightRub = freightAmount;
  }

  const customsValueRub = invoiceRub + freightRub + insuranceRub;
  const dutyRub = Math.round(customsValueRub * (dutyRate / 100));
  const feeData = getCustomsFee2026(customsValueRub);
  const customsFeeRub = feeData.fee;
  const customsFeeTierLabel = feeData.tier.label;

  const vatBaseRub = customsValueRub + dutyRub;
  const vatRub = Math.round(vatBaseRub * (vatRate / 100));
  const totalCustomsPaymentsRub = dutyRub + customsFeeRub + vatRub;

  return {
    code: code || item?.code || '8708299000',
    customsValueRub,
    dutyRatePercent: dutyRate,
    dutyRub,
    customsFeeRub,
    customsFeeTierLabel,
    vatRatePercent: vatRate,
    vatRub,
    totalCustomsPaymentsRub,
    effectiveTaxRatePercent:
      customsValueRub > 0
        ? Math.round((totalCustomsPaymentsRub / customsValueRub) * 1000) / 10
        : 0,
  };
}
