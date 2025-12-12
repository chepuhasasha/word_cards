import fs from 'fs/promises'
import path from 'path'

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
}

function shuffleInPlace(arr) {
  // Fisher–Yates
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function parseArgs(argv) {
  const [setsPath, outDir, chunkSizeStr] = argv.slice(2)
  if (!setsPath || !outDir) {
    throw new Error('Args: <sets.json> <outDir> [chunkSize=20]')
  }
  const chunkSize = Number(chunkSizeStr ?? 20)
  if (!Number.isFinite(chunkSize) || chunkSize <= 0) {
    throw new Error('chunkSize must be a positive number')
  }
  return { setsPath, outDir, chunkSize }
}

async function main() {
  const { setsPath, outDir, chunkSize } = parseArgs(process.argv)

  const setsAbs = path.resolve(process.cwd(), setsPath)
  const baseDir = path.dirname(setsAbs)

  const list = await readJson(setsAbs)
  if (!Array.isArray(list)) throw new Error('sets.json must be an array of file paths')

  // 1) load all arrays
  const all = []
  for (const rel of list) {
    if (typeof rel !== 'string') continue
    const fileAbs = path.resolve(baseDir, rel)
    const data = await readJson(fileAbs)
    if (!Array.isArray(data)) {
      throw new Error(`File is not an array: ${fileAbs}`)
    }
    all.push(...data)
  }

  shuffleInPlace(all)

  const chunks = chunk(all, chunkSize)
  const outAbs = path.resolve(process.cwd(), outDir)
  await fs.mkdir(outAbs, { recursive: true })

  let from = 1
  for (const part of chunks) {
    const to = from + part.length - 1
    const name = `topik_1_${from}_${to}.json`
    const fileOut = path.join(outAbs, name)
    await writeJson(fileOut, part)
    from = to + 1
  }

  console.log(`Done: ${all.length} items -> ${chunks.length} files in ${outAbs}`)
}

main().catch((e) => {
  console.error(e?.stack || String(e))
  process.exit(1)
})
