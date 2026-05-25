# AppKit NFT Market

A decentralized NFT marketplace DApp built with **Next.js**, **AppKit (Reown)**, and **Solidity smart contracts**. Users can connect their wallet via WalletConnect, list NFTs for sale, and purchase NFTs using ERC20 tokens on the Sepolia testnet.

## Features

- **Wallet Connection** — Connect via WalletConnect (mobile wallet), MetaMask, or Coinbase Wallet using AppKit
- **NFT Listing** — Approve and list your NFTs for sale with ERC20 token pricing
- **NFT Purchase** — Browse market listings and buy NFTs using ERC20 tokens
- **Cancel Listing** — Remove your own listings from the market
- **Smart Contracts** — Secure ERC721 + ERC20 marketplace with ReentrancyGuard

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS |
| Web3 | wagmi, viem, AppKit (Reown) |
| Smart Contracts | Solidity 0.8.24, Foundry |
| Network | Sepolia Testnet |

## Smart Contracts

| Contract | Description |
|----------|-------------|
| `BaseERC20.sol` | ERC20 token with `transferWithCallback` for hook-based purchases |
| `SimpleNFT.sol` | ERC721 NFT contract with minting capability |
| `NFTMarket.sol` | Marketplace contract supporting list, buy, cancel, and callback purchases |

## Project Structure

```
AppKit-NFTMarket-/
├── contracts/                # Solidity smart contracts
│   ├── src/
│   │   ├── BaseERC20.sol
│   │   ├── SimpleNFT.sol
│   │   └── NFTMarket.sol
│   ├── script/
│   │   └── Deploy.s.sol      # Foundry deployment script
│   └── foundry.toml
├── web/                      # Next.js frontend
│   ├── app/
│   │   ├── layout.tsx        # Root layout with AppKit provider
│   │   ├── page.tsx          # Main market page
│   │   └── globals.css
│   ├── components/
│   │   ├── Web3Provider.tsx  # AppKit + wagmi setup
│   │   └── Navigation.tsx    # Nav bar with wallet button
│   ├── lib/
│   │   ├── wagmi.ts          # wagmi config
│   │   └── contracts.ts      # Contract address helpers
│   └── contracts/            # Contract ABIs
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- Foundry (for contracts)
- A [WalletConnect Project ID](https://cloud.walletconnect.com/)
- A mobile wallet (e.g., MetaMask mobile, Trust Wallet) for WalletConnect testing

### 1. Clone the repository

```bash
git clone https://github.com/1952154539/AppKit-NFTMarket-.git
cd AppKit-NFTMarket-
```

### 2. Deploy smart contracts (optional)

```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts
forge build
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast
```

### 3. Configure environment

```bash
cd web
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_BASE_ERC20_ADDRESS=0x...
NEXT_PUBLIC_NFT_MARKET_ADDRESS=0x...
NEXT_PUBLIC_SIMPLE_NFT_ADDRESS=0x...
```

### 4. Install and run

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

### Connect Wallet

1. Click the "Connect Wallet" button in the top-right corner
2. Choose WalletConnect to scan the QR code with your mobile wallet
3. Or choose MetaMask/Coinbase Wallet for browser extension

### List an NFT for Sale

1. Ensure you own an NFT from the SimpleNFT contract
2. Enter the NFT contract address and token ID
3. Click **Approve NFT** to allow the market contract to transfer your NFT
4. Enter the price in MTK tokens
5. Click **List NFT** to create the listing

### Buy an NFT

1. Switch to a different wallet account
2. Browse available listings in the "Market Listings" tab
3. Click **Buy NFT** on any listing
4. Confirm the token approval and purchase transactions

### Cancel a Listing

1. Switch to the "My Listings" tab
2. Click **Cancel Listing** on your listing

## Workflow Diagram

```
Seller                          Market Contract                     Buyer
  |                                   |                                |
  |-- approve(nft) ----------------->|                                |
  |-- list(nft, price) ------------->|                                |
  |                                   |                                |
  |                                   |  <-- approve(token) ----------|
  |                                   |  <-- buyNFT(listingId) -------|
  |                                   |                                |
  |  <-- payment tokens -------------|                                |
  |                                   |-- transfer NFT -------------->|
```

## License

MIT
