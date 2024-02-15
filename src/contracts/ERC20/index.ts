import erc20ABI from './erc20ABI.json'
import {
  ethers,
  ContractTransactionResponse,
  ContractTransactionReceipt,
} from 'ethers6'
import WrappedContract from '../WrappedContract'
import { MAX_ETH_NUM } from '../../utils/evm'
import Decimal from 'decimal.js-light'

export default class Erc20TokenContract extends WrappedContract {
  constructor(address: string, provider: ethers.Signer) {
    super(erc20ABI, address, provider)
  }

  getInstance(): ethers.Contract {
    return new ethers.Contract(this.address, this.ABI as any, this.provider)
  }

  async balanceOf(address: string): Promise<string> {
    const contract = this.getInstance()
    const bn = await contract.balanceOf(address)
    return bn.toString()
  }

  async approveIfNoAllowance(
    address: string,
    amount: string = MAX_ETH_NUM
  ): Promise<ContractTransactionReceipt | true> {
    const owner = await this.provider.getAddress()
    const allowance = await this.allowance(owner, address)
    if (new Decimal(allowance).gte(amount)) {
      return true
    }
    return await this.approve(address, amount)
  }

  async approve(
    address: string,
    amount: string = MAX_ETH_NUM
  ): Promise<ContractTransactionReceipt> {
    const contract = this.getInstance()
    const tx: ContractTransactionResponse = await contract.approve(
      address,
      amount
    )
    const txwait = await tx.wait()
    return txwait!
  }

  async allowance(owner: string, spender: string): Promise<string> {
    const contract = this.getInstance()
    const bn = await contract.allowance(owner, spender)
    return bn.toString()
  }

  async symbol(): Promise<string> {
    const contract = this.getInstance()
    const bn = await contract.symbol()
    return bn
  }

  async name(): Promise<string> {
    const contract = this.getInstance()
    const bn = await contract.name()
    return bn
  }

  async decimals(): Promise<number> {
    const contract = this.getInstance()
    const bn = await contract.decimals()
    return parseInt(bn.toString())
  }

  async totalSupply(): Promise<string> {
    const contract = this.getInstance()
    const bn = await contract.totalSupply()
    return bn.toString()
  }
}
