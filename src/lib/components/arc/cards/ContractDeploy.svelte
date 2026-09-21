<script lang="ts">
  import { Code2, Database } from 'lucide-svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import CardContent from '$lib/components/ui/CardContent.svelte';
  import CardHeader from '$lib/components/ui/CardHeader.svelte';
  import CardTitle from '$lib/components/ui/CardTitle.svelte';
  import LoadMoreButton from '../LoadMoreButton.svelte';
  import { truncateAddress } from '$lib/utils/format';
  import type { Transaction, ChainConfig } from '$lib/types';

  interface Props { transactions: Transaction[]; address: string; config: ChainConfig; }
  let { transactions, address, config }: Props = $props();

  /** Deployments are rare but a factory wallet can still have plenty of them. */
  const PAGE_SIZE = 15;
  let visible = $state(PAGE_SIZE);
  let addr = $derived(address.toLowerCase());
  let deployments = $derived(transactions.filter(tx => tx.to === null && tx.from?.hash?.toLowerCase() === addr));
</script>

<Card class="glass-card bg-card/60 border-border/40">
  <CardHeader class="pb-3">
    <CardTitle class="text-base flex items-center gap-2">
      <Code2 class="w-4 h-4 text-emerald-500" />
      Contract Deploy
      <span class="text-sm font-normal text-muted-foreground">{deployments.length} deployed contracts</span>
    </CardTitle>
  </CardHeader>
  <CardContent>
    {#if deployments.length > 0}
      <div class="space-y-2">
        {#each deployments.slice(0, visible) as tx}
          <div class="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Code2 class="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div>
                <a href="{config.blockExplorerTxUrl}{tx.hash}" target="_blank" rel="noopener noreferrer" class="text-sm font-mono hover:text-emerald-500 transition-colors">
                  {truncateAddress(tx.hash, 8)}
                </a>
                <p class="text-xs text-muted-foreground">{new Date(tx.timestamp).toLocaleDateString()} • Gas: {tx.gas_used || 'N/A'}</p>
              </div>
            </div>
          </div>
        {/each}
      </div>
      <LoadMoreButton
        {visible}
        total={deployments.length}
        step={PAGE_SIZE}
        label="deployments"
        onclick={() => (visible += PAGE_SIZE)}
        class="mt-3"
      />
    {:else}
      <div class="text-center py-8 text-muted-foreground">
        <Database class="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p class="text-sm font-medium">No Contract Deployments</p>
        <p class="text-xs mt-1">This address has not deployed any smart contracts yet.</p>
      </div>
    {/if}
  </CardContent>
</Card>
