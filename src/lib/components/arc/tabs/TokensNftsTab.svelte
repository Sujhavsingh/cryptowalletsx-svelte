<script lang="ts">
  import { Coins, Palette, Search } from 'lucide-svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import CardContent from '$lib/components/ui/CardContent.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import { weiToNative, truncateAddress } from '$lib/utils/format';
  import LoadMoreButton from '../LoadMoreButton.svelte';
  import type { TokenBalance, NFTItem, AllToken } from '$lib/types';

  interface Props {
    tokenBalances: TokenBalance[];
    nfts: NFTItem[];
    allTokens: AllToken[];
  }

  let { tokenBalances, nfts, allTokens }: Props = $props();

  let subTab = $state<'tokens' | 'nfts'>('tokens');
  let search = $state('');

  /** Wallets can hold a lot of assets, so each grid is revealed a page at a time. */
  const PAGE_SIZE = 15;
  let visibleTokens = $state(PAGE_SIZE);
  let visibleNfts = $state(PAGE_SIZE);

  let erc20Tokens = $derived(allTokens.filter(t => t.token.type === 'ERC-20'));
  let nftItems = $derived(allTokens.filter(t => t.token.type === 'ERC-721' || t.token.type === 'ERC-1155'));

  let filteredTokens = $derived(
    !search ? erc20Tokens : erc20Tokens.filter(t =>
      (t.token.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.token.symbol || '').toLowerCase().includes(search.toLowerCase())
    )
  );
</script>

<div class="space-y-6">
  <!-- Token Balances Header -->
  <Card class="glass-card bg-card/60 border-border/40">
    <CardContent class="p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Coins class="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 class="text-lg font-semibold">Token Balances</h3>
            <p class="text-sm text-muted-foreground">{erc20Tokens.length} tokens • {nfts.length} NFTs</p>
          </div>
        </div>
      </div>

      <!-- Sub-tabs -->
      <div class="flex gap-1 mb-4">
        <Button
          variant={subTab === 'tokens' ? 'secondary' : 'ghost'}
          size="sm"
          class="text-xs {subTab === 'tokens' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : ''}"
          onclick={() => subTab = 'tokens'}
        >
          <Coins class="w-3.5 h-3.5 mr-1" />
          Tokens ({erc20Tokens.length})
        </Button>
        <Button
          variant={subTab === 'nfts' ? 'secondary' : 'ghost'}
          size="sm"
          class="text-xs {subTab === 'nfts' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : ''}"
          onclick={() => subTab = 'nfts'}
        >
          <Palette class="w-3.5 h-3.5 mr-1" />
          NFTs ({nfts.length})
        </Button>
      </div>

      <!-- Search -->
      {#if subTab === 'tokens'}
        <div class="relative mb-4">
          <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            oninput={(e) => search = (e.target as HTMLInputElement).value}
            placeholder="Search tokens..."
            class="h-8 pl-8 text-xs"
          />
        </div>
      {/if}
    </CardContent>
  </Card>

  <!-- Tokens List -->
  {#if subTab === 'tokens'}
    <Card class="glass-card bg-card/60 border-border/40">
      <CardContent class="p-4">
        <div class="space-y-2">
          {#each filteredTokens.slice(0, visibleTokens) as token}
            <div class="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <div class="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                {#if token.token.icon_url}
                  <img src={token.token.icon_url} alt={token.token.symbol || ''} class="w-5 h-5 rounded-full" />
                {:else}
                  <Coins class="w-4 h-4 text-emerald-500" />
                {/if}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium">{token.token.name || 'Unknown'}</p>
                <p class="text-xs text-muted-foreground">{token.token.symbol} • {token.token.holders_count || 0} holders</p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-sm font-semibold">{weiToNative(token.value, parseInt(token.token.decimals || '18'))}</p>
                <Badge variant="outline" class="text-[10px] h-4">{token.token.type}</Badge>
              </div>
            </div>
          {/each}
          {#if filteredTokens.length === 0}
            <div class="text-center py-8 text-muted-foreground">
              <Coins class="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p class="text-sm">{search ? 'No tokens match your search' : 'No tokens found'}</p>
            </div>
          {/if}
        </div>
        <LoadMoreButton
          visible={visibleTokens}
          total={filteredTokens.length}
          step={PAGE_SIZE}
          label="tokens"
          onclick={() => (visibleTokens += PAGE_SIZE)}
          class="mt-3"
        />
      </CardContent>
    </Card>
  {/if}

  <!-- NFTs List -->
  {#if subTab === 'nfts'}
    <Card class="glass-card bg-card/60 border-border/40">
      <CardContent class="p-4">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {#each nfts.slice(0, visibleNfts) as nft}
            <div class="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <div class="w-full aspect-square rounded-lg bg-muted/50 flex items-center justify-center mb-2">
                {#if nft.image_url}
                  <img src={nft.image_url} alt={nft.token.name || 'NFT'} class="w-full h-full object-cover rounded-lg" />
                {:else}
                  <Palette class="w-8 h-8 text-muted-foreground/30" />
                {/if}
              </div>
              <p class="text-xs font-medium truncate">{nft.token.name || `NFT #${nft.token_id || nft.id}`}</p>
              <p class="text-[10px] text-muted-foreground">{nft.token.symbol || nft.token_type}</p>
              <Badge variant="outline" class="text-[10px] mt-1">{nft.token_type}</Badge>
            </div>
          {/each}
          {#if nfts.length === 0}
            <div class="col-span-full text-center py-8 text-muted-foreground">
              <Palette class="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p class="text-sm">No NFTs found</p>
            </div>
          {/if}
        </div>
        <LoadMoreButton
          visible={visibleNfts}
          total={nfts.length}
          step={PAGE_SIZE}
          label="NFTs"
          onclick={() => (visibleNfts += PAGE_SIZE)}
          class="mt-3"
        />
      </CardContent>
    </Card>
  {/if}
</div>
