export interface Fingerprint {
  version: number
  label: string
  data: string | null
}

const V1Reg = /^[0123456789abcdef]{32}$/
function parseV1LabelData(label: string): Fingerprint | null {
  if (V1Reg.test(label)) {
    return {
      version: 1,
      label,
      data: null,
    }
  }
  return null
}

// format: [00](version)[0..0](label)
export default function parseFingerprint(message: string): Fingerprint | null {
  const version = parseInt(message.substring(0, 2), 16)
  const label = message.substring(2)

  switch (version) {
    case 1:
      return parseV1LabelData(label)
  }

  return null
}
