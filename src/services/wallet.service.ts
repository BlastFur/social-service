import { Transaction } from 'sequelize'
import { Application, UserWallet } from '../db/models'
import { UserWalletData, UserWalletType } from '../db/models/UserWallet/types'
import { checkWalletAddress } from '../db/models/UserWallet/utils'
import { SiweMessage } from 'siwe'
import { getAddress } from 'ethers6'
import { uuid } from '../utils'
import { ApplicationUserQuery } from './types'

export async function upsertWallet(
  payload: UserWalletData,
  transaction?: Transaction
): Promise<UserWallet> {
  if (!(await checkWalletAddress(payload.type, payload.address))) {
    throw new Error(`Invalid wallet address of type ${payload.type}`)
  }
  const addressExist = await UserWallet.findOne({
    where: {
      applicationId: payload.applicationId,
      address: payload.address,
      type: payload.type,
    },
  })
  if (addressExist) {
    throw new Error(`Wallet address ${payload.address} already exists`)
  }
  const exist = await UserWallet.findOne({
    where: {
      applicationId: payload.applicationId,
      userKey: payload.userKey,
      type: payload.type,
    },
    transaction,
  })
  if (exist) {
    await exist.update(
      {
        address: payload.address,
        isSignup: payload.isSignup,
        memo: payload.memo,
        extra: payload.extra,
      },
      { transaction }
    )
    return exist
  }
  return await UserWallet.create(
    {
      applicationId: payload.applicationId,
      userKey: payload.userKey,
      type: payload.type,
      address: payload.address,
      isSignup: payload.isSignup,
      memo: payload.memo,
      extra: payload.extra,
    },
    { transaction }
  )
}

export async function getUserWallets(
  applicationId: number,
  userKey: string
): Promise<UserWallet[]> {
  return await UserWallet.findAll({
    where: {
      applicationId,
      userKey,
    },
  })
}

export async function findByAddress(
  applicationId: number,
  address: string,
  type?: UserWalletType
): Promise<UserWallet | null> {
  const where: any = {
    applicationId,
    address,
  }
  if (type) {
    where.type = type
  }
  const wallet = await UserWallet.findOne({
    where,
  })
  if (!wallet) return null
  return wallet
}

export interface WalletSignRequestPayload {
  type: UserWalletType
  address: string
  domain: string
  uri: string
  chainId: number
  version?: string
  applicationQuery?: ApplicationUserQuery
}

export interface WalletSignRequestData {
  address: string
  nonce: string
  message: string
  type: UserWalletType
}

export interface WalletSignVerifyPayload {
  request: WalletSignRequestData
  signature: string
  applicationQuery?: ApplicationUserQuery
  data?: any
}

export interface WalletSignVerifyResult {
  address: string
  expirationTime?: string
}

export async function requestWalletSign(
  payload: WalletSignRequestPayload,
  applicationId?: number
): Promise<WalletSignRequestData> {
  if (applicationId && payload.applicationQuery) {
    const wallet = await findByAddress(
      applicationId,
      payload.address,
      payload.type
    )
    if (!wallet || wallet.userKey !== payload.applicationQuery.userKey) {
      throw new Error('Wallet not found')
    }
  }

  if (payload.type === 'evm') {
    const address = getAddress(payload.address)
    const nonce = uuid(8)
    try {
      const message = new SiweMessage({
        domain: payload.domain,
        address,
        statement: 'Sign in with Ethereum to the app.',
        // TODO:
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        uri: payload.uri,
        version: payload.version ?? '1',
        chainId: payload.chainId,
        nonce,
      })
      const m = message.prepareMessage()
      return {
        nonce,
        message: m,
        address,
        type: payload.type,
      }
    } catch (error) {
      if ((error as any).error) {
        throw new Error((error as any).error.type)
      }
      throw error
    }
  }
  throw new Error('Unsupported wallet type')
}

export async function verfiyWalletSign(
  payload: WalletSignVerifyPayload,
  applicationId?: number
): Promise<WalletSignVerifyResult> {
  if (applicationId && payload.applicationQuery) {
    const wallet = await findByAddress(
      applicationId,
      payload.request.address,
      payload.request.type
    )
    if (!wallet || wallet.userKey !== payload.applicationQuery.userKey) {
      throw new Error('Wallet not found')
    }
  }

  if (payload.request.type === 'evm') {
    const { request, signature } = payload
    const { message, nonce, type, address } = request
    if (!message || !signature || !nonce || !address) {
      throw new Error('Expected prepareMessage object as body.')
    }
    if (type === 'evm') {
      const SIWEObject = new SiweMessage(message)
      try {
        const SIWEResp = await SIWEObject.verify({
          signature,
          nonce,
        })
        const SIWEData = SIWEResp.data
        if (SIWEData.address.toLowerCase() !== address.toLowerCase()) {
          throw new Error('Address mismatch.')
        }
        return {
          address: address.toLowerCase(),
          expirationTime: SIWEData.expirationTime,
        }
      } catch (error) {
        if ((error as any).error) {
          throw new Error((error as any).error.type)
        }
        throw error
      }
    }
  }
  throw new Error('Unsupported wallet type')
}

export async function destoryWallet(
  application: Application,
  userKey: string
): Promise<void> {
  await UserWallet.destroy({
    where: {
      applicationId: application.id,
      userKey,
    },
  })
}

export async function destoryAllWallet(
  application: Application
): Promise<void> {
  await UserWallet.destroy({
    where: {
      applicationId: application.id,
    },
  })
}

const walletService = {
  upsertWallet,
  getUserWallets,
  findByAddress,
  requestWalletSign,
  verfiyWalletSign,
  destoryWallet,
  destoryAllWallet,
}

export default walletService
