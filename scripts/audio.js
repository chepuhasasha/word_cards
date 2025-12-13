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
 * @typedef {Object} WordItem
 * @property {string} word           Корейское слово или выражение.
 * @property {string} [audio]        Относительный путь к аудиофайлу или 'error'.
 * @property {any} [other]           Дополнительные произвольные поля.
 */

/**
 * @typedef {Object} WordItemRef
 * @property {WordItem} target Объект слова, в который можно записать путь к аудио.
 */

/**
 * @typedef {Object} CliOptions
 * @property {string} setsDir        Путь к директории с JSON-наборами.
 * @property {boolean} forceRewrite  Флаг принудительной перезаписи аудио.
 */

/**
 * Разбор аргументов командной строки.
 *
 * Поддерживаемые аргументы:
 * - `<path/to/sets/dir>`  — путь к директории с JSON-файлами
 * - `--rewrite-audio`     — принудительно перезаписывать аудио
 *
 * @param {string[]} argv Аргументы командной строки (без `node` и имени файла скрипта).
 * @returns {CliOptions}
 */
function parseCliArgs(argv) {
  const setsDirArg = argv.find((arg) => !arg.startsWith('--')) ?? 'src/assets/sets'
  const forceRewrite = argv.includes('--rewrite-audio')

  const setsDir = path.resolve(process.cwd(), setsDirArg)
  const dirStats = fs.existsSync(setsDir) ? fs.statSync(setsDir) : null

  if (!dirStats || !dirStats.isDirectory()) {
    console.error('Ошибка: нужно указать существующую директорию с JSON-наборами.')
    console.error('Пример: node scripts/audio.js ./src/assets/sets --rewrite-audio')
    process.exit(1)
  }

  return {
    setsDir,
    forceRewrite,
  }
}

const args = process.argv.slice(2)
const { setsDir: SETS_DIR, forceRewrite: FORCE_REWRITE_AUDIO } = parseCliArgs(args)

console.log(`Использую директорию наборов: ${SETS_DIR}`)
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
 * Загружает и парсит JSON-файл с набором слов.
 *
 * @param {string} jsonPath Путь к JSON-файлу.
 * @returns {unknown[]} Исходные данные (массив объектов или категорий).
 * @throws {Error} Если файл не содержит массив.
 */
function loadJson(jsonPath) {
  const raw = fs.readFileSync(jsonPath, 'utf8')
  const data = JSON.parse(raw)
  if (!Array.isArray(data)) {
    throw new Error(`${jsonPath}: .json должен содержать массив объектов`)
  }
  return data
}

/**
 * Сохраняет набор слов в JSON-файл.
 *
 * @param {string} jsonPath Путь к JSON-файлу.
 * @param {unknown[]} data Данные для сохранения.
 */
function saveJson(jsonPath, data) {
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8')
}

/**
 * Возвращает список JSON-файлов в директории наборов.
 *
 * @param {string} setsDir Путь к директории с наборами.
 * @returns {string[]} Список файлов с расширением .json.
 */
