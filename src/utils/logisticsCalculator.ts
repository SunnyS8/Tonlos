import * as XLSX from 'xlsx';
import {
  ForwarderQuote,
  CalculatedQuoteCost,
  LogisticsLandedImpact,
  CostComponent,
  DestinationWarehouse,
  RouteType,
} from '../types/logistics';
import {
  RollBatchItem,
  CurrencyRates,
  LogisticsCustomsSettings,
} from '../types';
import { calculateBatchResult } from './calculator';

export const LOGISTICS_QUOTES_STORAGE_KEY = 'ved_custom_logistics_quotes_v1';

export function toRub(comp: CostComponent, rates: CurrencyRates): number {
  switch (comp.currency) {
    case 'RUB':
      return comp.amount;
    case 'EUR':
      return comp.amount * (rates.usdRub * 1.08); // approximate or direct
    case 'CNY':
      return comp.amount * rates.cnyRub;
    case 'USD':
    default:
      return comp.amount * rates.usdRub;
  }
}

export function toUsd(comp: CostComponent, rates: CurrencyRates): number {
  return rates.usdRub > 0 ? toRub(comp, rates) / rates.usdRub : 0;
}

/** Расчет доплаты за перевес тоннажа сверх нормы */
export function calcOverweightRub(quote: ForwarderQuote): number {
  const overweight = quote.weightTons - quote.maxWeightTons;
  if (overweight <= 0 || quote.overweightRateRub <= 0) return 0;
  return Math.ceil(overweight) * quote.overweightRateRub;
}

/** Расчет полной стоимости котировки логистики (USD и RUB) */
export function calculateQuoteCost(
  quote: ForwarderQuote,
  rates: CurrencyRates
): CalculatedQuoteCost {
  const vatRate = (quote.vatRate || 22) / 100;

  // Морской/основной фрахт (USD) — международная перевозка без внутреннего НДС
  const oceanUsd = toUsd(quote.oceanFreight, rates);
  const oceanRub = oceanUsd * rates.usdRub;

  // Российские услуги (ЖД, авто, экспедирование, терминал)
  const railUsd = toUsd(quote.railFreight, rates);
  const railRub = railUsd * rates.usdRub;

  const truckUsd = toUsd(quote.truckDelivery, rates);
  const truckRub = truckUsd * rates.usdRub;

  const forwarderFeeUsd = toUsd(quote.forwarderFee, rates);
  const forwarderFeeRub = forwarderFeeUsd * rates.usdRub;

  const terminalExpensesUsd = toUsd(quote.terminalExpenses, rates);
  const terminalExpensesRub = terminalExpensesUsd * rates.usdRub;

  // Перевес (сверх нормы)
  const overweightRub = calcOverweightRub(quote);
  const overweightUsd = rates.usdRub > 0 ? overweightRub / rates.usdRub : 0;

  // НДС начисляется на внутренние услуги РФ
  const domesticServicesRub = railRub + truckRub + forwarderFeeRub + terminalExpensesRub;
  const vatRub = domesticServicesRub * vatRate;
  const vatUsd = rates.usdRub > 0 ? vatRub / rates.usdRub : 0;

  const totalRub = Math.round(oceanRub + domesticServicesRub + overweightRub + vatRub);
  const totalUsd = Math.round(rates.usdRub > 0 ? totalRub / rates.usdRub : 0);

  return {
    totalUsd,
    totalRub,
    oceanFreightUsd: Math.round(oceanUsd),
    oceanFreightRub: Math.round(oceanRub),
    railFreightUsd: Math.round(railUsd),
    railFreightRub: Math.round(railRub),
    truckDeliveryUsd: Math.round(truckUsd),
    truckDeliveryRub: Math.round(truckRub),
    forwarderFeeUsd: Math.round(forwarderFeeUsd),
    forwarderFeeRub: Math.round(forwarderFeeRub),
    terminalExpensesUsd: Math.round(terminalExpensesUsd),
    terminalExpensesRub: Math.round(terminalExpensesRub),
    overweightRub: Math.round(overweightRub),
    overweightUsd: Math.round(overweightUsd),
    vatRub: Math.round(vatRub),
    vatUsd: Math.round(vatUsd),
  };
}

