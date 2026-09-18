import {
  RollBatchItem,
  SpecLineItem,
  LogisticsCustomsSettings,
  CalculationPreset,
  CompetitorSupplier,
} from '../types';

export type { CalculationPreset };

export const PRESETS: CalculationPreset[] = [
  {
    id: 'jinpeng_cotton_felt_40hq',
    name: 'JINPENG C2510034-2.1: Хлопковый войлок 40HQ (500 рул.)',
    sourceDoc: 'Quotation C2510034-2.1 & Расчет CSV',
    category: 'batch',
    description: '40HQ контейнер: 500 рулонов (5000 м²), цена 201.25 RMB/рулон (+15%), пошлина 12%, фрахт 475 600 ₽, сравнение с Тонлос (683.70 ₽/м²)',
    rates: {
      usdRub: 82.0,
      cnyRub: 11.079,
    },
    batchItem: {
      supplier: 'JINPENG AUTO TRIM CO.,LTD (SHANXI XINCONGBANG)',
      invoiceNo: 'C2510034-2.1',
      date: '2026-03-30',
      productName: 'Хлопковый войлок',
      description: 'Войлок с односторонним перфорированным нетканым материалом около 830 г/м²',
      hsCode: '8708299000',
      containerType: '40HQ',
      boxCount: 500, // 500 рулонов
      rollDiameterCm: 40,
      rollHeightCm: 1000,
      areaPerPieceM2: 10.0, // 10 кв.м на рулон
      densityGsm: 830, // 830 г/м2
      baseDensityGsm: 830,
      netWeightPerPieceKg: 27.0, // 13 500 кг / 500
      grossWeightPerPieceKg: 28.5,
      totalNetWeightKg: 13500,
      totalGrossWeightKg: 14250,
      totalVolumeM3: 65,
      pricingMode: 'per_piece',
      priceInCurrency: 201.25, // 201.25 юаней / рулон (+15% к базовой цене 175 RMB)
      currency: 'CNY',
      targetCompetitorPricePerM2Rub: 683.70, // Тонлос закупочная с НДС
      targetCompetitorName: 'Тонлос (РФ склад)',
      competitors: [
        {
          id: 'tonlos_rf',
          name: 'Тонлос (РФ склад)',
          priceRub: 683.70,
          unit: 'per_m2',
          includesVat: true,
          note: 'Закупочная с НДС из исходного расчета',
        },
        {
          id: 'spec_textile_rf',
          name: 'СпецТекстиль РФ (аналог)',
          priceRub: 720.00,
          unit: 'per_m2',
          includesVat: true,
          note: 'Аналог войлока плотностью 800-850 г/м²',
        },
        {
          id: 'optovik_roll',
          name: 'Оптовик РФ (рулон 10м²)',
          priceRub: 7100.00,
          unit: 'per_piece',
          includesVat: true,
          note: '7 100 ₽ за 1 рулон (710 ₽/м²)',
        },
      ],
      activeCompetitorId: 'tonlos_rf',
    },
    logistics: {
      freightCurrency: 'RUB',
      freightAmount: 475600, // или $5800 по курсу 82 = 475600 руб
      dutyRatePercent: 12.0,
      vatRatePercent: 22.0, // как в строке НДС 22% в CSV
      inlandDeliveryRub: 106000, // Доставка по РФ (Ставрополь)
      otherExpensesRub: 180000, // Прочие расходы (брокер, СВХ, сертификация)
      insuranceRub: 15000,
    },
  },
  {
    id: 'jinpeng_composite_felt_40hq',
    name: 'JINPENG C2510034-1.4: Композитный войлок 40HQ (1107 кор.)',
    sourceDoc: 'Quotation C2510034-1.4 (PDF)',
    category: 'batch',
    description: '40HQ контейнер: 1107 коробок (24824 кг нетто, 71 м³), цена 240 RMB/рулон (64 RMB/м²), FOB Тяньцзинь',
    rates: {
      usdRub: 82.0,
      cnyRub: 11.079,
    },
    batchItem: {
      supplier: 'JINPENG AUTO TRIM CO.,LTD',
      invoiceNo: 'C2510034-1.4',
      date: '2026-02-25',
      productName: 'Композитный звукопоглощающий войлок',
      description: 'Звукопоглощающий демпфирующий войлок на клейкой основе (5000*750*14 мм), ПЭТ-вата 400 г/м², демпфирующий слой 5500 г/м²',
      hsCode: '8708299000',
      containerType: '40HQ',
      boxCount: 1107,
      boxLengthMm: 760,
      boxWidthMm: 290,
      boxHeightMm: 290,
      areaPerPieceM2: 3.75, // 5.0m * 0.75m = 3.75 м²
      densityGsm: 5980, // 80 + 400 + 5500 г/м²
      baseDensityGsm: 5980,
      netWeightPerPieceKg: 22.425,
      grossWeightPerPieceKg: 23.425,
      totalNetWeightKg: 24824,
      totalGrossWeightKg: 25931,
      totalVolumeM3: 71,
      pricingMode: 'per_piece',
      priceInCurrency: 240, // 240 юаней/рулон (64 RMB/м²)
      currency: 'CNY',
      targetCompetitorPricePerM2Rub: 1050.0,
      targetCompetitorName: 'Рыночная цена в РФ',
    },
    logistics: {
      freightCurrency: 'USD',
      freightAmount: 5800, // $5,800
      dutyRatePercent: 12.0,
      vatRatePercent: 22.0,
      inlandDeliveryRub: 110000,
      otherExpensesRub: 180000,
      insuranceRub: 20000,
    },
  },
  {
    id: 'jinpeng_cotton_felt_20gp',
    name: 'JINPENG C2510034-2.1: Хлопковый войлок 20GP (200 рул.)',
    sourceDoc: 'Quotation C2510034-2.1 (20ft GP)',
    category: 'batch',
    description: '20GP контейнер: 200 рулонов (2000 м²), цена 175 RMB/рулон, фрахт $3 200',
    rates: {
      usdRub: 82.0,
      cnyRub: 11.079,
    },
    batchItem: {
      supplier: 'JINPENG AUTO TRIM CO.,LTD',
      invoiceNo: 'C2510034-2.1-20GP',
      date: '2026-03-30',
      productName: 'Хлопковый войлок (20GP)',
      description: 'Войлок с односторонним перфорированным нетканым материалом 830 г/м²',
      hsCode: '8708299000',
      containerType: '20GP',
      boxCount: 200,
      rollDiameterCm: 40,
      rollHeightCm: 1000,
      areaPerPieceM2: 10.0,
      densityGsm: 830,
      baseDensityGsm: 830,
      netWeightPerPieceKg: 27.0,
      grossWeightPerPieceKg: 28.5,
      totalNetWeightKg: 5400,
      totalGrossWeightKg: 5700,
      totalVolumeM3: 28,
      pricingMode: 'per_piece',
      priceInCurrency: 175,
      currency: 'CNY',
      targetCompetitorPricePerM2Rub: 683.70,
      targetCompetitorName: 'Тонлос (РФ склад)',
    },
    logistics: {
      freightCurrency: 'USD',
      freightAmount: 3200,
      dutyRatePercent: 12.0,
      vatRatePercent: 22.0,
      inlandDeliveryRub: 80000,
      otherExpensesRub: 150000,
      insuranceRub: 10000,
    },
  },
  {
    id: 'aluminium_profile_spec',
    name: 'Спецификация: Алюминиевые профили (8 позиций, $100 816)',
    sourceDoc: 'CSV расчет профилей',
    category: 'spec',
    description: 'Партия алюминиевого профиля 13 450 штанг (27 695 кг брутто), сумма $100 816.10, фрахт $4 500, пошлина 12% / 10%, НДС 22%',
    rates: {
      usdRub: 82.0,
      cnyRub: 11.079,
    },
    specItems: [
      { id: '1', name: 'Профиль #1 (L=5.85м, 0.214 кг/м)', lengthM: 5.85, meterWeightKgM: 0.214, quantity: 2600, theoreticalWeightKg: 3254.94, grossWeightKg: 3450.24, pricePerKgUsd: 3.83, totalAmountUsd: 13214.41 },
      { id: '2', name: 'Профиль #2 (L=5.85м, 0.340 кг/м)', lengthM: 5.85, meterWeightKgM: 0.340, quantity: 1650, theoreticalWeightKg: 3281.85, grossWeightKg: 3478.76, pricePerKgUsd: 3.83, totalAmountUsd: 12569.49 },
      { id: '3', name: 'Профиль #3 (L=5.85м, 0.321 кг/м)', lengthM: 5.85, meterWeightKgM: 0.321, quantity: 1750, theoreticalWeightKg: 3286.24, grossWeightKg: 3483.41, pricePerKgUsd: 3.83, totalAmountUsd: 12586.29 },
      { id: '4', name: 'Профиль #4 (L=5.85м, 0.441 кг/м)', lengthM: 5.85, meterWeightKgM: 0.441, quantity: 1260, theoreticalWeightKg: 3250.61, grossWeightKg: 3445.65, pricePerKgUsd: 3.83, totalAmountUsd: 12449.84 },
      { id: '5', name: 'Профиль #5 (L=5.85м, 0.320 кг/м)', lengthM: 5.85, meterWeightKgM: 0.320, quantity: 1750, theoreticalWeightKg: 3276.00, grossWeightKg: 3472.56, pricePerKgUsd: 3.83, totalAmountUsd: 12547.08 },
      { id: '6', name: 'Профиль #6 (L=5.85м, 0.299 кг/м)', lengthM: 5.85, meterWeightKgM: 0.299, quantity: 1860, theoreticalWeightKg: 3253.42, grossWeightKg: 3448.62, pricePerKgUsd: 3.83, totalAmountUsd: 12460.59 },
      { id: '7', name: 'Профиль #7 (L=5.85м, 0.516 кг/м)', lengthM: 5.85, meterWeightKgM: 0.516, quantity: 1080, theoreticalWeightKg: 3260.09, grossWeightKg: 3455.69, pricePerKgUsd: 3.83, totalAmountUsd: 12486.14 },
      { id: '8', name: 'Профиль #8 (L=5.85м, 0.372 кг/м)', lengthM: 5.85, meterWeightKgM: 0.372, quantity: 1500, theoreticalWeightKg: 3264.30, grossWeightKg: 3460.16, pricePerKgUsd: 3.83, totalAmountUsd: 12502.27 },
    ],
    logistics: {
      freightCurrency: 'USD',
      freightAmount: 4500,
      dutyRatePercent: 12.0, // можно переключить на 10%
      vatRatePercent: 22.0,
      inlandDeliveryRub: 140000,
      otherExpensesRub: 160000,
      insuranceRub: 25000,
    },
  },
];
