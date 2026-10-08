import React, { useState, useMemo } from 'react';
import {
  Layers,
  FileSpreadsheet,
  Upload,
  Info,
  Sliders,
  Calculator,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  BookmarkPlus,
  Ship,
  Truck,
} from 'lucide-react';
import { Header } from './components/Header';
import { CurrencyBar } from './components/CurrencyBar';
import { BatchConfigurator } from './components/BatchConfigurator';
import { MultiItemSpecTable } from './components/MultiItemSpecTable';
import { LogisticsCustomsPanel } from './components/LogisticsCustomsPanel';
import { CalculationSummary } from './components/CalculationSummary';
import { CustomsTariffModal } from './components/CustomsTariffModal';
import { ExportReportModal } from './components/ExportReportModal';
import { CurrencyRateModal } from './components/CurrencyRateModal';
import { PresetManagerModal } from './components/PresetManagerModal';
import { LogisticsComparisonView } from './components/logistics/LogisticsComparisonView';
import { ExportLogisticsModal } from './components/logistics/ExportLogisticsModal';
import { AddQuoteModal } from './components/logistics/AddQuoteModal';
import { HelpManualModal } from './components/HelpManualModal';
import { TnvedApiModal } from './components/TnvedApiModal';
import { TnvedItem } from './types/tnved';
import { PRESETS, CalculationPreset } from './data/presets';
import { getAllPresetsList } from './utils/presetStorage';
import { DEFAULT_FORWARDER_QUOTES } from './data/logisticsQuotes';
import { ForwarderQuote } from './types/logistics';
import {
  convertQuoteToLogisticsSettings,
  getStoredCustomQuotes,
  saveStoredCustomQuotes,
  parseLogisticsExcelFile,
} from './utils/logisticsCalculator';
import {
  CurrencyRates,
  RollBatchItem,
  SpecLineItem,
  LogisticsCustomsSettings,
} from './types';
import {
  calculateBatchResult,
  calculateSpecResult,
  formatMoney,
} from './utils/calculator';

