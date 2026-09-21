<script lang="ts">
  import { Coins, Palette, TrendingUp, PieChart, Wallet } from 'lucide-svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import CardContent from '$lib/components/ui/CardContent.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { weiToNative, truncateAddress } from '$lib/utils/format';
  import LoadMoreButton from '../LoadMoreButton.svelte';
  import type { TokenBalance, NFTItem, AllToken, AddressDetails, ChainConfig } from '$lib/types';

  interface Props {
    tokenBalances: TokenBalance[];
    nfts: NFTItem[];
    allTokens: AllToken[];
    addressDetails: AddressDetails | null;
    config: ChainConfig;
  }

  let { tokenBalances, nfts, allTokens, addressDetails, config }: Props = $props();

  let subTab = $state<'overview' | 'tokens' | 'nfts'>('overview');

  /** A wallet can hold a lot of assets, so each list is revealed a page at a time. */
  const PAGE_SIZE = 15;
  let visibleTokens = $state(PAGE_SIZE);
  let visibleNfts = $state(PAGE_SIZE);

  let erc20Tokens = $derived(allTokens.filter(t => t.token.type === 'ERC-20'));
  let nftItems = $derived(allTokens.filter(t => t.token.type === 'ERC-721' || t.token.type === 'ERC-1155'));
  let balance = $derived(addressDetails?.coin_balance ? weiToNative(addressDetails.coin_balance) : '0');

  const COLORS = ['#34d399', '#2dd4bf', '#22d3ee', '#38bdf8', '#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb7185'];
</script>

<div class="space-y-6">
  <!-- Portfolio Overview -->
  <Card class="glass-card bg-card/60 border-border/40">
    <CardContent class="p-6">
      <div class="flex items-start justify-between mb-6">
        <div>
          <h3 class="text-sm text-muted-foreground flex items-center gap-2">
            <Wallet class="w-4 h-4" />
            Portfolio Overview
          </h3>
          <p class="text-3xl font-bold mt-2 gradient-text">{balance} {config.nativeCurrency}</p>
          <p class="text-sm text-muted-foreground mt-1">
            {erc20Tokens.length} Tokens • {nfts.length} NFTs
          </p>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <!-- Simple pie chart visualization using CSS -->
        <div class="h-[200px] flex items-center justify-center">
          <div class="relative w-40 h-40">
            <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
              {#if erc20Tokens.length > 0}
                {#each erc20Tokens.slice(0, 8) as token, i}
                  {@const pct = 100 / Math.min(erc20Tokens.length, 8)}
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke={COLORS[i % COLORS.length]}
                    stroke-width="20"
                    stroke-dasharray={`${pct} ${100 - pct}`}
                    stroke-dashoffset={-i * pct}
                    opacity="0.7"
                  />
                {/each}
              {:else}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#34d399" stroke-width="20" opacity="0.7" />
              {/if}
            </svg>
          </div>
        </div>
        <div class="space-y-2">
          <h4 class="text-xs font-semibold text-muted-foreground">Top Holdings</h4>
          {#each erc20Tokens.slice(0, 5) as token, i}
            <div class="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
              <div class="w-6 h-6 rounded-full flex items-center justify-center" style="background-color: {COLORS[i % COLORS.length]}20">
                <Coins class="w-3 h-3" style="color: {COLORS[i % COLORS.length]}" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium">{token.token.symbol || 'Unknown'}</p>
                <p class="text-xs text-muted-foreground">{token.token.name}</p>
              </div>
              <span class="text-sm font-semibold">{weiToNative(token.value, parseInt(token.token.decimals || '18'))}</span>
            </div>
          {/each}
          {#if erc20Tokens.length === 0}
            <div class="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
              <div class="w-6 h-6 rounded-full flex items-center justify-center bg-emerald-500/20">
                <Coins class="w-3 h-3 text-emerald-500" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium">{config.nativeCurrency}</p>
                <p class="text-xs text-muted-foreground">Native Currency</p>
              </div>
              <span class="text-sm font-semibold">{balance}</span>
            </div>
          {/if}
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Sub-tabs -->
  <div class="flex gap-1">
    <Button variant={subTab === 'overview' ? 'secondary' : 'ghost'} size="sm" class="text-xs {subTab === 'overview' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : ''}" onclick={() => subTab = 'overview'}>Overview</Button>
    <Button variant={subTab === 'tokens' ? 'secondary' : 'ghost'} size="sm" class="text-xs {subTab === 'tokens' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : ''}" onclick={() => subTab = 'tokens'}>Tokens</Button>
    <Button variant={subTab === 'nfts' ? 'secondary' : 'ghost'} size="sm" class="text-xs {subTab === 'nfts' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : ''}" onclick={() => subTab = 'nfts'}>NFTs</Button>
  </div>

  <!-- Tokens List -->
  {#if subTab === 'tokens'}
    <Card class="glass-card bg-card/60 border-border/40">
      <CardContent class="p-4">
        <div class="space-y-2">
          {#each erc20Tokens.slice(0, visibleTokens) as token}
            <div class="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <div class="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Coins class="w-4 h-4 text-emerald-500" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium">{token.token.name || 'Unknown'}</p>
                <p class="text-xs text-muted-foreground">{token.token.symbol} • {token.token.holders_count || 0} holders</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold">{weiToNative(token.value, parseInt(token.token.decimals || '18'))}</p>
                <p class="text-xs text-muted-foreground">{token.token.symbol}</p>
              </div>
            </div>
          {/each}
          {#if erc20Tokens.length === 0}
            <div class="text-center py-8 text-muted-foreground">
              <Coins class="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p class="text-sm">No ERC-20 tokens found</p>
            </div>
          {/if}
        </div>
        <LoadMoreButton
          visible={visibleTokens}
          total={erc20Tokens.length}
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
                <Palette class="w-8 h-8 text-muted-foreground/30" />
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

  <!-- Overview sub-tab -->
  {#if subTab === 'overview'}
    <Card class="glass-card bg-card/60 border-border/40">
      <CardContent class="p-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-4 rounded-lg bg-secondary/30">
            <Coins class="w-5 h-5 mx-auto mb-2 text-emerald-500" />
            <p class="text-lg font-bold">{erc20Tokens.length}</p>
            <p class="text-xs text-muted-foreground">Tokens</p>
          </div>
          <div class="text-center p-4 rounded-lg bg-secondary/30">
            <Palette class="w-5 h-5 mx-auto mb-2 text-pink-500" />
            <p class="text-lg font-bold">{nfts.length}</p>
            <p class="text-xs text-muted-foreground">NFTs</p>
          </div>
          <div class="text-center p-4 rounded-lg bg-secondary/30">
            <TrendingUp class="w-5 h-5 mx-auto mb-2 text-teal-500" />
            <p class="text-lg font-bold">{balance.slice(0, 8)}</p>
            <p class="text-xs text-muted-foreground">{config.nativeCurrency} Balance</p>
          </div>
          <div class="text-center p-4 rounded-lg bg-secondary/30">
            <PieChart class="w-5 h-5 mx-auto mb-2 text-purple-500" />
            <p class="text-lg font-bold">{allTokens.length}</p>
            <p class="text-xs text-muted-foreground">Total Assets</p>
          </div>
        </div>
      </CardContent>
    </Card>
  {/if}
</div>
