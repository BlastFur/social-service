import { isBtcAddress } from '../../../utils/btc'
import { isEthAddress } from '../../../utils/evm'
import { isSeiAddress } from '../../../utils/sei'
import { UserWalletType } from './types'

export async function checkWalletAddress(
  type: UserWalletType,
  address: string
): Promise<boolean> {
  if (type === 'evm') {
    return isEthAddress(address)
  }
  if (type === 'btc') {
    return isBtcAddress(address)
  }
  if (type === 'sei') {
    return isSeiAddress(address)
  }
  return false
}
