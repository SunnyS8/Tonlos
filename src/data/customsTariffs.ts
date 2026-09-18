import { CustomsTariffTier } from '../types';

/**
 * Ставки таможенных сборов за совершение таможенных операций
 * Официальная сетка тарифов с 01.01.2026 (из предоставленных документов)
 */
export const CUSTOMS_FEES_2026: CustomsTariffTier[] = [
  { maxRub: 200000, fee: 1231, label: 'до 200 000 руб.' },
  { maxRub: 450000, fee: 2462, label: '200 000,01 – 450 000 руб.' },
  { maxRub: 1200000, fee: 4924, label: '450 000,01 – 1 200 000 руб.' },
  { maxRub: 2700000, fee: 13541, label: '1 200 000,01 – 2 700 000 руб.' },
  { maxRub: 4200000, fee: 18465, label: '2 700 000,01 – 4 200 000 руб.' },
  { maxRub: 5500000, fee: 21344, label: '4 200 000,01 – 5 500 000 руб.' },
  { maxRub: 10000000, fee: 49240, label: '5 500 000,01 – 10 000 000 руб.' },
  { maxRub: Infinity, fee: 73860, label: 'свыше 10 000 000 руб.' },
];

/**
 * Расчет таможенного сбора по таможенной стоимости партии (в рублях)
 */
export function getCustomsFee2026(customsValueRub: number): { fee: number; tier: CustomsTariffTier } {
  for (const tier of CUSTOMS_FEES_2026) {
    if (customsValueRub <= tier.maxRub) {
      return { fee: tier.fee, tier };
    }
  }
  const last = CUSTOMS_FEES_2026[CUSTOMS_FEES_2026.length - 1];
  return { fee: last.fee, tier: last };
}

/**
 * Справочник распространенных ТН ВЭД кодов из документов поставщиков
 */
export const COMMON_HS_CODES = [
  {
    code: '8708299000',
    duty: 12,
    name: 'Части и принадлежности кузовов (демпфирующий/шумоизоляционный войлок)',
    description: 'Код из коммерческих предложений JINPENG / SHANXI XINCONGBANG',
  },
  {
    code: '7604210000',
    duty: 12,
    name: 'Профили полые из алюминиевых сплавов',
    description: 'Ставка пошлины 12% (из расчета алюминиевых профилей)',
  },
  {
    code: '7604109000',
    duty: 12,
    name: 'Профили из алюминия нелегированного',
    description: 'Ставка пошлины 12%',
  },
  {
    code: '7610100000',
    duty: 12,
    name: 'Двери, окна и их рамы, пороги для дверей из алюминия',
    description: 'Ставка пошлины 12%',
  },
  {
    code: '7604299000',
    duty: 10,
    name: 'Профили прочие из алюминиевых сплавов',
    description: 'Ставка пошлины 10%',
  },
  {
    code: '7610909000',
    duty: 10,
    name: 'Металлоконструкции алюминиевые прочие',
    description: 'Ставка пошлины 10%',
  },
  {
    code: '5602101900',
    duty: 10,
    name: 'Войлок иглопробивной из химических нитей',
    description: 'Ставка пошлины 10%',
  },
  {
    code: '3919908000',
    duty: 6.5,
    name: 'Плиты, полосы, пленка самоклеящиеся из полимеров',
    description: 'Ставка пошлины 6.5%',
  },
];
