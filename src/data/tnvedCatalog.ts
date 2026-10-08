import { TnvedItem } from '../types/tnved';

export const TNVED_CATALOG: TnvedItem[] = [
  // --- АВТОКОМПОНЕНТЫ И ШУМОИЗОЛЯЦИЯ ---
  {
    code: '8708299000',
    formattedCode: '8708 29 900 0',
    name: 'Части и принадлежности кузовов (включая кабины) прочие: детали шумоизоляции, вибропоглощающие материалы, формованный войлок',
    shortName: 'Шумоизоляционный войлок / детали кузова',
    category: 'Автокомпоненты и изоляция',
    chapter: 'Группа 87: Средства наземного транспорта',
    dutyRatePercent: 12.0,
    dutyType: 'ad_valorem',
    vatRatePercent: 20.0,
    requirements: [
      'ТР ТС 018/2011 «О безопасности колесных транспортных средств»',
      'Декларация о соответствии ЕАЭС',
    ],
    hasEacCertification: true,
    sourceDocNote: 'Основной код из коммерческих предложений JINPENG и SHANXI XINCONGBANG',
    typicalCommodities: [
      'Шумоизоляционный акустический войлок',
      'Демпфирующие маты в рулонах',
      'Тепло- и звукоизоляция капота и дверей',
    ],
  },
  {
    code: '8708299009',
    formattedCode: '8708 29 900 9',
    name: 'Части и принадлежности кузовов транспортных средств прочие',
    shortName: 'Прочие детали кузова авто',
    category: 'Автокомпоненты и изоляция',
    chapter: 'Группа 87: Средства наземного транспорта',
    dutyRatePercent: 5.0,
    dutyType: 'ad_valorem',
    vatRatePercent: 20.0,
    requirements: [
      'ТР ТС 018/2011 Безопасность колесных ТС',
      'Обязательное подтверждение соответствия',
    ],
    hasEacCertification: true,
    typicalCommodities: ['Кронштейны, облицовка, защитные щитки, уплотнители'],
  },
  {
    code: '5602101900',
    formattedCode: '5602 10 190 0',
    name: 'Войлок иглопробивной и полотна со строчно-вязальной прошивкой из химических нитей',
    shortName: 'Войлок иглопробивной из синтетики',
    category: 'Текстильные материалы и войлок',
    chapter: 'Группа 56: Вата, войлок и нетканые материалы',
    dutyRatePercent: 10.0,
    dutyType: 'ad_valorem',
    vatRatePercent: 20.0,
    requirements: ['ТР ТС 017/2011 «О безопасности продукции легкой промышленности»'],
    hasEacCertification: true,
    typicalCommodities: ['Технический войлок в рулонах', 'Нетканый полиэфирный войлок'],
  },
  {
    code: '5602103800',
    formattedCode: '5602 10 380 0',
    name: 'Войлок иглопробивной прочий из шерсти или тонкого волоса животных',
    shortName: 'Войлок шерстяной технический',
    category: 'Текстильные материалы и войлок',
    chapter: 'Группа 56: Вата, войлок и нетканые материалы',
    dutyRatePercent: 10.0,
    dutyType: 'ad_valorem',
    vatRatePercent: 20.0,
    requirements: ['Фитосанитарный и ветеринарный контроль (шерсть)'],
    hasEacCertification: true,
    typicalCommodities: ['Натуральный войлок', 'Прокладки войлочные'],
  },

  // --- АЛЮМИНИЕВЫЙ ПРОФИЛЬ И МЕТАЛЛОКОНСТРУКЦИИ ---
  {
    code: '7604210000',
    formattedCode: '7604 21 00 00',
    name: 'Профили полые из алюминиевых сплавов (экструдированные, анодированные или окрашенные)',
    shortName: 'Профили полые из сплавов алюминия',
    category: 'Алюминий и металлопрокат',
    chapter: 'Группа 76: Алюминий и изделия из него',
    dutyRatePercent: 12.0,
    dutyType: 'ad_valorem',
    vatRatePercent: 20.0,
    requirements: ['ГОСТ 22233-2018 Профили прессованные из алюминиевых сплавов'],
    hasEacCertification: false,
    sourceDocNote: 'Базовый код из спецификации алюминиевых профилей',
    typicalCommodities: [
      'Полый прессованный профиль',
      'Оконные и фасадные коробчатые профили',
      'Трубы профильные алюминиевые',
    ],
  },
  {
    code: '7604109000',
    formattedCode: '7604 10 900 0',
    name: 'Профили из алюминия нелегированного прочие',
    shortName: 'Профили из чистого алюминия',
    category: 'Алюминий и металлопрокат',
    chapter: 'Группа 76: Алюминий и изделия из него',
    dutyRatePercent: 12.0,
    dutyType: 'ad_valorem',
    vatRatePercent: 20.0,
    requirements: ['Декларирование соответствия (по требованию проекта)'],
    hasEacCertification: false,
    typicalCommodities: ['Профиль из алюминия технической чистоты АД0/АД31'],
  },
  {
    code: '7604299000',
    formattedCode: '7604 29 900 0',
    name: 'Профили сплошные прочие из алюминиевых сплавов',
    shortName: 'Сплошные алюминиевые профили',
    category: 'Алюминий и металлопрокат',
    chapter: 'Группа 76: Алюминий и изделия из него',
    dutyRatePercent: 10.0,
    dutyType: 'ad_valorem',
    vatRatePercent: 20.0,
    requirements: ['Сертификат заводского качества (Mill Test Certificate)'],
    hasEacCertification: false,
    typicalCommodities: ['Прутки, шины, Т-образные и угловые сплошные профили'],
  },
  {
    code: '7610100000',
    formattedCode: '7610 10 000 0',
    name: 'Двери, окна и их рамы, наличники и пороги для дверей из алюминия',
    shortName: 'Двери, окна, рамы из алюминия',
    category: 'Алюминий и металлопрокат',
    chapter: 'Группа 76: Алюминий и изделия из него',
    dutyRatePercent: 12.0,
    dutyType: 'ad_valorem',
    vatRatePercent: 20.0,
    requirements: [
      'ГОСТ Р 23166-2021 Блоки оконные и балконные',
      'Обязательная декларация соответствия',
    ],
    hasEacCertification: true,
    typicalCommodities: ['Алюминиевые оконные блоки', 'Дверные рамы', 'Пороги'],
  },
  {
    code: '7610909000',
    formattedCode: '7610 90 900 0',
    name: 'Металлоконструкции алюминиевые прочие и их части',
    shortName: 'Алюминиевые металлоконструкции',
    category: 'Алюминий и металлопрокат',
    chapter: 'Группа 76: Алюминий и изделия из него',
    dutyRatePercent: 10.0,
    dutyType: 'ad_valorem',
    vatRatePercent: 20.0,
    requirements: ['Строительный надзор, техническое свидетельство'],
    hasEacCertification: false,
    typicalCommodities: ['Несущие каркасы', 'Фасадные стойки и ригели'],
  },

  // --- ПОЛИМЕРЫ, САМОКЛЕЙКА, ПЛЕНКИ И КЛЕИ ---
  {
    code: '3919908000',
    formattedCode: '3919 90 800 0',
    name: 'Плиты, листы, пленка, лента, полоса самоклеящиеся из пластмасс прочие',
    shortName: 'Самоклеящиеся пленки и ленты',
    category: 'Полимеры и пленки',
    chapter: 'Группа 39: Пластмассы и изделия из них',
    dutyRatePercent: 6.5,
    dutyType: 'ad_valorem',
    vatRatePercent: 20.0,
    requirements: ['Свидетельство о государственной регистрации (при контакте с пищей/кожей)'],
    hasEacCertification: false,
    typicalCommodities: [
      'Самоклеящийся защитный слой для войлока',
      'Двусторонний скотч технический',
      'Монтажная лента в рулонах',
    ],
  },
  {
    code: '3921131000',
    formattedCode: '3921 13 100 0',
    name: 'Плиты, листы, пленка из полиуретанов пористые (пенополиуретан, поролон)',
    shortName: 'Пенополиуретан пористый (ППУ)',
    category: 'Полимеры и пленки',
    chapter: 'Группа 39: Пластмассы и изделия из них',
    dutyRatePercent: 6.5,
    dutyType: 'ad_valorem',
    vatRatePercent: 20.0,
    requirements: ['Пожарный сертификат соответствия (ТР ЕАЭС 043/2017 при использовании в строительстве)'],
    hasEacCertification: true,
    typicalCommodities: ['Акустический поролон', 'Демпферный пенополиуретан'],
  },
  {
    code: '3506919000',
    formattedCode: '3506 91 900 0',
    name: 'Клеи готовые прочие на основе каучуков или полимеров расфасованные',
    shortName: 'Промышленные полимерные клеи',
    category: 'Химия и клеи',
    chapter: 'Группа 35: Белковые вещества, клеи, ферменты',
    dutyRatePercent: 5.0,
    dutyType: 'ad_valorem',
    vatRatePercent: 20.0,
    requirements: ['Паспорт безопасности химической продукции (MSDS)'],
    hasEacCertification: false,
    typicalCommodities: ['Клей-расплав для ламинации войлока', 'Акриловый клей'],
  },

  // --- ОБОРУДОВАНИЕ, СТАНКИ И ЭЛЕКТРОНИКА ---
  {
    code: '8479899707',
    formattedCode: '8479 89 970 7',
    name: 'Машины и механические приспособления, имеющие индивидуальные функции, прочие',
    shortName: 'Промышленное технологическое оборудование',
    category: 'Станки и машиностроение',
    chapter: 'Группа 84: Реакторы ядерные, котлы, оборудование',
    dutyRatePercent: 0.0,
    dutyType: 'free',
    vatRatePercent: 20.0,
    requirements: [
      'ТР ТС 010/2011 «О безопасности машин и оборудования»',
      'ТР ТС 020/2011 «Электромагнитная совместимость технических средств»',
      'Декларация или сертификат соответствия ЕАЭС',
    ],
    hasEacCertification: true,
    typicalCommodities: ['Линии резки войлока', 'Экструдеры', 'Прессы формовочные'],
  },
  {
    code: '8462490000',
    formattedCode: '8462 49 000 0',
    name: 'Станки дыропробивные или вырубные (включая прессы), для обработки металлов',
    shortName: 'Вырубные и пробивные станки',
    category: 'Станки и машиностроение',
    chapter: 'Группа 84: Реакторы ядерные, котлы, оборудование',
    dutyRatePercent: 5.0,
    dutyType: 'ad_valorem',
    vatRatePercent: 20.0,
    requirements: ['ТР ТС 010/2011 Безопасность машин'],
    hasEacCertification: true,
    typicalCommodities: ['Штамповочные прессы', 'Вырубные комплексы для профилей'],
  },
  {
    code: '8501522001',
    formattedCode: '8501 52 200 1',
    name: 'Двигатели переменного тока многофазные мощностью более 750 Вт, но не более 7,5 кВт',
    shortName: 'Электродвигатели асинхронные 0.75-7.5 кВт',
    category: 'Электротехника',
    chapter: 'Группа 85: Электрические машины и оборудование',
    dutyRatePercent: 0.0,
    dutyType: 'free',
    vatRatePercent: 20.0,
    requirements: [
      'ТР ТС 004/2011 «О безопасности низковольтного оборудования»',
      'ТР ТС 020/2011 «ЭМС»',
    ],
    hasEacCertification: true,
    typicalCommodities: ['Приводные электродвигатели станков и конвейеров'],
  },
  {
    code: '8544499108',
    formattedCode: '8544 49 910 8',
    name: 'Проводники электрические на напряжение не более 1000 В, без соединительных деталей',
    shortName: 'Силовые и контрольные кабели',
    category: 'Электротехника',
    chapter: 'Группа 85: Электрические машины и оборудование',
    dutyRatePercent: 10.0,
    dutyType: 'ad_valorem',
    vatRatePercent: 20.0,
    requirements: ['ТР ТС 004/2011 Низковольтное оборудование (Обязательный сертификат)'],
    hasEacCertification: true,
    typicalCommodities: ['Медный изолированный кабель', 'Монтажный провод'],
  },
  {
    code: '8471300000',
    formattedCode: '8471 30 000 0',
    name: 'Машины вычислительные портативные массой не более 10 кг (ноутбуки, планшеты)',
    shortName: 'Портативные компьютеры и планшеты',
    category: 'Электроника и IT',
    chapter: 'Группа 84: Оборудование и вычислительная техника',
    dutyRatePercent: 0.0,
    dutyType: 'free',
    vatRatePercent: 20.0,
    requirements: [
      'ТР ТС 004/2011, ТР ТС 020/2011, ТР ЕАЭС 037/2016 (RoHS)',
      'Нотификация ФСБ России на шифрование',
      'Маркировка Честный ЗНАК',
    ],
    hasEacCertification: true,
    hasFairSignMarking: true,
    typicalCommodities: ['Ноутбуки', 'Промышленные планшеты для терминалов'],
  },

  // --- КРЕПЕЖ И МЕТИЗЫ ---
  {
    code: '7318159008',
    formattedCode: '7318 15 900 8',
    name: 'Винты и болты с нарезанной резьбой из черных металлов прочие',
    shortName: 'Болты и винты стальные',
    category: 'Крепеж и метизы',
    chapter: 'Группа 73: Изделия из черных металлов',
    dutyRatePercent: 8.0,
    dutyType: 'ad_valorem',
    vatRatePercent: 20.0,
    requirements: ['Антидемпинговая пошлина (на отдельные позиции из КНР до 21.8%)'],
    hasEacCertification: false,
    typicalCommodities: ['Высокопрочные болты', 'Самонарезающие винты', 'Анкеры'],
  },
  {
    code: '7318169200',
    formattedCode: '7318 16 920 0',
    name: 'Гайки самостопорящиеся из коррозионностойкой стали',
    shortName: 'Гайки самостопорящиеся',
    category: 'Крепеж и метизы',
    chapter: 'Группа 73: Изделия из черных металлов',
    dutyRatePercent: 7.5,
    dutyType: 'ad_valorem',
    vatRatePercent: 20.0,
    requirements: ['Сертификат качества завода-изготовителя'],
    hasEacCertification: false,
    typicalCommodities: ['Гайки с нейлоновым кольцом', 'Нержавеющие гайки'],
  },

  // --- УПАКОВКА И КАРТОН ---
  {
    code: '4819100000',
    formattedCode: '4819 10 000 0',
    name: 'Коробки и ящики из гофрированной бумаги или гофрированного картона',
    shortName: 'Коробки из гофрокартона (упаковка)',
    category: 'Упаковка и картон',
    chapter: 'Группа 48: Бумага и картон; изделия из них',
    dutyRatePercent: 10.0,
    dutyType: 'ad_valorem',
    vatRatePercent: 20.0,
    requirements: ['ТР ТС 005/2011 «О безопасности упаковки» (Декларация ЕАЭС)'],
    hasEacCertification: true,
    typicalCommodities: ['Гофрокороба для транспортировки рулонов', 'Картонные ящики'],
  },
  {
    code: '3923210000',
    formattedCode: '3923 21 000 0',
    name: 'Мешки и пакеты (включая конические) из полимеров этилена',
    shortName: 'Пакеты и мешки полиэтиленовые',
    category: 'Упаковка и картон',
    chapter: 'Группа 39: Пластмассы и изделия из них',
    dutyRatePercent: 6.5,
    dutyType: 'ad_valorem',
    vatRatePercent: 20.0,
    requirements: ['ТР ТС 005/2011 О безопасности упаковки'],
    hasEacCertification: true,
    typicalCommodities: ['Упаковочные полиэтиленовые рукава для рулонов'],
  },
];

