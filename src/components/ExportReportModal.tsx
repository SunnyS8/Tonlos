import React, { useState } from 'react';
import { X, Download, Copy, Printer, Check, FileSpreadsheet } from 'lucide-react';
import { CalculationResult, RollBatchItem, SpecLineItem, LogisticsCustomsSettings, CurrencyRates } from '../types';
import { formatMoney } from '../utils/calculator';
import { formatYMDToRu } from '../utils/cbrService';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CalculationResult;
  batch?: RollBatchItem;
  specItems?: SpecLineItem[];
  isSpecMode: boolean;
  rates: CurrencyRates;
  logistics: LogisticsCustomsSettings;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  result,
  batch,
  specItems,
  isSpecMode,
  rates,
  logistics,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    let csvContent = 'Показатель;Значение;Валюта/Ед.изм\n';
    csvContent += `Дата расчета;${new Date().toLocaleDateString('ru-RU')};\n`;
    if (rates.rateDate) {
      csvContent += `Дата курса валют (ЦБ РФ);${formatYMDToRu(rates.rateDate)};\n`;
      if (rates.isWeekendShifted && rates.effectiveDate) {
        csvContent += `Фактическая дата котировки ЦБ;${formatYMDToRu(rates.effectiveDate)};\n`;
      }
    }
    csvContent += `Курс USD/RUB;${rates.usdRub};руб\n`;
    csvContent += `Курс CNY/RUB;${rates.cnyRub};руб\n`;
    csvContent += `Фактурная стоимость товара (инвойс);${result.invoiceTotalRub.toFixed(2)};руб\n`;
    csvContent += `Международный фрахт;${result.freightRub.toFixed(2)};руб\n`;
    csvContent += `Таможенная стоимость (база);${result.customsValueRub.toFixed(2)};руб\n`;
    csvContent += `Таможенная пошлина;${result.customsDutyRub.toFixed(2)};руб\n`;
    csvContent += `Таможенный сбор (2026);${result.customsFeeRub.toFixed(2)};руб\n`;
    csvContent += `НДС на таможне (${logistics.vatRatePercent}%);${result.customsVatRub.toFixed(2)};руб\n`;
    csvContent += `Доставка по РФ;${result.inlandDeliveryRub.toFixed(2)};руб\n`;
    csvContent += `Прочие расходы (брокер, СВХ);${result.otherExpensesRub.toFixed(2)};руб\n`;
    csvContent += `ИТОГО СТОИМОСТЬ ПОД КЛЮЧ;${result.grandTotalRub.toFixed(2)};руб\n`;
    csvContent += `ИТОГО в USD;${result.grandTotalUsd.toFixed(2)};$\n`;
    csvContent += `Количество в партии;${result.totalQuantity};шт\n`;
    csvContent += `Вес партии нетто;${result.totalNetWeightKg};кг\n`;
    csvContent += `Себестоимость 1 шт с НДС;${result.costPerPieceRubWithVat.toFixed(2)};руб\n`;
    csvContent += `Себестоимость 1 кг с НДС;${result.costPerKgRubWithVat.toFixed(2)};руб\n`;
    if (result.totalAreaM2 > 0) {
      csvContent += `Себестоимость 1 м2 с НДС;${result.costPerM2RubWithVat.toFixed(2)};руб\n`;
      if (result.competitorPricePerM2Rub) {
        csvContent += `Цена аналога в РФ (Тонлос);${result.competitorPricePerM2Rub.toFixed(2)};руб\n`;
        csvContent += `Экономия на контейнере;${result.savingsTotalRub?.toFixed(2)};руб\n`;
      }
    }

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `расчет_доставки_китай_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySummary = () => {
    const rateDateStr = rates.rateDate
      ? `на дату ${formatYMDToRu(rates.rateDate)}${rates.isCbrOfficial ? ' (ЦБ РФ)' : ''}`
      : 'расчетный';
    const text = `РАСЧЕТ СЕБЕСТОИМОСТИ ДОСТАВКИ ИЗ КИТАЯ
Товар: ${!isSpecMode ? batch?.productName : 'Спецификация комплектующих'}
Партия: ${result.totalQuantity} шт, вес нетто: ${result.totalNetWeightKg} кг ${
      result.totalAreaM2 > 0 ? `, площадь: ${result.totalAreaM2} м²` : ''
    }
Курсы валют (${rateDateStr}): USD = ${rates.usdRub} ₽, CNY = ${rates.cnyRub} ₽

