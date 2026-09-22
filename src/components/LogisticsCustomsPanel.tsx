import React from 'react';
import {
  Truck,
  ShieldCheck,
  FileCheck,
  Percent,
  Anchor,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { LogisticsCustomsSettings } from '../types';
import { COMMON_HS_CODES } from '../data/customsTariffs';

interface LogisticsCustomsPanelProps {
  logistics: LogisticsCustomsSettings;
  onChange: (updated: LogisticsCustomsSettings) => void;
  customsValueRub: number;
  calculatedFee: number;
  feeTierLabel: string;
  onOpenTariffModal: () => void;
  activeHsCode?: string;
  onHsCodeChange?: (code: string, duty: number) => void;
  onOpenLogisticsComparison?: () => void;
  activeQuoteName?: string;
}

export const LogisticsCustomsPanel: React.FC<LogisticsCustomsPanelProps> = ({
  logistics,
  onChange,
  customsValueRub,
  calculatedFee,
  feeTierLabel,
  onOpenTariffModal,
  activeHsCode,
  onHsCodeChange,
  onOpenLogisticsComparison,
  activeQuoteName,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Anchor className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Логистика, таможенные платежи и сборы
            </h2>
            {activeQuoteName && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                <Truck className="w-3 h-3" />
                {activeQuoteName}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            База начисления таможенной стоимости = фактурная стоимость товара + фрахт
          </p>
        </div>

        {onOpenLogisticsComparison && (
          <button
            type="button"
            onClick={onOpenLogisticsComparison}
            className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition flex items-center gap-1.5 shadow-2xs self-start sm:self-center"
          >
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span>Сравнить ставки экспедиторов</span>
            <ExternalLink className="w-3 h-3 text-blue-500" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. International Freight */}
        <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="input-freight-amount" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Anchor className="w-3.5 h-3.5 text-blue-500" />
              Международный фрахт:
            </label>
            <div className="flex gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => onChange({ ...logistics, freightCurrency: 'USD' })}
                className={`px-1.5 py-0.5 rounded font-bold ${
                  logistics.freightCurrency === 'USD'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                $ USD
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...logistics, freightCurrency: 'RUB' })}
                className={`px-1.5 py-0.5 rounded font-bold ${
                  logistics.freightCurrency === 'RUB'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                ₽ RUB
              </button>
            </div>
          </div>
          <input
            id="input-freight-amount"
            type="number"
            min="0"
            step="100"
            value={logistics.freightAmount}
            onChange={(e) =>
              onChange({
                ...logistics,
                freightAmount: parseFloat(e.target.value) || 0,
              })
            }
            className="w-full text-lg font-bold text-slate-900 bg-white border border-slate-300 rounded-md px-3 py-1.5 focus:outline-blue-500"
          />
          {/* Quick preset buttons */}
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="text-[10px] text-slate-400 self-center mr-1">Быстро:</span>
            <button
              type="button"
              onClick={() => onChange({ ...logistics, freightCurrency: 'USD', freightAmount: 4550, inlandDeliveryRub: 453000, otherExpensesRub: 50000 })}
              className="text-[10px] bg-white border border-slate-300 hover:border-blue-400 rounded px-1.5 py-0.5 text-slate-600"
              title="ИГЛ: Шанхай -> ВВО -> ЖД Москва -> Авто Серпухов ($4,550 + 453,000 ₽)"
            >
              ИГЛ Серпухов ($4550)
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...logistics, freightCurrency: 'USD', freightAmount: 7550, inlandDeliveryRub: 78000, otherExpensesRub: 62660 })}
              className="text-[10px] bg-white border border-slate-300 hover:border-emerald-400 rounded px-1.5 py-0.5 text-slate-600"
              title="Галеос: Deep Sea Новороссийск -> Авто Ставрополь ($7,550 + 140,660 ₽)"
            >
              Галеос Ставрополь ($7550)
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...logistics, freightCurrency: 'USD', freightAmount: 11250, inlandDeliveryRub: 78000, otherExpensesRub: 53000 })}
              className="text-[10px] bg-white border border-slate-300 hover:border-amber-400 rounded px-1.5 py-0.5 text-slate-600"
              title="Галеос: Прямой поезд -> Ворсино -> Серпухов ($11,250 + 131,000 ₽)"
            >
              Прямое ЖД ($11250)
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...logistics, freightCurrency: 'USD', freightAmount: 4700, inlandDeliveryRub: 492500, otherExpensesRub: 58000 })}
              className="text-[10px] bg-white border border-slate-300 hover:border-indigo-400 rounded px-1.5 py-0.5 text-slate-600"
              title="Дельпорте: ВВО -> Тимашевск -> Ставрополь ($4,700 + 550,500 ₽)"
            >
              Дельпорте Ставр. ($4700)
            </button>
          </div>
        </div>

        {/* 2. Customs Duty Rate (%) */}
        <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="input-duty-rate" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-indigo-500" />
              Ставка пошлины (ТН ВЭД):
            </label>
            <span className="text-xs font-bold text-indigo-700 font-mono">%</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="input-duty-rate"
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={logistics.dutyRatePercent}
              onChange={(e) =>
                onChange({
                  ...logistics,
                  dutyRatePercent: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full text-lg font-bold text-slate-900 bg-white border border-slate-300 rounded-md px-3 py-1.5 focus:outline-blue-500"
            />
          </div>

          {/* HS Codes quick selector */}
          <div className="mt-2">
            <select
              id="select-hs-code"
              value={activeHsCode || ''}
              onChange={(e) => {
                const found = COMMON_HS_CODES.find((c) => c.code === e.target.value);
                if (found) {
                  onChange({ ...logistics, dutyRatePercent: found.duty });
                  if (onHsCodeChange) onHsCodeChange(found.code, found.duty);
                }
              }}
              className="w-full text-[11px] bg-white border border-slate-300 text-slate-700 rounded px-2 py-1 truncate focus:outline-blue-500"
            >
              <option value="">Выбрать код ТН ВЭД из документов...</option>
              {COMMON_HS_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.duty}%) — {c.name.substring(0, 32)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Customs Clearance Fee (2026 Tariff) */}
        <div className="bg-emerald-50/50 p-3.5 rounded-lg border border-emerald-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-800">
                Таможенный сбор (2026):
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenTariffModal}
              className="text-[11px] text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 underline font-medium"
            >
              Сетка ставок
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="text-lg font-bold text-emerald-900 font-mono py-1.5">
            {calculatedFee.toLocaleString('ru-RU')} ₽
          </div>
          <div className="text-[11px] text-emerald-800 bg-emerald-100/70 px-2 py-1 rounded">
            Интервал: <span className="font-semibold">{feeTierLabel}</span>
          </div>
        </div>

        {/* 4. Inland Delivery in Russia */}
        <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="input-inland-delivery" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-blue-500" />
              Доставка по РФ (авто/жд):
            </label>
            <span className="text-xs text-slate-400 font-mono">₽</span>
          </div>
          <input
            id="input-inland-delivery"
            type="number"
            min="0"
            step="1000"
            value={logistics.inlandDeliveryRub}
            onChange={(e) =>
              onChange({
                ...logistics,
                inlandDeliveryRub: parseFloat(e.target.value) || 0,
              })
            }
            className="w-full text-base font-bold text-slate-900 bg-white border border-slate-300 rounded-md px-3 py-1.5 focus:outline-blue-500"
          />
          <span className="text-[11px] text-slate-500 mt-1 block">
            Автодоставка из порта / границы до склада покупателя
          </span>
        </div>

        {/* 5. Other Expenses */}
        <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="input-other-expenses" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              Прочие расходы (брокер, СВХ):
            </label>
            <span className="text-xs text-slate-400 font-mono">₽</span>
          </div>
          <input
            id="input-other-expenses"
            type="number"
            min="0"
            step="1000"
            value={logistics.otherExpensesRub}
            onChange={(e) =>
              onChange({
                ...logistics,
                otherExpensesRub: parseFloat(e.target.value) || 0,
              })
            }
            className="w-full text-base font-bold text-slate-900 bg-white border border-slate-300 rounded-md px-3 py-1.5 focus:outline-blue-500"
          />
          <span className="text-[11px] text-slate-500 mt-1 block">
            Услуги брокера, терминал СВХ, сертификация ТР ТС
          </span>
        </div>

        {/* 6. Cargo Insurance */}
        <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="input-insurance" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Страхование груза:
            </label>
            <span className="text-xs text-slate-400 font-mono">₽</span>
          </div>
          <input
            id="input-insurance"
            type="number"
            min="0"
            step="1000"
            value={logistics.insuranceRub || 0}
            onChange={(e) =>
              onChange({
                ...logistics,
                insuranceRub: parseFloat(e.target.value) || 0,
              })
            }
            className="w-full text-base font-bold text-slate-900 bg-white border border-slate-300 rounded-md px-3 py-1.5 focus:outline-blue-500"
          />
          <span className="text-[11px] text-slate-500 mt-1 block">
            Страховка ответственности и целостности на время перевозки
          </span>
        </div>
      </div>
    </div>
  );
};
