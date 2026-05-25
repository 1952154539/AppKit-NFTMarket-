'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';

const navLinks = [
  { href: '/', label: 'NFT Market' },
];

export function Navigation() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8 items-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {isConnected && address && (
              <span className="text-xs text-gray-400 truncate max-w-[200px]">
                {address}
              </span>
            )}
          </div>

          <div className="flex items-center">
            <appkit-button />
          </div>
        </div>
      </div>
    </nav>
  );
}
