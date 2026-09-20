<script lang="ts">
  import { inkWalletStore } from '$lib/stores/wallet.svelte';
  import { fetchBlockscoutData } from '$lib/utils/api';
  import HomeScreen from '$lib/components/ink/HomeScreen.svelte';
  import WalletScreen from '$lib/components/ink/WalletScreen.svelte';
  import { INK_CONFIG } from '$lib/utils/constants';
  import SEO from '$lib/components/SEO.svelte';
  import type { AddressDetails, Transaction, TokenTransfer, TokenBalance, NFTItem, AllToken } from '$lib/types';

  // Data state managed at the route page level
  let isLoading = $state(false);
  let fetchError = $state<string | null>(null);
  let isRefreshing = $state(false);
  let addressDetails = $state<AddressDetails | null>(null);
  let transactions = $state<Transaction[]>([]);
  let tokenTransfers = $state<TokenTransfer[]>([]);
  let tokenBalances = $state<TokenBalance[]>([]);
  let nfts = $state<NFTItem[]>([]);
  let allTokens = $state<AllToken[]>([]);

  async function fetchAllData() {
    if (!inkWalletStore.address) return;
    isLoading = true;
    fetchError = null;
    try {
      const result = await fetchBlockscoutData(inkWalletStore.address, INK_CONFIG);
      addressDetails = result.addressDetails;
      transactions = result.transactions;
      tokenTransfers = result.tokenTransfers;
      tokenBalances = result.tokenBalances;
      nfts = result.nfts;
      allTokens = result.allTokens;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        fetchError = `Request timed out. The ${INK_CONFIG.name} API is taking too long to respond. Please try again.`;
      } else {
        fetchError = err?.message || `Failed to load wallet data from ${INK_CONFIG.name}. Please check the address and try again.`;
      }
    } finally {
      isLoading = false;
    }
  }

  async function handleRetry() {
    await fetchAllData();
  }

  async function handleRefresh() {
    isRefreshing = true;
    await fetchAllData();
    isRefreshing = false;
  }

  $effect(() => {
    if (inkWalletStore.address) {
      fetchAllData();
    }
  });
</script>

<SEO
  title="Ink Wallet Checker | Real-Time Blockchain Analytics"
  description="Check any Ink wallet score, ETH balance, transaction history & DeFi activity. Free real-time on-chain analytics for Kraken's Ink Ethereum L2."
  keywords={["ink chain", "ink wallet checker", "kraken ink", "ink stats", "ink l2 analytics", "ink wallet score", "ink explorer", "ink on-chain data"]}
  canonicalUrl="https://cryptowalletsx.com/ink"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Ink Wallet Checker',
        url: 'https://cryptowalletsx.com/ink',
        description: 'Analyze Ink mainnet wallet stats, scores, and ETH balance on Kraken\'s Ethereum L2.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
          { '@type': 'ListItem', position: 2, name: 'Checkers', item: 'https://cryptowalletsx.com/checker' },
          { '@type': 'ListItem', position: 3, name: 'Ink', item: 'https://cryptowalletsx.com/ink' }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'Is the Ink wallet checker free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, it is fully free with no wallet connection or account needed. Paste any Ink address to view its score, ETH balance, and on-chain activity.' } },
          { '@type': 'Question', name: 'What is Ink chain?', acceptedAnswer: { '@type': 'Answer', text: 'Ink is Kraken\'s Ethereum L2 built on the OP Stack, offering cheap and fast transactions while settling on Ethereum for security. It targets Kraken\'s large exchange user base moving on-chain.' } },
          { '@type': 'Question', name: 'How is the Ink wallet score determined?', acceptedAnswer: { '@type': 'Answer', text: 'A logarithmic model scores transaction count, contract diversity, DeFi participation, volume, and consistency, rewarding varied and sustained activity over raw volume.' } },
          { '@type': 'Question', name: 'Can I see token and NFT holdings on Ink?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The checker displays native ETH, ERC-20 tokens, NFTs, and full token transfer history for any Ink address.' } },
          { '@type': 'Question', name: 'Is the checker safe to use?', acceptedAnswer: { '@type': 'Answer', text: 'It is read-only and never requests signatures or private keys. It only reads public data from the Ink block explorer.' } }
        ]
      }
    ]
  }}
/>

{#if inkWalletStore.address}
  <WalletScreen
    address={inkWalletStore.address}
    activeTab={inkWalletStore.activeTab}
    onTabChange={(tab) => inkWalletStore.setActiveTab(tab)}
    onReset={() => inkWalletStore.reset()}
    {addressDetails}
    {transactions}
    {tokenTransfers}
    {tokenBalances}
    {nfts}
    {allTokens}
    {isLoading}
    {fetchError}
    onRetry={handleRetry}
    {isRefreshing}
    onRefresh={handleRefresh}
  />
{:else}
  <HomeScreen onAddressSubmit={(addr) => inkWalletStore.setAddress(addr)} />
{/if}

