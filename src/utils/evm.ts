import Decimal from 'decimal.js-light'
import { ethers, Wallet, JsonRpcProvider } from 'ethers6'

export function getRpcProvider(rpcs: string[]): () => JsonRpcProvider {
  const index = Math.floor(Math.random() * rpcs.length)
  return () => new JsonRpcProvider(rpcs[index])
}

const EvmRpcProviders = {
  mainnet: getRpcProvider(['https://eth.llamarpc.com']),
  goerli: getRpcProvider(['https://eth-goerli.public.blastapi.io']),
  scrollAlpha: getRpcProvider(['https://alpha-rpc.scroll.io/l2']),
  bsc: getRpcProvider(['https://bsc-dataseed.binance.org']),
  bscTestnet: getRpcProvider([
    'https://data-seed-prebsc-1-s3.binance.org:8545',
  ]),
  arbitrum: getRpcProvider([
    'https://endpoints.omniatech.io/v1/arbitrum/one/public',
  ]),
  optimism: getRpcProvider([
    'https://endpoints.omniatech.io/v1/op/mainnet/public',
  ]),
  avax: getRpcProvider(['https://api.avax.network/ext/bc/C/rpc']),
  polygonMainnet: getRpcProvider([
    'https://multi-small-snow.matic.quiknode.pro/53a237fac79712ea5e829c7330f59d4efee30794/',
  ]),
  polygonTestnet: getRpcProvider([
    'https://polygon-mumbai.blockpi.network/v1/rpc/public',
  ]),
  zkSyncMainnet: getRpcProvider(['https://mainnet.era.zksync.io']),
  lineaMainnet: getRpcProvider(['https://rpc.linea.build']),
}

function isPrivateKey(pk: string): boolean {
  return pk.startsWith('0x') && pk.length === 66
}

export function getWallet(
  getRpcProvider: () => JsonRpcProvider,
  privateKeyOrMnemonic: string
): Wallet {
  let privateKey = privateKeyOrMnemonic
  const rpcProvider = getRpcProvider()
  if (!isPrivateKey(privateKey)) {
    const w = ethers.Wallet.fromPhrase(privateKeyOrMnemonic, rpcProvider)
    privateKey = w.privateKey
  }
  const wallet = new ethers.Wallet(privateKey, rpcProvider)
  return wallet
}

const EvmRpcWallets: {
  [key: string]: (privateKeyOrMnemonic: string) => ethers.Wallet
} = {
  mainnet: getWallet.bind(undefined, EvmRpcProviders.mainnet),
  goerli: getWallet.bind(undefined, EvmRpcProviders.goerli),
  scrollAlpha: getWallet.bind(undefined, EvmRpcProviders.scrollAlpha),
  bsc: getWallet.bind(undefined, EvmRpcProviders.bsc),
  bscTestnet: getWallet.bind(undefined, EvmRpcProviders.bscTestnet),
  arbitrum: getWallet.bind(undefined, EvmRpcProviders.arbitrum),
  optimism: getWallet.bind(undefined, EvmRpcProviders.optimism),
  avax: getWallet.bind(undefined, EvmRpcProviders.avax),
  polygonMainnet: getWallet.bind(undefined, EvmRpcProviders.polygonMainnet),
  polygonTestnet: getWallet.bind(undefined, EvmRpcProviders.polygonTestnet),
  zkSyncMainnet: getWallet.bind(undefined, EvmRpcProviders.zkSyncMainnet),
  lineaMainnet: getWallet.bind(undefined, EvmRpcProviders.lineaMainnet),
}

const EvmExplorers = {
  mainnet: 'https://etherscan.io',
  goerli: 'https://goerli.etherscan.io',
  scrollAlpha: 'https://blockscout.scroll.io',
  bsc: 'https://bscscan.com',
  bscTestnet: 'https://testnet.bscscan.com',
  arbitrum: 'https://arbiscan.io',
  optimism: 'https://optimistic.etherscan.io',
  avax: 'https://snowtrace.io',
  polygonMainnet: 'https://polygonscan.com',
  polygonTestnet: 'https://mumbai.polygonscan.com',
  zkSyncMainnet: 'https://explorer.zksync.io',
  lineaMainnet: 'https://lineascan.build',
}

