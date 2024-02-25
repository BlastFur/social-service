import { isEthAddress } from '../../../utils/evm'
import { UserWalletType } from './types'

export async function checkWalletAddress(
  type: UserWalletType,
  address: string
): Promise<boolean> {
  if (type === 'evm') {
    return isEthAddress(address)
  }
  return false
}
