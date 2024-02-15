/* eslint-disable @typescript-eslint/no-non-null-assertion */
import erc721ABI from './erc721ABI.json'
import {
  ethers,
  ContractTransactionResponse,
  ContractTransactionReceipt,
} from 'ethers6'
import WrappedContract from '../WrappedContract'

interface NFTTokenURI {
  id: number
  uri: string
}

export default class Erc72TokenContract extends WrappedContract {
  constructor(
    address: string,
    provider: ethers.Signer,
    erc721: any[] = erc721ABI
  ) {
    super(erc721, address, provider)
  }

  getInstance(): ethers.Contract {
    return new ethers.Contract(this.address, this.ABI as any, this.provider)
  }

  async balanceOf(address: string): Promise<number> {
    const contract = this.getInstance()
    const bn = await contract.balanceOf(address)
    return parseInt(bn)
  }

  async tokenOfOwnerByIndex(address: string, index: number): Promise<number> {
    const contract = this.getInstance()
    const bn = await contract.tokenOfOwnerByIndex(address, index)
    return parseInt(bn)
  }

  async tokenURI(tokenId: number): Promise<string> {
    const contract = this.getInstance()
    return await contract.tokenURI(tokenId)
  }

  async safeTransferFrom(
    addressFrom: string,
    addressTo: string,
    tokenId: number
  ): Promise<ContractTransactionReceipt> {
    const contract = this.getInstance()
    const tx: ContractTransactionResponse = await contract[
      'safeTransferFrom(address,address,uint256)'
    ](addressFrom, addressTo, tokenId)
    const txwait = await tx.wait()
    return txwait!
  }

  async approve(
    addressTo: string,
    tokenId: number
  ): Promise<ContractTransactionReceipt> {
    const contract = this.getInstance()
    const tx: ContractTransactionResponse = await contract.approve(
      addressTo,
      tokenId
    )
    const txwait = await tx.wait()
    return txwait!
  }

  async getApproved(tokenId: number): Promise<string> {
    const contract = this.getInstance()
    return await contract.getApproved(tokenId)
  }

  // other
  async getFirstTokenIdOf(address: string): Promise<number | null> {
    const count = await this.balanceOf(address)
    if (count === 0) return null
    const id = await this.tokenOfOwnerByIndex(address, 0)
    return id
  }

  async tokenIdsOf(address: string): Promise<number[]> {
    const count = await this.balanceOf(address)
    const list: number[] = []
    for (let i = 0; i < count; i++) {
      list[i] = await this.tokenOfOwnerByIndex(address, i)
    }
    return list
  }

  async tokenURIListOf(address: string): Promise<NFTTokenURI[]> {
    const ids = await this.tokenIdsOf(address)
    const list: NFTTokenURI[] = []
    for (let i = 0; i < ids.length; i++) {
      const uri = await this.tokenURI(ids[i])
      list[i] = {
        id: ids[i],
        uri,
      }
    }
    return list
  }
}