Фактурная стоимость: ${formatMoney(result.invoiceTotalRub, 'RUB', 2)}
Фрахт: ${formatMoney(result.freightRub, 'RUB', 2)}
Таможенная стоимость: ${formatMoney(result.customsValueRub, 'RUB', 2)}
Таможенная пошлина: ${formatMoney(result.customsDutyRub, 'RUB', 2)}
Таможенный сбор (2026): ${formatMoney(result.customsFeeRub, 'RUB', 2)}
НДС (${logistics.vatRatePercent}%): ${formatMoney(result.customsVatRub, 'RUB', 2)}
Доставка по РФ + Прочие: ${formatMoney(result.inlandDeliveryRub + result.otherExpensesRub, 'RUB', 2)}

ИТОГО ПОД КЛЮЧ: ${formatMoney(result.grandTotalRub, 'RUB', 2)} (${formatMoney(result.grandTotalUsd, 'USD', 2)})
Себестоимость за 1 шт: ${formatMoney(result.costPerPieceRubWithVat, 'RUB', 2)} с НДС
Себестоимость за 1 кг: ${formatMoney(result.costPerKgRubWithVat, 'RUB', 2)} с НДС
${
  result.totalAreaM2 > 0
    ? `Себестоимость за 1 м²: ${formatMoney(result.costPerM2RubWithVat, 'RUB', 2)} с НДС`
    : ''
}
${
  result.savingsTotalRub && result.savingsTotalRub > 0
    ? `Экономия по сравнению с РФ (${batch?.targetCompetitorName || 'Тонлос'}): ${formatMoney(
        result.savingsTotalRub,
        'RUB',
        0
      )} (${result.differencePercent?.toFixed(2)}%)`
    : ''
}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">Экспорт коммерческого расчета / Отчет</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Готовый отчет для согласования с руководством и бухгалтерией
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Скопировано!' : 'Копировать текст'}
            </button>
            <button
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Скачать CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Печать / В PDF
            </button>
          </div>
        </div>

        {/* Report Content Preview */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 font-sans print:p-0">
          {/* Company / Document Title */}
          <div className="border-b pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  КОММЕРЧЕСКИЙ РАСЧЕТ ИМПОРТНОЙ ПОСТАВКИ ИЗ КИТАЯ
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Калькуляция полной себестоимости партии на базисе FOB / DDP склад в РФ
                </p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <div>Дата расчета: {new Date().toLocaleDateString('ru-RU')}</div>
                <div className="font-mono text-slate-700">
                  USD = {rates.usdRub} ₽ | CNY = {rates.cnyRub} ₽
                </div>
                {rates.rateDate && (
                  <div className="text-[10px] text-blue-600 mt-0.5">
                    {rates.isCbrOfficial ? 'Курс ЦБ РФ на ' : 'Курс на дату: '}
                    {formatYMDToRu(rates.rateDate)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Supplier & Product Info */}
          <div className="bg-slate-50 rounded-lg p-3.5 text-xs grid grid-cols-2 gap-3 border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Товар:</span>
              <span className="font-bold text-slate-900">
                {!isSpecMode ? batch?.productName : 'Партия профилей (8 позиций)'}
              </span>
              <p className="text-slate-500 mt-0.5">
                {!isSpecMode ? batch?.description : 'Алюминиевый сплав, обработанные профили'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Поставщик:</span>
              <span className="font-bold text-slate-900">
                {!isSpecMode ? batch?.supplier : 'SHANXI XINCONGBANG / JINPENG'}
              </span>
              <p className="text-slate-500 mt-0.5">
                Инвойс: {!isSpecMode ? batch?.invoiceNo : 'SPEC-2026'} (FOB Tianjin, China)
              </p>
            </div>
          </div>

          {/* Key Metrics Summary Table */}
          <table className="w-full text-xs text-left border border-slate-200">
            <thead className="bg-slate-100 font-bold uppercase text-[10px] text-slate-700">
              <tr>
                <th className="py-2 px-3 border-b">Статья расходов</th>
                <th className="py-2 px-3 border-b text-right">Сумма в валюте</th>
                <th className="py-2 px-3 border-b text-right">Сумма в рублях</th>
                <th className="py-2 px-3 border-b text-right">Доля в себестоимости</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              <tr>
                <td className="py-2 px-3 font-sans">1. Фактурная стоимость товара</td>
                <td className="py-2 px-3 text-right">
                  {result.invoiceCurrency === 'CNY'
                    ? `${result.invoiceTotalCurrency.toLocaleString('ru-RU')} ¥`
                    : `$${result.invoiceTotalCurrency.toLocaleString('ru-RU')}`}
                </td>
                <td className="py-2 px-3 text-right font-semibold">
                  {formatMoney(result.invoiceTotalRub, 'RUB', 2)}
                </td>
                <td className="py-2 px-3 text-right font-sans">
                  {((result.invoiceTotalRub / result.grandTotalRub) * 100).toFixed(1)}%
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans">2. Международный фрахт</td>
                <td className="py-2 px-3 text-right">${result.freightUsd.toLocaleString('ru-RU')}</td>
                <td className="py-2 px-3 text-right font-semibold">
                  {formatMoney(result.freightRub, 'RUB', 2)}
                </td>
                <td className="py-2 px-3 text-right font-sans">
                  {((result.freightRub / result.grandTotalRub) * 100).toFixed(1)}%
                </td>
              </tr>
              <tr className="bg-slate-50 font-bold">
                <td className="py-2 px-3 font-sans">3. Таможенная стоимость (база)</td>
                <td className="py-2 px-3 text-right">${result.customsValueUsd.toFixed(2)}</td>
                <td className="py-2 px-3 text-right text-blue-900">
                  {formatMoney(result.customsValueRub, 'RUB', 2)}
                </td>
                <td className="py-2 px-3 text-right font-sans">—</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans">4. Таможенная пошлина ({logistics.dutyRatePercent}%)</td>
                <td className="py-2 px-3 text-right">${result.customsDutyUsd.toFixed(2)}</td>
                <td className="py-2 px-3 text-right font-semibold">
                  {formatMoney(result.customsDutyRub, 'RUB', 2)}
                </td>
                <td className="py-2 px-3 text-right font-sans">
                  {((result.customsDutyRub / result.grandTotalRub) * 100).toFixed(1)}%
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans">5. Таможенный сбор (2026)</td>
                <td className="py-2 px-3 text-right">—</td>
                <td className="py-2 px-3 text-right font-semibold">
                  {formatMoney(result.customsFeeRub, 'RUB', 2)}
                </td>
                <td className="py-2 px-3 text-right font-sans">
                  {((result.customsFeeRub / result.grandTotalRub) * 100).toFixed(1)}%
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans">6. НДС на таможне ({logistics.vatRatePercent}%)</td>
                <td className="py-2 px-3 text-right">${result.customsVatUsd.toFixed(2)}</td>
                <td className="py-2 px-3 text-right font-semibold">
                  {formatMoney(result.customsVatRub, 'RUB', 2)}
                </td>
                <td className="py-2 px-3 text-right font-sans">
                  {((result.customsVatRub / result.grandTotalRub) * 100).toFixed(1)}%
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans">7. Доставка по РФ (склад)</td>
                <td className="py-2 px-3 text-right">—</td>
                <td className="py-2 px-3 text-right font-semibold">
                  {formatMoney(result.inlandDeliveryRub, 'RUB', 2)}
                </td>
                <td className="py-2 px-3 text-right font-sans">
                  {((result.inlandDeliveryRub / result.grandTotalRub) * 100).toFixed(1)}%
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans">8. Прочие расходы (СВХ, брокер)</td>
                <td className="py-2 px-3 text-right">—</td>
                <td className="py-2 px-3 text-right font-semibold">
                  {formatMoney(result.otherExpensesRub, 'RUB', 2)}
                </td>
                <td className="py-2 px-3 text-right font-sans">
                  {((result.otherExpensesRub / result.grandTotalRub) * 100).toFixed(1)}%
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-900 text-white font-bold font-mono">
              <tr>
                <td className="py-3 px-3 font-sans text-sm">ИТОГО ЗАТРАТЫ ПОД КЛЮЧ:</td>
                <td className="py-3 px-3 text-right text-emerald-300">
                  ${result.grandTotalUsd.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right text-base text-emerald-400">
                  {formatMoney(result.grandTotalRub, 'RUB', 2)}
                </td>
                <td className="py-3 px-3 text-right font-sans text-slate-300">100.0%</td>
              </tr>
            </tfoot>
          </table>

          {/* Unit Economics Highlight */}
          <div className="grid grid-cols-3 gap-3 text-center bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Себестоимость 1 шт с НДС:</span>
              <span className="text-base font-bold font-mono text-slate-900">
                {formatMoney(result.costPerPieceRubWithVat, 'RUB', 2)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Себестоимость 1 кг с НДС:</span>
              <span className="text-base font-bold font-mono text-slate-900">
                {formatMoney(result.costPerKgRubWithVat, 'RUB', 2)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Себестоимость 1 м² с НДС:</span>
              <span className="text-base font-bold font-mono text-emerald-800">
                {result.costPerM2RubWithVat > 0
                  ? formatMoney(result.costPerM2RubWithVat, 'RUB', 2)
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
