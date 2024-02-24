export type UserWalletType = 'evm' | 'btc' | 'sei' | 'email'

export interface UserWalletData {
  applicationId: number
  userKey: string
  type: UserWalletType
  address: string
  isSignup: boolean
  memo: string | null
  extra: any | null
}
