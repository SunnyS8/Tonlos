export type Currency = 'CNY' | 'USD' | 'RUB';

export interface CurrencyRates {
  usdRub: number; // e.g. 82.00
  cnyRub: number; // e.g. 11.079
  eurRub?: number;
  rateDate?: string; // YYYY-MM-DD
  effectiveDate?: string; // YYYY-MM-DD publication date
  isCbrOfficial?: boolean;
  usdDelta?: number;
  cnyDelta?: number;
  isWeekendShifted?: boolean;
  lastUpdated?: string;
}

export interface CustomsTariffTier {
  maxRub: number;
  fee: number;
  label: string;
}

export interface RollBatchItem {
  supplier: string;
  invoiceNo: string;
  date: string;
  productName: string;
  description: string;
  hsCode: string;
  containerType: '40HQ' | '20GP' | 'LCL';
  
  // Package & dimensions
  boxCount: number; // e.g. 500 rolls or 1107 boxes
  rollDiameterCm?: number;
  rollHeightCm?: number;
  boxLengthMm?: number;
  boxWidthMm?: number;
  boxHeightMm?: number;
  
  // Material specs
  areaPerPieceM2: number; // e.g. 10 m2 or 3.75 m2
  densityGsm: number; // e.g. 830 g/m2 or 5980 g/m2
  baseDensityGsm: number; // original reference density for "what-if" recalculation
  netWeightPerPieceKg: number;
  grossWeightPerPieceKg: number;
  
  // Totals
  totalGrossWeightKg: number;
  totalNetWeightKg: number;
  totalVolumeM3: number;
  
  // Pricing
  pricingMode: 'per_piece' | 'per_m2' | 'per_kg';
  priceInCurrency: number; // in CNY or USD
  currency: 'CNY' | 'USD';
  
  // Benchmark comparison (e.g. Tonlos domestic price)
  targetCompetitorPricePerM2Rub?: number;
  targetCompetitorName?: string;
  competitors?: CompetitorSupplier[];
  activeCompetitorId?: string;
}

export interface CompetitorSupplier {
  id: string;
  name: string;
  priceRub: number;
  unit: 'per_m2' | 'per_piece' | 'per_kg';
  includesVat: boolean;
  note?: string;
}

export interface CalculationPreset {
  id: string;
  name: string;
  sourceDoc: string;
  category: 'batch' | 'spec';
  description: string;
  rates: CurrencyRates | { usdRub: number; cnyRub: number };
  batchItem?: RollBatchItem;
  specItems?: SpecLineItem[];
  logistics: LogisticsCustomsSettings;
  isCustom?: boolean;
  createdAt?: string;
}

export interface SpecLineItem {
  id: string;
  name: string;
  lengthM: number;
  meterWeightKgM: number;
  quantity: number;
  theoreticalWeightKg: number;
  grossWeightKg: number;
  pricePerKgUsd: number;
  totalAmountUsd: number;
}

export interface LogisticsCustomsSettings {
  freightCurrency: 'USD' | 'RUB';
  freightAmount: number; // e.g. $5,800 or 475,600 руб
  dutyRatePercent: number; // e.g. 12% or 10%
  vatRatePercent: number; // 22%
  inlandDeliveryRub: number; // e.g. 106,000 руб (доставка по РФ / склад назначения)
  otherExpensesRub: number; // e.g. 180,000 руб (брокер, СВХ, сертификация)
  insuranceRub: number; // страхование груза
}

export interface CalculationResult {
  // Base Goods
  invoiceTotalCurrency: number;
  invoiceCurrency: 'CNY' | 'USD';
  invoiceTotalRub: number;
  invoiceTotalUsd: number;
  
  // Freight
  freightRub: number;
  freightUsd: number;
  
  // Customs
  customsValueRub: number; // Фактурная стоимость + Фрахт
  customsValueUsd: number;
  customsDutyRub: number;
  customsDutyUsd: number;
  customsFeeRub: number; // Таможенный сбор по сетке 2026
  customsFeeTierLabel: string;
  customsVatRub: number;
  customsVatUsd: number;
  totalCustomsPaymentsRub: number; // Пошлина + Сбор + НДС
  totalCustomsPaymentsUsd: number;
  
  // Inland Logistics & Other
  inlandDeliveryRub: number;
  otherExpensesRub: number;
  insuranceRub: number;
  totalOtherExpensesRub: number;
  
  // Grand Total "Под ключ"
  grandTotalRub: number;
  grandTotalUsd: number;
  
  // Cost breakdown per metric
  totalQuantity: number;
  totalNetWeightKg: number;
  totalGrossWeightKg: number;
  totalAreaM2: number;
  
  costPerPieceRubWithVat: number;
  costPerPieceRubNoVat: number;
  costPerKgRubWithVat: number;
  costPerKgRubNoVat: number;
  costPerM2RubWithVat: number;
  costPerM2RubNoVat: number;
  
  // Benchmark comparison
  competitorPricePerM2Rub?: number;
  competitorPriceTotalRub?: number;
  savingsPerM2Rub?: number;
  savingsTotalRub?: number;
  differencePercent?: number; // e.g. -15.82%
  activeCompetitorName?: string;
  allCompetitorsComparison?: {
    id: string;
    name: string;
    originalPrice: number;
    unit: 'per_m2' | 'per_piece' | 'per_kg';
    normalizedPricePerM2Rub: number;
    differencePercent: number;
    savingsTotalRub: number;
    hasSavings: boolean;
  }[];
}
