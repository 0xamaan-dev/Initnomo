'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useOverflowStore } from '@/lib/store';
import { useToast } from '@/lib/hooks/useToast';
import { useInterwovenKit } from '@initia/interwovenkit-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (amount: number, txHash: string) => void;
  onError?: (error: string) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, onSuccess, onError }) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { address, depositFunds, network, walletBalance, refreshWalletBalance } = useOverflowStore();
  const { requestTxBlock } = useInterwovenKit();
  const toast = useToast();
  const quickAmounts = [0.1, 0.5, 1, 5];

  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleDeposit = async () => {
    const value = Number(amount);
    if (!amount || Number.isNaN(value) || value <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (!address) {
      setError('Connect wallet first');
      return;
    }
    if (network !== 'INIT') {
      setError('Initia wallet required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { buildInitiaDepositTxRequest } = await import('@/lib/initia/client');
      const txRequest = buildInitiaDepositTxRequest(address, value);
      const result = await requestTxBlock(txRequest);
      const txHash = result.transactionHash;

      await depositFunds(address, value, txHash);
      refreshWalletBalance();
      toast.success(`Deposited ${value.toFixed(4)} INIT`);
      onSuccess?.(value, txHash);
      onClose();
    } catch (err: any) {
      const msg = err?.message || 'Deposit failed';
      setError(msg);
      onError?.(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Deposit INIT" showCloseButton={!isLoading}>
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-[#00f5ff]/10 to-purple-500/10 border border-[#00f5ff]/30 rounded-lg p-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#00f5ff]/20 text-[#00f5ff] text-[8px] font-bold uppercase tracking-tighter rounded-bl-lg">
            Initia Mainnet
          </div>
          <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1 font-mono">Wallet Balance</p>
          <p className="text-[#00f5ff] text-xl font-bold font-mono flex items-center gap-2">
            <img src="/logos/initia.png" alt="INIT" className="w-5 h-5 object-contain" />
            {walletBalance.toFixed(4)} INIT
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-gray-400 text-xs font-mono uppercase">Amount to Deposit</label>
          <div className="relative">
            <input
              type="text"
              value={amount}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '' || /^\d*\.?\d*$/.test(v)) {
                  setAmount(v);
                  setError(null);
                }
              }}
              placeholder="0.00"
              disabled={isLoading}
              className={`w-full px-4 py-3 bg-black/50 border rounded-lg text-lg text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#00f5ff] ${error ? 'border-red-500' : 'border-[#00f5ff]/30'}`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono">INIT</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {quickAmounts.map((q) => (
            <button
              key={q}
              onClick={() => {
                setAmount(String(q));
                setError(null);
              }}
              disabled={isLoading}
              className={`px-2 py-2 rounded border font-mono text-xs transition-all duration-200 ${amount === String(q) ? 'bg-[#00f5ff]/20 border-[#00f5ff] text-[#00f5ff] shadow-[0_0_10px_rgba(0,245,255,0.3)]' : 'bg-black/30 border-[#00f5ff]/30 text-gray-300 hover:border-[#00f5ff] hover:text-[#00f5ff]'}`}
            >
              {q}
            </button>
          ))}
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-3">
          <Button onClick={onClose} variant="secondary" className="flex-1" disabled={isLoading}>Cancel</Button>
          <Button onClick={handleDeposit} variant="primary" className="flex-1" disabled={isLoading || !amount || Number(amount) <= 0}>
            {isLoading ? 'Processing...' : 'Deposit INIT'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
