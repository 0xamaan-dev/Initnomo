'use client';

import React, { useEffect, useState } from 'react';
import { useOverflowStore } from '@/lib/store';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InterwovenKitProvider, MAINNET as INITIA_MAINNET, injectStyles as injectInitiaStyles, useInterwovenKit } from '@initia/interwovenkit-react';
import interwovenKitStyles from '@initia/interwovenkit-react/styles.js';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { WalletConnectModal } from '@/components/wallet/WalletConnectModal';
import { ReferralSync } from './ReferralSync';
import { useSessionTracker } from '@/hooks/useSessionTracker';
import { ensureBalanceSession } from '@/lib/balance/balanceClientHeaders';

function WalletSync() {
  const { address: initiaAddress, isConnected: initiaConnected } = useInterwovenKit();
  const {
    address,
    setAddress,
    setIsConnected,
    setNetwork,
    refreshWalletBalance,
    fetchBalance,
    fetchProfile,
  } = useOverflowStore();

  useSessionTracker(address, 'INIT');

  useEffect(() => {
    if (!initiaConnected || !initiaAddress) return;
    if (address !== initiaAddress || useOverflowStore.getState().network !== 'INIT') {
      setAddress(initiaAddress);
      setIsConnected(true);
      setNetwork('INIT');
      fetchProfile(initiaAddress);
    }
    // Always refresh wallet and house balance on confirmed Initia connection.
    // This avoids stale wallet balances after reconnect cycles.
    queueMicrotask(() => refreshWalletBalance());
    queueMicrotask(() => fetchBalance(initiaAddress));
  }, [initiaConnected, initiaAddress, address, setAddress, setIsConnected, setNetwork, refreshWalletBalance, fetchBalance, fetchProfile]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [queryClient] = useState(() => new QueryClient());
  const [wagmiConfig] = useState(() =>
    createConfig({
      chains: [mainnet],
      transports: {
        [mainnet.id]: http(),
      },
    }),
  );

  useEffect(() => {
    injectInitiaStyles(interwovenKitStyles);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initializeApp = async () => {
      try {
        await ensureBalanceSession();
        const { updateAllPrices, loadTargetCells, startGlobalPriceFeed } = useOverflowStore.getState();
        await loadTargetCells().catch(console.error);
        const stop = startGlobalPriceFeed(updateAllPrices);
        if (cancelled) stop();
        if (!cancelled) setIsReady(true);
      } catch (error) {
        console.error('Error initializing app:', error);
        if (!cancelled) setIsReady(true);
      }
    };

    void initializeApp();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <InterwovenKitProvider {...INITIA_MAINNET}>
          <WalletSync />
          <ReferralSync />
          {children}
          <WalletConnectModal />
          <ToastProvider />
        </InterwovenKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
