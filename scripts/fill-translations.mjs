import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dns from 'dns';
import { fileURLToPath } from 'url';

dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SOURCE_PATH = path.join(__dirname, '..', 'public', 'source.json');

/**
 * Переводит латинскую романизацию корейского слова в приблизительную русскую транскрипцию.
 * @param {string} romanization Романизация, полученная из сервиса перевода.
 * @returns {string} Строка транскрипции, записанная кириллицей.
 */
function romanizationToCyrillic(romanization) {
  if (!romanization) {
    return '';
  }

  const combos = [
    ['yeo', 'ё'],
    ['yae', 'йэ'],
    ['wae', 'вэ'],
    ['ae', 'э'],
    ['eo', 'о'],
    ['oe', 'ве'],
    ['ui', 'ый'],
    ['ya', 'я'],
    ['ye', 'е'],
    ['yo', 'ё'],
    ['yu', 'ю'],
    ['wa', 'ва'],
    ['we', 'ве'],
    ['wi', 'ви'],
    ['wo', 'во'],
    ['ng', 'нг'],
    ['kk', 'кк'],
    ['tt', 'тт'],
    ['pp', 'пп'],
    ['ss', 'сс'],
    ['jj', 'чч'],
    ['ch', 'ч'],
  ];

  const singleMap = {
    a: 'а',
    b: 'б',
    c: 'к',
    d: 'д',
    e: 'е',
    f: 'ф',
    g: 'г',
    h: 'х',
    i: 'и',
    j: 'дж',
    k: 'к',
    l: 'ль',
    m: 'м',
    n: 'н',
    o: 'о',
    p: 'п',
    q: 'к',
    r: 'р',
    s: 'с',
    t: 'т',
    u: 'у',
    v: 'в',
    w: 'в',
    x: 'кс',
    y: 'й',
    z: 'з',
  };

  const lower = romanization.toLowerCase();
  let result = '';
  let index = 0;

  while (index < lower.length) {
    const substring = lower.slice(index);
    const combo = combos.find(([pattern]) => substring.startsWith(pattern));
    if (combo) {
      result += combo[1];
      index += combo[0].length;
      continue;
    }

    const current = lower[index];

    if (singleMap[current]) {
      result += singleMap[current];
    } else {
      result += current;
    }

    index += 1;
  }

  return result.replace(/\s+/g, ' ').trim();
}

/**
 * Возвращает перевод и транскрипцию для слова, используя публичный API Google Translate.
 * @param {string} word Корейское слово для перевода.
 * @param {number} attempt Номер текущей попытки запроса.
 * @returns {Promise<{ translation: string; transcription: string }>} Пара перевод/транскрипция.
 */
async function fetchTranslationData(word, attempt = 1) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=ru&dt=t&dt=rm&q=${encodeURIComponent(word)}`;

  try {
    const response = await axios.get(url);
    const payload = response.data;
    const translation = payload?.[0]?.[0]?.[0] ?? '';
    const romanization = payload?.[0]?.[1]?.[3] ?? '';
    const transcription = romanizationToCyrillic(romanization);

    return { translation, transcription };
  } catch (error) {
    if (attempt >= 3) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    return fetchTranslationData(word, attempt + 1);
  }
}

/**
 * Сохраняет обновлённые данные обратно в JSON-файл.
 * @param {unknown[]} data Массив словарных объектов.
 */
function saveData(data) {
  fs.writeFileSync(SOURCE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Обрабатывает набор слов параллельно, чтобы ускорить заполнение файла.
 * @param {unknown[]} data Полный массив словарных записей.
 * @param {unknown[]} missing Подмассив записей без перевода или транскрипции.
 * @returns {Promise<void>} Промис, который завершается после сохранения обновлений.
 */
async function processInBatches(data, missing) {
  const concurrency = 75;
  let processed = 0;

  for (let index = 0; index < missing.length; index += concurrency) {
    const chunk = missing.slice(index, index + concurrency);

    await Promise.all(
      chunk.map(async (item) => {
        const { translation, transcription } = await fetchTranslationData(item.word);

        if (!item.translation) {
          item.translation = translation;
        }

        if (!item.transcription) {
          item.transcription = transcription;
        }
      })
    );

    processed += chunk.length;

    if (processed % 50 === 0 || processed >= missing.length) {
      console.log(`Обработано ${processed}/${missing.length}`);
      saveData(data);
    }
  }
}

async function main() {
  const raw = fs.readFileSync(SOURCE_PATH, 'utf8');
  const data = JSON.parse(raw);
  const missing = data.filter((item) => !item.translation || !item.transcription);

  console.log(`Нужно дополнить ${missing.length} записей`);

  await processInBatches(data, missing);

  saveData(data);
  console.log('Готово');
}

main().catch((error) => {
  console.error('Ошибка выполнения:', error.message);
  process.exit(1);
});
