export interface CbrRateResult {
  usdRub: number;
  cnyRub: number;
  eurRub: number;
  usdPrevious: number;
  cnyPrevious: number;
  usdDelta: number;
  cnyDelta: number;
  requestedDate: string; // YYYY-MM-DD
  effectiveDate: string; // YYYY-MM-DD
  rawTimestamp?: string;
  isWeekendShifted: boolean;
  source: string;
}

export function formatDateToYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatYMDToRu(ymd: string): string {
  if (!ymd) return '';
  const parts = ymd.split('-');
  if (parts.length !== 3) return ymd;
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

/**
 * Fetch official Central Bank of Russia (CBR / ЦБ РФ) exchange rates for a specific date.
 * If the date is a weekend or holiday, searches backwards up to 7 days for the active rate
 * according to article 38 of the EAEU Customs Code.
 */
export async function fetchCbrRatesForDate(targetDateStr: string): Promise<CbrRateResult> {
  const targetDate = new Date(targetDateStr);
  if (isNaN(targetDate.getTime())) {
    throw new Error('Некорректная дата');
  }

  const todayStr = formatDateToYMD(new Date());
  const isTodayOrFuture = targetDateStr >= todayStr;

  // If today or future, fetch today's latest publication
  if (isTodayOrFuture) {
    const res = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
    if (!res.ok) {
      throw new Error(`Ошибка загрузки данных ЦБ РФ (${res.status})`);
    }
    const data = await res.json();
    return parseCbrJson(data, targetDateStr, targetDateStr, false);
  }

  // If past date, attempt to fetch archive for date, walking backwards up to 7 days if weekend/holiday
  let currentDate = new Date(targetDate);
  let attempts = 0;
  const maxAttempts = 7;

  while (attempts < maxAttempts) {
    const ymd = formatDateToYMD(currentDate);
    const [year, month, day] = ymd.split('-');
    const archiveUrl = `https://www.cbr-xml-daily.ru/archive/${year}/${month}/${day}/daily_json.js`;

    try {
      const res = await fetch(archiveUrl);
      if (res.ok) {
        const data = await res.json();
        const isShifted = ymd !== targetDateStr;
        return parseCbrJson(data, targetDateStr, ymd, isShifted);
      }
    } catch {
      // Continue to previous day on network or 404
    }

    // Step back 1 day
    currentDate.setDate(currentDate.getDate() - 1);
    attempts++;
  }

  throw new Error(`Не удалось найти курс ЦБ РФ на дату ${formatYMDToRu(targetDateStr)} (проверено 7 дней до этой даты).`);
}

function parseCbrJson(
  data: any,
  requestedDate: string,
  effectiveDate: string,
  isWeekendShifted: boolean
): CbrRateResult {
  if (!data || !data.Valute) {
    throw new Error('Неверный формат ответа от сервера курсов валют');
  }

  const usd = data.Valute.USD;
  const cny = data.Valute.CNY;
  const eur = data.Valute.EUR;

  if (!usd || !cny) {
    throw new Error('В ответе ЦБ РФ отсутствуют котировки USD или CNY');
  }

  const usdRub = usd.Value / (usd.Nominal || 1);
  const cnyRub = cny.Value / (cny.Nominal || 1);
  const eurRub = eur ? eur.Value / (eur.Nominal || 1) : 0;

  const usdPrev = usd.Previous ? usd.Previous / (usd.Nominal || 1) : usdRub;
  const cnyPrev = cny.Previous ? cny.Previous / (cny.Nominal || 1) : cnyRub;

  // Extract actual publication date if present in data.Date
  let actualDate = effectiveDate;
  if (data.Date) {
    const parsed = new Date(data.Date);
    if (!isNaN(parsed.getTime())) {
      actualDate = formatDateToYMD(parsed);
    }
  }

  return {
    usdRub: Math.round(usdRub * 10000) / 10000,
    cnyRub: Math.round(cnyRub * 10000) / 10000,
    eurRub: Math.round(eurRub * 10000) / 10000,
    usdPrevious: Math.round(usdPrev * 10000) / 10000,
    cnyPrevious: Math.round(cnyPrev * 10000) / 10000,
    usdDelta: Math.round((usdRub - usdPrev) * 10000) / 10000,
    cnyDelta: Math.round((cnyRub - cnyPrev) * 10000) / 10000,
    requestedDate,
    effectiveDate: actualDate,
    rawTimestamp: data.Timestamp || data.Date,
    isWeekendShifted,
    source: 'Официальный курс ЦБ РФ (cbr.ru)',
  };
}