function getJsonSetFiles(setsDir) {
  return fs
    .readdirSync(setsDir)
    .filter((name) => name.toLowerCase().endsWith('.json'))
    .map((name) => path.join(setsDir, name))
    .sort()
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
 * Извлекает объекты слов из произвольной структуры набора.
 *
 * Поддерживает два формата:
 * 1. Простой массив объектов слов вида `{ word, ... }`.
 * 2. Массив категорий, где у каждой есть поле `words` с массивом слов.
 *
 * @param {unknown[]} data Данные, загруженные из JSON-набора.
 * @param {string} jsonPath Путь к исходному файлу (для сообщений об ошибках).
 * @returns {WordItemRef[]} Массив ссылок на объекты слов.
 */
function collectWordItems(data, jsonPath) {
  const directWords = data.every((entry) => entry && typeof entry === 'object' && 'word' in entry)

  if (directWords) {
    return data.map((entry) => ({ target: /** @type {WordItem} */ (entry) }))
  }

  const collected = []

  data.forEach((entry) => {
    if (!entry || typeof entry !== 'object') return
    if (!('words' in entry)) return

    const words = /** @type {{ words?: WordItem[] }} */ (entry).words
    if (!Array.isArray(words)) return

    words.forEach((wordItem) => {
      if (wordItem && typeof wordItem.word === 'string') {
        collected.push({ target: wordItem })
      }
    })
  })

  if (collected.length === 0) {
    throw new Error(`${jsonPath}: не найдено ни одного слова в ожидаемом формате`)
  }

  return collected
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
    ttsspeed: '0.24',
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
 * @param {WordItemRef[]} wordItems Ссылки на объекты слов.
 * @param {boolean} forceRewrite Флаг принудительной перезаписи аудио.
 * @returns {WordItemRef[]} Отфильтрованный список элементов.
 */
function getItemsToProcess(wordItems, forceRewrite) {
  return wordItems.filter(({ target }) => {
    if (!target || !target.word) return false
    if (forceRewrite) return true

    const safeName = toSafeFileName(target.word)
    const hasFile = hasExistingAudioFile(safeName)
    return !hasFile
  })
}

/**
 * Основной процессор: создаёт/перезаписывает аудио-файлы для переданных элементов.
 *
 * @param {unknown[]} data Все данные из JSON (для сохранения прогресса).
 * @param {WordItemRef[]} itemsToProcess Отфильтрованные элементы, требующие обработки.
 * @param {boolean} forceRewrite Флаг принудительной перезаписи.
 * @param {string} jsonPath Путь к исходному JSON-файлу для сохранения прогресса.
 * @returns {Promise<void>}
 */
async function processItems(data, itemsToProcess, forceRewrite, jsonPath) {
  let processed = 0
  const total = itemsToProcess.length

  for (const { target } of itemsToProcess) {
    processed += 1
    const word = target.word
    const percent = ((processed / total) * 100).toFixed(1)

    console.log(`\n[${processed}/${total}] (${percent}%) Обрабатываю слово: "${word}"`)

    const safeName = toSafeFileName(word)
    const targetFileName = `${safeName}_tts.mp3`
    const targetFilePath = path.join(OUTPUT_DIR, targetFileName)

    if (!forceRewrite && fs.existsSync(targetFilePath)) {
      console.log(`Файл уже существует, пропускаю загрузку: ${targetFilePath}`)

      if (!target.audio || target.audio === 'error') {
        target.audio = `audio/${targetFileName}`
        saveJson(jsonPath, data)
      }
      continue
    }

    try {
      await createTtsAudio(word, targetFilePath)
      target.audio = `audio/${targetFileName}`
    } catch (e) {
      console.log(`Ошибка TTS для "${word}": ${e.message}`)
      target.audio = 'error'
    }

    // сохраняем прогресс после каждого элемента
    saveJson(jsonPath, data)
  }
}

/**
 * Точка входа скрипта.
 *
 * 1. Находит все JSON-файлы в директории наборов.
 * 2. Для каждого файла:
 *    - загружает JSON
 *    - извлекает объекты слов (прямые или внутри категорий)
 *    - фильтрует элементы по необходимости создания аудио
 *    - вызывает Google TTS и сохраняет обновлённый JSON
 */
;(async () => {
  const setFiles = getJsonSetFiles(SETS_DIR)

  if (setFiles.length === 0) {
    console.log('Не найдено JSON-файлов в директории наборов. Работа завершена.')
    return
  }

  console.log(`Найдено наборов: ${setFiles.length}`)
  console.log(setFiles.map((name) => ` - ${path.basename(name)}`).join('\n'))

  for (const jsonPath of setFiles) {
    console.log(`Обрабатываю набор: ${jsonPath}`)

    const data = loadJson(jsonPath)
    const wordItems = collectWordItems(data, jsonPath)
    const itemsToProcess = getItemsToProcess(wordItems, FORCE_REWRITE_AUDIO)

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
