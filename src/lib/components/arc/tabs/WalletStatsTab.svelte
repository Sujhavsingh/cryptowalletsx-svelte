<script lang="ts">
  import { Activity, Building2, DollarSign, Palette, Receipt, Wallet, Layers, Repeat, Coins } from 'lucide-svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import CardContent from '$lib/components/ui/CardContent.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { calculateWalletStats, withBadgeScore } from '$lib/utils/score';
  import { computeAchievements, getNativeTokenPrice, getVolumeUSD } from '$lib/utils/badges';
  import { formatNumber, formatUSD } from '$lib/utils/format';
  import type { AddressDetails, Transaction, TokenTransfer, TokenBalance, NFTItem, AllToken, WalletStats, ChainConfig } from '$lib/types';

  import ScoreBadge from '../cards/ScoreBadge.svelte';
  import WalletHealthScore from '../cards/WalletHealthScore.svelte';
  import ActivityStreakCard from '../cards/ActivityStreakCard.svelte';
  import AchievementsCard from '../cards/AchievementsCard.svelte';
  import TransactionVisualizer from '../cards/TransactionVisualizer.svelte';
  import TransactionsList from '../cards/TransactionsList.svelte';
  import AnalysisSection from '../cards/AnalysisSection.svelte';
  import DefiActivity from '../cards/DefiActivity.svelte';
  import TokenAnalysis from '../cards/TokenAnalysis.svelte';
  import ContractDeploy from '../cards/ContractDeploy.svelte';
  import ProtocolsTable from '../cards/ProtocolsTable.svelte';
  import TransactionFlow from '../cards/TransactionFlow.svelte';
  import GasFeeTimeline from '../cards/GasFeeTimeline.svelte';
  import InteractionRadar from '../cards/InteractionRadar.svelte';
  import WalletComparison from '../cards/WalletComparison.svelte';

  interface Props {
    addressDetails: AddressDetails | null;
    transactions: Transaction[];
    tokenTransfers: TokenTransfer[];
    tokenBalances: TokenBalance[];
    nfts: NFTItem[];
    allTokens: AllToken[];
    config: ChainConfig;
  }

  let { addressDetails, transactions, tokenTransfers, tokenBalances, nfts, allTokens, config }: Props = $props();

  // Extract exchange rate from address details (Blockscout provides this)
  let exchangeRate = $derived(() => {
    const rate = addressDetails?.exchange_rate;
    if (rate && !isNaN(parseFloat(rate)) && parseFloat(rate) > 0) {
      return parseFloat(rate);
    }
    return 0;
  });

  // Native token price (one cached /stats request per chain, shared with the badge engine)
  let nativePrice = $state(0);
  $effect(() => {
    let active = true;
    getNativeTokenPrice(config).then(price => {
      if (active) nativePrice = price;
    });
    return () => { active = false; };
  });

  // Stats come first because the badge engine scores them; the score then folds the
  // badges back in, so it is derived rather than read off the stats object.
  let baseStats = $derived(
    calculateWalletStats(addressDetails, transactions, tokenTransfers, tokenBalances, nfts, allTokens, config.nativeCurrency, config.nativeDecimals, exchangeRate())
  );
  let achievements = $derived(computeAchievements(baseStats, config, nativePrice));
  let stats = $derived(withBadgeScore(baseStats, achievements));

  // Volume moved: native value sent plus native-token transfers sent, priced with the
  // explorer's coin_price — the same figure the badge volume badges are evaluated against.
  let volumeUSD = $derived(getVolumeUSD(baseStats, nativePrice));
  let volumeNativeDisplay = $derived(
    `${formatNumber(stats.volumeMovedNative, stats.volumeMovedNative >= 1 ? 2 : 6)} ${config.nativeCurrency}`
  );

  const statCards = $derived([
    {
      icon: Activity, label: 'Interactions', color: 'text-cyan-500', bgColor: 'bg-cyan-500/10',
      metrics: [
        { label: 'Total', value: stats.totalTransactions },
        { label: 'Out', value: stats.outTransactions },
        { label: 'In', value: stats.inTransactions },
        { label: 'Approve', value: stats.approveCount },
      ],
      change: `+${stats.sevenDayChange.interactions}d`,
    },
    {
      icon: Building2, label: 'Interacted Contracts', color: 'text-teal-500', bgColor: 'bg-teal-500/10',
      metrics: [
        { label: 'Unique', value: stats.uniqueContracts },
        { label: 'Deploy', value: stats.deployCount || '-' },
        { label: 'Total', value: stats.totalInteractions },
      ],
      change: `+${stats.sevenDayChange.contracts}d`,
    },
    {
      icon: DollarSign, label: 'Volume', color: 'text-amber-500', bgColor: 'bg-amber-500/10',
      metrics: [
        { label: 'USD', value: formatUSD(volumeUSD) },
        { label: '', value: volumeNativeDisplay },
      ],
      change: `+${stats.sevenDayChange.volume}`,
    },
    {
      icon: Palette, label: 'NFT Mint', color: 'text-pink-500', bgColor: 'bg-pink-500/10',
      metrics: [
        { label: 'Unique', value: stats.uniqueNFTs },
        { label: 'Total', value: stats.totalMints },
      ],
      change: `+${stats.sevenDayChange.nfts}d`,
    },
    {
      icon: Receipt, label: `Fees (${config.nativeCurrency})`, color: 'text-orange-500', bgColor: 'bg-orange-500/10',
      metrics: [
        { label: 'USD', value: stats.feesUSD },
        { label: '', value: stats.feesNative },
      ],
      change: `+${stats.sevenDayChange.fees}`,
    },
    {
      icon: Wallet, label: `Balance (${config.nativeCurrency})`, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10',
      metrics: [
        { label: 'USD', value: stats.balanceUSD },
        { label: '', value: stats.balanceNative },
      ],
      change: '0d',
    },
    {
      icon: Layers, label: 'Staking & Liquidity', color: 'text-violet-500', bgColor: 'bg-violet-500/10',
      metrics: [
        { label: 'Total', value: stats.stakingActivities },
        { label: 'Unique', value: stats.stakingProtocols },
      ],
      change: '0d',
    },
    {
      icon: Repeat, label: 'Unique Tokens Trade', color: 'text-sky-500', bgColor: 'bg-sky-500/10',
      metrics: [
        { label: 'Total', value: stats.totalTrades },
        { label: 'Unique', value: stats.uniqueTokenTrades },
      ],
      change: `+${stats.sevenDayChange.tokens}d`,
    },
    {
      icon: Coins, label: 'Tokens', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10',
      metrics: [
        { label: 'NFT Unique', value: stats.nftUnique },
        { label: 'Token Unique', value: stats.tokenUnique },
      ],
      change: '0d',
    },
  ]);
