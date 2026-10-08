import React from 'react';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Percent,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { CalculationResult, CurrencyRates } from '../types';
import { formatMoney, formatNumber } from '../utils/calculator';
import { formatYMDToRu } from '../utils/cbrService';
import { CostStructurePieWidget } from './CostStructurePieWidget';

interface CalculationSummaryProps {
  result: CalculationResult;
  isSpecMode: boolean;
  vatRatePercent: number;
  rates?: CurrencyRates;
  hsCode?: string;
  dutyRatePercent?: number;
  onOpenTnvedModal?: () => void;
}

export const CalculationSummary: React.FC<CalculationSummaryProps> = ({
  result,
  isSpecMode,
  vatRatePercent,
  rates,
  hsCode,
  dutyRatePercent,
  onOpenTnvedModal,
}) => {
  const hasSavings = result.savingsTotalRub !== undefined && result.savingsTotalRub > 0;

  return (
    <div className="space-y-6">
      {/* Top Highlight KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Grand Total */}
        <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm border border-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/10 rounded-full blur-xl" />
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-400">
              ИТОГО ПОД КЛЮЧ
            </span>
            <div className="text-2xl font-extrabold font-mono text-white mt-1">
              {formatMoney(result.grandTotalRub, 'RUB', 0)}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              ≈ {formatMoney(result.grandTotalUsd, 'USD', 2)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
            <span>Включает все налоги и доставку</span>
            <span className="text-emerald-400 font-semibold">100% себестоимость</span>
          </div>
        </div>

        {/* Card 2: Cost per Unit (Roll / Box / Bar) */}
        <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Себестоимость за 1 ед.
              </span>
              <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                с НДС {vatRatePercent}%
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {formatMoney(result.costPerPieceRubWithVat, 'RUB', 2)}
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              Без НДС: {formatMoney(result.costPerPieceRubNoVat, 'RUB', 2)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>В партии:</span>
            <span className="font-semibold text-slate-800">{result.totalQuantity.toLocaleString('ru-RU')} шт.</span>
          </div>
        </div>

        {/* Card 3: Cost per kg */}
        <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Себестоимость за 1 кг
              </span>
              <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                с НДС {vatRatePercent}%
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {formatMoney(result.costPerKgRubWithVat, 'RUB', 2)}
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              Без НДС: {formatMoney(result.costPerKgRubNoVat, 'RUB', 2)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Вес нетто/брутто:</span>
            <span className="font-semibold text-slate-800">
              {result.totalNetWeightKg.toLocaleString('ru-RU')} кг
            </span>
          </div>
        </div>

        {/* Card 4: Cost per m2 (if batch) or Customs Total (if spec) */}
        {!isSpecMode ? (
          <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                  Себестоимость за 1 м²
                </span>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                  с НДС {vatRatePercent}%
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-800 mt-1">
                {formatMoney(result.costPerM2RubWithVat, 'RUB', 2)}
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                Без НДС: {formatMoney(result.costPerM2RubNoVat, 'RUB', 2)}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
              <span>Общая площадь:</span>
              <span className="font-semibold text-slate-800 font-mono">
                {result.totalAreaM2.toLocaleString('ru-RU')} м²
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Таможенные платежи
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {formatMoney(result.totalCustomsPaymentsRub, 'RUB', 0)}
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                Пошлина + Сбор + НДС
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
              <span>Сбор 2026:</span>
              <span className="font-semibold text-slate-800">{formatMoney(result.customsFeeRub, 'RUB', 0)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Benchmark Comparison Alert (if competitor price is provided, like Тонлос 683.70 or other suppliers) */}
      {!isSpecMode && result.competitorPricePerM2Rub && result.competitorPricePerM2Rub > 0 && (
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
            hasSavings
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/80 border-amber-200 text-amber-950'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                  hasSavings ? 'bg-emerald-200/70 text-emerald-800' : 'bg-amber-200/70 text-amber-800'
                }`}
              >
                {hasSavings ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold">
                    {hasSavings ? 'Экономия при прямом импорте из Китая' : 'Превышение цены закупки'}
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-600 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                    Поставщик: <strong>{result.activeCompetitorName || 'Тонлос (РФ склад)'}</strong>
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                      hasSavings
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    {result.differencePercent && result.differencePercent < 0
                      ? `${result.differencePercent.toFixed(2)}%`
                      : `+${result.differencePercent?.toFixed(2)}%`}
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-1">
                  Себестоимость JINPENG: <span className="font-bold">{formatMoney(result.costPerM2RubWithVat, 'RUB', 2)}/м²</span> против закупочной в РФ:{' '}
                  <span className="font-bold">{formatMoney(result.competitorPricePerM2Rub, 'RUB', 2)}/м²</span>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-200/60">
              <div className="text-right">
                <span className="text-[11px] text-slate-600 block">Разница на 1 м²:</span>
                <span
                  className={`font-mono font-bold text-base ${
                    hasSavings ? 'text-emerald-700' : 'text-amber-800'
                  }`}
                >
                  {hasSavings ? '-' : '+'}
                  {formatMoney(Math.abs(result.savingsPerM2Rub || 0), 'RUB', 2)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-600 block">Экономия на партии:</span>
                <span
                  className={`font-mono font-bold text-lg ${
                    hasSavings ? 'text-emerald-800' : 'text-amber-900'
                  }`}
                >
                  {hasSavings ? '-' : '+'}
                  {formatMoney(Math.abs(result.savingsTotalRub || 0), 'RUB', 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Multi-supplier mini-badges if multiple suppliers configured */}
          {result.allCompetitorsComparison && result.allCompetitorsComparison.length > 1 && (
            <div className="pt-2.5 border-t border-emerald-200/60 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">
                Все поставщики в базе:
              </span>
              {result.allCompetitorsComparison.map((c) => (
                <span
                  key={c.id}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono ${
                    c.hasSavings
                      ? 'bg-emerald-100/90 text-emerald-900 border border-emerald-300'
                      : 'bg-amber-100/90 text-amber-900 border border-amber-300'
                  }`}
                >
                  <span className="font-semibold">{c.name}:</span>
                  <span>{formatMoney(c.normalizedPricePerM2Rub, 'RUB', 1)}/м²</span>
                  <strong className={c.hasSavings ? 'text-emerald-700' : 'text-amber-700'}>
                    ({c.hasSavings ? '-' : '+'}
                    {Math.abs(c.differencePercent).toFixed(1)}%)
                  </strong>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cost Structure Pie / Donut Widget */}
      <CostStructurePieWidget
        result={result}
        vatRatePercent={vatRatePercent}
        rates={rates}
        isSpecMode={isSpecMode}
      />

      {/* Comprehensive Detailed Breakdown Table (Matching CSV Structure) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Детализация расчета себестоимости партии
          </h3>
          <span className="text-xs text-slate-500">
            Официальные методики ФТС РФ
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs text-slate-700">
          {/* Row 1: Invoice */}
          <div className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50/70">
            <div>
              <span className="font-semibold text-slate-900">1. Фактурная стоимость товара (Инвойс)</span>
              <p className="text-[11px] text-slate-500">
                {result.invoiceCurrency === 'CNY'
                  ? `${result.invoiceTotalCurrency.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ¥ ${
                      rates ? `по курсу ${rates.cnyRub} ₽` : ''
                    } ${
                      rates?.rateDate
                        ? `(${rates.isCbrOfficial ? 'ЦБ РФ на ' : ''}${formatYMDToRu(rates.rateDate)})`
                        : ''
                    }`
                  : `$${result.invoiceTotalCurrency.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ${
                      rates ? `по курсу ${rates.usdRub} ₽` : ''
                    } ${
                      rates?.rateDate
                        ? `(${rates.isCbrOfficial ? 'ЦБ РФ на ' : ''}${formatYMDToRu(rates.rateDate)})`
                        : ''
                    }`}
              </p>
            </div>
            <div className="text-right font-mono font-semibold text-slate-900">
              {formatMoney(result.invoiceTotalRub, 'RUB', 2)}
            </div>
          </div>

          {/* Row 2: Freight */}
          <div className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50/70">
            <div>
              <span className="font-semibold text-slate-900">2. Международный фрахт (FOB Китай - граница РФ)</span>
              <p className="text-[11px] text-slate-500">Морская/ЖД доставка до порта или погранперехода</p>
            </div>
            <div className="text-right font-mono font-semibold text-slate-900">
              {formatMoney(result.freightRub, 'RUB', 2)}
            </div>
          </div>

          {/* Row 3: Insurance */}
          {result.insuranceRub > 0 && (
            <div className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50/70">
              <div>
                <span className="font-semibold text-slate-900">3. Страхование груза</span>
                <p className="text-[11px] text-slate-500">Включается в таможенную стоимость</p>
              </div>
              <div className="text-right font-mono font-semibold text-slate-900">
                {formatMoney(result.insuranceRub, 'RUB', 2)}
              </div>
            </div>
          )}

          {/* Row 4: Customs Value Highlight */}
          <div className="px-5 py-2.5 flex items-center justify-between bg-blue-50/50 font-bold text-blue-950">
            <div>
              <span>4. Таможенная стоимость (База начисления)</span>
              <p className="text-[11px] font-normal text-blue-800">
                Фактурная стоимость + Фрахт + Страховка (≈ {formatMoney(result.customsValueUsd, 'USD', 2)})
              </p>
            </div>
            <div className="text-right font-mono text-sm">
              {formatMoney(result.customsValueRub, 'RUB', 2)}
            </div>
          </div>

          {/* Row 5: Customs Duty */}
          <div className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50/70">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">5. Таможенная пошлина</span>
                {dutyRatePercent !== undefined && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {dutyRatePercent}%
                  </span>
                )}
                {hsCode && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono text-slate-600 bg-slate-100">
                    ТН ВЭД {hsCode}
                  </span>
                )}
                {onOpenTnvedModal && (
                  <button
                    type="button"
                    onClick={onOpenTnvedModal}
                    className="text-[10px] text-blue-600 hover:text-blue-800 underline font-medium"
                    title="Проверить ставку и код в базе ТН ВЭД по API"
                  >
                    API базы ТН ВЭД
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Начисляется от таможенной стоимости ({formatMoney(result.customsValueRub, 'RUB', 0)})
              </p>
            </div>
            <div className="text-right font-mono font-semibold text-slate-900">
              {formatMoney(result.customsDutyRub, 'RUB', 2)}
            </div>
          </div>

          {/* Row 6: Customs Fee */}
          <div className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50/70">
            <div>
              <span className="font-semibold text-slate-900">6. Таможенный сбор (с 01.01.2026)</span>
              <p className="text-[11px] text-slate-500">Фиксированная ставка: {result.customsFeeTierLabel}</p>
            </div>
            <div className="text-right font-mono font-semibold text-slate-900">
              {formatMoney(result.customsFeeRub, 'RUB', 2)}
            </div>
          </div>

          {/* Row 7: Customs VAT */}
          <div className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50/70">
            <div>
              <span className="font-semibold text-slate-900">7. НДС на таможне ({vatRatePercent}%)</span>
              <p className="text-[11px] text-slate-500">(Таможенная стоимость + Пошлина) × {vatRatePercent}%</p>
            </div>
            <div className="text-right font-mono font-semibold text-slate-900">
              {formatMoney(result.customsVatRub, 'RUB', 2)}
            </div>
          </div>

          {/* Subtotal Customs */}
          <div className="px-5 py-2 bg-slate-50/80 flex items-center justify-between text-[11px] text-slate-600 font-semibold">
            <span>Итого таможенные платежи в бюджет (Пошлина + Сбор + НДС):</span>
            <span className="font-mono text-slate-800">
              {formatMoney(result.totalCustomsPaymentsRub, 'RUB', 2)}
            </span>
          </div>

          {/* Row 8: Inland Delivery */}
          <div className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50/70">
            <div>
              <span className="font-semibold text-slate-900">8. Доставка по РФ (авто/жд до склада назначения)</span>
              <p className="text-[11px] text-slate-500">Транспортировка от погранперехода / порта</p>
            </div>
            <div className="text-right font-mono font-semibold text-slate-900">
              {formatMoney(result.inlandDeliveryRub, 'RUB', 2)}
            </div>
          </div>

          {/* Row 9: Other Expenses */}
          <div className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50/70">
            <div>
              <span className="font-semibold text-slate-900">9. Прочие расходы</span>
              <p className="text-[11px] text-slate-500">Услуги брокера, СВХ, сертификация ТР ТС, разгрузка</p>
            </div>
            <div className="text-right font-mono font-semibold text-slate-900">
              {formatMoney(result.otherExpensesRub, 'RUB', 2)}
            </div>
          </div>

          {/* Grand Total Row */}
          <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between font-bold">
            <div>
              <span className="text-sm">ИТОГО ПОЛНАЯ СЕБЕСТОИМОСТЬ ПАРТИИ (РУБ):</span>
              <p className="text-xs text-slate-400 font-normal">
                Товар + Фрахт + Пошлина + Сбор + НДС + Доставка + Прочие
              </p>
            </div>
            <div className="text-right font-mono text-lg text-emerald-400">
              {formatMoney(result.grandTotalRub, 'RUB', 2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
