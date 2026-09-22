import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Printer,
  Check,
  FileSpreadsheet,
  Ship,
  MapPin,
  Clock,
  Award,
  Zap,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { ForwarderQuote, DestinationWarehouse } from '../../types/logistics';
import { CurrencyRates, RollBatchItem, LogisticsCustomsSettings } from '../../types';
import {
  calculateQuoteCost,
  calculateBatchLogisticsImpacts,
  downloadQuotesExcel,
  downloadQuotesCsv,
  exportQuotesToTsv,
  generateQuotesTextReport,
  getRouteTypeLabel,
} from '../../utils/logisticsCalculator';
import { formatRub, formatUsd } from '../../utils/calculator';
import { formatYMDToRu } from '../../utils/cbrService';

interface ExportLogisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotes: ForwarderQuote[];
  rates: CurrencyRates;
  batch?: RollBatchItem;
  currentLogistics: LogisticsCustomsSettings;
  activeQuoteId?: string;
}

export const ExportLogisticsModal: React.FC<ExportLogisticsModalProps> = ({
  isOpen,
  onClose,
  quotes,
  rates,
  batch,
  currentLogistics,
  activeQuoteId,
}) => {
  const [filterDest, setFilterDest] = useState<'ALL' | DestinationWarehouse>('ALL');
  const [copiedFormat, setCopiedFormat] = useState<'tsv' | 'text' | null>(null);
  const [activeTab, setActiveTab] = useState<'table' | 'text'>('table');

  if (!isOpen) return null;

  const filteredQuotes =
    filterDest === 'ALL'
      ? quotes
      : quotes.filter((q) => q.destination === filterDest);

  const impacts = batch
    ? calculateBatchLogisticsImpacts(
        filteredQuotes,
        batch,
        rates,
        currentLogistics,
        activeQuoteId
      )
    : [];

  // Summary Metrics
  const cheapest = impacts.length > 0
    ? [...impacts].sort((a, b) => a.calc.totalRub - b.calc.totalRub)[0]
    : null;

  const fastest = impacts.length > 0
    ? [...impacts].sort((a, b) => a.quote.transitDaysMin - b.quote.transitDaysMin)[0]
    : null;

  const prices = impacts.map((im) => im.costPerM2Rub);
  const minM2 = prices.length > 0 ? Math.min(...prices) : 0;
  const maxM2 = prices.length > 0 ? Math.max(...prices) : 0;
  const spreadM2 = maxM2 - minM2;

  const handleDownloadXlsx = () => {
    downloadQuotesExcel(
      filteredQuotes,
      rates,
      batch,
      currentLogistics,
      `Тарифы_перевозчиков_${filterDest !== 'ALL' ? filterDest + '_' : ''}${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`
    );
  };

  const handleDownloadCsv = () => {
    downloadQuotesCsv(
      filteredQuotes,
      rates,
      batch,
      currentLogistics,
      `Тарифы_перевозчиков_${filterDest !== 'ALL' ? filterDest + '_' : ''}${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );
  };

  const handleCopyTsv = () => {
    const tsv = exportQuotesToTsv(filteredQuotes, rates, batch, currentLogistics);
    navigator.clipboard.writeText(tsv);
    setCopiedFormat('tsv');
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const handleCopyText = () => {
    const text = generateQuotesTextReport(
      filteredQuotes,
      rates,
      batch,
      currentLogistics
    );
    navigator.clipboard.writeText(text);
    setCopiedFormat('text');
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-snug">
                Экспорт тарифов перевозчиков и маршрутов доставки
              </h3>
              <p className="text-[11px] text-slate-400">
                Сравнительная ведомость предложений экспедиторов (ИГЛ, Галеос, Дельпорте)
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

        {/* Toolbar & Filter Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Destination & Format Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white text-xs">
              <button
                onClick={() => setFilterDest('ALL')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  filterDest === 'ALL'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Все склады ({quotes.length})
              </button>
              <button
                onClick={() => setFilterDest('Серпухов')}
                className={`px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1 ${
                  filterDest === 'Серпухов'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapPin className="w-3 h-3" />
                Серпухов ({quotes.filter((q) => q.destination === 'Серпухов').length})
              </button>
              <button
                onClick={() => setFilterDest('Ставрополь')}
                className={`px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1 ${
                  filterDest === 'Ставрополь'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapPin className="w-3 h-3" />
                Ставрополь ({quotes.filter((q) => q.destination === 'Ставрополь').length})
              </button>
            </div>

            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white text-xs">
              <button
                onClick={() => setActiveTab('table')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  activeTab === 'table'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Таблица
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  activeTab === 'text'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Текст отчета
              </button>
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyTsv}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Скопировать таблицу для быстрой вставки в Google Таблицы или Excel"
            >
              {copiedFormat === 'tsv' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedFormat === 'tsv' ? 'Скопировано!' : 'В буфер (Sheets/Excel)'}</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              onClick={handleDownloadXlsx}
              className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Скачать Excel (.xlsx)</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Печать</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 font-sans print:p-0">
          {/* Document Header (For print and export reference) */}
          <div className="border-b border-slate-200 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                  Аналитический отчет логистики
                </span>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                  СВОДНАЯ ВЕДОМОСТЬ СТАВОК ЭКСПЕДИТОРОВ (КИТАЙ ➔ РФ)
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Маршруты: море через Владивосток (ВВО) + Ж/Д, прямой поезд, Deep Sea Новороссийск
                </p>
              </div>

              <div className="text-left sm:text-right text-xs text-slate-500 bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                <div>Дата формирования: {new Date().toLocaleDateString('ru-RU')}</div>
                <div className="font-mono text-slate-700 font-medium">
                  Курс USD = {rates.usdRub} ₽ | CNY = {rates.cnyRub} ₽
                </div>
                {rates.rateDate && (
                  <div className="text-[10px] text-blue-600">
                    {rates.isCbrOfficial ? 'Официальный курс ЦБ РФ на ' : 'Курс на: '}
                    {formatYMDToRu(rates.rateDate)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Analytical KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                Всего котировок
              </span>
              <div className="text-xl font-mono font-bold text-slate-900 mt-0.5">
                {filteredQuotes.length}
              </div>
              <span className="text-[11px] text-slate-500">
                в направлении {filterDest === 'ALL' ? 'всех складов' : filterDest}
              </span>
            </div>

            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
              <div className="flex items-center gap-1 text-[10px] text-emerald-800 uppercase font-semibold">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                Лучшая цена логистики
              </div>
              <div className="text-xl font-mono font-black text-emerald-700 mt-0.5">
                {cheapest ? formatRub(cheapest.calc.totalRub) : '—'}
              </div>
              <span className="text-[11px] text-emerald-800">
                {cheapest
                  ? `${cheapest.quote.forwarderName} (${cheapest.quote.destination})`
                  : ''}
              </span>
            </div>

            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
              <div className="flex items-center gap-1 text-[10px] text-amber-800 uppercase font-semibold">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                Самый быстрый транзит
              </div>
              <div className="text-xl font-mono font-black text-amber-800 mt-0.5">
                {fastest ? `${fastest.quote.transitDaysMin}–${fastest.quote.transitDaysMax} дн.` : '—'}
              </div>
              <span className="text-[11px] text-amber-800">
                {fastest ? `${fastest.quote.forwarderName} (${fastest.quote.transitHub})` : ''}
              </span>
            </div>

            <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
              <div className="flex items-center gap-1 text-[10px] text-blue-800 uppercase font-semibold">
                <TrendingDown className="w-3.5 h-3.5 text-blue-600" />
                Разброс себестоимости
              </div>
              <div className="text-xl font-mono font-black text-blue-800 mt-0.5">
                {spreadM2 > 0 ? `±${spreadM2.toFixed(1)} ₽/м²` : '0 ₽'}
              </div>
              <span className="text-[11px] text-blue-700">
                от {minM2.toFixed(1)} до {maxM2.toFixed(1)} ₽/м²
              </span>
            </div>
          </div>

          {/* Batch Context (If Available) */}
          {batch && (
            <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block font-semibold">
                    Расчетная партия для оценки себестоимости:
                  </span>
                  <span className="font-bold text-slate-900">
                    {batch.productName} ({batch.boxCount} шт.,{' '}
                    {(
                      (batch.boxCount || 0) * (batch.areaPerPieceM2 || 0)
                    ).toLocaleString('ru-RU')}{' '}
                    м², {batch.totalNetWeightKg?.toLocaleString('ru-RU')} кг)
                  </span>
                </div>
                <div className="text-slate-600">
                  Инвойс: <strong className="font-mono">{batch.priceInCurrency} {batch.currency}/ед.</strong> • ТН ВЭД: <strong className="font-mono">{batch.hsCode}</strong>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 1: TABLE PREVIEW ================= */}
          {activeTab === 'table' && (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Экспедитор</th>
                      <th className="py-2.5 px-2">Склад</th>
                      <th className="py-2.5 px-2">Маршрут / Плечи</th>
                      <th className="py-2.5 px-2">Срок</th>
                      <th className="py-2.5 px-2 text-right">Фрахт ($)</th>
                      <th className="py-2.5 px-2 text-right">Ж/Д (₽)</th>
                      <th className="py-2.5 px-2 text-right">Авто (₽)</th>
                      <th className="py-2.5 px-2 text-right">СВХ/Экспед. (₽)</th>
                      <th className="py-2.5 px-3 text-right font-black bg-slate-200/50">Итого логистика (₽)</th>
                      {batch && (
                        <>
                          <th className="py-2.5 px-3 text-right font-black text-blue-900 bg-blue-50">
                            Себест. 1 м²
                          </th>
                          <th className="py-2.5 px-3 text-right font-black text-slate-900">
                            Партия под ключ
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {impacts.map((im, i) => {
                      const isCheapest = im.isCheapestPrice;
                      const isFastestTransit = im.isFastest;

                      return (
                        <tr
                          key={im.quote.id}
                          className={`hover:bg-slate-50/80 transition ${
                            isCheapest ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-sans">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{im.quote.forwarderName}</span>
                              {isCheapest && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 font-sans">
                                  ТОП ЦЕНА
                                </span>
                              )}
                              {isFastestTransit && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 font-sans">
                                  БЫСТРО
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {im.quote.containerSize}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 font-sans">
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                im.quote.destination === 'Серпухов'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}
                            >
                              {im.quote.destination}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 font-sans text-[11px] text-slate-600 max-w-xs">
                            <div className="truncate">
                              {im.quote.originPort} ➔ {im.quote.transitHub} ➔ {im.quote.destination}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {getRouteTypeLabel(im.quote.routeType)}
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-[11px] text-slate-700 whitespace-nowrap">
                            {im.quote.transitDaysMin}–{im.quote.transitDaysMax} дн.
                          </td>
                          <td className="py-2.5 px-2 text-right text-slate-700 font-medium">
                            {formatUsd(im.calc.oceanFreightUsd)}
                          </td>
                          <td className="py-2.5 px-2 text-right text-slate-600">
                            {im.calc.railFreightRub > 0 ? formatRub(im.calc.railFreightRub) : '—'}
                          </td>
                          <td className="py-2.5 px-2 text-right text-slate-600">
                            {im.calc.truckDeliveryRub > 0 ? formatRub(im.calc.truckDeliveryRub) : '—'}
                          </td>
                          <td className="py-2.5 px-2 text-right text-slate-500 text-[11px]">
                            {formatRub(
                              im.calc.terminalExpensesRub +
                                im.calc.forwarderFeeRub +
                                im.calc.overweightRub
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-slate-900 bg-slate-50">
                            <div>{formatRub(im.calc.totalRub)}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              ({formatUsd(im.calc.totalUsd)})
                            </div>
                          </td>
                          {batch && (
                            <>
                              <td className="py-2.5 px-3 text-right font-bold text-blue-700 bg-blue-50/50">
                                {im.costPerM2Rub.toFixed(2)} ₽
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                {formatRub(im.totalCostRub)}
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 2: TEXT REPORT PREVIEW ================= */}
          {activeTab === 'text' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">
                  Текстовый шаблон для отправки в мессенджеры (Telegram, WhatsApp) или Email:
                </span>
                <button
                  onClick={handleCopyText}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition flex items-center gap-1"
                >
                  {copiedFormat === 'text' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedFormat === 'text' ? 'Скопировано!' : 'Копировать весь текст'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-96">
                {generateQuotesTextReport(filteredQuotes, rates, batch, currentLogistics)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
