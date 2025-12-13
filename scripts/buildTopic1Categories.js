import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TOPIK_FOLDER = path.join(__dirname, '../src/assets/sets/topik_1')
const OUTPUT_FILE = path.join(__dirname, '../src/assets/sets/topic_1.json')

const CATEGORY_RULES = [
  {
    title: 'Еда и напитки',
    description: 'Продукты, блюда, вкусы, приёмы пищи и заведения общепита.',
    keywords: [
      'еда',
      'напит',
      'кушать',
      'есть',
      'пить',
      'вкус',
      'остр',
      'солен',
      'слад',
      'суп',
      'рис',
      'лапша',
      'рыба',
      'мяс',
      'фрукт',
      'овощ',
      'салат',
      'кофе',
      'чай',
      'вода',
      'сок',
      'алкоголь',
      'пиво',
      'вино',
      'пекар',
      'кафе',
      'ресторан',
      'столов',
      'кухн',
      'повар',
      'готов',
      'жарить',
      'варить',
      'печь',
    ],
  },
  {
    title: 'Путешествия и транспорт',
    description: 'Поездки, дороги, билеты, направления и виды транспорта.',
    keywords: [
      'путешеств',
      'поездка',
      'билет',
      'путь',
      'дорог',
      'город',
      'метро',
      'станц',
      'автобус',
      'поезд',
      'самолет',
      'рейс',
      'порт',
      'аэропорт',
      'такси',
      'машин',
      'велосипед',
      'маршрут',
      'карта',
      'кораб',
      'туризм',
      'путевод',
      'остановка',
      'расписан',
    ],
  },
  {
    title: 'Дом и быт',
    description: 'Бытовые предметы, мебель, приборы и ежедневные дела дома.',
    keywords: [
      'дом',
      'квартира',
      'комната',
      'мебель',
      'кровать',
      'стол',
      'стул',
      'шкаф',
      'кухня',
      'ванн',
      'туалет',
      'уборк',
      'стирк',
      'мыть',
      'полотенце',
      'посуд',
      'пылесос',
      'плита',
      'холодильник',
      'лампа',
      'ключ',
      'дверь',
      'окно',
      'сад',
      'двор',
    ],
  },
  {
    title: 'Учёба и работа',
    description: 'Учёба, профессии, офисные темы и деловая активность.',
    keywords: [
      'работ',
      'учеб',
      'школ',
      'универс',
      'колледж',
      'урок',
      'курс',
      'професс',
      'должност',
      'учител',
      'студент',
      'домашнее задание',
      'каникул',
      'встреч',
      'конференц',
      'офис',
      'совещан',
      'коллег',
      'бизнес',
      'компания',
      'проект',
      'работод',
      'резюме',
      'стажиров',
      'карьер',
      'зарплат',
      'график',
    ],
  },
  {
    title: 'Здоровье и тело',
    description: 'Самочувствие, болезни, лечение, части тела и уход за собой.',
    keywords: [
      'здоров',
      'бол',
      'больниц',
      'клиник',
      'врач',
      'медсестр',
      'лекар',
      'таблет',
      'температур',
      'простуд',
      'операц',
      'терап',
      'вакцин',
      'симптом',
      'диагноз',
      'спорт',
      'тренир',
      'мышц',
      'сосуд',
      'сердц',
      'кров',
      'кожа',
      'волос',
      'лицо',
      'рука',
      'нога',
      'голова',
      'зуб',
      'сон',
      'устал',
      'диета',
    ],
  },
  {
    title: 'Отношения и эмоции',
    description: 'Эмоции, чувства, общение, свадьбы и взаимодействие людей.',
    keywords: [
      'люб',
      'друж',
      'семь',
      'родител',
      'брат',
      'сестра',
      'муж',
      'жена',
      'ребёнок',
      'встреча',
      'приглаш',
      'эмоц',
      'чувств',
      'радост',
      'грусть',
      'гнев',
      'страх',
      'удивлен',
      'свадьб',
      'праздник',
      'вечеринк',
      'подарок',
      'общени',
      'переписк',
      'письмо',
      'объят',
      'поцелу',
      'ссор',
      'соглас',
    ],
  },
  {
    title: 'Культура и досуг',
    description: 'Искусство, развлечения, спорт и свободное время.',
    keywords: [
      'музе',
      'концерт',
      'театр',
      'фильм',
      'кино',
      'музык',
      'песня',
      'танец',
      'книга',
      'литерат',
      'спектакл',
      'рисован',
      'игра',
      'спорт',
      'турнир',
      'матч',
      'команда',
      'гитара',
      'пиан',
      'фото',
      'туризм',
      'досуг',
      'вечер',
      'клуб',
      'квест',
      'выставк',
      'экскурс',
    ],
  },
  {
    title: 'Природа и окружающая среда',
    description: 'Природные явления, погода, животные, растения и экология.',
    keywords: [
      'погод',
      'природ',
      'эколог',
      'животн',
      'растен',
      'цвет',
      'дерев',
      'лес',
      'гора',
      'река',
      'море',
      'океан',
      'парк',
      'птиц',
      'насеком',
      'климат',
      'солнц',
      'дожд',
      'снег',
      'ветер',
      'температур',
      'сезон',
      'трава',
      'камн',
      'песок',
    ],
  },
  {
    title: 'Цифры и время',
    description: 'Числительные, даты, расписания, время суток и календари.',
    keywords: [
      'год',
      'месяц',
      'недел',
      'день',
      'час',
      'минута',
      'секунд',
      'расписан',
      'дата',
      'календар',
      'вчера',
      'сегодня',
      'завтра',
      'утро',
      'день',
      'вечер',
      'ночь',
      'числ',
      'количес',
      'раз',
      'перевод времени',
    ],
  },
  {
    title: 'Одежда и внешний вид',
    description: 'Одежда, аксессуары, внешность и уход за собой.',
    keywords: [
      'одежд',
      'одет',
      'костюм',
      'рубашка',
      'платье',
      'юбка',
      'брюки',
      'штан',
      'обув',
      'ботинк',
      'туфл',
      'шарф',
      'шапк',
      'волос',
      'макияж',
      'красот',
      'украшен',
      'украшения',
      'стиль',
      'размер',
      'прическ',
      'зеркал',
      'прачеч',
    ],
  },
  {
    title: 'Технологии и связь',
    description: 'Техника, интернет, электронные устройства и коммуникации.',
    keywords: [
      'телефон',
      'смартфон',
      'компьютер',
      'ноутбук',
      'планшет',
      'интернет',
      'почт',
      'сообщен',
      'сеть',
      'программа',
      'приложен',
      'сайт',
      'логин',
      'парол',
      'камера',
      'телевиден',
      'радио',
      'заряд',
      'настройк',
      'файл',
      'печать',
      'экран',
    ],
  },
  {
    title: 'Деньги и покупки',
    description: 'Магазины, цены, банковские операции и финансовые термины.',
    keywords: [
      'покупк',
      'магазин',
      'рынок',
      'цена',
      'скидк',
      'банк',
      'карта',
      'наличн',
      'монет',
      'кошелек',
      'кошелёк',
      'подарок',
      'заработ',
      'оплат',
      'счёт',
      'кредит',
      'долг',
      'стоимост',
      'торгов',
      'обмен',
      'продаж',
    ],
  },
  {
    title: 'Город и услуги',
    description: 'Городские места, госуслуги, безопасность и инфраструктура.',
    keywords: [
      'город',
      'улиц',
      'площадь',
      'парк',
      'библиотек',
      'школа',
      'полиц',
      'пожарн',
      'почт',
      'муницип',
      'больниц',
      'администрац',
      'служб',
      'здание',
      'центр',
      'рынок',
      'церковь',
      'мечеть',
      'пригород',
      'квартал',
      'столица',
      'деревн',
      'сосед',
      'безопасн',
    ],
  },
]

