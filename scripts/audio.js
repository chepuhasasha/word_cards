import fs from 'fs';
import path from 'path';
import axios from 'axios';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';

const AUDIO_BUTTON_SELECTOR = 'button.btn_listen.all';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../public/audio');
const JSON_FILE = path.join(__dirname, '../public/numbers.json');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function loadJson() {
  const raw = fs.readFileSync(JSON_FILE, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error('.json должен содержать массив объектов');
  }
  return data;
}

function saveJson(data) {
  fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2), 'utf8');
}

async function downloadFile(url, filePath) {
  const res = await axios.get(url, { responseType: 'stream' });
  await new Promise((resolve, reject) => {
    const w = fs.createWriteStream(filePath);
    res.data.pipe(w);
    w.on('finish', resolve);
    w.on('error', reject);
  });
}

async function downloadFileWithRetry(url, filePath, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await downloadFile(url, filePath);
      return;
    } catch (e) {
      console.log(
        `Ошибка скачивания (попытка ${attempt}/${maxAttempts}) для "${filePath}": ${e.message}`
      );
      if (attempt === maxAttempts) {
        throw e;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

async function getAudioUrlForWord(browser, word) {
  const page = await browser.newPage();

  try {
    const searchUrl = `https://dict.naver.com/dict.search?query=${encodeURIComponent(word)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForSelector(AUDIO_BUTTON_SELECTOR, { timeout: 10000 });

    const audioRequestPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        page.off('request', handler);
        reject(new Error('no audio request'));
      }, 10000);

      const handler = (req) => {
        const url = req.url();
        if (/\.mp3(\?|$)/i.test(url)) {
          clearTimeout(timeout);
          page.off('request', handler);
          resolve(url);
        }
      };

      page.on('request', handler);
    });

    await page.click(AUDIO_BUTTON_SELECTOR);
    const audioUrl = await audioRequestPromise;
    return audioUrl;
  } finally {
    await page.close();
  }
}

(async () => {
  const data = loadJson();
  const itemsToProcess = data.filter(
    (item) => item && item.word && !item.audio
  );

  if (itemsToProcess.length === 0) {
    console.log('Все слова уже имеют поле audio — ничего делать не нужно.');
    return;
  }

  console.log(`Нужно обработать слов: ${itemsToProcess.length}`);

  const browser = await puppeteer.launch({ headless: true });

  try {
    for (const item of itemsToProcess) {
      const word = item.word;
      console.log(`\nОбрабатываю слово: "${word}"`);

      try {
        const url = await getAudioUrlForWord(browser, word);

        if (!url) {
          console.log(`Не удалось найти урл для "${word}"`);
          item.audio = 'error';
          saveJson(data);
          continue;
        }

        console.log(`Найден урл для "${word}": ${url}`);

        const safeName = word.replace(/[\\\/:*?"<>|]/g, '_');
        const filePath = path.join(OUTPUT_DIR, `${safeName}.mp3`);

        console.log(`Скачиваю "${word}" -> ${filePath}`);
        await downloadFileWithRetry(url, filePath, 3);
        console.log(`Готово: ${filePath}`);

        item.audio = `audio/${safeName}.mp3`;
        saveJson(data);
      } catch (e) {
        console.log(`Ошибка для "${word}": ${e.message}`);
        item.audio = 'error';
        saveJson(data);
      }
    }
  } finally {
    await browser.close();
  }

  console.log('\nОбработка завершена.');
})();
