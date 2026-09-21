import type { ChainConfig, WalletStats } from '$lib/types';
import { fetchWithTimeout } from './api';

export type BadgeTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'LEGEND' | 'CHAIN';

export interface AchievementItem {
  id: string;
  name: string;
  tier: BadgeTier;
  description: string;
  earned: boolean;
}

export interface AchievementSummary {
  earned: number;
  total: number;
  /** 0-100, rounded */
  percent: number;
  items: AchievementItem[];
}

/**
 * Everything the badge catalog needs, derived from data the checker already fetches.
 * `volumeUSD` is the USD value of the native currency moved (native value plus
 * native-token transfers the wallet sent); `feeAmount` is the native amount of fees
 * paid — the fee thresholds are evaluated against the native amount at par.
 */
interface BadgeInput {
  stats: WalletStats;
  volumeUSD: number;
  feeAmount: number;
}

interface BadgeDef {
  id: string;
  name: string;
  tier: BadgeTier;
  description: string;
  check: (input: BadgeInput) => boolean;
}

const badge = (
  id: string,
  name: string,
  tier: BadgeTier,
  description: string,
  check: (input: BadgeInput) => boolean
): BadgeDef => ({ id, name, tier, description, check });

/** Universal badges — available on every chain in the checker suite. */
export const UNIVERSAL_BADGES: BadgeDef[] = [
  badge('first-steps', 'First Steps', 'BRONZE', 'Made your first transaction on-chain', ({ stats }) => stats.totalTransactions >= 1),
  badge('first-dollar', 'First Dollar', 'BRONZE', 'Moved at least $1 in volume on-chain', ({ volumeUSD }) => volumeUSD >= 1),
  badge('hundred-club', 'Hundred Club', 'BRONZE', 'Moved $100+ in total on-chain volume', ({ volumeUSD }) => volumeUSD >= 100),
  badge('ten-trades', 'Ten Trades', 'BRONZE', 'Completed 10+ transactions', ({ stats }) => stats.totalTransactions >= 10),
  badge('active-user', 'Active User', 'SILVER', 'Completed 50+ transactions', ({ stats }) => stats.totalTransactions >= 50),
  badge('century-club', 'Century Club', 'SILVER', 'Completed 100+ transactions', ({ stats }) => stats.totalTransactions >= 100),
  badge('power-trader', 'Power Trader', 'GOLD', 'Completed 500+ transactions', ({ stats }) => stats.totalTransactions >= 500),
  badge('thousand-club', 'Thousand Club', 'GOLD', 'Completed 1,000+ transactions', ({ stats }) => stats.totalTransactions >= 1000),
  badge('tx-legend', 'TX Legend', 'LEGEND', 'Completed 2,000+ transactions', ({ stats }) => stats.totalTransactions >= 2000),
  badge('streak-igniter', 'Streak Igniter', 'BRONZE', 'Active on-chain for 3+ consecutive days', ({ stats }) => stats.bestStreak >= 3),
  badge('streak-on-fire', 'Streak on Fire', 'SILVER', 'Active on-chain for 7+ consecutive days', ({ stats }) => stats.bestStreak >= 7),
  badge('streak-champion', 'Streak Champion', 'GOLD', 'Active on-chain for 14+ consecutive days', ({ stats }) => stats.bestStreak >= 14),
  badge('streak-immortal', 'Streak Immortal', 'LEGEND', 'Active on-chain for 30+ consecutive days', ({ stats }) => stats.bestStreak >= 30),
  badge('quarterly-regular', 'Quarterly Regular', 'SILVER', 'Active on-chain across 12+ different weeks', ({ stats }) => stats.weeksActive >= 12),
  badge('yearly-pioneer', 'Yearly Pioneer', 'GOLD', 'Active on-chain across 6+ different months', ({ stats }) => stats.monthsActive >= 6),
  badge('volume-climber', 'Volume Climber', 'SILVER', 'Moved $1,000+ in total on-chain volume', ({ volumeUSD }) => volumeUSD >= 1000),
  badge('high-roller', 'High Roller', 'SILVER', 'Moved $5,000+ in total on-chain volume', ({ volumeUSD }) => volumeUSD >= 5000),
  badge('volume-whale', 'Volume Whale', 'GOLD', 'Moved $10,000+ in total on-chain volume', ({ volumeUSD }) => volumeUSD >= 10000),
  badge('volume-king', 'Volume King', 'LEGEND', 'Moved $100,000+ in total on-chain volume', ({ volumeUSD }) => volumeUSD >= 100000),
  badge('gas-spender', 'Gas Spender', 'BRONZE', 'Spent at least $10 in transaction fees', ({ feeAmount }) => feeAmount >= 10),
  badge('gas-burner', 'Gas Burner', 'BRONZE', 'Spent $50+ in transaction fees', ({ feeAmount }) => feeAmount >= 50),
  badge('gas-veteran', 'Gas Veteran', 'SILVER', 'Spent $100+ in transaction fees', ({ feeAmount }) => feeAmount >= 100),
  badge('gas-master', 'Gas Master', 'GOLD', 'Spent $1,000+ in transaction fees', ({ feeAmount }) => feeAmount >= 1000),
  badge('explorer', 'Explorer', 'BRONZE', 'Interacted with 10+ unique contracts', ({ stats }) => stats.uniqueContracts >= 10),
  badge('contract-hopper', 'Contract Hopper', 'SILVER', 'Interacted with 50+ unique contracts', ({ stats }) => stats.uniqueContracts >= 50),
  badge('network-navigator', 'Network Navigator', 'SILVER', 'Interacted with 100+ unique contracts', ({ stats }) => stats.uniqueContracts >= 100),
  badge('protocol-pioneer', 'Protocol Pioneer', 'GOLD', 'Interacted with 200+ unique contracts', ({ stats }) => stats.uniqueContracts >= 200),
  badge('ecosystem-lord', 'Ecosystem Lord', 'LEGEND', 'Interacted with 500+ unique contracts', ({ stats }) => stats.uniqueContracts >= 500),
  badge('nft-starter', 'NFT Starter', 'BRONZE', 'Minted your first NFT on-chain', ({ stats }) => stats.totalMints >= 1),
  badge('nft-explorer', 'NFT Explorer', 'BRONZE', 'Minted 5+ NFTs', ({ stats }) => stats.totalMints >= 5),
  badge('nft-collector', 'NFT Collector', 'SILVER', 'Minted from 10+ unique NFT contracts', ({ stats }) => stats.uniqueNFTs >= 10),
  badge('nft-hunter', 'NFT Hunter', 'GOLD', 'Minted 50+ NFTs across collections', ({ stats }) => stats.totalMints >= 50),
  badge('nft-virtuoso', 'NFT Virtuoso', 'LEGEND', 'Minted 200+ NFTs', ({ stats }) => stats.totalMints >= 200),
  badge('week-warrior', 'Week Warrior', 'BRONZE', 'Active on-chain for 7+ different days', ({ stats }) => stats.daysActive >= 7),
  badge('two-weeks', 'Two Weeks', 'BRONZE', 'Active on-chain for 14+ different days', ({ stats }) => stats.daysActive >= 14),
  badge('monthly-regular', 'Monthly Regular', 'SILVER', 'Active on-chain for 30+ different days', ({ stats }) => stats.daysActive >= 30),
  badge('consistent-builder', 'Consistent Builder', 'GOLD', 'Active on-chain for 90+ different days', ({ stats }) => stats.daysActive >= 90),
  badge('og-user', 'OG User', 'LEGEND', 'Active on-chain for 180+ different days', ({ stats }) => stats.daysActive >= 180),
  badge('code-deployer', 'Code Deployer', 'SILVER', 'Deployed at least 1 smart contract', ({ stats }) => stats.deployCount >= 1),
  badge('smart-builder', 'Smart Builder', 'GOLD', 'Deployed 5+ smart contracts on-chain', ({ stats }) => stats.deployCount >= 5),
  badge('factory-owner', 'Factory Owner', 'GOLD', 'Deployed 10+ smart contracts', ({ stats }) => stats.deployCount >= 10),
  badge('protocol-architect', 'Protocol Architect', 'LEGEND', 'Deployed 20+ smart contracts', ({ stats }) => stats.deployCount >= 20),
  badge('defi-curious', 'DeFi Curious', 'BRONZE', 'Completed 5+ DeFi activities', ({ stats }) => stats.defiActivityCount >= 5),
  badge('defi-explorer', 'DeFi Explorer', 'BRONZE', 'Completed 20+ DeFi activities', ({ stats }) => stats.defiActivityCount >= 20),
  badge('swap-specialist', 'Swap Specialist', 'SILVER', 'Completed 25+ token swaps', ({ stats }) => stats.swapActivityCount >= 25),
  badge('defi-degen', 'DeFi Degen', 'SILVER', 'Completed 50+ DeFi activities', ({ stats }) => stats.defiActivityCount >= 50),
  badge('liquidity-lord', 'Liquidity Lord', 'GOLD', 'Provided liquidity or staked 10+ times', ({ stats }) => stats.stakingLiquidityActivityCount >= 10),
  badge('staking-master', 'Staking Master', 'GOLD', 'Completed 20+ staking or liquidity events', ({ stats }) => stats.stakingLiquidityActivityCount >= 20),
  badge('defi-maestro', 'DeFi Maestro', 'LEGEND', '200+ DeFi activities — master of decentralized finance', ({ stats }) => stats.defiActivityCount >= 200),
  badge('token-taster', 'Token Taster', 'BRONZE', 'Interacted with 5+ unique tokens', ({ stats }) => stats.uniqueTokensSent >= 5),
  badge('token-diversifier', 'Token Diversifier', 'SILVER', 'Interacted with 25+ unique tokens', ({ stats }) => stats.uniqueTokensSent >= 25),
  badge('token-explorer', 'Token Explorer', 'SILVER', 'Interacted with 50+ unique tokens', ({ stats }) => stats.uniqueTokensSent >= 50),
  badge('token-connoisseur', 'Token Connoisseur', 'GOLD', 'Interacted with 100+ unique tokens', ({ stats }) => stats.uniqueTokensSent >= 100),
];

