import React, { useState } from 'react';
import {
  Package,
  Layers,
  Scale,
  Maximize2,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Building2,
  Info,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Trash2,
  Store,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { RollBatchItem, CompetitorSupplier } from '../types';

interface BatchConfiguratorProps {
  batch: RollBatchItem;
  onChange: (updated: RollBatchItem) => void;
}

export const BatchConfigurator: React.FC<BatchConfiguratorProps> = ({ batch, onChange }) => {
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierPrice, setNewSupplierPrice] = useState<number>(700);
  const [newSupplierUnit, setNewSupplierUnit] = useState<'per_m2' | 'per_piece' | 'per_kg'>('per_m2');
  const [showSuppliersTable, setShowSuppliersTable] = useState(false);

  const totalAreaM2 = batch.boxCount * batch.areaPerPieceM2;
  const pricePerM2 =
    batch.areaPerPieceM2 > 0 ? (batch.priceInCurrency / batch.areaPerPieceM2).toFixed(2) : '0';

  // Ensure competitors list exists
  const competitorsList: CompetitorSupplier[] =
    batch.competitors && batch.competitors.length > 0
      ? batch.competitors
      : [
          {
            id: 'tonlos_rf',
            name: batch.targetCompetitorName || 'Тонлос (РФ склад)',
            priceRub: batch.targetCompetitorPricePerM2Rub || 683.7,
            unit: 'per_m2',
            includesVat: true,
            note: 'Закупочная с НДС со склада в РФ',
          },
        ];

  const activeSupplierId = batch.activeCompetitorId || competitorsList[0]?.id || 'tonlos_rf';
  const activeSupplier =
    competitorsList.find((c) => c.id === activeSupplierId) || competitorsList[0];

  // Helper to normalize supplier price to per_m2
  const calcNormalizedPerM2 = (comp: CompetitorSupplier): number => {
    if (comp.unit === 'per_m2') return comp.priceRub;
    if (comp.unit === 'per_piece') {
      return batch.areaPerPieceM2 > 0 ? comp.priceRub / batch.areaPerPieceM2 : 0;
    }
    if (comp.unit === 'per_kg') {
      const weightPerM2 =
        batch.areaPerPieceM2 > 0 ? batch.netWeightPerPieceKg / batch.areaPerPieceM2 : 0;
      return comp.priceRub * weightPerM2;
    }
    return comp.priceRub;
  };

  const handleUpdateSupplierPrice = (id: string, newPrice: number) => {
    const updated = competitorsList.map((c) => (c.id === id ? { ...c, priceRub: newPrice } : c));
    const currentActive = updated.find((c) => c.id === activeSupplierId) || updated[0];
    const normPrice = calcNormalizedPerM2(currentActive);

    onChange({
      ...batch,
      competitors: updated,
      targetCompetitorName: currentActive.name,
      targetCompetitorPricePerM2Rub: normPrice,
    });
  };

  const handleUpdateSupplierUnit = (id: string, unit: 'per_m2' | 'per_piece' | 'per_kg') => {
    const updated = competitorsList.map((c) => (c.id === id ? { ...c, unit } : c));
    const currentActive = updated.find((c) => c.id === activeSupplierId) || updated[0];
    const normPrice = calcNormalizedPerM2(currentActive);

    onChange({
      ...batch,
      competitors: updated,
      targetCompetitorName: currentActive.name,
      targetCompetitorPricePerM2Rub: normPrice,
    });
  };

  const handleSelectActiveSupplier = (id: string) => {
    const chosen = competitorsList.find((c) => c.id === id) || competitorsList[0];
    const normPrice = calcNormalizedPerM2(chosen);

    onChange({
      ...batch,
      activeCompetitorId: id,
      targetCompetitorName: chosen.name,
      targetCompetitorPricePerM2Rub: normPrice,
    });
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName.trim()) return;

    const newComp: CompetitorSupplier = {
      id: `supplier_${Date.now()}`,
      name: newSupplierName.trim(),
      priceRub: Number(newSupplierPrice) || 0,
      unit: newSupplierUnit,
      includesVat: true,
      note: 'Пользовательский поставщик',
    };

    const updated = [...competitorsList, newComp];
    const normPrice = calcNormalizedPerM2(newComp);

    onChange({
      ...batch,
      competitors: updated,
      activeCompetitorId: newComp.id,
      targetCompetitorName: newComp.name,
      targetCompetitorPricePerM2Rub: normPrice,
    });

    setNewSupplierName('');
    setNewSupplierPrice(700);
    setIsAddingSupplier(false);
  };

  const handleDeleteSupplier = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (competitorsList.length <= 1) {
      alert('Нельзя удалить последнего поставщика');
      return;
    }
    const updated = competitorsList.filter((c) => c.id !== id);
    const newActive = updated[0];
    const normPrice = calcNormalizedPerM2(newActive);

    onChange({
      ...batch,
      competitors: updated,
      activeCompetitorId: newActive.id,
      targetCompetitorName: newActive.name,
      targetCompetitorPricePerM2Rub: normPrice,
    });
  };

  // Density slider handler: simulates changing density (e.g. from 830 g/m2 to 650 g/m2)
  const handleDensityChange = (newDensity: number) => {
    // Proportional weight change based on base density
    const ratio = batch.baseDensityGsm > 0 ? newDensity / batch.baseDensityGsm : 1;
    const newNetWeightPerPiece = +(batch.netWeightPerPieceKg * ratio).toFixed(3);
    const newGrossWeightPerPiece = +(batch.grossWeightPerPieceKg * ratio).toFixed(3);
    const newTotalNetWeight = Math.round(batch.boxCount * newNetWeightPerPiece);
    const newTotalGrossWeight = Math.round(batch.boxCount * newGrossWeightPerPiece);

    onChange({
      ...batch,
      densityGsm: newDensity,
      netWeightPerPieceKg: newNetWeightPerPiece,
      grossWeightPerPieceKg: newGrossWeightPerPiece,
      totalNetWeightKg: newTotalNetWeight,
      totalGrossWeightKg: newTotalGrossWeight,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-6">
      {/* Header with Supplier & Quotation Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Поставщик и документ
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-0.5">{batch.productName}</h2>
          <p className="text-xs text-slate-500">{batch.supplier} • Инвойс: {batch.invoiceNo} от {batch.date}</p>
        </div>

        {/* Container Type Badge & Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Контейнер:</span>
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
            {(['40HQ', '20GP', 'LCL'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onChange({ ...batch, containerType: type })}
                className={`px-3 py-1 font-semibold rounded-md transition-all ${
                  batch.containerType === type
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Inputs: Quantity, Dimensions, Packaging */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Quantity (Boxes / Rolls) */}
        <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="input-box-count" className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-blue-500" />
              Кол-во рулонов / мест:
            </label>
            <span className="text-xs text-slate-400 font-mono">шт</span>
          </div>
          <input
            id="input-box-count"
            type="number"
            min="1"
            step="1"
            value={batch.boxCount}
            onChange={(e) => {
              const count = parseInt(e.target.value) || 0;
              onChange({
                ...batch,
                boxCount: count,
                totalNetWeightKg: count * batch.netWeightPerPieceKg,
                totalGrossWeightKg: count * batch.grossWeightPerPieceKg,
              });
            }}
            className="w-full text-lg font-bold text-slate-900 bg-white border border-slate-300 rounded-md px-3 py-1.5 focus:outline-blue-500"
          />
          <div className="mt-1.5 text-[11px] text-slate-500 flex justify-between">
            <span>В контейнере:</span>
            <span className="font-semibold text-slate-700">{batch.boxCount.toLocaleString('ru-RU')} шт.</span>
          </div>
        </div>

        {/* Area per piece (m2) */}
        <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="input-area-piece" className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-indigo-500" />
              Площадь 1 рулона / кор.:
            </label>
            <span className="text-xs text-slate-400 font-mono">м²</span>
          </div>
          <input
            id="input-area-piece"
            type="number"
            min="0.1"
            step="0.05"
            value={batch.areaPerPieceM2}
            onChange={(e) =>
              onChange({
                ...batch,
                areaPerPieceM2: parseFloat(e.target.value) || 0,
              })
            }
            className="w-full text-lg font-bold text-slate-900 bg-white border border-slate-300 rounded-md px-3 py-1.5 focus:outline-blue-500"
          />
          <div className="mt-1.5 text-[11px] text-slate-500 flex justify-between">
            <span>Всего в партии:</span>
            <span className="font-semibold text-slate-700 font-mono">
              {totalAreaM2.toLocaleString('ru-RU')} м²
            </span>
          </div>
        </div>

        {/* Price per unit from Chinese Supplier */}
        <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="input-price-currency" className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
              <span className="font-bold text-emerald-600">¥/$</span>
              Цена FOB (за рулон / короб):
            </label>
            <div className="flex gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => onChange({ ...batch, currency: 'CNY' })}
                className={`px-1.5 py-0.5 rounded font-bold ${
                  batch.currency === 'CNY'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                ¥ CNY
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...batch, currency: 'USD' })}
                className={`px-1.5 py-0.5 rounded font-bold ${
                  batch.currency === 'USD'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                $ USD
              </button>
            </div>
          </div>
          <input
            id="input-price-currency"
            type="number"
            min="0.01"
            step="0.01"
            value={batch.priceInCurrency}
            onChange={(e) =>
              onChange({
                ...batch,
                priceInCurrency: parseFloat(e.target.value) || 0,
              })
            }
            className="w-full text-lg font-bold text-slate-900 bg-white border border-slate-300 rounded-md px-3 py-1.5 focus:outline-blue-500"
          />

          {/* Quick price adjustment buttons */}
          <div className="mt-2 pt-2 border-t border-slate-200/70">
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Percent className="w-3 h-3 text-blue-600" />
                Изм. цены:
              </span>
              <span className="text-[10px] text-slate-400">быстрый расчет</span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-[11px]">
              <button
                type="button"
                id="btn-price-plus-15"
                onClick={() => {
                  const updated = +(batch.priceInCurrency * 1.15).toFixed(2);
                  onChange({ ...batch, priceInCurrency: updated });
                }}
                className="px-1.5 py-1 font-bold text-emerald-700 bg-emerald-100/80 hover:bg-emerald-200 rounded border border-emerald-300/80 transition-colors text-center"
                title="Добавить ровно +15% к текущей стоимости"
              >
                +15%
              </button>
              <button
                type="button"
                id="btn-price-plus-10"
                onClick={() => {
                  const updated = +(batch.priceInCurrency * 1.10).toFixed(2);
                  onChange({ ...batch, priceInCurrency: updated });
                }}
                className="px-1.5 py-1 font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors text-center"
                title="Добавить +10%"
              >
                +10%
              </button>
              <button
                type="button"
                id="btn-price-plus-5"
                onClick={() => {
                  const updated = +(batch.priceInCurrency * 1.05).toFixed(2);
                  onChange({ ...batch, priceInCurrency: updated });
                }}
                className="px-1.5 py-1 font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors text-center"
                title="Добавить +5%"
              >
                +5%
              </button>
              <button
                type="button"
                id="btn-price-minus-10"
                onClick={() => {
                  const updated = +(batch.priceInCurrency * 0.90).toFixed(2);
                  onChange({ ...batch, priceInCurrency: updated });
                }}
                className="px-1.5 py-1 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors text-center"
                title="Скидка -10%"
              >
                -10%
              </button>
            </div>
          </div>

          <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
            <span>За 1 м²:</span>
            <span className="font-semibold text-slate-700 font-mono">
              {pricePerM2} {batch.currency === 'CNY' ? '¥' : '$'} / м²
            </span>
          </div>
        </div>

        {/* Weights (Net / Gross) */}
        <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="input-net-weight" className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-amber-500" />
              Вес партии (нетто / брутто):
            </label>
            <span className="text-xs text-slate-400 font-mono">кг</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-500">Нетто:</span>
              <input
                id="input-net-weight"
                type="number"
                value={batch.totalNetWeightKg}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  onChange({
                    ...batch,
                    totalNetWeightKg: val,
                    netWeightPerPieceKg: batch.boxCount > 0 ? val / batch.boxCount : 0,
                  });
                }}
                className="w-full text-sm font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 focus:outline-blue-500"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500">Брутто:</span>
              <input
                id="input-gross-weight"
                type="number"
                value={batch.totalGrossWeightKg}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  onChange({
                    ...batch,
                    totalGrossWeightKg: val,
                    grossWeightPerPieceKg: batch.boxCount > 0 ? val / batch.boxCount : 0,
                  });
                }}
                className="w-full text-sm font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 focus:outline-blue-500"
              />
            </div>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-500 flex justify-between">
            <span>Объем:</span>
            <span className="font-semibold text-slate-700">{batch.totalVolumeM3} м³</span>
          </div>
        </div>
      </div>

      {/* Interactive Simulation: "А если плотность уменьшить то какая цена?" */}
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                Симуляция плотности материала
                <span className="text-[11px] font-normal text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Вопрос из CSV: «А если плотность уменьшить, какая цена?»
                </span>
              </h3>
              <p className="text-[11px] text-slate-600">
                При изменении плотности войлока меняется масса рулона и вес контейнера. Поставщики часто снижают цену пропорционально весу сырья.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Базовая: {batch.baseDensityGsm} г/м²</span>
            <button
              type="button"
              onClick={() => handleDensityChange(batch.baseDensityGsm)}
              className="text-[11px] text-blue-600 hover:text-blue-800 underline font-medium"
            >
              Сбросить
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full flex-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Текущая плотность:</span>
              <span className="text-amber-800 font-mono text-sm">{batch.densityGsm} г/м²</span>
            </div>
            <input
              id="slider-density"
              type="range"
              min={Math.round(batch.baseDensityGsm * 0.5)}
              max={Math.round(batch.baseDensityGsm * 1.5)}
              step="10"
              value={batch.densityGsm}
              onChange={(e) => handleDensityChange(parseInt(e.target.value) || batch.baseDensityGsm)}
              className="w-full accent-amber-600 cursor-pointer h-2 bg-amber-200/70 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>-50% ({(batch.baseDensityGsm * 0.5).toFixed(0)} г/м²)</span>
              <span>Базовая ({batch.baseDensityGsm} г/м²)</span>
              <span>+50% ({(batch.baseDensityGsm * 1.5).toFixed(0)} г/м²)</span>
            </div>
          </div>

          {/* Impact preview */}
          <div className="bg-white border border-amber-200 rounded-lg p-2.5 flex items-center gap-3 text-xs min-w-[210px] justify-between shadow-2xs">
            <div>
              <span className="text-[10px] text-slate-500 block">Вес 1 рулона:</span>
              <span className="font-bold text-slate-800 font-mono">
                {batch.netWeightPerPieceKg} кг
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] text-slate-500 block">Вес контейнера:</span>
              <span className="font-bold text-amber-700 font-mono">
                {batch.totalNetWeightKg.toLocaleString('ru-RU')} кг
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Supplier Benchmark & Purchase Price Management */}
      <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900">
                  Закупочные цены других поставщиков (бенчмарк)
                </h3>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  {competitorsList.length} поставщ.
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Сравнение себестоимости под ключ из Китая с оптовыми ценами аналогов в РФ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-toggle-suppliers-table"
              onClick={() => setShowSuppliersTable(!showSuppliersTable)}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1"
            >
              {showSuppliersTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showSuppliersTable ? 'Скрыть таблицу' : 'Сравнить всех'}
            </button>

            <button
              type="button"
              id="btn-add-supplier"
              onClick={() => setIsAddingSupplier(!isAddingSupplier)}
              className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Добавить поставщика
            </button>
          </div>
        </div>

        {/* Add Supplier Form */}
        {isAddingSupplier && (
          <form
            onSubmit={handleAddSupplier}
            className="mb-3 p-3 bg-white border border-blue-200 rounded-xl space-y-2 animate-in fade-in"
          >
            <span className="text-xs font-bold text-blue-900 block">
              Новый поставщик / конкурент для сравнения:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">Название компании</span>
                <input
                  type="text"
                  required
                  placeholder="Например: СпецТекстиль РФ"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 focus:outline-blue-500"
                />
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">Закупочная цена (₽)</span>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newSupplierPrice}
                  onChange={(e) => setNewSupplierPrice(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-bold font-mono bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 focus:outline-blue-500"
                />
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">Единица измерения</span>
                <select
                  value={newSupplierUnit}
                  onChange={(e) => setNewSupplierUnit(e.target.value as any)}
                  className="w-full text-xs bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-blue-500"
                >
                  <option value="per_m2">₽ за 1 м²</option>
                  <option value="per_piece">₽ за 1 рулон (шт)</option>
                  <option value="per_kg">₽ за 1 кг</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingSupplier(false)}
                className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded shadow-xs"
              >
                Сохранить поставщика
              </button>
            </div>
          </form>
        )}

        {/* Suppliers Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {competitorsList.map((comp) => {
            const isSelected = comp.id === activeSupplierId;
            const normM2 = calcNormalizedPerM2(comp);
            return (
              <button
                key={comp.id}
                type="button"
                onClick={() => handleSelectActiveSupplier(comp.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-200'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300'
                }`}
              >
                {isSelected && <Check className="w-3 h-3" />}
                <span className="truncate max-w-[140px]">{comp.name}</span>
                <span
                  className={`font-mono text-[11px] px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {normM2.toFixed(1)} ₽/м²
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Supplier Details & Quick Price Tuning */}
        {activeSupplier && (
          <div className="bg-white border border-emerald-200/80 rounded-xl p-3.5 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Name & Unit edit */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-800">
                    Активный поставщик для сравнения:
                  </span>
                  <input
                    type="text"
                    value={activeSupplier.name}
                    onChange={(e) => {
                      const updated = competitorsList.map((c) =>
                        c.id === activeSupplier.id ? { ...c, name: e.target.value } : c
                      );
                      onChange({
                        ...batch,
                        competitors: updated,
                        targetCompetitorName: e.target.value,
                      });
                    }}
                    className="text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded px-2 py-0.5 focus:outline-blue-500 min-w-[180px]"
                  />
                  {competitorsList.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSupplier(activeSupplier.id, e)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Удалить этого поставщика"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                  <span>
                    Нормализовано: <strong className="text-emerald-800 font-mono">{calcNormalizedPerM2(activeSupplier).toFixed(2)} ₽/м²</strong>
                  </span>
                  <span>
                    За рулон (10 м²): <strong className="text-slate-800 font-mono">{(calcNormalizedPerM2(activeSupplier) * (batch.areaPerPieceM2 || 10)).toFixed(0)} ₽</strong>
                  </span>
                  {activeSupplier.note && <span>• {activeSupplier.note}</span>}
                </div>
              </div>

              {/* Price input & Unit selector */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">Закупочная цена:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      id="input-active-supplier-price"
                      type="number"
                      step="0.1"
                      value={activeSupplier.priceRub}
                      onChange={(e) =>
                        handleUpdateSupplierPrice(activeSupplier.id, parseFloat(e.target.value) || 0)
                      }
                      className="w-28 text-right font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-md px-2.5 py-1 text-sm focus:outline-emerald-500"
                    />
                    <select
                      value={activeSupplier.unit}
                      onChange={(e) =>
                        handleUpdateSupplierUnit(activeSupplier.id, e.target.value as any)
                      }
                      className="text-xs bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-800 focus:outline-emerald-500 cursor-pointer"
                    >
                      <option value="per_m2">₽ / м²</option>
                      <option value="per_piece">₽ / рулон</option>
                      <option value="per_kg">₽ / кг</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Price Tuning Buttons for Supplier */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <Percent className="w-3 h-3 text-emerald-600" />
                <span className="font-semibold text-slate-700">Быстрое изменение цены поставщика:</span>
              </div>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateSupplierPrice(
                      activeSupplier.id,
                      +(activeSupplier.priceRub * 1.15).toFixed(2)
                    )
                  }
                  className="px-2 py-0.5 font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded border border-amber-300 transition-colors"
                  title="Увеличить цену поставщика на +15%"
                >
                  +15%
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateSupplierPrice(
                      activeSupplier.id,
                      +(activeSupplier.priceRub * 1.10).toFixed(2)
                    )
                  }
                  className="px-2 py-0.5 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors"
                >
                  +10%
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateSupplierPrice(
                      activeSupplier.id,
                      +(activeSupplier.priceRub * 1.05).toFixed(2)
                    )
                  }
                  className="px-2 py-0.5 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors"
                >
                  +5%
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateSupplierPrice(
                      activeSupplier.id,
                      +(activeSupplier.priceRub * 0.95).toFixed(2)
                    )
                  }
                  className="px-2 py-0.5 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors"
                >
                  -5%
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateSupplierPrice(
                      activeSupplier.id,
                      +(activeSupplier.priceRub * 0.90).toFixed(2)
                    )
                  }
                  className="px-2 py-0.5 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors"
                >
                  -10%
                </button>
              </div>
            </div>
          </div>
        )}

        {/* All Suppliers Comparison Table (collapsible) */}
        {showSuppliersTable && (
          <div className="mt-3 bg-white rounded-xl border border-slate-200 overflow-hidden text-xs">
            <div className="p-2.5 bg-slate-100/70 border-b border-slate-200 font-bold text-slate-700 flex justify-between items-center">
              <span>Сводная таблица закупочных цен поставщиков в РФ:</span>
              <span className="text-[10px] text-slate-500 font-normal">
                Кликните на поставщика, чтобы выбрать для бенчмарка
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[11px] text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">Поставщик</th>
                    <th className="px-3 py-2">Введенная цена</th>
                    <th className="px-3 py-2">Единица</th>
                    <th className="px-3 py-2 text-right">За 1 м²</th>
                    <th className="px-3 py-2 text-right">За рулон</th>
                    <th className="px-3 py-2 text-center">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {competitorsList.map((comp) => {
                    const normM2 = calcNormalizedPerM2(comp);
                    const isSelected = comp.id === activeSupplierId;
                    return (
                      <tr
                        key={comp.id}
                        onClick={() => handleSelectActiveSupplier(comp.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-emerald-50/70 font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="px-3 py-2 flex items-center gap-1.5">
                          {isSelected ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-300" />
                          )}
                          <span className="text-slate-900">{comp.name}</span>
                        </td>
                        <td className="px-3 py-2 font-mono">
                          {comp.priceRub.toLocaleString('ru-RU')} ₽
                        </td>
                        <td className="px-3 py-2 text-slate-500">
                          {comp.unit === 'per_m2'
                            ? 'за м²'
                            : comp.unit === 'per_piece'
                            ? 'за рулон/ед'
                            : 'за кг'}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-emerald-800">
                          {normM2.toFixed(2)} ₽
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-slate-700">
                          {(normM2 * (batch.areaPerPieceM2 || 10)).toFixed(0)} ₽
                        </td>
                        <td className="px-3 py-2 text-center">
                          {isSelected ? (
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                              Выбран
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectActiveSupplier(comp.id);
                              }}
                              className="text-[10px] text-blue-600 hover:text-blue-800 underline"
                            >
                              Выбрать
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