/**
 * Searches the TNVED catalog by code (exact or prefix) or text description
 */
export function searchTnvedCatalog(query: string, limit = 15): TnvedItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return TNVED_CATALOG.slice(0, limit);

  // Clean numbers from spaces, dots, dashes
  const cleanDigits = q.replace(/[^0-9]/g, '');

  const results: { item: TnvedItem; score: number }[] = [];

  for (const item of TNVED_CATALOG) {
    let score = 0;

    // Exact code match
    if (item.code === cleanDigits) {
      score += 1000;
    } else if (cleanDigits.length >= 2 && item.code.startsWith(cleanDigits)) {
      score += 500 + cleanDigits.length * 10;
    } else if (cleanDigits.length >= 2 && item.code.includes(cleanDigits)) {
      score += 300;
    }

    // Name match
    const lowerName = item.name.toLowerCase();
    const lowerShort = item.shortName.toLowerCase();
    const lowerCategory = item.category.toLowerCase();
    const lowerTypical = (item.typicalCommodities || []).join(' ').toLowerCase();

    if (lowerShort.includes(q)) {
      score += 200;
    }
    if (lowerName.includes(q)) {
      score += 150;
    }
    if (lowerTypical.includes(q)) {
      score += 120;
    }
    if (lowerCategory.includes(q)) {
      score += 80;
    }

    // Check individual words
    const words = q.split(/\s+/).filter((w) => w.length > 2);
    for (const w of words) {
      if (lowerShort.includes(w)) score += 40;
      if (lowerName.includes(w)) score += 30;
      if (lowerTypical.includes(w)) score += 25;
      if (lowerCategory.includes(w)) score += 15;
    }

    if (score > 0) {
      results.push({ item, score });
    }
  }

  // Sort descending by relevance score
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit).map((r) => r.item);
}

/**
 * Finds an exact TNVED item by 10-digit code or returns undefined
 */
export function getTnvedByCode(code: string): TnvedItem | undefined {
  const clean = code.replace(/[^0-9]/g, '');
  return TNVED_CATALOG.find((item) => item.code === clean || item.code.startsWith(clean));
}
