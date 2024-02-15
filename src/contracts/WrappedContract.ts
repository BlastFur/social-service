import { ethers } from 'ethers6'

export default class WrappedContract {
  protected ABI: any[]
  protected address: string
  protected provider: ethers.Signer

  constructor(abi: any[], address: string, provider: ethers.Signer) {
    this.ABI = abi
    this.address = address
    this.provider = provider
  }

  async getCallerAddress(): Promise<string> {
    return await this.provider.getAddress()
  }
}