const FALLBACK_CATEGORY = {
  title: 'Общие слова',
  description: 'Разные слова, которые не подходят под другие категории.',
}

/**
 * Читает и парсит JSON-файл с массивом слов.
 *
 * @param {string} filePath Путь до файла слов.
 * @returns {Array<Record<string, any>>} Массив словарных статей.
 */
function loadWordsFromFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(raw)
}

/**
 * Возвращает список файлов наборов TOPIK-I в целевой папке.
 *
 * @param {string} dir Папка с файлами наборов.
 * @returns {string[]} Список путей до JSON с наборами.
 */
function getTopicFiles(dir) {
  const files = fs.readdirSync(dir)
  return files
    .filter((name) => name.startsWith('topik_1_') && name.endsWith('.json'))
    .map((name) => path.join(dir, name))
}

/**
 * Собирает все слова из набора файлов в одну коллекцию.
 *
 * @param {string} dir Папка, где лежат файлы топиков.
 * @returns {Array<Record<string, any>>} Объединённый массив слов.
 */
function loadAllWords(dir) {
  const files = getTopicFiles(dir)
  return files.flatMap((file) => loadWordsFromFile(file))
}

/**
 * Приводит текстовые поля слова к единой строке для дальнейшего анализа.
 *
 * @param {Record<string, any>} item Объект со словарной статьёй.
 * @returns {string} Нормализованный текст.
 */
