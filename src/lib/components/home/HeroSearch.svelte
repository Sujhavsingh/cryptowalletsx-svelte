<script lang="ts">
  import { Search, Shield, Globe, ArrowRight, Zap, Radio, FlaskConical, Sparkles, X, Layers } from 'lucide-svelte';
  import { CHAIN_CONFIGS, tools } from '$lib/utils/constants';
  import { goto } from '$app/navigation';

  // ── Types ──
  type SuggestionType = 'chain' | 'tool' | 'trending';
  type CategoryType = 'Mainnet' | 'Testnet' | 'Dapp' | 'All';

  interface Suggestion {
    id: string;
    name: string;
    description: string;
    path: string;
    type: SuggestionType;
    gradient: string;
    icon: typeof Shield;
    keywords: string[];
    category?: CategoryType;
    status?: string;
  }

  // ── State ──
  let searchQuery = $state('');
  let selectedIndex = $state(-1);
  let isOpen = $state(false);

  // ── Chain data ──
  const chainList = Object.values(CHAIN_CONFIGS);

  // ── Build full suggestions list ──
  const allSuggestions: Suggestion[] = [
    ...chainList.map(chain => ({
      id: `chain-${chain.id}`,
      name: chain.name,
      description: chain.description || `${chain.name} wallet analytics`,
      path: `/${chain.id}`,
      type: 'chain' as SuggestionType,
      gradient: getChainGradient(chain.id),
      icon: (chain.apiType === 'relay-dapp' || chain.apiType === 'jumper-dapp') ? Globe : Shield,
      keywords: [chain.id, chain.name.toLowerCase(), chain.nativeCurrency.toLowerCase(), ...(chain.isTestnet ? ['testnet'] : ['mainnet']), 'checker', 'stats', 'analytics', 'guide'],
      category: (chain.isTestnet ? 'Testnet' : (chain.apiType === 'relay-dapp' || chain.apiType === 'jumper-dapp') ? 'Dapp' : 'Mainnet') as CategoryType,
      status: 'LIVE',
    })),
    {
      id: 'tool-layerzero-stats',
      name: 'LayerZero Stats',
      description: 'Track LayerZero cross-chain activity for second airdrop eligibility',
      path: '/layerzero-stats',
      type: 'tool' as SuggestionType,
      gradient: 'from-sky-500 to-blue-600',
      icon: Globe,
      keywords: ['layerzero', 'lz', 'bridge', 'cross-chain', 'airdrop', 'stats', 'zro', 'relayer'],
      category: 'Dapp' as CategoryType,
      status: 'LIVE',
    },
    {
      id: 'tool-binance-wotd-solver',
      name: 'Binance WOTD Solver',
      description: 'Solve the Binance Word of the Day puzzle instantly',
      path: '/binance-wotd-solver',
      type: 'tool' as SuggestionType,
      gradient: 'from-emerald-500 to-green-600',
      icon: Zap,
      keywords: ['binance', 'wotd', 'word', 'solver', 'puzzle', 'wordle', 'answer', 'daily'],
      category: 'Dapp' as CategoryType,
      status: 'LIVE',
    },
    {
      id: 'tool-soneium',
      name: 'Soneium Stats',
      description: 'Soneium mainnet wallet analytics — Sony blockchain',
      path: '/soneium',
      type: 'tool' as SuggestionType,
      gradient: 'from-purple-500 to-indigo-600',
      icon: Shield,
      keywords: ['soneium', 'sony', 'mainnet', 'wallet', 'stats', 'analytics', 'eth'],
      category: 'Mainnet' as CategoryType,
      status: 'LIVE',
    },
    {
      id: 'tool-soneium-badge-checker',
      name: 'Soneium Badge Checker',
      description: 'Check Soneium OG and ecosystem badges ownership',
      path: '/soneium-badge-checker',
      type: 'tool' as SuggestionType,
      gradient: 'from-violet-500 to-purple-600',
      icon: Sparkles,
      keywords: ['soneium', 'badge', 'og', 'ecosystem', 'nft', 'checker', 'soulbound'],
      category: 'Dapp' as CategoryType,
      status: 'LIVE',
    },
  ];

  // ── Filtered suggestions ──
  let filteredSuggestions = $derived.by(() => {
    if (!searchQuery.trim()) return allSuggestions.filter(s => s.status === 'LIVE');
    const q = searchQuery.toLowerCase().trim();

    let results = allSuggestions.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.keywords.some(k => k.includes(q)) ||
      s.description.toLowerCase().includes(q)
    );

    // Score results
    results = results.map(s => {
      let score = 0;
      if (s.name.toLowerCase().startsWith(q)) score += 10;
      else if (s.name.toLowerCase().includes(q)) score += 5;
      if (s.keywords.some(k => k === q)) score += 8;
      else if (s.keywords.some(k => k.startsWith(q))) score += 4;
      if (s.status === 'LIVE') score += 3;
      return { ...s, _score: score };
    }).sort((a, b) => b._score - a._score);

    // Remove duplicates
    const seen = new Set<string>();
    results = results.filter(r => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });

    return results;
  });

  // Group by category for display
  let mainnetTools = $derived(filteredSuggestions.filter(s => s.category === 'Mainnet'));
  let testnetTools = $derived(filteredSuggestions.filter(s => s.category === 'Testnet'));
  let dappTools = $derived(filteredSuggestions.filter(s => s.category === 'Dapp'));

  // ── Helpers ──
  function getChainGradient(id: string): string {
    const map: Record<string, string> = {
      arc: 'from-cyan-500 to-teal-600',
      'arc-testnet': 'from-cyan-500 to-teal-600',
      simplechain: 'from-cyan-500 to-teal-600',
      base: 'from-blue-500 to-indigo-600',
      ink: 'from-purple-500 to-violet-600',
      relay: 'from-orange-500 to-amber-600',
      litvm: 'from-pink-500 to-rose-600',
      seismic: 'from-emerald-500 to-green-600',
      genlayer: 'from-yellow-500 to-orange-600',
      jumper: 'from-indigo-500 to-purple-600',
      dachain: 'from-red-500 to-rose-600',
      doma: 'from-amber-500 to-yellow-600',
      robinhood: 'from-green-500 to-emerald-600',
      'robinhood-testnet': 'from-green-500 to-emerald-600',
    };
    return map[id] || 'from-cyan-500 to-teal-600';
  }

  // ── Actions ──
  function handleSelect(suggestion: Suggestion) {
    if (suggestion.path === '#') return;
    goto(suggestion.path);
    closeSearch();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      closeSearch();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, filteredSuggestions.length - 1);
      scrollToSelected();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
      scrollToSelected();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
        handleSelect(filteredSuggestions[selectedIndex]);
      }
    }
  }

  function scrollToSelected() {
    if (selectedIndex < 0) return;
    const el = document.getElementById(`search-item-${selectedIndex}`);
    el?.scrollIntoView({ block: 'nearest' });
  }

  function openSearch() {
    isOpen = true;
    searchQuery = '';
    selectedIndex = -1;
    // Focus input after DOM update
    setTimeout(() => {
      document.getElementById('hero-search-input')?.focus();
    }, 50);
  }

  function closeSearch() {
    isOpen = false;
    searchQuery = '';
    selectedIndex = -1;
  }

  // Global keyboard shortcut
  $effect(() => {
    function handleGlobalKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) closeSearch();
        else openSearch();
      }
    }
    window.addEventListener('keydown', handleGlobalKeydown);
    return () => window.removeEventListener('keydown', handleGlobalKeydown);
  });
