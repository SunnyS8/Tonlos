import React from 'react';
import { Plus, Trash2, ListChecks, FileText, Percent } from 'lucide-react';
import { SpecLineItem } from '../types';
import { formatMoney } from '../utils/calculator';

interface MultiItemSpecTableProps {
  items: SpecLineItem[];
  onChange: (newItems: SpecLineItem[]) => void;
}

export const MultiItemSpecTable: React.FC<MultiItemSpecTableProps> = ({ items, onChange }) => {
  const handleItemChange = (id: string, field: keyof SpecLineItem, val: number | string) => {
    const updated = items.map((it) => {
      if (it.id !== id) return it;
      const copy = { ...it, [field]: val };

      // Recalculate weights and amounts if dimensions change
      if (field === 'lengthM' || field === 'meterWeightKgM' || field === 'quantity') {
        const length = field === 'lengthM' ? Number(val) : copy.lengthM;
        const mw = field === 'meterWeightKgM' ? Number(val) : copy.meterWeightKgM;
        const qty = field === 'quantity' ? Number(val) : copy.quantity;
        copy.theoreticalWeightKg = +(length * mw * qty).toFixed(2);
        // Estimated gross weight with 6% packaging
        copy.grossWeightKg = +(copy.theoreticalWeightKg * 1.06).toFixed(2);
      }

      if (field === 'grossWeightKg' || field === 'pricePerKgUsd') {
        const gw = field === 'grossWeightKg' ? Number(val) : copy.grossWeightKg;
        const price = field === 'pricePerKgUsd' ? Number(val) : copy.pricePerKgUsd;
        copy.totalAmountUsd = +(gw * price).toFixed(2);
      }

      return copy;
    });

    onChange(updated);
  };

  const addItem = () => {
    const nextNo = items.length + 1;
    const newItem: SpecLineItem = {
      id: Date.now().toString(),
      name: `Профиль #${nextNo}`,
      lengthM: 5.85,
      meterWeightKgM: 0.35,
      quantity: 1000,
      theoreticalWeightKg: 2047.5,
      grossWeightKg: 2170.35,
      pricePerKgUsd: 3.83,
      totalAmountUsd: 8312.44,
    };
    onChange([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    onChange(items.filter((it) => it.id !== id));
  };

  const totalQty = items.reduce((acc, it) => acc + (it.quantity || 0), 0);
  const totalTheorWeight = items.reduce((acc, it) => acc + (it.theoreticalWeightKg || 0), 0);
  const totalGrossWeight = items.reduce((acc, it) => acc + (it.grossWeightKg || 0), 0);
  const totalAmountUsd = items.reduce((acc, it) => acc + (it.totalAmountUsd || 0), 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Спецификация позиций партии (Алюминиевый профиль / Комплектующие)
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Позиционный расчет с длинами, погонным весом и расчетом стоимости за кг
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick price adjustment for whole specification */}
          <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
            <span className="text-[11px] font-semibold text-slate-600 px-1 flex items-center gap-1">
              <Percent className="w-3 h-3 text-blue-600" />
              Изм. цен:
            </span>
            <button
              type="button"
              id="btn-spec-price-plus-15"
              onClick={() => {
                const updated = items.map((it) => {
                  const newPrice = +(it.pricePerKgUsd * 1.15).toFixed(2);
                  return {
                    ...it,
                    pricePerKgUsd: newPrice,
                    totalAmountUsd: +(it.grossWeightKg * newPrice).toFixed(2),
                  };
                });
                onChange(updated);
              }}
              className="px-2 py-0.5 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded border border-emerald-300 transition-colors"
              title="Добавить +15% к ценам всех позиций спецификации"
            >
              +15%
            </button>
            <button
              type="button"
              id="btn-spec-price-plus-10"
              onClick={() => {
                const updated = items.map((it) => {
                  const newPrice = +(it.pricePerKgUsd * 1.10).toFixed(2);
                  return {
                    ...it,
                    pricePerKgUsd: newPrice,
                    totalAmountUsd: +(it.grossWeightKg * newPrice).toFixed(2),
                  };
                });
                onChange(updated);
              }}
              className="px-1.5 py-0.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
              title="Добавить +10%"
            >
              +10%
            </button>
            <button
              type="button"
              id="btn-spec-price-minus-10"
              onClick={() => {
                const updated = items.map((it) => {
                  const newPrice = +(it.pricePerKgUsd * 0.90).toFixed(2);
                  return {
                    ...it,
                    pricePerKgUsd: newPrice,
                    totalAmountUsd: +(it.grossWeightKg * newPrice).toFixed(2),
                  };
                });
                onChange(updated);
              }}
              className="px-1.5 py-0.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 rounded border border-slate-200 transition-colors"
              title="Скидка -10%"
            >
              -10%
            </button>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Добавить позицию
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-y border-slate-200 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-2.5 px-2">№</th>
              <th className="py-2.5 px-2 min-w-[140px]">Наименование</th>
              <th className="py-2.5 px-2 text-right">Длина (м)</th>
              <th className="py-2.5 px-2 text-right">Вес 1 м (кг/м)</th>
              <th className="py-2.5 px-2 text-right">Кол-во (шт)</th>
              <th className="py-2.5 px-2 text-right">Теор. вес (кг)</th>
              <th className="py-2.5 px-2 text-right">Вес брутто (кг)</th>
              <th className="py-2.5 px-2 text-right">Цена ($/кг)</th>
              <th className="py-2.5 px-2 text-right">Сумма ($)</th>
              <th className="py-2.5 px-2 text-center w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((it, idx) => (
              <tr key={it.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-2 px-2 font-mono text-slate-400">{idx + 1}</td>
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={it.name}
                    onChange={(e) => handleItemChange(it.id, 'name', e.target.value)}
                    className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none font-medium text-slate-800 text-xs py-0.5"
                  />
                </td>
                <td className="py-2 px-2 text-right">
                  <input
                    type="number"
                    step="0.01"
                    value={it.lengthM}
                    onChange={(e) => handleItemChange(it.id, 'lengthM', parseFloat(e.target.value) || 0)}
                    className="w-14 text-right bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none font-mono text-slate-800 text-xs py-0.5"
                  />
                </td>
                <td className="py-2 px-2 text-right">
                  <input
                    type="number"
                    step="0.001"
                    value={it.meterWeightKgM}
                    onChange={(e) =>
                      handleItemChange(it.id, 'meterWeightKgM', parseFloat(e.target.value) || 0)
                    }
                    className="w-16 text-right bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none font-mono text-slate-800 text-xs py-0.5"
                  />
                </td>
                <td className="py-2 px-2 text-right">
                  <input
                    type="number"
                    step="1"
                    value={it.quantity}
                    onChange={(e) => handleItemChange(it.id, 'quantity', parseInt(e.target.value) || 0)}
                    className="w-18 text-right bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none font-mono font-semibold text-slate-800 text-xs py-0.5"
                  />
                </td>
                <td className="py-2 px-2 text-right font-mono text-slate-600">
                  {it.theoreticalWeightKg.toLocaleString('ru-RU')}
                </td>
                <td className="py-2 px-2 text-right">
                  <input
                    type="number"
                    step="0.01"
                    value={it.grossWeightKg}
                    onChange={(e) =>
                      handleItemChange(it.id, 'grossWeightKg', parseFloat(e.target.value) || 0)
                    }
                    className="w-20 text-right bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none font-mono text-slate-800 text-xs py-0.5"
                  />
                </td>
                <td className="py-2 px-2 text-right">
                  <input
                    type="number"
                    step="0.01"
                    value={it.pricePerKgUsd}
                    onChange={(e) =>
                      handleItemChange(it.id, 'pricePerKgUsd', parseFloat(e.target.value) || 0)
                    }
                    className="w-14 text-right bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none font-mono text-slate-800 text-xs py-0.5"
                  />
                </td>
                <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">
                  ${it.totalAmountUsd.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-2 text-center">
                  <button
                    type="button"
                    onClick={() => removeItem(it.id)}
                    className="p-1 text-slate-300 hover:text-red-600 rounded transition-colors"
                    title="Удалить позицию"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300 text-slate-900">
            <tr>
              <td colSpan={4} className="py-2.5 px-2 text-right uppercase text-[11px] text-slate-600">
                Итого спецификация:
              </td>
              <td className="py-2.5 px-2 text-right font-mono text-blue-600">
                {totalQty.toLocaleString('ru-RU')} шт.
              </td>
              <td className="py-2.5 px-2 text-right font-mono">
                {totalTheorWeight.toLocaleString('ru-RU')} кг
              </td>
              <td className="py-2.5 px-2 text-right font-mono">
                {totalGrossWeight.toLocaleString('ru-RU')} кг
              </td>
              <td className="py-2.5 px-2 text-right text-slate-400">—</td>
              <td className="py-2.5 px-2 text-right font-mono text-emerald-700 text-sm">
                ${totalAmountUsd.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