function normalizeItemText(item) {
  const parts = [item.word, item.translation, item.description, item.transcription]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
  return parts.join(' ')
}

/**
 * Рассчитывает «вес» совпадений слова с правилами категории.
 *
 * @param {string} normalizedText Подготовленный текст статьи.
 * @param {Record<string, any>} item Текущая словарная статья.
 * @param {{ keywords: string[] }} rule Правило для категории.
 * @returns {number} Итоговый счёт совпадений.
 */
function scoreRule(normalizedText, item, rule) {
  const keywordHits = rule.keywords.reduce((count, keyword) => {
    return normalizedText.includes(keyword) ? count + 1 : count
  }, 0)

  const hasNumber = /\d/.test(item.translation ?? '') || /\d/.test(item.word ?? '')
  const timeHints = /(январ|феврал|март|апрел|ма|июн|июл|август|сентябр|октябр|ноябр|декабр)/.test(
    normalizedText,
  )

  const numericBoost = hasNumber && rule.title === 'Цифры и время' ? 2 : 0
  const timeBoost = timeHints && rule.title === 'Цифры и время' ? 2 : 0

  return keywordHits + numericBoost + timeBoost
}

/**
 * Находит категорию с максимальным количеством совпадений.
 *
 * @param {Record<string, any>} item Словарная статья, которую нужно распределить.
 * @returns {{ title: string, description: string }} Подходящая категория.
 */
function pickCategory(item) {
  const normalizedText = normalizeItemText(item)
  const scored = CATEGORY_RULES.map((rule) => ({
    rule,
    score: scoreRule(normalizedText, item, rule),
  }))

  const best = scored.reduce(
    (winner, current) => (current.score > winner.score ? current : winner),
    { rule: FALLBACK_CATEGORY, score: 0 },
  )

  return best.score > 0 ? best.rule : FALLBACK_CATEGORY
}

/**
 * Группирует слова по найденным категориям.
 *
 * @param {Array<Record<string, any>>} words Все словарные статьи.
 * @returns {Array<{ title: string, description: string, words: Array<Record<string, any>> }>} Сгруппированные данные.
 */
function groupWordsByCategory(words) {
  const collection = new Map()

  for (const item of words) {
    const category = pickCategory(item)
    const existing = collection.get(category.title)

    if (existing) {
      existing.words.push(item)
    } else {
      collection.set(category.title, {
        title: category.title,
        description: category.description,
        words: [item],
      })
    }
  }

  return Array.from(collection.values())
}

/**
 * Сортирует категории и вложенные слова по алфавиту корейских слов.
 *
 * @param {Array<{ title: string, description: string, words: Array<Record<string, any>> }>} categories Категории для сортировки.
 * @returns {Array<{ title: string, description: string, words: Array<Record<string, any>> }>} Отсортированный массив категорий.
 */
function sortCategories(categories) {
  const sortedCategories = [...categories].sort((a, b) => a.title.localeCompare(b.title))

  sortedCategories.forEach((category) => {
    category.words.sort((a, b) => a.word.localeCompare(b.word))
  })

  return sortedCategories
}

/**
 * Сохраняет итоговый JSON с категориями в файл.
 *
 * @param {Array<{ title: string, description: string, words: Array<Record<string, any>> }>} categories Подготовленные категории.
 * @param {string} outputFile Путь до файла назначения.
 */
function saveCategoryFile(categories, outputFile) {
  fs.writeFileSync(outputFile, JSON.stringify(categories, null, 2), 'utf8')
}

const words = loadAllWords(TOPIK_FOLDER)
const groupedCategories = groupWordsByCategory(words)
const sortedResult = sortCategories(groupedCategories)

saveCategoryFile(sortedResult, OUTPUT_FILE)
console.log(`Готово: сохранено ${sortedResult.length} категорий в ${OUTPUT_FILE}`)
