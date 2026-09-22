import React, { useState } from 'react';
import { X, Plus, DollarSign, Truck, Train, Ship, ShieldCheck, MapPin } from 'lucide-react';
import { ForwarderQuote, DestinationWarehouse, RouteType, ContainerSize } from '../../types/logistics';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveQuote: (quote: ForwarderQuote) => void;
  initialQuote?: ForwarderQuote | null;
}

export const AddQuoteModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSaveQuote,
  initialQuote,
}) => {
  const [forwarderName, setForwarderName] = useState(initialQuote?.forwarderName || 'ИГЛ');
  const [destination, setDestination] = useState<DestinationWarehouse>(initialQuote?.destination || 'Серпухов');
  const [originPort, setOriginPort] = useState(initialQuote?.originPort || 'Шанхай');
  const [routeType, setRouteType] = useState<RouteType>(initialQuote?.routeType || 'sea_vvo_rail_truck');
  const [transitHub, setTransitHub] = useState(initialQuote?.transitHub || 'Владивосток → Москва');
  const [containerSize, setContainerSize] = useState<ContainerSize>(initialQuote?.containerSize || '40HC');

  // Costs
  const [oceanFreightUsd, setOceanFreightUsd] = useState(initialQuote?.oceanFreight.amount || 4500);
  const [railFreightRub, setRailFreightRub] = useState(initialQuote?.railFreight.amount || 350000);
  const [truckDeliveryRub, setTruckDeliveryRub] = useState(initialQuote?.truckDelivery.amount || 78000);
  const [forwarderFeeRub, setForwarderFeeRub] = useState(initialQuote?.forwarderFee.amount || 15000);
  const [terminalExpensesRub, setTerminalExpensesRub] = useState(initialQuote?.terminalExpenses.amount || 35000);

  // Transit days & weights
  const [transitDaysMin, setTransitDaysMin] = useState(initialQuote?.transitDaysMin || 35);
  const [transitDaysMax, setTransitDaysMax] = useState(initialQuote?.transitDaysMax || 42);
  const [weightTons, setWeightTons] = useState(initialQuote?.weightTons || 26);
  const [maxWeightTons, setMaxWeightTons] = useState(initialQuote?.maxWeightTons || 20);
  const [overweightRateRub, setOverweightRateRub] = useState(initialQuote?.overweightRateRub || 2000);
  const [comments, setComments] = useState(initialQuote?.comments || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newQuote: ForwarderQuote = {
      id: initialQuote?.id || `quote_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      forwarderName: forwarderName.trim() || 'Экспедитор',
      destination,
      originPort,
      routeType,
      transitHub,
      routeDescription: `${originPort} → ${transitHub} → ${destination}`,
      containerSize,
      weightTons,
      maxWeightTons,
      overweightRateRub,
      oceanFreight: { amount: Number(oceanFreightUsd) || 0, currency: 'USD' },
      railFreight: { amount: Number(railFreightRub) || 0, currency: 'RUB' },
      truckDelivery: { amount: Number(truckDeliveryRub) || 0, currency: 'RUB' },
      forwarderFee: { amount: Number(forwarderFeeRub) || 0, currency: 'RUB' },
      terminalExpenses: { amount: Number(terminalExpensesRub) || 0, currency: 'RUB' },
      vatRate: 22,
      transitDaysMin: Number(transitDaysMin) || 30,
      transitDaysMax: Number(transitDaysMax) || 40,
      validUntil: '2026-10-31',
      comments,
    };
    onSaveQuote(newQuote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-900 to-blue-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {initialQuote ? 'Редактировать котировку перевозчика' : 'Новая ставка перевозчика (Китая — РФ)'}
              </h3>
              <p className="text-xs text-blue-200">
                Ввод составляющих ставки для мультимодального анализа и расчета себестоимости
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Перевозчик / Экспедитор
              </label>
              <input
                type="text"
                value={forwarderName}
                onChange={(e) => setForwarderName(e.target.value)}
                placeholder="ИГЛ, Галеос, Дельпорте..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Склад назначения
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value as DestinationWarehouse)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium bg-white"
              >
                <option value="Серпухов">Серпухов (Моск. обл.)</option>
                <option value="Ставрополь">Ставрополь (СКФО / ЮФО)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Порт отправления
              </label>
              <input
                type="text"
                value={originPort}
                onChange={(e) => setOriginPort(e.target.value)}
                placeholder="Шанхай, Циндао, Нинбо"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Route Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Тип маршрута доставки
              </label>
              <select
                value={routeType}
                onChange={(e) => setRouteType(e.target.value as RouteType)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium bg-white"
              >
                <option value="sea_vvo_rail_truck">Море ВВО + Ж/Д + Авто</option>
                <option value="direct_rail_truck">Прямое ускоренное Ж/Д + Авто</option>
                <option value="deep_sea_novorossiysk">Deep Sea (Море Новороссийск) + Авто</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Транзитные хабы / Станция
              </label>
              <input
                type="text"
                value={transitHub}
                onChange={(e) => setTransitHub(e.target.value)}
                placeholder="Владивосток → Москва / Новороссийск"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Cost Components */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Статьи затрат перевозчика
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl">
                <label className="block text-[11px] font-semibold text-blue-900 mb-1">
                  1. Фрахт (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-blue-600 font-bold">$</span>
                  <input
                    type="number"
                    value={oceanFreightUsd}
                    onChange={(e) => setOceanFreightUsd(parseFloat(e.target.value) || 0)}
                    className="w-full pl-6 pr-2 py-1.5 text-xs font-mono font-bold border border-blue-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  2. Ж/Д тариф (₽)
                </label>
                <input
                  type="number"
                  value={railFreightRub}
                  onChange={(e) => setRailFreightRub(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  3. Автовывоз до склада (₽)
                </label>
                <input
                  type="number"
                  value={truckDeliveryRub}
                  onChange={(e) => setTruckDeliveryRub(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  4. Вознаграждение (₽)
                </label>
                <input
                  type="number"
                  value={forwarderFeeRub}
                  onChange={(e) => setForwarderFeeRub(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  5. Терминал / DTHC / СВХ (₽)
                </label>
                <input
                  type="number"
                  value={terminalExpensesRub}
                  onChange={(e) => setTerminalExpensesRub(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Срок в пути (дней)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={transitDaysMin}
                    onChange={(e) => setTransitDaysMin(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white text-center"
                    placeholder="Мин"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    value={transitDaysMax}
                    onChange={(e) => setTransitDaysMax(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white text-center"
                    placeholder="Макс"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Примечание к котировке
            </label>
            <input
              type="text"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Условия линии, станция, включенные дни хранения и т.д."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{initialQuote ? 'Сохранить изменения' : 'Добавить ставку'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
