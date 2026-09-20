<script lang="ts">
  import { robinhoodWalletStore } from '$lib/stores/wallet.svelte';
  import { fetchBlockscoutData } from '$lib/utils/api';
  import HomeScreen from '$lib/components/arc/HomeScreen.svelte';
  import WalletScreen from '$lib/components/arc/WalletScreen.svelte';
  import { ROBINHOOD_CONFIG } from '$lib/utils/constants';
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
    if (!robinhoodWalletStore.address) return;
    isLoading = true;
    fetchError = null;
    try {
      const result = await fetchBlockscoutData(robinhoodWalletStore.address, ROBINHOOD_CONFIG);
      addressDetails = result.addressDetails;
      transactions = result.transactions;
      tokenTransfers = result.tokenTransfers;
      tokenBalances = result.tokenBalances;
      nfts = result.nfts;
      allTokens = result.allTokens;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        fetchError = `Request timed out. The ${ROBINHOOD_CONFIG.name} API is taking too long to respond. Please try again.`;
      } else {
        fetchError = err?.message || `Failed to load wallet data from ${ROBINHOOD_CONFIG.name}. Please check the address and try again.`;
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
    if (robinhoodWalletStore.address) {
      fetchAllData();
    }
  });
</script>

<SEO
  title="Robinhood Testnet Wallet Checker | Blockchain Analytics"
  description="Check your Robinhood Chain testnet wallet score, ETH balance, transactions & DeFi activity. Free real-time analytics for Robinhood's Arbitrum Orbit L2."
  keywords={["robinhood chain", "robinhood testnet", "robinhood wallet checker", "arbitrum orbit l2", "robinhood crypto stats", "robinhood blockchain analytics", "robinhood wallet score"]}
  canonicalUrl="https://cryptowalletsx.com/robinhood"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Robinhood Testnet Wallet Checker',
        url: 'https://cryptowalletsx.com/robinhood',
        description: 'Analyze Robinhood Chain testnet wallet stats, scores, and ETH balance on Arbitrum Orbit L2.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
          { '@type': 'ListItem', position: 2, name: 'Checkers', item: 'https://cryptowalletsx.com/checker' },
          { '@type': 'ListItem', position: 3, name: 'Robinhood Testnet', item: 'https://cryptowalletsx.com/robinhood' }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'What is the Robinhood Chain testnet?', acceptedAnswer: { '@type': 'Answer', text: 'Robinhood Chain is an Arbitrum Orbit L2 built by Robinhood for testing new features before mainnet launch. It uses testnet ETH with near-zero gas fees.' } },
          { '@type': 'Question', name: 'Is the Robinhood wallet checker free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Completely free — just paste any Robinhood testnet address. No account or wallet connection required.' } },
          { '@type': 'Question', name: 'How do I get Robinhood testnet ETH?', acceptedAnswer: { '@type': 'Answer', text: 'You can obtain testnet ETH from the Robinhood testnet faucet at explorer.testnet.chain.robinhood.com/faucet.' } },
          { '@type': 'Question', name: 'Can I use this on mainnet too?', acceptedAnswer: { '@type': 'Answer', text: 'This checker currently covers the Robinhood testnet. For mainnet Ethereum analysis, use our Base or other mainnet checkers.' } },
          { '@type': 'Question', name: 'Is my data private?', acceptedAnswer: { '@type': 'Answer', text: 'We only read public blockchain data. We never store, track, or share wallet addresses or transaction histories.' } }
        ]
      }
    ]
  }}
/>

{#if robinhoodWalletStore.address}
  <WalletScreen
    address={robinhoodWalletStore.address}
    activeTab={robinhoodWalletStore.activeTab}
    config={ROBINHOOD_CONFIG}
    onTabChange={(tab) => robinhoodWalletStore.setActiveTab(tab)}
    onReset={() => robinhoodWalletStore.reset()}
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
  <HomeScreen config={ROBINHOOD_CONFIG} onAddressSubmit={(addr) => robinhoodWalletStore.setAddress(addr)} />
{/if}

