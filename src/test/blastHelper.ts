import EVMHelper from '../utils/EVMHelper'
import { SupportedEVMHelperChains } from '../utils/EVMHelper/types'

async function task(): Promise<void> {
  const helper = new EVMHelper(SupportedEVMHelperChains.blastSepoliaTestnet)
  const provider = await helper.getRpcProvider()
  const blockNumber = await provider.getBlockNumber()
  console.log(blockNumber)
}

task().catch((e) => console.log(e))
