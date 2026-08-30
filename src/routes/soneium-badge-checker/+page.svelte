<script lang="ts">
  import {
    Search, Shield, Award, Check, X, Loader2, AlertCircle,
    Share2, Info, ChevronDown, ChevronUp, Copy as CopyIcon, CheckCircle2, XCircle,
    Crown, Star, Sparkles, Trophy, Gem, Flame
  } from 'lucide-svelte';
  import HomeHeader from '$lib/components/home/HomeHeader.svelte';
  import Footer from '$lib/components/home/Footer.svelte';
  import SEO from '$lib/components/SEO.svelte';

  const ALCHEMY_KEY = import.meta.env.VITE_ALCHEMY_SONEIUM_KEY || '';
  if (!ALCHEMY_KEY) {
    console.warn('VITE_ALCHEMY_SONEIUM_KEY env var not set — soneium badge checker will not be able to fetch NFT balances. Set it in .env (gitignored). See .env.example.');
  }
  const ALCHEMY_BASE = `https://soneium-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_KEY}`;

  const OG_BADGE_CONTRACT = '0x2A21B17E366836e5FFB19bd47edB03b4b551C89d';

  const OG_BADGES = [
    { name: 'OG Badge', tokenId: '0', contract: OG_BADGE_CONTRACT, type: 'ERC1155' as const, description: 'Original Soneium OG Badge' },
    { name: 'Premium OG Badge', tokenId: '1', contract: OG_BADGE_CONTRACT, type: 'ERC1155' as const, description: 'Premium Soneium OG Badge' },
  ];

  const ECOSYSTEM_BADGES: { name: string; contract: string; type: 'ERC721' }[] = [
    { name: '2P2E', contract: '0x8918531fC73f2c9047f0163eA126EeD1B8EA2c63', type: 'ERC721' },
    { name: 'Arkada', contract: '0x391Dece93d18Fca922bF337C25Ee38BeA74Db63E', type: 'ERC721' },
    { name: 'Biru', contract: '0x44EEfAC1D5Db283B2dD99e226B864da271D82952', type: 'ERC721' },
    { name: 'CONFT', contract: '0x7A475a650a4867577cf488E94ec023E593997fd6', type: 'ERC721' },
    { name: 'CoPump', contract: '0x39C5DfF4e39779492C3AE3898c8d5a0579fE684e', type: 'ERC721' },
    { name: 'HandsNFT AI', contract: '0x670113b4AE5416E1368669bE1cdcc918871827eA', type: 'ERC721' },
    { name: 'NFTs2Me', contract: '0x4591D540B692CBeD60Db7781B7683910f7a3BF8C', type: 'ERC721' },
    { name: 'Quickswap', contract: '0x5C0221a8c3eB5956b70cDC572fA0F6C952274f1A', type: 'ERC721' },
    { name: 'Sake', contract: '0x3a634e6f8C2bf2C5894722B908d99e3cF9C62eD3', type: 'ERC721' },
    { name: 'SoneFi', contract: '0x6DD843fe15dbFD41F001d448cb246ac8b65a6027', type: 'ERC721' },
    { name: 'Sonova', contract: '0x4A33e2E308E5d9C0188d209F1bF443Ff7CfB4A31', type: 'ERC721' },
    { name: 'Sonus', contract: '0x066ABA7c3520e300113C0515FF41c084eE0c95Ea', type: 'ERC721' },
    { name: 'SuperVol', contract: '0x55E906C6Fb98894f05E1a7A533d77732B79a5414', type: 'ERC721' },
    { name: 'SynStation', contract: '0x0DEc30Af3551161606282a6bc1243526b6a3D1E9', type: 'ERC721' },
    { name: 'UntitledBank', contract: '0xcf87B2d5Ab008D41159f6737E2a5b6a3Bc40b753', type: 'ERC721' },
    { name: 'Velodrome', contract: '0x2DCD9B33F0721000Dc1F8f84B804d4CFA23d7713', type: 'ERC721' },
    { name: 'waveX', contract: '0x4a3b67b339c272fAb639B0CAF3Ce7852B2Aa0833', type: 'ERC721' },
    { name: 'Layer3', contract: '0x83A0C5D831E7869f4c710658CBD1b455Ba92ad00', type: 'ERC721' },
    { name: 'Moon Medal', contract: '0xeAF42993E44be62c9113161c0016821C6A540B92', type: 'ERC721' },
    { name: 'KYO FINANCE', contract: '0x11B2876C58cFb7501Db60d0112AF8A8EfEB0A81D', type: 'ERC721' },
    { name: 'SONEX GOAT', contract: '0xAa6c38A85e5781bCc410693B52F64EfF1aFcd3c6', type: 'ERC721' },
    { name: 'Owlto X Soneium', contract: '0x1eC6AACC79f3c4817d7fea2268e1c54C6b2662Fb', type: 'ERC721' },
    { name: 'Orbiter x Soneium', contract: '0xc59f0D1B1b614d8446dDe1760fc3e6ae57bF9501', type: 'ERC721' },
    { name: 'Fractal Visions', contract: '0x1833e394D879D9b493cdb0fe754F304f2E9F23bf', type: 'ERC721' },
    { name: 'Mithraeum', contract: '0x9d83A657581A966aDf1c346dAfEe3EBe258EC26D', type: 'ERC721' },
    { name: 'Omnihub', contract: '0x7e058E9eeb81758F80049d0F2c1C1A7b47919697', type: 'ERC721' },
    { name: 'XSTAR', contract: '0x690B97980877b5d7915E89E6D0Cb9748A8bdAB8d', type: 'ERC721' },
    { name: 'Posse', contract: '0x890a19A1Dd75AAEcc4eDFce4685bb59C8ABEe78A', type: 'ERC721' },
    { name: 'Unemeta', contract: '0xCA707D22E248740aDaA9C63580F7A35201B18d30', type: 'ERC721' },
    { name: 'Arcas Games', contract: '0x9a4cC369A91AE5e8cBd99163a2eAC5b7957879dB', type: 'ERC721' },
  ];

  type FilterTab = 'All' | 'Owned' | 'Not Owned';

  interface RarityTier {
    name: string;
    icon: any;
    color: string;
    bgGradient: string;
    borderColor: string;
    textColor: string;
    glowColor: string;
  }

  const RARITY_TIERS: { min: number; max: number; tier: RarityTier }[] = [
    { min: 0, max: 0, tier: { name: 'Newcomer', icon: Star, color: 'zinc', bgGradient: 'from-zinc-500/10 to-zinc-600/10', borderColor: 'border-zinc-500/30', textColor: 'text-zinc-400', glowColor: 'shadow-zinc-500/10' } },
    { min: 1, max: 25, tier: { name: 'Explorer', icon: Flame, color: 'amber', bgGradient: 'from-amber-500/10 to-orange-500/10', borderColor: 'border-amber-500/30', textColor: 'text-amber-400', glowColor: 'shadow-amber-500/10' } },
    { min: 26, max: 50, tier: { name: 'Collector', icon: Gem, color: 'blue', bgGradient: 'from-blue-500/10 to-cyan-500/10', borderColor: 'border-blue-500/30', textColor: 'text-blue-400', glowColor: 'shadow-blue-500/10' } },
    { min: 51, max: 75, tier: { name: 'Champion', icon: Trophy, color: 'yellow', bgGradient: 'from-yellow-500/10 to-amber-500/10', borderColor: 'border-yellow-500/30', textColor: 'text-yellow-400', glowColor: 'shadow-yellow-500/10' } },
    { min: 76, max: 100, tier: { name: 'Legend', icon: Crown, color: 'purple', bgGradient: 'from-purple-500/10 to-emerald-500/10', borderColor: 'border-purple-500/30', textColor: 'text-purple-400', glowColor: 'shadow-purple-500/20' } },
  ];

  // State
  let inputAddress = $state('');
  let address = $state('');
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let activeFilter = $state<FilterTab>('All');
  let searchQuery = $state('');
  let isLoaded = $state(false);
  let copiedAddress = $state(false);
  let infoExpanded = $state(false);
  let isAnimated = $state(false);

  // Badge ownership data
  let ownedOGBadges = $state<{ name: string; tokenId: string; image?: string; owned: boolean }[]>([]);
  let notOwnedOGBadges = $state<{ name: string; tokenId: string; image?: string; owned: boolean }[]>([]);
  let ownedEcosystemBadges = $state<{ name: string; contract: string; image?: string; tokenId?: string; owned: boolean }[]>([]);
  let notOwnedEcosystemBadges = $state<{ name: string; contract: string; image?: string; tokenId?: string; owned: boolean }[]>([]);

  // Derived
  let ogOwnedCount = $derived(ownedOGBadges.length);
  let ogTotalCount = $derived(OG_BADGES.length);
  let ecoOwnedCount = $derived(ownedEcosystemBadges.length);
  let ecoTotalCount = $derived(ECOSYSTEM_BADGES.length);
  let totalOwned = $derived(ogOwnedCount + ecoOwnedCount);
  let totalBadges = $derived(ogTotalCount + ecoTotalCount);
  let ownershipPercent = $derived(totalBadges > 0 ? Math.round((totalOwned / totalBadges) * 100) : 0);

  let currentTier = $derived.by(() => {
    const pct = ownershipPercent;
    for (const t of RARITY_TIERS) {
      if (pct >= t.min && pct <= t.max) return t.tier;
    }
    return RARITY_TIERS[0].tier;
  });

  let svgProgressOffset = $derived(() => {
    const circumference = 2 * Math.PI * 54;
    return circumference - (circumference * ownershipPercent) / 100;
  });

  let svgProgressColor = $derived.by(() => {
    const pct = ownershipPercent;
    if (pct === 0) return '#71717a';
    if (pct <= 25) return '#f59e0b';
    if (pct <= 50) return '#3b82f6';
    if (pct <= 75) return '#eab308';
    return '#a855f7';
  });

  let filteredEcosystemBadges = $derived.by(() => {
    let badges = [...ownedEcosystemBadges, ...notOwnedEcosystemBadges];

    if (activeFilter === 'Owned') {
      badges = badges.filter(b => b.owned);
    } else if (activeFilter === 'Not Owned') {
      badges = badges.filter(b => !b.owned);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      badges = badges.filter(b => b.name.toLowerCase().includes(q));
    }

    // Sort: owned first
    return badges.sort((a, b) => (b.owned ? 1 : 0) - (a.owned ? 1 : 0));
  });

  let filteredOGBadges = $derived.by(() => {
    let badges = [...ownedOGBadges, ...notOwnedOGBadges];

    if (activeFilter === 'Owned') {
      badges = badges.filter(b => b.owned);
    } else if (activeFilter === 'Not Owned') {
      badges = badges.filter(b => !b.owned);
    }

    return badges;
  });

  let shareText = $derived(() => {
    if (!address) return '';
    return `🟣 Soneium Badge Checker\n\n🏆 Badges Owned: ${totalOwned}/${totalBadges} (${ownershipPercent}%)\n🎖️ OG Badges: ${ogOwnedCount}/${ogTotalCount}\n🌟 Ecosystem Badges: ${ecoOwnedCount}/${ecoTotalCount}\n⭐ Rarity Tier: ${currentTier.name}\n\nCheck yours at cryptowalletsx.com/soneium-badge-checker`;
  });

  // Animate on load
  $effect(() => {
    const timer = setTimeout(() => { isAnimated = true; }, 100);
    return () => clearTimeout(timer);
  });

  // Fetch
  async function fetchBadges(addr: string) {
    isLoading = true;
    error = null;
    isLoaded = false;

    try {
      const allContracts = [OG_BADGE_CONTRACT, ...ECOSYSTEM_BADGES.map(b => b.contract)];
      const contractParams = allContracts.map(c => `contractAddresses[]=${c}`).join('&');
      const url = `${ALCHEMY_BASE}/getNFTsForOwner?owner=${addr}&withMetadata=true&${contractParams}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      const ownedNfts: any[] = data?.ownedNfts || [];

      const byContract = new Map<string, any[]>();
      for (const nft of ownedNfts) {
        const contractAddr = (nft?.contract?.address || '').toLowerCase();
        if (!byContract.has(contractAddr)) {
          byContract.set(contractAddr, []);
        }
        byContract.get(contractAddr)!.push(nft);
      }

      // Process OG Badges (ERC1155)
      const ownedOG: typeof ownedOGBadges = [];
      const notOwnedOG: typeof notOwnedOGBadges = [];

      const ogNfts = byContract.get(OG_BADGE_CONTRACT.toLowerCase()) || [];
      const ownedTokenIds = new Set<string>();

      for (const nft of ogNfts) {
        const tokenId = nft?.id?.tokenId || nft?.tokenId || '';
        const balance = parseInt(nft?.balance || '1');
        if (balance > 0) {
          ownedTokenIds.add(tokenId);
        }
      }

      for (const badge of OG_BADGES) {
        const isOwned = ownedTokenIds.has(badge.tokenId);
        const nftData = ogNfts.find((n: any) => {
          const tid = n?.id?.tokenId || n?.tokenId || '';
          return tid === badge.tokenId;
        });
        const image = nftData?.image?.cachedUrl || nftData?.image?.thumbnailUrl || nftData?.image?.pngUrl || nftData?.image?.originalUrl || nftData?.media?.[0]?.gateway || undefined;

        if (isOwned) {
          ownedOG.push({ name: badge.name, tokenId: badge.tokenId, image, owned: true });
        } else {
          notOwnedOG.push({ name: badge.name, tokenId: badge.tokenId, image, owned: false });
        }
      }

      ownedOGBadges = ownedOG;
      notOwnedOGBadges = notOwnedOG;

      // Process Ecosystem Badges (ERC721)
      const ownedEco: typeof ownedEcosystemBadges = [];
      const notOwnedEco: typeof notOwnedEcosystemBadges = [];

      for (const badge of ECOSYSTEM_BADGES) {
        const nfts = byContract.get(badge.contract.toLowerCase()) || [];
        const isOwned = nfts.length > 0 && nfts.some((n: any) => parseInt(n?.balance || '1') > 0);

        if (isOwned) {
          const nftData = nfts[0];
          const image = nftData?.image?.cachedUrl || nftData?.image?.thumbnailUrl || nftData?.image?.pngUrl || nftData?.image?.originalUrl || nftData?.media?.[0]?.gateway || undefined;
          const tokenId = nftData?.id?.tokenId || nftData?.tokenId || undefined;
          ownedEco.push({ name: badge.name, contract: badge.contract, image, tokenId, owned: true });
        } else {
          notOwnedEco.push({ name: badge.name, contract: badge.contract, owned: false });
        }
      }

      ownedEcosystemBadges = ownedEco;
      notOwnedEcosystemBadges = notOwnedEco;
      isLoaded = true;
    } catch (err: any) {
      error = err?.message || 'Failed to fetch badge data. Please try again.';
    } finally {
      isLoading = false;
    }
  }

  function handleSubmit() {
    const addr = inputAddress.trim();
    if (!addr) return;
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      error = 'Please enter a valid Ethereum address (0x...)';
      return;
    }
    address = addr;
    fetchBadges(addr);
  }

  function copyAddr() {
    if (!address) return;
    navigator.clipboard.writeText(address);
    copiedAddress = true;
    setTimeout(() => { copiedAddress = false; }, 2000);
  }

  function shareOnTwitter() {
    const text = encodeURIComponent(shareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  }

  function truncateAddress(addr: string): string {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  function getBlockscoutUrl(contract: string, tokenId?: string): string {
    if (tokenId) {
      return `https://soneium.blockscout.com/token/${contract}/instance/${tokenId}`;
    }
    return `https://soneium.blockscout.com/token/${contract}`;
  }
