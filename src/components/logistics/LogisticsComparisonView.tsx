import React, { useState, useRef } from 'react';
import {
  DestinationWarehouse,
  RouteType,
  ForwarderQuote,
  CalculatedQuoteCost,
} from '../../types/logistics';
import {
  CurrencyRates,
  RollBatchItem,
  LogisticsCustomsSettings,
} from '../../types';
import {
  calculateQuoteCost,
  calculateBatchLogisticsImpacts,
  parseLogisticsExcelFile,
  convertQuoteToLogisticsSettings,
  downloadQuotesExcel,
} from '../../utils/logisticsCalculator';
import { formatRub, formatUsd } from '../../utils/calculator';
import {
  Ship,
  Train,
  Truck,
  Plus,
  Filter,
  ArrowUpDown,
  Search,
  CheckCircle2,
  Zap,
  Award,
  Clock,
  Layers,
  MapPin,
  Upload,
  Download,
  Trash2,
  FileSpreadsheet,
  Check,
  TrendingDown,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AddQuoteModal } from './AddQuoteModal';
import { RouteVisualMap } from './RouteVisualMap';
import { ExportLogisticsModal } from './ExportLogisticsModal';

interface Props {
  quotes: ForwarderQuote[];
  rates: CurrencyRates;
  activeBatch: RollBatchItem;
  currentLogistics: LogisticsCustomsSettings;
  activeQuoteId?: string;
  onApplyQuote: (quote: ForwarderQuote) => void;
  onAddQuote: (quote: ForwarderQuote) => void;
  onUpdateQuote: (quote: ForwarderQuote) => void;
  onDeleteQuote: (id: string) => void;
  onResetQuotes: () => void;
  onImportQuotes: (quotes: ForwarderQuote[]) => void;
}

