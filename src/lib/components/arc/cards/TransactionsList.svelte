<script lang="ts">
  import { ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle, Clock } from 'lucide-svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import CardContent from '$lib/components/ui/CardContent.svelte';
  import CardHeader from '$lib/components/ui/CardHeader.svelte';
  import CardTitle from '$lib/components/ui/CardTitle.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import LoadMoreButton from '../LoadMoreButton.svelte';
  import { truncateAddress, weiToNative, timeAgo } from '$lib/utils/format';
  import type { Transaction, ChainConfig } from '$lib/types';

  interface Props { transactions: Transaction[]; address: string; config: ChainConfig; }
  let { transactions, address, config }: Props = $props();

  /** A busy wallet can have hundreds of rows, so they are revealed a page at a time. */
  const PAGE_SIZE = 15;
  let visible = $state(PAGE_SIZE);
  let displayTxs = $derived(transactions.slice(0, visible));
  let addr = $derived(address.toLowerCase());
</script>

<Card class="glass-card bg-card/60 border-border/40">
  <CardHeader class="pb-3">
    <div class="flex items-center justify-between">
      <div>
        <CardTitle class="text-base flex items-center gap-2">
          <Clock class="w-4 h-4 text-teal-500" />
          Transactions
        </CardTitle>
        <p class="text-xs text-muted-foreground mt-1">{transactions.length} transactions • Chronological order</p>
      </div>
    </div>
  </CardHeader>
  <CardContent>
    <div class="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
      {#each displayTxs as tx}
        {@const isOutgoing = tx.from?.hash?.toLowerCase() === addr}
        {@const isIncoming = tx.to?.hash?.toLowerCase() === addr}
        {@const isSuccess = tx.status === 'ok' || tx.result === 'success'}
        <div class="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-colors">
          <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 {isOutgoing ? 'bg-emerald-500/15' : 'bg-blue-500/15'}">
            {#if isOutgoing}
              <ArrowUpRight class="w-4 h-4 text-emerald-500" />
            {:else}
              <ArrowDownRight class="w-4 h-4 text-blue-500" />
            {/if}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <a href="{config.blockExplorerTxUrl}{tx.hash}" target="_blank" rel="noopener noreferrer" class="text-sm font-mono hover:text-emerald-500 transition-colors truncate">
                {tx.hash.slice(0, 10)}...{tx.hash.slice(-6)}
              </a>
              {#if isSuccess}
                <CheckCircle2 class="w-3 h-3 text-emerald-500 shrink-0" />
              {:else}
                <XCircle class="w-3 h-3 text-destructive shrink-0" />
              {/if}
            </div>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-xs text-muted-foreground">
                {isOutgoing ? 'To:' : 'From:'} {truncateAddress(isOutgoing ? (tx.to?.hash || '') : (tx.from?.hash || ''))}
              </span>
              <Badge variant="outline" class="text-[10px] h-4 px-1.5">
                {tx.method || 'Transfer'}
              </Badge>
            </div>
          </div>
          <div class="text-right shrink-0">
            <p class="text-sm font-medium">{weiToNative(String(tx.value))} {config.nativeCurrency}</p>
            <p class="text-xs text-muted-foreground">{timeAgo(tx.timestamp)}</p>
          </div>
        </div>
      {/each}
    </div>
    <LoadMoreButton
      {visible}
      total={transactions.length}
      step={PAGE_SIZE}
      label="transactions"
      onclick={() => (visible += PAGE_SIZE)}
      class="mt-3"
    />
  </CardContent>
</Card>
