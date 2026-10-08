export interface TnvedItem {
  code: string; // 10-digit EAEU code, e.g. "8708299000"
  formattedCode: string; // e.g. "8708 29 900 0"
  name: string; // Official name in EAEU Commodity Classification
  shortName: string; // Human-friendly concise name
  category: string; // Group / category name
  chapter: string; // Chapter, e.g. "Группа 87: Автомобили и их части"
  
  // Duty & Tax Rates
  dutyRatePercent: number; // Base ad valorem import duty rate (%)
  dutyType: 'ad_valorem' | 'specific' | 'combined' | 'free';
  dutyNote?: string; // e.g. "не менее 0.12 € за кг"
  vatRatePercent: number; // Standard 20% or preferential 10%
  exciseNote?: string; // Акциз (если есть)
  
  // Non-tariff regulation & requirements
  requirements: string[]; // e.g. ["ТР ТС 018/2011 Безопасность колесных ТС", "Обязательное декларирование соответствия"]
  hasEacCertification: boolean; // Сертификат/декларация ЕАЭС
  hasFairSignMarking?: boolean; // Честный ЗНАК
  
  // Relevance / Documents source
  sourceDocNote?: string; // e.g. "Код из коммерческих предложений JINPENG / SHANXI"
  typicalCommodities?: string[]; // Examples of products belonging to this code
}

export interface TnvedDutyCalculationRequest {
  code: string;
  dutyRatePercent: number;
  vatRatePercent: number;
  customsValueRub: number;
  weightKg?: number;
  quantity?: number;
}

export interface TnvedDutyCalculationResult {
  code: string;
  customsValueRub: number;
  dutyRatePercent: number;
  dutyRub: number;
  customsFeeRub: number;
  customsFeeTierLabel: string;
  vatRatePercent: number;
  vatRub: number;
  totalCustomsPaymentsRub: number;
  effectiveTaxRatePercent: number; // (Пошлина + Сбор + НДС) / Таможенная стоимость * 100%
}
