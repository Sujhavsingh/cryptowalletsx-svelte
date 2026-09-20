<script lang="ts">
  import { fetchBlockscoutData } from '$lib/utils/api';
  import HomeScreen from './HomeScreen.svelte';
  import WalletScreen from './WalletScreen.svelte';
  import type { AddressDetails, Transaction, TokenTransfer, TokenBalance, NFTItem, AllToken, ChainConfig, WalletTab } from '$lib/types';

  interface Props {
    config: ChainConfig;
    store: {
      address: string;
      activeTab: WalletTab;
      setAddress: (addr: string) => void;
      setActiveTab: (tab: WalletTab) => void;
      reset: () => void;
    };
  }

  let { config, store }: Props = $props();

  // Data state managed here, shared by every chain that uses the arc component suite
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
    if (!store.address) return;
    isLoading = true;
    fetchError = null;
    try {
      const result = await fetchBlockscoutData(store.address, config);
      addressDetails = result.addressDetails;
      transactions = result.transactions;
      tokenTransfers = result.tokenTransfers;
      tokenBalances = result.tokenBalances;
      nfts = result.nfts;
      allTokens = result.allTokens;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        fetchError = `Request timed out. The ${config.name} API is taking too long to respond. Please try again.`;
      } else {
        fetchError = err?.message || `Failed to load wallet data from ${config.name}. Please check the address and try again.`;
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
    if (store.address) {
      fetchAllData();
    }
  });
</script>

{#if store.address}
  <WalletScreen
    address={store.address}
    activeTab={store.activeTab}
    {config}
    onTabChange={(tab) => store.setActiveTab(tab)}
    onReset={() => store.reset()}
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
  <HomeScreen {config} onAddressSubmit={(addr) => store.setAddress(addr)} />
{/if}
