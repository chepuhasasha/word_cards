import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { fileURLToPath } from 'url'

const TTS_ENDPOINT = 'https://translate.google.com/translate_tts'
const TTS_LANG = 'ko'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const OUTPUT_DIR = path.join(__dirname, '../public/audio')

/**
 * @typedef {Object} SyllableItem
 * @property {string} word           Корейское слово/слог.
 * @property {string} [audio]        Путь к аудио-файлу или 'error'.
 * @property {any} [other]           Произвольные дополнительные поля.
 */

/**
 * @typedef {Object} CliOptions
 * @property {string} configPath     Путь к sets.json.
 * @property {boolean} forceRewrite  Флаг принудительной перезаписи аудио.
 */

/**
 * Разбор аргументов командной строки.
 *
 * Поддерживаемые аргументы:
 * - `<path/to/sets.json>` — путь к конфигу с массивом имён JSON-файлов
 * - `--rewrite-audio`     — принудительно перезаписывать аудио
 *
 * @param {string[]} argv Аргументы командной строки (без `node` и имени файла скрипта).
 * @returns {CliOptions}
 */
function parseCliArgs(argv) {
  const configArg = argv.find((arg) => !arg.startsWith('--'))
  const forceRewrite = argv.includes('--rewrite-audio')

  if (!configArg) {
    console.error(
      'Ошибка: нужно указать путь к конфигу sets.json.\n' +
        'Пример: node tts.js ./public/sets.json --rewrite-audio',
    )
    process.exit(1)
  }

  const configPath = path.resolve(process.cwd(), configArg)

  return {
    configPath,
    forceRewrite,
  }
}

const args = process.argv.slice(2)
const { configPath: CONFIG_PATH, forceRewrite: FORCE_REWRITE_AUDIO } = parseCliArgs(args)

console.log(`Использую конфиг sets.json: ${CONFIG_PATH}`)
console.log(
  `Режим перезаписи аудио: ${
    FORCE_REWRITE_AUDIO
      ? 'ВКЛЮЧЕН (перезаписываю файлы заново)'
      : 'ВЫКЛЮЧЕН (пропускаю, если файл уже есть)'
  }`,
)

/**
 * Гарантирует существование директории, создавая её при необходимости.
 *
 * @param {string} dirPath Путь к папке.
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

ensureDir(OUTPUT_DIR)

/**
 * Загружает и парсит JSON-файл с массивом объектов.
 *
 * @param {string} jsonPath Путь к JSON-файлу.
 * @returns {SyllableItem[]} Массив элементов.
 * @throws {Error} Если файл не содержит массив.
 */
function loadJson(jsonPath) {
  const raw = fs.readFileSync(jsonPath, 'utf8')
  const data = JSON.parse(raw)
  if (!Array.isArray(data)) {
    throw new Error(`${jsonPath}: .json должен содержать массив объектов`)
  }
  return /** @type {SyllableItem[]} */ (data)
}

/**
 * Сохраняет массив объектов в JSON-файл.
 *
 * @param {string} jsonPath Путь к JSON-файлу.
 * @param {SyllableItem[]} data Данные для сохранения.
 */
function saveJson(jsonPath, data) {
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8')
}

/**
 * Загружает конфиг sets.json — массив имён файлов наборов.
 *
 * @param {string} cfgPath Путь к sets.json.
 * @returns {string[]} Массив имён файлов (строк).
 */
function loadSetsConfig(cfgPath) {
  const raw = fs.readFileSync(cfgPath, 'utf8')
  const data = JSON.parse(raw)
  if (!Array.isArray(data) || !data.every((x) => typeof x === 'string')) {
    throw new Error(`${cfgPath}: конфиг должен быть массивом строк с именами JSON-файлов`)
  }
  return data
}

/**
 * Простая задержка.
 *
 * @param {number} ms Количество миллисекунд.
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Превращает слово в безопасное имя файла:
 * - пробельные символы → '_'
 * - спецсимволы \ / : * ? " < > | . удаляются
 *
 * @param {string} word
 * @returns {string}
 */
function toSafeFileName(word) {
  return word
    .replace(/\s+/g, '_')
    .replace(/[\\/:*?"<>|.]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
}

/**
 * Скачивает файл по URL и сохраняет на диск.
 *
 * @param {string} url URL источника.
 * @param {string} filePath Путь для сохранения файла.
 * @param {import('axios').AxiosRequestConfig} [axiosConfig] Дополнительные настройки Axios.
 * @returns {Promise<void>}
 */
async function downloadFile(url, filePath, axiosConfig = {}) {
  const res = await axios.get(url, {
    responseType: 'stream',
    ...axiosConfig,
  })

  await new Promise((resolve, reject) => {
    const w = fs.createWriteStream(filePath)
    res.data.pipe(w)
    w.on('finish', resolve)
    w.on('error', reject)
  })
}

/**
 * Скачивает файл с несколькими попытками.
 *
 * @param {string} url URL источника.
 * @param {string} filePath Путь для сохранения файла.
 * @param {number} [maxAttempts=3] Максимальное число попыток.
 * @param {import('axios').AxiosRequestConfig} [axiosConfig] Дополнительные настройки Axios.
 * @returns {Promise<void>}
 * @throws {Error} Если все попытки завершились неуспешно.
 */
async function downloadFileWithRetry(url, filePath, maxAttempts = 3, axiosConfig = {}) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await downloadFile(url, filePath, axiosConfig)
      return
    } catch (e) {
      console.log(
        `Ошибка скачивания (попытка ${attempt}/${maxAttempts}) для "${filePath}": ${e.message}`,
      )

      if (attempt === maxAttempts) {
        throw e
      }

      await delay(1000)
    }
  }
}

