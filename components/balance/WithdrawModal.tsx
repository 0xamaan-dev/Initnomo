'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useOverflowStore } from '@/lib/store';
import { useToast } from '@/lib/hooks/useToast';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (amount: number, txHash: string) => void;
  onError?: (error: string) => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, onSuccess, onError }) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { address, houseBalance, withdrawFunds, network, refreshWalletBalance } = useOverflowStore();
  const toast = useToast();
  const feePercent = 0.10;

  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleWithdraw = async () => {
    const value = Number(amount);
    if (!amount || Number.isNaN(value) || value <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (value > houseBalance) {
      setError('Insufficient house balance');
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
      const result = await withdrawFunds(address, value);
      const txHash = (result as any)?.txHash || 'PENDING';
      refreshWalletBalance();
      setTimeout(() => refreshWalletBalance(), 3000);
      toast.success(`Withdrawal submitted: ${value.toFixed(4)} INIT`);
      onSuccess?.(value, txHash);
      onClose();
    } catch (err: any) {
      const msg = err?.message || 'Withdrawal failed';
      setError(msg);
      onError?.(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Withdraw INIT" showCloseButton={!isLoading}>
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-[#FF006E]/10 to-purple-500/10 border border-[#FF006E]/30 rounded-lg p-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#FF006E]/20 text-[#FF006E] text-[8px] font-bold uppercase tracking-tighter rounded-bl-lg">
            Initia Mainnet
          </div>
          <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1 font-mono">Available to Withdraw</p>
          <p className="text-[#FF006E] text-xl font-bold font-mono flex items-center gap-2">
            <img src="/logos/initia.png" alt="INIT" className="w-5 h-5 object-contain" />
            {houseBalance.toFixed(4)} INIT
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-gray-400 text-xs font-mono uppercase">Amount to Withdraw</label>
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
              className={`w-full px-4 py-3 bg-black/50 border rounded-lg text-lg text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#FF006E] ${error ? 'border-red-500' : 'border-[#FF006E]/30'}`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono">INIT</span>
          </div>
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                setAmount(houseBalance.toString());
                setError(null);
              }}
              disabled={isLoading || houseBalance <= 0}
              className="text-[10px] text-[#FF006E] hover:text-[#FF006E]/80 font-mono disabled:opacity-50 transition-colors uppercase tracking-wider"
            >
              Withdraw All
            </button>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 font-mono">Admin Fee: <span className="text-red-400">10%</span></p>
              {amount && !isNaN(parseFloat(amount)) && (
                <p className="text-[10px] text-gray-400 font-mono">
                  You Receive: <span className="text-green-400">{(parseFloat(amount) * (1 - feePercent)).toFixed(4)} INIT</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-3">
          <Button onClick={onClose} variant="secondary" className="flex-1" disabled={isLoading}>Cancel</Button>
          <Button onClick={handleWithdraw} variant="primary" className="flex-1" disabled={isLoading || !amount || Number(amount) <= 0}>
            {isLoading ? 'Processing...' : 'Withdraw INIT'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
