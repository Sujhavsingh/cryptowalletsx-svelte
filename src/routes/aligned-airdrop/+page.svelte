<script lang="ts">
  import {
    Wallet, Search, Loader2, CheckCircle2, XCircle, AlertTriangle,
    HelpCircle, Clock, ArrowUpRight, Copy, Coins, TrendingUp, AlertCircle,
    ChevronDown, ChevronRight, Share2, Sparkles, Layers, ShieldCheck,
    ExternalLink, Zap
  } from 'lucide-svelte';
  import HomeHeader from '$lib/components/home/HomeHeader.svelte';
  import Footer from '$lib/components/home/Footer.svelte';
  import SEO from '$lib/components/SEO.svelte';

  // --- Types ---
  type AddressStatus =
    | 'eligible'
    | 'likely-eligible'
    | 'not-eligible'
    | 'ambiguous'
    | 'past-deadline'
    | 'error';

  interface Allocation {
    amount: string;
    amountHuman: string;
    validFrom: number | null;
    merkleProof: string[];
  }

  interface AddressResult {
    address: string;
    status: AddressStatus;
    network: 'ethereum' | 'base' | null;
    walletHttpStatus: number;
    allocation: Allocation[] | null;
    totalAmount: string;
    message: string;
    elapsedMs: number;
  }

  interface ChainState {
    merkleRoot: string;
    deadline: number;
    deadlineIso: string;
    paused: boolean;
    error?: string;
  }

  interface ApiResponse {
    generatedAt: string;
    contract: {
      address: string;
      ethereum: ChainState;
      base: ChainState;
    };
    stats: {
      total: number;
      eligible: number;
      likelyEligible: number;
      notEligible: number;
      ambiguous: number;
      pastDeadline: number;
      errors: number;
      totalAlignEligibleFormatted: string;
    };
    invalidAddresses: string[];
    results: AddressResult[];
  }

  // --- State ---
  let input = $state('');
  let loading = $state(false);
  let data = $state<ApiResponse | null>(null);
  let error = $state<string | null>(null);
  let filter = $state<'all' | AddressStatus>('all');
  let expandedAddress = $state<string | null>(null);
  let copiedAddress = $state<string | null>(null);

  // --- Status config ---
  const STATUS_CONFIG: Record<
    AddressStatus,
    {
      label: string;
      shortLabel: string;
      color: string;
      bg: string;
      border: string;
      icon: typeof CheckCircle2;
    }
  > = {
    'eligible': {
      label: 'Eligible',
      shortLabel: 'Eligible',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      icon: CheckCircle2,
    },
    'likely-eligible': {
      label: 'Likely Eligible',
      shortLabel: 'Likely',
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      icon: TrendingUp,
    },
    'not-eligible': {
      label: 'Not Eligible',
      shortLabel: 'Not Eligible',
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      icon: XCircle,
    },
    'ambiguous': {
      label: 'Ambiguous — Sign ToS',
      shortLabel: 'Ambiguous',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      icon: HelpCircle,
    },
    'past-deadline': {
      label: 'Past Deadline',
      shortLabel: 'Past Deadline',
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      icon: Clock,
    },
    'error': {
      label: 'Error',
      shortLabel: 'Error',
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      icon: AlertCircle,
    },
  };

  // --- Derived ---
  let addressCount = $derived(
    input.split(/[\n,\s]+/).filter(Boolean).length
  );

  let filteredResults = $derived.by(() => {
    if (!data) return [];
    if (filter === 'all') return data.results;
    return data.results.filter((r) => r.status === filter);
  });

  let shareText = $derived.by(() => {
    if (!data) return '';
    const eligible = data.stats.eligible + data.stats.likelyEligible;
    if (eligible === 0) {
      return `🔍 Just checked ${data.stats.total} wallets for the @alignedlayer ALIGN airdrop — none eligible. Check yours at cryptowalletsx.com/aligned-airdrop`;
    }
    return `🟢 ${eligible}/${data.stats.total} of my wallets are eligible for the @alignedlayer ALIGN airdrop!\n\n💰 Total ALIGN: ${data.stats.totalAlignEligibleFormatted}\n\nCheck yours (multi-wallet supported) at cryptowalletsx.com/aligned-airdrop`;
  });

  // --- Functions ---
  async function handleCheck() {
    const addrs = input
      .split(/[\n,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (addrs.length === 0) {
      error = 'Please paste at least one wallet address';
      return;
    }
    if (addrs.length > 200) {
      error = 'Maximum 200 addresses per check';
      return;
    }
    loading = true;
    error = null;
    data = null;
    expandedAddress = null;
    try {
      const resp = await fetch('/aligned-airdrop/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses: addrs }),
      });
      const json = await resp.json();
      if (!resp.ok) {
        throw new Error(json?.error ?? `HTTP ${resp.status}`);
      }
      data = json;
    } catch (err: any) {
      error = err?.message ?? String(err);
    } finally {
      loading = false;
    }
  }

  function shareOnTwitter() {
    const text = encodeURIComponent(shareText);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  }

  function toggleExpand(addr: string) {
    expandedAddress = expandedAddress === addr ? null : addr;
  }

  async function copyToClipboard(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      copiedAddress = text;
      setTimeout(() => {
        copiedAddress = null;
      }, 2000);
    } catch {
      // ignore
    }
  }

  function exportCsv() {
    if (!data) return;
    const rows: string[][] = [
      ['address', 'status', 'network', 'total_ALIGN', 'valid_from', 'merkle_proof', 'http_status', 'elapsed_ms', 'message'],
      ...data.results.map((r) => {
        const alloc = r.allocation?.[0];
        return [
          r.address,
          STATUS_CONFIG[r.status].label,
          r.network ?? '',
          r.totalAmount,
          alloc?.validFrom ? new Date(alloc.validFrom * 1000).toISOString() : '',
          alloc?.merkleProof.join(';') ?? '',
          String(r.walletHttpStatus),
          String(r.elapsedMs),
          r.message,
        ];
      }),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aligned-airdrop-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function timeUntil(ts: number): { days: number; hours: number; expired: boolean } {
    if (!ts) return { days: 0, hours: 0, expired: false };
    const diff = ts * 1000 - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, expired: true };
    return {
      days: Math.floor(diff / 86_400_000),
      hours: Math.floor((diff % 86_400_000) / 3_600_000),
      expired: false,
    };
  }

  function clearAll() {
    input = '';
    data = null;
    error = null;
    expandedAddress = null;
  }

  const filterTabs: { key: 'all' | AddressStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'eligible', label: 'Eligible' },
    { key: 'likely-eligible', label: 'Likely' },
    { key: 'ambiguous', label: 'Ambiguous' },
    { key: 'not-eligible', label: 'Not Eligible' },
  ];
