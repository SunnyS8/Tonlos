import {
  CurrencyRates,
  RollBatchItem,
  SpecLineItem,
  LogisticsCustomsSettings,
  CalculationResult,
} from '../types';
import { getCustomsFee2026 } from '../data/customsTariffs';

export function calculateBatchResult(
  batch: RollBatchItem,
  logistics: LogisticsCustomsSettings,
  rates: CurrencyRates
): CalculationResult {
  const totalAreaM2 = batch.boxCount * batch.areaPerPieceM2;
  const totalNetWeightKg = batch.totalNetWeightKg || batch.boxCount * batch.netWeightPerPieceKg;
  const totalGrossWeightKg = batch.totalGrossWeightKg || batch.boxCount * batch.grossWeightPerPieceKg;
  const totalQuantity = batch.boxCount;

  // Invoice total in item's currency
  let invoiceTotalCurrency = 0;
  if (batch.pricingMode === 'per_piece') {
    invoiceTotalCurrency = batch.boxCount * batch.priceInCurrency;
  } else if (batch.pricingMode === 'per_m2') {
    invoiceTotalCurrency = totalAreaM2 * batch.priceInCurrency;
  } else if (batch.pricingMode === 'per_kg') {
    invoiceTotalCurrency = totalNetWeightKg * batch.priceInCurrency;
  }

  let invoiceTotalRub = 0;
  let invoiceTotalUsd = 0;

  if (batch.currency === 'CNY') {
    invoiceTotalRub = invoiceTotalCurrency * rates.cnyRub;
    invoiceTotalUsd = rates.usdRub > 0 ? invoiceTotalRub / rates.usdRub : 0;
  } else {
    invoiceTotalUsd = invoiceTotalCurrency;
    invoiceTotalRub = invoiceTotalUsd * rates.usdRub;
  }

  // Freight
  let freightRub = 0;
  let freightUsd = 0;
  if (logistics.freightCurrency === 'USD') {
    freightUsd = logistics.freightAmount;
    freightRub = freightUsd * rates.usdRub;
  } else {
    freightRub = logistics.freightAmount;
    freightUsd = rates.usdRub > 0 ? freightRub / rates.usdRub : 0;
  }

  const insuranceRub = logistics.insuranceRub || 0;

  // Customs Value (Таможенная стоимость)
  const customsValueRub = invoiceTotalRub + freightRub + insuranceRub;
  const customsValueUsd = rates.usdRub > 0 ? customsValueRub / rates.usdRub : 0;

  // Customs Duty (Пошлина)
  const customsDutyRub = customsValueRub * (logistics.dutyRatePercent / 100);
  const customsDutyUsd = rates.usdRub > 0 ? customsDutyRub / rates.usdRub : 0;

  // Customs Clearance Fee (Сбор по шкале 2026)
  const { fee: customsFeeRub, tier } = getCustomsFee2026(customsValueRub);

  // Customs VAT (НДС) = (Таможенная стоимость + Пошлина) * ставка НДС
  const vatBaseRub = customsValueRub + customsDutyRub;
  const customsVatRub = vatBaseRub * (logistics.vatRatePercent / 100);
  const customsVatUsd = rates.usdRub > 0 ? customsVatRub / rates.usdRub : 0;

  const totalCustomsPaymentsRub = customsDutyRub + customsFeeRub + customsVatRub;
  const totalCustomsPaymentsUsd = rates.usdRub > 0 ? totalCustomsPaymentsRub / rates.usdRub : 0;

  // Inland and other
  const inlandDeliveryRub = logistics.inlandDeliveryRub || 0;
  const otherExpensesRub = logistics.otherExpensesRub || 0;
  const totalOtherExpensesRub = inlandDeliveryRub + otherExpensesRub + insuranceRub;

  // Grand Total "Под ключ"
  const grandTotalRub =
    invoiceTotalRub +
    freightRub +
    customsDutyRub +
    customsFeeRub +
    customsVatRub +
    inlandDeliveryRub +
    otherExpensesRub +
    insuranceRub;

  const grandTotalUsd = rates.usdRub > 0 ? grandTotalRub / rates.usdRub : 0;

  // Unit costs
  const costPerPieceRubWithVat = totalQuantity > 0 ? grandTotalRub / totalQuantity : 0;
  const costPerPieceRubNoVat = totalQuantity > 0 ? (grandTotalRub - customsVatRub) / totalQuantity : 0;

  const costPerKgRubWithVat = totalNetWeightKg > 0 ? grandTotalRub / totalNetWeightKg : 0;
  const costPerKgRubNoVat = totalNetWeightKg > 0 ? (grandTotalRub - customsVatRub) / totalNetWeightKg : 0;

  const costPerM2RubWithVat = totalAreaM2 > 0 ? grandTotalRub / totalAreaM2 : 0;
  const costPerM2RubNoVat = totalAreaM2 > 0 ? (grandTotalRub - customsVatRub) / totalAreaM2 : 0;

  // Competitor comparison & normalization
  let competitorPricePerM2Rub = batch.targetCompetitorPricePerM2Rub;
  let activeCompetitorName = batch.targetCompetitorName || 'Конкурент (РФ)';

  if (batch.competitors && batch.competitors.length > 0) {
    const active = batch.competitors.find((c) => c.id === batch.activeCompetitorId) || batch.competitors[0];
    if (active) {
      activeCompetitorName = active.name;
      if (active.unit === 'per_m2') {
        competitorPricePerM2Rub = active.priceRub;
      } else if (active.unit === 'per_piece') {
        competitorPricePerM2Rub = totalAreaM2 > 0 && totalQuantity > 0 ? (active.priceRub * totalQuantity) / totalAreaM2 : (batch.areaPerPieceM2 > 0 ? active.priceRub / batch.areaPerPieceM2 : 0);
      } else if (active.unit === 'per_kg') {
        const weightPerM2 = totalAreaM2 > 0 ? totalNetWeightKg / totalAreaM2 : (batch.areaPerPieceM2 > 0 ? batch.netWeightPerPieceKg / batch.areaPerPieceM2 : 0);
        competitorPricePerM2Rub = active.priceRub * weightPerM2;
      }
    }
  }

  let competitorPriceTotalRub: number | undefined;
  let savingsPerM2Rub: number | undefined;
  let savingsTotalRub: number | undefined;
  let differencePercent: number | undefined;

  if (competitorPricePerM2Rub && competitorPricePerM2Rub > 0 && totalAreaM2 > 0) {
    competitorPriceTotalRub = competitorPricePerM2Rub * totalAreaM2;
    savingsPerM2Rub = competitorPricePerM2Rub - costPerM2RubWithVat;
    savingsTotalRub = savingsPerM2Rub * totalAreaM2;
    differencePercent = ((costPerM2RubWithVat - competitorPricePerM2Rub) / competitorPricePerM2Rub) * 100;
  }

  const allCompetitorsComparison = (batch.competitors || []).map((comp) => {
    let normM2 = comp.priceRub;
    if (comp.unit === 'per_piece') {
      normM2 = totalAreaM2 > 0 && totalQuantity > 0 ? (comp.priceRub * totalQuantity) / totalAreaM2 : (batch.areaPerPieceM2 > 0 ? comp.priceRub / batch.areaPerPieceM2 : 0);
    } else if (comp.unit === 'per_kg') {
      const weightPerM2 = totalAreaM2 > 0 ? totalNetWeightKg / totalAreaM2 : (batch.areaPerPieceM2 > 0 ? batch.netWeightPerPieceKg / batch.areaPerPieceM2 : 0);
      normM2 = comp.priceRub * weightPerM2;
    }
    const diffPct = normM2 > 0 ? ((costPerM2RubWithVat - normM2) / normM2) * 100 : 0;
    const savTotal = (normM2 - costPerM2RubWithVat) * totalAreaM2;
    return {
      id: comp.id,
      name: comp.name,
      originalPrice: comp.priceRub,
      unit: comp.unit,
      normalizedPricePerM2Rub: normM2,
      differencePercent: diffPct,
      savingsTotalRub: savTotal,
      hasSavings: savTotal >= 0,
    };
  });

  return {
    invoiceTotalCurrency,
    invoiceCurrency: batch.currency,
    invoiceTotalRub,
    invoiceTotalUsd,
    freightRub,
    freightUsd,
    customsValueRub,
    customsValueUsd,
    customsDutyRub,
    customsDutyUsd,
    customsFeeRub,
    customsFeeTierLabel: tier.label,
    customsVatRub,
    customsVatUsd,
    totalCustomsPaymentsRub,
    totalCustomsPaymentsUsd,
    inlandDeliveryRub,
    otherExpensesRub,
    insuranceRub,
    totalOtherExpensesRub,
    grandTotalRub,
    grandTotalUsd,
    totalQuantity,
    totalNetWeightKg,
    totalGrossWeightKg,
    totalAreaM2,
    costPerPieceRubWithVat,
    costPerPieceRubNoVat,
    costPerKgRubWithVat,
    costPerKgRubNoVat,
    costPerM2RubWithVat,
    costPerM2RubNoVat,
    competitorPricePerM2Rub,
    competitorPriceTotalRub,
    savingsPerM2Rub,
    savingsTotalRub,
    differencePercent,
    activeCompetitorName,
    allCompetitorsComparison,
  };
}

