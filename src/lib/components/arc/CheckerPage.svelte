<script lang="ts">
  import { fetchBlockscoutData, type BlockscoutFetchResult } from '$lib/utils/api';
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
  // True once the first batch has painted; the wallet screen may render from then on.
  let hasData = $state(false);
  // True while background pagination is still streaming more history into the screen.
  let isStreaming = $state(false);
  let addressDetails = $state<AddressDetails | null>(null);
  let transactions = $state<Transaction[]>([]);
  let tokenTransfers = $state<TokenTransfer[]>([]);
  let tokenBalances = $state<TokenBalance[]>([]);
  let nfts = $state<NFTItem[]>([]);
  let allTokens = $state<AllToken[]>([]);

  // Bumped on every request so a stale stream can never overwrite a newer one.
  let requestToken = 0;
  let lastAddress = '';

  function applyResult(result: BlockscoutFetchResult) {
    addressDetails = result.addressDetails;
    transactions = result.transactions;
    tokenTransfers = result.tokenTransfers;
    tokenBalances = result.tokenBalances;
    nfts = result.nfts;
    allTokens = result.allTokens;
  }

  function clearData() {
    addressDetails = null;
    transactions = [];
    tokenTransfers = [];
    tokenBalances = [];
    nfts = [];
    allTokens = [];
  }

  async function fetchAllData() {
    const address = store.address;
    if (!address) return;

    const token = ++requestToken;
    isLoading = true;
    isStreaming = false;
    fetchError = null;
    if (address !== lastAddress) {
      // Never show one wallet's numbers while another wallet is loading.
      lastAddress = address;
      clearData();
      hasData = false;
    }

    try {
      const result = await fetchBlockscoutData(address, config, (partial) => {
        if (token !== requestToken) return;
        applyResult(partial);
        hasData = true;
        isLoading = false;
        isStreaming = partial.partial === true;
      });
      if (token !== requestToken) return;
      applyResult(result);
      hasData = true;
      isStreaming = false;
    } catch (err: any) {
      if (token !== requestToken) return;
      if (err?.name === 'AbortError') {
        fetchError = `Request timed out. The ${config.name} API is taking too long to respond. Please try again.`;
      } else {
        fetchError = err?.message || `Failed to load wallet data from ${config.name}. Please check the address and try again.`;
      }
    } finally {
      if (token === requestToken) {
        isLoading = false;
        isStreaming = false;
      }
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

{#if store.address && (hasData || fetchError || isLoading)}
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
    {hasData}
    {isStreaming}
    {fetchError}
    onRetry={handleRetry}
    {isRefreshing}
    onRefresh={handleRefresh}
  />
{:else}
  <HomeScreen
    {config}
    onAddressSubmit={(addr) => store.setAddress(addr)}
    error={fetchError}
    onRetry={handleRetry}
  />
{/if}
