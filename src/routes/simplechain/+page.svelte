<script lang="ts">
  import { simplechainWalletStore } from '$lib/stores/wallet.svelte';
  import { fetchBlockscoutData } from '$lib/utils/api';
  import HomeScreen from '$lib/components/simplechain/HomeScreen.svelte';
  import WalletScreen from '$lib/components/simplechain/WalletScreen.svelte';
  import { SIMPLECHAIN_CONFIG } from '$lib/utils/constants';
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
    if (!simplechainWalletStore.address) return;
    isLoading = true;
    fetchError = null;
    try {
      const result = await fetchBlockscoutData(simplechainWalletStore.address, SIMPLECHAIN_CONFIG);
      addressDetails = result.addressDetails;
      transactions = result.transactions;
      tokenTransfers = result.tokenTransfers;
      tokenBalances = result.tokenBalances;
      nfts = result.nfts;
      allTokens = result.allTokens;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        fetchError = `Request timed out. The ${SIMPLECHAIN_CONFIG.name} API is taking too long to respond. Please try again.`;
      } else {
        fetchError = err?.message || `Failed to load wallet data from ${SIMPLECHAIN_CONFIG.name}. Please check the address and try again.`;
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
    if (simplechainWalletStore.address) {
      fetchAllData();
    }
  });
</script>

<SEO
  title="SimpleChain Wallet Checker & Analytics"
  description="Analyze SimpleChain testnet wallet stats, SRW token balance, transactions, and DeFi activity. Free real-time analytics for SimpleChain's lightweight EVM testnet."
  keywords={["simplechain", "simplechain wallet checker", "srw token", "simplechain testnet", "simplechain stats", "simplechain blockchain", "lightweight blockchain testnet"]}
  canonicalUrl="https://cryptowalletsx.com/simplechain"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'SimpleChain Wallet Checker',
        url: 'https://cryptowalletsx.com/simplechain',
        description: 'Check SimpleChain testnet wallet stats and SRW token analytics on this lightweight EVM-compatible testnet.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
          { '@type': 'ListItem', position: 2, name: 'Checkers', item: 'https://cryptowalletsx.com/checker' },
          { '@type': 'ListItem', position: 3, name: 'SimpleChain', item: 'https://cryptowalletsx.com/simplechain' }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'What is SimpleChain?', acceptedAnswer: { '@type': 'Answer', text: 'SimpleChain is a lightweight EVM-compatible testnet designed for rapid smart contract development and testing with minimal configuration overhead.' } },
          { '@type': 'Question', name: 'Is the SimpleChain checker free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free. Paste any SimpleChain testnet address to view its full analytics profile.' } },
          { '@type': 'Question', name: 'How do I get SRW tokens?', acceptedAnswer: { '@type': 'Answer', text: 'SRW tokens can be obtained from the SimpleChain testnet faucet at testnet-explorer.simplechain.com/faucet.' } },
          { '@type': 'Question', name: 'What data does the checker show?', acceptedAnswer: { '@type': 'Answer', text: 'It shows wallet balance, transaction count, token holdings, NFTs, DeFi interactions, wallet score, and activity streaks.' } }
        ]
      }
    ]
  }}
/>

{#if simplechainWalletStore.address}
  <WalletScreen
    address={simplechainWalletStore.address}
    activeTab={simplechainWalletStore.activeTab}
    onTabChange={(tab) => simplechainWalletStore.setActiveTab(tab)}
    onReset={() => simplechainWalletStore.reset()}
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
  <HomeScreen onAddressSubmit={(addr) => simplechainWalletStore.setAddress(addr)} />
{/if}

