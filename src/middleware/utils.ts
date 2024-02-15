import { Request } from 'express'
import parseFingerprint, { Fingerprint } from '../utils/fingerprint'
import { stringifyIP } from '../utils/ip'

export interface SacteTokenInfo {
  jwt: string
  fingerprint: Fingerprint | null
  ip: string | null
  userAgent: string | null
}

export function getTobotoToken(request: Request): SacteTokenInfo | null {
  // format: [x.y.z](jwt)[.0..0](base64 fingerprint)
  const token = request.get('x-access-token')
  if (!token || token.length < 10) return null
  const arr = token.split('.')
  if (arr.length < 3) return null
  const jwt = arr.slice(0, 3).join('.')
  const ret: SacteTokenInfo = {
    jwt,
    fingerprint: null,
    ip: null,
    userAgent: request.headers['user-agent'] ?? null,
  }
  if (arr[3]) {
    ret.fingerprint = parseFingerprint(atob(arr[3]))
  }
  if (request.headers['x-forwarded-for']) {
    // format 255.255.255.255
    ret.ip = stringifyIP(request.headers['x-forwarded-for'] as string)
  }
  return ret
}