</script>

<div class="w-full max-w-2xl mx-auto">
  <!-- Search bar trigger -->
  <div class="relative">
    <div
      class="flex items-center bg-card/80 border border-border/50 rounded-2xl shadow-lg shadow-cyan-500/5 backdrop-blur-xl overflow-hidden cursor-pointer transition-all duration-200 hover:border-cyan-500/30 hover:shadow-cyan-500/10"
      onclick={openSearch}
      onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') openSearch(); }}
      role="button"
      tabindex="0"
    >
      <div class="pl-4 shrink-0">
        <Search class="w-5 h-5 text-muted-foreground" />
      </div>
      <div class="flex-1 h-12 sm:h-14 px-3 flex items-center">
        <span class="text-sm sm:text-base text-muted-foreground/60">Search tools & chains...</span>
      </div>
      <div class="pr-3 shrink-0 hidden sm:flex items-center gap-2">
        <kbd class="px-2 py-1 rounded-lg bg-secondary/60 border border-border/30 text-[10px] font-mono text-muted-foreground">Ctrl</kbd>
        <kbd class="px-2 py-1 rounded-lg bg-secondary/60 border border-border/30 text-[10px] font-mono text-muted-foreground">K</kbd>
      </div>
    </div>
  </div>
</div>

<!-- Full-screen Search Overlay -->
{#if isOpen}
  <div class="fixed inset-0 z-[100] flex items-start justify-center pt-[8vh] sm:pt-[12vh]">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-background/80 backdrop-blur-xl" onclick={closeSearch}></div>

    <!-- Search Modal -->
    <div class="relative w-full max-w-2xl mx-4 rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
      <!-- Search Input -->
      <div class="flex items-center gap-3 px-4 sm:px-5 h-14 sm:h-16 border-b border-border/30 shrink-0">
        <Search class="w-5 h-5 text-cyan-500 shrink-0" />
        <input
          id="hero-search-input"
          type="text"
          value={searchQuery}
          oninput={(e) => { searchQuery = (e.target as HTMLInputElement).value; selectedIndex = -1; }}
          onkeydown={handleKeyDown}
          placeholder="Search tools, chains, and dapps..."
          aria-label="Search tools, chains, and dapps"
          class="flex-1 bg-transparent text-sm sm:text-base focus:outline-none placeholder:text-muted-foreground/60"
        />
        <button
          onclick={closeSearch}
          class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Results (scrollable) -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        {#if filteredSuggestions.length === 0}
          <div class="px-5 py-12 text-center">
            <Search class="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p class="text-sm text-muted-foreground">No results found for "{searchQuery}"</p>
            <p class="text-xs text-muted-foreground/60 mt-1">Try a different search term</p>
          </div>
        {:else}
          <!-- Mainnet Chains -->
          {#if mainnetTools.length > 0}
            <div class="px-3 pt-3 pb-1">
              <div class="flex items-center gap-2 px-2 mb-2">
                <Sparkles class="w-3.5 h-3.5 text-blue-500" />
                <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mainnet Chains</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{mainnetTools.length}</span>
              </div>
              {#each mainnetTools as suggestion, idx}
                {@const globalIdx = filteredSuggestions.indexOf(suggestion)}
                <button
                  id="search-item-{globalIdx}"
                  class="w-full text-left px-3 py-2.5 flex items-center gap-3 rounded-xl transition-colors {globalIdx === selectedIndex ? 'bg-cyan-500/10' : 'hover:bg-secondary/30'}"
                  onclick={() => handleSelect(suggestion)}
                  onmouseenter={() => selectedIndex = globalIdx}
                >
                  <div class="w-9 h-9 rounded-lg bg-gradient-to-br {suggestion.gradient} flex items-center justify-center shrink-0 shadow-sm">
                    <suggestion.icon class="w-4 h-4 text-white" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate">{suggestion.name}</p>
                    <p class="text-xs text-muted-foreground truncate">{suggestion.description}</p>
                  </div>
                  <ArrowRight class="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                </button>
              {/each}
            </div>
          {/if}

          <!-- DApps & Tools -->
          {#if dappTools.length > 0}
            <div class="px-3 pt-3 pb-1">
              <div class="flex items-center gap-2 px-2 mb-2">
                <Radio class="w-3.5 h-3.5 text-purple-500" />
                <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">DApps & Tools</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">{dappTools.length}</span>
              </div>
              {#each dappTools as suggestion, idx}
                {@const globalIdx = filteredSuggestions.indexOf(suggestion)}
                <button
                  id="search-item-{globalIdx}"
                  class="w-full text-left px-3 py-2.5 flex items-center gap-3 rounded-xl transition-colors {globalIdx === selectedIndex ? 'bg-cyan-500/10' : 'hover:bg-secondary/30'}"
                  onclick={() => handleSelect(suggestion)}
                  onmouseenter={() => selectedIndex = globalIdx}
                >
                  <div class="w-9 h-9 rounded-lg bg-gradient-to-br {suggestion.gradient} flex items-center justify-center shrink-0 shadow-sm">
                    <suggestion.icon class="w-4 h-4 text-white" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate">{suggestion.name}</p>
                    <p class="text-xs text-muted-foreground truncate">{suggestion.description}</p>
                  </div>
                  <ArrowRight class="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                </button>
              {/each}
            </div>
          {/if}

          <!-- Testnets -->
          {#if testnetTools.length > 0}
            <div class="px-3 pt-3 pb-1">
              <div class="flex items-center gap-2 px-2 mb-2">
                <FlaskConical class="w-3.5 h-3.5 text-cyan-500" />
                <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Testnets</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{testnetTools.length}</span>
              </div>
              {#each testnetTools as suggestion, idx}
                {@const globalIdx = filteredSuggestions.indexOf(suggestion)}
                <button
                  id="search-item-{globalIdx}"
                  class="w-full text-left px-3 py-2.5 flex items-center gap-3 rounded-xl transition-colors {globalIdx === selectedIndex ? 'bg-cyan-500/10' : 'hover:bg-secondary/30'}"
                  onclick={() => handleSelect(suggestion)}
                  onmouseenter={() => selectedIndex = globalIdx}
                >
                  <div class="w-9 h-9 rounded-lg bg-gradient-to-br {suggestion.gradient} flex items-center justify-center shrink-0 shadow-sm">
                    <suggestion.icon class="w-4 h-4 text-white" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate">{suggestion.name}</p>
                    <p class="text-xs text-muted-foreground truncate">{suggestion.description}</p>
                  </div>
                  <ArrowRight class="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                </button>
              {/each}
            </div>
          {/if}
        {/if}
      </div>

      <!-- Footer -->
      <div class="px-4 sm:px-5 py-3 border-t border-border/30 shrink-0 flex items-center justify-between">
        <span class="text-[10px] text-muted-foreground">
          {filteredSuggestions.length} tools available
        </span>
        <div class="flex items-center gap-3">
          <span class="text-[10px] text-muted-foreground flex items-center gap-1">
            <kbd class="px-1 py-0.5 rounded bg-secondary/60 border border-border/30 text-[9px]">&#8593;&#8595;</kbd> Navigate
          </span>
          <span class="text-[10px] text-muted-foreground flex items-center gap-1">
            <kbd class="px-1 py-0.5 rounded bg-secondary/60 border border-border/30 text-[9px]">&#8629;</kbd> Select
          </span>
          <span class="text-[10px] text-muted-foreground flex items-center gap-1">
            <kbd class="px-1 py-0.5 rounded bg-secondary/60 border border-border/30 text-[9px]">Esc</kbd> Close
          </span>
        </div>
      </div>
    </div>
  </div>
{/if}