</script>

<SEO
  title="Soneium Badge Checker"
  description="Check your Soneium OG badges and ecosystem badges. Verify which Soneium NFT badges you own including OG, Premium OG, and 30+ ecosystem partner badges."
  keywords={["soneium badge", "soneium og badge", "soneium ecosystem", "soneium nft", "badge checker", "soneium airdrop"]}
  canonicalUrl="https://cryptowalletsx.com/soneium-badge-checker"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Soneium Badge Checker',
        url: 'https://cryptowalletsx.com/soneium-badge-checker',
        description: 'Check your Soneium OG badges and ecosystem badges. Verify which Soneium NFT badges you own.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
          { '@type': 'ListItem', position: 2, name: 'Checkers', item: 'https://cryptowalletsx.com/checker' },
          { '@type': 'ListItem', position: 3, name: 'Soneium Badges', item: 'https://cryptowalletsx.com/soneium-badge-checker' }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'How do I check my Soneium badges?', acceptedAnswer: { '@type': 'Answer', text: 'Enter your Ethereum wallet address and the checker will scan for both OG badges (ERC-1155) and ecosystem partner badges (ERC-721) on the Soneium network.' } },
          { '@type': 'Question', name: 'What are Soneium OG badges?', acceptedAnswer: { '@type': 'Answer', text: 'OG badges are ERC-1155 tokens that recognize early adopters of the Soneium network. There are two types: the original OG Badge and the Premium OG Badge.' } },
          { '@type': 'Question', name: 'Do I need to connect my wallet?', acceptedAnswer: { '@type': 'Answer', text: 'No wallet connection is required. Simply paste any Ethereum address and we read public on-chain data from the Alchemy NFT API to verify badge ownership.' } }
        ]
      }
    ]
  }}
