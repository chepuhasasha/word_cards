const fs = require('fs');
const path = require('path');
const axios = require('axios');
const puppeteer = require('puppeteer');

const WORDS = [
  "것",
  "하다",
  "있다",
]

const AUDIO_BUTTON_SELECTOR = 'button.btn_listen.all';
const OUTPUT_DIR = path.join(__dirname, 'audio');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
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
  const browser = await puppeteer.launch({ headless: false });
  const results = [];

  try {
    for (const word of WORDS) {
      try {
        const url = await getAudioUrlForWord(browser, word);
        console.log(`${word}: ${url || 'нет урла'}`);
        results.push({ word, url });
      } catch (e) {
        console.log(`${word}: ошибка — ${e.message}`);
        results.push({ word, url: null });
      }
    }
  } finally {
    await browser.close();
  }

  for (const { word, url } of results) {
    if (!url) continue;

    const safeName = word.replace(/[\\\/:*?"<>|]/g, '_');
    const filePath = path.join(OUTPUT_DIR, `${safeName}.mp3`);

    try {
      console.log(`Скачиваю ${word} -> ${filePath}`);
      await downloadFile(url, filePath);
      console.log(`Готово: ${filePath}`);
    } catch (e) {
      console.log(`Ошибка загрузки для ${word}: ${e.message}`);
    }
  }
})();