export const LogisticsComparisonView: React.FC<Props> = ({
  quotes,
  rates,
  activeBatch,
  currentLogistics,
  activeQuoteId,
  onApplyQuote,
  onAddQuote,
  onUpdateQuote,
  onDeleteQuote,
  onResetQuotes,
  onImportQuotes,
}) => {
  const [selectedDestination, setSelectedDestination] = useState<'ALL' | DestinationWarehouse>('ALL');
  const [selectedRouteType, setSelectedRouteType] = useState<'ALL' | RouteType>('ALL');
  const [sortBy, setSortBy] = useState<'priceAsc' | 'daysAsc' | 'm2Asc'>('priceAsc');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'quotes' | 'matrix' | 'routes'>('quotes');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<ForwarderQuote | null>(null);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate impacts on active batch
  const impacts = calculateBatchLogisticsImpacts(
    quotes,
    activeBatch,
    rates,
    currentLogistics,
    activeQuoteId
  );

  // Filter quotes
  const filteredImpacts = impacts.filter((item) => {
    if (selectedDestination !== 'ALL' && item.quote.destination !== selectedDestination) return false;
    if (selectedRouteType !== 'ALL' && item.quote.routeType !== selectedRouteType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const searchable = `${item.quote.forwarderName} ${item.quote.originPort} ${item.quote.transitHub} ${item.quote.routeDescription}`.toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });

  // Sort
  filteredImpacts.sort((a, b) => {
    if (sortBy === 'priceAsc') return a.calc.totalRub - b.calc.totalRub;
    if (sortBy === 'daysAsc') return a.quote.transitDaysMin - b.quote.transitDaysMin;
    if (sortBy === 'm2Asc') return a.costPerM2Rub - b.costPerM2Rub;
    return 0;
  });

  // Best Price & Fastest overall in current filtered view
  const bestPriceItem = filteredImpacts.length > 0
    ? [...filteredImpacts].sort((a, b) => a.calc.totalRub - b.calc.totalRub)[0]
    : null;

  const fastestItem = filteredImpacts.length > 0
    ? [...filteredImpacts].sort((a, b) => a.quote.transitDaysMin - b.quote.transitDaysMin)[0]
    : null;

  const handleApply = (quote: ForwarderQuote) => {
    onApplyQuote(quote);
    setAppliedNotification(`Ставка "${quote.forwarderName} (${quote.destination})" успешно применена в расчет партии!`);
    setTimeout(() => setAppliedNotification(null), 4000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const imported: ForwarderQuote[] = [];
      for (let i = 0; i < files.length; i++) {
        const parsed = await parseLogisticsExcelFile(files[i]);
        imported.push(...parsed);
      }
      if (imported.length > 0) {
        onImportQuotes(imported);
        setAppliedNotification(`Успешно импортировано ${imported.length} ставок из Excel!`);
        setTimeout(() => setAppliedNotification(null), 4000);
      }
    } catch (err) {
      console.error('Error importing Excel:', err);
      alert('Ошибка при чтении файла Excel');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {appliedNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold">{appliedNotification}</span>
        </div>
      )}

      {/* Top Banner & Overview */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/20">
              <Ship className="w-3.5 h-3.5" />
              <span>Мультимодальная логистика Китай ➔ РФ (40&apos;HC / 20&apos;GP)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Сравнение ставок перевозчиков и влияние на себестоимость партии
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Сравните предложения экспедиторов (ИГЛ, Галеос, Дельпорте, порт Циндао) на склады в{' '}
              <strong className="text-white">Серпухове</strong> и{' '}
              <strong className="text-white">Ставрополе</strong>. Применяйте любую ставку в один клик
              для расчета полной себестоимости за м², рулон или кг.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3.5 border border-white/15">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 mb-1">
                <Award className="w-3.5 h-3.5" />
                <span>Лучшая цена логистики</span>
              </div>
              {bestPriceItem ? (
                <div>
                  <div className="text-lg sm:text-xl font-mono font-black text-white">
                    {formatRub(bestPriceItem.calc.totalRub)}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {bestPriceItem.quote.forwarderName} ({bestPriceItem.quote.destination}) •{' '}
                    <strong className="text-emerald-300 font-mono">
                      {bestPriceItem.costPerM2Rub.toFixed(1)} ₽/м²
                    </strong>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400">Нет данных</div>
              )}
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3.5 border border-white/15">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 mb-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Самый быстрый транзит</span>
              </div>
              {fastestItem ? (
                <div>
                  <div className="text-lg sm:text-xl font-mono font-black text-white">
                    {fastestItem.quote.transitDaysMin}–{fastestItem.quote.transitDaysMax} дн.
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {fastestItem.quote.forwarderName} • {formatRub(fastestItem.calc.totalRub)}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400">Нет данных</div>
              )}
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-white/15">
          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'quotes'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Карточки котировок ({filteredImpacts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'matrix'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Сравнительная матрица вариантов под ключ</span>
          </button>

          <button
            onClick={() => setActiveTab('routes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'routes'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Ship className="w-3.5 h-3.5" />
            <span>Схема и этапы маршрутов</span>
          </button>
        </div>
      </div>

      {/* Main Content Areas */}
      {activeTab === 'routes' ? (
        <RouteVisualMap />
      ) : (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Destination Filter */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setSelectedDestination('ALL')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                    selectedDestination === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Все склады
                </button>
                <button
                  onClick={() => setSelectedDestination('Серпухов')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
                    selectedDestination === 'Серпухов'
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>Серпухов</span>
                </button>
                <button
                  onClick={() => setSelectedDestination('Ставрополь')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
                    selectedDestination === 'Ставрополь'
                      ? 'bg-indigo-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>Ставрополь</span>
                </button>
              </div>

              {/* Route Type Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedRouteType}
                  onChange={(e) => setSelectedRouteType(e.target.value as any)}
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700"
                >
                  <option value="ALL">Все типы маршрутов</option>
                  <option value="sea_vvo_rail_truck">Море ВВО + Ж/Д + Авто</option>
                  <option value="direct_rail_truck">Прямое Ж/Д + Авто</option>
                  <option value="deep_sea_novorossiysk">Deep Sea (Новороссийск) + Авто</option>
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700"
                >
                  <option value="priceAsc">Сортировка: Мин. цена логистики</option>
                  <option value="m2Asc">Сортировка: Мин. себестоимость 1 м²</option>
                  <option value="daysAsc">Сортировка: Быстрый транзит</option>
                </select>
              </div>
            </div>

            {/* Bottom Row of Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по экспедитору, порту, хабу (ИГЛ, Галеос, Шанхай, Новороссийск)..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  id="btn-export-logistics-quotes"
                  className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 rounded-lg transition shadow-2xs flex items-center gap-1.5"
                  title="Экспорт тарифов в Excel (.xlsx), CSV или копирование в буфер"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Экспорт тарифов</span>
                </button>

                <button
                  onClick={() => {
                    setEditingQuote(null);
                    setIsAddModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить ставку</span>
                </button>

                <label className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Импорт Excel</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={onResetQuotes}
                  title="Восстановить заводские ставки из файлов перевозчиков"
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ================= TAB 1: CARDS VIEW ================= */}
          {activeTab === 'quotes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredImpacts.map((item) => {
                const isSelected = activeQuoteId === item.quote.id;
                const isBest = item.isCheapestPrice;
                const isFast = item.isFastest;

                return (
                  <div
                    key={item.quote.id}
                    className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden relative shadow-xs ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                        : isBest
                        ? 'border-emerald-300 hover:border-emerald-400'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Top Badges */}
                    <div className="p-4 pb-3 border-b border-slate-100 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-slate-900">
                            {item.quote.forwarderName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              item.quote.destination === 'Серпухов'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}
                          >
                            {item.quote.destination}
                          </span>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center gap-1">
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                              <Check className="w-3 h-3" /> В расчете
                            </span>
                          )}
                          {isBest && !isSelected && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <Award className="w-3 h-3" /> Лучшая цена
                            </span>
                          )}
                          {isFast && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                              <Zap className="w-3 h-3" /> {item.quote.transitDaysMin} дн.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Route Path */}
                      <div className="text-xs text-slate-600 flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">{item.quote.originPort}</span>
                        <span className="text-slate-400">➔</span>
                        <span className="truncate" title={item.quote.transitHub}>
                          {item.quote.transitHub}
                        </span>
                        <span className="text-slate-400">➔</span>
                        <span className="font-semibold text-slate-800">{item.quote.destination}</span>
                      </div>
                    </div>

                    {/* Cost Breakdown Details */}
                    <div className="p-4 space-y-3 flex-1 bg-slate-50/40 text-xs">
                      <div className="space-y-1.5 text-slate-600">
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Ship className="w-3.5 h-3.5 text-blue-600" />
                            Фрахт ({item.quote.oceanFreight.currency}):
                          </span>
                          <span className="font-mono font-bold text-slate-800">
                            {formatUsd(item.calc.oceanFreightUsd)} ({formatRub(item.calc.oceanFreightRub)})
                          </span>
                        </div>

                        {item.calc.railFreightRub > 0 && (
                          <div className="flex justify-between">
                            <span className="flex items-center gap-1.5 text-slate-500">
                              <Train className="w-3.5 h-3.5 text-indigo-600" />
                              Ж/Д плечо:
                            </span>
                            <span className="font-mono font-semibold text-slate-800">
                              {formatRub(item.calc.railFreightRub)}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Truck className="w-3.5 h-3.5 text-amber-600" />
                            Автовывоз до склада:
                          </span>
                          <span className="font-mono font-semibold text-slate-800">
                            {formatRub(item.calc.truckDeliveryRub)}
                          </span>
                        </div>

                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>Экспедирование + терминал + СВХ:</span>
                          <span className="font-mono">
                            {formatRub(item.calc.forwarderFeeRub + item.calc.terminalExpensesRub)}
                          </span>
                        </div>
                      </div>

                      {/* Total Logistics Cost Box */}
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                            Итого логистика
                          </div>
                          <div className="text-base font-black font-mono text-slate-900">
                            {formatRub(item.calc.totalRub)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                            USD эквивалент
                          </div>
                          <div className="text-sm font-bold font-mono text-blue-700">
                            {formatUsd(item.calc.totalUsd)}
                          </div>
                        </div>
                      </div>

                      {/* Landed Impact on Product Unit Cost */}
                      <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-200/80 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-blue-950">Себестоимость товара под ключ:</span>
                          <span className="font-mono font-black text-blue-900 text-sm">
                            {item.costPerM2Rub.toFixed(2)} ₽/м²
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-600">
                          <span>За рулон/ед. ({activeBatch.areaPerPieceM2} м²):</span>
                          <span className="font-mono font-semibold text-slate-800">
                            {formatRub(item.costPerPieceRub)}
                          </span>
                        </div>
                        {item.deltaM2Rub !== 0 && (
                          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-blue-200/60">
                            <span className="text-slate-500">Разница с активным:</span>
                            <span
                              className={`font-mono font-bold ${
                                item.deltaM2Rub < 0 ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              {item.deltaM2Rub > 0 ? '+' : ''}
                              {item.deltaM2Rub.toFixed(2)} ₽/м² ({formatRub(item.deltaTotalRub)})
                            </span>
                          </div>
                        )}
                      </div>

                      {item.quote.comments && (
                        <p className="text-[11px] text-slate-500 italic line-clamp-1" title={item.quote.comments}>
                          «{item.quote.comments}»
                        </p>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.quote.transitDaysMin}–{item.quote.transitDaysMax} дн.</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onDeleteQuote(item.quote.id)}
                          title="Удалить ставку"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleApply(item.quote)}
                          disabled={isSelected}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-slate-100 text-slate-400 cursor-default'
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Применено</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Применить в расчет</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ================= TAB 2: SIDE-BY-SIDE MATRIX ================= */}
          {activeTab === 'matrix' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Сравнительная матрица вариантов доставки «под ключ»
                  </h3>
                  <p className="text-xs text-slate-500">
                    Товар: {activeBatch.productName} • Партия: {activeBatch.boxCount} шт. (
                    {((activeBatch.boxCount || 0) * (activeBatch.areaPerPieceM2 || 0)).toLocaleString('ru-RU')} м²)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Экспорт / Отчет</span>
                  </button>
                  <button
                    onClick={() =>
                      downloadQuotesExcel(
                        filteredImpacts.map((i) => i.quote),
                        rates,
                        activeBatch,
                        currentLogistics
                      )
                    }
                    className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition flex items-center gap-1.5 shadow-xs"
                    title="Быстро скачать таблицу котировок в Excel (.xlsx)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Скачать .xlsx</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Экспедитор / Маршрут</th>
                      <th className="py-3 px-3">Склад</th>
                      <th className="py-3 px-3">Срок</th>
                      <th className="py-3 px-3 text-right">Фрахт ($)</th>
                      <th className="py-3 px-3 text-right">Логистика (₽)</th>
                      <th className="py-3 px-3 text-right">Партия под ключ (₽)</th>
                      <th className="py-3 px-3 text-right font-black text-slate-900">Себестоимость 1 м²</th>
                      <th className="py-3 px-3 text-right">Разница за м²</th>
                      <th className="py-3 px-4 text-center">Действие</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredImpacts.map((item) => {
                      const isSelected = activeQuoteId === item.quote.id;
                      const isBest = item.isCheapestPrice;

                      return (
                        <tr
                          key={item.quote.id}
                          className={`hover:bg-slate-50/80 transition ${
                            isSelected ? 'bg-blue-50/50 font-medium' : isBest ? 'bg-emerald-50/30' : ''
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{item.quote.forwarderName}</span>
                              {isBest && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                  BEST
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">{item.quote.routeDescription}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.quote.destination === 'Серпухов'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}
                            >
                              {item.quote.destination}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-700">
                            {item.quote.transitDaysMin}–{item.quote.transitDaysMax} дн.
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-blue-700">
                            {formatUsd(item.calc.oceanFreightUsd)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                            {formatRub(item.calc.totalRub)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-700">
                            {formatRub(item.totalCostRub)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-black text-sm text-slate-900">
                            {item.costPerM2Rub.toFixed(2)} ₽
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold">
                            <span
                              className={`${
                                item.deltaM2Rub < 0
                                  ? 'text-emerald-700'
                                  : item.deltaM2Rub > 0
                                  ? 'text-rose-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {item.deltaM2Rub > 0 ? '+' : ''}
                              {item.deltaM2Rub.toFixed(2)} ₽
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleApply(item.quote)}
                              disabled={isSelected}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                                isSelected
                                  ? 'bg-slate-200 text-slate-500 cursor-default'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                              }`}
                            >
                              {isSelected ? 'Применено' : 'Выбрать'}
                            </button>
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
      )}

      {/* Add / Edit Modal */}
      <AddQuoteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaveQuote={(quote) => {
          onAddQuote(quote);
          setAppliedNotification(`Ставка перевозчика "${quote.forwarderName}" добавлена в базу!`);
          setTimeout(() => setAppliedNotification(null), 4000);
        }}
        initialQuote={editingQuote}
      />

      {/* Export Logistics Quotes Modal */}
      <ExportLogisticsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        quotes={filteredImpacts.map((i) => i.quote)}
        rates={rates}
        batch={activeBatch}
        currentLogistics={currentLogistics}
        activeQuoteId={activeQuoteId}
      />
    </div>
  );
};
