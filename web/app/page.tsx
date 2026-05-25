'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  useSwitchChain,
} from 'wagmi';
import { parseEther, formatEther } from 'viem';
import NFTMarketABI from '@/contracts/NFTMarket.json';
import BaseERC20ABI from '@/contracts/BaseERC20.json';
import SimpleNFTABI from '@/contracts/SimpleNFT.json';
import { getContractAddress } from '@/lib/contracts';
import { sepolia } from 'wagmi/chains';

const CHAIN_ID = sepolia.id;

export default function NFTMarketPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const isCorrectChain = chainId === CHAIN_ID;

  // Contract addresses
  const nftMarketAddr = getContractAddress(CHAIN_ID, 'NFTMarket');
  const tokenAddr = getContractAddress(CHAIN_ID, 'BaseERC20');
  const nftAddr = getContractAddress(CHAIN_ID, 'SimpleNFT');

  // List form state
  const [listNftContract, setListNftContract] = useState(nftAddr);
  const [listTokenId, setListTokenId] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [activeTab, setActiveTab] = useState<'market' | 'my'>('market');

  // Transaction state
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState('');

  // Read token balance (use readContract instead of useBalance for reliability)
  const { data: rawBalance } = useReadContract({
    address: tokenAddr as `0x${string}`,
    abi: BaseERC20ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: isConnected && isCorrectChain },
  });

  // Read active listings
  const { data: activeListings, refetch: refetchListings } = useReadContract({
    address: nftMarketAddr as `0x${string}`,
    abi: NFTMarketABI,
    functionName: 'getActiveListings',
    chainId: CHAIN_ID,
    query: { enabled: isConnected && chainId === CHAIN_ID },
  });

  // Read listing counter
  const { data: listingCounter } = useReadContract({
    address: nftMarketAddr as `0x${string}`,
    abi: NFTMarketABI,
    functionName: 'listingCounter',
    chainId: CHAIN_ID,
    query: { enabled: isConnected && chainId === CHAIN_ID },
  });

  // Write contracts
  const { writeContractAsync, isPending } = useWriteContract();

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

  useEffect(() => {
    if (isConfirming) setTxStatus('Confirming transaction...');
    if (isConfirmed) {
      setTxStatus('Transaction confirmed!');
      refetchListings();
      setTimeout(() => setTxStatus(''), 5000);
    }
  }, [isConfirming, isConfirmed, refetchListings]);

  // Approve NFT for market
  const handleApproveNFT = async () => {
    if (!listNftContract || !listTokenId) {
      alert('Please enter NFT contract address and token ID');
      return;
    }
    try {
      setTxStatus('Approving NFT...');
      const hash = await writeContractAsync({
        address: listNftContract as `0x${string}`,
        abi: SimpleNFTABI,
        functionName: 'approve',
        args: [nftMarketAddr, BigInt(listTokenId)],
        chainId: CHAIN_ID,
      });
      setTxHash(hash);
      setTxStatus(`Approval sent! Hash: ${hash.slice(0, 10)}...`);
    } catch (err: any) {
      setTxStatus(`Error: ${err.message}`);
    }
  };

  // Approve token for market
  const handleApproveToken = async () => {
    if (!listPrice) {
      alert('Please enter price first');
      return;
    }
    try {
      setTxStatus('Approving tokens...');
      const hash = await writeContractAsync({
        address: tokenAddr as `0x${string}`,
        abi: BaseERC20ABI,
        functionName: 'approve',
        args: [nftMarketAddr, parseEther(listPrice)],
        chainId: CHAIN_ID,
      });
      setTxHash(hash);
      setTxStatus(`Approval sent! Hash: ${hash.slice(0, 10)}...`);
    } catch (err: any) {
      setTxStatus(`Error: ${err.message}`);
    }
  };

  // List NFT
  const handleListNFT = async () => {
    if (!listNftContract || !listTokenId || !listPrice) {
      alert('Please fill all fields');
      return;
    }
    try {
      setTxStatus('Listing NFT...');
      const hash = await writeContractAsync({
        address: nftMarketAddr as `0x${string}`,
        abi: NFTMarketABI,
        functionName: 'list',
        args: [listNftContract, BigInt(listTokenId), parseEther(listPrice)],
        chainId: CHAIN_ID,
      });
      setTxHash(hash);
      setTxStatus(`Listing sent! Hash: ${hash.slice(0, 10)}...`);
    } catch (err: any) {
      setTxStatus(`Error: ${err.message}`);
    }
  };

  // Buy NFT
  const handleBuyNFT = async (listingId: bigint, price: bigint) => {
    try {
      // First approve token spending
      setTxStatus('Approving tokens for purchase...');
      const approveHash = await writeContractAsync({
        address: tokenAddr as `0x${string}`,
        abi: BaseERC20ABI,
        functionName: 'approve',
        args: [nftMarketAddr, price],
        chainId: CHAIN_ID,
      });
      setTxHash(approveHash);

      // Wait a bit then buy
      setTxStatus('Purchasing NFT...');
      const buyHash = await writeContractAsync({
        address: nftMarketAddr as `0x${string}`,
        abi: NFTMarketABI,
        functionName: 'buyNFT',
        args: [listingId],
        chainId: CHAIN_ID,
      });
      setTxHash(buyHash);
      setTxStatus(`Purchase sent! Hash: ${buyHash.slice(0, 10)}...`);
    } catch (err: any) {
      setTxStatus(`Error: ${err.message}`);
    }
  };

  // Cancel listing
  const handleCancelListing = async (listingId: bigint) => {
    try {
      setTxStatus('Cancelling listing...');
      const hash = await writeContractAsync({
        address: nftMarketAddr as `0x${string}`,
        abi: NFTMarketABI,
        functionName: 'cancelListing',
        args: [listingId],
        chainId: CHAIN_ID,
      });
      setTxHash(hash);
      setTxStatus(`Cancel sent! Hash: ${hash.slice(0, 10)}...`);
    } catch (err: any) {
      setTxStatus(`Error: ${err.message}`);
    }
  };

  // Mint test NFT (public function, anyone can call)
  const handleMintNFT = async () => {
    if (!address) return;
    try {
      setTxStatus('Minting NFT...');
      const hash = await writeContractAsync({
        address: nftAddr as `0x${string}`,
        abi: SimpleNFTABI,
        functionName: 'mint',
        args: [address, `ipfs://test-${Date.now()}`],
        chainId: CHAIN_ID,
      });
      setTxHash(hash);
      setTxStatus(`NFT minted! Hash: ${hash.slice(0, 10)}...`);
    } catch (err: any) {
      setTxStatus(`Error: ${err.message}`);
    }
  };

  // Approve all NFTs for market (setApprovalForAll)
  const handleApproveAllNFT = async () => {
    try {
      setTxStatus('Approving all NFTs for market...');
      const hash = await writeContractAsync({
        address: nftAddr as `0x${string}`,
        abi: SimpleNFTABI,
        functionName: 'setApprovalForAll',
        args: [nftMarketAddr, true],
        chainId: CHAIN_ID,
      });
      setTxHash(hash);
      setTxStatus(`Approval sent! Hash: ${hash.slice(0, 10)}...`);
    } catch (err: any) {
      setTxStatus(`Error: ${err.message}`);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 text-center max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">NFT Market</h1>
          <p className="text-gray-600 mb-6">Trade NFTs using ERC20 tokens on Sepolia</p>
          <p className="text-gray-500 mb-6">Connect your wallet to get started</p>
          <div className="flex justify-center">
            <appkit-button />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">NFT Market</h1>
          <p className="text-gray-600">Trade NFTs using ERC20 tokens</p>
          {rawBalance !== undefined && (
            <div className="mt-2 inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
              Balance: {Number(formatEther(rawBalance as bigint)).toFixed(2)} MTK
            </div>
          )}
          {!isCorrectChain && isConnected && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 mb-2">Wrong network! Please switch to Sepolia.</p>
              <button
                onClick={() => switchChain({ chainId: CHAIN_ID })}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Switch to Sepolia
              </button>
            </div>
          )}
        </div>

        {/* Tx Status */}
        {txStatus && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">{txStatus}</p>
            {txHash && (
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm underline"
              >
                View on Etherscan
              </a>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: List NFT Form & Dev Tools */}
          <div className="lg:col-span-1">
            {/* Dev Tools */}
            <div className="bg-white rounded-lg shadow p-6 mb-4 border border-orange-200">
              <h2 className="text-xl font-bold text-orange-600 mb-3">Dev Tools</h2>
              <p className="text-xs text-gray-500 mb-4">
                Mint test NFTs and approve the market contract. Use these to prepare your account before listing.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleMintNFT}
                  disabled={isPending}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {isPending ? 'Processing...' : 'Mint Test NFT'}
                </button>
                <button
                  onClick={handleApproveAllNFT}
                  disabled={isPending}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {isPending ? 'Processing...' : 'Approve All NFTs for Market'}
                </button>
                <div className="text-xs text-gray-400 mt-2">
                  <p>Tip: If you need test tokens, deploy your own BaseERC20 contract to get 1,000,000 MTK as the deployer.</p>
                </div>
              </div>
            </div>

            {/* List NFT Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">List NFT</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NFT Contract Address
                  </label>
                  <input
                    type="text"
                    value={listNftContract}
                    onChange={(e) => setListNftContract(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token ID
                  </label>
                  <input
                    type="number"
                    value={listTokenId}
                    onChange={(e) => setListTokenId(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (in MTK tokens)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={listPrice}
                    onChange={(e) => setListPrice(e.target.value)}
                    placeholder="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500 mb-3">
                    Step 1: Approve the NFT for the market contract
                  </p>
                  <button
                    onClick={handleApproveNFT}
                    disabled={isPending}
                    className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors mb-2"
                  >
                    {isPending ? 'Processing...' : 'Approve NFT'}
                  </button>

                  <p className="text-xs text-gray-500 mb-3 mt-4">
                    Step 2: List your NFT on the market
                  </p>
                  <button
                    onClick={handleListNFT}
                    disabled={isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    {isPending ? 'Processing...' : 'List NFT'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Market Listings */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setActiveTab('market')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'market'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Market Listings
              </button>
              <button
                onClick={() => setActiveTab('my')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'my'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                My Listings
              </button>
            </div>

            {/* Listings */}
            <ListingGrid
              listingIds={activeListings as bigint[] | undefined}
              activeTab={activeTab}
              userAddress={address}
              nftMarketAddr={nftMarketAddr}
              tokenAddr={tokenAddr}
              onBuy={handleBuyNFT}
              onCancel={handleCancelListing}
              isPending={isPending}
            />
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">How It Works</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">1.</span>
              <span><strong>Connect Wallet:</strong> Connect via WalletConnect using the button above</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">2.</span>
              <span><strong>Approve NFT:</strong> Approve the market contract to transfer your NFT</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">3.</span>
              <span><strong>List NFT:</strong> Set a price in ERC20 tokens and list your NFT for sale</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">4.</span>
              <span><strong>Buy NFT:</strong> Switch accounts, approve tokens, and purchase NFTs from the market</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">5.</span>
              <span><strong>Cancel Listing:</strong> Remove your NFT from the market anytime</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Listing Grid Component
function ListingGrid({
  listingIds,
  activeTab,
  userAddress,
  nftMarketAddr,
  tokenAddr,
  onBuy,
  onCancel,
  isPending,
}: {
  listingIds: bigint[] | undefined;
  activeTab: 'market' | 'my';
  userAddress: string | undefined;
  nftMarketAddr: string;
  tokenAddr: string;
  onBuy: (listingId: bigint, price: bigint) => void;
  onCancel: (listingId: bigint) => void;
  isPending: boolean;
}) {
  if (!listingIds || listingIds.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-500">No active listings</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {listingIds.map((id) => (
        <ListingCard
          key={id.toString()}
          listingId={id}
          activeTab={activeTab}
          userAddress={userAddress}
          nftMarketAddr={nftMarketAddr}
          tokenAddr={tokenAddr}
          onBuy={onBuy}
          onCancel={onCancel}
          isPending={isPending}
        />
      ))}
    </div>
  );
}

// Individual Listing Card
function ListingCard({
  listingId,
  activeTab,
  userAddress,
  nftMarketAddr,
  tokenAddr,
  onBuy,
  onCancel,
  isPending,
}: {
  listingId: bigint;
  activeTab: 'market' | 'my';
  userAddress: string | undefined;
  nftMarketAddr: string;
  tokenAddr: string;
  onBuy: (listingId: bigint, price: bigint) => void;
  onCancel: (listingId: bigint) => void;
  isPending: boolean;
}) {
  const { data: listing } = useReadContract({
    address: nftMarketAddr as `0x${string}`,
    abi: NFTMarketABI,
    functionName: 'listings',
    args: [listingId],
    chainId: CHAIN_ID,
  });

  if (!listing) return null;

  const [seller, nftContract, tokenId, price, active] = listing as [
    string,
    string,
    bigint,
    bigint,
    boolean,
  ];

  if (!active) return null;

  const isOwner =
    userAddress && seller.toLowerCase() === userAddress.toLowerCase();

  // Filter based on active tab
  if (activeTab === 'my' && !isOwner) return null;
  if (activeTab === 'market' && isOwner) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            NFT #{tokenId.toString()}
          </h3>
          <p className="text-xs text-gray-400 font-mono truncate max-w-[200px]">
            Contract: {nftContract.slice(0, 6)}...{nftContract.slice(-4)}
          </p>
        </div>
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
          Active
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-500 text-sm">Price</span>
          <span className="text-gray-900 font-semibold">
            {formatEther(price)} MTK
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 text-sm">Seller</span>
          <span className="text-gray-700 text-xs font-mono">
            {seller.slice(0, 6)}...{seller.slice(-4)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 text-sm">Listing ID</span>
          <span className="text-gray-700 text-sm">#{listingId.toString()}</span>
        </div>
      </div>

      {isOwner ? (
        <button
          onClick={() => onCancel(listingId)}
          disabled={isPending}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isPending ? 'Processing...' : 'Cancel Listing'}
        </button>
      ) : (
        <button
          onClick={() => onBuy(listingId, price)}
          disabled={isPending}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isPending ? 'Processing...' : 'Buy NFT'}
        </button>
      )}
    </div>
  );
}