/** Преобразование котировки логистики в настройки LogisticsCustomsSettings для калькулятора партии */
export function convertQuoteToLogisticsSettings(
  quote: ForwarderQuote,
  currentSettings: LogisticsCustomsSettings
): LogisticsCustomsSettings {
  return {
    ...currentSettings,
    freightCurrency: 'USD',
    freightAmount: quote.oceanFreight.amount,
    // Внутренняя автодоставка и Ж/Д плечо по РФ
    inlandDeliveryRub: quote.truckDelivery.amount + (quote.railFreight.currency === 'RUB' ? quote.railFreight.amount : 0),
    // Прочие расходы: экспедирование + терминальные расходы + перевес
    otherExpensesRub: quote.forwarderFee.amount + quote.terminalExpenses.amount + calcOverweightRub(quote),
  };
}

/**
 * Рассчитывает влияние всех вариантов логистики на себестоимость активной партии товаров
 */
export function calculateBatchLogisticsImpacts(
  quotes: ForwarderQuote[],
  batch: RollBatchItem,
  rates: CurrencyRates,
  currentLogistics: LogisticsCustomsSettings,
  activeQuoteId?: string
): LogisticsLandedImpact[] {
  // Базовый расчет с текущей логистикой
  const baseResult = calculateBatchResult(batch, currentLogistics, rates);

  const impacts = quotes.map((quote) => {
    const calc = calculateQuoteCost(quote, rates);
    const quoteLogistics = convertQuoteToLogisticsSettings(quote, currentLogistics);
    const result = calculateBatchResult(batch, quoteLogistics, rates);

    const deltaM2Rub = result.costPerM2RubWithVat - baseResult.costPerM2RubWithVat;
    const deltaTotalRub = result.grandTotalRub - baseResult.grandTotalRub;

    return {
      quote,
      calc,
      totalCostRub: result.grandTotalRub,
      costPerM2Rub: result.costPerM2RubWithVat,
      costPerPieceRub: result.costPerPieceRubWithVat,
      costPerKgRub: result.costPerKgRubWithVat,
      deltaM2Rub,
      deltaTotalRub,
      isCheapestPrice: false,
      isFastest: false,
      isSelected: quote.id === activeQuoteId,
    };
  });

  if (impacts.length > 0) {
    const minPrice = Math.min(...impacts.map((i) => i.calc.totalRub));
    const minDays = Math.min(...impacts.map((i) => i.quote.transitDaysMin));

    impacts.forEach((imp) => {
      imp.isCheapestPrice = imp.calc.totalRub === minPrice;
      imp.isFastest = imp.quote.transitDaysMin === minDays;
    });
  }

  return impacts;
}

// ================= LocalStorage Helpers =================

export function getStoredCustomQuotes(): ForwarderQuote[] {
  try {
    const saved = localStorage.getItem(LOGISTICS_QUOTES_STORAGE_KEY);
    if (!saved) return [];
    return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load custom quotes from localStorage', e);
    return [];
  }
}

export function saveStoredCustomQuotes(quotes: ForwarderQuote[]): void {
  try {
    localStorage.setItem(LOGISTICS_QUOTES_STORAGE_KEY, JSON.stringify(quotes));
  } catch (e) {
    console.error('Failed to save custom quotes to localStorage', e);
  }
}

// ================= Excel Parser for Quotes =================

