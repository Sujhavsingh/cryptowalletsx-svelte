<script lang="ts">
  import { genlayerWalletStore } from '$lib/stores/wallet.svelte';
  import { fetchBlockscoutData } from '$lib/utils/api';
  import HomeScreen from '$lib/components/genlayer/HomeScreen.svelte';
  import WalletScreen from '$lib/components/genlayer/WalletScreen.svelte';
  import { GENLAYER_CONFIG } from '$lib/utils/constants';
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
    if (!genlayerWalletStore.address) return;
    isLoading = true;
    fetchError = null;
    try {
      const result = await fetchBlockscoutData(genlayerWalletStore.address, GENLAYER_CONFIG);
      addressDetails = result.addressDetails;
      transactions = result.transactions;
      tokenTransfers = result.tokenTransfers;
      tokenBalances = result.tokenBalances;
      nfts = result.nfts;
      allTokens = result.allTokens;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        fetchError = `Request timed out. The ${GENLAYER_CONFIG.name} API is taking too long to respond. Please try again.`;
      } else {
        fetchError = err?.message || `Failed to load wallet data from ${GENLAYER_CONFIG.name}. Please check the address and try again.`;
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
    if (genlayerWalletStore.address) {
      fetchAllData();
    }
  });
</script>

<SEO
  title="GenLayer Wallet Checker | Bradbury Stats"
  description="Analyze GenLayer Bradbury wallet stats, GEN token activity, and intelligent contract interactions. Free analytics for the AI-powered consensus chain."
  keywords={["genlayer", "genlayer wallet checker", "ai blockchain", "intelligent contracts", "genlayer bradbury", "genlayer stats", "ai consensus"]}
  canonicalUrl="https://cryptowalletsx.com/genlayer"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'GenLayer Wallet Checker',
        url: 'https://cryptowalletsx.com/genlayer',
        description: 'Analyze GenLayer Bradbury wallet stats, GEN token activity, and intelligent contract interactions on the AI-powered consensus chain.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
          { '@type': 'ListItem', position: 2, name: 'Checkers', item: 'https://cryptowalletsx.com/checker' },
          { '@type': 'ListItem', position: 3, name: 'GenLayer', item: 'https://cryptowalletsx.com/genlayer' }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'What is GenLayer?', acceptedAnswer: { '@type': 'Answer', text: 'GenLayer is an AI-powered blockchain platform using intelligent contracts written in Python, with a unique validator network that incorporates AI consensus mechanisms.' } },
          { '@type': 'Question', name: 'Is the GenLayer checker free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, it is completely free. Paste any GenLayer Bradbury testnet address to see wallet analytics.' } },
          { '@type': 'Question', name: 'What are intelligent contracts?', acceptedAnswer: { '@type': 'Answer', text: 'Intelligent contracts on GenLayer are smart contracts written in Python that can incorporate AI models and decision-making logic directly into their execution.' } },
          { '@type': 'Question', name: 'What is the Bradbury testnet?', acceptedAnswer: { '@type': 'Answer', text: 'Bradbury is the public testnet for GenLayer, allowing developers to deploy and test intelligent contracts with testnet GEN tokens.' } }
        ]
      }
    ]
  }}
/>

{#if genlayerWalletStore.address}
  <WalletScreen
    address={genlayerWalletStore.address}
    activeTab={genlayerWalletStore.activeTab}
    onTabChange={(tab) => genlayerWalletStore.setActiveTab(tab)}
    onReset={() => genlayerWalletStore.reset()}
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
  <HomeScreen onAddressSubmit={(addr) => genlayerWalletStore.setAddress(addr)} />
{/if}