/** Arc-only badges, rendered with the chain tier label. */
export const ARC_CHAIN_BADGES: BadgeDef[] = [
  badge('arc-pioneer', 'Arc Pioneer', 'CHAIN', 'Made your first transaction on Arc', ({ stats }) => stats.totalTransactions >= 1),
  badge('arc-native', 'Arc Native', 'CHAIN', 'Made 10+ transactions on Arc', ({ stats }) => stats.totalTransactions >= 10),
  badge('arc-regular', 'Arc Regular', 'CHAIN', 'Active on Arc across 7+ different days', ({ stats }) => stats.daysActive >= 7),
  badge('arc-og', 'Arc OG', 'CHAIN', 'Active on Arc across 30+ different days', ({ stats }) => stats.daysActive >= 30),
  badge('arc-builder', 'Arc Builder', 'CHAIN', 'Deployed at least 1 smart contract on Arc', ({ stats }) => stats.deployCount >= 1),
  badge('arc-explorer', 'Arc Explorer', 'CHAIN', 'Interacted with 10+ unique contracts on Arc', ({ stats }) => stats.uniqueContracts >= 10),
  badge('arc-defi-master', 'Arc DeFi Master', 'CHAIN', 'Completed 10+ DeFi activities on Arc', ({ stats }) => stats.defiActivityCount >= 10),
  badge('arc-volume-whale', 'Arc Volume Whale', 'CHAIN', 'Moved $1,000+ in volume on Arc', ({ volumeUSD }) => volumeUSD >= 1000),
];

