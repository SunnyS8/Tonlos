import React, { useState } from 'react';
import {
  Ship,
  Train,
  Truck,
  MapPin,
  Clock,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Zap,
  Info,
  DollarSign,
} from 'lucide-react';

export const RouteVisualMap: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'serpukhov' | 'stavropol'>('serpukhov');

  return (
    <div className="space-y-6">
      {/* Route Selector Tabs */}
      <div className="flex bg-slate-200/70 p-1 rounded-xl max-w-md">
        <button
          onClick={() => setActiveTab('serpukhov')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'serpukhov'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          Склад Серпухов (Моск. обл.)
        </button>
        <button
          onClick={() => setActiveTab('stavropol')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'stavropol'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
          Склад Ставрополь (СКФО/ЮФО)
        </button>
      </div>

      {/* Content for Serpukhov */}
      {activeTab === 'serpukhov' && (
        <div className="space-y-4">
          {/* Variant 1: Multimodal via Vladivostok */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                  <Layers className="w-3 h-3" /> Вариант 1 (Основной)
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">
                  Мультимодал: Море через Владивосток + Ж/Д Москва + Автовывоз Серпухов
                </h4>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>35–45 дней в пути</span>
              </div>
            </div>

            {/* Stepper */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-blue-700 mb-1">
                  <Ship className="w-3.5 h-3.5" /> 1. Морской фрахт
                </div>
                <div className="font-semibold text-slate-900">Шанхай / Нинбо ➔ Владивосток</div>
                <div className="text-slate-500 text-[11px] mt-1">~5–8 дней. Фрахт: $4,550 – $4,700</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-700 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 2. Таможня (ВВО)
                </div>
                <div className="font-semibold text-slate-900">Владивостокский морской торговый порт</div>
                <div className="text-slate-500 text-[11px] mt-1">Растаможка, выпуск ГТД, погрузка на платформу</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-indigo-700 mb-1">
                  <Train className="w-3.5 h-3.5" /> 3. Ж/Д платформа
                </div>
                <div className="font-semibold text-slate-900">Владивосток ➔ Москва (Ворсино / Белый Раст)</div>
                <div className="text-slate-500 text-[11px] mt-1">~12–15 дней. Тариф: 330 000 – 375 000 ₽</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-700 mb-1">
                  <Truck className="w-3.5 h-3.5" /> 4. Автовывоз
                </div>
                <div className="font-semibold text-slate-900">Москва ➔ Серпухов (склад)</div>
                <div className="text-slate-500 text-[11px] mt-1">1–2 дня. Контейнеровоз: 78 000 ₽</div>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 flex items-center justify-between">
              <span>Экспедиторы на маршруте: <strong>ИГЛ</strong>, <strong>Дельпорте</strong></span>
              <span className="font-bold text-blue-900">Оптимальный баланс стоимости и регулярности отправок</span>
            </div>
          </div>

          {/* Variant 2: Direct Rail */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                  <Zap className="w-3 h-3" /> Вариант 2 (Экспресс)
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">
                  Прямое Ж/Д из Китая (через Забайкальск/Маньчжурию) + Авто Серпухов
                </h4>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>22–28 дней (Быстрее на ~14 дней)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-700 mb-1">
                  <Train className="w-3.5 h-3.5" /> 1. Прямой поезд
                </div>
                <div className="font-semibold text-slate-900">Шанхай / Циндао ➔ Забайкальск</div>
                <div className="text-slate-500 text-[11px] mt-1">Погрузка сразу на Ж/Д без морского плеча</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-indigo-700 mb-1">
                  <Train className="w-3.5 h-3.5" /> 2. Транзит по РФ
                </div>
                <div className="font-semibold text-slate-900">Забайкальск ➔ Ворсино (Москва)</div>
                <div className="text-slate-500 text-[11px] mt-1">Единая ставка: ~$11,250 – $11,400</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-700 mb-1">
                  <Truck className="w-3.5 h-3.5" /> 3. Автодоставка
                </div>
                <div className="font-semibold text-slate-900">Ворсино ➔ Серпухов</div>
                <div className="text-slate-500 text-[11px] mt-1">Контейнеровоз: 78 000 ₽</div>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100 flex items-center justify-between">
              <span>Экспедиторы на маршруте: <strong>Галеос</strong>, <strong>Дельпорте</strong></span>
              <span className="font-bold text-amber-900">Рекомендуется при горящих сроках поставки</span>
            </div>
          </div>
        </div>
      )}

      {/* Content for Stavropol */}
      {activeTab === 'stavropol' && (
        <div className="space-y-4">
          {/* Variant 1: Deep Sea via Novorossiysk */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
                  <Ship className="w-3 h-3" /> Вариант 1 (Лидер по цене и удобству для ЮФО)
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">
                  Deep Sea: Море Новороссийск (линия XHL) + Прямой автовывоз Ставрополь
                </h4>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>32–38 дней</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-blue-700 mb-1">
                  <Ship className="w-3.5 h-3.5" /> 1. Прямой морской сервис
                </div>
                <div className="font-semibold text-slate-900">Циндао / Taicang ➔ Новороссийск</div>
                <div className="text-slate-500 text-[11px] mt-1">Фрахт: $7,550/40HC. Линия XHL. Без Ж/Д тарифов!</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-700 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 2. Терминал (Новороссийск)
                </div>
                <div className="font-semibold text-slate-900">DTHC и растаможка в порту</div>
                <div className="text-slate-500 text-[11px] mt-1">DTHC: 59 660 ₽, экспедирование 3 000 ₽</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-700 mb-1">
                  <Truck className="w-3.5 h-3.5" /> 3. Автодоставка на юг
                </div>
                <div className="font-semibold text-slate-900">Новороссийск ➔ Ставрополь</div>
                <div className="text-slate-500 text-[11px] mt-1">Прямой автовывоз: 78 000 ₽ (без перегруза на Ж/Д)</div>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 flex items-center justify-between">
              <span>Экспедитор: <strong>Галеос</strong></span>
              <span className="font-bold text-emerald-900">Минимальные риски задержек на Ж/Д станциях</span>
            </div>
          </div>

          {/* Variant 2: Vladivostok + Rail South */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900">
                  <Layers className="w-3 h-3" /> Вариант 2
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">
                  Море ВВО + Ж/Д Тимашевск или Ростов + Автовывоз Ставрополь
                </h4>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>40–50 дней</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-blue-700 mb-1">
                  <Ship className="w-3.5 h-3.5" /> 1. Море ВВО
                </div>
                <div className="font-semibold text-slate-900">Шанхай / Циндао ➔ ВВО</div>
                <div className="text-slate-500 text-[11px] mt-1">Фрахт: $4,300 – $4,700</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-700 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 2. Таможня ВВО
                </div>
                <div className="font-semibold text-slate-900">Владивосток</div>
                <div className="text-slate-500 text-[11px] mt-1">Оформление и погрузка на состав</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-indigo-700 mb-1">
                  <Train className="w-3.5 h-3.5" /> 3. Ж/Д на Юг
                </div>
                <div className="font-semibold text-slate-900">ВВО ➔ Тимашевск / Ростов</div>
                <div className="text-slate-500 text-[11px] mt-1">388 500 – 405 000 ₽. Станция Тимашевск стабильнее.</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-700 mb-1">
                  <Truck className="w-3.5 h-3.5" /> 4. Авто Ставрополь
                </div>
                <div className="font-semibold text-slate-900">Южный хаб ➔ Ставрополь</div>
                <div className="text-slate-500 text-[11px] mt-1">100 000 – 104 000 ₽</div>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 flex items-center justify-between">
              <span>Экспедиторы: <strong>Дельпорте</strong> (Тимашевск), <strong>ИГЛ</strong> (Ростов)</span>
              <span className="font-bold text-blue-900">Требует учета загруженности станций на юге</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
