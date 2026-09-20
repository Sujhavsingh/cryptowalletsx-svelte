<script lang="ts">
  import HomeHeader from '$lib/components/home/HomeHeader.svelte';
  import Footer from '$lib/components/home/Footer.svelte';
  import SEO from '$lib/components/SEO.svelte';
  import { CHAIN_CONFIGS } from '$lib/utils/constants';
  import { ArrowRight, BookOpen, Shield, Zap, BarChart3, Globe, Layers } from 'lucide-svelte';

  const blogArticles = [
    {
      tool: 'arc',
      title: 'Arc Mainnet Complete Guide',
      description: 'Learn how to use the Arc Mainnet wallet checker to analyze wallet score, USDC balances, transactions, and DeFi activity on Circle\'s USDC-native Layer-1.',
      gradient: 'from-cyan-500 to-teal-600',
      icon: Shield,
      category: 'Mainnet',
    },
    {
      tool: 'arc-testnet',
      title: 'Arc Testnet Complete Guide',
      description: 'Learn how to use the Arc Testnet wallet checker to analyze your wallet score, track faucet USDC transactions, and understand DeFi activity on Circle\'s USDC-native testnet.',
      gradient: 'from-cyan-500 to-teal-600',
      icon: Shield,
      category: 'Testnet',
    },
    {
      tool: 'base',
      title: 'Base Complete Guide',
      description: 'Discover how to analyze your Base mainnet wallet with our comprehensive stats checker. Track ETH transactions, DeFi protocols, and wallet scores on Coinbase\'s L2.',
      gradient: 'from-blue-500 to-indigo-600',
      icon: Shield,
      category: 'Mainnet',
    },
    {
      tool: 'ink',
      title: 'Ink Complete Guide',
      description: 'Learn how to check your Ink mainnet wallet stats, scores, and DeFi activity. Analyze your on-chain footprint on Kraken\'s Ethereum L2.',
      gradient: 'from-purple-500 to-violet-600',
      icon: Shield,
      category: 'Mainnet',
    },
    {
      tool: 'relay',
      title: 'Relay Bridge Analytics Complete Guide',
      description: 'Master cross-chain analytics with our Relay bridge checker. Track bridge transactions, swap volumes, and multi-chain activity across 80+ networks.',
      gradient: 'from-orange-500 to-amber-600',
      icon: Globe,
      category: 'Dapp',
    },
    {
      tool: 'jumper',
      title: 'Jumper Bridge Analytics Complete Guide',
      description: 'Analyze your Jumper/Li.Fi cross-chain activity. Track bridge transfers, token swaps, and protocol interactions across multiple networks.',
      gradient: 'from-indigo-500 to-purple-600',
      icon: Globe,
      category: 'Dapp',
    },
    {
      tool: 'robinhood',
      title: 'Robinhood Chain Mainnet Guide',
      description: 'Check your Robinhood Chain mainnet wallet stats, transaction history, and ETH balance analytics on the Arbitrum Orbit L2 for tokenized stocks and RWAs.',
      gradient: 'from-green-500 to-emerald-600',
      icon: Shield,
      category: 'Mainnet',
    },
    {
      tool: 'robinhood-testnet',
      title: 'Robinhood Testnet Complete Guide',
      description: 'Check your Robinhood Chain testnet wallet stats, transaction history, and testnet ETH balance analytics on the Arbitrum Orbit L2.',
      gradient: 'from-green-500 to-emerald-600',
      icon: Shield,
      category: 'Testnet',
    },
    {
      tool: 'litvm',
      title: 'LitVM Complete Guide',
      description: 'Analyze your LitVM testnet wallet with our stats checker. Track zkLTC transactions, scores, and activity on the Arbitrum Nitro L2.',
      gradient: 'from-pink-500 to-rose-600',
      icon: Shield,
      category: 'Testnet',
    },
    {
      tool: 'seismic',
      title: 'Seismic Testnet Complete Guide',
      description: 'Check your Seismic testnet wallet stats, scores, and transaction history on the encrypted computation chain.',
      gradient: 'from-emerald-500 to-green-600',
      icon: Shield,
      category: 'Testnet',
    },
    {
      tool: 'genlayer',
      title: 'GenLayer Bradbury Complete Guide',
      description: 'Analyze your GenLayer Bradbury wallet stats, AI consensus activity, and GEN token analytics on the intelligent contracts platform.',
      gradient: 'from-yellow-500 to-orange-600',
      icon: Shield,
      category: 'Testnet',
    },
    {
      tool: 'simplechain',
      title: 'SimpleChain Complete Guide',
      description: 'Check your SimpleChain testnet wallet stats, SRW token analytics, and transaction history on this lightweight blockchain.',
      gradient: 'from-cyan-500 to-teal-600',
      icon: Shield,
      category: 'Testnet',
    },
    {
      tool: 'dachain',
      title: 'DAC Quantum Chain Complete Guide',
      description: 'Analyze your DAC Quantum Chain testnet wallet stats, scores, and DAC token activity on the quantum-resistant blockchain with post-quantum cryptographic resilience.',
      gradient: 'from-red-500 to-rose-600',
      icon: Shield,
      category: 'Testnet',
    },
    {
      tool: 'doma',
      title: 'Doma Testnet Complete Guide',
      description: 'Check your Doma testnet wallet stats, ETH transaction analytics, and bridge activity on the L2 blockchain with cross-chain bridge capabilities.',
      gradient: 'from-amber-500 to-yellow-600',
      icon: Shield,
      category: 'Testnet',
    },
    {
      tool: 'soneium',
      title: 'Soneium Complete Guide',
      description: 'Analyze your Soneium mainnet wallet stats, scores, and ETH activity. Track DeFi protocols, tokens, and transactions on Sony\'s Ethereum L2.',
      gradient: 'from-violet-500 to-purple-600',
      icon: Shield,
      category: 'Mainnet',
    },
  ];