</script>

<div class="space-y-6">
  <!-- Wallet Health Score + Activity Streak -->
  <div class="grid md:grid-cols-2 gap-4">
    <WalletHealthScore {stats} />
    <ActivityStreakCard {stats} />
  </div>

  <!-- On-Chain Badges -->
  <AchievementsCard {stats} {config} />

  <!-- Score Badge -->
  <ScoreBadge score={stats.score} rank={stats.rank} />

  <!-- Stats Cards Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
    {#each statCards as card}
      <Card class="glass-card bg-card/60 border-border/40 card-hover-lift">
        <CardContent class="p-3 sm:p-4">
          <div class="flex items-center justify-between mb-2 sm:mb-3">
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg {card.bgColor} flex items-center justify-center shrink-0">
                <card.icon class="w-3.5 h-3.5 sm:w-4 sm:h-4 {card.color}" />
              </div>
              <span class="text-xs sm:text-sm font-medium truncate">{card.label}</span>
            </div>
            <Badge variant="secondary" class="text-[10px] sm:text-xs shrink-0 ml-1 {card.change !== '0d' ? 'text-cyan-500 bg-cyan-500/10' : 'text-muted-foreground'}">
              {card.change}
            </Badge>
          </div>
          <div class="space-y-1 sm:space-y-1.5">
            {#each card.metrics as metric}
              <div class="flex items-center justify-between gap-2">
                {#if metric.label}
                  <span class="text-[11px] sm:text-xs text-muted-foreground shrink-0">{metric.label}</span>
                {/if}
                <span class="text-xs sm:text-sm font-semibold {!metric.label ? 'ml-auto' : ''} truncate">
                  {metric.value}
                </span>
              </div>
            {/each}
          </div>
        </CardContent>
      </Card>
    {/each}
  </div>

  <!-- Transaction Flow + Gas Fee Timeline -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <TransactionFlow {transactions} address={addressDetails?.hash || ''} {config} />
    <GasFeeTimeline {transactions} {config} />
  </div>

  <!-- Interaction Radar + Wallet Comparison -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <InteractionRadar {stats} />
    <WalletComparison {stats} />
  </div>

  <!-- Transaction Visualizer -->
  <TransactionVisualizer {transactions} />

  <!-- Transactions List -->
  <TransactionsList {transactions} address={addressDetails?.hash || ''} {config} />

  <!-- Analysis Section -->
  <AnalysisSection {stats} {transactions} />

  <!-- DeFi Activity -->
  <DefiActivity {stats} />

  <!-- Token Analysis -->
  <TokenAnalysis {tokenTransfers} {allTokens} />

  <!-- Contract Deploy -->
  <ContractDeploy {transactions} address={addressDetails?.hash || ''} {config} />

  <!-- Protocols Table -->
  <ProtocolsTable {transactions} address={addressDetails?.hash || ''} {config} />
</div>
