'use client';

import React from 'react';
import { useOverflowStore } from '@/lib/store';
import { useInterwovenKit } from '@initia/interwovenkit-react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet } from 'lucide-react';

export const WalletConnectModal: React.FC = () => {
  const isOpen = useOverflowStore((state) => state.isConnectModalOpen);
  const setOpen = useOverflowStore((state) => state.setConnectModalOpen);
  const setPreferredNetwork = useOverflowStore((state) => state.setPreferredNetwork);
  const { openConnect: openInitiaConnect } = useInterwovenKit();

  const handleInitiaConnect = () => {
    setPreferredNetwork('INIT');
    setOpen(false);
    setTimeout(() => openInitiaConnect(), 100);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-purple-500/10 to-transparent">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Connect Initia Wallet</h2>
              <p className="text-sm text-gray-400 mt-1">Initia mainnet only</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors group">
              <X className="w-5 h-5 text-gray-500 group-hover:text-white" />
            </button>
          </div>

          <div className="p-6">
            <button onClick={handleInitiaConnect} className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group relative overflow-hidden">
              <img src="/logos/initia.png" alt="Initia" className="w-12 h-12 object-contain shrink-0 group-hover:scale-110 transition-transform" />
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base">Initia</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 font-bold uppercase tracking-wider">INIT</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">InterwovenKit wallet connection</p>
              </div>
              <Wallet className="w-5 h-5 text-gray-600 group-hover:text-red-400 transition-colors" />
            </button>
          </div>

          <div className="p-4 bg-white/5 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Initnomo · Initia</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
