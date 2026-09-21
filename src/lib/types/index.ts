export interface AddressDetails {
  hash: string;
  implementations: string | null;
  is_contract: boolean;
  is_verified: boolean | null;
  name: string | null;
  private_tags: unknown[];
  public_tags: unknown[];
  watchlist_names: unknown[];
  ens_domain_name: string | null;
  coin_balance: string;
  exchange_rate: string | null;
  has_token_transfers: boolean;
  has_tokens: boolean;
  has_nft: boolean;
  token_instances_count: number;
  token_transfers_count: number;
  transactions_count: number;
  gas_usage: string;
  last_active_at: string | null;
  created_at: string | null;
  creator_address_hash: string | null;
  creation_tx_hash: string | null;
}

export interface TokenBalance {
  token: {
    address_hash: string;
    name: string | null;
    symbol: string | null;
    decimals: string | null;
    type: string;
    icon_url: string | null;
    holders_count: number | null;
    total_supply: string | null;
    exchange_rate: string | null;
    volume_24h: string | null;
  };
  value: string;
  token_id: string | null;
}

export interface Transaction {
  hash: string;
  from: { hash: string; is_contract: boolean } | null;
  to: { hash: string; is_contract: boolean } | null;
  value: string | number;
  fee: { type: string; value: string } | null;
  timestamp: string;
  method: string | null;
  status: string;
  gas_used: string | null;
  block_number: number;
  nonce: number;
  token_transfers: unknown[];
  result: string;
  confirmation_duration: unknown[];
  type: number | null;
  raw_input: string | null;
  max_fee_per_gas: string | null;
  max_priority_fee_per_gas: string | null;
  base_fee_per_gas: string | null;
  priority_fee: string | null;
  gas_price: string | null;
  has_error_in_internal_transactions: boolean | null;
  decoded_input: unknown | null;
  exchange_rate: string | null;
}

export interface TokenTransfer {
  from: { hash: string; is_contract: boolean };
  to: { hash: string; is_contract: boolean };
  token: {
    address_hash: string;
    name: string | null;
    symbol: string | null;
    decimals: string | null;
    type: string;
    icon_url: string | null;
    exchange_rate?: string | null;
  };
  total: { decimals: string; value: string };
  timestamp: string;
  transaction_hash: string;
  method: string;
  type: string;
}

export interface BalanceHistoryItem {
  block_number: number;
  block_timestamp: string;
  delta: string | null;
  transaction_hash: string | null;
  value: string;
}

export interface NFTItem {
  id: number;
  token: {
    address_hash: string;
    name: string | null;
    symbol: string | null;
    type: string;
    icon_url: string | null;
    holders_count: number | null;
    total_supply: string | null;
  };
  token_type: string;
  value: string;
  token_id: string | null;
  image_url: string | null;
  animation_url: string | null;
  external_app_url: string | null;
  metadata: Record<string, unknown> | null;
}

export interface AllToken {
  token: {
    address_hash: string;
    name: string | null;
    symbol: string | null;
    decimals: string | null;
    type: string;
    icon_url: string | null;
    holders_count: number | null;
    total_supply: string | null;
    exchange_rate: string | null;
  };
  value: string;
  token_id: string | null;
}

export interface WalletStats {
  score: number;
  rank: string;
  totalTransactions: number;
  outTransactions: number;
  inTransactions: number;
  approveCount: number;
  uniqueContracts: number;
  deployCount: number;
  totalInteractions: number;
  volumeUSD: string;
  volumeNative: string;
  uniqueNFTs: number;
  totalMints: number;
  feesUSD: string;
  feesNative: string;
  balanceUSD: string;
  balanceNative: string;
  stakingActivities: number;
  stakingProtocols: number;
  swapActivities: number;
  swapProtocols: number;
  liquidityActivities: number;
  liquidityProtocols: number;
  lendingActivities: number;
  lendingProtocols: number;
  bridgeActivities: number;
  bridgeProtocols: number;
  governanceActivities: number;
  governanceProtocols: number;
  uniqueTokenTrades: number;
  totalTrades: number;
  nftUnique: number;
  tokenUnique: number;
  currentStreak: number;
  bestStreak: number;
  lastActivity: string;
  walletAge: number;
  daysActive: number;
  weeksActive: number;
  monthsActive: number;
  createdAt: string | null;
  sevenDayChange: {
    interactions: number;
    contracts: number;
    volume: string;
    nfts: number;
    fees: string;
    staking: number;
    tokens: number;
  };
  feePerTransaction: string;
  volumePerTransaction: string;
  contractNftRatio: string;
  dailyTxAverage: string;
  monthlyTxAverage: string;
  highestVolumeTx: string;
  approvalRate: string;
  mostInteractedContract: string;
  mostInteractedContractCount: number;
  tokenDiversity: number;
  mostUsedToken: string;
  mostUsedTokenCount: number;
  // Native-denominated values used by the on-chain badge catalog (converted to USD
  // with the chain's native price by the achievements card)
  volumeMovedNative: number;
  feesPaidNative: number;
  uniqueTokensSent: number;
  defiActivityCount: number;
  swapActivityCount: number;
  stakingLiquidityActivityCount: number;
  firstActivityAt: string | null;
  lastActivityAt: string | null;
}

