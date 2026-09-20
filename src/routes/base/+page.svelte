<script lang="ts">
  import { baseWalletStore } from '$lib/stores/wallet.svelte';
  import { fetchBlockscoutData } from '$lib/utils/api';
  import HomeScreen from '$lib/components/base/HomeScreen.svelte';
  import WalletScreen from '$lib/components/base/WalletScreen.svelte';
  import { BASE_CONFIG } from '$lib/utils/constants';
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
    if (!baseWalletStore.address) return;
    isLoading = true;
    fetchError = null;
    try {
      const result = await fetchBlockscoutData(baseWalletStore.address, BASE_CONFIG);
      addressDetails = result.addressDetails;
      transactions = result.transactions;
      tokenTransfers = result.tokenTransfers;
      tokenBalances = result.tokenBalances;
      nfts = result.nfts;
      allTokens = result.allTokens;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        fetchError = `Request timed out. The ${BASE_CONFIG.name} API is taking too long to respond. Please try again.`;
      } else {
        fetchError = err?.message || `Failed to load wallet data from ${BASE_CONFIG.name}. Please check the address and try again.`;
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
    if (baseWalletStore.address) {
      fetchAllData();
    }
  });
</script>

<SEO
  title="Base Wallet Checker | Blockchain Analytics"
  description="Check any Base wallet score, ETH balance, transaction history & DeFi activity. Free real-time on-chain analytics for Coinbase's Base Ethereum L2."
  keywords={["base chain", "base wallet checker", "coinbase base", "base stats", "base l2 analytics", "base wallet score", "base explorer", "base on-chain data"]}
  canonicalUrl="https://cryptowalletsx.com/base"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Base Wallet Checker',
        url: 'https://cryptowalletsx.com/base',
        description: 'Analyze Base mainnet wallet stats, scores, and ETH balance on Coinbase\'s Ethereum L2.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
          { '@type': 'ListItem', position: 2, name: 'Checkers', item: 'https://cryptowalletsx.com/checker' },
          { '@type': 'ListItem', position: 3, name: 'Base', item: 'https://cryptowalletsx.com/base' }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'Is the Base wallet checker free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, it is completely free with no account or wallet connection required. Paste any Base address to instantly see its score, ETH balance, and DeFi activity.' } },
          { '@type': 'Question', name: 'What is Base?', acceptedAnswer: { '@type': 'Answer', text: 'Base is Coinbase\'s Ethereum L2 built on the OP Stack. It settles on Ethereum for security, with sub-cent fees and ~2 second confirmations, and hosts protocols like Aerodrome, Uniswap, and Aave.' } },
          { '@type': 'Question', name: 'How is my Base wallet score calculated?', acceptedAnswer: { '@type': 'Answer', text: 'A logarithmic formula weighs transaction count, contract diversity, DeFi participation, volume, and activity consistency, so consistent and varied usage scores higher than raw volume alone.' } },
          { '@type': 'Question', name: 'Does the checker track token balances on Base?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. It shows native ETH plus ERC-20 token balances, NFT holdings, and token transfer history for any Base address.' } },
          { '@type': 'Question', name: 'Is my data safe when using the checker?', acceptedAnswer: { '@type': 'Answer', text: 'The tool is read-only and never requests signatures or private keys. It reads public on-chain data from the Base block explorer only.' } }
        ]
      }
    ]
  }}
/>

{#if baseWalletStore.address}
  <WalletScreen
    address={baseWalletStore.address}
    activeTab={baseWalletStore.activeTab}
    onTabChange={(tab) => baseWalletStore.setActiveTab(tab)}
    onReset={() => baseWalletStore.reset()}
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
  <HomeScreen onAddressSubmit={(addr) => baseWalletStore.setAddress(addr)} />
{/if}

