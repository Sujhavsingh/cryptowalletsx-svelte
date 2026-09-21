<script lang="ts">
  import { Search, Shield, Zap, Globe, ArrowRight, Copy, Check, Moon, Sun, Activity, Wallet, Coins, BarChart3, ArrowLeft, Home, Info, FileText, Mail, X, ArrowLeftRight, RefreshCw, AlertCircle } from 'lucide-svelte';
  import ToolSEOContent from '$lib/components/shared/ToolSEOContent.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { themeStore } from '$lib/stores/theme.svelte';
  import { isValidEvmAddress, truncateAddress } from '$lib/utils/format';
  import type { ChainConfig } from '$lib/types';

  interface Props {
    config: ChainConfig;
    onAddressSubmit: (address: string) => void;
    /** Address currently loading — this screen stays up until the wallet data lands. */
    analyzing?: string;
    /** Load failure for the analyzed address, surfaced in place of the wallet screen. */
    error?: string | null;
    onRetry?: () => void;
  }

  let { config, onAddressSubmit, analyzing = '', error: loadError = null, onRetry }: Props = $props();

  let inputAddress = $state('');
  let error = $state('');
  let copied = $state('');
  let mobileMenuOpen = $state(false);

  function handleScan() {
    const addr = inputAddress.trim();
    if (!addr) {
      error = 'Please enter a wallet address';
      return;
    }
    if (!isValidEvmAddress(addr)) {
      error = 'Invalid EVM address format. Must start with 0x and be 42 characters.';
      return;
    }
    error = '';
    onAddressSubmit(addr);
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    copied = text;
    setTimeout(() => copied = '', 2000);
  }
</script>

