<script lang="ts">
  import { ArrowLeft, RefreshCw, Copy, Check, ExternalLink, Moon, Sun, Zap, Shield, Home, Info, FileText, Mail, X, ArrowLeftRight, BookOpen, AlertCircle } from 'lucide-svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { themeStore } from '$lib/stores/theme.svelte';
  import { truncateAddress, weiToNative } from '$lib/utils/format';
  import { calculateWalletStats, withBadgeScore } from '$lib/utils/score';
  import { computeAchievements, getNativeTokenPrice } from '$lib/utils/badges';
  import type { AddressDetails, Transaction, TokenTransfer, TokenBalance, NFTItem, AllToken, WalletTab, ChainConfig } from '$lib/types';

  import WalletLoading from '$lib/components/ui/WalletLoading.svelte';
  import WalletSkeleton from './WalletSkeleton.svelte';
  import WalletStatsTab from './tabs/WalletStatsTab.svelte';
  import PortfolioTab from './tabs/PortfolioTab.svelte';
  import ApprovalsTab from './tabs/ApprovalsTab.svelte';
  import SimulationsTab from './tabs/SimulationsTab.svelte';
  import TokensNftsTab from './tabs/TokensNftsTab.svelte';
  import NetworkInfoTab from './tabs/NetworkInfoTab.svelte';

  interface Props {
    address: string;
    activeTab: WalletTab;
    config: ChainConfig;
    onTabChange: (tab: WalletTab) => void;
    onReset: () => void;
    // Data props (managed by route page)
    addressDetails: AddressDetails | null;
    transactions: Transaction[];
    tokenTransfers: TokenTransfer[];
    tokenBalances: TokenBalance[];
    nfts: NFTItem[];
    allTokens: AllToken[];
    // Loading state props (managed by route page)
    isLoading: boolean;
    /** False until the first batch has painted; the skeleton stands in until then. */
    hasData?: boolean;
    /** True while background pagination is still streaming history into the screen. */
    isStreaming?: boolean;
    fetchError: string | null;
    onRetry: () => void;
    isRefreshing: boolean;
    onRefresh: () => void;
  }

  let {
    address,
    activeTab,
    config,
    onTabChange,
    onReset,
    addressDetails,
    transactions,
    tokenTransfers,
    tokenBalances,
    nfts,
    allTokens,
    isLoading,
    hasData = true,
    isStreaming = false,
    fetchError,
    onRetry,
    isRefreshing,
    onRefresh,
  }: Props = $props();

  let copied = $state(false);
  let mobileMenuOpen = $state(false);

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

  // Derived wallet stats from props (pure computation, no async). The badge engine
  // scores the stats, so the badge-aware score is applied in a second pass.
  let baseStats = $derived(
    addressDetails && transactions.length >= 0
      ? calculateWalletStats(addressDetails, transactions, tokenTransfers, tokenBalances, nfts, allTokens, config.nativeCurrency, config.nativeDecimals, exchangeRate())
      : null
  );
  let walletStats = $derived(
    baseStats ? withBadgeScore(baseStats, computeAchievements(baseStats, config, nativePrice)) : null
  );

  const tabLabels: { value: WalletTab; label: string }[] = [
    { value: 'stats', label: 'Wallet Stats' },
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'approvals', label: 'Approvals' },
    { value: 'simulations', label: 'Simulations' },
    { value: 'tokens-nfts', label: 'Tokens & NFTs' },
    { value: 'network-info', label: 'Network Info' },
  ];

  function handleCopy() {
    if (address) {
      navigator.clipboard.writeText(address);
      copied = true;
      setTimeout(() => copied = false, 2000);
    }
  }

  function handleShareTwitter() {
    if (!walletStats) return;
    const rankEmojis: Record<string, string> = { NEWBIE: '🌱', BRONZE: '🥉', SILVER: '🥈', GOLD: '🥇', PLATINUM: '💎', DIAMOND: '💠' };
    const medal = rankEmojis[walletStats.rank] || '🥉';
    const tweet = `🚀 My ${config.name} Stats on CryptoWalletsX\n\n${medal} Score: ${walletStats.score}/100 | Rank: ${walletStats.rank}\n🔄 Transactions: ${walletStats.totalTransactions}\n💸 Balance: ${walletStats.balanceUSD}\n🏗️ Contracts: ${walletStats.uniqueContracts}\n🔗 DeFi: ${walletStats.stakingActivities + walletStats.swapActivities + walletStats.liquidityActivities + walletStats.bridgeActivities} activities\n\nCheck yours → ${window.location.origin}/${config.id}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
    window.open(url, '_blank');
  }
</script>

<div class="min-h-screen flex flex-col">
  <!-- Header -->
  <header class="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <a href="/">
            <Button variant="ghost" size="icon" class="shrink-0" title="Back to Home">
              <Home class="w-4 h-4" />
            </Button>
          </a>
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shrink-0">
            <Zap class="w-4 h-4 text-white" />
          </div>
          <Badge variant="secondary" class="gap-1 text-xs shrink-0">
            <div class="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
            {config.name}
          </Badge>
        </div>
        <div class="flex items-center gap-1">
          <div class="hidden md:flex items-center gap-1">
            <a href="/" class="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-secondary/60 transition-colors">Home</a>
            <a href="/blog" class="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-secondary/60 transition-colors">Blog</a>
            <a href="/checker" class="text-xs text-cyan-500 font-medium px-2 py-1 rounded-lg bg-cyan-500/10">Checkers</a>
          </div>
          <Button variant="ghost" size="icon" onclick={() => themeStore.toggle()} class="rounded-full h-9 w-9" aria-label="Toggle theme">
            {#if themeStore.isDark}
              <Sun class="w-4 h-4" />
            {:else}
              <Moon class="w-4 h-4" />
            {/if}
          </Button>
          <Button variant="ghost" size="icon" onclick={() => mobileMenuOpen = !mobileMenuOpen} class="rounded-full h-9 w-9 md:hidden">
            {#if mobileMenuOpen}
              <X class="w-5 h-5" />
            {:else}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" class="text-foreground">
                <circle cx="10" cy="4" r="1.8" />
                <circle cx="10" cy="10" r="1.8" />
                <circle cx="10" cy="16" r="1.8" />
              </svg>
            {/if}
          </Button>
        </div>
      </div>

      <!-- Wallet Address Bar -->
      <div class="pb-2 flex flex-wrap items-center gap-1.5 sm:gap-2 wallet-bar">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/80">
          <Shield class="w-3.5 h-3.5 text-cyan-500 shrink-0" />
          <span class="text-xs sm:text-sm font-mono">{truncateAddress(address, 6)}</span>
          <button class="p-0.5 hover:bg-secondary rounded" onclick={handleCopy}>
            {#if copied}
              <Check class="w-3 h-3 text-cyan-500" />
            {:else}
              <Copy class="w-3 h-3" />
            {/if}
          </button>
        </div>
        <div class="flex items-center gap-0.5 sm:gap-1">
          <a href="{config.blockExplorerAddressUrl}{address}" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" class="h-7 text-xs gap-1">
              <ExternalLink class="w-3 h-3" />
              <span class="hidden sm:inline">Explorer</span>
            </Button>
          </a>
          <Button variant="ghost" size="sm" class="h-7 text-xs gap-1" onclick={onRefresh} disabled={isRefreshing || isStreaming}>
            <RefreshCw class="w-3 h-3 {isRefreshing || isStreaming ? 'animate-spin' : ''}" />
            <span class="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="ghost" size="sm" class="h-7 text-xs gap-1 hover:text-cyan-500" onclick={handleShareTwitter} disabled={!walletStats}>
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            <span class="hidden sm:inline">Share</span>
          </Button>
        </div>
      </div>
    </div>
    <!-- Mobile dropdown -->
    {#if mobileMenuOpen}
      <div class="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
        <nav class="max-w-7xl mx-auto px-4 py-3 space-y-1">
          <a href="/" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
            <Home class="w-4 h-4" /> Home
          </a>
          <a href="/blog" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
            <BookOpen class="w-4 h-4" /> Blog
          </a>
          <a href="/checker" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-cyan-500 bg-cyan-500/10">
            <Shield class="w-4 h-4" /> All Checkers
          </a>
          <a href="/about" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
            <Info class="w-4 h-4" /> About
          </a>
          <a href="/contact" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
            <Mail class="w-4 h-4" /> Contact
          </a>
        </nav>
      </div>
    {/if}
  </header>

  <!-- Tab Navigation -->
  <div class="sticky top-[60px] sm:top-[64px] z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
    <div class="max-w-7xl mx-auto px-2 sm:px-6">
      <div class="w-full flex h-auto p-1 bg-transparent gap-0.5 overflow-x-auto tab-scroll-container" style="-webkit-overflow-scrolling: touch; scrollbar-width: none;">
        {#each tabLabels as tab}
          <button
            class="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap rounded-lg transition-all shrink-0 {activeTab === tab.value ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-semibold' : 'text-muted-foreground hover:text-foreground'}"
            onclick={() => onTabChange(tab.value)}
          >
            {tab.label}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Content -->
  <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
    {#if isLoading && !hasData}
      <WalletSkeleton {address} chainName={config.name} />
    {:else if isLoading}
      <WalletLoading chainName={config.name} chainColor={config.id === 'base' ? 'blue' : config.id === 'ink' ? 'purple' : config.id === 'litvm' ? 'pink' : config.id === 'seismic' ? 'emerald' : config.id === 'genlayer' ? 'yellow' : config.id === 'simplechain' ? 'cyan' : 'cyan'} message="Analyzing wallet on {config.name}" />
    {:else if fetchError}
      <div class="max-w-xl mx-auto py-12 sm:py-16 px-1">
        <div class="glass-card bg-card/60 border border-border/40 rounded-2xl p-6 sm:p-8 text-center">
          <div class="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-5">
            <AlertCircle class="w-7 h-7 text-destructive" />
          </div>
          <h2 class="text-lg font-bold mb-2">Failed to Load Data</h2>
          <p class="text-sm text-muted-foreground mb-6">{fetchError}</p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/70 text-xs font-mono order-2 sm:order-1">
              <Shield class="w-3 h-3 text-cyan-500 shrink-0" />
              {truncateAddress(address, 6)}
            </span>
            <Button
              onclick={onRetry}
              class="order-1 sm:order-2 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white gap-2"
            >
              <RefreshCw class="w-4 h-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    {:else if !hasData}
      <WalletSkeleton {address} chainName={config.name} />
    {:else}
      <!-- Non-blocking progress for the history still streaming in from stage 2 -->
      {#if isStreaming}
        <div class="mb-4 flex items-center gap-2.5 px-3 py-2 rounded-xl border border-border/40 bg-card/40">
          <span class="relative flex w-2 h-2 shrink-0">
            <span class="absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-60 animate-ping"></span>
            <span class="relative inline-flex w-2 h-2 rounded-full bg-cyan-500"></span>
          </span>
          <span class="text-xs text-muted-foreground">Still loading more history…</span>
          <div class="ml-auto h-0.5 w-20 sm:w-32 rounded-full bg-secondary/70 overflow-hidden shrink-0">
            <div class="h-full w-1/3 rounded-full bg-cyan-500 animate-[skeleton-progress_1.6s_ease-in-out_infinite]"></div>
          </div>
        </div>
      {/if}

      {#if activeTab === 'stats'}
        <WalletStatsTab {addressDetails} {transactions} {tokenTransfers} {tokenBalances} {nfts} {allTokens} {config} />
      {:else if activeTab === 'portfolio'}
        <PortfolioTab {tokenBalances} {nfts} {allTokens} {addressDetails} {config} />
      {:else if activeTab === 'approvals'}
        <ApprovalsTab {transactions} {tokenTransfers} {config} />
      {:else if activeTab === 'simulations'}
        <SimulationsTab {transactions} {tokenTransfers} {addressDetails} />
      {:else if activeTab === 'tokens-nfts'}
        <TokensNftsTab {tokenBalances} {nfts} {allTokens} />
      {:else if activeTab === 'network-info'}
        <NetworkInfoTab {config} />
      {/if}
    {/if}
  </main>

  <!-- Footer -->
  <footer class="border-t border-border/40 bg-card/30 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 rounded-md bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
          <Zap class="w-2.5 h-2.5 text-white" />
        </div>
        <span class="text-xs gradient-text font-medium">CryptoWalletsX</span>
      </div>
      <p class="text-xs text-muted-foreground">Chain ID: {config.chainId}</p>
    </div>
  </footer>
</div>