</script>

<SEO
  title="Multi Aligned Airdrop Check — ALIGN Token Eligibility Checker"
  description="Free multi-wallet ALIGN airdrop checker. Check eligibility for the AlignedLayer airdrop across 200+ wallets at once. See your ALIGN token allocation, Merkle proof, and claim deadline — no wallet connection required."
  keywords={[
    'multi aligned airdrop check',
    'aligned airdrop checker',
    'aligned layer airdrop',
    'align token eligibility',
    'alignedlayer airdrop',
    'aligned airdrop eligibility',
    'aligned layer testnet',
    'aligned layer token',
    'align token airdrop',
    'aligned layer claim',
    'aligned airdrop check multiple wallets',
    'aligned airdrop snapshot',
    'aligned layer ethereum airdrop',
    'aligned layer base airdrop',
    'crypto airdrop checker',
    'multi wallet airdrop check',
    'merkle proof airdrop',
    'aligned layer crypto wallet',
    'blockchain airdrop eligibility',
    'free airdrop checker'
  ]}
  canonicalUrl="https://cryptowalletsx.com/aligned-airdrop"
  ogImage="https://cryptowalletsx.com/og-image.png"
  ogImageAlt="Multi Aligned Airdrop Check — ALIGN Token Eligibility Checker"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Multi Aligned Airdrop Check — ALIGN Token Eligibility Checker',
        url: 'https://cryptowalletsx.com/aligned-airdrop',
        description: 'Free multi-wallet ALIGN airdrop checker. Check eligibility for the AlignedLayer airdrop across 200+ wallets at once. See your ALIGN token allocation, Merkle proof, and claim deadline.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          'Multi-wallet batch airdrop eligibility check (up to 200 addresses)',
          'ALIGN token allocation amount display',
          'Merkle proof reveal for eligible wallets',
          'On-chain contract state for Ethereum and Base',
          'Live claim deadline countdown',
          'CSV export of results',
          'No wallet connection required'
        ]
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
          { '@type': 'ListItem', position: 2, name: 'Checkers', item: 'https://cryptowalletsx.com/checker' },
          { '@type': 'ListItem', position: 3, name: 'Aligned Airdrop', item: 'https://cryptowalletsx.com/aligned-airdrop' }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'How do I check if I am eligible for the AlignedLayer airdrop?', acceptedAnswer: { '@type': 'Answer', text: 'Paste your wallet addresses (up to 200 at once) into the multi-wallet checker above. The tool queries AlignedLayer\'s official API and the on-chain claim contract to tell you whether each address is eligible, the ALIGN token allocation amount, and the claim deadline. No wallet connection required.' } },
          { '@type': 'Question', name: 'Can I check multiple wallets at once for the ALIGN airdrop?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — this is the only multi-wallet ALIGN airdrop checker. You can paste up to 200 wallet addresses (one per line, comma or space separated) and the tool will batch-check all of them in parallel, returning per-address eligibility status, allocation amount, Merkle proof, and on-chain claim deadline in a single response.' } },
          { '@type': 'Question', name: 'What is the ALIGN token?', acceptedAnswer: { '@type': 'Answer', text: 'ALIGN is the native token of AlignedLayer, a verification layer for zero-knowledge proofs built on EigenLayer. The ALIGN airdrop distributes tokens to early users, operators, and community contributors based on on-chain activity snapshots taken by the AlignedLayer team.' } },
          { '@type': 'Question', name: 'When is the AlignedLayer airdrop claim deadline?', acceptedAnswer: { '@type': 'Answer', text: 'The claim deadline differs by chain. On Ethereum mainnet, the deadline is September 2030. On Base, the deadline is September 3, 2026. Eligible wallets must claim before the deadline on their respective chain — unclaimed tokens after the deadline are forfeited.' } },
          { '@type': 'Question', name: 'Why does my address show "Ambiguous"?', acceptedAnswer: { '@type': 'Answer', text: 'The AlignedLayer eligibility snapshot is gated behind a per-wallet Terms-of-Service signature. If your wallet has not yet signed the ToS at the official claim site, the API returns a default "ethereum" response that is indistinguishable from a real Ethereum-network allocation. To confirm eligibility, connect your wallet at airdrop.alignedlayer.com/claim and sign the free EIP-191 ToS message — then re-check here.' } },
          { '@type': 'Question', name: 'Is this AlignedLayer airdrop checker free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no wallet connection, no account, and no API key required. The tool reads from AlignedLayer\'s public API and public Ethereum/Base RPC endpoints. You can check up to 200 addresses per request, as many times as you want.' } },
          { '@type': 'Question', name: 'What does "Likely Eligible" mean?', acceptedAnswer: { '@type': 'Answer', text: 'If your wallet has not signed the ToS but the API returns "base" as the network, this is a non-default response — every non-eligible address defaults to "ethereum". A "base" response is a strong signal of eligibility on the Base chain. To reveal the exact allocation amount and Merkle proof, sign the ToS at the official claim site.' } }
        ]
      },
      {
        '@type': 'HowTo',
        name: 'How to check your ALIGN airdrop eligibility with multiple wallets',
        step: [
          { '@type': 'HowToStep', position: 1, name: 'Paste wallet addresses', text: 'Paste up to 200 wallet addresses into the textarea — one per line, comma-separated, or space-separated.' },
          { '@type': 'HowToStep', position: 2, name: 'Click Check Eligibility', text: 'Click the "Check Eligibility" button. The tool will batch-query AlignedLayer\'s API and the on-chain claim contract in parallel.' },
          { '@type': 'HowToStep', position: 3, name: 'Review results', text: 'Review each address\'s status: Eligible (with allocation), Likely Eligible (Base network signal), Ambiguous (sign ToS to confirm), or Not Eligible.' },
          { '@type': 'HowToStep', position: 4, name: 'Expand for allocation details', text: 'Click any eligible address row to expand the allocation panel showing the ALIGN token amount, valid_from timestamp, and Merkle proof.' },
          { '@type': 'HowToStep', position: 5, name: 'Export results', text: 'Click "Export CSV" to download all results as a spreadsheet for record-keeping.' },
          { '@type': 'HowToStep', position: 6, name: 'Claim on official site', text: 'For eligible wallets, visit airdrop.alignedlayer.com/claim to connect your wallet, sign the ToS, and claim your ALIGN tokens before the deadline.' }
        ]
      }
    ]
  }}