/>

<div class="min-h-screen flex flex-col bg-background">
  <HomeHeader />

  <!-- Static SEO Content for Crawlers -->
  <div class="sr-only" aria-hidden="true">
    <h2>About Soneium Badge Checker</h2>
    <p>The Soneium Badge Checker scans your wallet for OG badges and ecosystem partner badges on the Soneium blockchain. Soneium is an Ethereum Layer 2 network developed by Sony Block Solutions Labs. Badges are NFT-based achievements that signal your participation in the Soneium ecosystem, from OG early adopter recognition to partnerships with DeFi protocols, NFT platforms, and bridge services.</p>
    <h2>Types of Soneium Badges</h2>
    <p>There are two categories of Soneium badges. OG Badges (ERC-1155) include the original Soneium OG Badge and the Premium OG Badge, which recognize early adopters of the network. Ecosystem Badges (ERC-721) include over 30 partner badges from projects like Velodrome, Quickswap, SoneFi, Layer3, Owlto, and many more. Each badge represents a specific partnership or achievement within the Soneium ecosystem.</p>
    <h2>How to Check Your Badges</h2>
    <p>Enter your Ethereum wallet address to instantly see which Soneium badges you own. The checker queries the Alchemy NFT API to verify ownership of both OG and ecosystem badges. Results show your total badge count, ownership percentage, and rarity tier classification. No wallet connection is required — we only read public on-chain data.</p>
    <h2>Rarity Tier System</h2>
    <p>Your badge collection is classified into five rarity tiers: Newcomer (0%), Explorer (1-25%), Collector (26-50%), Champion (51-75%), and Legend (76-100%). The percentage is based on how many of the total available badges your wallet holds. Collecting more badges from different ecosystem partners increases your tier and signals broader engagement with the Soneium network.</p>
  </div>

  <main class="flex-1">
    <!-- Premium Hero Section -->
    <section class="relative overflow-hidden">
      <!-- Animated gradient background -->
      <div class="absolute inset-0 bg-gradient-to-br from-purple-600/8 via-violet-500/5 to-fuchsia-500/8"></div>
      <div class="absolute inset-0 soneium-hero-gradient animated-gradient-bg"></div>

      <!-- Large blurred orbs -->
      <div class="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/12 to-violet-500/8 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-fuchsia-500/8 to-purple-500/12 rounded-full blur-[100px]"></div>

      <!-- Floating decorative shapes -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-12 left-[8%] w-16 h-16 border border-purple-500/20 rounded-2xl float-animation rotate-12"></div>
        <div class="absolute top-20 right-[10%] w-12 h-12 border border-violet-500/20 rounded-full float-slow-animation"></div>
        <div class="absolute bottom-24 left-[20%] w-8 h-8 bg-purple-500/10 rounded-lg float-animation" style="animation-delay:2s"></div>
        <div class="absolute top-40 left-[65%] w-10 h-10 bg-fuchsia-500/8 rounded-full float-slow-animation" style="animation-delay:1s"></div>
        <div class="absolute top-60 left-[40%] w-6 h-6 border border-violet-400/15 rounded-md float-animation" style="animation-delay:3s"></div>
        <div class="absolute bottom-16 right-[30%] w-14 h-14 border border-purple-400/10 rounded-xl float-slow-animation rotate-45" style="animation-delay:1.5s"></div>
        <!-- Sparkle dots -->
        <div class="absolute top-16 left-[50%] w-2 h-2 bg-purple-400/30 rounded-full float-animation" style="animation-delay:0.5s"></div>
        <div class="absolute top-32 left-[75%] w-1.5 h-1.5 bg-violet-400/25 rounded-full float-slow-animation" style="animation-delay:2.5s"></div>
        <div class="absolute bottom-32 left-[55%] w-2 h-2 bg-fuchsia-400/20 rounded-full float-animation" style="animation-delay:1.2s"></div>
      </div>

      <div class="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 text-center">
        <div
          class="transition-all duration-700 ease-out"
          class:opacity-0={!isAnimated}
          class:translate-y-8={!isAnimated}
          class:opacity-100={isAnimated}
          class:translate-y-0={isAnimated}
        >
          <!-- Badge pill -->
          <div class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-500/10 border border-purple-500/25 mb-8 backdrop-blur-sm">
            <Sparkles class="w-4 h-4 text-purple-400" />
            <span class="text-sm font-semibold bg-gradient-to-r from-purple-300 to-violet-300 bg-clip-text text-transparent">Badge Collection Showcase</span>
          </div>

          <!-- Main heading -->
          <h1 class="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-6">
            <span class="bg-gradient-to-r from-purple-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">Soneium</span>
            <br class="sm:hidden" />
            <span class="bg-gradient-to-r from-violet-300 via-purple-300 to-fuchsia-400 bg-clip-text text-transparent"> Badge Checker</span>
          </h1>

          <p class="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Discover your on-chain achievements. Check which Soneium OG and ecosystem badges your wallet holds and unlock your rarity tier.
          </p>

          <!-- Address Input - Premium style -->
          <div class="max-w-2xl mx-auto">
            <div class="relative p-1 rounded-2xl bg-gradient-to-r from-purple-500/30 via-violet-500/30 to-fuchsia-500/30">
              <div class="flex flex-col sm:flex-row gap-3 p-2 rounded-xl bg-background/90 backdrop-blur-xl">
                <div class="relative flex-1">
                  <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                  <input
                    type="text"
                    bind:value={inputAddress}
                    onkeydown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                    placeholder="Enter wallet address (0x...)"
                    aria-label="Enter wallet address"
                    class="w-full pl-11 pr-4 h-12 bg-card/60 border border-purple-500/20 backdrop-blur-xl rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all"
                  />
                </div>
                <button
                  onclick={handleSubmit}
                  disabled={isLoading}
                  class="h-12 px-8 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {#if isLoading}
                    <Loader2 class="w-4 h-4 animate-spin" />
                    Checking...
                  {:else}
                    <Shield class="w-4 h-4" />
                    Check Badges
                  {/if}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Error -->
    {#if error && !isLoading}
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
        <div class="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center backdrop-blur-xl">
          <AlertCircle class="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p class="text-sm text-red-400">{error}</p>
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
    {#if isLoading}
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div class="flex flex-col items-center justify-center py-24">
          <div class="relative mb-6">
            <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center animate-pulse">
              <Loader2 class="w-10 h-10 text-white animate-spin" />
            </div>
            <div class="absolute -inset-2 rounded-3xl bg-gradient-to-r from-purple-500/20 to-violet-500/20 blur-lg animate-pulse"></div>
          </div>
          <p class="text-xl font-bold mb-2">Scanning Badges...</p>
          <p class="text-sm text-muted-foreground">Querying Alchemy NFT API for {ECOSYSTEM_BADGES.length + OG_BADGES.length} badges</p>
        </div>
      </div>
    {/if}

    <!-- Results -->
    {#if isLoaded && !isLoading}
      <!-- Address Bar -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card/60 border border-purple-500/20 backdrop-blur-xl">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Shield class="w-6 h-6 text-white" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground font-medium">Soneium Address</p>
              <div class="flex items-center gap-2">
                <p class="text-sm font-mono font-semibold">{truncateAddress(address)}</p>
                <button onclick={copyAddr} class="text-muted-foreground hover:text-foreground transition-colors" aria-label="Copy address">
                  {#if copiedAddress}
                    <Check class="w-3.5 h-3.5 text-emerald-500" />
                  {:else}
                    <CopyIcon class="w-3.5 h-3.5" />
                  {/if}
                </button>
              </div>
            </div>
          </div>
          <button
            onclick={shareOnTwitter}
            class="h-10 px-5 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 text-white text-sm font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            aria-label="Share on Twitter"
          >
            <Share2 class="w-4 h-4" />
            Share on Twitter
          </button>
        </div>
      </div>

      <!-- Rarity Tier + Circular Progress + Stats Row -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
        <div class="p-6 sm:p-8 rounded-2xl bg-gradient-to-br {currentTier.bgGradient} border {currentTier.borderColor} backdrop-blur-xl">
          <!-- Rarity Tier Header -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/40 border {currentTier.borderColor} mb-4">
              <!-- svelte-ignore element_invalid_self_closing_tag -->
              {#if currentTier.name === 'Newcomer'}
                <Star class="w-4 h-4 {currentTier.textColor}" />
              {:else if currentTier.name === 'Explorer'}
                <Flame class="w-4 h-4 {currentTier.textColor}" />
              {:else if currentTier.name === 'Collector'}
                <Gem class="w-4 h-4 {currentTier.textColor}" />
              {:else if currentTier.name === 'Champion'}
                <Trophy class="w-4 h-4 {currentTier.textColor}" />
              {:else}
                <Crown class="w-4 h-4 {currentTier.textColor}" />
              {/if}
              <span class="text-sm font-bold {currentTier.textColor} uppercase tracking-wider">{currentTier.name} Tier</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-black mb-1">Badge Collection</h2>
            <p class="text-sm text-muted-foreground">Your on-chain achievement rank</p>
          </div>

          <div class="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <!-- Circular Progress Indicator -->
            <div class="relative flex-shrink-0">
              <svg width="160" height="160" viewBox="0 0 120 120" class="transform -rotate-90">
                <!-- Background circle -->
                <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" stroke-width="8" class="text-secondary/30" />
                <!-- Progress circle -->
                <circle
                  cx="60" cy="60" r="54"
                  fill="none"
                  stroke={svgProgressColor}
                  stroke-width="8"
                  stroke-linecap="round"
                  stroke-dasharray={2 * Math.PI * 54}
                  stroke-dashoffset={svgProgressOffset()}
                  class="score-circle-animated transition-all duration-1000"
                />
              </svg>
              <!-- Center text -->
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-4xl font-black {currentTier.textColor}">{ownershipPercent}%</span>
                <span class="text-xs text-muted-foreground font-medium">Owned</span>
              </div>
            </div>

            <!-- Stats Cards -->
            <div class="flex-1 grid grid-cols-3 gap-4 w-full">
              <!-- Total Owned -->
              <div class="p-4 sm:p-5 rounded-2xl bg-background/50 border {currentTier.borderColor} text-center backdrop-blur-sm">
                <div class="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
                  <Award class="w-5 h-5 text-purple-400" />
                </div>
                <p class="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">{totalOwned}</p>
                <p class="text-xs text-muted-foreground mt-1 font-medium">of {totalBadges} Total</p>
                <div class="mt-3 h-2 rounded-full bg-secondary/60 overflow-hidden">
                  <div class="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-500 transition-all duration-1000" style="width: {ownershipPercent}%"></div>
                </div>
              </div>

              <!-- OG Badges -->
              <div class="p-4 sm:p-5 rounded-2xl bg-background/50 border border-amber-500/20 text-center backdrop-blur-sm">
                <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                  <Crown class="w-5 h-5 text-amber-400" />
                </div>
                <p class="text-3xl sm:text-4xl font-black text-amber-400">{ogOwnedCount}</p>
                <p class="text-xs text-muted-foreground mt-1 font-medium">of {ogTotalCount} OG</p>
                <div class="mt-3 h-2 rounded-full bg-secondary/60 overflow-hidden">
                  <div class="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-1000" style="width: {ogTotalCount > 0 ? (ogOwnedCount / ogTotalCount * 100) : 0}%"></div>
                </div>
              </div>

              <!-- Ecosystem Badges -->
              <div class="p-4 sm:p-5 rounded-2xl bg-background/50 border border-emerald-500/20 text-center backdrop-blur-sm">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <Star class="w-5 h-5 text-emerald-400" />
                </div>
                <p class="text-3xl sm:text-4xl font-black text-emerald-400">{ecoOwnedCount}</p>
                <p class="text-xs text-muted-foreground mt-1 font-medium">of {ecoTotalCount} Eco</p>
                <div class="mt-3 h-2 rounded-full bg-secondary/60 overflow-hidden">
                  <div class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-1000" style="width: {ecoTotalCount > 0 ? (ecoOwnedCount / ecoTotalCount * 100) : 0}%"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Rarity Tier Breakdown -->
          <div class="mt-6 pt-6 border-t border-border/20">
            <div class="flex flex-wrap justify-center gap-2">
              {#each RARITY_TIERS as tierInfo}
                {@const isCurrent = currentTier.name === tierInfo.tier.name}
                <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all {
                  isCurrent ? tierInfo.tier.borderColor + ' ' + tierInfo.tier.bgGradient + ' ring-1 ring-current' : 'bg-background/30 border border-border/20 text-muted-foreground'
                }" style={isCurrent ? `color: var(--tw-${tierInfo.tier.color}-400, currentColor)` : ''}>
                  {#if tierInfo.tier.name === 'Newcomer'}
                    <Star class="w-3 h-3" />
                  {:else if tierInfo.tier.name === 'Explorer'}
                    <Flame class="w-3 h-3" />
                  {:else if tierInfo.tier.name === 'Collector'}
                    <Gem class="w-3 h-3" />
                  {:else if tierInfo.tier.name === 'Champion'}
                    <Trophy class="w-3 h-3" />
                  {:else}
                    <Crown class="w-3 h-3" />
                  {/if}
                  <span>{tierInfo.tier.name}</span>
                  <span class="text-muted-foreground/50">{tierInfo.min === 0 && tierInfo.max === 0 ? '0%' : tierInfo.min + '-' + tierInfo.max + '%'}</span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Tabs + Search -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <!-- Tabs -->
          <div class="flex gap-2">
            {#each ['All', 'Owned', 'Not Owned'] as tab}
              {@const isActive = activeFilter === tab}
              {@const count = tab === 'All' ? totalBadges : tab === 'Owned' ? totalOwned : totalBadges - totalOwned}
              <button
                onclick={() => activeFilter = tab as FilterTab}
                class="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 {
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-card/60 border border-border/40 text-muted-foreground hover:text-foreground hover:bg-card/80 backdrop-blur-sm'
                }"
              >
                {tab}
                <span class="ml-1.5 text-xs {isActive ? 'text-white/70' : 'text-muted-foreground'}">({count})</span>
              </button>
            {/each}
          </div>

          <!-- Search -->
          <div class="relative w-full sm:w-64">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-400 pointer-events-none" />
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Search badges..."
              aria-label="Search badges"
              class="w-full pl-9 pr-3 h-10 bg-card/60 border border-purple-500/20 backdrop-blur-xl rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all"
            />
          </div>
        </div>
      </div>

      <!-- OG Badges Section - LARGE cards -->
      {#if filteredOGBadges.length > 0}
        <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
          <div class="rounded-2xl border border-amber-500/25 bg-card/40 backdrop-blur-xl overflow-hidden">
            <div class="px-6 py-5 border-b border-amber-500/15 bg-gradient-to-r from-amber-500/5 via-yellow-500/5 to-orange-500/5">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                  <Crown class="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 class="text-lg font-bold text-amber-300">OG Badges</h2>
                  <p class="text-xs text-muted-foreground">ERC-1155 · Original Soneium achievements</p>
                </div>
                <span class="ml-auto text-sm px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                  {ogOwnedCount}/{ogTotalCount}
                </span>
              </div>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {#each filteredOGBadges as badge}
                  <div class="relative group">
                    <!-- Gradient border wrapper for owned badges -->
                    {#if badge.owned}
                      <div class="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-amber-500/40 via-yellow-500/40 to-orange-500/40 opacity-100 transition-opacity"></div>
                    {/if}
                    <div class="relative flex items-center gap-5 p-5 rounded-2xl bg-background/80 backdrop-blur-xl border {badge.owned ? 'border-amber-500/20' : 'border-border/30'} transition-all duration-300 {badge.owned ? 'shadow-lg shadow-amber-500/10' : ''}">
                      <!-- Badge Image - LARGE -->
                      <div class="w-20 h-20 rounded-xl bg-secondary/30 flex items-center justify-center overflow-hidden shrink-0 {badge.owned ? 'ring-2 ring-amber-500/30' : ''}">
                        {#if badge.image}
                          <img src={badge.image} alt={badge.name} class="w-full h-full object-cover" loading="lazy" />
                        {:else}
                          <Award class="w-10 h-10 text-amber-400/40" />
                        {/if}
                      </div>
                      <!-- Info -->
                      <div class="flex-1 min-w-0">
                        <p class="text-base font-bold mb-1">{badge.name}</p>
                        <p class="text-xs text-muted-foreground mb-3">Token ID: {badge.tokenId}</p>
                        <!-- Status badge -->
                        {#if badge.owned}
                          <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                            <CheckCircle2 class="w-3.5 h-3.5" />
                            <span class="text-xs font-bold">Owned</span>
                          </div>
                        {:else}
                          <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                            <XCircle class="w-3.5 h-3.5" />
                            <span class="text-xs font-bold">Missing</span>
                          </div>
                        {/if}
                      </div>
                      <!-- Glow for owned -->
                      {#if badge.owned}
                        <div class="absolute -inset-1 rounded-2xl bg-amber-500/5 blur-xl group-hover:bg-amber-500/10 transition-all pointer-events-none"></div>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Ecosystem Badges Section - Grid with glow effects -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
        <div class="rounded-2xl border border-emerald-500/25 bg-card/40 backdrop-blur-xl overflow-hidden">
          <div class="px-6 py-5 border-b border-emerald-500/15 bg-gradient-to-r from-emerald-500/5 via-green-500/5 to-teal-500/5">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Star class="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-emerald-300">Ecosystem Badges</h2>
                <p class="text-xs text-muted-foreground">ERC-721 · Soneium partner achievements</p>
              </div>
              <span class="ml-auto text-sm px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                {ecoOwnedCount}/{ecoTotalCount}
              </span>
            </div>
          </div>
          <div class="p-4 sm:p-6">
            {#if filteredEcosystemBadges.length > 0}
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[700px] overflow-y-auto custom-scrollbar pr-1">
                {#each filteredEcosystemBadges as badge}
                  <a
                    href={getBlockscoutUrl(badge.contract, badge.tokenId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="block group"
                  >
                    <div class="relative">
                      <!-- Gradient border for owned badges -->
                      {#if badge.owned}
                        <div class="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-emerald-500/40 via-purple-500/40 to-violet-500/40 opacity-100 transition-opacity"></div>
                      {/if}
                      <div class="relative flex items-start gap-3 p-4 rounded-xl bg-background/80 backdrop-blur-xl border {badge.owned ? 'border-emerald-500/20 shadow-lg shadow-emerald-500/10' : 'border-border/30'} transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl {badge.owned ? 'group-hover:shadow-emerald-500/20' : 'group-hover:shadow-purple-500/10'}">
                        <!-- Badge Image -->
                        <div class="w-14 h-14 rounded-lg bg-secondary/30 flex items-center justify-center overflow-hidden shrink-0 {badge.owned ? 'ring-2 ring-emerald-500/30' : ''}">
                          {#if badge.image}
                            <img src={badge.image} alt={badge.name} class="w-full h-full object-cover" loading="lazy" />
                          {:else}
                            <Star class="w-7 h-7 text-emerald-400/40" />
                          {/if}
                        </div>
                        <!-- Info -->
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-bold truncate mb-1">{badge.name}</p>
                          <p class="text-[10px] text-muted-foreground font-mono truncate">{truncateAddress(badge.contract)}</p>
                          <div class="mt-2">
                            {#if badge.owned}
                              <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 class="w-3 h-3" />
                                <span class="text-[10px] font-bold">Owned</span>
                              </div>
                            {:else}
                              <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                                <XCircle class="w-3 h-3" />
                                <span class="text-[10px] font-bold">Missing</span>
                              </div>
                            {/if}
                          </div>
                        </div>
                        <!-- Glow for owned -->
                        {#if badge.owned}
                          <div class="absolute -inset-1 rounded-xl bg-emerald-500/5 blur-xl group-hover:bg-emerald-500/10 transition-all pointer-events-none"></div>
                        {/if}
                      </div>
                    </div>
                  </a>
                {/each}
              </div>
            {:else}
              <div class="text-center py-12">
                <Star class="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <p class="text-sm text-muted-foreground font-medium">No badges match your filters</p>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Share Section -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
        <div class="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-purple-500/5 via-violet-500/5 to-fuchsia-500/5 border border-purple-500/20 text-center backdrop-blur-xl">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 mb-4">
            <Share2 class="w-6 h-6 text-purple-400" />
          </div>
          <h3 class="text-xl font-bold mb-2">Share Your Collection</h3>
          <p class="text-sm text-muted-foreground mb-5">Show off your Soneium badge collection and rarity tier</p>
          <button
            onclick={shareOnTwitter}
            class="h-11 px-8 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/30 transition-all mx-auto"
            aria-label="Share on Twitter"
          >
            <Share2 class="w-4 h-4" />
            Share on Twitter
          </button>
        </div>
      </div>

      <!-- Collapsible Info Section -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        <div class="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden">
          <button
            onclick={() => infoExpanded = !infoExpanded}
            class="w-full flex items-center justify-between p-5 hover:bg-card/60 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Info class="w-5 h-5 text-purple-400" />
              </div>
              <div class="text-left">
                <h3 class="text-base font-bold">What Are Soneium Ecosystem Badges?</h3>
                <p class="text-xs text-muted-foreground mt-0.5">Learn about badge types and rarity tiers</p>
              </div>
            </div>
            <div class="shrink-0 w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center">
              {#if infoExpanded}
                <ChevronUp class="w-4 h-4 text-muted-foreground" />
              {:else}
                <ChevronDown class="w-4 h-4 text-muted-foreground" />
              {/if}
            </div>
          </button>
          {#if infoExpanded}
            <div class="px-5 pb-5 pt-0">
              <div class="prose prose-sm prose-invert max-w-none text-muted-foreground space-y-4">
                <p>
                  Soneium ecosystem badges are NFT-based achievements on the Soneium blockchain (Ethereum L2 by Sony Block Solutions Labs). They represent your participation and engagement across various protocols and platforms in the Soneium ecosystem.
                </p>

                <!-- Rarity Tier Info -->
                <div class="not-prose p-4 rounded-xl bg-purple-500/5 border border-purple-500/15">
                  <h4 class="text-sm font-bold text-purple-300 mb-3 flex items-center gap-2">
                    <Sparkles class="w-4 h-4" />
                    Rarity Tiers
                  </h4>
                  <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {#each RARITY_TIERS as tierInfo}
                      <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 border border-border/20">
                        {#if tierInfo.tier.name === 'Newcomer'}
                          <Star class="w-3.5 h-3.5 {tierInfo.tier.textColor}" />
                        {:else if tierInfo.tier.name === 'Explorer'}
                          <Flame class="w-3.5 h-3.5 {tierInfo.tier.textColor}" />
                        {:else if tierInfo.tier.name === 'Collector'}
                          <Gem class="w-3.5 h-3.5 {tierInfo.tier.textColor}" />
                        {:else if tierInfo.tier.name === 'Champion'}
                          <Trophy class="w-3.5 h-3.5 {tierInfo.tier.textColor}" />
                        {:else}
                          <Crown class="w-3.5 h-3.5 {tierInfo.tier.textColor}" />
                        {/if}
                        <div>
                          <p class="text-xs font-bold {tierInfo.tier.textColor}">{tierInfo.tier.name}</p>
                          <p class="text-[10px] text-muted-foreground">{tierInfo.min === 0 && tierInfo.max === 0 ? '0%' : tierInfo.min + '-' + tierInfo.max + '%'}</p>
                        </div>
                      </div>
                    {/each}
                  </div>
                </div>

                <div class="grid sm:grid-cols-2 gap-4 not-prose">
                  <div class="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                    <h4 class="text-sm font-bold text-amber-300 mb-2 flex items-center gap-2">
                      <Crown class="w-4 h-4" />
                      OG Badges (ERC-1155)
                    </h4>
                    <p class="text-xs text-muted-foreground">
                      The OG Badge and Premium OG Badge are ERC-1155 tokens from the official Soneium contract. They were awarded to early adopters and active community members during the Soneium launch period.
                    </p>
                  </div>
                  <div class="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                    <h4 class="text-sm font-bold text-emerald-300 mb-2 flex items-center gap-2">
                      <Star class="w-4 h-4" />
                      Ecosystem Badges (ERC-721)
                    </h4>
                    <p class="text-xs text-muted-foreground">
                      Each ecosystem badge is an ERC-721 NFT from a different Soneium partner protocol. These include DeFi platforms, NFT marketplaces, bridges, and other dApps. Holding these badges may qualify you for future airdrops or rewards.
                    </p>
                  </div>
                </div>
                <p class="text-xs text-muted-foreground/70">
                  Badge data is fetched from the Alchemy NFT API. Results reflect on-chain ownership at the time of checking. This tool is for informational purposes only and is not financial advice.
                </p>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </main>

  <!-- Static SEO Content for Indexing -->
  <section class="max-w-5xl mx-auto px-4 sm:px-6 py-16 bg-card/30">
    <h2 class="text-2xl sm:text-3xl font-bold mb-6">About Soneium Badge Checker</h2>
    <p class="text-muted-foreground mb-4 leading-relaxed">The Soneium Badge Checker lets you verify which Soneium OG and ecosystem badges your wallet holds. Soneium badges are on-chain NFT achievements that demonstrate your participation in the Soneium ecosystem, from early adoption badges to partner protocol engagement.</p>

    <h3 class="text-xl font-bold mb-3 mt-8">Badge Types</h3>
    <p class="text-muted-foreground mb-2 leading-relaxed"><strong class="text-foreground">OG Badges (ERC-1155):</strong> The original Soneium achievement badges, including the standard OG Badge and the Premium OG Badge. These represent early participation in the Soneium network.</p>
    <p class="text-muted-foreground mb-2 leading-relaxed"><strong class="text-foreground">Ecosystem Badges (ERC-721):</strong> Over 30 partner badges from projects building on Soneium, including SoneFi, Velodrome, Quickswap, Layer3, Owlto, and more. Each represents interaction with a specific dApp or protocol.</p>

    <h3 class="text-xl font-bold mb-3 mt-8">How to Check Badges</h3>
    <p class="text-muted-foreground mb-4 leading-relaxed">Enter your Soneium wallet address (0x...) in the search field above. The checker queries the Alchemy NFT API to scan all known badge contracts and displays which ones you own. You can filter by owned, not owned, or search for specific badges. Your rarity tier is calculated based on the percentage of total badges you hold.</p>

    <h3 class="text-xl font-bold mb-3 mt-8">Frequently Asked Questions</h3>
    <div class="space-y-4">
      <div>
        <h4 class="font-semibold text-foreground mb-1">How do I get Soneium badges?</h4>
        <p class="text-sm text-muted-foreground">OG badges were distributed to early Soneium users. Ecosystem badges are earned by interacting with partner protocols like SoneFi, Velodrome, and others on the Soneium network.</p>
      </div>
      <div>
        <h4 class="font-semibold text-foreground mb-1">What is the rarity tier?</h4>
        <p class="text-sm text-muted-foreground">Your tier (Newcomer, Explorer, Collector, Champion, Legend) is based on the percentage of total available badges you own. Legend tier requires 76-100% ownership.</p>
      </div>
      <div>
        <h4 class="font-semibold text-foreground mb-1">Is my data safe?</h4>
        <p class="text-sm text-muted-foreground">We only read public on-chain data. No wallet connection or private keys needed — just paste your address and we check the blockchain for badge ownership.</p>
      </div>
    </div>

    <h3 class="text-xl font-bold mb-3 mt-8">Related Tools</h3>
    <div class="grid sm:grid-cols-3 gap-3">
      <a href="/soneium" class="p-3 rounded-xl bg-card/60 border border-border/40 hover:border-purple-500/30 transition-all">
        <span class="font-medium text-sm">Soneium Wallet Score</span>
        <p class="text-xs text-muted-foreground mt-1">Complete wallet analytics</p>
      </a>
      <a href="/base" class="p-3 rounded-xl bg-card/60 border border-border/40 hover:border-blue-500/30 transition-all">
        <span class="font-medium text-sm">Base Stats</span>
        <p class="text-xs text-muted-foreground mt-1">Coinbase L2 analytics</p>
      </a>
      <a href="/checker" class="p-3 rounded-xl bg-card/60 border border-border/40 hover:border-cyan-500/30 transition-all">
        <span class="font-medium text-sm">All Checkers</span>
        <p class="text-xs text-muted-foreground mt-1">Browse all tools</p>
      </a>
    </div>
  </section>

  <Footer />
</div>

<style>
  .soneium-hero-gradient {
    background:
      radial-gradient(at 20% 20%, rgba(168, 85, 247, 0.12) 0%, transparent 50%),
      radial-gradient(at 80% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
      radial-gradient(at 50% 80%, rgba(217, 70, 239, 0.1) 0%, transparent 50%);
  }
</style>
