const IPReg = /^(\d+).(\d+).(\d+).(\d+)$/
export function stringifyIP(ip: string): string | null {
  try {
    const match = ip.match(IPReg)
    if (!match) return null
    const parts = [
      parseInt(match[1]),
      parseInt(match[2]),
      parseInt(match[3]),
      parseInt(match[4]),
    ]
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (part < 0 || part > 255) return null
    }
    const txt = parts.map((part) => part.toString(16).padStart(2, '0')).join('')
    return txt
  } catch (error) {
    console.log(error)
    return null
  }
}

export function parseIP(txt: string): string {
  const parts = [
    txt.slice(0, 2),
    txt.slice(2, 4),
    txt.slice(4, 6),
    txt.slice(6, 8),
  ]
  return parts.map((part) => parseInt(part, 16)).join('.')
}
