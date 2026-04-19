import { NextRequest, NextResponse } from 'next/server';
import { supabaseService as supabase } from '@/lib/supabase/serviceClient';
import { assertBalanceApiAuthorized } from '@/lib/balance/balanceApiGuard';
import { isWalletGloballyBanned } from '@/lib/bans/walletBan';
import { walletAddressSearchVariants } from '@/lib/admin/walletAddressVariants';
import { collectPlatformFeeFromTreasury } from '@/lib/fees/platformFee';

interface BlitzEntryRequest {
  userAddress: string;
  amount: number;
  currency?: string;
}

export async function POST(request: NextRequest) {
  try {
    const unauthorized = assertBalanceApiAuthorized(request);
    if (unauthorized) return unauthorized;

    const body: BlitzEntryRequest = await request.json();
    const { userAddress, amount, currency = 'INIT' } = body;

    if (!userAddress || amount === undefined || amount === null) {
      return NextResponse.json({ error: 'Missing required fields: userAddress, amount' }, { status: 400 });
    }
    if (!Number.isFinite(Number(amount)) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid blitz entry amount' }, { status: 400 });
    }
    if (currency.toUpperCase() !== 'INIT') {
      return NextResponse.json({ error: 'Only INIT blitz entry is supported' }, { status: 400 });
    }
    if (await isWalletGloballyBanned(userAddress)) {
      return NextResponse.json({ error: 'This wallet is banned from the platform.' }, { status: 403 });
    }

    const variants = walletAddressSearchVariants(userAddress);
    const { data: balRows, error: balError } = await supabase
      .from('user_balances')
      .select('balance, status, user_address')
      .in('user_address', variants)
      .eq('currency', 'INIT');

    if (balError || !balRows?.length) {
      return NextResponse.json({ error: 'User record not found' }, { status: 404 });
    }

    for (const row of balRows) {
      if (row.status === 'frozen') return NextResponse.json({ error: 'Account is frozen.' }, { status: 403 });
      if (row.status === 'banned') return NextResponse.json({ error: 'Account is banned.' }, { status: 403 });
    }

    const sortedByBal = [...balRows].sort((a, b) => Number(b.balance) - Number(a.balance));
    const userRow = sortedByBal.find((r) => Number(r.balance) >= amount);
    if (!userRow) return NextResponse.json({ error: 'Insufficient house balance in INIT' }, { status: 400 });

    const dbAddress = userRow.user_address;
    const entryId = `blitz:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
    const feeTxHash = await collectPlatformFeeFromTreasury('INIT', amount);
    const txRef = feeTxHash ? `${entryId}|feeTx:${feeTxHash}` : entryId;

    const { data, error } = await supabase.rpc('update_balance_for_withdrawal', {
      p_user_address: dbAddress,
      p_withdrawal_amount: amount,
      p_currency: 'INIT',
      p_transaction_hash: txRef,
    });

    if (error) {
      console.error('Database error in blitz entry:', error);
      return NextResponse.json({ error: 'Failed to process blitz entry' }, { status: 503 });
    }

    const result = data as { success: boolean; error: string | null; new_balance: number };
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Blitz entry failed' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      newBalance: Number(result.new_balance),
      feeTxHash,
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/balance/blitz:', error);
    return NextResponse.json({ error: 'An error occurred processing your request' }, { status: 500 });
  }
}
