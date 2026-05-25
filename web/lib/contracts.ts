export const CONTRACT_ADDRESSES = {
  sepolia: {
    BaseERC20: process.env.NEXT_PUBLIC_BASE_ERC20_ADDRESS || '0xFbFfF97E9E9b087c5D4DE46cA83d0103c74B17a5',
    NFTMarket: process.env.NEXT_PUBLIC_NFT_MARKET_ADDRESS || '0xd626015EC416C466a31b5c206C6b39D9589adEd7',
    SimpleNFT: process.env.NEXT_PUBLIC_SIMPLE_NFT_ADDRESS || '0xEd92c232914fE479e59B53b3d6bCF10f964dFa76',
  },
} as const;

export function getContractAddress(
  chainId: number,
  contractName: 'BaseERC20' | 'NFTMarket' | 'SimpleNFT'
): string {
  if (chainId === 11155111) {
    return CONTRACT_ADDRESSES.sepolia[contractName];
  }
  throw new Error(`Unsupported chain ID: ${chainId}`);
}

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