export type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'network' | 'heatmap';

export type WalletTab = 'stats' | 'portfolio' | 'approvals' | 'simulations' | 'tokens-nfts' | 'network-info';

export interface Protocol {
  name: string;
  category: string;
  interactions: number;
  lastActivity: string;
  icon?: string;
}

// ===== Relay Dapp Types =====

export interface RelayCurrency {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  metadata?: {
    logoURI?: string;
    verified?: boolean;
  };
}

export interface RelayCurrencyAmount {
  currency: RelayCurrency;
  amount: string;
  amountFormatted: string;
  amountUsd: string;
  amountUsdCurrent: string;
  minimumAmount: string;
}

export interface RelayTx {
  id: string;
  status: 'waiting' | 'depositing' | 'pending' | 'submitted' | 'success' | 'delayed' | 'refunded' | 'failure';
  user: string;
  recipient: string;
  depositAddress: string | null;
  referrer: string | null;
  createdAt: string;
  updatedAt: string;
  data: {
    slippageTolerance: string;
    failReason: string;
    refundFailReason: string;
    fees: {
      gas: string;
      fixed: string;
      price: string;
      gateway: string;
    };
    feesUsd: {
      gas: string;
      fixed: string;
      price: string;
      gateway: string;
    };
    inTxs: Array<{
      hash: string;
      chainId: number;
      timestamp: number;
      type: string;
      stateChanges: Array<{
        address: string;
        change: {
          kind: string;
          data: { tokenKind: string; tokenAddress: string };
          balanceDiff: string;
        };
      }>;
    }>;
    outTxs: Array<{
      hash: string;
      chainId: number;
      timestamp: number;
      type: string;
      stateChanges: Array<{
        address: string;
        change: {
          kind: string;
          data: { tokenKind: string; tokenAddress: string };
          balanceDiff: string;
        };
      }>;
    }>;
    metadata: {
      sender: string;
      recipient: string;
      currencyIn: RelayCurrencyAmount;
      currencyOut: RelayCurrencyAmount;
      rate: string;
    };
    price: string;
  };
}

export interface RelayChain {
  id: number;
  name: string;
  displayName: string;
  httpRpcUrl: string;
  explorerUrl: string;
  explorerName: string;
  iconUrl?: string;
  currency: {
    id: string;
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    supportsBridging: boolean;
  };
  vmType: string;
  depositEnabled: boolean;
  tokenSupport: string;
  disabled: boolean;
}

export interface RelayChainActivity {
  chainId: number;
  chainName: string;
  chainIcon: string;
  sourceCount: number;
  destCount: number;
  sourceVolume: number;
  destVolume: number;
  active: boolean;
}

export interface RelayTokenUsage {
  symbol: string;
  name: string;
  chainId: number;
  chainName: string;
  chainIcon: string;
  tokenIcon: string;
  transactions: number;
  volume: number;
}

