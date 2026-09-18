import React, { useState } from 'react';
import {
  Coins,
  Percent,
  ArrowRightLeft,
  Calendar,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  ExternalLink,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { CurrencyRates } from '../types';
import {
  fetchCbrRatesForDate,
  formatDateToYMD,
  formatYMDToRu,
} from '../utils/cbrService';

interface CurrencyBarProps {
  rates: CurrencyRates;
  onRatesChange: (newRates: CurrencyRates) => void;
  vatRatePercent: number;
  onVatChange: (vat: number) => void;
  onOpenRateModal?: () => void;
}

export const CurrencyBar: React.FC<CurrencyBarProps> = ({
  rates,
  onRatesChange,
  vatRatePercent,
  onVatChange,
  onOpenRateModal,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    rates.rateDate || formatDateToYMD(new Date())
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const usdCnyCross = rates.cnyRub > 0 ? (rates.usdRub / rates.cnyRub).toFixed(2) : '0.00';

  // Quick fetch CBR rates for the selected date
  const handleFetchCbr = async (dateStr?: string) => {
    const targetDate = dateStr || selectedDate;
    setIsLoading(true);
    setFetchError(null);

    try {
      const res = await fetchCbrRatesForDate(targetDate);
      onRatesChange({
        usdRub: res.usdRub,
        cnyRub: res.cnyRub,
        eurRub: res.eurRub,
        rateDate: res.requestedDate,
        effectiveDate: res.effectiveDate,
        isCbrOfficial: true,
        usdDelta: res.usdDelta,
        cnyDelta: res.cnyDelta,
        isWeekendShifted: res.isWeekendShifted,
        lastUpdated: new Date().toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
      setSelectedDate(res.requestedDate);
    } catch (err: any) {
      setFetchError(err.message || 'Ошибка загрузки курсов');
      // If error occurs, open modal for more helpful debugging
      if (onOpenRateModal) {
        onOpenRateModal();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTodayClick = () => {
    const today = formatDateToYMD(new Date());
    setSelectedDate(today);
    handleFetchCbr(today);
  };

  return (
    <div className="bg-white border-b border-slate-200 py-2.5 px-4 sm:px-6 lg:px-8 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        {/* Left: CBR Date Selection & Status */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Section Label */}
          <div className="flex items-center gap-1.5 font-bold text-slate-800 shrink-0">
            <Coins className="w-4 h-4 text-amber-500" />
            <span>Курс валют ЦБ РФ:</span>
          </div>

          {/* Date Picker & Quick Fetch */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1 shadow-2xs">
            <div className="flex items-center gap-1 px-1.5 text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <input
                id="input-currency-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max="2030-12-31"
                min="2020-01-01"
                title="Выберите дату для применения официального курса ЦБ РФ"
                className="bg-transparent font-medium text-slate-800 text-xs focus:outline-hidden py-0.5 cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={() => handleFetchCbr(selectedDate)}
              disabled={isLoading}
              title="Запросить курс ЦБ РФ на выбранную дату"
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded text-[11px] transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Загрузка...' : 'Обновить на дату'}</span>
            </button>

            <button
              type="button"
              onClick={handleTodayClick}
              disabled={isLoading}
              className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded text-[11px] font-medium transition-colors"
              title="Установить курс на сегодняшний день"
            >
              Сегодня
            </button>
          </div>

          {/* Official Status Badge */}
          {rates.isCbrOfficial && rates.rateDate ? (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-md text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold">
                Курс ЦБ РФ на {formatYMDToRu(rates.rateDate)}
              </span>
              {rates.isWeekendShifted && rates.effectiveDate && (
                <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded" title="Выходной день, применен предшествующий рабочий курс по ст. 38 ТК ЕАЭС">
                  (за {formatYMDToRu(rates.effectiveDate)})
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
              <Clock className="w-3 h-3" />
              <span>Расчетный / ручной курс</span>
            </div>
          )}

          {/* Open full modal button */}
          {onOpenRateModal && (
            <button
              type="button"
              onClick={onOpenRateModal}
              className="text-blue-600 hover:text-blue-800 hover:underline text-xs font-medium flex items-center gap-1 ml-1"
            >
              <span>Анализ влияния курса</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}

          {fetchError && (
            <span className="text-red-600 text-xs flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {fetchError}
            </span>
          )}
        </div>

        {/* Right: Currency Rates Inputs & VAT Switcher */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* CNY/RUB */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 shadow-2xs">
            <span className="font-bold text-slate-700">CNY (RMB):</span>
            <input
              id="input-rate-cny"
              type="number"
              step="0.0001"
              min="0.1"
              value={rates.cnyRub}
              onChange={(e) =>
                onRatesChange({
                  ...rates,
                  cnyRub: parseFloat(e.target.value) || 0,
                  isCbrOfficial: false,
                })
              }
              className="w-20 text-right font-mono font-bold text-slate-900 bg-transparent focus:outline-blue-500 rounded px-1"
            />
            <span className="text-slate-400">₽</span>
            {rates.cnyDelta !== undefined && rates.isCbrOfficial && (
              <span
                className={`text-[10px] font-mono flex items-center ${
                  rates.cnyDelta >= 0 ? 'text-emerald-700' : 'text-red-600'
                }`}
                title="Изменение к предыдущему дню"
              >
                {rates.cnyDelta >= 0 ? '+' : ''}
                {rates.cnyDelta.toFixed(2)}
              </span>
            )}
          </div>

          {/* USD/RUB */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 shadow-2xs">
            <span className="font-bold text-slate-700">USD:</span>
            <input
              id="input-rate-usd"
              type="number"
              step="0.01"
              min="1"
              value={rates.usdRub}
              onChange={(e) =>
                onRatesChange({
                  ...rates,
                  usdRub: parseFloat(e.target.value) || 0,
                  isCbrOfficial: false,
                })
              }
              className="w-18 text-right font-mono font-bold text-slate-900 bg-transparent focus:outline-blue-500 rounded px-1"
            />
            <span className="text-slate-400">₽</span>
            {rates.usdDelta !== undefined && rates.isCbrOfficial && (
              <span
                className={`text-[10px] font-mono flex items-center ${
                  rates.usdDelta >= 0 ? 'text-emerald-700' : 'text-red-600'
                }`}
                title="Изменение к предыдущему дню"
              >
                {rates.usdDelta >= 0 ? '+' : ''}
                {rates.usdDelta.toFixed(2)}
              </span>
            )}
          </div>

          {/* Cross rate USD/CNY indicator */}
          <div className="hidden sm:flex items-center gap-1 text-slate-500 bg-slate-100/80 px-2 py-1 rounded text-[11px]">
            <ArrowRightLeft className="w-3 h-3 text-slate-400" />
            <span>1 USD ≈ {usdCnyCross} ¥</span>
          </div>

          {/* VAT Setting (22% актуальная ставка) */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <Percent className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-semibold text-slate-700">НДС:</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 shadow-2xs">
              <input
                id="input-vat-rate"
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={vatRatePercent}
                onChange={(e) => onVatChange(parseFloat(e.target.value) || 0)}
                className="w-10 text-right font-mono font-bold text-slate-900 bg-transparent focus:outline-blue-500 rounded text-xs"
                title="Ставка НДС (актуальная ставка 22%)"
              />
              <span className="text-xs font-bold text-slate-500">%</span>
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.2 rounded">
                актуально
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
