import type { Word } from './word'

export type EmbeddedSet = {
  id: string
  label: string
  words: Word[]
  size: number
}
