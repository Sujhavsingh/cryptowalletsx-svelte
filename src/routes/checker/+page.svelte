<script lang="ts">
  import { Shield, ArrowLeftRight, Globe, Search, ArrowRight, Sparkles, Layers, Radio, FlaskConical, ChevronRight } from 'lucide-svelte';
  import HomeHeader from '$lib/components/home/HomeHeader.svelte';
  import Footer from '$lib/components/home/Footer.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import SEO from '$lib/components/SEO.svelte';

  type ToolStatus = 'LIVE' | 'COMING SOON';
  type ChainCategory = 'Mainnet' | 'Testnet' | 'Dapp';
  type FilterTab = 'All' | 'Chains' | 'Dapps' | 'Testnets';

  interface CheckerTool {
    name: string;
    path: string;
    status: ToolStatus;
    icon: typeof Shield;
    gradient: string;
    glowColor: string;
    description: string;
    category: ChainCategory;
    keywords: string[];
  }

  const checkerTools: CheckerTool[] = [
    {
      name: 'Arc Testnet Stats',
      path: '/arc',
      status: 'LIVE',
      icon: Shield,
      gradient: 'from-cyan-500 to-teal-600',
      glowColor: 'cyan',
      description: 'Comprehensive Arc testnet wallet analytics with real-time USDC-native data and scoring',
      category: 'Testnet',
      keywords: ['arc', 'testnet', 'wallet', 'stats', 'analytics', 'score', 'usdc', 'circle'],
    },
    {
      name: 'SimpleChain Stats',
      path: '/simplechain',
      status: 'LIVE',
      icon: Shield,
      gradient: 'from-cyan-500 to-teal-600',
      glowColor: 'cyan',
      description: 'SimpleChain testnet wallet analytics with SRW token tracking and interaction data',
      category: 'Testnet',
      keywords: ['simplechain', 'srw', 'testnet', 'wallet', 'stats', 'analytics'],
    },
    {
      name: 'Base Stats',
      path: '/base',
      status: 'LIVE',
      icon: Shield,
      gradient: 'from-blue-500 to-indigo-600',
      glowColor: 'blue',
      description: 'Base mainnet wallet analytics — Ethereum L2 built by Coinbase with deep DeFi insights',
      category: 'Mainnet',
      keywords: ['base', 'mainnet', 'wallet', 'stats', 'analytics', 'score', 'eth', 'coinbase'],
    },
    {
      name: 'Ink Stats',
      path: '/ink',
      status: 'LIVE',
      icon: Shield,
      gradient: 'from-purple-500 to-violet-600',
      glowColor: 'purple',
      description: 'Ink mainnet wallet analytics — Ethereum L2 by Kraken with comprehensive on-chain scoring',
      category: 'Mainnet',
      keywords: ['ink', 'kraken', 'mainnet', 'wallet', 'stats', 'analytics', 'score', 'eth'],
    },
    {
      name: 'Relay Bridge Analytics',
      path: '/relay',
      status: 'LIVE',
      icon: ArrowLeftRight,
      gradient: 'from-orange-500 to-amber-600',
      glowColor: 'orange',
      description: 'Cross-chain bridge and swap analytics across 82+ networks with Relay integration',
      category: 'Dapp',
      keywords: ['relay', 'bridge', 'cross-chain', 'swap', 'wallet', 'stats', 'analytics', 'dapp'],
    },
    {
      name: 'LitVM Stats',
      path: '/litvm',
      status: 'LIVE',
      icon: Shield,
      gradient: 'from-pink-500 to-rose-600',
      glowColor: 'pink',
      description: 'LitVM Arbitrum Nitro L2 wallet analytics with zkLTC token tracking on Sepolia',
      category: 'Testnet',
      keywords: ['litvm', 'zkltc', 'arbitrum', 'testnet', 'wallet', 'stats', 'analytics', 'score'],
    },
    {
      name: 'Seismic Stats',
      path: '/seismic',
      status: 'LIVE',
      icon: Shield,
      gradient: 'from-emerald-500 to-green-600',
      glowColor: 'emerald',
      description: 'Seismic encrypted computation testnet wallet analytics with unique privacy features',
      category: 'Testnet',
      keywords: ['seismic', 'testnet', 'encrypted', 'wallet', 'stats', 'analytics', 'score', 'eth'],
    },
    {
      name: 'GenLayer Stats',
      path: '/genlayer',
      status: 'LIVE',
      icon: Shield,
      gradient: 'from-yellow-500 to-orange-600',
      glowColor: 'yellow',
      description: 'GenLayer AI consensus testnet wallet analytics with intelligent contract interactions',
      category: 'Testnet',
      keywords: ['genlayer', 'bradbury', 'ai', 'consensus', 'wallet', 'stats', 'analytics', 'score'],
    },
    {
      name: 'Jumper Analytics',
      path: '/jumper',
      status: 'LIVE',
      icon: Globe,
      gradient: 'from-indigo-500 to-purple-600',
      glowColor: 'indigo',
      description: 'Cross-chain bridge aggregator analytics powered by Jumper (Li.Fi)',
      category: 'Dapp',
      keywords: ['jumper', 'bridge', 'aggregator', 'cross-chain', 'defi', 'li.fi'],
    },
    {
      name: 'Robinhood Testnet',
      path: '/robinhood',
      status: 'LIVE',
      icon: Shield,
      gradient: 'from-green-500 to-emerald-600',
      glowColor: 'green',
      description: 'Robinhood Chain testnet wallet analytics — Arbitrum Orbit L2 by Robinhood',
      category: 'Testnet',
      keywords: ['robinhood', 'testnet', 'trading', 'wallet', 'stats', 'arbitrum'],
    },
    {
      name: 'DAC Quantum Chain',
      path: '/dachain',
      status: 'LIVE',
      icon: Shield,
      gradient: 'from-red-500 to-rose-600',
      glowColor: 'red',
      description: 'DAC Quantum Chain testnet wallet analytics — Post-quantum cryptographic resilience blockchain',
      category: 'Testnet',
      keywords: ['dachain', 'dac', 'quantum', 'testnet', 'wallet', 'stats', 'quantum-resistant'],
    },
    {
      name: 'Doma Testnet',
      path: '/doma',
      status: 'LIVE',
      icon: Shield,
      gradient: 'from-amber-500 to-yellow-600',
      glowColor: 'amber',
      description: 'Doma testnet wallet analytics — L2 blockchain with cross-chain bridge capabilities',
      category: 'Testnet',
      keywords: ['doma', 'testnet', 'l2', 'bridge', 'wallet', 'stats', 'eth'],
    },
    {
      name: 'LayerZero Stats',
      path: '/layerzero-stats',
      status: 'LIVE',
      icon: ArrowLeftRight,
      gradient: 'from-sky-500 to-blue-600',
      glowColor: 'sky',
      description: 'Track LayerZero cross-chain activity for the second airdrop eligibility since May 1, 2024',
      category: 'Dapp',
      keywords: ['layerzero', 'lz', 'bridge', 'cross-chain', 'airdrop', 'stats', 'zro', 'relayer'],
    },
    {
      name: 'Binance WOTD Solver',
      path: '/binance-wotd-solver',
      status: 'LIVE',
      icon: Search,
      gradient: 'from-emerald-500 to-green-600',
      glowColor: 'emerald',
      description: 'Instantly solve the Binance Word of the Day puzzle with optimal word suggestions',
      category: 'Dapp',
      keywords: ['binance', 'wotd', 'word', 'solver', 'puzzle', 'wordle', 'answer', 'daily'],
    },
    {
      name: 'Soneium Stats',
      path: '/soneium',
      status: 'LIVE',
      icon: Shield,
      gradient: 'from-purple-500 to-indigo-600',
      glowColor: 'purple',
      description: 'Soneium mainnet wallet analytics — Sony blockchain with comprehensive on-chain insights',
      category: 'Mainnet',
      keywords: ['soneium', 'sony', 'mainnet', 'wallet', 'stats', 'analytics', 'score', 'eth'],
    },
    {
      name: 'Soneium Badge Checker',
      path: '/soneium-badge-checker',
      status: 'LIVE',
      icon: Shield,
      gradient: 'from-violet-500 to-purple-600',
      glowColor: 'violet',
      description: 'Check Soneium OG badges and 30 ecosystem badges ownership in your wallet',
      category: 'Dapp',
      keywords: ['soneium', 'badge', 'og', 'ecosystem', 'nft', 'checker', 'soulbound'],
    },
    {
      name: 'Aligned Airdrop Checker',
      path: '/aligned-airdrop',
      status: 'LIVE',
      icon: Shield,
      gradient: 'from-emerald-500 to-cyan-600',
      glowColor: 'emerald',
      description: 'Multi-wallet ALIGN airdrop eligibility checker — check up to 200 wallets at once for the AlignedLayer airdrop, no wallet connection required',
      category: 'Dapp',
      keywords: ['aligned', 'alignedlayer', 'align', 'airdrop', 'multi wallet', 'eligibility', 'aligned layer', 'token', 'claim'],
    },
  ];

  let searchQuery = $state('');
  let activeFilter = $state<FilterTab>('All');
  let isLoaded = $state(false);

  const filters: { label: FilterTab; icon: typeof Layers; count: number }[] = [
    { label: 'All', icon: Layers, count: checkerTools.length },
    { label: 'Chains', icon: Sparkles, count: checkerTools.filter(t => t.category === 'Mainnet').length },
    { label: 'Dapps', icon: Radio, count: checkerTools.filter(t => t.category === 'Dapp').length },
    { label: 'Testnets', icon: FlaskConical, count: checkerTools.filter(t => t.category === 'Testnet').length },
  ];

  let filteredTools = $derived.by(() => {
    let result = checkerTools;

    // Apply category filter
    if (activeFilter === 'Chains') {
      result = result.filter(t => t.category === 'Mainnet');
    } else if (activeFilter === 'Dapps') {
      result = result.filter(t => t.category === 'Dapp');
    } else if (activeFilter === 'Testnets') {
      result = result.filter(t => t.category === 'Testnet');
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.keywords.some(k => k.includes(q))
      );
    }

    // Sort: LIVE first, then COMING SOON
    result = [...result].sort((a, b) => {
      if (a.status === 'LIVE' && b.status === 'COMING SOON') return -1;
      if (a.status === 'COMING SOON' && b.status === 'LIVE') return 1;
      return 0;
    });

    return result;
  });

  let liveCount = $derived(checkerTools.filter(t => t.status === 'LIVE').length);
  let comingSoonCount = $derived(checkerTools.filter(t => t.status === 'COMING SOON').length);

  const statusStyles: Record<ToolStatus, string> = {
    LIVE: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    'COMING SOON': 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  };

  const categoryStyles: Record<ChainCategory, string> = {
    Mainnet: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Testnet: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    Dapp: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  const categoryIcons: Record<ChainCategory, typeof Sparkles> = {
    Mainnet: Sparkles,
    Testnet: FlaskConical,
    Dapp: Radio,
  };

  const glowStyles: Record<string, string> = {
    cyan: 'hover:shadow-cyan-500/20 dark:hover:shadow-cyan-500/10',
    blue: 'hover:shadow-blue-500/20 dark:hover:shadow-blue-500/10',
    purple: 'hover:shadow-purple-500/20 dark:hover:shadow-purple-500/10',
    orange: 'hover:shadow-orange-500/20 dark:hover:shadow-orange-500/10',
    pink: 'hover:shadow-pink-500/20 dark:hover:shadow-pink-500/10',
    emerald: 'hover:shadow-emerald-500/20 dark:hover:shadow-emerald-500/10',
    yellow: 'hover:shadow-yellow-500/20 dark:hover:shadow-yellow-500/10',
    indigo: 'hover:shadow-indigo-500/20 dark:hover:shadow-indigo-500/10',
    green: 'hover:shadow-green-500/20 dark:hover:shadow-green-500/10',
    red: 'hover:shadow-red-500/20 dark:hover:shadow-red-500/10',
    amber: 'hover:shadow-amber-500/20 dark:hover:shadow-amber-500/10',
    sky: 'hover:shadow-sky-500/20 dark:hover:shadow-sky-500/10',
    violet: 'hover:shadow-violet-500/20 dark:hover:shadow-violet-500/10',
  };

  const iconBgStyles: Record<string, string> = {
    cyan: 'shadow-cyan-500/25',
    blue: 'shadow-blue-500/25',
    purple: 'shadow-purple-500/25',
    orange: 'shadow-orange-500/25',
    pink: 'shadow-pink-500/25',
    emerald: 'shadow-emerald-500/25',
    yellow: 'shadow-yellow-500/25',
    indigo: 'shadow-indigo-500/25',
    green: 'shadow-green-500/25',
    red: 'shadow-red-500/25',
    amber: 'shadow-amber-500/25',
    sky: 'shadow-sky-500/25',
    violet: 'shadow-violet-500/25',
  };

  $effect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => {
      isLoaded = true;
    }, 100);
    return () => clearTimeout(timer);
  });
