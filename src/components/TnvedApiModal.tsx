import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Percent,
  Calculator,
  ShieldCheck,
  Tag,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  Info,
  Building,
} from 'lucide-react';
import { TnvedItem } from '../types/tnved';
import { fetchTnvedCodes } from '../utils/tnvedService';
import { TNVED_CATALOG } from '../data/tnvedCatalog';
import { getCustomsFee2026 } from '../data/customsTariffs';
import { CurrencyRates } from '../types';

interface TnvedApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCode?: string;
  currentDutyRate?: number;
  onSelectCode: (item: TnvedItem) => void;
  invoiceRub: number;
  freightRub: number;
  insuranceRub?: number;
  rates: CurrencyRates;
}

export const TnvedApiModal: React.FC<TnvedApiModalProps> = ({
  isOpen,
  onClose,
  currentCode,
  currentDutyRate,
  onSelectCode,
  invoiceRub,
  freightRub,
  insuranceRub = 0,
  rates,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [items, setItems] = useState<TnvedItem[]>(TNVED_CATALOG);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'calculator'>('search');
  const [dataSource, setDataSource] = useState<'catalog' | 'api' | 'ai'>('catalog');

  // Custom calculator tab state
  const [calcInvoiceUsd, setCalcInvoiceUsd] = useState(30000);
  const [calcFreightUsd, setCalcFreightUsd] = useState(4550);
  const [calcDutyPercent, setCalcDutyPercent] = useState(12);
  const [calcVatPercent, setCalcVatPercent] = useState(20);

  // Available categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    TNVED_CATALOG.forEach((i) => set.add(i.category));
    return ['Все', ...Array.from(set)];
  }, []);

  // Initial load or query change
  useEffect(() => {
    if (!isOpen) return;

    // If modal just opened and query is empty, initialize with default catalog
    if (!searchQuery.trim()) {
      let filtered = TNVED_CATALOG;
      if (selectedCategory !== 'Все') {
        filtered = filtered.filter((i) => i.category === selectedCategory);
      }
      setItems(filtered);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetchTnvedCodes({ query: searchQuery, limit: 20 });
        let resItems = response.items;
        if (selectedCategory !== 'Все') {
          resItems = resItems.filter((i) => i.category === selectedCategory);
        }
        setItems(resItems);
        setDataSource(response.fromApi ? 'api' : 'catalog');
      } catch (err) {
        console.error('Error fetching TNVED codes:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, isOpen]);

  // AI-assisted classification lookup
  const handleAiLookup = async () => {
    if (!searchQuery.trim()) return;
    setIsAiLoading(true);
    try {
      const response = await fetchTnvedCodes({
        query: searchQuery,
        limit: 15,
        useAi: true,
      });
      setItems(response.items);
      setDataSource(response.source === 'eaeu_ai_lookup' ? 'ai' : 'api');
    } catch (e) {
      console.error('AI search error:', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!isOpen) return null;

  // Current batch customs value
  const batchCustomsValueRub = invoiceRub + freightRub + insuranceRub;

  // Custom calculator live calculations
  const calcInvoiceRub = calcInvoiceUsd * rates.usdRub;
  const calcFreightRub = calcFreightUsd * rates.usdRub;
  const calcCustomsValueRub = calcInvoiceRub + calcFreightRub;
  const calcDutyRub = Math.round(calcCustomsValueRub * (calcDutyPercent / 100));
  const calcFeeInfo = getCustomsFee2026(calcCustomsValueRub);
  const calcVatBaseRub = calcCustomsValueRub + calcDutyRub;
  const calcVatRub = Math.round(calcVatBaseRub * (calcVatPercent / 100));
  const calcTotalCustomsPaymentsRub = calcDutyRub + calcFeeInfo.fee + calcVatRub;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">
                  База кодов ТН ВЭД ЕАЭС и расчет пошлины по API
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Онлайн API • 2026
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Автоматический подбор ставки ввозной пошлины, расчет НДС и таможенных платежей
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 bg-slate-50 border-b border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'search'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Поиск и подбор кода по API ({items.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'calculator'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Калькулятор пошлины по ТН ВЭД</span>
          </button>
        </div>

        {/* Tab 1: Search & Apply */}
        {activeTab === 'search' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Search Input Bar */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Введите 10-значный код (8708...) или товар (войлок, профиль, станок, пленка)..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-blue-600 focus:border-blue-600 shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleAiLookup}
                  disabled={isAiLoading || !searchQuery.trim()}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs shrink-0"
                  title="Определить точный 10-значный код ТН ВЭД по описанию товара через экспертную модель"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isAiLoading ? 'Классификация...' : 'Нейропоиск по описанию'}</span>
                </button>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] text-slate-400 shrink-0 font-medium mr-1">Категория:</span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Active Batch Info Banner */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-blue-900">
                  Параметры текущей партии:
                </span>
                <span className="text-blue-800">
                  Таможенная стоимость ={' '}
                  <strong className="font-mono">{Math.round(batchCustomsValueRub).toLocaleString('ru-RU')} ₽</strong>
                  {rates.usdRub > 0 && (
                    <span className="text-blue-600 ml-1">
                      (${(batchCustomsValueRub / rates.usdRub).toLocaleString('ru-RU', { maximumFractionDigits: 0 })})
                    </span>
                  )}
                </span>
              </div>
              {currentCode && (
                <div className="text-blue-800 bg-white px-2.5 py-1 rounded-md border border-blue-200 text-[11px]">
                  Текущий код в расчете: <span className="font-mono font-bold">{currentCode}</span> ({currentDutyRate}%)
                </div>
              )}
            </div>

            {/* Loading indicator */}
            {(isLoading || isAiLoading) && (
              <div className="py-8 text-center text-slate-500 space-y-2">
                <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-medium">Запрос к базе ТН ВЭД ЕАЭС и актуализация ставок...</p>
              </div>
            )}

            {/* Results List */}
            {!isLoading && !isAiLoading && items.length === 0 && (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">Ничего не найдено по запросу «{searchQuery}»</p>
                <p className="text-xs text-slate-500 mt-1">
                  Попробуйте нажать кнопку «Нейропоиск по описанию» или ввести ключевое слово: «войлок», «профиль», «алюминий».
                </p>
              </div>
            )}

            {!isLoading && !isAiLoading && items.length > 0 && (
              <div className="space-y-3">
                {items.map((item) => {
                  const isCurrent = currentCode === item.code;
                  // Compute preview for this specific item applied to the current shipment
                  const dutyAmountRub = Math.round(batchCustomsValueRub * (item.dutyRatePercent / 100));
                  const feeInfo = getCustomsFee2026(batchCustomsValueRub);
                  const vatAmountRub = Math.round((batchCustomsValueRub + dutyAmountRub) * (item.vatRatePercent / 100));
                  const totalCustomsRub = dutyAmountRub + feeInfo.fee + vatAmountRub;

                  return (
                    <div
                      key={item.code}
                      className={`rounded-xl border p-4 transition-all ${
                        isCurrent
                          ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-base font-black text-blue-900 tracking-wide bg-blue-100/70 text-blue-800 px-2 py-0.5 rounded-md border border-blue-200">
                              {item.formattedCode || item.code}
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              {item.shortName}
                            </span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                              {item.category}
                            </span>
                            {item.sourceDocNote && (
                              <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-medium">
                                ⭐ Из спецификаций
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {item.name}
                          </p>

                          <div className="text-[11px] text-slate-400">
                            {item.chapter}
                          </div>

                          {/* Requirements & Certifications */}
                          {item.requirements && item.requirements.length > 0 && (
                            <div className="pt-1.5 flex flex-wrap items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="text-[10px] font-semibold text-slate-700">Нетарифное регулирование:</span>
                              {item.requirements.map((req, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded"
                                >
                                  {req}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Duty Rate & Payment Card */}
                        <div className="md:w-64 bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex flex-col justify-between shrink-0 space-y-2.5">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-500 font-medium">Ввозная пошлина:</span>
                              <span className="text-sm font-black text-indigo-700 font-mono">
                                {item.dutyRatePercent}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-500 font-medium">Ставка НДС:</span>
                              <span className="text-xs font-bold text-slate-800 font-mono">
                                {item.vatRatePercent}%
                              </span>
                            </div>

                            {/* Live calculation for shipment */}
                            <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] space-y-1">
                              <div className="flex justify-between text-slate-600">
                                <span>Пошлина по партии:</span>
                                <span className="font-mono font-bold text-slate-900">
                                  {dutyAmountRub.toLocaleString('ru-RU')} ₽
                                </span>
                              </div>
                              <div className="flex justify-between text-slate-600">
                                <span>НДС партии:</span>
                                <span className="font-mono text-slate-800">
                                  {vatAmountRub.toLocaleString('ru-RU')} ₽
                                </span>
                              </div>
                              <div className="flex justify-between text-emerald-800 font-bold pt-1 border-t border-slate-200">
                                <span>Итого платежей:</span>
                                <span className="font-mono">
                                  {totalCustomsRub.toLocaleString('ru-RU')} ₽
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              onSelectCode(item);
                              onClose();
                            }}
                            className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs ${
                              isCurrent
                                ? 'bg-slate-200 text-slate-700 cursor-default'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>
                              {isCurrent ? 'Уже применен' : `Применить ставку ${item.dutyRatePercent}%`}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Custom Duty Calculator */}
        {activeTab === 'calculator' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-600" />
                Интерактивный расчет таможенной пошлины и платежей по произвольным данным
              </h4>
              <p className="text-xs text-slate-500">
                Задайте параметры партии и процент пошлины по выбранному коду ТН ВЭД для мгновенного расчета базы ФТС РФ.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Инвойс партии ($ USD):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={calcInvoiceUsd}
                    onChange={(e) => setCalcInvoiceUsd(parseFloat(e.target.value) || 0)}
                    className="w-full text-sm font-bold px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    ≈ {Math.round(calcInvoiceRub).toLocaleString('ru-RU')} ₽ (по курсу {rates.usdRub})
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Международный фрахт ($ USD):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={calcFreightUsd}
                    onChange={(e) => setCalcFreightUsd(parseFloat(e.target.value) || 0)}
                    className="w-full text-sm font-bold px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    ≈ {Math.round(calcFreightRub).toLocaleString('ru-RU')} ₽
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Ставка пошлины ТН ВЭД (%):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={calcDutyPercent}
                    onChange={(e) => setCalcDutyPercent(parseFloat(e.target.value) || 0)}
                    className="w-full text-sm font-bold px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                  <div className="flex gap-1 mt-1">
                    {[0, 5, 6.5, 10, 12, 15].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setCalcDutyPercent(rate)}
                        className="text-[10px] px-1.5 py-0.5 bg-slate-200 hover:bg-blue-100 rounded text-slate-700"
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Ставка НДС (%):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={calcVatPercent}
                    onChange={(e) => setCalcVatPercent(parseFloat(e.target.value) || 0)}
                    className="w-full text-sm font-bold px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                  <div className="flex gap-1 mt-1">
                    {[10, 20, 22].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setCalcVatPercent(v)}
                        className="text-[10px] px-1.5 py-0.5 bg-slate-200 hover:bg-blue-100 rounded text-slate-700"
                      >
                        {v}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Calculation Protocol */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  1. Таможенная стоимость
                </span>
                <div className="text-xl font-black text-slate-900 font-mono">
                  {Math.round(calcCustomsValueRub).toLocaleString('ru-RU')} ₽
                </div>
                <p className="text-[11px] text-slate-400">
                  Инвойс ({Math.round(calcInvoiceRub).toLocaleString('ru-RU')} ₽) + Фрахт ({Math.round(calcFreightRub).toLocaleString('ru-RU')} ₽)
                </p>
              </div>

              <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200 space-y-1">
                <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider block">
                  2. Ввозная пошлина ({calcDutyPercent}%)
                </span>
                <div className="text-xl font-black text-indigo-900 font-mono">
                  {calcDutyRub.toLocaleString('ru-RU')} ₽
                </div>
                <p className="text-[11px] text-indigo-600">
                  {Math.round(calcCustomsValueRub).toLocaleString('ru-RU')} ₽ × {calcDutyPercent}%
                </p>
              </div>

              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                  3. Таможенный сбор 2026
                </span>
                <div className="text-xl font-black text-emerald-900 font-mono">
                  {calcFeeInfo.fee.toLocaleString('ru-RU')} ₽
                </div>
                <p className="text-[11px] text-emerald-600">
                  Интервал: {calcFeeInfo.tier.label}
                </p>
              </div>

              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-1">
                <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
                  4. НДС ({calcVatPercent}%)
                </span>
                <div className="text-xl font-black text-blue-900 font-mono">
                  {calcVatRub.toLocaleString('ru-RU')} ₽
                </div>
                <p className="text-[11px] text-blue-600">
                  База: ({Math.round(calcCustomsValueRub).toLocaleString('ru-RU')} + {calcDutyRub.toLocaleString('ru-RU')}) × {calcVatPercent}%
                </p>
              </div>
            </div>

            {/* Total Customs Payment Summary Box */}
            <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
              <div>
                <span className="text-xs text-blue-300 font-semibold block uppercase tracking-wider">
                  Итого таможенных платежей (Пошлина + Сбор + НДС)
                </span>
                <div className="text-3xl font-black font-mono tracking-tight text-white mt-1">
                  {calcTotalCustomsPaymentsRub.toLocaleString('ru-RU')} ₽
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Эффективная налоговая нагрузка на партию:{' '}
                  <strong className="text-emerald-400">
                    {calcCustomsValueRub > 0
                      ? ((calcTotalCustomsPaymentsRub / calcCustomsValueRub) * 100).toFixed(1)
                      : 0}
                    %
                  </strong>{' '}
                  от таможенной стоимости
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">В валюте ($ USD):</span>
                <div className="text-2xl font-black font-mono text-emerald-400">
                  ${rates.usdRub > 0 ? Math.round(calcTotalCustomsPaymentsRub / rates.usdRub).toLocaleString('ru-RU') : 0}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            <span>
              Ставки согласованы с Единым таможенным тарифом ЕАЭС и Федеральной таможенной службой РФ.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
