import fs from 'fs'
import path from 'path'
import axios from 'axios'
import puppeteer from 'puppeteer'
import { fileURLToPath } from 'url'

const AUDIO_BUTTON_SELECTOR = 'button.btn_listen.all'
const TTS_ENDPOINT = 'https://translate.google.com/translate_tts'
const TTS_LANG = 'ko'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const OUTPUT_DIR = path.join(__dirname, '../public/audio')
const DEFAULT_JSON_FILE = path.join(__dirname, '../public/syllables.json')
const JSON_FILE = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : DEFAULT_JSON_FILE

console.log(`Использую JSON файл: ${JSON_FILE}`)

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

function loadJson() {
  const raw = fs.readFileSync(JSON_FILE, 'utf8')
  const data = JSON.parse(raw)
  if (!Array.isArray(data)) {
    throw new Error('.json должен содержать массив объектов')
  }
  return data
}

function saveJson(data) {
  fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2), 'utf8')
}

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
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
}

// fallback: создать аудио через Google Translate TTS
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

async function getAudioUrlForWord(browser, word) {
  const page = await browser.newPage()

  try {
    const searchUrl = `https://dict.naver.com/dict.search?query=${encodeURIComponent(word)}`
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 })
    await page.waitForSelector(AUDIO_BUTTON_SELECTOR, { timeout: 10000 })

    const audioRequestPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        page.off('request', handler)
        reject(new Error('no audio request'))
      }, 10000)

      const handler = (req) => {
        const url = req.url()
        if (/\.mp3(\?|$)/i.test(url)) {
          clearTimeout(timeout)
          page.off('request', handler)
          resolve(url)
        }
      }

      page.on('request', handler)
    })

    await page.click(AUDIO_BUTTON_SELECTOR)
    const audioUrl = await audioRequestPromise
    return audioUrl
  } finally {
    await page.close()
  }
}

;(async () => {
  const data = loadJson()
  const itemsToProcess = data.filter(
    (item) => item && item.word && (!item.audio || item.audio === 'error'),
  )

  if (itemsToProcess.length === 0) {
    console.log('Все слова уже имеют поле audio — ничего делать не нужно.')
    return
  }

  console.log(`Нужно обработать слов: ${itemsToProcess.length}`)

  const browser = await puppeteer.launch({ headless: true })

  try {
    let processed = 0
    const total = itemsToProcess.length

    for (const item of itemsToProcess) {
      processed += 1
      const word = item.word
      const percent = ((processed / total) * 100).toFixed(1)

      console.log(`\n[${processed}/${total}] (${percent}%) Обрабатываю слово: "${word}"`)

      const baseSafeName = word.replace(/[\\\/:*?"<>|]/g, '_')
      const naverSafeName = baseSafeName
      const ttsSafeName = `${baseSafeName}_tts`

      const naverFilePath = path.join(OUTPUT_DIR, `${naverSafeName}.mp3`)
      const ttsFilePath = path.join(OUTPUT_DIR, `${ttsSafeName}.mp3`)

      let success = false
      let finalRelativePath = null

      // 1) Пытаемся взять аудио с Naver
      try {
        const url = await getAudioUrlForWord(browser, word)

        if (!url) {
          console.log(`Не удалось найти урл для "${word}" на Naver, пробую TTS`)
        } else {
          console.log(`Найден урл для "${word}": ${url}`)
          console.log(`Скачиваю "${word}" -> ${naverFilePath}`)
          await downloadFileWithRetry(url, naverFilePath, 3)
          console.log(`Готово: ${naverFilePath}`)
          success = true
          finalRelativePath = `audio/${naverSafeName}.mp3`
        }
      } catch (e) {
        console.log(`Ошибка получения аудио из Naver для "${word}": ${e.message}. Пробую TTS.`)
      }

      // 2) Если с Naver не получилось — fallback в TTS (_tts)
      if (!success) {
        try {
          await createTtsAudio(word, ttsFilePath)
          success = true
          finalRelativePath = `audio/${ttsSafeName}.mp3`
        } catch (e) {
          console.log(`Ошибка TTS для "${word}": ${e.message}`)
        }
      }

      if (success && finalRelativePath) {
        item.audio = finalRelativePath
      } else {
        item.audio = 'error'
      }

      saveJson(data)
    }
  } finally {
    await browser.close()
  }

  console.log('\nОбработка завершена.')
})()
