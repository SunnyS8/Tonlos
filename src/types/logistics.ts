export type DestinationWarehouse = 'Серпухов' | 'Ставрополь';
export type ContainerSize = '20GP' | '40HC';
export type RouteType =
  | 'sea_vvo_rail_truck' // Шанхай/Нинбо -> Море ВВО -> ЖД Москва/Ростов -> Авто
  | 'direct_rail_truck'  // Шанхай/Циндао -> Прямое ЖД -> Москва/Краснодар/Тимашевск -> Авто
  | 'deep_sea_novorossiysk'; // Шанхай/Нинбо/Циндао -> Море Новороссийск -> Авто

export type Currency = 'USD' | 'EUR' | 'CNY' | 'RUB';

export interface CostComponent {
  amount: number;
  currency: Currency;
}

export interface ForwarderQuote {
  id: string;
  forwarderName: string; // ИГЛ, Галеос, Дельпорте, порт Циндао, etc.
  destination: DestinationWarehouse;
  originPort: string; // "Шанхай", "Нинбо", "Циндао"
  routeType: RouteType;
  routeDescription: string;
  transitHub: string; // "Владивосток", "Забайкальск", "Ростов", "Краснодар/Тимашевск", "Новороссийск", "Москва"
  
  // Container & weight
  containerSize: ContainerSize; // "20GP" | "40HC"
  weightTons: number; // расчетный вес партии, т
  maxWeightTons: number; // тоннаж, включённый в ставку (сверх этого перевес)
  overweightRateRub: number; // ставка за каждую тонну перевеса, ₽
  
  // Cost components
  oceanFreight: CostComponent; // Морской / основной фрахт (USD)
  railFreight: CostComponent;  // Ж/Д тариф (RUB или USD)
  truckDelivery: CostComponent; // Автовывоз до склада назначения (RUB)
  forwarderFee: CostComponent;  // Вознаграждение экспедитора (RUB или USD)
  terminalExpenses: CostComponent; // Терминальные / DTHC / СВХ (RUB или USD)
  
  vatRate: number; // 0, 5, 20, 22% на российские услуги
  transitDaysMin: number;
  transitDaysMax: number;
  validUntil?: string;
  comments?: string;
  favorite?: boolean;
}

export interface CalculatedQuoteCost {
  totalUsd: number;
  totalRub: number;
  oceanFreightUsd: number;
  oceanFreightRub: number;
  railFreightUsd: number;
  railFreightRub: number;
  truckDeliveryUsd: number;
  truckDeliveryRub: number;
  forwarderFeeUsd: number;
  forwarderFeeRub: number;
  terminalExpensesUsd: number;
  terminalExpensesRub: number;
  overweightRub: number;
  overweightUsd: number;
  vatRub: number;
  vatUsd: number;
}

export interface LogisticsLandedImpact {
  quote: ForwarderQuote;
  calc: CalculatedQuoteCost;
  totalCostRub: number; // Полная себестоимость всей партии товара с этой доставкой
  costPerM2Rub: number; // Себестоимость 1 м²
  costPerPieceRub: number; // Себестоимость 1 рулона / шт
  costPerKgRub: number; // Себестоимость 1 кг
  deltaM2Rub: number; // Разница по сравнению с активным расчетом (+ или - ₽/м²)
  deltaTotalRub: number; // Разница в общей стоимости партии (₽)
  isCheapestPrice: boolean;
  isFastest: boolean;
  isSelected: boolean;
}
