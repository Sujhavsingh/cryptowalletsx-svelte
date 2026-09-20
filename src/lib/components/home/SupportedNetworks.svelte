<script lang="ts">
  import { ArrowRight, Flame, Sparkles, Shield, Radio } from 'lucide-svelte';
  import { CHAIN_CONFIGS } from '$lib/utils/constants';

  const networks = Object.values(CHAIN_CONFIGS);

  // Categorize
  const mainnets = networks.filter(n => !n.isTestnet);
  const testnets = networks.filter(n => n.isTestnet);

  // Color map for chain badges
  const chainColors: Record<string, string> = {
    arc: 'from-cyan-500 to-teal-600',
    'arc-testnet': 'from-cyan-500 to-teal-600',
    simplechain: 'from-emerald-500 to-green-600',
    base: 'from-blue-500 to-indigo-600',
    ink: 'from-purple-500 to-violet-600',
    relay: 'from-orange-500 to-amber-600',
    litvm: 'from-pink-500 to-rose-600',
    seismic: 'from-emerald-500 to-cyan-600',
    genlayer: 'from-yellow-500 to-orange-600',
    jumper: 'from-indigo-500 to-purple-600',
    dachain: 'from-red-500 to-rose-600',
    doma: 'from-amber-500 to-yellow-600',
    robinhood: 'from-green-500 to-emerald-600',
    'robinhood-testnet': 'from-green-500 to-emerald-600',
    soneium: 'from-violet-500 to-purple-600',
  };
</script>

<section class="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 overflow-hidden">
  <!-- Animated bg blobs -->
  <div class="absolute inset-0 pointer-events-none">
    <div class="absolute top-0 right-0 w-96 h-96 bg-purple-500/4 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/4 rounded-full blur-3xl"></div>
  </div>

  <div class="relative">
    <!-- Section Header -->
    <div class="text-center mb-14">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
        <Radio class="w-3.5 h-3.5 text-indigo-500" />
        <span class="text-xs font-semibold text-indigo-500">Multi-Chain</span>
      </div>
      <h2 class="text-2xl sm:text-3xl lg:text-5xl font-extrabold mb-4">
        <span class="text-foreground">Supported </span>
        <span class="gradient-text">Networks</span>
      </h2>
      <p class="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
        {networks.length} blockchains and growing — from testnets to mainnets, we've got you covered.
      </p>
    </div>

    <!-- Mainnets -->
    <div class="mb-10">
      <div class="flex items-center gap-2 mb-5">
        <Flame class="w-5 h-5 text-orange-500" />
        <h3 class="text-lg font-bold">Mainnets</h3>
        <span class="text-xs font-medium text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-full">{mainnets.length} Live</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {#each mainnets as chain}
          <a href="/{chain.id}" class="group">
            <div class="glass-card bg-card/60 border border-border/40 rounded-xl p-4 card-hover-lift flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br {chainColors[chain.id] || 'from-cyan-500 to-teal-600'} flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                <Shield class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-bold truncate group-hover:text-cyan-500 transition-colors">{chain.name}</p>
                <p class="text-[10px] text-muted-foreground font-mono">{chain.nativeCurrency}</p>
              </div>
            </div>
          </a>
        {/each}
      </div>
    </div>

    <!-- Testnets -->
    <div>
      <div class="flex items-center gap-2 mb-5">
        <Sparkles class="w-5 h-5 text-cyan-500" />
        <h3 class="text-lg font-bold">Testnets</h3>
        <span class="text-xs font-medium text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-full">{testnets.length} Active</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {#each testnets as chain}
          <a href="/{chain.id}" class="group">
            <div class="glass-card bg-card/40 border border-border/30 rounded-xl p-4 card-hover-lift flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br {chainColors[chain.id] || 'from-cyan-500 to-teal-600'} flex items-center justify-center shrink-0 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                <Shield class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-bold truncate group-hover:text-cyan-500 transition-colors">{chain.name}</p>
                <p class="text-[10px] text-muted-foreground font-mono">{chain.nativeCurrency}</p>
              </div>
            </div>
          </a>
        {/each}
      </div>
    </div>
  </div>
</section>