export interface RelayStats {
  totalTransactions: number;
  bridgeTransactions: number;
  swapTransactions: number;
  totalVolume: number;
  bridgeVolume: number;
  swapVolume: number;
  successRate: number;
  successCount: number;
  failCount: number;
  networksUsed: number;
  totalNetworks: number;
  sourceChains: number;
  destChains: number;
  lastActivity: string;
  walletAge: string;
  daysActive: number;
  weeksActive: number;
  monthsActive: number;
  mostActiveChain: string;
  mostActiveChainTxs: number;
  highestVolumeChain: string;
  highestVolumeAmount: number;
  sevenDayBridgeTxs: number;
  sevenDaySwapTxs: number;
  chainActivity: RelayChainActivity[];
  tokenUsage: RelayTokenUsage[];
  transactions: Array<{
    id: string;
    date: string;
    type: 'Bridge' | 'Swap';
    sourceChain: number;
    sourceChainName: string;
    sourceToken: string;
    destChain: number;
    destChainName: string;
    destToken: string;
    amount: string;
    amountUsd: string;
    status: string;
    sourceTxHash: string;
    destTxHash: string;
  }>;
}

export interface ChainConfig {
  id: string;
  name: string;
  nativeCurrency: string;
  nativeDecimals: number;
  chainId: string;
  apiBase: string;
  blockExplorer: string;
  blockExplorerTxUrl: string;
  blockExplorerAddressUrl: string;
  rpcEndpoints: string[];
  faucet?: string;
  walletType: string;
  usdcTokenAddress?: string;
  features: { name: string; description: string; url: string }[];
  sampleAddresses: string[];
  apiType?: 'blockscout' | 'socialscan' | 'genlayer' | 'relay-dapp' | 'jumper-dapp';
  isTestnet?: boolean;
  description?: string;
  corsEnabled?: boolean;
}

// ===== Jumper (Li.Fi) Dapp Types =====

export interface JumperChainInfo {
  key: string;
  name: string;
  coin: string;
  id: number;
  mainnet: boolean;
  logoURI: string;
  chainType: string;
}

export interface JumperTokenInfo {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  logoURI: string;
  priceUSD: string;
  coinKey: string;
}

export interface JumperTransferSide {
  txHash: string;
  txLink: string;
  token: JumperTokenInfo;
  chainId: number;
  chainName?: string;
  gasAmount: string;
  gasAmountUSD: string;
  amountUSD: string;
  amount: string;
  value: string;
  timestamp: number;
}

export interface JumperTransfer {
  transactionId: string;
  status: 'PENDING' | 'DONE' | 'FAILED' | 'NOT_FOUND';
  fromAddress: string;
  toAddress: string;
  sending: JumperTransferSide;
  receiving: JumperTransferSide;
  tool: string;
  lifiExplorerLink?: string;
  bridgeExplorerLink?: string;
  substatus?: string;
  substatusMessage?: string;
  feeCosts?: Array<{ name: string; amountUSD: string; [key: string]: unknown }>;
  metadata?: { integrator?: string; [key: string]: unknown };
}

export interface JumperTool {
  key: string;
  name: string;
  logoURI: string;
  type: string;
}

export interface JumperChainActivity {
  chainId: number;
  chainKey: string;
  chainName: string;
  chainIcon: string;
  sourceCount: number;
  destCount: number;
  sourceVolume: number;
  destVolume: number;
  active: boolean;
}

export interface JumperProtocolUsage {
  name: string;
  logoURI: string;
  type: 'Bridge' | 'Exchange';
  transactions: number;
  volume: number;
}

export interface JumperStats {
  totalTransfers: number;
  bridgeTransfers: number;
  swapTransfers: number;
  totalVolume: number;
  bridgeVolume: number;
  swapVolume: number;
  totalFees: number;
  successRate: number;
  successCount: number;
  failCount: number;
  networksUsed: number;
  totalNetworks: number;
  sourceChains: number;
  destChains: number;
  lastActivity: string;
  walletAge: string;
  daysActive: number;
  weeksActive: number;
  monthsActive: number;
  mostActiveChain: string;
  mostActiveChainTxs: number;
  highestVolumeChain: string;
  highestVolumeAmount: number;
  sevenDayTransfers: number;
  sevenDayVolumeChange: number;
  chainActivity: JumperChainActivity[];
  protocolUsage: JumperProtocolUsage[];
  transfers: Array<{
    id: string;
    date: string;
    type: 'Bridge' | 'Swap';
    sourceChainName: string;
    sourceChainIcon: string;
    sourceToken: string;
    destChainName: string;
    destChainIcon: string;
    destToken: string;
    fromAmount: string;
    fromAmountUSD: string;
    toAmount: string;
    toAmountUSD: string;
    status: string;
    protocol: string;
    protocolIcon: string;
    feesUSD: string;
  }>;
}