/** Chain-tier badge sets, keyed by chain id. Robinhood Chain has none. */
export const CHAIN_BADGES: Record<string, BadgeDef[]> = {
  arc: ARC_CHAIN_BADGES,
};

/** Uppercased short chain name used as the tier label for chain badges (ARC). */
export function chainBadgeLabel(config: ChainConfig): string {
  return (config.name || '').trim().split(/\s+/)[0]?.toUpperCase() || 'CHAIN';
}

export function badgeTierLabel(tier: BadgeTier, config: ChainConfig): string {
  return tier === 'CHAIN' ? chainBadgeLabel(config) : tier;
}

/**
 * USD value of the native currency a wallet moved: native value sent plus
 * native-denominated ERC-20 transfers sent (on USDC-native chains such as Arc the
 * native token only moves as an ERC-20 transfer, so `tx.value` alone reads $0),
 * priced with the explorer's cached `coin_price`.
 */
export function getVolumeUSD(stats: WalletStats, nativePrice: number): number {
  const price = Number.isFinite(nativePrice) && nativePrice > 0 ? nativePrice : 0;
  return stats.volumeMovedNative * price;
}

/**
 * Evaluate the badge catalog for a wallet. Earned badges come first, both groups
 * keeping catalog order.
 */
export function computeAchievements(
  stats: WalletStats,
  config: ChainConfig,
  nativePrice: number = 0
): AchievementSummary {
  const input: BadgeInput = {
    stats,
    volumeUSD: getVolumeUSD(stats, nativePrice),
    feeAmount: stats.feesPaidNative,
  };

  const catalog = [...UNIVERSAL_BADGES, ...(CHAIN_BADGES[config.id] || [])];
  const evaluated: AchievementItem[] = catalog.map(def => ({
    id: def.id,
    name: def.name,
    tier: def.tier,
    description: def.description,
    earned: def.check(input),
  }));

  const earnedItems = evaluated.filter(item => item.earned);
  const lockedItems = evaluated.filter(item => !item.earned);
  const earned = earnedItems.length;
  const total = evaluated.length;

  return {
    earned,
    total,
    percent: total > 0 ? Math.round((earned / total) * 100) : 0,
    items: [...earnedItems, ...lockedItems],
  };
}