export default function App() {
  // Navigation View: 'ved' (Standard customs & batch) | 'logistics' (Carrier quotes comparison) | 'matrix' (Side-by-side all routes)
  const [activeMainView, setActiveMainView] = useState<'ved' | 'logistics' | 'matrix'>('ved');

  // Forwarder Quotes Data (Defaults + Saved Custom)
  const [quotes, setQuotes] = useState<ForwarderQuote[]>(() => {
    const custom = getStoredCustomQuotes();
    return [...DEFAULT_FORWARDER_QUOTES, ...custom];
  });
  const [activeQuoteId, setActiveQuoteId] = useState<string | undefined>('egl_serpukhov_vvo');

  // All Presets (Factory + Stored User Presets)
  const [allPresets, setAllPresets] = useState<CalculationPreset[]>(() => getAllPresetsList());

  // Active Preset
  const [activePreset, setActivePreset] = useState<CalculationPreset>(allPresets[0] || PRESETS[0]);
  const [calcMode, setCalcMode] = useState<'batch' | 'spec'>('batch');

  // Currency & Tax Settings
  const [rates, setRates] = useState<CurrencyRates>({
    usdRub: 82.0,
    cnyRub: 11.079,
    rateDate: '2026-01-26',
    effectiveDate: '2026-01-24',
    isCbrOfficial: true,
  });
  const [vatRatePercent, setVatRatePercent] = useState<number>(22.0);

  // Batch Data (Jinpeng / Roll / Box / Container)
  const [batchItem, setBatchItem] = useState<RollBatchItem>(PRESETS[0].batchItem!);

  // Multi-item Specification Data (Profiles)
  const [specItems, setSpecItems] = useState<SpecLineItem[]>(PRESETS[3].specItems!);

  // Logistics & Customs
  const [logistics, setLogistics] = useState<LogisticsCustomsSettings>({
    ...PRESETS[0].logistics,
    vatRatePercent: 22.0,
  });

  // Active Modals
  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLogisticsExportModalOpen, setIsLogisticsExportModalOpen] = useState(false);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isAddQuoteModalOpen, setIsAddQuoteModalOpen] = useState(false);
  const [isTnvedModalOpen, setIsTnvedModalOpen] = useState(false);

  // Apply TNVED Code & Rate from API
  const handleSelectTnvedItem = (item: TnvedItem) => {
    setLogistics((prev) => ({
      ...prev,
      dutyRatePercent: item.dutyRatePercent,
    }));
    if (calcMode === 'batch') {
      setBatchItem((b) => ({ ...b, hsCode: item.code }));
    }
  };

  // Active applied quote object
  const activeQuote = quotes.find((q) => q.id === activeQuoteId);

  // Apply a forwarder quote into batch logistics
  const handleApplyQuote = (quote: ForwarderQuote) => {
    setActiveQuoteId(quote.id);
    const updated = convertQuoteToLogisticsSettings(quote, logistics);
    setLogistics(updated);
  };

  // Add new quote
  const handleAddQuote = (newQuote: ForwarderQuote) => {
    setQuotes((prev) => {
      const next = [newQuote, ...prev];
      const customOnly = next.filter((q) => !DEFAULT_FORWARDER_QUOTES.some((d) => d.id === q.id));
      saveStoredCustomQuotes(customOnly);
      return next;
    });
  };

  // Add new quote and automatically apply it
  const handleAddNewQuote = (newQuote: ForwarderQuote) => {
    handleAddQuote(newQuote);
    handleApplyQuote(newQuote);
  };

  // Upload Excel file with quotes directly from logistics panel
  const handleUploadExcelQuotes = async (file: File) => {
    try {
      const imported = await parseLogisticsExcelFile(file);
      if (imported.length > 0) {
        handleImportQuotes(imported);
        handleApplyQuote(imported[0]);
        alert(`Успешно загружено ${imported.length} коммерческих предложений из файла "${file.name}"! Ставка "${imported[0].forwarderName}" применена к расчету.`);
      } else {
        alert('Не удалось автоматически распознать ставки в файле. Пожалуйста, проверьте файл или введите ставку вручную.');
      }
    } catch (e) {
      console.error(e);
      alert('Ошибка при чтении файла Excel.');
    }
  };

  // Update existing quote
  const handleUpdateQuote = (updatedQuote: ForwarderQuote) => {
    setQuotes((prev) => {
      const next = prev.map((q) => (q.id === updatedQuote.id ? updatedQuote : q));
      const customOnly = next.filter((q) => !DEFAULT_FORWARDER_QUOTES.some((d) => d.id === q.id));
      saveStoredCustomQuotes(customOnly);
      return next;
    });
  };

  // Delete quote
  const handleDeleteQuote = (id: string) => {
    setQuotes((prev) => {
      const next = prev.filter((q) => q.id !== id);
      const customOnly = next.filter((q) => !DEFAULT_FORWARDER_QUOTES.some((d) => d.id === q.id));
      saveStoredCustomQuotes(customOnly);
      return next;
    });
    if (activeQuoteId === id) setActiveQuoteId(undefined);
  };

  // Reset quotes to factory
  const handleResetQuotes = () => {
    saveStoredCustomQuotes([]);
    setQuotes(DEFAULT_FORWARDER_QUOTES);
    setActiveQuoteId(DEFAULT_FORWARDER_QUOTES[0].id);
  };

  // Import quotes from Excel
  const handleImportQuotes = (imported: ForwarderQuote[]) => {
    setQuotes((prev) => {
      const next = [...imported, ...prev];
      const customOnly = next.filter((q) => !DEFAULT_FORWARDER_QUOTES.some((d) => d.id === q.id));
      saveStoredCustomQuotes(customOnly);
      return next;
    });
  };

  // Handle Preset Selection
  const handleSelectPreset = (preset: CalculationPreset) => {
    setActivePreset(preset);
    setCalcMode(preset.category);
    setRates({ ...preset.rates });
    setVatRatePercent(preset.logistics.vatRatePercent);
    setLogistics({ ...preset.logistics });

    if (preset.batchItem) {
      setBatchItem({ ...preset.batchItem });
    }
    if (preset.specItems) {
      setSpecItems([...preset.specItems]);
    }
  };

  // Reset to default
  const handleReset = () => {
    handleSelectPreset(PRESETS[0]);
  };

  // Sync VAT changes
  const handleVatChange = (vat: number) => {
    setVatRatePercent(vat);
    setLogistics((prev) => ({ ...prev, vatRatePercent: vat }));
  };

  // Calculate Result live
  const calculationResult = useMemo(() => {
    const activeLogistics = { ...logistics, vatRatePercent };
    if (calcMode === 'batch') {
      return calculateBatchResult(batchItem, activeLogistics, rates);
    } else {
      return calculateSpecResult(specItems, activeLogistics, rates);
    }
  }, [calcMode, batchItem, specItems, logistics, rates, vatRatePercent]);

  // CSV File upload / quick import handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length > 0) {
        if (text.includes('Meter Weight') || text.includes('Quantity (bars)')) {
          handleSelectPreset(PRESETS[3]);
        } else if (text.includes('войлок') || text.includes('JINPENG') || text.includes('SHANXI')) {
          handleSelectPreset(PRESETS[0]);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activePresetId={activePreset.id}
        onSelectPreset={handleSelectPreset}
        onReset={handleReset}
        onOpenExportModal={() => {
          if (activeMainView === 'logistics' || activeMainView === 'matrix') {
            setIsLogisticsExportModalOpen(true);
          } else {
            setIsExportModalOpen(true);
          }
        }}
        onOpenTariffModal={() => setIsTariffModalOpen(true)}
        onOpenRateModal={() => setIsRateModalOpen(true)}
        onOpenPresetModal={() => setIsPresetModalOpen(true)}
        onOpenTnvedModal={() => setIsTnvedModalOpen(true)}
        rates={rates}
        presets={allPresets}
        activeView={activeMainView}
        onViewChange={setActiveMainView}
        quotesCount={quotes.length}
      />

      {/* Currency & Tax Bar */}
      <CurrencyBar
        rates={rates}
        onRatesChange={setRates}
        vatRatePercent={vatRatePercent}
        onVatChange={handleVatChange}
        onOpenRateModal={() => setIsRateModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* VIEW 1: VED / BATCH CALCULATOR */}
        {activeMainView === 'ved' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Preset Description & Mode Switcher */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{activePreset.name}</span>
                    {activePreset.isCustom && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                        Мой пресет
                      </span>
                    )}
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      Источник: {activePreset.sourceDoc}
                    </span>
                    {activeQuote && (
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        Доставка: {activeQuote.forwarderName} ({activeQuote.destination})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{activePreset.description}</p>
                </div>
              </div>

              {/* Preset Actions & Mode Switcher Tabs */}
              <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                <button
                  type="button"
                  id="btn-save-current-preset"
                  onClick={() => setIsPresetModalOpen(true)}
                  className="px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5"
                  title="Сохранить текущие параметры как новый пресет"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Сохранить пресет</span>
                </button>

                <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50 text-xs">
                  <button
                    type="button"
                    onClick={() => setCalcMode('batch')}
                    className={`px-3 py-1.5 font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                      calcMode === 'batch'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Рулоны / Контейнер (JINPENG)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcMode('spec')}
                    className={`px-3 py-1.5 font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                      calcMode === 'spec'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Спецификация (Профили)
                  </button>
                </div>

                {/* Quick Upload CSV */}
                <label className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer transition-colors text-xs flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Загрузить CSV</span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Configuration Section: Either Batch Configurator or Multi-Item Table */}
            {calcMode === 'batch' ? (
              <BatchConfigurator batch={batchItem} onChange={setBatchItem} />
            ) : (
              <MultiItemSpecTable items={specItems} onChange={setSpecItems} />
            )}

            {/* Logistics, Customs & Extra Costs Configuration */}
            <LogisticsCustomsPanel
              logistics={logistics}
              onChange={setLogistics}
              customsValueRub={calculationResult.customsValueRub}
              calculatedFee={calculationResult.customsFeeRub}
              feeTierLabel={calculationResult.customsFeeTierLabel}
              onOpenTariffModal={() => setIsTariffModalOpen(true)}
              activeHsCode={calcMode === 'batch' ? batchItem.hsCode : '7604210000'}
              onHsCodeChange={(code, duty) => {
                if (calcMode === 'batch') {
                  setBatchItem((b) => ({ ...b, hsCode: code }));
                }
              }}
              onOpenLogisticsComparison={() => setActiveMainView('logistics')}
              activeQuoteName={
                activeQuote
                  ? `${activeQuote.forwarderName} (${activeQuote.destination})`
                  : undefined
              }
              onAddNewQuote={() => setIsAddQuoteModalOpen(true)}
              onUploadExcelQuotes={handleUploadExcelQuotes}
              onOpenTnvedModal={() => setIsTnvedModalOpen(true)}
            />

            {/* Calculation Summary & Unit Economics */}
            <CalculationSummary
              result={calculationResult}
              isSpecMode={calcMode === 'spec'}
              vatRatePercent={vatRatePercent}
              rates={rates}
              hsCode={calcMode === 'batch' ? batchItem.hsCode : '7604210000'}
              dutyRatePercent={logistics.dutyRatePercent}
              onOpenTnvedModal={() => setIsTnvedModalOpen(true)}
            />

            {/* Informative Customs & Logistics Guide */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs text-xs text-slate-600 space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Info className="w-4 h-4 text-blue-600" />
                Справочник методики расчета таможенных платежей (ФТС РФ)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-800 block mb-1">
                    1. Таможенная стоимость
                  </span>
                  <p className="text-slate-500">
                    Определяется по методу по стоимости сделки с ввозимыми товарами: цена товара по контракту (инвойс) + международный фрахт до границы РФ + расходы на страхование.
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-800 block mb-1">
                    2. Пошлина и сбор 2026
                  </span>
                  <p className="text-slate-500">
                    Пошлина начисляется от таможенной стоимости по коду ТН ВЭД (12% для автовойлока, 10-12% для алюминия). Таможенный сбор взимается по фиксированной сетке от 1 231 ₽ до 73 860 ₽.
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-800 block mb-1">
                    3. НДС и себестоимость
                  </span>
                  <p className="text-slate-500">
                    База НДС = (Таможенная стоимость + Пошлина). Итоговая себестоимость единицы под ключ учитывает инвойс, фрахт, пошлину, сбор, НДС, автодоставку до склада и услуги брокера.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2 & 3: LOGISTICS CARRIER COMPARISON & SIDE-BY-SIDE MATRIX */}
        {(activeMainView === 'logistics' || activeMainView === 'matrix') && (
          <div className="animate-in fade-in duration-200">
            <LogisticsComparisonView
              quotes={quotes}
              rates={rates}
              activeBatch={batchItem}
              currentLogistics={logistics}
              activeQuoteId={activeQuoteId}
              onApplyQuote={handleApplyQuote}
              onAddQuote={handleAddQuote}
              onUpdateQuote={handleUpdateQuote}
              onDeleteQuote={handleDeleteQuote}
              onResetQuotes={handleResetQuotes}
              onImportQuotes={handleImportQuotes}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Калькулятор внешнеэкономической деятельности (ВЭД) и доставки из Китая • Тарифы ФТС РФ 2026
      </footer>

      {/* Modals */}
      <CustomsTariffModal
        isOpen={isTariffModalOpen}
        onClose={() => setIsTariffModalOpen(false)}
        currentCustomsValueRub={calculationResult.customsValueRub}
        onOpenTnvedModal={() => setIsTnvedModalOpen(true)}
      />

      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        result={calculationResult}
        batch={batchItem}
        specItems={specItems}
        isSpecMode={calcMode === 'spec'}
        rates={rates}
        logistics={logistics}
      />

      <ExportLogisticsModal
        isOpen={isLogisticsExportModalOpen}
        onClose={() => setIsLogisticsExportModalOpen(false)}
        quotes={quotes}
        rates={rates}
        batch={batchItem}
        currentLogistics={logistics}
        activeQuoteId={activeQuoteId}
      />

      <CurrencyRateModal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        currentRates={rates}
        onApplyRates={setRates}
        currentCalculationResult={calculationResult}
        invoiceCurrency={calcMode === 'batch' ? batchItem.currency : 'USD'}
        invoiceTotalCurrency={calculationResult.invoiceTotalCurrency}
      />

      <PresetManagerModal
        isOpen={isPresetModalOpen}
        onClose={() => {
          setIsPresetModalOpen(false);
          setAllPresets(getAllPresetsList());
        }}
        currentPresetId={activePreset.id}
        onSelectPreset={(p) => {
          setAllPresets(getAllPresetsList());
          handleSelectPreset(p);
        }}
        currentBatchItem={batchItem}
        currentSpecItems={specItems}
        currentCalcMode={calcMode}
        currentRates={rates}
        currentLogistics={logistics}
        currentVatRate={vatRatePercent}
      />

      <AddQuoteModal
        isOpen={isAddQuoteModalOpen}
        onClose={() => setIsAddQuoteModalOpen(false)}
        onSaveQuote={handleAddNewQuote}
      />

      <HelpManualModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <TnvedApiModal
        isOpen={isTnvedModalOpen}
        onClose={() => setIsTnvedModalOpen(false)}
        currentCode={calcMode === 'batch' ? batchItem.hsCode : '7604210000'}
        currentDutyRate={logistics.dutyRatePercent}
        onSelectCode={handleSelectTnvedItem}
        invoiceRub={calculationResult.invoiceTotalRub}
        freightRub={calculationResult.freightRub}
        insuranceRub={calculationResult.insuranceRub}
        rates={rates}
      />
    </div>
  );
}
