'use client';

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { sepolia } from '@reown/appkit/networks';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

// WagmiAdapter handles WalletConnect internally - no separate connectors needed
export const wagmiAdapter = new WagmiAdapter({
  networks: [sepolia],
  projectId,
  ssr: true,
});

// Use the adapter's wagmi config (not a separate createConfig)
export const config = wagmiAdapter.wagmiConfig;
