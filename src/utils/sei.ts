const seiAddressReg = /^sei1[0-9a-zA-Z]{38}$/
export function isSeiAddress(addr: string): boolean {
  return seiAddressReg.test(addr)
}
