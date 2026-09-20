<script lang="ts">
  import { domaWalletStore } from '$lib/stores/wallet.svelte';
  import { fetchBlockscoutData } from '$lib/utils/api';
  import HomeScreen from '$lib/components/doma/HomeScreen.svelte';
  import WalletScreen from '$lib/components/doma/WalletScreen.svelte';
  import { DOMA_CONFIG } from '$lib/utils/constants';
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
    if (!domaWalletStore.address) return;
    isLoading = true;
    fetchError = null;
    try {
      const result = await fetchBlockscoutData(domaWalletStore.address, DOMA_CONFIG);
      addressDetails = result.addressDetails;
      transactions = result.transactions;
      tokenTransfers = result.tokenTransfers;
      tokenBalances = result.tokenBalances;
      nfts = result.nfts;
      allTokens = result.allTokens;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        fetchError = `Request timed out. The ${DOMA_CONFIG.name} API is taking too long to respond. Please try again.`;
      } else {
        fetchError = err?.message || `Failed to load wallet data from ${DOMA_CONFIG.name}. Please check the address and try again.`;
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
    if (domaWalletStore.address) {
      fetchAllData();
    }
  });
</script>

<SEO
  title="Doma Testnet Wallet Checker & Bridge Stats"
  description="Check your Doma testnet wallet score, ETH balance, cross-chain bridge activity, and on-chain metrics. Free analytics for the L2 blockchain."
  keywords={["doma testnet", "doma wallet checker", "doma l2", "cross-chain bridge", "doma blockchain", "doma stats", "doma eth"]}
  canonicalUrl="https://cryptowalletsx.com/doma"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Doma Wallet Checker',
        url: 'https://cryptowalletsx.com/doma',
        description: 'Analyze Doma testnet wallet stats, scores, cross-chain bridge activity, and on-chain metrics on the L2 blockchain.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
          { '@type': 'ListItem', position: 2, name: 'Checkers', item: 'https://cryptowalletsx.com/checker' },
          { '@type': 'ListItem', position: 3, name: 'Doma', item: 'https://cryptowalletsx.com/doma' }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'What is Doma?', acceptedAnswer: { '@type': 'Answer', text: 'Doma is an Ethereum L2 testnet with integrated cross-chain bridge capabilities, allowing users to test multi-chain transfers and smart contracts.' } },
          { '@type': 'Question', name: 'Is the Doma checker free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free. Paste any Doma testnet address to analyze its on-chain activity.' } },
          { '@type': 'Question', name: 'What is cross-chain bridging?', acceptedAnswer: { '@type': 'Answer', text: 'Cross-chain bridging allows tokens and data to move between different blockchains, enabling interoperability between networks like Ethereum and Doma.' } },
          { '@type': 'Question', name: 'How do I get testnet ETH on Doma?', acceptedAnswer: { '@type': 'Answer', text: 'You can get testnet ETH from the bridge at bridge-testnet.doma.xyz or from the faucet at explorer-testnet.doma.xyz.' } }
        ]
      }
    ]
  }}
/>

{#if domaWalletStore.address}
  <WalletScreen
    address={domaWalletStore.address}
    activeTab={domaWalletStore.activeTab}
    onTabChange={(tab) => domaWalletStore.setActiveTab(tab)}
    onReset={() => domaWalletStore.reset()}
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
  <HomeScreen onAddressSubmit={(addr) => domaWalletStore.setAddress(addr)} />
{/if}