</script>

<SEO
  title="Blog - CryptoWalletsx Guides & Tutorials"
  description="In-depth guides for crypto wallet analytics tools. Learn scoring, DeFi tracking, and bridge analysis across 10+ blockchains."
  keywords={["crypto wallet blog", "blockchain analytics guide", "wallet score tutorial", "DeFi analytics guide", "bridge tracker tutorial", "wallet checker guide"]}
  canonicalUrl="https://cryptowalletsx.com/blog"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'CryptoWalletsx Blog',
    description: 'Comprehensive guides for crypto wallet analytics tools across 10+ blockchains',
    url: 'https://cryptowalletsx.com/blog',
    publisher: {
      '@type': 'Organization',
      name: 'CryptoWalletsx',
      url: 'https://cryptowalletsx.com',
    },
    blogPost: blogArticles.map(a => ({
      '@type': 'BlogPosting',
      headline: a.title,
      description: a.description,
      url: `https://cryptowalletsx.com/blog/${a.tool}`,
    })),
  }}
/>

<div class="min-h-screen flex flex-col bg-background">
  <HomeHeader />

  <main class="flex-1">
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 mesh-gradient animated-gradient-bg"></div>
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-cyan-500/8 via-purple-500/5 to-teal-500/8 rounded-full blur-3xl"></div>

      <div class="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
          <BookOpen class="w-4 h-4 text-cyan-500" />
          <span class="text-sm font-medium gradient-text">Guides & Tutorials</span>
        </div>
        <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          <span class="gradient-text">CryptoWalletsx Blog</span>
        </h1>
        <p class="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-4">
          In-depth guides for every wallet checker tool. Learn how scoring works, what data we track, and how to improve your on-chain profile.
        </p>
        <div class="flex flex-wrap justify-center gap-3">
          <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 border border-border/50 backdrop-blur-sm">
            <Layers class="w-3.5 h-3.5 text-purple-500" />
            <span class="text-sm font-medium">{blogArticles.length} Articles</span>
          </div>
          <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 border border-border/50 backdrop-blur-sm">
            <Zap class="w-3.5 h-3.5 text-amber-500" />
            <span class="text-sm font-medium">Updated Regularly</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Articles Grid -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each blogArticles as article}
          {@const Icon = article.icon}
          <a href="/blog/{article.tool}" class="block group">
            <div class="relative rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl overflow-hidden transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:shadow-cyan-500/10">
              <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r {article.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="absolute inset-0 bg-gradient-to-br {article.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300"></div>

              <div class="relative p-6">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br {article.gradient} flex items-center justify-center shadow-lg">
                    <Icon class="w-5 h-5 text-white" />
                  </div>
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full border {
                    article.category === 'Mainnet' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    article.category === 'Dapp' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                    'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                  }">
                    {article.category}
                  </span>
                </div>

                <h3 class="text-lg font-bold mb-2 transition-colors duration-200 group-hover:text-foreground">
                  {article.title}
                </h3>

                <p class="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                  {article.description}
                </p>

                <div class="flex items-center gap-1 text-sm font-medium gradient-text">
                  Read Guide
                  <ArrowRight class="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </a>
        {/each}
      </div>
    </section>
  </main>
  <Footer />
</div>

<style>
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    line-clamp: 3;
    overflow: hidden;
  }
</style>
