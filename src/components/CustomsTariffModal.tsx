import React from 'react';
import { X, FileText, CheckCircle } from 'lucide-react';
import { CUSTOMS_FEES_2026 } from '../data/customsTariffs';
import { formatMoney } from '../utils/calculator';

interface CustomsTariffModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCustomsValueRub: number;
}

export const CustomsTariffModal: React.FC<CustomsTariffModalProps> = ({
  isOpen,
  onClose,
  currentCustomsValueRub,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-sm">Таможенные сборы с 01.01.2026</h3>
              <p className="text-[11px] text-slate-400">
                Ставки сборов за совершение таможенных операций (ФТС РФ)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Value Highlight */}
        <div className="p-4 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">Текущая таможенная стоимость партии:</span>
          <span className="font-mono font-bold text-blue-900 text-sm">
            {formatMoney(currentCustomsValueRub, 'RUB', 2)}
          </span>
        </div>

        {/* Table of 2026 tiers */}
        <div className="p-5 max-h-[65vh] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3 rounded-l-lg">Таможенная стоимость</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">Размер сбора с 01.01.2026</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {CUSTOMS_FEES_2026.map((tier, idx) => {
                const prevMax = idx === 0 ? 0 : CUSTOMS_FEES_2026[idx - 1].maxRub;
                const isCurrent =
                  currentCustomsValueRub > prevMax && currentCustomsValueRub <= tier.maxRub;

                return (
                  <tr
                    key={tier.label}
                    className={`transition-colors ${
                      isCurrent
                        ? 'bg-emerald-50 text-emerald-950 font-bold border-l-4 border-l-emerald-600'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <td className="py-2.5 px-3 flex items-center gap-2">
                      {isCurrent && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      <span className="font-sans">{tier.label}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold">
                      {formatMoney(tier.fee, 'RUB', 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-4 p-3 bg-slate-50 rounded-lg text-[11px] text-slate-500 space-y-1">
            <p>
              • Таможенный сбор взимается за подачу декларации на товары (ДТ).
            </p>
            <p>
              • Базой для определения ставки является <strong>таможенная стоимость</strong> (стоимость сделки + расходы на перевозку/фрахт до границы РФ).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
