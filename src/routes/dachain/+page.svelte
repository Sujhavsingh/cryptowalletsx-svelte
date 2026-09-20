<script lang="ts">
  import { dachainWalletStore } from '$lib/stores/wallet.svelte';
  import { fetchBlockscoutData } from '$lib/utils/api';
  import HomeScreen from '$lib/components/dachain/HomeScreen.svelte';
  import WalletScreen from '$lib/components/dachain/WalletScreen.svelte';
  import { DACHAIN_CONFIG } from '$lib/utils/constants';
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
    if (!dachainWalletStore.address) return;
    isLoading = true;
    fetchError = null;
    try {
      const result = await fetchBlockscoutData(dachainWalletStore.address, DACHAIN_CONFIG);
      addressDetails = result.addressDetails;
      transactions = result.transactions;
      tokenTransfers = result.tokenTransfers;
      tokenBalances = result.tokenBalances;
      nfts = result.nfts;
      allTokens = result.allTokens;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        fetchError = `Request timed out. The ${DACHAIN_CONFIG.name} API is taking too long to respond. Please try again.`;
      } else {
        fetchError = err?.message || `Failed to load wallet data from ${DACHAIN_CONFIG.name}. Please check the address and try again.`;
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
    if (dachainWalletStore.address) {
      fetchAllData();
    }
  });
</script>

<SEO
  title="DAC Quantum Chain Wallet Checker"
  description="Check your DAC Quantum Chain wallet score, DAC token balance, and post-quantum crypto activity. Free analytics for the quantum-resistant L2 testnet."
  keywords={["dachain", "dac quantum chain", "dac wallet checker", "quantum resistant blockchain", "post-quantum crypto", "dac testnet", "dac blockchain analytics"]}
  canonicalUrl="https://cryptowalletsx.com/dachain"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'DAC Quantum Chain Wallet Checker',
        url: 'https://cryptowalletsx.com/dachain',
        description: 'Check DAC Quantum Chain wallet stats and post-quantum cryptographic activity on the quantum-resistant testnet.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
          { '@type': 'ListItem', position: 2, name: 'Checkers', item: 'https://cryptowalletsx.com/checker' },
          { '@type': 'ListItem', position: 3, name: 'DAC Quantum', item: 'https://cryptowalletsx.com/dachain' }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'What is DAC Quantum Chain?', acceptedAnswer: { '@type': 'Answer', text: 'DAC Quantum Chain is a post-quantum cryptographic blockchain testnet designed to resist attacks from future quantum computers while maintaining standard EVM compatibility.' } },
          { '@type': 'Question', name: 'Is the DAC checker free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, the DAC Quantum Chain wallet checker is completely free. Paste any testnet address to view analytics.' } },
          { '@type': 'Question', name: 'What is post-quantum cryptography?', acceptedAnswer: { '@type': 'Answer', text: 'Post-quantum cryptography uses mathematical problems that even quantum computers cannot solve efficiently, securing blockchains against future threats.' } },
          { '@type': 'Question', name: 'How do I get DAC tokens?', acceptedAnswer: { '@type': 'Answer', text: 'Testnet DAC tokens are available from the DAC Quantum Chain faucet at exptest.dachain.tech.' } }
        ]
      }
    ]
  }}
/>

{#if dachainWalletStore.address}
  <WalletScreen
    address={dachainWalletStore.address}
    activeTab={dachainWalletStore.activeTab}
    onTabChange={(tab) => dachainWalletStore.setActiveTab(tab)}
    onReset={() => dachainWalletStore.reset()}
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
  <HomeScreen onAddressSubmit={(addr) => dachainWalletStore.setAddress(addr)} />
{/if}

