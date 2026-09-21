<script lang="ts">
  import { Coins, BarChart3 } from 'lucide-svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import CardContent from '$lib/components/ui/CardContent.svelte';
  import CardHeader from '$lib/components/ui/CardHeader.svelte';
  import CardTitle from '$lib/components/ui/CardTitle.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { truncateAddress, timeAgo } from '$lib/utils/format';
  import LoadMoreButton from '../LoadMoreButton.svelte';
  import type { TokenTransfer, AllToken } from '$lib/types';

  interface Props { tokenTransfers: TokenTransfer[]; allTokens: AllToken[]; }
  let { tokenTransfers, allTokens }: Props = $props();

  let subTab = $state<'tokens' | 'recent'>('tokens');

  /** Both lists can run long on an active wallet, so each is revealed a page at a time. */
  const PAGE_SIZE = 15;
  let visibleTokens = $state(PAGE_SIZE);
  let visibleTransfers = $state(PAGE_SIZE);

  let tokenAnalysis = $derived.by(() => {
    const analysis = new Map<string, { symbol: string; name: string; address: string; totalInteractions: number; last7d: number; firstSeen: string; lastSeen: string; types: Set<string> }>();
    const sevenDaysAgo = Date.now() - 7 * 86400000;

    tokenTransfers.forEach(tf => {
      const addr = tf.token?.address_hash?.toLowerCase() || '';
      const symbol = tf.token?.symbol || 'Unknown';
      const name = tf.token?.name || symbol;
      if (!analysis.has(addr)) {
        analysis.set(addr, { symbol, name, address: addr, totalInteractions: 0, last7d: 0, firstSeen: tf.timestamp, lastSeen: tf.timestamp, types: new Set() });
      }
      const entry = analysis.get(addr)!;
      entry.totalInteractions++;
      entry.lastSeen = tf.timestamp > entry.lastSeen ? tf.timestamp : entry.lastSeen;
      entry.firstSeen = tf.timestamp < entry.firstSeen ? tf.timestamp : entry.firstSeen;
      if (new Date(tf.timestamp).getTime() > sevenDaysAgo) entry.last7d++;
      if (tf.from?.hash) entry.types.add('sent');
      if (tf.to?.hash) entry.types.add('received');
    });

    return Array.from(analysis.values()).sort((a, b) => b.totalInteractions - a.totalInteractions);
  });

  let statsSummary = $derived.by(() => {
    const totalInteractions = tokenAnalysis.reduce((sum, t) => sum + t.totalInteractions, 0);
    const avgInteractions = tokenAnalysis.length > 0 ? totalInteractions / tokenAnalysis.length : 0;
    const activeTokens7d = tokenAnalysis.filter(t => t.last7d > 0).length;
    const mostActiveToken = tokenAnalysis.length > 0 ? tokenAnalysis[0].symbol : 'None';
    return { avgInteractions, activeTokens7d, mostActiveToken, tokenCount: tokenAnalysis.length };
  });
</script>

<Card class="glass-card bg-card/60 border-border/40">
  <CardHeader class="pb-3">
    <div class="flex items-start justify-between flex-wrap gap-3">
      <div>
        <CardTitle class="text-base flex items-center gap-2">
          <Coins class="w-4 h-4 text-amber-500" />
          Token Analysis
        </CardTitle>
        <p class="text-xs text-muted-foreground mt-1">Detailed token activity breakdown</p>
      </div>
      <div class="flex gap-1">
        <Button variant={subTab === 'tokens' ? 'secondary' : 'ghost'} size="sm" class="h-7 text-xs {subTab === 'tokens' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : ''}" onclick={() => subTab = 'tokens'}>Tokens ({statsSummary.tokenCount})</Button>
        <Button variant={subTab === 'recent' ? 'secondary' : 'ghost'} size="sm" class="h-7 text-xs {subTab === 'recent' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : ''}" onclick={() => subTab = 'recent'}>Recent Activity</Button>
      </div>
    </div>
  </CardHeader>
  <CardContent>
    {#if subTab === 'tokens'}
      <div class="space-y-2">
        {#each tokenAnalysis.slice(0, visibleTokens) as token}
          <div class="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Coins class="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div>
                  <p class="text-sm font-medium">{token.name} ({token.symbol})</p>
                  <p class="text-[10px] text-muted-foreground">First: {new Date(token.firstSeen).toLocaleDateString()} • Last: {new Date(token.lastSeen).toLocaleDateString()} • Type: {Array.from(token.types).join(', ')}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Badge variant="outline" class="text-[10px] h-5">{token.totalInteractions}</Badge>
                <Badge class="text-[10px] h-5 bg-amber-500/10 text-amber-500 border-amber-500/30">{token.last7d}</Badge>
              </div>
            </div>
          </div>
        {/each}
        {#if tokenAnalysis.length === 0}
          <div class="text-center py-8 text-muted-foreground">
            <Coins class="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p class="text-sm">No token activity found</p>
          </div>
        {/if}
        <LoadMoreButton
          visible={visibleTokens}
          total={tokenAnalysis.length}
          step={PAGE_SIZE}
          label="tokens"
          onclick={() => (visibleTokens += PAGE_SIZE)}
        />
      </div>
    {:else}
      <div class="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
        {#each tokenTransfers.slice(0, visibleTransfers) as tf, i}
          <div class="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Coins class="w-3.5 h-3.5 text-muted-foreground" />
                <span class="text-sm font-medium">{tf.token?.symbol || 'Unknown'}</span>
                <Badge variant="outline" class="text-[10px] h-4">{tf.method}</Badge>
              </div>
              <span class="text-xs text-muted-foreground">{timeAgo(tf.timestamp)}</span>
            </div>
            <p class="text-xs text-muted-foreground mt-1">{truncateAddress(tf.from?.hash || '')} → {truncateAddress(tf.to?.hash || '')}</p>
          </div>
        {/each}
      </div>
      <LoadMoreButton
        visible={visibleTransfers}
        total={tokenTransfers.length}
        step={PAGE_SIZE}
        label="token transfers"
        onclick={() => (visibleTransfers += PAGE_SIZE)}
      />
    {/if}

    <div class="mt-4 pt-4 border-t border-border/50">
      <h4 class="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
        <BarChart3 class="w-3 h-3" />
        Statistics Summary
      </h4>
      <div class="grid grid-cols-3 gap-3">
        <div class="text-center p-2 rounded-lg bg-secondary/30">
          <p class="text-xs text-muted-foreground">Avg Interactions/Token</p>
          <p class="text-sm font-semibold">{statsSummary.avgInteractions.toFixed(2)}</p>
        </div>
        <div class="text-center p-2 rounded-lg bg-secondary/30">
          <p class="text-xs text-muted-foreground">Active Tokens (7d)</p>
          <p class="text-sm font-semibold">{statsSummary.activeTokens7d}</p>
        </div>
        <div class="text-center p-2 rounded-lg bg-secondary/30">
          <p class="text-xs text-muted-foreground">Most Active Token</p>
          <p class="text-sm font-semibold">{statsSummary.mostActiveToken}</p>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