/>

<div class="min-h-screen flex flex-col bg-background">
  <HomeHeader />

  <!-- Hidden SEO content for crawlers -->
  <div class="sr-only" aria-hidden="true">
    <h2>Multi Aligned Airdrop Check Tool</h2>
    <p>The AlignedLayer ALIGN airdrop is one of the most anticipated token distributions in the zero-knowledge proof ecosystem. Our multi-wallet ALIGN airdrop checker lets you check eligibility for up to 200 wallets at once, with no wallet connection required. The tool reverse-engineers the official claim site at airdrop.alignedlayer.com to determine eligibility status, allocation amount, Merkle proof, and claim deadline for each address. Whether you are checking a single wallet or batch-checking dozens of addresses from different wallets, this tool returns per-address eligibility status in seconds.</p>
    <h2>What Is the AlignedLayer ALIGN Airdrop</h2>
    <p>AlignedLayer is a verification layer for zero-knowledge proofs built on top of EigenLayer. The ALIGN token is the native asset of the AlignedLayer protocol, used for verifying proofs, paying operator fees, and participating in governance. The ALIGN airdrop distributes tokens to early users, operators, and community contributors based on snapshots of on-chain activity on Ethereum mainnet and the Base L2 network. The airdrop uses a Merkle-tree-based claim contract deployed at 0xBfc06549532E6119C4Bc0EFf167290EfdCA33fa6 on both Ethereum and Base — identical address, different Merkle roots per chain.</p>
    <h2>How the Multi-Wallet ALIGN Eligibility Check Works</h2>
    <p>This tool calls AlignedLayer's official JSON API endpoints — specifically GET /api/wallets/&lt;address&gt;/network and GET /api/wallets/&lt;address&gt; — for each wallet you submit. For addresses whose Terms-of-Service has been previously signed at the official claim site, the backend returns the full allocation record including the ALIGN token amount, valid_from timestamp, and Merkle proof. For addresses without a signed ToS, the tool uses the network response as a passive signal: a "base" response is a non-default reply and therefore a strong indicator of eligibility, while a default "ethereum" response is ambiguous and requires ToS signing to confirm. The tool also reads the on-chain claim contract to display the current Merkle root, claim deadline, and pause status for both Ethereum and Base.</p>
    <h2>Frequently Asked Questions About the ALIGN Airdrop</h2>
    <p>How do I check if I am eligible for the AlignedLayer airdrop? Paste your wallet addresses (up to 200 at once) into the multi-wallet checker above. Can I check multiple wallets at once for the ALIGN airdrop? Yes — this is the only multi-wallet ALIGN airdrop checker. What is the ALIGN token? ALIGN is the native token of AlignedLayer, a verification layer for zero-knowledge proofs built on EigenLayer. When is the AlignedLayer airdrop claim deadline? On Ethereum mainnet, September 2030. On Base, September 3, 2026. Is this AlignedLayer airdrop checker free? Yes, completely free with no wallet connection, no account, and no API key required.</p>
    <h2>ALIGN Token Claim Contract Details</h2>
    <p>The claim contract is deployed at address 0xBfc06549532E6119C4Bc0EFf167290EfdCA33fa6 on both Ethereum mainnet (chain ID 1) and Base (chain ID 8453). The contract exposes the following public view functions: claimMerkleRoot() returns the current Merkle root as a bytes32, limitTimestampToClaim() returns the claim deadline as a unix timestamp, paused() returns whether the contract is paused, and hasClaimed(bytes32 leaf) returns whether a specific allocation has been claimed. The Merkle leaf is computed as keccak256(abi.encode(address, uint256 amount, uint256 validFrom)). The contract supports both single-claim (claim) and batch-claim (claimBatch) functions for gas-efficient multi-allocation claiming.</p>
  </div>

  <main class="flex-1">
    <!-- Breadcrumb Navigation -->
    <nav class="max-w-5xl mx-auto px-4 sm:px-6 pt-4" aria-label="Breadcrumb">
      <ol class="flex items-center gap-2 text-sm text-muted-foreground">
        <li><a href="/" class="hover:text-foreground transition-colors">Home</a></li>
        <li class="text-muted-foreground/50">/</li>
        <li><a href="/checker" class="hover:text-foreground transition-colors">Checkers</a></li>
        <li class="text-muted-foreground/50">/</li>
        <li class="text-foreground font-medium">Aligned Airdrop</li>
      </ol>
    </nav>

    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-teal-500/5 to-cyan-500/8"></div>
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-r from-emerald-500/10 via-teal-500/8 to-cyan-500/10 rounded-full blur-3xl"></div>
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-16 left-[10%] w-12 h-12 border border-emerald-500/15 rounded-lg float-animation rotate-45"></div>
        <div class="absolute top-28 right-[15%] w-8 h-8 border border-teal-500/15 rounded-full float-slow-animation"></div>
        <div class="absolute bottom-16 left-[30%] w-5 h-5 bg-cyan-500/8 rounded-md float-animation" style="animation-delay:2s"></div>
        <div class="absolute top-12 right-[40%] w-3 h-3 bg-emerald-400/10 rounded-full float-slow-animation" style="animation-delay:1s"></div>
      </div>

      <div class="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-12 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
          <Sparkles class="w-4 h-4 text-emerald-500" />
          <span class="text-sm font-medium bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Multi-Wallet Airdrop Checker</span>
        </div>

        <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
          <span class="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">Multi Aligned Airdrop Check</span>
        </h1>
        <p class="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-10">
          Check ALIGN token eligibility across <strong class="text-foreground">up to 200 wallets at once</strong>. No wallet connection, no sign-in. See your allocation, Merkle proof, and claim deadline in seconds.
        </p>

        <!-- Multi-address Input -->
        <div class="max-w-3xl mx-auto">
          <div class="relative">
            <textarea
              bind:value={input}
              onkeydown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleCheck();
              }}
              placeholder={`Paste wallet addresses (one per line, comma or space separated):\n0x0f8f4Ef7a3c10DBCD504d4f95Be19C9f58eBB223\n0xFd2C776de4754916e426eBd7C7342B892Fd18C9b\n0x57103ef3E782DDd6e3BC78b16c572BC2453aE24B\n... up to 200`}
              aria-label="Wallet addresses to check"
              class="w-full min-h-[180px] p-4 pl-12 pt-4 bg-card/60 border border-border/40 backdrop-blur-xl rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-mono resize-y"
            ></textarea>
            <Wallet class="absolute left-4 top-4 w-4 h-4 text-muted-foreground pointer-events-none" />
            <div class="absolute bottom-3 right-4 text-xs text-muted-foreground/70">
              {addressCount} / 200
            </div>
          </div>

          <div class="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onclick={handleCheck}
              disabled={loading || !input.trim()}
              class="h-12 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {#if loading}
                <Loader2 class="w-4 h-4 animate-spin" />
                Checking {data?.results.length ?? 0}...
              {:else}
                <Search class="w-4 h-4" />
                Check Eligibility
              {/if}
            </button>
            <button
              onclick={clearAll}
              disabled={loading || (!input && !data)}
              class="h-12 px-5 rounded-xl bg-card/60 border border-border/40 text-muted-foreground hover:text-foreground hover:bg-card/80 transition-all text-sm font-medium disabled:opacity-50"
            >
              Clear
            </button>
          </div>

          <p class="mt-3 text-xs text-muted-foreground">
            Tip: press <kbd class="px-1.5 py-0.5 rounded bg-card border border-border/40 text-[10px]">⌘/Ctrl</kbd> + <kbd class="px-1.5 py-0.5 rounded bg-card border border-border/40 text-[10px]">Enter</kbd> to check
          </p>
        </div>
      </div>
    </section>

    <!-- Error -->
    {#if error}
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
        <div class="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center">
          <AlertCircle class="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p class="text-sm text-red-500">{error}</p>
          <button
            onclick={() => { error = null; }}
            class="mt-3 text-sm text-red-400 underline hover:text-red-300"
          >
            Dismiss
          </button>
        </div>
      </div>
    {/if}

    <!-- Loading -->
    {#if loading}
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div class="flex flex-col items-center justify-center py-20">
          <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center mb-6 animate-pulse">
            <Loader2 class="w-10 h-10 text-white animate-spin" />
          </div>
          <p class="text-lg font-semibold mb-2">Checking Eligibility...</p>
          <p class="text-sm text-muted-foreground">Querying AlignedLayer API & on-chain contract state</p>
          <div class="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>Batch-checking up to 5 addresses in parallel</span>
          </div>
        </div>
      </div>
    {/if}

    <!-- Results -->
    {#if data && !loading}
      <!-- Stats Row -->
      <section class="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-4 rounded-xl bg-card/60 border border-border/40 backdrop-blur-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total</span>
              <Search class="w-4 h-4 text-muted-foreground" />
            </div>
            <div class="mt-2 text-2xl font-bold">{data.stats.total}</div>
          </div>
          <div class="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Eligible</span>
              <CheckCircle2 class="w-4 h-4 text-emerald-500" />
            </div>
            <div class="mt-2 text-2xl font-bold text-emerald-500">
              {data.stats.eligible + data.stats.likelyEligible}
            </div>
            <div class="text-[10px] text-muted-foreground mt-0.5">
              {data.stats.eligible} confirmed + {data.stats.likelyEligible} likely
            </div>
          </div>
          <div class="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Not Eligible</span>
              <XCircle class="w-4 h-4 text-red-500" />
            </div>
            <div class="mt-2 text-2xl font-bold text-red-500">{data.stats.notEligible}</div>
          </div>
          <div class="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total ALIGN</span>
              <Coins class="w-4 h-4 text-emerald-500" />
            </div>
            <div class="mt-2 text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {data.stats.totalAlignEligibleFormatted}
            </div>
            <div class="text-[10px] text-muted-foreground mt-0.5">across eligible wallets</div>
          </div>
        </div>
      </section>

      <!-- Chain state -->
      <section class="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {#each [{ chain: 'Ethereum', state: data.contract.ethereum }, { chain: 'Base', state: data.contract.base }] as { chain, state }}
            {@const time = timeUntil(state.deadline)}
            <div class="p-4 rounded-xl bg-card/60 border border-border/40 backdrop-blur-sm">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {chain} Claim Deadline
                </span>
                {#if state.paused}
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/15 text-red-500 border border-red-500/30">Paused</span>
                {:else if time.expired}
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/15 text-red-500 border border-red-500/30">Expired</span>
                {:else}
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">Active</span>
                {/if}
              </div>
              <div class="mt-2 text-sm font-mono text-foreground">
                {state.deadlineIso}
              </div>
              {#if !time.expired && state.deadline > 0}
                <div class="mt-1 text-xs text-muted-foreground">
                  {time.days}d {time.hours}h remaining
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </section>

      <!-- Share on Twitter section (matching soneium pattern) -->
      <section class="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
        <div class="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 border border-emerald-500/20 text-center">
          <h3 class="text-lg font-bold mb-2">Share Your Airdrop Result</h3>
          <p class="text-sm text-muted-foreground mb-4">
            {#if data.stats.eligible + data.stats.likelyEligible > 0}
              <span class="font-bold text-emerald-500">{data.stats.eligible + data.stats.likelyEligible}</span>
              of <span class="font-bold text-foreground">{data.stats.total}</span> wallets eligible for {data.stats.totalAlignEligibleFormatted} ALIGN!
            {:else}
              None of your <span class="font-bold text-foreground">{data.stats.total}</span> wallets are eligible. Still worth sharing!
            {/if}
          </p>
          <button
            onclick={shareOnTwitter}
            class="h-10 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-semibold text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-emerald-500/25 transition-all mx-auto"
          >
            <Share2 class="w-4 h-4" />
            Share on Twitter
          </button>
        </div>
      </section>

      <!-- Filter tabs + Export -->
      <section class="max-w-5xl mx-auto px-4 sm:px-6 pb-4">
        <div class="flex flex-wrap items-center gap-2">
          {#each filterTabs as tab}
            {@const count = tab.key === 'all'
              ? data.stats.total
              : (data.results.filter((r) => r.status === tab.key).length)}
            {#if count > 0 || tab.key === 'all'}
              <button
                onclick={() => (filter = tab.key)}
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all {
                  filter === tab.key
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-card/60 border border-border/40 text-muted-foreground hover:text-foreground hover:bg-card/80'
                }"
              >
                {tab.label}
                <span class="text-[10px] {filter === tab.key ? 'text-white/70' : 'text-muted-foreground'}">
                  ({count})
                </span>
              </button>
            {/if}
          {/each}
          <button
            onclick={exportCsv}
            class="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-card/60 border border-border/40 text-muted-foreground hover:text-foreground hover:bg-card/80 transition-all"
          >
            <ExternalLink class="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </section>

      <!-- Results Table -->
      <section class="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div class="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border/40 bg-card/60">
                  <th class="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground w-8"></th>
                  <th class="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Address</th>
                  <th class="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Network</th>
                  <th class="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  <th class="text-right py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Allocation</th>
                  <th class="text-right py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody>
                {#each filteredResults as r (r.address)}
                  {@const cfg = STATUS_CONFIG[r.status]}
                  {@const Icon = cfg.icon}
                  {@const isOpen = expandedAddress === r.address}
                  <tr
                    class={`border-b border-border/20 cursor-pointer transition-colors hover:bg-card/40 ${isOpen ? 'bg-card/60' : ''}`}
                    onclick={() => toggleExpand(r.address)}
                  >
                    <td class="py-3 px-4">
                      {#if isOpen}
                        <ChevronDown class="w-3.5 h-3.5 text-muted-foreground" />
                      {:else}
                        <ChevronRight class="w-3.5 h-3.5 text-muted-foreground" />
                      {/if}
                    </td>
                    <td class="py-3 px-4 font-mono text-xs">
                      <button
                        class="text-left hover:underline"
                        onclick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(r.address, 'Address');
                        }}
                        title="Click to copy"
                      >
                        <span class="break-all">{r.address}</span>
                      </button>
                    </td>
                    <td class="py-3 px-4">
                      {#if r.network}
                        <span class={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                          r.network === 'ethereum'
                            ? 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                            : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}>
                          {r.network}
                        </span>
                      {/if}
                    </td>
                    <td class="py-3 px-4">
                      <span class={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        <Icon class="w-3 h-3" />
                        {cfg.shortLabel}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-right font-mono font-semibold">
                      {#if r.allocation && r.allocation.length > 0}
                        <span class="text-emerald-500">
                          {r.totalAmount}
                          <span class="ml-1 text-[10px] text-muted-foreground">ALIGN</span>
                        </span>
                      {:else}
                        <span class="text-muted-foreground/50">—</span>
                      {/if}
                    </td>
                    <td class="py-3 px-4 text-right text-xs text-muted-foreground">
                      {r.elapsedMs}ms
                    </td>
                  </tr>
                  {#if isOpen}
                    <tr class="bg-card/30 border-b border-border/20">
                      <td colspan="6" class="p-4">
                        {#if r.allocation && r.allocation.length > 0}
                          <div class="space-y-3">
                            <div class="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                              Allocation Details ({r.allocation.length})
                            </div>
                            {#each r.allocation as alloc, i}
                              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs p-3 bg-background/60 rounded-md border border-border/30">
                                <div>
                                  <div class="text-muted-foreground">Amount</div>
                                  <div class="font-mono font-semibold text-emerald-500">
                                    {alloc.amountHuman} ALIGN
                                  </div>
                                  <div class="text-[10px] text-muted-foreground font-mono mt-0.5">
                                    raw: {alloc.amount}
                                  </div>
                                </div>
                                <div>
                                  <div class="text-muted-foreground">Valid From</div>
                                  <div class="font-mono text-xs">
                                    {#if alloc.validFrom}
                                      {new Date(alloc.validFrom * 1000).toISOString().replace('T', ' ').slice(0, 19)} UTC
                                    {:else}
                                      —
                                    {/if}
                                  </div>
                                </div>
                                <div>
                                  <div class="text-muted-foreground">Merkle Proof</div>
                                  <div class="text-[10px] text-muted-foreground">
                                    {alloc.merkleProof.length} elements
                                  </div>
                                </div>
                                <div>
                                  <div class="text-muted-foreground">Action</div>
                                  <a
                                    href="https://airdrop.alignedlayer.com/claim"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onclick={(e) => e.stopPropagation()}
                                    class="inline-flex items-center gap-1 text-xs text-emerald-500 hover:underline"
                                  >
                                    <ArrowUpRight class="w-3 h-3" />
                                    Claim on official site
                                  </a>
                                </div>
                              </div>
                            {/each}
                            <div class="text-xs text-muted-foreground italic">
                              {r.message}
                            </div>
                            <div class="flex flex-wrap gap-3">
                              <a
                                href={`https://etherscan.io/address/${r.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onclick={(e) => e.stopPropagation()}
                                class="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline"
                              >
                                <ExternalLink class="w-3 h-3" /> Etherscan
                              </a>
                              <a
                                href={`https://basescan.org/address/${r.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onclick={(e) => e.stopPropagation()}
                                class="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline"
                              >
                                <ExternalLink class="w-3 h-3" /> Basescan
                              </a>
                            </div>
                          </div>
                        {:else}
                          <div class="space-y-3">
                            <div class="text-xs text-muted-foreground italic">
                              {r.message}
                            </div>
                            {#if r.status === 'ambiguous' || r.status === 'likely-eligible'}
                              <a
                                href="https://airdrop.alignedlayer.com/claim"
                                target="_blank"
                                rel="noopener noreferrer"
                                onclick={(e) => e.stopPropagation()}
                                class="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 rounded-md hover:bg-emerald-500/25 transition-colors"
                              >
                                <ArrowUpRight class="w-3 h-3" />
                                Sign ToS on official site to reveal allocation
                              </a>
                            {/if}
                          </div>
                        {/if}
                      </td>
                    </tr>
                  {/if}
                {/each}
                {#if filteredResults.length === 0}
                  <tr>
                    <td colspan="6" class="text-center text-muted-foreground py-12">
                      No addresses match this filter
                    </td>
                  </tr>
                {/if}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Invalid addresses (collapsed) -->
      {#if data.invalidAddresses.length > 0}
        <section class="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
          <details class="rounded-xl border border-border/40 bg-card/40 p-4">
            <summary class="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
              {data.invalidAddresses.length} invalid address(es) skipped — click to view
            </summary>
            <div class="mt-3 text-xs font-mono text-muted-foreground whitespace-pre-wrap">
              {data.invalidAddresses.join('\n')}
            </div>
          </details>
        </section>
      {/if}
    {/if}

    <!-- Static SEO Content (always rendered) -->
    <section class="max-w-5xl mx-auto px-4 sm:px-6 py-16 bg-card/30">
      <h2 class="text-2xl sm:text-3xl font-bold mb-6">About the ALIGN Airdrop Checker</h2>
      <p class="text-muted-foreground mb-4 leading-relaxed">
        The <strong>multi Aligned airdrop check</strong> tool on CryptoWalletsX is the only batch-checker that lets you verify ALIGN token eligibility across multiple wallets in a single request. Built by reverse-engineering the official claim site at airdrop.alignedlayer.com, this tool queries AlignedLayer's JSON API and reads on-chain state from the claim contract deployed at <code class="px-1 py-0.5 bg-card rounded">0xBfc06549532E6119C4Bc0EFf167290EfdCA33fa6</code> on both Ethereum mainnet and Base L2.
      </p>

      <h3 class="text-xl font-bold mb-3 mt-8">What Is AlignedLayer?</h3>
      <p class="text-muted-foreground mb-4 leading-relaxed">
        AlignedLayer is a verification layer for zero-knowledge proofs, built on top of EigenLayer's restaking infrastructure. The protocol allows ZK proofs generated by any proving system (such as Plonky3, Halo2, RISC Zero, SP1, or zkRust) to be verified on Ethereum without paying the full gas cost of on-chain verification. The ALIGN token is the native asset of the protocol — used for verifying proofs, paying operator fees, and participating in governance decisions.
      </p>

      <h3 class="text-xl font-bold mb-3 mt-8">How the ALIGN Airdrop Works</h3>
      <p class="text-muted-foreground mb-4 leading-relaxed">
        The ALIGN airdrop distributes tokens to early users, operators, and community contributors based on snapshots of on-chain activity on Ethereum mainnet and the Base L2 network. The airdrop uses a Merkle-tree-based claim contract — meaning each eligible address has a leaf in the Merkle tree containing its allocation amount and valid-from timestamp, and the address owner must submit the corresponding Merkle proof to claim their tokens. The Merkle root is publicly readable from the contract via the <code class="px-1 py-0.5 bg-card rounded">claimMerkleRoot()</code> view function.
      </p>
      <p class="text-muted-foreground mb-4 leading-relaxed">
        Eligibility is determined by an off-chain snapshot taken by the AlignedLayer team, and the snapshot is gated behind a per-wallet EIP-191 Terms-of-Service signature at the official claim site. This means that for an address to be confirmed as eligible, the wallet owner must connect to airdrop.alignedlayer.com, sign a free off-chain message accepting the ToS, and then the backend reveals the allocation amount and Merkle proof.
      </p>

      <h3 class="text-xl font-bold mb-3 mt-8">Why Use a Multi-Wallet ALIGN Checker?</h3>
      <p class="text-muted-foreground mb-4 leading-relaxed">
        If you have multiple wallets — for example, separate wallets for staking, trading, bridging, and airdrop farming — checking each one individually at the official site is tedious. The official claim site requires you to connect a wallet, sign the ToS, and then it reveals the allocation for that one wallet only. Our multi-wallet checker lets you paste up to 200 addresses at once and see all eligibility statuses, allocation amounts, and claim deadlines in a single response — without connecting any wallet or signing anything.
      </p>

      <h3 class="text-xl font-bold mb-3 mt-8">How Eligibility Status Is Determined</h3>
      <p class="text-muted-foreground mb-4 leading-relaxed">
        For each address you submit, the tool queries two endpoints at AlignedLayer's official API: <code class="px-1 py-0.5 bg-card rounded">GET /api/wallets/&lt;address&gt;/network</code> (a passive signal that returns "ethereum" or "base" without requiring ToS) and <code class="px-1 py-0.5 bg-card rounded">GET /api/wallets/&lt;address&gt;</code> (which requires ToS to be signed and returns the full allocation record if eligible). The classification is:
      </p>
      <ul class="text-muted-foreground mb-4 leading-relaxed list-disc pl-6 space-y-2">
        <li><strong class="text-foreground">Eligible</strong> — ToS was previously signed; the backend returned the full allocation record with ALIGN amount, valid-from timestamp, and Merkle proof.</li>
        <li><strong class="text-foreground">Likely Eligible</strong> — ToS not signed, but the network response is "base" (a non-default reply — every non-eligible address defaults to "ethereum"). This is a strong eligibility signal on the Base chain.</li>
        <li><strong class="text-foreground">Ambiguous</strong> — ToS not signed and network response is "ethereum" (the default). Could be eligible on Ethereum OR not in the snapshot. Sign ToS at the official claim site to confirm.</li>
        <li><strong class="text-foreground">Not Eligible</strong> — The backend returned HTTP 404, meaning the address is not in the airdrop snapshot.</li>
        <li><strong class="text-foreground">Past Deadline</strong> — The address was eligible but the claim deadline for its chain has passed.</li>
      </ul>

      <h3 class="text-xl font-bold mb-3 mt-8">ALIGN Airdrop Claim Deadlines</h3>
      <p class="text-muted-foreground mb-4 leading-relaxed">
        The claim deadline differs by chain. On Ethereum mainnet, the deadline is September 20, 2030 — giving eligible wallets nearly four years to claim. On Base, the deadline is September 3, 2026 — meaning Base-network eligible wallets must claim before that date or forfeit their allocation. The exact deadlines are read live from the on-chain contract via the <code class="px-1 py-0.5 bg-card rounded">limitTimestampToClaim()</code> view function and displayed in the results above with a real-time countdown.
      </p>

      <h3 class="text-xl font-bold mb-3 mt-8">How to Claim Your ALIGN Tokens</h3>
      <p class="text-muted-foreground mb-4 leading-relaxed">
        Once you have confirmed eligibility using our checker, visit <a href="https://airdrop.alignedlayer.com/claim" class="text-emerald-500 hover:underline" target="_blank" rel="noopener noreferrer">airdrop.alignedlayer.com/claim</a> to claim. Connect your wallet, switch to the correct chain (Ethereum mainnet or Base) as indicated by the checker, sign the free EIP-191 Terms-of-Service message, and then click "Claim". The claim transaction will call the <code class="px-1 py-0.5 bg-card rounded">claim(uint256 amount, uint256 validFrom, bytes32[] proof)</code> function on the contract, transferring your ALIGN tokens to your wallet.
      </p>

      <h3 class="text-xl font-bold mb-3 mt-8">Frequently Asked Questions</h3>
      <div class="space-y-4 text-muted-foreground leading-relaxed">
        <div>
          <p class="font-semibold text-foreground mb-1">How do I check if I am eligible for the AlignedLayer airdrop?</p>
          <p>Paste your wallet addresses (up to 200 at once) into the multi-wallet checker above and click "Check Eligibility". The tool will batch-query AlignedLayer's API and the on-chain claim contract, returning per-address eligibility status, allocation amount, and claim deadline in seconds.</p>
        </div>
        <div>
          <p class="font-semibold text-foreground mb-1">Can I check multiple wallets at once for the ALIGN airdrop?</p>
          <p>Yes — this is the only multi-wallet ALIGN airdrop checker. Paste up to 200 wallet addresses (one per line, comma or space separated) and the tool will batch-check all of them in parallel.</p>
        </div>
        <div>
          <p class="font-semibold text-foreground mb-1">What is the ALIGN token?</p>
          <p>ALIGN is the native token of AlignedLayer, a verification layer for zero-knowledge proofs built on EigenLayer. The token is used for verifying proofs, paying operator fees, and governance.</p>
        </div>
        <div>
          <p class="font-semibold text-foreground mb-1">When is the AlignedLayer airdrop claim deadline?</p>
          <p>On Ethereum mainnet: September 20, 2030. On Base: September 3, 2026. Eligible wallets must claim before the deadline on their respective chain.</p>
        </div>
        <div>
          <p class="font-semibold text-foreground mb-1">Is this AlignedLayer airdrop checker free?</p>
          <p>Yes, completely free with no wallet connection, no account, and no API key required. You can check up to 200 addresses per request, as many times as you want.</p>
        </div>
        <div>
          <p class="font-semibold text-foreground mb-1">Why does my address show "Ambiguous"?</p>
          <p>The AlignedLayer eligibility snapshot is gated behind a per-wallet Terms-of-Service signature. If your wallet has not yet signed the ToS at the official claim site, the API returns a default "ethereum" response that is indistinguishable from a real Ethereum-network allocation. To confirm eligibility, connect your wallet at airdrop.alignedlayer.com/claim and sign the free ToS message — then re-check here.</p>
        </div>
      </div>
    </section>
  </main>

  <Footer />
</div>
