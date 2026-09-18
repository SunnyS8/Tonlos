import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Save,
  Trash2,
  FileSpreadsheet,
  Check,
  Download,
  Upload,
  Calendar,
  Layers,
  Sparkles,
  Copy,
  Clock,
  ArrowRight,
  Package,
} from 'lucide-react';
import { CalculationPreset, RollBatchItem, SpecLineItem, LogisticsCustomsSettings, CurrencyRates } from '../types';
import { formatMoney } from '../utils/calculator';
import {
  addCustomPreset,
  removeCustomPreset,
  getStoredCustomPresets,
  exportPresetsToJson,
  importPresetsFromJson,
} from '../utils/presetStorage';
import { PRESETS as FACTORY_PRESETS } from '../data/presets';

interface PresetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPresetId: string;
  onSelectPreset: (preset: CalculationPreset) => void;
  // Live current calculation state for saving
  currentBatchItem?: RollBatchItem;
  currentSpecItems?: SpecLineItem[];
  currentCalcMode: 'batch' | 'spec';
  currentRates: CurrencyRates;
  currentLogistics: LogisticsCustomsSettings;
  currentVatRate: number;
}

export const PresetManagerModal: React.FC<PresetManagerModalProps> = ({
  isOpen,
  onClose,
  currentPresetId,
  onSelectPreset,
  currentBatchItem,
  currentSpecItems,
  currentCalcMode,
  currentRates,
  currentLogistics,
  currentVatRate,
}) => {
  const [activeTab, setActiveTab] = useState<'save_new' | 'manage'>('save_new');

  // Form for new preset
  const [name, setName] = useState('');
  const [sourceDoc, setSourceDoc] = useState('');
  const [description, setDescription] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Stored presets state
  const [customPresets, setCustomPresets] = useState<CalculationPreset[]>(() => getStoredCustomPresets());
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const refreshCustomPresets = () => {
    setCustomPresets(getStoredCustomPresets());
  };

  const handleSaveCurrentAsPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Пожалуйста, укажите понятное название пресета');
      return;
    }

    const newPreset: CalculationPreset = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      sourceDoc: sourceDoc.trim() || 'Пользовательский расчет',
      category: currentCalcMode,
      description:
        description.trim() ||
        (currentCalcMode === 'batch'
          ? `${currentBatchItem?.productName || 'Товар'}: ${currentBatchItem?.boxCount} шт, цена ${currentBatchItem?.priceInCurrency} ${currentBatchItem?.currency}`
          : `Спецификация комплектующих: ${currentSpecItems?.length || 0} позиций`),
      rates: {
        usdRub: currentRates.usdRub,
        cnyRub: currentRates.cnyRub,
        rateDate: currentRates.rateDate,
        effectiveDate: currentRates.effectiveDate,
        isCbrOfficial: currentRates.isCbrOfficial,
      },
      logistics: {
        ...currentLogistics,
        vatRatePercent: currentVatRate,
      },
      batchItem: currentCalcMode === 'batch' && currentBatchItem ? { ...currentBatchItem } : undefined,
      specItems: currentCalcMode === 'spec' && currentSpecItems ? [...currentSpecItems] : undefined,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    addCustomPreset(newPreset);
    refreshCustomPresets();
    setSuccessMessage(`Пресет «${newPreset.name}» успешно сохранен!`);
    setName('');
    setSourceDoc('');
    setDescription('');
    setTimeout(() => {
      setSuccessMessage(null);
      onSelectPreset(newPreset);
      setActiveTab('manage');
    }, 1200);
  };

  const handleDeletePreset = (id: string, presetName: string) => {
    if (window.confirm(`Вы уверены, что хотите удалить пресет «${presetName}»?`)) {
      removeCustomPreset(id);
      refreshCustomPresets();
    }
  };

  const handleExportJson = () => {
    const jsonStr = exportPresetsToJson(customPresets);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `custom_presets_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      const res = importPresetsFromJson(content);
      if (res.success) {
        refreshCustomPresets();
        setSuccessMessage(`Импортировано пресетов: ${res.imported.length}`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(res.error || 'Ошибка при импорте файла');
        setTimeout(() => setErrorMessage(null), 4000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Пресеты расчета и шаблоны поставок
              </h2>
              <p className="text-xs text-slate-400">
                Создавайте свои шаблоны, меняйте условия, поставщиков и сохраняйте для быстрого выбора
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('save_new')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'save_new'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-4 h-4 text-blue-600" />
            Сохранить текущий расчет как пресет
          </button>
          <button
            onClick={() => {
              setActiveTab('manage');
              refreshCustomPresets();
            }}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'manage'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-slate-500" />
            Список всех пресетов ({customPresets.length + FACTORY_PRESETS.length})
            {customPresets.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-full text-[10px]">
                +{customPresets.length} своих
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <X className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'save_new' ? (
            <form onSubmit={handleSaveCurrentAsPreset} className="space-y-4">
              {/* Snapshot pill: What is currently active */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Параметры текущего расчета (будут зафиксированы в пресете):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Режим / Товар</span>
                    <span className="font-bold text-slate-900 truncate block">
                      {currentCalcMode === 'batch' ? currentBatchItem?.productName : 'Спецификация профилей'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {currentCalcMode === 'batch'
                        ? `${currentBatchItem?.boxCount} шт (${currentBatchItem?.containerType})`
                        : `${currentSpecItems?.length} позиций`}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Цена FOB</span>
                    <span className="font-bold text-slate-900 font-mono block">
                      {currentCalcMode === 'batch'
                        ? `${currentBatchItem?.priceInCurrency} ${currentBatchItem?.currency}`
                        : `$${currentSpecItems?.reduce((s, i) => s + (i.totalAmountUsd || 0), 0).toFixed(2)}`}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">включая все наценки</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Курсы валют</span>
                    <span className="font-semibold text-slate-800 font-mono block">
                      USD: {currentRates.usdRub} ₽
                    </span>
                    <span className="font-semibold text-slate-800 font-mono block text-[11px]">
                      CNY: {currentRates.cnyRub} ₽
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Фрахт и налоги</span>
                    <span className="font-semibold text-slate-800 block">
                      Фрахт: {currentLogistics.freightAmount} {currentLogistics.freightCurrency}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Пошлина: {currentLogistics.dutyRatePercent}% | НДС: {currentVatRate}%
                    </span>
                  </div>
                </div>

                {currentCalcMode === 'batch' && currentBatchItem?.competitors && currentBatchItem.competitors.length > 0 && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                    <span>
                      Сохраненные поставщики для сравнения ({currentBatchItem.competitors.length}):{' '}
                      <strong className="text-slate-800">
                        {currentBatchItem.competitors.map((c) => c.name).join(', ')}
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Form Inputs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Название нового пресета <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Например: Войлок 40HQ Jinpeng (цена +15%, Тонлос 683 ₽)"
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-blue-600 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Документ-источник / Номер КП
                  </label>
                  <input
                    type="text"
                    value={sourceDoc}
                    onChange={(e) => setSourceDoc(e.target.value)}
                    placeholder="Например: Quotation C2510034-2.1 / КП от 2026-09"
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Примечание / Описание условий
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Краткое описание параметров контейнера и логистики"
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-blue-600"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  Сохранить пресет
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* User Custom Presets Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Мои сохраненные пресеты ({customPresets.length})
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportJson}
                      disabled={customPresets.length === 0}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors flex items-center gap-1 disabled:opacity-50"
                      title="Выгрузить все свои пресеты в JSON-файл"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      Экспорт JSON
                    </button>
                    <label className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      Импорт JSON
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImportFile}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {customPresets.length === 0 ? (
                  <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center">
                    <p className="text-xs text-slate-600 mb-2">У вас пока нет созданных пресетов.</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('save_new')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 font-semibold rounded-lg text-xs border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Сохранить текущий расчет как первый пресет
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {customPresets.map((preset) => {
                      const isActive = preset.id === currentPresetId;
                      return (
                        <div
                          key={preset.id}
                          className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isActive
                              ? 'bg-blue-50/60 border-blue-300 ring-1 ring-blue-300'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{preset.name}</span>
                              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded">
                                Мой пресет
                              </span>
                              {preset.category === 'spec' ? (
                                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded">
                                  Спецификация
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 rounded">
                                  Контейнер
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                              {preset.description}
                            </p>
                            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-3">
                              <span>Документ: {preset.sourceDoc}</span>
                              {preset.createdAt && (
                                <span>Создан: {new Date(preset.createdAt).toLocaleDateString('ru-RU')}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                onSelectPreset(preset);
                                onClose();
                              }}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                                isActive
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700'
                              }`}
                            >
                              {isActive ? (
                                <>
                                  <Check className="w-3.5 h-3.5" /> Активен
                                </>
                              ) : (
                                <>
                                  Применить <ArrowRight className="w-3 h-3" />
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePreset(preset.id, preset.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Удалить пользовательский пресет"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Standard Factory Presets */}
              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-slate-400" />
                  Базовые системные пресеты (JINPENG & Спецификации)
                </h3>
                <div className="space-y-2">
                  {FACTORY_PRESETS.map((preset) => {
                    const isActive = preset.id === currentPresetId;
                    return (
                      <div
                        key={preset.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                          isActive
                            ? 'bg-blue-50/50 border-blue-300'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{preset.name}</span>
                            <span className="text-[10px] text-slate-500 font-medium">({preset.sourceDoc})</span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{preset.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectPreset(preset);
                            onClose();
                          }}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                            isActive
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-slate-300 hover:border-blue-500 text-slate-700'
                          }`}
                        >
                          {isActive ? 'Активен' : 'Выбрать'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
