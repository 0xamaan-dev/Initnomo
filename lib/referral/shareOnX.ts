/**
 * Canonical X/Twitter share copy for referral links (used from /referrals and /profile).
 */

export function getReferralShareTweetText(): string {
  return [
    'Initnomo on Initia is live.⚡️',
    '',
    'Initnomo is an Initia-focused binary options trading app with fast oracle-driven rounds.',
    '',
    'Tap my link → We earn 10% on their trading volume. We both run it up. 💸',
    '',
    'Join from my link and start trading: 🔥👇',
  ].join('\n');
}

export function referralLandingUrl(referralCode: string): string {
  return `https://initnomo.vercel.app/?ref=${encodeURIComponent(referralCode.trim())}`;
}

export function openReferralShareOnX(referralLink: string): void {
  if (typeof window === 'undefined') return;
  const text = encodeURIComponent(getReferralShareTweetText());
  window.open(
    `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(referralLink)}`,
    '_blank',
  );
}