// ---- Native token price (fetched at most once per chain) ----

const pricePromises = new Map<string, Promise<number>>();

const STABLE_NATIVE_CURRENCIES = ['USDC', 'USDT', 'DAI', 'USDG', 'PYUSD', 'USDE', 'USDBC'];

/**
 * USD price of the chain's native token, from the explorer's `/stats` endpoint.
 * Cached per chain in a module-level promise so it is requested at most once.
 * Stablecoin-native chains fall back to $1; every other chain falls back to 0,
 * which yields a $0 volume rather than a guess.
 */
export function getNativeTokenPrice(config: ChainConfig): Promise<number> {
  const cached = pricePromises.get(config.id);
  if (cached) return cached;

  const promise = fetchNativeTokenPrice(config)
    .catch(() => fallbackNativePrice(config));
  pricePromises.set(config.id, promise);
  return promise;
}

function fallbackNativePrice(config: ChainConfig): number {
  return STABLE_NATIVE_CURRENCIES.includes((config.nativeCurrency || '').toUpperCase()) ? 1 : 0;
}

async function fetchNativeTokenPrice(config: ChainConfig): Promise<number> {
  const res = await fetchWithTimeout(`${config.apiBase}/stats`, 10000);
  if (!res.ok) throw new Error(`stats request failed with ${res.status}`);
  const data = await res.json();
  const price = parseFloat(data?.coin_price);
  if (!Number.isFinite(price) || price <= 0) throw new Error('missing coin_price');
  return price;
}