export function calculateSpecResult(
  specItems: SpecLineItem[],
  logistics: LogisticsCustomsSettings,
  rates: CurrencyRates
): CalculationResult {
  const totalQuantity = specItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
  const totalNetWeightKg = specItems.reduce((acc, item) => acc + (item.theoreticalWeightKg || 0), 0);
  const totalGrossWeightKg = specItems.reduce((acc, item) => acc + (item.grossWeightKg || 0), 0);
  const invoiceTotalCurrency = specItems.reduce((acc, item) => acc + (item.totalAmountUsd || 0), 0);

  const invoiceTotalUsd = invoiceTotalCurrency;
  const invoiceTotalRub = invoiceTotalUsd * rates.usdRub;

  // Freight
  let freightRub = 0;
  let freightUsd = 0;
  if (logistics.freightCurrency === 'USD') {
    freightUsd = logistics.freightAmount;
    freightRub = freightUsd * rates.usdRub;
  } else {
    freightRub = logistics.freightAmount;
    freightUsd = rates.usdRub > 0 ? freightRub / rates.usdRub : 0;
  }

  const insuranceRub = logistics.insuranceRub || 0;

  // Customs Value
  const customsValueRub = invoiceTotalRub + freightRub + insuranceRub;
  const customsValueUsd = rates.usdRub > 0 ? customsValueRub / rates.usdRub : 0;

  // Duty
  const customsDutyRub = customsValueRub * (logistics.dutyRatePercent / 100);
  const customsDutyUsd = rates.usdRub > 0 ? customsDutyRub / rates.usdRub : 0;

  // Fee 2026
  const { fee: customsFeeRub, tier } = getCustomsFee2026(customsValueRub);

  // VAT
  const vatBaseRub = customsValueRub + customsDutyRub;
  const customsVatRub = vatBaseRub * (logistics.vatRatePercent / 100);
  const customsVatUsd = rates.usdRub > 0 ? customsVatRub / rates.usdRub : 0;

  const totalCustomsPaymentsRub = customsDutyRub + customsFeeRub + customsVatRub;
  const totalCustomsPaymentsUsd = rates.usdRub > 0 ? totalCustomsPaymentsRub / rates.usdRub : 0;

  const inlandDeliveryRub = logistics.inlandDeliveryRub || 0;
  const otherExpensesRub = logistics.otherExpensesRub || 0;
  const totalOtherExpensesRub = inlandDeliveryRub + otherExpensesRub + insuranceRub;

  const grandTotalRub =
    invoiceTotalRub +
    freightRub +
    customsDutyRub +
    customsFeeRub +
    customsVatRub +
    inlandDeliveryRub +
    otherExpensesRub +
    insuranceRub;

  const grandTotalUsd = rates.usdRub > 0 ? grandTotalRub / rates.usdRub : 0;

  const costPerPieceRubWithVat = totalQuantity > 0 ? grandTotalRub / totalQuantity : 0;
  const costPerPieceRubNoVat = totalQuantity > 0 ? (grandTotalRub - customsVatRub) / totalQuantity : 0;

  const costPerKgRubWithVat = totalGrossWeightKg > 0 ? grandTotalRub / totalGrossWeightKg : 0;
  const costPerKgRubNoVat = totalGrossWeightKg > 0 ? (grandTotalRub - customsVatRub) / totalGrossWeightKg : 0;

  return {
    invoiceTotalCurrency,
    invoiceCurrency: 'USD',
    invoiceTotalRub,
    invoiceTotalUsd,
    freightRub,
    freightUsd,
    customsValueRub,
    customsValueUsd,
    customsDutyRub,
    customsDutyUsd,
    customsFeeRub,
    customsFeeTierLabel: tier.label,
    customsVatRub,
    customsVatUsd,
    totalCustomsPaymentsRub,
    totalCustomsPaymentsUsd,
    inlandDeliveryRub,
    otherExpensesRub,
    insuranceRub,
    totalOtherExpensesRub,
    grandTotalRub,
    grandTotalUsd,
    totalQuantity,
    totalNetWeightKg,
    totalGrossWeightKg,
    totalAreaM2: 0,
    costPerPieceRubWithVat,
    costPerPieceRubNoVat,
    costPerKgRubWithVat,
    costPerKgRubNoVat,
    costPerM2RubWithVat: 0,
    costPerM2RubNoVat: 0,
  };
}

/**
 * Format currency with Russian locale
 */
export function formatMoney(amount: number, currency: 'RUB' | 'USD' | 'CNY' = 'RUB', decimals = 2): string {
  const symbolMap = {
    RUB: '₽',
    USD: '$',
    CNY: '¥',
  };

  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  return `${formatted} ${symbolMap[currency]}`;
}

export function formatNumber(val: number, decimals = 2): string {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
}
