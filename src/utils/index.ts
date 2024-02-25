import { filledBar } from 'string-progressbar'
import Decimal from 'decimal.js-light'
import moment, { MomentInput } from 'moment'
import uuid from './uuid'

// import { getChatMember } from './telegram'

// export const telegram = {
//   getChatMember,
// }

export { uuid }

const { DEBUG } = process.env

export function debug(message: string): void {
  if (DEBUG === '1') {
    console.log(message)
  }
}

// https://www.compart.com/en/unicode/block/U+2580
export function drawProgressBar(
  total: number,
  current: number,
  size = 30,
  line = '-',
  slider = '=',
  arrow = '>'
): string {
  const d = filledBar(total, Math.max(current, 0), size, line, slider)[0]
  if (d.startsWith(line)) return d
  if (d.endsWith(slider)) return d
  const i = d.indexOf(line)
  const dd = d.split('')
  dd[i - 1] = arrow
  return dd.join('')
}

export function randomGt(gt = 0.5): boolean {
  return Math.random() > gt
}

export function randomPickInt(max: number, min = 0): number {
  return Math.floor(Math.random() * (max - min) + min)
}

export function randomPick<T>(source: T[]): T {
  return source[Math.floor(Math.random() * source.length)]
}

export function pointInMap(point: number, map: number[]): number {
  let lv = 0
  for (let i = 0; i < map.length; i++) {
    lv = i
    if (point < map[i]) {
      break
    }
  }
  return lv
}

interface RandomMap<T> {
  data: T
  weight: number
}

export function randomMapPick<T>(source: Array<RandomMap<T>>): T {
  if (source.length === 1) {
    return source[0].data
  }
  const accumulateWeights = source.map((_, i) => {
    return source
      .slice(0, i + 1)
      .map((rm) => rm.weight)
      .reduce((a, b) => a + b, 0)
  })
  const point = Math.random() * accumulateWeights[accumulateWeights.length - 1]
  const index = pointInMap(point, accumulateWeights)
  return source[index].data
}

export const sleep = async (ms: number): Promise<void> =>
  await new Promise((resolve) => setTimeout(resolve, ms))

export function debounce<Params extends any[]>(
  func: (...args: Params) => any,
  timeout: number
): (...args: Params) => NodeJS.Timeout {
  let timer: NodeJS.Timeout
  return (...args: Params) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func(...args)
    }, timeout)
    return timer
  }
}

export function label2key(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-bA-b0-9 ]/gi, '')
    .replace(/ +/gi, '_')
}

export function formatEthHash(
  addr: string,
  afterRemain = 4,
  beforeRemain = 4
): string {
  if (addr.length <= afterRemain + beforeRemain) return addr
  return `${addr.slice(0, beforeRemain)}...${addr.slice(-afterRemain)}`
}

export function isValidEmail(email: string): boolean {
  // 创建正则表达式，用于匹配邮箱地址
  const emailRegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  // 使用RegExp.test()函数，若匹配返回true，否则返回false
  return emailRegExp.test(email)
}

export function emailDesensitization(
  email: string | null | undefined
): string | null {
  // 在调用split方法之前先检查email是否存在
  if (!email) {
    return null
  }

  // 切割用户名和服务域名部分
  const [username, domain] = email.split('@')

  // 对用户名部分进行处理
  let usernameDesensitized
  if (username.length <= 3) {
    usernameDesensitized = username
  } else {
    usernameDesensitized = username.slice(0, 3) + '***'
  }

  // 对域名部分进行处理
  const domainParts = domain.split('.')
  let domainDesensitized = ''
  for (let i = 0; i < domainParts.length - 1; i++) {
    if (domainParts[i].length > 1) {
      domainDesensitized +=
        domainParts[i].slice(0, 1) + '*'.repeat(domainParts[i].length - 1) + '.'
    } else {
      domainDesensitized += domainParts[i] + '.'
    }
  }
  domainDesensitized += domainParts[domainParts.length - 1]

  // 返回脱敏后的邮箱
  return usernameDesensitized + '@' + domainDesensitized
}

export function tokenHumanAmount(
  realAmount: string,
  decimals = 18,
  fixed?: number
): string {
  const bn = new Decimal(realAmount)
  const de = new Decimal(10).pow(decimals)
  const ret = bn.div(de)
  if (fixed) {
    return ret.toFixed(fixed, 3).toString()
  }
  return ret.toString()
}

export function tokenRealAmount(humanAmount: string, decimals = 18): string {
  const bn = new Decimal(humanAmount)
  const de = new Decimal(10).pow(decimals)
  return bn.mul(de).toString()
}

// export function gwei(wei: string): string {
//   return tokenHumanAmount(wei, 9)
// }

// export function eth(wei: string): string {
//   return tokenHumanAmount(wei, 18)
// }

export function formatNumberString(numStr: string, precision = 2): string {
  const num = parseFloat(numStr)
  if (isNaN(num)) return 'NaN'
  const [p1, p2] = numStr.split('.')
  return `${p1}.${(
    (p2 || '').slice(0, precision) + '0'.repeat(precision)
  ).slice(0, precision)}`
}

export function formatSeconds(secs: number): string {
  const pad = (n: number): string => (n < 10 ? `0${n}` : n.toString())

  const h = Math.floor(secs / 3600)
  const m = Math.floor(secs / 60) - h * 60
  const s = Math.floor(secs - h * 3600 - m * 60)

  return `${pad(h)}:${pad(m)}:${pad(s)}`
}
