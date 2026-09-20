<script lang="ts">
  import { walletStore } from '$lib/stores/wallet.svelte';
  import { fetchBlockscoutData } from '$lib/utils/api';
  import HomeScreen from '$lib/components/arc/HomeScreen.svelte';
  import WalletScreen from '$lib/components/arc/WalletScreen.svelte';
  import { ARC_CONFIG } from '$lib/utils/constants';
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
    if (!walletStore.address) return;
    isLoading = true;
    fetchError = null;
    try {
      const result = await fetchBlockscoutData(walletStore.address, ARC_CONFIG);
      addressDetails = result.addressDetails;
      transactions = result.transactions;
      tokenTransfers = result.tokenTransfers;
      tokenBalances = result.tokenBalances;
      nfts = result.nfts;
      allTokens = result.allTokens;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        fetchError = `Request timed out. The ${ARC_CONFIG.name} API is taking too long to respond. Please try again.`;
      } else {
        fetchError = err?.message || `Failed to load wallet data from ${ARC_CONFIG.name}. Please check the address and try again.`;
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
    if (walletStore.address) {
      fetchAllData();
    }
  });
</script>

<SEO
  title="Arc Testnet Wallet Checker | Real-Time Blockchain Analytics"
  description="Check your Arc testnet wallet score, USDC balance, transaction history & DeFi activity. Free real-time analytics for Circle's USDC-native testnet."
  keywords={["arc testnet", "arc wallet checker", "usdc testnet", "circle arc stats", "arc blockchain analytics", "arc testnet explorer", "arc wallet score", "arc on-chain data"]}
  canonicalUrl="https://cryptowalletsx.com/arc"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Arc Testnet Wallet Checker',
        url: 'https://cryptowalletsx.com/arc',
        description: 'Analyze Arc Testnet wallet stats, scores, and USDC balance on Circle\'s USDC-native testnet.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
          { '@type': 'ListItem', position: 2, name: 'Checkers', item: 'https://cryptowalletsx.com/checker' },
          { '@type': 'ListItem', position: 3, name: 'Arc Testnet', item: 'https://cryptowalletsx.com/arc' }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'What is the Arc testnet wallet checker?', acceptedAnswer: { '@type': 'Answer', text: 'It is a free tool that analyzes any Arc testnet address, showing wallet score, USDC balance, transaction history, and DeFi activity on Circle\'s USDC-native testnet in real time. No wallet connection required.' } },
          { '@type': 'Question', name: 'Is Arc testnet USDC worth real money?', acceptedAnswer: { '@type': 'Answer', text: 'No. Arc is a testnet, so its USDC holds no real value. It is used for testing smart contracts, DeFi flows, and wallet interactions with near-zero gas fees.' } },
          { '@type': 'Question', name: 'How is the Arc wallet score calculated?', acceptedAnswer: { '@type': 'Answer', text: 'The score uses a logarithmic formula across transaction count, contract diversity, DeFi participation, volume, and activity consistency, so early and varied activity counts for more than raw volume.' } },
          { '@type': 'Question', name: 'Where do I get Arc testnet USDC?', acceptedAnswer: { '@type': 'Answer', text: 'You can request Arc testnet USDC from the Circle faucet at faucet.circle.com and start interacting with contracts right away.' } },
          { '@type': 'Question', name: 'Do I need to connect my wallet?', acceptedAnswer: { '@type': 'Answer', text: 'No. Simply paste any Arc testnet address to view its full analytics. The checker is read-only and never asks for a signature or private key.' } }
        ]
      }
    ]
  }}
/>

{#if walletStore.address}
  <WalletScreen
    address={walletStore.address}
    activeTab={walletStore.activeTab}
    config={ARC_CONFIG}
    onTabChange={(tab) => walletStore.setActiveTab(tab)}
    onReset={() => walletStore.reset()}
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
  <HomeScreen config={ARC_CONFIG} onAddressSubmit={(addr) => walletStore.setAddress(addr)} />
{/if}