</script>

<SEO
  title="All Wallet Checkers - CryptoWalletsx"
  description="Browse all crypto wallet checker tools. Analyze wallet activity, scores, and DeFi interactions across multiple blockchains and bridge protocols."
  keywords={["wallet checker", "crypto tools", "blockchain analytics"]}
  canonicalUrl="https://cryptowalletsx.com/checker"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'CryptoWalletsX Checker Hub',
        url: 'https://cryptowalletsx.com/checker',
        description: 'Browse all crypto wallet checker tools. Analyze wallet activity, scores, and DeFi interactions across multiple blockchains.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
          { '@type': 'ListItem', position: 2, name: 'Checkers', item: 'https://cryptowalletsx.com/checker' }
        ]
      }
    ]
  }}
/>

<div class="min-h-screen flex flex-col bg-background">
  <HomeHeader />

  <main class="flex-1">
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <!-- Animated gradient background -->
      <div class="absolute inset-0 mesh-gradient animated-gradient-bg"></div>
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-r from-cyan-500/8 via-purple-500/5 to-teal-500/8 rounded-full blur-3xl"></div>

      <!-- Floating geometric shapes -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-16 left-[8%] w-14 h-14 border border-cyan-500/15 rounded-lg float-animation rotate-45"></div>
        <div class="absolute top-32 right-[12%] w-10 h-10 border border-purple-500/15 rounded-full float-slow-animation"></div>
        <div class="absolute bottom-20 left-[25%] w-6 h-6 bg-cyan-500/8 rounded-md float-animation" style="animation-delay: 2s"></div>
        <div class="absolute top-48 left-[55%] w-8 h-8 border border-emerald-500/10 rounded-full float-slow-animation" style="animation-delay: 1s"></div>
        <div class="absolute bottom-32 right-[20%] w-5 h-5 bg-purple-500/8 rounded-sm rotate-45 float-animation" style="animation-delay: 3s"></div>
        <div class="absolute top-24 left-[38%] w-3 h-3 bg-orange-500/10 rounded-full float-slow-animation" style="animation-delay: 4s"></div>
      </div>

      <div class="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 text-center">
        <!-- Animated entrance -->
        <div
          class="transition-all duration-700 ease-out"
          class:opacity-0={!isLoaded}
          class:translate-y-6={!isLoaded}
          class:opacity-100={isLoaded}
          class:translate-y-0={isLoaded}
        >
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <Shield class="w-4 h-4 text-cyan-500" />
            <span class="text-sm font-medium gradient-text">Wallet Checker Hub</span>
          </div>

          <!-- Main heading -->
          <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            <span class="gradient-text">Wallet Checkers</span>
          </h1>
          <h2 class="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-8">
            Choose a network to analyze your wallet. Real-time stats, scores, and deep on-chain insights across multiple chains.
          </h2>

          <!-- Stats pills -->
          <div class="flex flex-wrap justify-center gap-3 mb-10">
            <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 border border-border/50 backdrop-blur-sm">
              <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span class="text-sm font-medium">{liveCount} Live</span>
            </div>
            <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 border border-border/50 backdrop-blur-sm">
              <div class="w-2 h-2 rounded-full bg-amber-500"></div>
              <span class="text-sm font-medium">{comingSoonCount} Coming Soon</span>
            </div>
            <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 border border-border/50 backdrop-blur-sm">
              <Sparkles class="w-3.5 h-3.5 text-purple-500" />
              <span class="text-sm font-medium">{checkerTools.length} Total Tools</span>
            </div>
          </div>
        </div>

        <!-- Search & Filter Section -->
        <div
          class="transition-all duration-700 ease-out delay-200"
          class:opacity-0={!isLoaded}
          class:translate-y-6={!isLoaded}
          class:opacity-100={isLoaded}
          class:translate-y-0={isLoaded}
        >
          <!-- Search bar -->
          <div class="max-w-xl mx-auto mb-6">
            <div class="relative">
              <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                value={searchQuery}
                oninput={(e) => { searchQuery = (e.target as HTMLInputElement).value; }}
                placeholder="Search checkers... (e.g., Arc, Base, DeFi)"
                aria-label="Search checkers"
                class="pl-11 pr-4 h-12 bg-card/80 border-border/50 backdrop-blur-xl rounded-2xl text-sm focus-visible:ring-cyan-500/50"
              />
            </div>
          </div>

          <!-- Filter tabs -->
          <div class="flex flex-wrap justify-center gap-2">
            {#each filters as filter}
              {@const FilterIcon = filter.icon}
              <button
                onclick={() => activeFilter = filter.label}
                class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 {
                  activeFilter === filter.label
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-lg shadow-cyan-500/25 scale-105'
                    : 'bg-card/60 border border-border/40 text-muted-foreground hover:text-foreground hover:bg-card/80 backdrop-blur-sm'
                }"
              >
                <FilterIcon class="w-3.5 h-3.5" />
                {filter.label}
                <span class="text-xs {activeFilter === filter.label ? 'text-white/70' : 'text-muted-foreground'}">
                  ({filter.count})
                </span>
              </button>
            {/each}
          </div>
        </div>
      </div>
    </section>

    <!-- Tool Cards Grid -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
      {#if filteredTools.length === 0}
        <!-- Empty state -->
        <div class="text-center py-20">
          <div class="w-16 h-16 rounded-2xl bg-card/60 border border-border/40 flex items-center justify-center mx-auto mb-4">
            <Search class="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 class="text-lg font-semibold mb-2">No checkers found</h3>
          <p class="text-muted-foreground text-sm mb-4">Try adjusting your search or filter criteria</p>
          <Button variant="outline" onclick={() => { searchQuery = ''; activeFilter = 'All'; }}>
            Clear filters
          </Button>
        </div>
      {:else}
        <!-- Category section label -->
        {#if activeFilter !== 'All'}
          <div class="flex items-center gap-3 mb-6">
            <div class="h-px flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent"></div>
            <span class="text-sm font-medium text-muted-foreground">
              {activeFilter === 'Chains' ? 'Mainnet Chains' : activeFilter === 'Dapps' ? 'Decentralized Apps' : 'Testnet Networks'}
            </span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
              {filteredTools.length}
            </span>
            <div class="h-px flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent"></div>
          </div>
        {/if}

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {#each filteredTools as tool, idx}
            {@const IconComponent = tool.icon}
            {@const CategoryIcon = categoryIcons[tool.category]}
            <a
              href={tool.path}
              class="block group"
              class:pointer-events-none={tool.status === 'COMING SOON'}
            >
              <div
                class="transition-all duration-500 ease-out checker-card-enter"
                style="transition-delay: {idx * 60}ms"
              >
                <div
                  class="relative rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl overflow-hidden transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl {glowStyles[tool.glowColor]} checker-glow-border"
                >
                  <!-- Top gradient accent line -->
                  <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r {tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <!-- Subtle background gradient on hover -->
                  <div class="absolute inset-0 bg-gradient-to-br {tool.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300"></div>

                  <div class="relative p-5 sm:p-6">
                    <!-- Top row: Icon + Status -->
                    <div class="flex items-start justify-between mb-4">
                      <div class="relative">
                        <div class="w-12 h-12 rounded-xl bg-gradient-to-br {tool.gradient} flex items-center justify-center shadow-lg {iconBgStyles[tool.glowColor]} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                          <IconComponent class="w-6 h-6 text-white" />
                        </div>
                        <!-- Pulse ring for LIVE tools -->
                        {#if tool.status === 'LIVE'}
                          <div class="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background"></div>
                        {/if}
                      </div>
                      <Badge class="text-[10px] font-bold border {statusStyles[tool.status]}">
                        {tool.status === 'LIVE' ? '● LIVE' : 'COMING SOON'}
                      </Badge>
                    </div>

                    <!-- Tool name -->
                    <h3 class="text-lg font-bold mb-1.5 transition-colors duration-200 group-hover:text-foreground">
                      {tool.name}
                    </h3>

                    <!-- Description -->
                    <p class="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">
                      {tool.description}
                    </p>

                    <!-- Bottom row: Category badge + CTA -->
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-1.5">
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border {categoryStyles[tool.category]}">
                          <CategoryIcon class="w-2.5 h-2.5" />
                          {tool.category}
                        </span>
                      </div>
                      <div class="flex items-center gap-1 text-sm font-medium transition-all duration-200 {
                        tool.status === 'LIVE'
                          ? 'gradient-text opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-0'
                          : 'text-muted-foreground/50'
                      }">
                        {#if tool.status === 'LIVE'}
                          Open
                          <ArrowRight class="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                        {:else}
                          Soon
                          <ChevronRight class="w-3.5 h-3.5" />
                        {/if}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          {/each}
        </div>

        <!-- Bottom section: Coming Soon highlight (only when showing All) -->
        {#if activeFilter === 'All' && !searchQuery.trim()}
          <div class="mt-12">
            <div class="relative rounded-2xl overflow-hidden border border-border/40 bg-card/40 backdrop-blur-xl">
              <!-- Background decoration -->
              <div class="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-cyan-500/5"></div>
              <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>

              <div class="relative px-6 py-8 sm:px-10 sm:py-10 text-center">
                <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
                  <Sparkles class="w-3.5 h-3.5 text-purple-500" />
                  <span class="text-xs font-semibold text-purple-500">More Coming Soon</span>
                </div>
                <h3 class="text-xl sm:text-2xl font-bold mb-2">New Checkers on the Way</h3>
                <p class="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
                  We're building Jumper Analytics and Robinhood Testnet checkers. Stay tuned for more powerful wallet analysis tools.
                </p>
                <div class="flex flex-wrap justify-center gap-3 mt-5">
                  {#each checkerTools.filter(t => t.status === 'COMING SOON') as soonTool}
                    {@const SoonIcon = soonTool.icon}
                    <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-card/60 border border-border/30">
                      <div class="w-7 h-7 rounded-lg bg-gradient-to-br {soonTool.gradient} flex items-center justify-center opacity-60">
                        <SoonIcon class="w-3.5 h-3.5 text-white" />
                      </div>
                      <span class="text-sm font-medium">{soonTool.name}</span>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          </div>
        {/if}
      {/if}
    </section>
  </main>

  <Footer />
</div>

<style>
  /* Checker card entrance animation */
  .checker-card-enter {
    opacity: 0;
    transform: translateY(20px);
  }

  :global(.checker-card-enter) {
    animation: checker-fade-in 0.5s ease-out forwards;
  }

  @keyframes checker-fade-in {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Checker glow border - custom per-card glow */
  .checker-glow-border {
    position: relative;
  }

  .checker-glow-border::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, #06b6d4, #0d9488);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .checker-glow-border:hover::before {
    opacity: 1;
  }

  /* Line clamp utility */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    overflow: hidden;
  }
</style>
