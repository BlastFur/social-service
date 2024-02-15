export type ConstantKind = 'parameter' | 'information' | 'ui'
export type ConstantType = 'decimal' | 'string' | 'boolean'

export interface ConstantData {
  name: string
  kind: ConstantKind
  type: ConstantType
  memo: string | null
  readOnly: boolean
  value: string | boolean | number | null | undefined
}
