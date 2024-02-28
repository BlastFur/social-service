import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 16)

export default nanoid

type uuid = (size?: number | undefined) => string

export function customUUid(alphabet: string, size: number): uuid {
  return customAlphabet(alphabet, size)
}
