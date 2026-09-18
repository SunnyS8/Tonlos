import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Info,
  Check,
  AlertCircle,
  Clock,
  ArrowRightLeft,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { CurrencyRates, CalculationResult } from '../types';
import {
  fetchCbrRatesForDate,
  formatDateToYMD,
  formatYMDToRu,
  CbrRateResult,
} from '../utils/cbrService';
import { formatMoney } from '../utils/calculator';

interface CurrencyRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRates: CurrencyRates;
  onApplyRates: (newRates: CurrencyRates) => void;
  currentCalculationResult?: CalculationResult;
  invoiceCurrency?: 'CNY' | 'USD';
  invoiceTotalCurrency?: number;
}

export const CurrencyRateModal: React.FC<CurrencyRateModalProps> = ({
  isOpen,
  onClose,
  currentRates,
  onApplyRates,
  currentCalculationResult,
  invoiceCurrency = 'CNY',
  invoiceTotalCurrency = 87500,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    currentRates.rateDate || formatDateToYMD(new Date())
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cbrData, setCbrData] = useState<CbrRateResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Predefined quick dates for Russian foreign trade / documents
  const todayYmd = formatDateToYMD(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayYmd = formatDateToYMD(yesterday);

  const quickDates = [
    { label: 'Сегодня', date: todayYmd },
    { label: 'Вчера', date: yesterdayYmd },
    { label: 'Инвойс Jinpeng (26.01.2026)', date: '2026-01-26' },
    { label: 'Оффер Jinpeng (30.03.2026)', date: '2026-03-30' },
  ];

  // Load rate for selected date
  const loadRates = async (dateToFetch: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessNotice(null);

    try {
      const res = await fetchCbrRatesForDate(dateToFetch);
      setCbrData(res);
      setSuccessNotice(
        `Курс ЦБ РФ успешно загружен на дату ${formatYMDToRu(dateToFetch)}`
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Ошибка загрузки курсов валют');
      setCbrData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // On initial open, fetch if not already loaded
  useEffect(() => {
    if (isOpen) {
      const initialDate = currentRates.rateDate || todayYmd;
      setSelectedDate(initialDate);
      loadRates(initialDate);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleQuickDateClick = (date: string) => {
    setSelectedDate(date);
    loadRates(date);
  };

  const handleApply = () => {
    if (!cbrData) return;

    onApplyRates({
      usdRub: cbrData.usdRub,
      cnyRub: cbrData.cnyRub,
      eurRub: cbrData.eurRub,
      rateDate: cbrData.requestedDate,
      effectiveDate: cbrData.effectiveDate,
      isCbrOfficial: true,
      usdDelta: cbrData.usdDelta,
      cnyDelta: cbrData.cnyDelta,
      isWeekendShifted: cbrData.isWeekendShifted,
      lastUpdated: new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });

    onClose();
  };

  // Calculate currency difference simulation if calculation result exists
  const candidateCny = cbrData ? cbrData.cnyRub : currentRates.cnyRub;
  const candidateUsd = cbrData ? cbrData.usdRub : currentRates.usdRub;

  // Compare invoice in rubles
  const currentInvoiceRub =
    invoiceCurrency === 'CNY'
      ? invoiceTotalCurrency * currentRates.cnyRub
      : invoiceTotalCurrency * currentRates.usdRub;

  const simulatedInvoiceRub =
    invoiceCurrency === 'CNY'
      ? invoiceTotalCurrency * candidateCny
      : invoiceTotalCurrency * candidateUsd;

  const invoiceRubDiff = simulatedInvoiceRub - currentInvoiceRub;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Курсы валют ЦБ РФ на дату
                <span className="text-[10px] font-semibold bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/30">
                  cbr.ru
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Официальные котировки Банка России для таможенного декларирования и расчета ВЭД
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Date Picker & Quick Actions */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <label className="text-xs font-semibold text-slate-700 block">
              Выберите дату для запроса курса ЦБ РФ:
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  max="2030-12-31"
                  min="2020-01-01"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium text-sm focus:outline-blue-500 focus:border-blue-500 shadow-2xs"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <button
                type="button"
                onClick={() => loadRates(selectedDate)}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shrink-0 shadow-xs"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Загрузка...' : 'Получить курс ЦБ'}
              </button>
            </div>

            {/* Quick date chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500 mr-1">Быстрый выбор:</span>
              {quickDates.map((item) => (
                <button
                  key={item.date}
                  type="button"
                  onClick={() => handleQuickDateClick(item.date)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors border ${
                    selectedDate === item.date
                      ? 'bg-blue-100 border-blue-300 text-blue-800 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Не удалось получить котировки</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* CBR Result Display */}
          {cbrData && (
            <div className="space-y-4">
              {/* Weekend / Holiday Shift notice (EAEU Customs Code Art. 38) */}
              {cbrData.isWeekendShifted && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Выходной или нерабочий день:</span> дата{' '}
                    {formatYMDToRu(cbrData.requestedDate)} не являлась днем публикации Банка России.
                    В соответствии со <strong>ст. 38 ТК ЕАЭС</strong> для таможенного декларирования
                    применяется курс, действовавший на предшествующий рабочий день (
                    <strong>{formatYMDToRu(cbrData.effectiveDate)}</strong>).
                  </div>
                </div>
              )}

              {/* Currency Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* CNY Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Китайский юань (CNY / RMB)
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded">
                      1 ¥
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900 font-mono">
                      {cbrData.cnyRub.toFixed(4)}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">₽</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                    <span className="text-slate-500">Изменение к пред. дню:</span>
                    <span
                      className={`font-mono font-medium flex items-center gap-1 ${
                        cbrData.cnyDelta >= 0 ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {cbrData.cnyDelta >= 0 ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      {cbrData.cnyDelta >= 0 ? '+' : ''}
                      {cbrData.cnyDelta.toFixed(4)} ₽
                    </span>
                  </div>
                </div>

                {/* USD Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Доллар США (USD)
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                      1 $
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900 font-mono">
                      {cbrData.usdRub.toFixed(4)}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">₽</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                    <span className="text-slate-500">Изменение к пред. дню:</span>
                    <span
                      className={`font-mono font-medium flex items-center gap-1 ${
                        cbrData.usdDelta >= 0 ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {cbrData.usdDelta >= 0 ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      {cbrData.usdDelta >= 0 ? '+' : ''}
                      {cbrData.usdDelta.toFixed(4)} ₽
                    </span>
                  </div>
                </div>
              </div>

              {/* Cross Rate & Additional Currencies */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Кросс-курс USD/CNY:</span>
                  <span className="font-mono font-bold text-slate-900">
                    1 USD ≈ {(cbrData.usdRub / cbrData.cnyRub).toFixed(4)} ¥
                  </span>
                </div>
                {cbrData.eurRub > 0 && (
                  <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                    <span className="text-slate-500">Евро (EUR):</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {cbrData.eurRub.toFixed(4)} ₽
                    </span>
                  </div>
                )}
                <div className="text-[11px] text-slate-400">
                  Источник: ЦБ РФ • Дата фиксации: {formatYMDToRu(cbrData.effectiveDate)}
                </div>
              </div>

              {/* Financial Impact Comparison */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Влияние на расчет стоимости партии ({invoiceTotalCurrency.toLocaleString('ru-RU')} {invoiceCurrency})
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Текущий курс: {invoiceCurrency === 'CNY' ? currentRates.cnyRub : currentRates.usdRub} ₽
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Стоимость товара по курсу даты:</span>
                    <span className="text-sm font-bold font-mono text-slate-900">
                      {formatMoney(simulatedInvoiceRub)} ₽
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Разница к текущему расчету:</span>
                    <span
                      className={`text-sm font-bold font-mono ${
                        invoiceRubDiff > 0
                          ? 'text-red-600'
                          : invoiceRubDiff < 0
                          ? 'text-emerald-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {invoiceRubDiff > 0 ? '+' : ''}
                      {formatMoney(invoiceRubDiff)} ₽
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Legal Guide regarding CBR Rates in Customs */}
          <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              Правило определения курса валюты при таможенном оформлении:
            </div>
            <p>
              В соответствии с пунктом 8 статьи 38 ТК ЕАЭС при расчете таможенных пошлин и налогов
              применяются курсы валют, действующие <strong>на день регистрации таможенной декларации</strong> таможенным органом.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!cbrData || isLoading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-2 shadow-xs"
          >
            <Check className="w-4 h-4" />
            Применить курс к расчету
          </button>
        </div>
      </div>
    </div>
  );
};
