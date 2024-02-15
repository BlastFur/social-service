export enum SupportedEVMHelperChains {
  mainnet = 'mainnet',
  goerli = 'goerli',
  scrollAlpha = 'scrollAlpha',
  bsc = 'bsc',
  bscTestnet = 'bscTestnet',
  arbitrum = 'arbitrum',
  optimism = 'optimism',
  avax = 'avax',
  polygon = 'polygon',
  zkSyncMainnet = 'zkSyncMainnet',
  blastSepoliaTestnet = 'blastSepoliaTestnet',
}

// eslint-disable-next-line prettier/prettier
export const DefaultEVMHelperChainRPCs: Record<SupportedEVMHelperChains, string> = {
  mainnet: 'https://eth.llamarpc.com',
  goerli: 'https://eth-goerli.public.blastapi.io',
  scrollAlpha: 'https://alpha-rpc.scroll.io/l2',
  bsc: 'https://bsc-dataseed.binance.org',
  bscTestnet: 'https://data-seed-prebsc-1-s3.binance.org:8545',
  arbitrum: 'https://endpoints.omniatech.io/v1/arbitrum/one/public',
  optimism: 'https://endpoints.omniatech.io/v1/op/mainnet/public',
  avax: 'https://api.avax.network/ext/bc/C/rpc',
  polygon: 'https://polygon.blockpi.network/v1/rpc/public',
  zkSyncMainnet: 'https://mainnet.era.zksync.io',
  blastSepoliaTestnet: 'https://sepolia.blast.io',
}

// eslint-disable-next-line prettier/prettier
export const DefaultEVMHelperExplorerURLs: Record<SupportedEVMHelperChains, string> = {
  mainnet: 'https://etherscan.io',
  goerli: 'https://goerli.etherscan.io',
  scrollAlpha: 'https://blockscout.scroll.io',
  bsc: 'https://bscscan.com',
  bscTestnet: 'https://testnet.bscscan.com',
  arbitrum: 'https://arbiscan.io',
  optimism: 'https://optimistic.etherscan.io',
  avax: 'https://snowtrace.io',
  polygon: 'https://polygonscan.com',
  zkSyncMainnet: 'https://explorer.zksync.io',
  blastSepoliaTestnet: 'https://testnet.blastscan.io',
}

export const MAX_ETH_NUM =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935'

export const MAX_UINT128 = '340282366920938463463374607431768211455'

// eslint-disable-next-line prettier/prettier
export const DefaultEVMHelperScanAPIUrls: Record<SupportedEVMHelperChains, string> = {
  mainnet: '',
  goerli: '',
  scrollAlpha: '',
  bsc: 'https://api.bscscan.com',
  bscTestnet: '',
  arbitrum: '',
  optimism: '',
  avax: '',
  polygon: '',
  zkSyncMainnet: '',
  blastSepoliaTestnet:
    'https://api.routescan.io/v2/network/testnet/evm/168587773/etherscan',
}
