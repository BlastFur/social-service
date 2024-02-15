import {
  DefaultEVMHelperChainRPCs,
  DefaultEVMHelperExplorerURLs,
  DefaultEVMHelperScanAPIUrls,
  SupportedEVMHelperChains,
} from './types'
import { RPC } from './dbModels'
import { ethers, JsonRpcProvider, TransactionReceipt, Wallet } from 'ethers6'
import axios from 'axios'

function isPrivateKey(pk: string): boolean {
  return pk.startsWith('0x') && pk.length === 66
}

export default class EVMHelper {
  constructor(readonly chain: SupportedEVMHelperChains) {}

  get explorer(): string {
    return DefaultEVMHelperExplorerURLs[this.chain]
  }

  async getRandomRPC(): Promise<[string, number]> {
    const rpcs = await RPC.getRPCList(this.chain)
    if (rpcs.length === 0) {
      return [DefaultEVMHelperChainRPCs[this.chain], -1]
    }
    const rpc = rpcs[Math.floor(Math.random() * rpcs.length)]
    return [rpc.rpc, rpc.id]
  }

  async getRpcProvider(rpc?: string): Promise<JsonRpcProvider> {
    let usingRpcIndex = rpc ? -2 : -1
    let usingRpc = rpc ?? ''
    if (!rpc) {
      const [rpc, id] = await this.getRandomRPC()
      usingRpc = rpc
      usingRpcIndex = id
    }
    const provider = new JsonRpcProvider(usingRpc)
    ;(provider as any).__usingRpcIndex = usingRpcIndex
    ;(provider as any).__usingRpc = usingRpc
    return provider
  }

  getWallet(
    rpcProvider: JsonRpcProvider,
    privateKeyOrMnemonic: string
  ): Wallet {
    let privateKey = privateKeyOrMnemonic
    if (!isPrivateKey(privateKey)) {
      const w = ethers.Wallet.fromPhrase(privateKeyOrMnemonic, rpcProvider)
      privateKey = w.privateKey
    }
    const wallet = new ethers.Wallet(privateKey, rpcProvider)
    return wallet
  }

  async getRandomProviderWallet(privateKeyOrMnemonic: string): Promise<Wallet> {
    const rpcProvider = await this.getRpcProvider()
    return this.getWallet(rpcProvider, privateKeyOrMnemonic)
  }

  link(sub: string, hash: string): string {
    return `${this.explorer}/${sub}/${hash}`
  }

  txLink(hash: string): string {
    return this.link('tx', hash)
  }

  // https://api.bscscan.com/api?module=account&action=txlist&address=0xb62bf8d41fe27622924971887d8f482b00e50660&startblock=0&endblock=99999999&page=1&offset=10&sort=desc
  async getNormalTransactionsByAddress(
    address: string,
    apikey?: string,
    limit = 10
  ): Promise<TransactionReceipt[]> {
    const scanAPI = DefaultEVMHelperScanAPIUrls[this.chain]
    if (!scanAPI) {
      throw new Error(`Scan API URL for ${this.chain} not found`)
    }
    const url = `${scanAPI}/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc${
      apikey ? `&apikey=${apikey}` : ''
    }`
    const res = await axios.get(url)
    const data = res.data
    if (!data.result) {
      throw new Error(`Failed to get transactions for ${address}`)
    }
    const ret: TransactionReceipt[] = []
    // {
    //   "blockNumber": "29985367",
    //   "blockHash": "0x910b9a716137b5cabdfa49b5934ea8f7a1867fb3ba1ec178a202d2fb89079a80",
    //   "timeStamp": "1689427357",
    //   "hash": "0x0a7c9fd6aea3347e67dbb51a2f24ca604a0498e0d2024691aee7a5fcd44ee699",
    //   "nonce": "12",
    //   "transactionIndex": "104",
    //   "from": "0xb62bf8d41fe27622924971887d8f482b00e50660",
    //   "to": "0xd10d9d9a9a9a8f872ea34608735827ca88f13b2d",
    //   "value": "8326109000000000",
    //   "gas": "21000",
    //   "gasPrice": "3000000000",
    //   "input": "0x",
    //   "methodId": "0x",
    //   "functionName": "",
    //   "contractAddress": "",
    //   "cumulativeGasUsed": "15084533",
    //   "txreceipt_status": "1",
    //   "gasUsed": "21000",
    //   "confirmations": "724",
    //   "isError": "0"
    //   }
    const provider = await this.getRpcProvider()
    if (data.status !== '1') {
      throw new Error(data.result)
    }
    data.result.forEach((scanTx: any) => {
      const tx = new TransactionReceipt(
        {
          blockNumber: parseInt(scanTx.blockNumber),
          blockHash: scanTx.blockHash,
          hash: scanTx.hash,
          to: scanTx.to,
          from: scanTx.from,
          index: parseInt(scanTx.transactionIndex),
          gasUsed: scanTx.gasUsed,
          gasPrice: scanTx.gasPrice,
          cumulativeGasUsed: scanTx.cumulativeGasUsed,
          status: parseInt(scanTx.txreceipt_status),
          contractAddress: null,
          logsBloom: '0x0',
          logs: [],
          type: 0,
          root: null,
        },
        provider
      )
      ret.push(tx)
    })
    return ret
  }
}
