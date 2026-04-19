import { NextRequest, NextResponse } from 'next/server';
import { supabaseService as supabase } from '@/lib/supabase/serviceClient';
import { isValidAddress } from '@/lib/utils/address';
import { calculateFeeAmount, collectPlatformFeeFromTreasury, getFeePercentLabel } from '@/lib/fees/platformFee';
import { isWalletGloballyBanned } from '@/lib/bans/walletBan';
import { canonicalHouseUserAddress } from '@/lib/wallet/canonicalAddress';
import { assertBalanceApiAuthorized } from '@/lib/balance/balanceApiGuard';

interface DepositRequest {
  userAddress: string;
  amount: number;
  txHash: string;
  currency: string;
}

export async function POST(request: NextRequest) {
  try {
    const unauthorized = assertBalanceApiAuthorized(request);
    if (unauthorized) return unauthorized;

    const body: DepositRequest = await request.json();
    const { userAddress, amount, txHash, currency = 'INIT' } = body;

    if (!userAddress || amount === undefined || amount === null || !txHash) {
      return NextResponse.json({ error: 'Missing required fields: userAddress, amount, txHash' }, { status: 400 });
    }
    if (!Number.isFinite(Number(amount)) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid deposit amount' }, { status: 400 });
    }
    if (currency.toUpperCase() !== 'INIT') {
      return NextResponse.json({ error: 'Only INIT deposits are supported' }, { status: 400 });
    }

    const isValid = await isValidAddress(userAddress);
    if (!isValid) return NextResponse.json({ error: 'Invalid wallet address format' }, { status: 400 });
    if (await isWalletGloballyBanned(userAddress)) {
      return NextResponse.json({ error: 'This wallet is banned from the platform.' }, { status: 403 });
    }

    const { verifyInitiaDepositTx } = await import('@/lib/initia/backend-client');
    const verified = await verifyInitiaDepositTx(txHash);
    const senderMatches = (verified.sender || '').trim().toLowerCase() === userAddress.trim().toLowerCase();
    if (!verified.confirmed || !senderMatches || verified.amountINIT < amount * 0.99) {
      return NextResponse.json({ error: 'Initia deposit transaction could not be verified on-chain' }, { status: 400 });
    }

    const userKey = canonicalHouseUserAddress(userAddress);

    let resolvedTier: 'free' | 'standard' | 'vip' = 'free';
    try {
      const { data: tierRow } = await supabase.from('user_balances').select('tier').eq('user_address', userKey).limit(1).single();
      if (tierRow?.tier && ['free', 'standard', 'vip'].includes(tierRow.tier)) {
        resolvedTier = tierRow.tier as 'free' | 'standard' | 'vip';
      }
    } catch {}

    const feeAmount = calculateFeeAmount(amount, resolvedTier);
    const netDepositAmount = amount - feeAmount;
    const feePercentLabel = getFeePercentLabel(resolvedTier);
    if (netDepositAmount <= 0) {
      return NextResponse.json({ error: `Deposit amount after ${feePercentLabel} fee must be greater than zero` }, { status: 400 });
    }

    let feeTxHash: string | null = null;
    try {
      feeTxHash = await collectPlatformFeeFromTreasury('INIT', feeAmount);
    } catch (feeErr) {
      console.error('[deposit] Fee collection failed (non-blocking):', feeErr);
    }
    const combinedTxHash = feeTxHash ? `${txHash}|feeTx:${feeTxHash}` : txHash;

    const { data, error } = await supabase.rpc('update_balance_for_deposit', {
      p_user_address: userKey,
      p_deposit_amount: netDepositAmount,
      p_currency: 'INIT',
      p_transaction_hash: combinedTxHash,
    });

    if (error) {
      console.error('Database error in deposit:', error);
      return NextResponse.json({ error: 'Service temporarily unavailable. Please try again.' }, { status: 503 });
    }

    const result = data as { success: boolean; error: string | null; new_balance: number };
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Deposit failed' }, { status: 400 });
    }

    return NextResponse.json({ success: true, newBalance: Number(result.new_balance) });
  } catch (error) {
    console.error('Unexpected error in POST /api/balance/deposit:', error);
    return NextResponse.json({ error: 'An error occurred processing your request' }, { status: 500 });
  }
}
