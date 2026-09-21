<script lang="ts">
  import { Shield, AlertTriangle, ExternalLink, Lock } from 'lucide-svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import CardContent from '$lib/components/ui/CardContent.svelte';
  import CardHeader from '$lib/components/ui/CardHeader.svelte';
  import CardTitle from '$lib/components/ui/CardTitle.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { truncateAddress, timeAgo } from '$lib/utils/format';
  import LoadMoreButton from '../LoadMoreButton.svelte';
  import type { Transaction, TokenTransfer, ChainConfig } from '$lib/types';

  interface Props {
    transactions: Transaction[];
    tokenTransfers: TokenTransfer[];
    config: ChainConfig;
  }

  let { transactions, tokenTransfers, config }: Props = $props();

  /** An approval history can run long, so it is revealed a page at a time. */
  const PAGE_SIZE = 15;
  let visible = $state(PAGE_SIZE);

  let approveTxs = $derived(transactions.filter(
    tx => tx.method?.toLowerCase() === 'approve' || tx.method?.toLowerCase() === 'approveall' || tx.method?.toLowerCase() === 'setapprovalforall'
  ));
</script>

<div class="space-y-6">
  <!-- Security Info -->
  <Card class="glass-card bg-card/60 border-border/40">
    <CardContent class="p-6">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
          <Shield class="w-6 h-6 text-emerald-500" />
        </div>
        <div>
          <h3 class="text-lg font-semibold">Token Approval Security</h3>
          <p class="text-sm text-muted-foreground mt-1">
            Review and manage your token approvals. Connect your wallet to revoke any unwanted approvals.
          </p>
          <div class="flex items-center gap-2 mt-4">
            <Button class="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
              <Lock class="w-4 h-4" />
              Connect Wallet to Revoke
            </Button>
            <a href={config.blockExplorer} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" class="gap-2">
                <ExternalLink class="w-3.5 h-3.5" />
                View on Explorer
              </Button>
            </a>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Approvals List -->
  <Card class="glass-card bg-card/60 border-border/40">
    <CardHeader class="pb-3">
      <CardTitle class="text-base flex items-center gap-2">
        <Shield class="w-4 h-4 text-amber-500" />
        Token Approvals
        <Badge variant="secondary" class="text-xs">{approveTxs.length}</Badge>
      </CardTitle>
    </CardHeader>
    <CardContent>
      {#if approveTxs.length > 0}
        <div class="space-y-2">
          {#each approveTxs.slice(0, visible) as tx}
            <div class="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <Badge variant="outline" class="text-[10px] h-5 bg-amber-500/10 text-amber-500 border-amber-500/30">
                    {tx.method}
                  </Badge>
                  <a href="{config.blockExplorerTxUrl}{tx.hash}" target="_blank" rel="noopener noreferrer" class="text-xs font-mono hover:text-emerald-500 transition-colors">
                    {truncateAddress(tx.hash, 8)}
                  </a>
                </div>
                <span class="text-xs text-muted-foreground">{timeAgo(tx.timestamp)}</span>
              </div>
              <p class="text-xs text-muted-foreground">
                From: {truncateAddress(tx.from?.hash || '')} → To: {truncateAddress(tx.to?.hash || 'Contract Creation')}
              </p>
            </div>
          {/each}
        </div>
        <LoadMoreButton
          {visible}
          total={approveTxs.length}
          step={PAGE_SIZE}
          label="approvals"
          onclick={() => (visible += PAGE_SIZE)}
          class="mt-3"
        />
      {:else}
        <div class="text-center py-12 text-muted-foreground">
          <Shield class="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p class="text-sm font-medium">No Token Approvals Found</p>
          <p class="text-xs mt-1">This wallet has no token approval transactions on {config.name}.</p>
        </div>
      {/if}
    </CardContent>
  </Card>
</div>