/**
 * Создаёт аудио-файл через Google Translate TTS.
 *
 * @param {string} word Слово/слог для озвучки.
 * @param {string} filePath Путь для сохранения mp3-файла.
 * @returns {Promise<void>}
 */
async function createTtsAudio(word, filePath) {
  const params = new URLSearchParams({
    ie: 'UTF-8',
    q: word,
    tl: TTS_LANG,
    client: 'tw-ob',
  }).toString()

  const ttsUrl = `${TTS_ENDPOINT}?${params}`

  console.log(`Запрос к Google TTS для "${word}"`)

  const axiosConfig = {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Referer: 'https://translate.google.com/',
    },
  }

  await downloadFileWithRetry(ttsUrl, filePath, 3, axiosConfig)
  console.log(`Аудио через TTS создано: ${filePath}`)
}

/**
 * Проверяет, есть ли уже какой-либо аудио-файл для данного слова.
 *
 * @param {string} safeName "Безопасное" имя файла (без недопустимых символов).
 * @returns {boolean} true, если хотя бы один вариант файла существует.
 */
function hasExistingAudioFile(safeName) {
  const candidates = [
    path.join(OUTPUT_DIR, `${safeName}.mp3`),
    path.join(OUTPUT_DIR, `${safeName}_tts.mp3`),
  ]
  return candidates.some((p) => fs.existsSync(p))
}

/**
 * Возвращает список элементов, для которых нужно создать или перезаписать аудио.
 *
 * @param {SyllableItem[]} data Все элементы.
 * @param {boolean} forceRewrite Флаг принудительной перезаписи аудио.
 * @returns {SyllableItem[]} Отфильтрованный список элементов.
 */
function getItemsToProcess(data, forceRewrite) {
  return data.filter((item) => {
    if (!item || !item.word) return false
    if (forceRewrite) return true

    const safeName = toSafeFileName(item.word)
    const hasFile = hasExistingAudioFile(safeName)
    return !hasFile
  })
}

/**
 * Основной процессор: создаёт/перезаписывает аудио-файлы для переданных элементов.
 *
 * @param {SyllableItem[]} data Все данные из JSON.
 * @param {SyllableItem[]} itemsToProcess Отфильтрованные элементы, требующие обработки.
 * @param {boolean} forceRewrite Флаг принудительной перезаписи.
 * @param {string} jsonPath Путь к исходному JSON-файлу для сохранения прогресса.
 * @returns {Promise<void>}
 */
async function processItems(data, itemsToProcess, forceRewrite, jsonPath) {
  let processed = 0
  const total = itemsToProcess.length

  for (const item of itemsToProcess) {
    processed += 1
    const word = item.word
    const percent = ((processed / total) * 100).toFixed(1)

    console.log(`\n[${processed}/${total}] (${percent}%) Обрабатываю слово: "${word}"`)

    const safeName = toSafeFileName(word)
    const targetFileName = `${safeName}_tts.mp3`
    const targetFilePath = path.join(OUTPUT_DIR, targetFileName)

    if (!forceRewrite && fs.existsSync(targetFilePath)) {
      console.log(`Файл уже существует, пропускаю загрузку: ${targetFilePath}`)

      if (!item.audio || item.audio === 'error') {
        item.audio = `audio/${targetFileName}`
        saveJson(jsonPath, data)
      }
      continue
    }

    try {
      await createTtsAudio(word, targetFilePath)
      item.audio = `audio/${targetFileName}`
    } catch (e) {
      console.log(`Ошибка TTS для "${word}": ${e.message}`)
      item.audio = 'error'
    }

    // сохраняем прогресс после каждого элемента
    saveJson(jsonPath, data)
  }
}

/**
 * Точка входа скрипта.
 *
 * 1. Загружает sets.json (массив имён файлов).
 * 2. Для каждого файла:
 *    - загружает JSON
 *    - фильтрует элементы по необходимости создания аудио
 *    - вызывает Google TTS и сохраняет обновлённый JSON
 */
;(async () => {
  const setFiles = loadSetsConfig(CONFIG_PATH)
  const baseDir = path.dirname(CONFIG_PATH)

  console.log(`Найдено наборов: ${setFiles.length}`)
  console.log(setFiles.map((name) => ` - ${name}`).join('\n'))

  for (const fileName of setFiles) {
    const jsonPath = path.resolve(baseDir, fileName)
    console.log(`Обрабатываю набор: ${jsonPath}`)

    const data = loadJson(jsonPath)
    const itemsToProcess = getItemsToProcess(data, FORCE_REWRITE_AUDIO)

    if (itemsToProcess.length === 0) {
      console.log('Все слова уже имеют аудио-файлы — пропускаю этот набор.')
      continue
    }

    console.log(`Нужно создать/перезаписать аудио для слов: ${itemsToProcess.length}`)

    await processItems(data, itemsToProcess, FORCE_REWRITE_AUDIO, jsonPath)

    console.log(`Набор завершён: ${jsonPath}`)
  }

  console.log('\nОбработка всех наборов завершена.')
})()
