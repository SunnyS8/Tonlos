import React, { useState } from 'react';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Sector,
} from 'recharts';
import {
  Package,
  Ship,
  ShieldCheck,
  Receipt,
  Info,
  DollarSign,
  Layers,
} from 'lucide-react';
import { CalculationResult, CurrencyRates } from '../types';
import { formatMoney } from '../utils/calculator';

interface CostStructurePieWidgetProps {
  result: CalculationResult;
  vatRatePercent: number;
  rates?: CurrencyRates;
  isSpecMode?: boolean;
}

interface CostItem {
  id: string;
  name: string;
  shortName: string;
  value: number;
  percentage: number;
  color: string;
  hoverColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  perUnitRub?: number;
  perM2Rub?: number;
}

export const CostStructurePieWidget: React.FC<CostStructurePieWidgetProps> = ({
  result,
  vatRatePercent,
  rates,
  isSpecMode = false,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const grandTotal = result.grandTotalRub || 1;

  // 1. Goods (Invoice)
  const goodsVal = result.invoiceTotalRub;

  // 2. Freight & Logistics (Sea freight + inland delivery + insurance + other handling)
  const freightVal =
    result.freightRub +
    result.inlandDeliveryRub +
    result.insuranceRub +
    result.otherExpensesRub;

  // 3. Customs Duties & Fees (Duty + customs clearance fee)
  const customsVal = result.customsDutyRub + result.customsFeeRub;

  // 4. VAT
  const vatVal = result.customsVatRub;

  const data: CostItem[] = [
    {
      id: 'goods',
      name: 'Стоимость товара (Инвойс)',
      shortName: 'Товар',
      value: goodsVal,
      percentage: (goodsVal / grandTotal) * 100,
      color: '#2563eb', // Blue-600
      hoverColor: '#1d4ed8',
      icon: Package,
      description: `Контрактная стоимость завода (${
        result.invoiceCurrency === 'CNY'
          ? `${result.invoiceTotalCurrency.toLocaleString('ru-RU')} ¥`
          : `$${result.invoiceTotalCurrency.toLocaleString('ru-RU')}`
      })`,
      perUnitRub:
        result.totalQuantity > 0 ? goodsVal / result.totalQuantity : undefined,
      perM2Rub:
        result.totalAreaM2 > 0 ? goodsVal / result.totalAreaM2 : undefined,
    },
    {
      id: 'freight',
      name: 'Фрахт и логистика',
      shortName: 'Фрахт и доставка',
      value: freightVal,
      percentage: (freightVal / grandTotal) * 100,
      color: '#f59e0b', // Amber-500
      hoverColor: '#d97706',
      icon: Ship,
      description: `Морской фрахт ($${result.freightUsd.toLocaleString('ru-RU')}) + доставка по РФ`,
      perUnitRub:
        result.totalQuantity > 0 ? freightVal / result.totalQuantity : undefined,
      perM2Rub:
        result.totalAreaM2 > 0 ? freightVal / result.totalAreaM2 : undefined,
    },
    {
      id: 'customs',
      name: 'Таможенные платежи (Пошлина и сбор)',
      shortName: 'Таможня и сборы',
      value: customsVal,
      percentage: (customsVal / grandTotal) * 100,
      color: '#8b5cf6', // Violet-500
      hoverColor: '#7c3aed',
      icon: ShieldCheck,
      description: `Пошлина (${formatMoney(
        result.customsDutyRub,
        'RUB',
        0
      )}) + Сбор ФТС 2026 (${formatMoney(result.customsFeeRub, 'RUB', 0)})`,
      perUnitRub:
        result.totalQuantity > 0 ? customsVal / result.totalQuantity : undefined,
      perM2Rub:
        result.totalAreaM2 > 0 ? customsVal / result.totalAreaM2 : undefined,
    },
    {
      id: 'vat',
      name: `НДС на таможне (${vatRatePercent}%)`,
      shortName: `НДС ${vatRatePercent}%`,
      value: vatVal,
      percentage: (vatVal / grandTotal) * 100,
      color: '#10b981', // Emerald-500
      hoverColor: '#059669',
      icon: Receipt,
      description: 'Уплачивается на таможне, принимается к вычету на ОСНО',
      perUnitRub:
        result.totalQuantity > 0 ? vatVal / result.totalQuantity : undefined,
      perM2Rub:
        result.totalAreaM2 > 0 ? vatVal / result.totalAreaM2 : undefined,
    },
  ];

  // Active hover slice item
  const activeItem = activeIndex !== null ? data[activeIndex] : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Структура затрат и себестоимости партии
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Круговая диаграмма
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Процентное распределение стоимости товара, фрахта, таможенных пошлин со сборами и НДС в цене под ключ
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[11px] text-slate-400 block font-medium">Общий бюджет (100%):</span>
          <span className="text-sm font-bold font-mono text-slate-900">
            {formatMoney(result.grandTotalRub, 'RUB', 0)}
          </span>
        </div>
      </div>

      {/* Main Chart + Legend Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Pie Chart Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[260px]">
          <div className="w-full h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={800}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.id}`}
                      fill={activeIndex === index ? entry.hoverColor : entry.color}
                      stroke="#ffffff"
                      strokeWidth={2}
                      className="cursor-pointer transition-all duration-200 outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as CostItem;
                      return (
                        <div className="bg-slate-900/95 backdrop-blur-xs text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700 min-w-[210px] z-50">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span>{item.name}</span>
                          </div>
                          <div className="text-slate-300 text-[11px] leading-tight">
                            {item.description}
                          </div>
                          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between font-mono">
                            <span className="text-slate-400">Сумма:</span>
                            <span className="font-bold text-white">
                              {formatMoney(item.value, 'RUB', 0)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between font-mono">
                            <span className="text-slate-400">Доля:</span>
                            <span className="font-bold text-blue-400">
                              {item.percentage.toFixed(1)}%
                            </span>
                          </div>
                          {item.perM2Rub && !isSpecMode && (
                            <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 pt-0.5">
                              <span>В 1 м²:</span>
                              <span className="text-slate-200">
                                {formatMoney(item.perM2Rub, 'RUB', 2)}/м²
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RechartsPie>
            </ResponsiveContainer>

            {/* Center Donut Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              {activeItem ? (
                <>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider line-clamp-1 max-w-[130px]">
                    {activeItem.shortName}
                  </span>
                  <span className="text-lg font-extrabold font-mono text-slate-900 leading-tight">
                    {activeItem.percentage.toFixed(1)}%
                  </span>
                  <span className="text-[11px] font-mono text-slate-600 font-semibold">
                    {formatMoney(activeItem.value, 'RUB', 0)}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    Себестоимость
                  </span>
                  <span className="text-base font-extrabold font-mono text-slate-900 leading-tight">
                    100%
                  </span>
                  <span className="text-[10px] text-slate-500">
                    4 ключевых статьи
                  </span>
                </>
              )}
            </div>
          </div>
          <span className="text-[11px] text-slate-400 text-center mt-1">
            Наведите на сектор для подробностей
          </span>
        </div>

        {/* Breakdown Legend Cards (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.map((item, index) => {
            const Icon = item.icon;
            const isHovered = activeIndex === index;

            return (
              <div
                key={item.id}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isHovered
                    ? 'border-blue-300 bg-blue-50/40 shadow-xs ring-1 ring-blue-200'
                    : 'border-slate-200/90 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-bold text-slate-800 truncate" title={item.name}>
                        {item.name}
                      </span>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-md text-xs font-bold font-mono shrink-0"
                      style={{
                        backgroundColor: `${item.color}15`,
                        color: item.color,
                      }}
                    >
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>

                  <div className="text-base font-extrabold font-mono text-slate-900">
                    {formatMoney(item.value, 'RUB', 0)}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                </div>

                {/* Unit breakdown footer */}
                <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] font-mono text-slate-600">
                  {!isSpecMode && item.perM2Rub !== undefined ? (
                    <>
                      <span className="text-slate-400">В 1 м²:</span>
                      <span className="font-semibold text-slate-800">
                        {formatMoney(item.perM2Rub, 'RUB', 2)}/м²
                      </span>
                    </>
                  ) : item.perUnitRub !== undefined ? (
                    <>
                      <span className="text-slate-400">В 1 ед.:</span>
                      <span className="font-semibold text-slate-800">
                        {formatMoney(item.perUnitRub, 'RUB', 2)}/шт
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-slate-400">От общего:</span>
                      <span className="font-semibold text-slate-800">{item.percentage.toFixed(1)}%</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
