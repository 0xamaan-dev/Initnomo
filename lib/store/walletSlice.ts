import { StateCreator } from 'zustand';

export interface WalletState {
  address: string | null;
  walletBalance: number;
  isConnected: boolean;
  isConnecting: boolean;
  network: 'BNB' | 'SOL' | 'SUI' | 'XLM' | 'XTZ' | 'NEAR' | 'STRK' | 'PUSH' | 'SOMNIA' | 'OCT' | 'ZG' | 'INIT' | 'APT' | null;
  preferredNetwork: 'BNB' | 'SOL' | 'SUI' | 'XLM' | 'XTZ' | 'NEAR' | 'STRK' | 'PUSH' | 'SOMNIA' | 'OCT' | 'ZG' | 'INIT' | 'APT' | null;
  selectedCurrency: string | null;
  error: string | null;
  isConnectModalOpen: boolean;

  connect: () => Promise<void>;
  disconnect: () => void;
  refreshWalletBalance: () => Promise<void>;
  clearError: () => void;
  setConnectModalOpen: (open: boolean) => void;

  setAddress: (address: string | null) => void;
  setIsConnected: (connected: boolean) => void;
  setNetwork: (network: WalletState['network']) => void;
  setPreferredNetwork: (network: WalletState['preferredNetwork']) => void;
  setSelectedCurrency: (currency: string | null) => void;
}

export const createWalletSlice: StateCreator<WalletState> = (set, get) => ({
  address: null,
  walletBalance: 0,
  isConnected: false,
  isConnecting: false,
  network: null,
  preferredNetwork:
    (typeof window !== 'undefined' &&
      (localStorage.getItem('solnomo_preferred_network') as WalletState['preferredNetwork'])) ||
    'INIT',
  selectedCurrency: null,
  error: null,
  isConnectModalOpen: false,

  connect: async () => set({ isConnectModalOpen: true }),

  disconnect: () => {
    const state = get() as any;
    const accountType = state.accountType;
    const currentAccessCode = state.accessCode;

    set({
      address: null,
      walletBalance: 0,
      isConnected: false,
      isConnecting: false,
      network: null,
      selectedCurrency: null,
      error: null,
    } as any);

    if (accountType !== 'demo' && !currentAccessCode) {
      set({ username: null, accessCode: null } as any);
    }
  },

  refreshWalletBalance: async () => {
    const { address, isConnected, network } = get();
    if (!isConnected || !address || network !== 'INIT') return;

    try {
      const { getINITBalance } = await import('@/lib/initia/balance');
      const bal = await getINITBalance(address);
      set({ walletBalance: bal });
    } catch (error) {
      console.error('Error refreshing wallet balance:', error);
    }
  },

  clearError: () => set({ error: null }),
  setConnectModalOpen: (open: boolean) => set({ isConnectModalOpen: open }),
  setAddress: (address: string | null) => set({ address }),
  setIsConnected: (connected: boolean) => set({ isConnected: connected }),
  setNetwork: (network) => set({ network }),
  setPreferredNetwork: (network) => {
    set({ preferredNetwork: network });
    if (typeof window !== 'undefined') {
      if (network) localStorage.setItem('solnomo_preferred_network', network);
      else localStorage.removeItem('solnomo_preferred_network');
    }
  },
  setSelectedCurrency: (currency: string | null) => {
    set({ selectedCurrency: currency });
    const { isConnected, address } = get();
    if (isConnected && address) get().refreshWalletBalance();
  },
});
