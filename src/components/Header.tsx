import React from 'react';
import { Ship, FileSpreadsheet, RotateCcw, Printer, Calendar, Plus, Sliders } from 'lucide-react';
import { PRESETS, CalculationPreset } from '../data/presets';
import { CurrencyRates } from '../types';
import { formatYMDToRu } from '../utils/cbrService';

interface HeaderProps {
  activePresetId: string;
  onSelectPreset: (preset: CalculationPreset) => void;
  onReset: () => void;
  onOpenExportModal: () => void;
  onOpenTariffModal: () => void;
  onOpenRateModal?: () => void;
  onOpenPresetModal?: () => void;
  rates?: CurrencyRates;
  presets?: CalculationPreset[];
  activeView?: 'ved' | 'logistics' | 'matrix';
  onViewChange?: (view: 'ved' | 'logistics' | 'matrix') => void;
  quotesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activePresetId,
  onSelectPreset,
  onReset,
  onOpenExportModal,
  onOpenTariffModal,
  onOpenRateModal,
  onOpenPresetModal,
  rates,
  presets = PRESETS,
  activeView = 'ved',
  onViewChange,
  quotesCount = 9,
}) => {
  const customPresets = presets.filter((p) => p.isCustom);
  const factoryPresets = presets.filter((p) => !p.isCustom);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-100 tracking-tight">
                  Калькулятор доставки и таможни из Китая
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ФТС 2026
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ВЭД калькулятор + сравнение ставок экспедиторов (ИГЛ, Галеос, Дельпорте)
              </p>
            </div>
          </div>

          {/* Quick Preset Selector & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Presets dropdown with Manage Button */}
            <div className="relative inline-flex items-center bg-slate-800 border border-slate-700 rounded-lg p-1">
              <FileSpreadsheet className="w-4 h-4 text-blue-400 ml-2 mr-1.5" />
              <span className="text-xs text-slate-400 mr-2 hidden sm:inline">Пресет:</span>
              <select
                id="preset-selector"
                value={activePresetId}
                onChange={(e) => {
                  const found = presets.find((p) => p.id === e.target.value);
                  if (found) onSelectPreset(found);
                }}
                className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none pr-4 cursor-pointer py-1 max-w-[180px] truncate"
              >
                {customPresets.length > 0 && (
                  <optgroup label="⭐ Мои сохраненные пресеты">
                    {customPresets.map((p) => (
                      <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="📦 Системные шаблоны JINPENG">
                  {factoryPresets.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                      {p.name}
                    </option>
                  ))}
                </optgroup>
              </select>

              {onOpenPresetModal && (
                <button
                  type="button"
                  id="btn-open-preset-manager"
                  onClick={onOpenPresetModal}
                  className="ml-1 px-2 py-1 bg-blue-600/80 hover:bg-blue-600 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                  title="Создать свой пресет или управлять шаблонами"
                >
                  <Plus className="w-3 h-3" />
                  <span className="hidden sm:inline">Пресеты</span>
                </button>
              )}
            </div>

            {/* CBR Rate button */}
            {onOpenRateModal && (
              <button
                id="btn-header-rate-date"
                onClick={onOpenRateModal}
                className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                title="Узнать и обновить курс валют ЦБ РФ на любую дату"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  {rates?.rateDate
                    ? `Курс на ${formatYMDToRu(rates.rateDate)}`
                    : 'Курс на дату'}
                </span>
              </button>
            )}

            {/* Tariff scale button */}
            <button
              id="btn-tariff-scale"
              onClick={onOpenTariffModal}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
              title="Посмотреть шкалу таможенных сборов с 01.01.2026"
            >
              Сборы 2026
            </button>

            {/* Print / Export Report */}
            <button
              id="btn-export-report"
              onClick={onOpenExportModal}
              className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Экспорт / КП</span>
            </button>

            {/* Reset */}
            <button
              id="btn-reset-calculator"
              onClick={onReset}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title="Сбросить к исходным данным"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Navigation View Switcher */}
        {onViewChange && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => onViewChange('ved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeView === 'ved'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>📊 Расчет партии и себестоимости (ВЭД)</span>
            </button>

            <button
              type="button"
              onClick={() => onViewChange('logistics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeView === 'logistics'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Ship className="w-3.5 h-3.5 text-blue-400" />
              <span>Сравнение логистики и маршрутов</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500/30 text-blue-300 font-mono">
                {quotesCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onViewChange('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeView === 'matrix'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>⚡ Сравнить все варианты доставки</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
