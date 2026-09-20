<script lang="ts">
  import { Shield, Droplets, GitBranch, UserSearch, Coins, Activity, ArrowRight, ExternalLink, Globe, ArrowLeftRight, BookOpen, Award, Sparkles } from 'lucide-svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { tools } from '$lib/utils/constants';

  const iconMap: Record<string, any> = { Shield, Droplets, GitBranch, UserSearch, Coins, Activity, Globe, ArrowLeftRight, BookOpen, Award };

  const statusStyles: Record<string, string> = {
    LIVE: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    'COMING SOON': 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  };

  let showAll = $state(false);
  let liveTools = $derived(tools.filter(t => t.status === 'LIVE'));
  let comingSoonTools = $derived(tools.filter(t => t.status === 'COMING SOON'));
  let displayedLive = $derived(showAll ? liveTools : liveTools.slice(0, 9));
</script>

<section class="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
  <!-- Background decoration -->
  <div class="absolute inset-0 pointer-events-none overflow-hidden">
    <div class="absolute top-0 left-1/4 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl"></div>
  </div>

  <div class="relative">
    <!-- Section Header -->
    <div class="text-center mb-14">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
        <Sparkles class="w-3.5 h-3.5 text-cyan-500" />
        <span class="text-xs font-semibold gradient-text">Live & Ready</span>
      </div>
      <h2 class="text-2xl sm:text-3xl lg:text-5xl font-extrabold mb-4">
        <span class="gradient-text">Powerful Tools</span>
        <span class="text-foreground"> at Your Fingertips</span>
      </h2>
      <p class="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
        Everything you need to analyze, track, and optimize your on-chain activity across multiple chains.
      </p>
    </div>

    <!-- Live Tools Grid -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
      {#each displayedLive as tool, i}
        {@const IconComponent = iconMap[tool.icon]}
        <a href={tool.path} class="block group">
          <div class="relative glass-card bg-card/60 border border-border/40 rounded-2xl p-6 card-hover-lift glow-border h-full overflow-hidden">
            <!-- Subtle gradient overlay on hover -->
            <div class="absolute inset-0 bg-gradient-to-br {tool.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500"></div>

            <div class="relative">
              <div class="flex items-start justify-between mb-5">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br {tool.gradient} flex items-center justify-center shadow-lg shadow-cyan-500/10">
                  {#if IconComponent}
                    <IconComponent class="w-6 h-6 text-white" />
                  {/if}
                </div>
                <Badge class="text-[10px] font-bold border {statusStyles[tool.status]}">
                  {tool.status}
                </Badge>
              </div>
              <h3 class="text-lg font-bold mb-2 group-hover:text-cyan-500 transition-colors duration-300">{tool.name}</h3>
              <p class="text-sm text-muted-foreground mb-5 leading-relaxed">
                {#if tool.name === 'Arc Mainnet Stats'}
                  Arc Mainnet wallet analytics with USDC balance, score and DeFi activity
                {:else if tool.name === 'Arc Testnet Stats'}
                  Arc testnet wallet analytics with free USDC from the Circle faucet
                {:else if tool.name === 'SimpleChain Stats'}
                  SimpleChain testnet wallet analytics with real-time data
                {:else if tool.name === 'Relay Bridge Analytics'}
                  Cross-chain bridge and swap analytics across 82+ networks
                {:else if tool.name === 'LitVM Stats'}
                  LitVM Arbitrum Nitro L2 wallet analytics with zkLTC
                {:else if tool.name === 'Seismic Stats'}
                  Seismic encrypted computation testnet wallet analytics
                {:else if tool.name === 'GenLayer Stats'}
                  GenLayer AI consensus testnet wallet analytics
                {:else if tool.name === 'DAC Quantum Chain Stats'}
                  DAC Quantum Chain quantum-resistant testnet wallet analytics
                {:else if tool.name === 'Doma Testnet Stats'}
                  Doma L2 testnet wallet analytics with cross-chain bridge data
                {:else if tool.name === 'LayerZero Stats'}
                  Track your LayerZero cross-chain activity for second airdrop eligibility
                {:else if tool.name === 'Binance WOTD Solver'}
                  Instantly solve Binance Word of the Day puzzle with optimal suggestions
                {:else if tool.name === 'Soneium Stats'}
                  Soneium mainnet wallet analytics on Sony blockchain with on-chain insights
                {:else if tool.name === 'Soneium Badge Checker'}
                  Check OG and 30 ecosystem badges ownership on Soneium network
                {:else if tool.name === 'Base Stats'}
                  Base mainnet wallet analytics with DeFi and transaction insights
                {:else if tool.name === 'Ink Stats'}
                  Ink L2 by Kraken wallet analytics with cross-chain activity
                {:else if tool.name === 'Jumper Analytics'}
                  Jumper cross-chain bridge and swap aggregator analytics by Li.Fi
                {:else if tool.name === 'Robinhood Chain Stats'}
                  Robinhood Chain mainnet wallet analytics — Arbitrum Orbit L2 for tokenized stocks and RWAs
                {:else if tool.name === 'Robinhood Testnet Stats'}
                  Robinhood Chain testnet wallet analytics — Arbitrum Orbit L2 by Robinhood
                {:else}
                  Multi-chain wallet analytics with real-time data
                {/if}
              </p>
              <div class="flex items-center gap-1.5 text-sm font-medium gradient-text opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                Open Tool
                <ArrowRight class="w-4 h-4" />
              </div>
            </div>
          </div>
        </a>
      {/each}
    </div>

    <!-- Show More / Show Less -->
    {#if liveTools.length > 9}
      <div class="text-center mb-8">
        <button
          onclick={() => showAll = !showAll}
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary/60 hover:bg-cyan-500/10 border border-border/40 hover:border-cyan-500/30 text-sm font-medium transition-all duration-300"
        >
          {showAll ? 'Show Less' : `Show All ${liveTools.length} Tools`}
          <ArrowRight class="w-4 h-4 transition-transform duration-300 {showAll ? 'rotate-[-90deg]' : 'rotate-90'}" />
        </button>
      </div>
    {/if}

    <!-- Coming Soon Tools -->
    {#if comingSoonTools.length > 0}
      <div class="mt-4">
        <h3 class="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          Coming Soon
        </h3>
        <div class="grid sm:grid-cols-3 gap-4">
          {#each comingSoonTools as tool}
            {@const IconComponent = iconMap[tool.icon]}
            <div class="glass-card bg-card/30 border border-border/20 rounded-2xl p-5 opacity-60 hover:opacity-80 transition-opacity">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br {tool.gradient} flex items-center justify-center opacity-60">
                  {#if IconComponent}
                    <IconComponent class="w-5 h-5 text-white" />
                  {/if}
                </div>
                <div>
                  <h3 class="font-semibold text-sm">{tool.name}</h3>
                  <Badge class="text-[9px] font-bold border mt-1 {statusStyles[tool.status]}">
                    COMING SOON
                  </Badge>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</section>
