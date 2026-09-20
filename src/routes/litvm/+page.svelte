<script lang="ts">
  import { litvmWalletStore } from '$lib/stores/wallet.svelte';
  import { fetchBlockscoutData } from '$lib/utils/api';
  import HomeScreen from '$lib/components/litvm/HomeScreen.svelte';
  import WalletScreen from '$lib/components/litvm/WalletScreen.svelte';
  import { LITVM_CONFIG } from '$lib/utils/constants';
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
    if (!litvmWalletStore.address) return;
    isLoading = true;
    fetchError = null;
    try {
      const result = await fetchBlockscoutData(litvmWalletStore.address, LITVM_CONFIG);
      addressDetails = result.addressDetails;
      transactions = result.transactions;
      tokenTransfers = result.tokenTransfers;
      tokenBalances = result.tokenBalances;
      nfts = result.nfts;
      allTokens = result.allTokens;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        fetchError = `Request timed out. The ${LITVM_CONFIG.name} API is taking too long to respond. Please try again.`;
      } else {
        fetchError = err?.message || `Failed to load wallet data from ${LITVM_CONFIG.name}. Please check the address and try again.`;
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
    if (litvmWalletStore.address) {
      fetchAllData();
    }
  });
</script>

<SEO
  title="LitVM Wallet Checker & Blockchain Analytics"
  description="Check your LitVM testnet wallet score, zkLTC balance, transactions & DeFi activity. Free analytics for Arbitrum Nitro L2 by Caldera."
  keywords={["litvm", "zkltc", "litvm wallet checker", "caldera litvm", "arbitrum nitro testnet", "litvm blockchain analytics", "litvm wallet score"]}
  canonicalUrl="https://cryptowalletsx.com/litvm"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'LitVM Wallet Checker',
        url: 'https://cryptowalletsx.com/litvm',
        description: 'Analyze LitVM testnet wallet stats, scores, and zkLTC balance on Arbitrum Nitro L2 by Caldera.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
          { '@type': 'ListItem', position: 2, name: 'Checkers', item: 'https://cryptowalletsx.com/checker' },
          { '@type': 'ListItem', position: 3, name: 'LitVM', item: 'https://cryptowalletsx.com/litvm' }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'What is LitVM?', acceptedAnswer: { '@type': 'Answer', text: 'LitVM is an Arbitrum Nitro L2 testnet developed by Caldera, using zkLTC as its native token for testing ZK-powered applications.' } },
          { '@type': 'Question', name: 'Is the LitVM checker free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, it is fully free. Just paste any LitVM address to see comprehensive wallet analytics.' } },
          { '@type': 'Question', name: 'How do I get zkLTC testnet tokens?', acceptedAnswer: { '@type': 'Answer', text: 'Visit the Liteforge explorer at liteforge.explorer.caldera.xyz to find the faucet for testnet zkLTC.' } },
          { '@type': 'Question', name: 'What is zkLTC?', acceptedAnswer: { '@type': 'Answer', text: 'zkLTC is the native testnet token on LitVM, used for paying gas fees and interacting with smart contracts during development.' } }
        ]
      }
    ]
  }}
/>

{#if litvmWalletStore.address}
  <WalletScreen
    address={litvmWalletStore.address}
    activeTab={litvmWalletStore.activeTab}
    onTabChange={(tab) => litvmWalletStore.setActiveTab(tab)}
    onReset={() => litvmWalletStore.reset()}
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
  <HomeScreen onAddressSubmit={(addr) => litvmWalletStore.setAddress(addr)} />
{/if}

