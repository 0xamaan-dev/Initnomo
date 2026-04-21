import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { useOverflowStore } from '@/lib/store';

export const WalletInfo: React.FC = () => {
  const { address, isConnected, walletBalance, refreshWalletBalance } = useOverflowStore();

  useEffect(() => {
    if (isConnected && address) {
      refreshWalletBalance();
      const interval = setInterval(() => refreshWalletBalance(), 10000);
      return () => clearInterval(interval);
    }
  }, [isConnected, address, refreshWalletBalance]);

  if (!isConnected || !address) return null;

  const formatAddress = (addr: string) => (addr.length <= 10 ? addr : `${addr.slice(0, 5)}...${addr.slice(-4)}`);
  const [copied, setCopied] = useState(false);

  return (
    <Card className="min-w-[200px] border border-white/10 !bg-black/40 backdrop-blur-md">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center p-1 border border-white/10 shrink-0">
            <img src="/logos/initia.png" alt="Initia Mainnet" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-400 text-[10px] uppercase tracking-wider font-mono">Initia Address</p>
            <div className="flex items-center gap-1.5">
              <p className="text-white font-mono text-[11px] leading-tight truncate">{formatAddress(address)}</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(address).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  });
                }}
                className="shrink-0 text-gray-500 hover:text-white transition-colors"
                title="Copy address"
              >
                {copied ? '✓' : '⧉'}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-white/5">
          <p className="text-gray-400 text-[10px] uppercase tracking-wider font-mono">INIT Balance</p>
          <div className="flex items-center gap-2">
            <p className="text-[#00f5ff] font-bold text-lg font-mono drop-shadow-[0_0_8px_rgba(0,245,255,0.5)]">{walletBalance.toFixed(4)}</p>
            <span className="text-[10px] text-gray-500 font-bold uppercase mt-1">INIT</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