<div class="min-h-screen flex flex-col">
  <!-- Header -->
  <header class="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3 min-w-0">
        <a href="/">
          <Button variant="ghost" size="icon" class="shrink-0">
            <ArrowLeft class="w-4 h-4" />
          </Button>
        </a>
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shrink-0">
          <Zap class="w-4 h-4 text-white" />
        </div>
        <span class="font-bold text-lg gradient-text truncate">{config.name} Stats</span>
        <Badge variant="secondary" class="hidden sm:flex gap-1 text-xs shrink-0">
          <div class="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
          {config.isTestnet ? 'Testnet' : 'Mainnet'}
        </Badge>
      </div>
      <div class="flex items-center gap-1">
        <!-- Desktop nav links -->
        <div class="hidden md:flex items-center gap-1">
          <a href="/" class="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-secondary/60 transition-colors">Home</a>
          <a href="/checker" class="text-xs text-cyan-500 font-medium px-2 py-1 rounded-lg bg-cyan-500/10">Checkers</a>
        </div>
        <Button variant="ghost" size="icon" onclick={() => themeStore.toggle()} class="rounded-full h-9 w-9" aria-label="Toggle theme">
          {#if themeStore.isDark}
            <Sun class="w-4 h-4" />
          {:else}
            <Moon class="w-4 h-4" />
          {/if}
        </Button>
        <!-- Mobile 3-dot menu -->
        <Button variant="ghost" size="icon" onclick={() => mobileMenuOpen = !mobileMenuOpen} class="rounded-full h-9 w-9 md:hidden" aria-label="Open menu">
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
    <!-- Mobile dropdown -->
    {#if mobileMenuOpen}
      <div class="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
        <nav class="max-w-7xl mx-auto px-4 py-3 space-y-1">
          <a href="/" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
            <Home class="w-4 h-4" /> Home
          </a>
          <a href="/checker" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-cyan-500 bg-cyan-500/10">
            <Shield class="w-4 h-4" /> All Checkers
          </a>
          <a href="/about" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
            <Info class="w-4 h-4" /> About
          </a>
        </nav>
      </div>
    {/if}
  </header>

  <!-- Hero Section -->
  <main class="flex-1">
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 mesh-gradient"></div>
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-r from-cyan-500/8 to-teal-500/8 rounded-full blur-3xl"></div>

      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 text-center">
        <Badge class="mb-6 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/15">
          <Shield class="w-3 h-3 mr-1" />
          Chain ID: {config.chainId}
        </Badge>

        <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
          <span class="gradient-text">{config.name}</span>
          <br />
          <span class="text-foreground">Stats Checker</span>
        </h1>

        <p class="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-10">
          Comprehensive blockchain wallet analytics for the {config.name} network.
          Track transactions, tokens, NFTs, and more.
        </p>

        <!-- Search Input -->
        <div class="max-w-xl mx-auto">
          <div class="flex flex-col sm:flex-row gap-2 p-2 bg-card border border-border/50 rounded-2xl shadow-lg shadow-cyan-500/5 backdrop-blur-xl">
            <Input
              value={inputAddress}
              oninput={(e) => { inputAddress = (e.target as HTMLInputElement).value; error = ''; }}
              onkeydown={(e) => { if (e.key === 'Enter') handleScan(); }}
              placeholder="Enter Address (0x...)"
              aria-label="Enter wallet address"
              class="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm sm:text-base"
            />
            <Button
              onclick={handleScan}
              class="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white px-6 rounded-xl shadow-md shadow-cyan-500/25"
            >
              <Search class="w-4 h-4 sm:mr-2" />
              <span class="hidden sm:inline">Scan</span>
            </Button>
          </div>
          {#if error}
            <p class="text-destructive text-sm mt-2">{error}</p>
          {/if}

          <!-- Progress / failure of the address being analyzed -->
          {#if analyzing}
            <p class="flex items-center justify-center gap-2 text-xs sm:text-sm text-cyan-600 dark:text-cyan-400 mt-3">
              <RefreshCw class="w-3.5 h-3.5 animate-spin shrink-0" />
              Analyzing {truncateAddress(analyzing, 6)} on {config.name}…
            </p>
          {:else if loadError}
            <div class="mt-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-center">
              <p class="flex items-center justify-center gap-2 text-xs sm:text-sm text-destructive">
                <AlertCircle class="w-3.5 h-3.5 shrink-0" />
                {loadError}
              </p>
              {#if onRetry}
                <Button
                  variant="ghost"
                  size="sm"
                  onclick={onRetry}
                  class="mt-2 h-7 text-xs gap-1.5 text-destructive hover:text-destructive"
                >
                  <RefreshCw class="w-3 h-3" />
                  Try Again
                </Button>
              {/if}
            </div>
          {/if}
        </div>

        {#if config.sampleAddresses && config.sampleAddresses.length > 0}
          <!-- Sample Addresses -->
          <div class="mt-6 flex flex-wrap justify-center gap-2">
            <span class="text-xs text-muted-foreground mr-1 self-center">Try:</span>
            {#each config.sampleAddresses as addr}
              <button
                class="text-xs px-3 py-1.5 rounded-full bg-secondary/80 hover:bg-secondary text-secondary-foreground transition-colors font-mono"
                onclick={() => { inputAddress = addr; onAddressSubmit(addr); }}
              >
                {addr.slice(0, 8)}...{addr.slice(-4)}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </section>

    <!-- Quick Stats -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        {#each [
          { icon: Globe, label: 'Network', value: config.name, color: 'text-cyan-500' },
          { icon: Coins, label: 'Native Currency', value: config.nativeCurrency, color: 'text-teal-500' },
          { icon: Wallet, label: 'Chain ID', value: config.chainId, color: 'text-cyan-500' },
          { icon: BarChart3, label: 'Wallet Type', value: config.walletType, color: 'text-amber-500' },
        ] as stat}
          <Card class="glass-card bg-card/60 border-border/40 card-hover-lift">
            <div class="p-4 sm:p-6 text-center">
              <stat.icon class="w-6 h-6 mx-auto mb-2 {stat.color}" />
              <p class="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p class="font-bold text-sm sm:text-base">{stat.value}</p>
            </div>
          </Card>
        {/each}
      </div>
    </section>

    <!-- Network Information -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
        <Activity class="w-5 h-5 text-cyan-500" />
        Network Information
      </h2>

      <div class="grid md:grid-cols-2 gap-6">
        <!-- RPC Endpoints -->
        <Card class="glass-card bg-card/60 border-border/40">
          <div class="p-6">
            <h3 class="font-semibold mb-4 flex items-center gap-2">
              <Globe class="w-4 h-4 text-cyan-500" />
              RPC Endpoints
            </h3>
            <div class="space-y-3">
              {#each config.rpcEndpoints as rpc}
                <div class="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 group">
                  <code class="text-xs flex-1 font-mono break-all text-muted-foreground group-hover:text-foreground transition-colors">{rpc}</code>
                  <Button variant="ghost" size="icon" class="h-7 w-7 shrink-0" onclick={() => handleCopy(rpc)}>
                    {#if copied === rpc}
                      <Check class="w-3 h-3 text-cyan-500" />
                    {:else}
                      <Copy class="w-3 h-3" />
                    {/if}
                  </Button>
                </div>
              {/each}
            </div>
          </div>
        </Card>

        <!-- Quick Links -->
        <Card class="glass-card bg-card/60 border-border/40">
          <div class="p-6">
            <h3 class="font-semibold mb-4 flex items-center gap-2">
              <ArrowRight class="w-4 h-4 text-cyan-500" />
              Quick Links
            </h3>
            <div class="space-y-3">
              <a
                href={config.blockExplorer}
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
              >
                <div class="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <BarChart3 class="w-4 h-4 text-cyan-500" />
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium">Block Explorer</p>
                  <p class="text-xs text-muted-foreground">{config.blockExplorer}</p>
                </div>
                <ArrowRight class="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </a>
              {#if config.faucet}
                <a
                  href={config.faucet}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                >
                  <div class="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                    <Coins class="w-4 h-4 text-teal-500" />
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium">Faucet</p>
                    <p class="text-xs text-muted-foreground">{config.faucet}</p>
                  </div>
                  <ArrowRight class="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </a>
              {/if}
            </div>
          </div>
        </Card>
      </div>
    </section>

    <!-- SEO Content -->
    <ToolSEOContent {config} emitFaqSchema={false} />
  </main>

  <!-- Footer -->
  <footer class="border-t border-border/40 bg-card/30 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
          <Zap class="w-3 h-3 text-white" />
        </div>
        <span class="text-sm font-medium gradient-text">{config.name} Stats Checker</span>
      </div>
      <p class="text-xs text-muted-foreground">
        Built for {config.name} • Chain ID: {config.chainId}
      </p>
    </div>
  </footer>
</div>