export async function parseLogisticsExcelFile(file: File): Promise<ForwarderQuote[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const results: ForwarderQuote[] = [];

  const parseNum = (val: any) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const clean = String(val).replace(/[^\d.-]/g, '');
    return parseFloat(clean) || 0;
  };

  workbook.SheetNames.forEach((sheetName) => {
    const ws = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
    if (!rows || rows.length === 0) return;

    // 1. Попробуем найти табличный формат со строкой заголовков
    let headerRowIdx = -1;
    const colMap: Record<string, number> = {};

    for (let r = 0; r < Math.min(rows.length, 12); r++) {
      const row = rows[r];
      if (!Array.isArray(row)) continue;
      const rowStr = row.map((c) => String(c || '').toLowerCase()).join(' ');
      if (
        (rowStr.includes('экспедитор') || rowStr.includes('перевозчик') || rowStr.includes('forwarder')) &&
        (rowStr.includes('фрахт') || rowStr.includes('freight') || rowStr.includes('склад') || rowStr.includes('итог'))
      ) {
        headerRowIdx = r;
        row.forEach((cell, idx) => {
          const c = String(cell || '').toLowerCase().trim();
          if (c.includes('экспедитор') || c.includes('перевозчик') || c.includes('компания') || c === 'forwarder') colMap.forwarder = idx;
          else if (c.includes('склад') || c.includes('назначен') || c.includes('город')) colMap.destination = idx;
          else if (c.includes('морской фрахт') || (c.includes('фрахт') && c.includes('$')) || c === 'фрахт ($)' || c.includes('ocean')) colMap.freightUsd = idx;
          else if (c.includes('жд') || c.includes('ж/д') || c.includes('ж.д') || c.includes('rail')) colMap.rail = idx;
          else if (c.includes('авто') || c.includes('вывоз') || c.includes('доставк') || c.includes('truck')) colMap.truck = idx;
          else if (c.includes('срок') || c.includes('дней') || c.includes('дн') || c.includes('transit')) colMap.days = idx;
          else if (c.includes('маршрут') || c.includes('порт') || c.includes('route')) colMap.route = idx;
          else if (c.includes('примеч') || c.includes('услов') || c.includes('коммент')) colMap.comments = idx;
        });
        break;
      }
    }

    if (headerRowIdx !== -1 && colMap.forwarder !== undefined) {
      // Парсим строки таблицы
      for (let r = headerRowIdx + 1; r < rows.length; r++) {
        const row = rows[r];
        if (!Array.isArray(row) || row.length === 0) continue;
        const name = String(row[colMap.forwarder] || '').trim();
        if (!name || name === '-' || /^\d+$/.test(name)) continue;

        const destStr = colMap.destination !== undefined ? String(row[colMap.destination] || '') : '';
        const destination: DestinationWarehouse = /став/i.test(destStr) ? 'Ставрополь' : 'Серпухов';

        const freightUsd = colMap.freightUsd !== undefined ? parseNum(row[colMap.freightUsd]) : 4500;
        const railRub = colMap.rail !== undefined ? parseNum(row[colMap.rail]) : 0;
        const truckRub = colMap.truck !== undefined ? parseNum(row[colMap.truck]) : 78000;

        let daysMin = 30;
        let daysMax = 42;
        if (colMap.days !== undefined) {
          const daysStr = String(row[colMap.days] || '');
          const dMatch = daysStr.match(/(\d{1,2})\s*[-–]\s*(\d{1,2})/);
          if (dMatch) {
            daysMin = parseInt(dMatch[1]);
            daysMax = parseInt(dMatch[2]);
          } else {
            const singleD = parseNum(daysStr);
            if (singleD > 0) {
              daysMin = singleD;
              daysMax = singleD + 7;
            }
          }
        }

        const routeStr = colMap.route !== undefined ? String(row[colMap.route] || '') : '';
        let routeType: RouteType = 'sea_vvo_rail_truck';
        if (/новоросс/i.test(routeStr) || /deep/i.test(routeStr)) {
          routeType = 'deep_sea_novorossiysk';
        } else if (/прям/i.test(routeStr) || /поезд/i.test(routeStr) || /direct/i.test(routeStr)) {
          routeType = 'direct_rail_truck';
        }

        results.push({
          id: `imported_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${r}`,
          forwarderName: name,
          destination,
          originPort: /циндао/i.test(routeStr) ? 'Циндао' : 'Шанхай',
          routeType,
          transitHub: routeType === 'deep_sea_novorossiysk' ? 'Новороссийск' : 'Владивосток',
          routeDescription: routeStr || `Импортировано из ${file.name}`,
          containerSize: '40HC',
          weightTons: 26,
          maxWeightTons: 20,
          overweightRateRub: 2000,
          oceanFreight: { amount: freightUsd, currency: 'USD' },
          railFreight: { amount: railRub, currency: 'RUB' },
          truckDelivery: { amount: truckRub, currency: 'RUB' },
          forwarderFee: { amount: 15000, currency: 'RUB' },
          terminalExpenses: { amount: 35000, currency: 'RUB' },
          vatRate: 22,
          transitDaysMin: daysMin,
          transitDaysMax: daysMax,
          validUntil: '2026-10-31',
          comments: colMap.comments !== undefined ? String(row[colMap.comments] || '') : `Из файла ${file.name}`,
        });
      }
      return;
    }

    // 2. Иначе парсим как текстовое КП / карточку (неструктурированный лист)
    const textBlob = rows.map((r) => r.filter(Boolean).join(' ')).join('\n');
    const lowerBlob = textBlob.toLowerCase();

    // Определение экспедитора из имени файла / листа
    let forwarderName = 'Новый перевозчик';
    if (/галеос/i.test(file.name) || /галеос/i.test(sheetName)) forwarderName = 'Галеос';
    else if (/дельпорте/i.test(file.name) || /дельпорте/i.test(sheetName)) forwarderName = 'Дельпорте';
    else if (/игл/i.test(file.name) || /игл/i.test(sheetName)) forwarderName = 'ИГЛ';
    else if (/циндао/i.test(file.name) || /циндао/i.test(sheetName)) forwarderName = 'порт Циндао';
    else {
      // Попытка найти название компании
      const compMatch = textBlob.match(/(?:ооо|зао|пао|тк|экспедитор|компания)\s*["«']?([А-Яа-яA-Za-z0-9_-]{3,20})/i);
      if (compMatch) forwarderName = compMatch[1];
    }

    // Определение направления
    const destination: DestinationWarehouse =
      /ставрополь/i.test(lowerBlob) || /став/i.test(lowerBlob) ? 'Ставрополь' : 'Серпухов';

    // Определение типа маршрута
    let routeType: RouteType = 'sea_vvo_rail_truck';
    if (/новоросс/i.test(lowerBlob) || /deep\s*sea/i.test(lowerBlob)) {
      routeType = 'deep_sea_novorossiysk';
    } else if (/прям/i.test(lowerBlob) || /direct/i.test(lowerBlob) || /поезд/i.test(lowerBlob)) {
      routeType = 'direct_rail_truck';
    }

    // Извлечение чисел
    const freightMatch = textBlob.match(/(?:фрахт|fob|usd|фоб|ocean)[^\d]*(\d[\d\s]*\d)/i);
    const railMatch = textBlob.match(/(?:жд|ж\/д|ж\.д|rail)[^\d]*(\d[\d\s]*\d)/i);
    const truckMatch = textBlob.match(/(?:авто|вывоз|доставк|truck)[^\d]*(\d[\d\s]*\d)/i);
    const feeMatch = textBlob.match(/(?:вознаграж|экспедир|fee)[^\d]*(\d[\d\s]*\d)/i);
    const daysMatch = textBlob.match(/(\d{1,2})\s*[-–]\s*(\d{1,2})\s*(?:дн|сут|дней)/i);

    const freightUsd = freightMatch ? parseNum(freightMatch[1]) : 4500;
    const railRub = railMatch ? parseNum(railMatch[1]) : 0;
    const truckRub = truckMatch ? parseNum(truckMatch[1]) : 78000;
    const feeRub = feeMatch ? parseNum(feeMatch[1]) : 15000;
    const daysMin = daysMatch ? parseInt(daysMatch[1]) : 30;
    const daysMax = daysMatch ? parseInt(daysMatch[2]) : 40;

    results.push({
      id: `imported_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      forwarderName,
      destination,
      originPort: /циндао/i.test(textBlob) ? 'Циндао' : 'Шанхай',
      routeType,
      transitHub: routeType === 'deep_sea_novorossiysk' ? 'Новороссийск' : 'Владивосток',
      routeDescription: `Импортировано из ${file.name} (${sheetName})`,
      containerSize: '40HC',
      weightTons: 26,
      maxWeightTons: 20,
      overweightRateRub: 2000,
      oceanFreight: { amount: freightUsd, currency: 'USD' },
      railFreight: { amount: railRub, currency: 'RUB' },
      truckDelivery: { amount: truckRub, currency: 'RUB' },
      forwarderFee: { amount: feeRub, currency: 'RUB' },
      terminalExpenses: { amount: 35000, currency: 'RUB' },
      vatRate: 22,
      transitDaysMin: daysMin,
      transitDaysMax: daysMax,
      validUntil: '2026-10-31',
      comments: `Данные из листа ${sheetName}`,
    });
  });

  return results;
}

// ================= Carrier Tariffs Export (Excel, CSV, TSV, Text) =================

export function getRouteTypeLabel(type: RouteType): string {
  switch (type) {
    case 'sea_vvo_rail_truck':
      return 'Море ВВО + Ж/Д + Авто';
    case 'direct_rail_truck':
      return 'Прямое Ж/Д + Авто';
    case 'deep_sea_novorossiysk':
      return 'Deep Sea (Новороссийск) + Авто';
    default:
      return type;
  }
}

export function exportQuotesToExcel(
  quotes: ForwarderQuote[],
  rates: CurrencyRates,
  batch?: RollBatchItem,
  currentLogistics?: LogisticsCustomsSettings
): Blob {
  const wb = XLSX.utils.book_new();

  const impacts =
    batch && currentLogistics
      ? calculateBatchLogisticsImpacts(quotes, batch, rates, currentLogistics)
      : null;

  // Sheet 1: Тарифы перевозчиков
  const headers = [
    '№',
    'Экспедитор',
    'Склад назначения',
    'Порт отправления',
    'Хаб / Порт РФ',
    'Тип маршрута',
    'Тип КТК',
    'Срок (дней)',
    'Морской фрахт ($)',
    'Фрахт в рублях (₽)',
    'Ж/Д тариф (₽)',
    'Автовывоз (₽)',
    'Экспедирование (₽)',
    'Терминал / СВХ (₽)',
    'Перевес (₽)',
    'ИТОГО Логистика (₽)',
    'ИТОГО Логистика ($)',
  ];

  if (impacts) {
    headers.push(
      'Себестоимость 1 м² (₽ с НДС)',
      'Себестоимость 1 шт (₽ с НДС)',
      'Итого партия под ключ (₽ с НДС)',
      'Разница за м² (₽)'
    );
  }

  headers.push('Действительно до', 'Условия и примечания');

  const rows: any[][] = [headers];

  quotes.forEach((q, idx) => {
    const calc = calculateQuoteCost(q, rates);
    const impact = impacts?.find((im) => im.quote.id === q.id);

    const row: any[] = [
      idx + 1,
      q.forwarderName,
      q.destination,
      q.originPort,
      q.transitHub,
      getRouteTypeLabel(q.routeType),
      q.containerSize,
      `${q.transitDaysMin}–${q.transitDaysMax}`,
      calc.oceanFreightUsd,
      Math.round(calc.oceanFreightRub),
      Math.round(calc.railFreightRub),
      Math.round(calc.truckDeliveryRub),
      Math.round(calc.forwarderFeeRub),
      Math.round(calc.terminalExpensesRub),
      Math.round(calc.overweightRub),
      Math.round(calc.totalRub),
      Math.round(calc.totalUsd),
    ];

    if (impact) {
      row.push(
        Number(impact.costPerM2Rub.toFixed(2)),
        Number(impact.costPerPieceRub.toFixed(2)),
        Math.round(impact.totalCostRub),
        Number(impact.deltaM2Rub.toFixed(2))
      );
    }

    row.push(q.validUntil || 'По запросу', q.comments || q.routeDescription || '');
    rows.push(row);
  });

  const wsMain = XLSX.utils.aoa_to_sheet(rows);

  wsMain['!cols'] = [
    { wch: 5 },
    { wch: 18 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 26 },
    { wch: 10 },
    { wch: 12 },
    { wch: 14 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 16 },
    ...(impacts
      ? [
          { wch: 22 },
          { wch: 22 },
          { wch: 24 },
          { wch: 16 },
        ]
      : []),
    { wch: 14 },
    { wch: 40 },
  ];

  XLSX.utils.book_append_sheet(wb, wsMain, 'Тарифы перевозчиков');

  // Sheet 2: Аналитика по складам
  const serpQuotes = quotes.filter((q) => q.destination === 'Серпухов');
  const stavQuotes = quotes.filter((q) => q.destination === 'Ставрополь');

  const summaryRows: any[][] = [
    ['СВОДНЫЙ АНАЛИЗ СТАВОК ПЕРЕВОЗЧИКОВ ПО СКЛАДАМ НАЗНАЧЕНИЯ', ''],
    ['Дата выгрузки', new Date().toLocaleDateString('ru-RU')],
    ['Курс USD/RUB (ЦБ РФ)', rates.usdRub],
    ['Курс CNY/RUB (ЦБ РФ)', rates.cnyRub],
    ['', ''],
    [
      'Направление',
      'Кол-во вариантов',
      'Мин. цена доставки (₽)',
      'Макс. цена доставки (₽)',
      'Средняя цена (₽)',
      'Мин. срок (дней)',
      'Макс. срок (дней)',
    ],
  ];

  const addDestSummary = (name: string, destQuotes: ForwarderQuote[]) => {
    if (destQuotes.length === 0) return;
    const costs = destQuotes.map((q) => calculateQuoteCost(q, rates).totalRub);
    const minDays = Math.min(...destQuotes.map((q) => q.transitDaysMin));
    const maxDays = Math.max(...destQuotes.map((q) => q.transitDaysMax));
    const minCost = Math.min(...costs);
    const maxCost = Math.max(...costs);
    const avgCost = costs.reduce((a, b) => a + b, 0) / costs.length;

    summaryRows.push([
      name,
      destQuotes.length,
      Math.round(minCost),
      Math.round(maxCost),
      Math.round(avgCost),
      minDays,
      maxDays,
    ]);
  };

  addDestSummary('Серпухов (Московская обл.)', serpQuotes);
  addDestSummary('Ставрополь', stavQuotes);

  if (batch) {
    summaryRows.push(
      ['', ''],
      ['ПАРАМЕТРЫ РАСЧЕТНОЙ ПАРТИИ ДЛЯ ОЦЕНКИ СЕБЕСТОИМОСТИ', ''],
      ['Товар', batch.productName],
      ['Поставщик', batch.supplier],
      ['Количество коробок/рулонов', batch.boxCount],
      ['Площадь 1 рулона (м²)', batch.areaPerPieceM2],
      ['Общая площадь партии (м²)', (batch.boxCount || 0) * (batch.areaPerPieceM2 || 0)],
      ['Вес нетто партии (кг)', batch.totalNetWeightKg],
      ['Инвойс за единицу', `${batch.priceInCurrency} ${batch.currency}`],
      ['Код ТН ВЭД', batch.hsCode]
    );
  }

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [
    { wch: 32 },
    { wch: 18 },
    { wch: 22 },
    { wch: 22 },
    { wch: 20 },
    { wch: 16 },
    { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Сводка по складам');

  const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbOut], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export function downloadQuotesExcel(
  quotes: ForwarderQuote[],
  rates: CurrencyRates,
  batch?: RollBatchItem,
  currentLogistics?: LogisticsCustomsSettings,
  filename = `Тарифы_перевозчиков_Китай_РФ_${new Date().toISOString().slice(0, 10)}.xlsx`
): void {
  const blob = exportQuotesToExcel(quotes, rates, batch, currentLogistics);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportQuotesToCsv(
  quotes: ForwarderQuote[],
  rates: CurrencyRates,
  batch?: RollBatchItem,
  currentLogistics?: LogisticsCustomsSettings
): string {
  const impacts =
    batch && currentLogistics
      ? calculateBatchLogisticsImpacts(quotes, batch, rates, currentLogistics)
      : null;

  const headers = [
    '№',
    'Экспедитор',
    'Склад назначения',
    'Порт отправления',
    'Хаб РФ',
    'Тип маршрута',
    'Контейнер',
    'Срок доставки (дн)',
    'Фрахт USD',
    'Фрахт RUB',
    'ЖД тариф RUB',
    'Автовывоз RUB',
    'Экспедирование RUB',
    'Терминал RUB',
    'Перевес RUB',
    'Итого логистика RUB',
    'Итого логистика USD',
  ];

  if (impacts) {
    headers.push(
      'Себестоимость 1 м2 с НДС',
      'Себестоимость 1 шт с НДС',
      'Партия под ключ с НДС',
      'Разница за м2'
    );
  }

  headers.push('Действительно до', 'Примечания');

  const lines = [headers.join(';')];

  quotes.forEach((q, idx) => {
    const calc = calculateQuoteCost(q, rates);
    const impact = impacts?.find((im) => im.quote.id === q.id);

    const cols: any[] = [
      idx + 1,
      `"${q.forwarderName}"`,
      `"${q.destination}"`,
      `"${q.originPort}"`,
      `"${q.transitHub}"`,
      `"${getRouteTypeLabel(q.routeType)}"`,
      q.containerSize,
      `"${q.transitDaysMin}-${q.transitDaysMax}"`,
      calc.oceanFreightUsd,
      Math.round(calc.oceanFreightRub),
      Math.round(calc.railFreightRub),
      Math.round(calc.truckDeliveryRub),
      Math.round(calc.forwarderFeeRub),
      Math.round(calc.terminalExpensesRub),
      Math.round(calc.overweightRub),
      Math.round(calc.totalRub),
      Math.round(calc.totalUsd),
    ];

    if (impact) {
      cols.push(
        impact.costPerM2Rub.toFixed(2),
        impact.costPerPieceRub.toFixed(2),
        Math.round(impact.totalCostRub),
        impact.deltaM2Rub.toFixed(2)
      );
    }

    cols.push(`"${q.validUntil || ''}"`, `"${(q.comments || q.routeDescription || '').replace(/"/g, '""')}"`);
    lines.push(cols.join(';'));
  });

  return lines.join('\n');
}

export function downloadQuotesCsv(
  quotes: ForwarderQuote[],
  rates: CurrencyRates,
  batch?: RollBatchItem,
  currentLogistics?: LogisticsCustomsSettings,
  filename = `Тарифы_перевозчиков_Китай_РФ_${new Date().toISOString().slice(0, 10)}.csv`
): void {
  const csv = exportQuotesToCsv(quotes, rates, batch, currentLogistics);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportQuotesToTsv(
  quotes: ForwarderQuote[],
  rates: CurrencyRates,
  batch?: RollBatchItem,
  currentLogistics?: LogisticsCustomsSettings
): string {
  const impacts =
    batch && currentLogistics
      ? calculateBatchLogisticsImpacts(quotes, batch, rates, currentLogistics)
      : null;

  const headers = [
    'Экспедитор',
    'Склад',
    'Маршрут',
    'Тип',
    'КТК',
    'Срок (дн)',
    'Фрахт ($)',
    'Логистика (₽)',
    'Логистика ($)',
  ];

  if (impacts) {
    headers.push('Себестоимость 1 м² (₽)', 'Себестоимость 1 шт (₽)', 'Итого партия (₽)');
  }

  headers.push('Примечания');

  const lines = [headers.join('\t')];

  quotes.forEach((q) => {
    const calc = calculateQuoteCost(q, rates);
    const impact = impacts?.find((im) => im.quote.id === q.id);

    const cols: any[] = [
      q.forwarderName,
      q.destination,
      `${q.originPort} ➔ ${q.transitHub} ➔ ${q.destination}`,
      getRouteTypeLabel(q.routeType),
      q.containerSize,
      `${q.transitDaysMin}–${q.transitDaysMax}`,
      calc.oceanFreightUsd,
      Math.round(calc.totalRub),
      Math.round(calc.totalUsd),
    ];

    if (impact) {
      cols.push(
        impact.costPerM2Rub.toFixed(2),
        impact.costPerPieceRub.toFixed(2),
        Math.round(impact.totalCostRub)
      );
    }

    cols.push(q.comments || q.routeDescription || '');
    lines.push(cols.join('\t'));
  });

  return lines.join('\n');
}

export function generateQuotesTextReport(
  quotes: ForwarderQuote[],
  rates: CurrencyRates,
  batch?: RollBatchItem,
  currentLogistics?: LogisticsCustomsSettings
): string {
  const impacts =
    batch && currentLogistics
      ? calculateBatchLogisticsImpacts(quotes, batch, rates, currentLogistics)
      : null;

  let text = `СРАВНЕНИЕ ТАРИФОВ ПЕРЕВОЗЧИКОВ (КИТАЙ ➔ РФ)\n`;
  text += `Дата выгрузки: ${new Date().toLocaleDateString('ru-RU')}\n`;
  text += `Курсы ЦБ РФ: USD = ${rates.usdRub} ₽, CNY = ${rates.cnyRub} ₽\n`;
  if (batch) {
    text += `Товар: ${batch.productName} (${batch.boxCount} шт, ${
      ((batch.boxCount || 0) * (batch.areaPerPieceM2 || 0)).toLocaleString('ru-RU')
    } м²)\n`;
  }
  text += `------------------------------------------------------------\n\n`;

  quotes.forEach((q, i) => {
    const calc = calculateQuoteCost(q, rates);
    const impact = impacts?.find((im) => im.quote.id === q.id);

    text += `${i + 1}. ${q.forwarderName.toUpperCase()} — ${q.destination} (${q.containerSize})\n`;
    text += `   Маршрут: ${q.originPort} ➔ ${q.transitHub} ➔ ${q.destination} [${getRouteTypeLabel(q.routeType)}]\n`;
    text += `   Срок доставки: ${q.transitDaysMin}–${q.transitDaysMax} дн.\n`;
    text += `   Фрахт: $${calc.oceanFreightUsd.toLocaleString('ru-RU')} (${Math.round(calc.oceanFreightRub).toLocaleString('ru-RU')} ₽)\n`;
    if (calc.railFreightRub > 0) text += `   Ж/Д тариф: ${Math.round(calc.railFreightRub).toLocaleString('ru-RU')} ₽\n`;
    if (calc.truckDeliveryRub > 0) text += `   Автовывоз: ${Math.round(calc.truckDeliveryRub).toLocaleString('ru-RU')} ₽\n`;
    if (calc.terminalExpensesRub > 0) text += `   Терминал/СВХ: ${Math.round(calc.terminalExpensesRub).toLocaleString('ru-RU')} ₽\n`;
    if (calc.forwarderFeeRub > 0) text += `   Экспедирование: ${Math.round(calc.forwarderFeeRub).toLocaleString('ru-RU')} ₽\n`;
    if (calc.overweightRub > 0) text += `   Доплата за перевес: ${Math.round(calc.overweightRub).toLocaleString('ru-RU')} ₽\n`;
    text += `   ИТОГО ЛОГИСТИКА: ${Math.round(calc.totalRub).toLocaleString('ru-RU')} ₽ ($${Math.round(calc.totalUsd).toLocaleString('ru-RU')})\n`;

    if (impact) {
      text += `   Себестоимость 1 м²: ${impact.costPerM2Rub.toFixed(2)} ₽/м² (с НДС)\n`;
      text += `   Себестоимость партии под ключ: ${Math.round(impact.totalCostRub).toLocaleString('ru-RU')} ₽\n`;
    }
    if (q.comments) text += `   Примечание: ${q.comments}\n`;
    text += `\n`;
  });

  return text;
}
