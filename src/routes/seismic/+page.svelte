<script lang="ts">
  import { seismicWalletStore } from '$lib/stores/wallet.svelte';
  import { fetchBlockscoutData } from '$lib/utils/api';
  import HomeScreen from '$lib/components/seismic/HomeScreen.svelte';
  import WalletScreen from '$lib/components/seismic/WalletScreen.svelte';
  import { SEISMIC_CONFIG } from '$lib/utils/constants';
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
    if (!seismicWalletStore.address) return;
    isLoading = true;
    fetchError = null;
    try {
      const result = await fetchBlockscoutData(seismicWalletStore.address, SEISMIC_CONFIG);
      addressDetails = result.addressDetails;
      transactions = result.transactions;
      tokenTransfers = result.tokenTransfers;
      tokenBalances = result.tokenBalances;
      nfts = result.nfts;
      allTokens = result.allTokens;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        fetchError = `Request timed out. The ${SEISMIC_CONFIG.name} API is taking too long to respond. Please try again.`;
      } else {
        fetchError = err?.message || `Failed to load wallet data from ${SEISMIC_CONFIG.name}. Please check the address and try again.`;
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
    if (seismicWalletStore.address) {
      fetchAllData();
    }
  });
</script>

<SEO
  title="Seismic Testnet Wallet Checker | Encrypted Blockchain Analytics"
  description="Check your Seismic testnet wallet score, ETH balance, transaction history & encrypted computations. Free analytics for the privacy-focused L2."
  keywords={["seismic testnet", "seismic wallet checker", "encrypted blockchain", "seismic l2", "privacy blockchain", "seismic blockchain analytics"]}
  canonicalUrl="https://cryptowalletsx.com/seismic"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Seismic Wallet Checker',
        url: 'https://cryptowalletsx.com/seismic',
        description: 'Analyze Seismic testnet wallet stats and encrypted computation metrics on the privacy-focused L2.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
          { '@type': 'ListItem', position: 2, name: 'Checkers', item: 'https://cryptowalletsx.com/checker' },
          { '@type': 'ListItem', position: 3, name: 'Seismic Testnet', item: 'https://cryptowalletsx.com/seismic' }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'What is Seismic?', acceptedAnswer: { '@type': 'Answer', text: 'Seismic is an encrypted computation L2 focused on privacy-preserving smart contracts and zero-knowledge proof execution.' } },
          { '@type': 'Question', name: 'Is the Seismic checker free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, it is completely free. Paste any Seismic testnet address to view its encrypted computation analytics.' } },
          { '@type': 'Question', name: 'What are encrypted computations?', acceptedAnswer: { '@type': 'Answer', text: 'Encrypted computations run smart contract logic without exposing intermediate state, enabling privacy-preserving DeFi and gaming.' } },
          { '@type': 'Question', name: 'How do I get Seismic testnet ETH?', acceptedAnswer: { '@type': 'Answer', text: 'Use the faucet at seismic-testnet.socialscan.io to request testnet ETH for transaction fees.' } }
        ]
      }
    ]
  }}
/>

{#if seismicWalletStore.address}
  <WalletScreen
    address={seismicWalletStore.address}
    activeTab={seismicWalletStore.activeTab}
    onTabChange={(tab) => seismicWalletStore.setActiveTab(tab)}
    onReset={() => seismicWalletStore.reset()}
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
  <HomeScreen onAddressSubmit={(addr) => seismicWalletStore.setAddress(addr)} />
{/if}

