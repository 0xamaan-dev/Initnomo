export type UserTier = 'free' | 'standard' | 'vip';

export const FEE_PERCENT_BY_TIER: Record<UserTier, number> = {
  free: 0.10,
  standard: 0.09,
  vip: 0.08,
};

const DEFAULT_FEE_PERCENT = FEE_PERCENT_BY_TIER.free;

function normalizeTier(tier?: string | null): UserTier {
  if (tier === 'standard' || tier === 'vip' || tier === 'free') return tier;
  return 'free';
}

export function getFeePercent(tier?: string | null): number {
  return FEE_PERCENT_BY_TIER[normalizeTier(tier)];
}

export function getFeePercentLabel(tier?: string | null): string {
  return `${Math.round(getFeePercent(tier) * 100)}%`;
}

export function calculateFeeAmount(amount: number, tier?: string | null): number {
  const fee = amount * getFeePercent(tier);
  return Math.floor(fee * 1e8) / 1e8;
}

function getEnvOptional(key: string): string | null {
  const val = process.env[key];
  return val && val.trim() ? val.trim() : null;
}

export function getPlatformFeeWalletAddress(normalizedCurrency: string): string | null {
  if (normalizedCurrency === 'INIT') {
    return getEnvOptional('NEXT_PUBLIC_PLATFORM_FEE_WALLET_INIT');
  }
  return null;
}

export async function collectPlatformFeeFromTreasury(
  normalizedCurrency: string,
  feeAmount: number,
): Promise<string | null> {
  if (!feeAmount || feeAmount <= 0) return null;
  if (normalizedCurrency !== 'INIT') return null;

  const feeWallet = getPlatformFeeWalletAddress(normalizedCurrency);
  if (!feeWallet) return null;

  const { transferINITFromTreasury } = await import('@/lib/initia/backend-client');
  return transferINITFromTreasury(feeWallet, feeAmount);
}

export { DEFAULT_FEE_PERCENT };
