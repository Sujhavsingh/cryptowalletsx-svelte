<script lang="ts">
  import { Brain } from 'lucide-svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import CardContent from '$lib/components/ui/CardContent.svelte';
  import CardHeader from '$lib/components/ui/CardHeader.svelte';
  import CardTitle from '$lib/components/ui/CardTitle.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { truncateAddress } from '$lib/utils/format';
  import type { WalletStats, Transaction } from '$lib/types';

  interface Props { stats: WalletStats; transactions: Transaction[]; }
  let { stats, transactions }: Props = $props();

  let mode = $state<'basic' | 'advanced'>('basic');

  let interactionShare = $derived(
    stats.totalTransactions > 0
      ? `${((stats.mostInteractedContractCount / stats.totalTransactions) * 100).toFixed(1)}%`
      : '0.0%'
  );

  let basicMetrics = $derived([
    { label: 'Total Transactions', value: stats.totalTransactions.toString(), sub: `${stats.outTransactions} out • ${stats.inTransactions} in` },
    { label: 'Highest Volume Transaction', value: stats.highestVolumeTx },
    { label: 'Fee Per Transaction', value: stats.feePerTransaction },
    { label: 'Volume Per Transaction', value: stats.volumePerTransaction },
    { label: 'Transaction Approval Rate', value: stats.approvalRate, sub: `${stats.approveCount} approvals` },
    { label: 'Total Contract/NFT Ratio', value: stats.contractNftRatio },
    { label: 'Daily Transaction Average', value: stats.dailyTxAverage },
    { label: 'Monthly Transaction Average', value: stats.monthlyTxAverage },
    {
      label: 'Most Interacted Contract/Address',
      value: stats.mostInteractedContract ? truncateAddress(stats.mostInteractedContract) : 'None',
      sub: stats.mostInteractedContractCount > 0 ? `${stats.mostInteractedContractCount} interactions • ${interactionShare}` : undefined,
    },
    {
      label: 'Token Diversity',
      value: `${stats.tokenDiversity} unique tokens`,
      sub: stats.mostUsedToken ? `most used: ${stats.mostUsedToken} (${stats.mostUsedTokenCount} times)` : undefined,
    },
  ]);

  let advancedMetrics = $derived([
    { label: 'Unique Contracts', value: stats.uniqueContracts.toString(), sub: `${stats.totalInteractions} interactions` },
    { label: 'Contracts Deployed', value: stats.deployCount.toString() },
    { label: 'Approvals', value: stats.approveCount.toString(), sub: stats.approvalRate },
    { label: 'Out / In Transactions', value: `${stats.outTransactions} / ${stats.inTransactions}` },
    { label: 'Token Transfers', value: stats.totalTrades.toString(), sub: `${stats.uniqueTokenTrades} unique tokens traded` },
    { label: 'NFT Mints', value: stats.totalMints.toString(), sub: `${stats.nftUnique} unique collections` },
    { label: 'Active Days', value: stats.daysActive.toString(), sub: `Current streak: ${stats.currentStreak}d` },
    { label: 'Active Weeks', value: stats.weeksActive.toString(), sub: `Best streak: ${stats.bestStreak}d` },
    { label: 'Active Months', value: stats.monthsActive.toString(), sub: `Wallet age: ${stats.walletAge}d` },
    { label: 'DeFi Activities', value: stats.defiActivityCount.toString(), sub: `${stats.swapActivityCount} swaps • ${stats.stakingLiquidityActivityCount} staking/LP` },
    { label: 'Transactions Loaded', value: transactions.length.toString() },
    { label: 'Last Activity', value: stats.lastActivity },
  ]);
</script>

<Card class="glass-card bg-card/60 border-border/40">
  <CardHeader class="pb-3">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <CardTitle class="text-base flex items-center gap-2">
          <Brain class="w-4 h-4 text-purple-500" />
          Analysis
        </CardTitle>
      </div>
      <div class="flex gap-1">
        <Button variant={mode === 'basic' ? 'secondary' : 'ghost'} size="sm" class="h-7 text-xs {mode === 'basic' ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400' : ''}" onclick={() => mode = 'basic'}>Basic</Button>
        <Button variant={mode === 'advanced' ? 'secondary' : 'ghost'} size="sm" class="h-7 text-xs {mode === 'advanced' ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400' : ''}" onclick={() => mode = 'advanced'}>Advanced</Button>
      </div>
    </div>
  </CardHeader>
  <CardContent>
    <div class="grid sm:grid-cols-2 gap-3">
      {#each (mode === 'basic' ? basicMetrics : advancedMetrics) as metric}
        <div class="p-3 rounded-lg bg-secondary/30">
          <p class="text-xs text-muted-foreground mb-1">{metric.label}</p>
          <p class="text-sm font-semibold">{metric.value}</p>
          {#if 'sub' in metric && metric.sub}
            <p class="text-xs text-muted-foreground mt-0.5">{metric.sub}</p>
          {/if}
        </div>
      {/each}
    </div>
  </CardContent>
</Card>
