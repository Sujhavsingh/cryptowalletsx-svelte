<script lang="ts">
  import { Globe, Search, AlertTriangle } from 'lucide-svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import CardContent from '$lib/components/ui/CardContent.svelte';
  import CardHeader from '$lib/components/ui/CardHeader.svelte';
  import CardTitle from '$lib/components/ui/CardTitle.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import LoadMoreButton from '../LoadMoreButton.svelte';
  import { truncateAddress, timeAgo } from '$lib/utils/format';
  import type { Transaction, ChainConfig } from '$lib/types';

  interface Props { transactions: Transaction[]; address: string; config: ChainConfig; }
  let { transactions, address, config }: Props = $props();

  let search = $state('');

  /** A wallet that touched many contracts gets a table that keeps growing, one page at a time. */
  const PAGE_SIZE = 10;
  let visible = $state(PAGE_SIZE);

  let protocols = $derived.by(() => {
    const addr = address.toLowerCase();
    const contractMap = new Map<string, { hash: string; interactions: number; lastActivity: string; name: string }>();
    transactions.forEach(tx => {
      const fromContract = tx.from?.is_contract ? tx.from.hash.toLowerCase() : null;
      const toContract = tx.to?.is_contract ? tx.to.hash.toLowerCase() : null;
      [fromContract, toContract].forEach(contract => {
        if (contract && contract !== addr) {
          const existing = contractMap.get(contract);
          if (existing) {
            existing.interactions++;
            if (tx.timestamp > existing.lastActivity) existing.lastActivity = tx.timestamp;
          } else {
            contractMap.set(contract, { hash: contract, interactions: 1, lastActivity: tx.timestamp, name: truncateAddress(contract, 6) });
          }
        }
      });
    });
    return Array.from(contractMap.values()).sort((a, b) => b.interactions - a.interactions);
  });

  let filteredProtocols = $derived(protocols.filter(p => search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || p.hash.includes(search.toLowerCase())));
</script>

<Card class="glass-card bg-card/60 border-border/40">
  <CardHeader class="pb-3">
    <CardTitle class="text-base flex items-center gap-2">
      <Globe class="w-4 h-4 text-orange-500" />
      Protocols
    </CardTitle>
    <p class="text-xs text-muted-foreground">Dapp interactions and protocol usage</p>
  </CardHeader>
  <CardContent>
    <div class="flex items-center gap-2 mb-4 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
      <AlertTriangle class="w-4 h-4 text-amber-500 shrink-0" />
      <p class="text-xs text-amber-600 dark:text-amber-400">Protocol data may be limited on testnet. Interactions are based on contract addresses found in transactions.</p>
    </div>

    <div class="flex items-center gap-2 mb-4">
      <div class="relative flex-1">
        <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input value={search} oninput={(e) => search = (e.target as HTMLInputElement).value} placeholder="Search Dapp..." class="h-8 pl-8 text-xs" />
      </div>
    </div>

    <div class="rounded-lg border border-border/50 overflow-hidden">
      <div class="grid grid-cols-[1fr_100px_120px] gap-2 p-2 bg-secondary/50 text-xs font-medium text-muted-foreground">
        <span>NAME</span>
        <span class="text-center">INTERACTIONS</span>
        <span class="text-right">LAST ACTIVITY</span>
      </div>
      <div class="max-h-64 overflow-y-auto custom-scrollbar">
        {#if filteredProtocols.length > 0}
          {#each filteredProtocols.slice(0, visible) as protocol}
            <div class="grid grid-cols-[1fr_100px_120px] gap-2 p-2 border-t border-border/30 hover:bg-secondary/30 transition-colors items-center">
              <div class="flex items-center gap-2 min-w-0">
                <div class="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Globe class="w-3 h-3 text-emerald-500" />
                </div>
                <a href="{config.blockExplorerAddressUrl}{protocol.hash}" target="_blank" rel="noopener noreferrer" class="text-xs font-mono hover:text-emerald-500 transition-colors truncate">
                  {protocol.name}
                </a>
              </div>
              <span class="text-xs text-center">{protocol.interactions}</span>
              <span class="text-xs text-right text-muted-foreground">{timeAgo(protocol.lastActivity)}</span>
            </div>
          {/each}
        {:else}
          <div class="p-6 text-center text-muted-foreground">
            <Globe class="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p class="text-xs">No protocols found</p>
          </div>
        {/if}
      </div>
    </div>

    <LoadMoreButton
      {visible}
      total={filteredProtocols.length}
      step={PAGE_SIZE}
      label="protocols"
      onclick={() => (visible += PAGE_SIZE)}
      class="mt-3"
    />
  </CardContent>
</Card>
