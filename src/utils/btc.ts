import { Address } from '@cmdcode/tapscript'

export function isBtcAddress(addr: string): boolean {
  let regSuccess = false
  if (Address.p2pkh.check(addr)) regSuccess = true
  if (Address.p2sh.check(addr)) regSuccess = true
  if (Address.p2tr.check(addr)) regSuccess = true
  if (Address.p2wpkh.check(addr)) regSuccess = true
  if (Address.p2wsh.check(addr)) regSuccess = true
  if (!regSuccess) return false
  if (regSuccess) {
    try {
      Address.toScriptPubKey(addr)
    } catch (error) {
      return false
    }
  }
  return true
}
