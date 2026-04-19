import { NextRequest, NextResponse } from 'next/server';
import { supabaseService as supabase } from '@/lib/supabase/serviceClient';
import { calculateFeeAmount, collectPlatformFeeFromTreasury, getFeePercentLabel } from '@/lib/fees/platformFee';
import { isWalletGloballyBanned } from '@/lib/bans/walletBan';
import { walletAddressSearchVariants } from '@/lib/admin/walletAddressVariants';
import { canonicalHouseUserAddress } from '@/lib/wallet/canonicalAddress';
import { assertBalanceApiAuthorized } from '@/lib/balance/balanceApiGuard';

interface WithdrawRequest {
  userAddress: string;
  amount: number;
  currency: string;
}

export async function POST(request: NextRequest) {
  try {
    const unauthorized = assertBalanceApiAuthorized(request);
    if (unauthorized) return unauthorized;

    const body: WithdrawRequest = await request.json();
    const { userAddress, amount, currency = 'INIT' } = body;

    if (!userAddress || amount === undefined || amount === null) {
      return NextResponse.json({ error: 'Missing required fields: userAddress, amount' }, { status: 400 });
    }
    if (!Number.isFinite(Number(amount)) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid withdrawal amount' }, { status: 400 });
    }
    if (currency.toUpperCase() !== 'INIT') {
      return NextResponse.json({ error: 'Only INIT withdrawals are supported' }, { status: 400 });
    }
    if (await isWalletGloballyBanned(userAddress)) {
      return NextResponse.json({ error: 'This wallet is banned from the platform.' }, { status: 403 });
    }

    const addrVariants = walletAddressSearchVariants(userAddress);
    const { data: balRows, error: userError } = await supabase
      .from('user_balances')
      .select('balance, status, user_address')
      .in('user_address', addrVariants)
      .eq('currency', 'INIT');

    if (userError || !balRows?.length) return NextResponse.json({ error: 'User record not found' }, { status: 404 });

    for (const row of balRows) {
      if (row.status === 'frozen') return NextResponse.json({ error: 'Account is frozen. Withdrawals are disabled.' }, { status: 403 });
      if (row.status === 'banned') return NextResponse.json({ error: 'Account is banned.' }, { status: 403 });
    }

    const sortedByBal = [...balRows].sort((a, b) => Number(b.balance) - Number(a.balance));
    const userRow = sortedByBal.find(r => Number(r.balance) >= amount);
    if (!userRow) return NextResponse.json({ error: 'Insufficient house balance in INIT' }, { status: 400 });

    const dbAddress = userRow.user_address;

    let resolvedTier: 'free' | 'standard' | 'vip' = 'free';
    try {
      const { data: tierRow } = await supabase.from('user_balances').select('tier').eq('user_address', dbAddress).limit(1).single();
      if (tierRow?.tier && ['free', 'standard', 'vip'].includes(tierRow.tier)) {
        resolvedTier = tierRow.tier as 'free' | 'standard' | 'vip';
      }
    } catch {}

    const feeAmount = Number(calculateFeeAmount(amount, resolvedTier).toFixed(8));
    const netWithdrawAmount = Number((amount - feeAmount).toFixed(8));
    const feePercentLabel = getFeePercentLabel(resolvedTier);
    if (netWithdrawAmount <= 0) {
      return NextResponse.json({ error: `Withdrawal amount after ${feePercentLabel} fee must be greater than zero` }, { status: 400 });
    }

    let feeTxHash: string | null = null;
    try {
      feeTxHash = await collectPlatformFeeFromTreasury('INIT', feeAmount);
    } catch (feeErr) {
      console.error('[withdraw] Fee collection failed (non-blocking):', feeErr);
    }

    const { transferINITFromTreasury } = await import('@/lib/initia/backend-client');
    const withdrawTxHash = await transferINITFromTreasury(userAddress, netWithdrawAmount);
    const combinedTxHash = feeTxHash ? `${feeTxHash}|netTx:${withdrawTxHash}` : withdrawTxHash;

    const { data, error } = await supabase.rpc('update_balance_for_withdrawal', {
      p_user_address: dbAddress,
      p_withdrawal_amount: amount,
      p_currency: 'INIT',
      p_transaction_hash: combinedTxHash,
    });

    if (error) {
      console.error('Database error in withdrawal update:', error);
      return NextResponse.json({ success: true, txHash: withdrawTxHash, warning: 'On-chain transfer succeeded but balance update failed.' }, { status: 200 });
    }

    const result = data as { success: boolean; error: string | null; new_balance: number };
    return NextResponse.json({ success: true, txHash: withdrawTxHash, newBalance: result.new_balance });
  } catch (error) {
    console.error('Unexpected error in POST /api/balance/withdraw:', error);
    return NextResponse.json({ error: 'An error occurred processing your request' }, { status: 500 });
  }
}