function evmLink(base: string, sub: string, hash: string): string {
  return `${base}/${sub}/${hash}`
}

const EvmTxLink: { [key: string]: (hash: string) => string } = {
  mainnet: evmLink.bind(undefined, EvmExplorers.mainnet, 'tx'),
  goerli: evmLink.bind(undefined, EvmExplorers.goerli, 'tx'),
  scrollAlpha: evmLink.bind(undefined, EvmExplorers.scrollAlpha, 'tx'),
  bsc: evmLink.bind(undefined, EvmExplorers.bsc, 'tx'),
  bscTestnet: evmLink.bind(undefined, EvmExplorers.bscTestnet, 'tx'),
  arbitrum: evmLink.bind(undefined, EvmExplorers.arbitrum, 'tx'),
  optimism: evmLink.bind(undefined, EvmExplorers.optimism, 'tx'),
  avax: evmLink.bind(undefined, EvmExplorers.avax, 'tx'),
  polygonMainnet: evmLink.bind(undefined, EvmExplorers.polygonMainnet, 'tx'),
  polygonTestnet: evmLink.bind(undefined, EvmExplorers.polygonTestnet, 'tx'),
  zkSyncMainnet: evmLink.bind(undefined, EvmExplorers.zkSyncMainnet, 'tx'),
  lineaMainnet: evmLink.bind(undefined, EvmExplorers.lineaMainnet, 'tx'),
}

export const MAX_ETH_NUM =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935'

export const MAX_UINT128 = '340282366920938463463374607431768211455'

export { EvmRpcProviders, EvmRpcWallets, EvmExplorers, EvmTxLink }

async function rawTransferFromWalletTo(
  fromWallet: Wallet,
  to: string,
  amount: string,
  gasPrice?: string,
  gasLimit?: string
): Promise<ethers.TransactionReceipt> {
  const tx = await fromWallet.sendTransaction({
    to,
    value: amount,
    gasLimit,
    gasPrice,
  })
  const txWait = await tx.wait()
  return txWait!
}

export async function transferFromWalletTo(
  fromWallet: Wallet,
  to: string,
  amount: string,
  gasPrice?: string
): Promise<ethers.TransactionReceipt> {
  const provider = fromWallet.provider!
  const balance = (await provider.getBalance(fromWallet.address)).toString()
  let price = gasPrice
  if (!price) {
    price = (await provider.getFeeData()).gasPrice?.toString()
  }
  if (!price) {
    throw new Error('gasPrice not found')
  }
  const gasLimit = '21000'
  const gasCost = new Decimal(gasLimit).mul(new Decimal(price))
  const balanceExcFee = new Decimal(balance).minus(gasCost)
  if (balanceExcFee.lt(amount)) {
    throw new Error('insufficient funds')
  }
  try {
    return await rawTransferFromWalletTo(
      fromWallet,
      to,
      amount,
      gasPrice,
      gasLimit
    )
  } catch (error) {
    console.log('transferFromWalletTo error', error)
    throw error
  }
}

export async function collectBalanceFromWalletTo(
  fromWallet: Wallet,
  to: string,
  gasPrice?: string
): Promise<ethers.TransactionReceipt> {
  const provider = fromWallet.provider!
  const balance = (await provider.getBalance(fromWallet.address)).toString()
  let price = gasPrice
  if (!price) {
    price = (await provider.getFeeData()).gasPrice?.toString()
  }
  if (!price) {
    throw new Error('gasPrice not found')
  }
  const gasLimit = '21000'
  const gasCost = new Decimal(gasLimit).mul(new Decimal(price))
  const balanceExcFee = new Decimal(balance).minus(gasCost)
  if (balanceExcFee.lte(0)) {
    throw new Error('insufficient funds')
  }
  try {
    return await rawTransferFromWalletTo(
      fromWallet,
      to,
      balanceExcFee.toString(),
      gasPrice,
      gasLimit
    )
  } catch (error) {
    console.log('collectBalanceFromWalletTo error', error)
    throw error
  }
}

const ethAddressReg = /^0x[a-fA-F0-9]{40}$/
export function isEthAddress(addr: string): boolean {
  return ethAddressReg.test(addr)
}
