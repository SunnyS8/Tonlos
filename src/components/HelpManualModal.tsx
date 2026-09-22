import React, { useState } from 'react';
import {
  X,
  BookOpen,
  CheckCircle2,
  DollarSign,
  Truck,
  Ship,
  ShieldAlert,
  Calculator,
  Download,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';

interface HelpManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpManualModal: React.FC<HelpManualModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'Шаг 1. Курсы валют и пресет товара',
      icon: DollarSign,
      color: 'bg-emerald-500',
      description:
        'На верхней панели автоматически загружаются официальные курсы ЦБ РФ (USD, CNY, EUR). Вы можете кликнуть по курсу, чтобы скорректировать его под курс конвертации вашего банка. В выпадающем меню пресетов можно выбрать готовый товар (например, стеклосетку 160 г/м²) или настроить свой.',
    },
    {
      step: 2,
      title: 'Шаг 2. Параметры партии (Инвойс и рулоны)',
      icon: Layers,
      color: 'bg-blue-500',
      description:
        'В левой колонке укажите: количество рулонов/коробок в контейнере (например, 700 шт), размеры рулона (ширина 1 м × намотка 50 м = 50 м²), вес нетто партии и цену по инвойсу поставщика (в $ или ¥). Калькулятор сразу посчитает общую площадь и вес партии.',
    },
    {
      step: 3,
      title: 'Шаг 3. Логистика и выбор маршрута',
      icon: Ship,
      color: 'bg-indigo-500',
      description:
        'В блоке логистики выберите один из 4 быстрых маршрутов (ИГЛ Серпухов, Галеос Ставрополь, Дельпорте, Прямой поезд) или введите фрахт вручную. Если хотите сравнить все 9 тарифов экспедиторов с детализацией по плечам — перейдите во вкладку «Тарифы перевозчиков» в шапке.',
    },
    {
      step: 4,
      title: 'Шаг 4. Таможня и сборы ФТС РФ (2026)',
      icon: ShieldAlert,
      color: 'bg-amber-500',
      description:
        'Проверьте ставку пошлины (по умолчанию 6.5% для стеклосетки, код ТН ВЭД 7019 61 000 0). НДС 22% начисляется автоматически на сумму таможенной стоимости и пошлины. Таможенный сбор ФТС 2026 рассчитывается строго по официальной государственной сетке.',
    },
    {
      step: 5,
      title: 'Шаг 5. Анализ себестоимости и выгоды',
      icon: Calculator,
      color: 'bg-violet-500',
      description:
        'В правой закрепленной колонке вы мгновенно видите результат: себестоимость 1 м² (с НДС и без), себестоимость 1 рулона, общие таможенные платежи и полную стоимость контейнера под ключ. Раскройте спойлер конкурентов, чтобы увидеть чистую экономию по сравнению с покупкой у оптовиков в РФ.',
    },
    {
      step: 6,
      title: 'Шаг 6. Экспорт и печать отчетов',
      icon: FileSpreadsheet,
      color: 'bg-teal-500',
      description:
        'Нажмите «Экспорт отчета» в шапке или в блоке тарифов. Доступны: выгрузка подробной книги в Excel (.xlsx), CSV для учета, копирование в буфер для Google Таблиц и готовый печатный бланк коммерческого предложения / спецификации.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-snug">
                Руководство пользователя: Калькулятор себестоимости импорта (Китай ➔ РФ)
              </h3>
              <p className="text-[11px] text-slate-400">
                Пошаговая инструкция по расчету партии под ключ с учетом доставки, пошлин и НДС 2026
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

        {/* Quick Stepper Navigation */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 overflow-x-auto flex items-center gap-2">
          {steps.map((s) => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                activeStep === s.step
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{s.step}. {s.title.split('.')[1] || s.title}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs sm:text-sm">
          {(() => {
            const current = steps.find((s) => s.step === activeStep) || steps[0];
            const Icon = current.icon;
            return (
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3.5">
                <div className={`w-9 h-9 rounded-lg ${current.color} text-white flex items-center justify-center shrink-0 shadow-2xs`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{current.title}</h4>
                  <p className="text-slate-600 mt-1 leading-relaxed text-xs sm:text-sm">
                    {current.description}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Detailed Reference Cards */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider text-slate-500">
              Основные разделы и формулы калькулятора
            </h4>

            {/* Formula 1: Customs Value */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>1. Как формируется таможенная стоимость?</span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                По законодательству ЕАЭС/ФТС: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800">Таможенная стоимость = Стоимость инвойса (по курсу ЦБ) + Морской фрахт до границы РФ</code>. 
                Внутренняя доставка по территории РФ (Ж/Д тариф и автовывоз со станции до вашего склада) <strong>не облагается</strong> таможенной пошлиной, а включается в себестоимость на этапе внутрироссийской логистики.
              </p>
            </div>

            {/* Formula 2: Customs Duty & VAT */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>2. Расчет пошлины и НДС 22%</span>
              </div>
              <ul className="text-slate-600 text-xs space-y-1 pl-6 list-disc">
                <li><strong>Ввозная пошлина</strong> = Таможенная стоимость × 6.5% (для стеклосетки фасадной ТН ВЭД 7019 61 000 0).</li>
                <li><strong>НДС 22%</strong> = (Таможенная стоимость + Пошлина) × 22%. Этот НДС уплачивается на таможне и принимается к вычету юридическими лицами на ОСНО.</li>
                <li><strong>Таможенный сбор ФТС 2026</strong> = фиксированная сумма по шкале Правительства РФ в зависимости от общей стоимости партии.</li>
              </ul>
            </div>

            {/* Formula 3: Unit Economics */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>3. Себестоимость единицы продукции (Unit Economics)</span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                Итоговая себестоимость под ключ складывается из: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800">Инвойс + Все плечи доставки + Пошлина + НДС 22% + Сбор ФТС + Брокер и терминал</code>. 
                Делением этой суммы на общую площадь контейнера получается точная <strong>себестоимость за 1 м²</strong>, а делением на число рулонов — <strong>себестоимость 1 рулона</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Шаг {activeStep} из {steps.length}
          </div>
          <div className="flex items-center gap-2">
            {activeStep > 1 && (
              <button
                onClick={() => setActiveStep(activeStep - 1)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
              >
                Назад
              </button>
            )}
            {activeStep < steps.length ? (
              <button
                onClick={() => setActiveStep(activeStep + 1)}
                className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-1 shadow-xs"
              >
                <span>Далее</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition shadow-xs"
              >
                Понятно, к калькулятору
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
