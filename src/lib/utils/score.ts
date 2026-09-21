import type { AddressDetails, Transaction, TokenTransfer, TokenBalance, NFTItem, AllToken, WalletStats, ChainConfig } from '$lib/types';
import { weiToNative, formatUSD, timeAgo } from './format';

export function calculateWalletStats(
  addressDetails: AddressDetails | null,
  transactions: Transaction[],
  tokenTransfers: TokenTransfer[],
  tokenBalances: TokenBalance[],
  nfts: NFTItem[],
  allTokens: AllToken[],
  nativeCurrency: string = 'USDC',
  nativeDecimals: number = 18,
  exchangeRate: number = 0
): WalletStats {
  const address = addressDetails?.hash?.toLowerCase() || '';

  const outTx = transactions.filter(tx => tx.from?.hash?.toLowerCase() === address);
  const inTx = transactions.filter(tx => tx.to?.hash?.toLowerCase() === address);
  const approveTx = transactions.filter(tx =>
    tx.method?.toLowerCase() === 'approve' ||
    tx.method?.toLowerCase() === 'setapprovalforall' ||
    tx.method?.toLowerCase() === 'approveall'
  );
  const deployTx = transactions.filter(tx =>
    tx.to === null && tx.from?.hash?.toLowerCase() === address
  );

  const uniqueContractSet = new Set<string>();
  transactions.forEach(tx => {
    if (tx.to?.hash && tx.to.is_contract && tx.to.hash.toLowerCase() !== address) {
      uniqueContractSet.add(tx.to.hash.toLowerCase());
    }
    if (tx.from?.is_contract && tx.from.hash.toLowerCase() !== address) {
      uniqueContractSet.add(tx.from.hash.toLowerCase());
    }
  });

  const totalVolume = transactions.reduce((sum, tx) => sum + BigInt(String(tx.value || '0')), BigInt(0));
  const totalFees = transactions.reduce((sum, tx) => sum + BigInt(tx.fee?.value || '0'), BigInt(0));

  const balance = addressDetails?.coin_balance || '0';
  const balanceNative = weiToNative(balance, nativeDecimals);
  const balanceUSD = nativeToUSD(balanceNative, exchangeRate);

  const volumeNative = weiToNative(totalVolume.toString(), nativeDecimals);
  const volumeUSD = nativeToUSD(volumeNative, exchangeRate);

  const feesNative = weiToNative(totalFees.toString(), nativeDecimals);
  const feesUSD = nativeToUSD(feesNative, exchangeRate);

  const nftCollections = new Set<string>();
  nfts.forEach(nft => {
    nftCollections.add(nft.token.address_hash.toLowerCase());
  });
  const nftUnique = nftCollections.size;

  const nftTransfers = tokenTransfers.filter(tf =>
    (tf.token?.type === 'ERC-721' || tf.token?.type === 'ERC-1155') &&
    tf.to?.hash?.toLowerCase() === address
  );
  const uniqueMintCollections = new Set<string>();
  nftTransfers.forEach(tf => {
    uniqueMintCollections.add(tf.token.address_hash.toLowerCase());
  });
  const uniqueNFTs = uniqueMintCollections.size;
  const totalMints = nftTransfers.length;

  const tokenUnique = allTokens.filter(t => t.token.type === 'ERC-20').length;

  const contractInteractions = uniqueContractSet.size;
  const totalInteractions = outTx.length;

  const contractCounts = new Map<string, number>();
  transactions.forEach(tx => {
    if (tx.to?.hash && tx.to.is_contract) {
      contractCounts.set(tx.to.hash.toLowerCase(), (contractCounts.get(tx.to.hash.toLowerCase()) || 0) + 1);
    }
  });
  let mostInteractedContract = '';
  let mostInteractedContractCount = 0;
  contractCounts.forEach((count, hash) => {
    if (count > mostInteractedContractCount) {
      mostInteractedContractCount = count;
      mostInteractedContract = hash;
    }
  });

  const tokenCounts = new Map<string, number>();
  tokenTransfers.forEach(tf => {
    const sym = tf.token?.symbol || 'Unknown';
    tokenCounts.set(sym, (tokenCounts.get(sym) || 0) + 1);
  });
  let mostUsedToken = nativeCurrency;
  let mostUsedTokenCount = 0;
  tokenCounts.forEach((count, sym) => {
    if (count > mostUsedTokenCount) {
      mostUsedTokenCount = count;
      mostUsedToken = sym;
    }
  });

  const tokenDiversity = tokenCounts.size;

  const timestamps = transactions.map(tx => new Date(tx.timestamp).getTime()).filter(Boolean);
  const sortedTimestamps = timestamps.sort((a, b) => a - b);

  let currentStreak = 0;
  let bestStreak = 0;
  if (sortedTimestamps.length > 0) {
    const days = new Set(sortedTimestamps.map(t => Math.floor(t / 86400000)));
    const sortedDays = Array.from(days).sort((a, b) => b - a);
    let streak = 1;
    bestStreak = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      if (sortedDays[i - 1] - sortedDays[i] === 1) {
        streak++;
        bestStreak = Math.max(bestStreak, streak);
      } else {
        streak = 1;
      }
    }
    const today = Math.floor(Date.now() / 86400000);
    currentStreak = 0;
    for (const d of sortedDays) {
      if (today - d === currentStreak) {
        currentStreak++;
      } else {
        break;
      }
    }
    bestStreak = Math.max(bestStreak, currentStreak);
  }

  const lastActivity = timestamps.length > 0
    ? timeAgo(new Date(Math.max(...timestamps)).toISOString())
    : 'No activity';

  const createdAt = addressDetails?.created_at || null;
  const walletAge = createdAt
    ? Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000)
    : (sortedTimestamps.length > 0 ? Math.floor((Date.now() - Math.min(...sortedTimestamps)) / 86400000) : 0);

  const uniqueDays = new Set(timestamps.map(t => Math.floor(t / 86400000)));
  const uniqueWeeks = new Set(timestamps.map(t => Math.floor(t / (86400000 * 7))));
  const uniqueMonths = new Set(timestamps.map(t => new Date(t).getMonth() + '-' + new Date(t).getFullYear()));

  const firstActivityAt = sortedTimestamps.length > 0 ? new Date(Math.min(...sortedTimestamps)).toISOString() : null;
  const lastActivityAt = sortedTimestamps.length > 0 ? new Date(Math.max(...sortedTimestamps)).toISOString() : null;

  // ---- Achievement inputs (all-time, kept native-denominated so callers can apply a price) ----
  const nativeMoved = transactions.reduce((sum, tx) => sum + weiToNumber(tx.value, nativeDecimals), 0);
  // On USDC-native chains (Arc) the native token only moves as an ERC-20 transfer and
  // tx.value stays 0, so native-token transfers the wallet sent count as moved volume.
  const nativeTokenSent = tokenTransfers
    .filter(tf =>
      tf.from?.hash?.toLowerCase() === address &&
      (tf.token?.symbol || '').toUpperCase() === nativeCurrency.toUpperCase()
    )
    .reduce((sum, tf) => sum + weiToNumber(tf.total?.value, parseInt(tf.token?.decimals || '', 10) || nativeDecimals), 0);
  const volumeMovedNative = nativeMoved + nativeTokenSent;
  const feesPaidNative = weiToNumber(totalFees.toString(), nativeDecimals);
  const uniqueTokensSent = new Set(
    tokenTransfers
      .filter(tf => tf.from?.hash?.toLowerCase() === address)
      .map(tf => (tf.token?.address_hash || tf.token?.symbol || '').toLowerCase())
      .filter(Boolean)
  ).size;

  const swapMethods = ['swap', 'swapexacttokensfortokens', 'swapexactethfortokens', 'swaptokensforexacttokens', 'swaptokensforexacteth', 'swapexacttokensforeth'];
  // Most DEX swaps are routed through a multicall/execute entrypoint rather than a plain
  // `swap` method, so router-style entrypoints count as swap activity as well.
  const swapRouterMethods = ['transferandmulticall', 'execute', 'multicall'];
  const allSwapMethods = [...swapMethods, ...swapRouterMethods];
  const liquidityMethods = ['addliquidity', 'removeliquidity', 'addliquidityeth', 'removeliquidityeth'];
  const stakingMethods = ['stake', 'unstake', 'withdraw', 'claim', 'claimrewards', 'enter', 'leave'];
  const lendingMethods = ['deposit', 'borrow', 'repay', 'redeem', 'liquidate'];
  const bridgeMethods = ['bridge', 'deposit', 'withdrawandcall', 'requestl2transaction'];
  const governanceMethods = ['propose', 'vote', 'castvote', 'execute', 'queue'];

  const allDeFiMethods = [
    ...allSwapMethods, ...liquidityMethods, ...stakingMethods,
    ...lendingMethods, ...bridgeMethods, ...governanceMethods
  ];
  const totalDeFiActivities = transactions.filter(tx =>
    allDeFiMethods.some(m => tx.method?.toLowerCase().includes(m))
  ).length;

  const volumeNum = parseFloat(volumeNative) || 0;

  let score = 0;
  score += Math.min(Math.log10(1 + transactions.length) * 2.5, 8);
  score += Math.min(Math.log10(1 + uniqueContractSet.size) * 5, 10);
  score += Math.min(Math.sqrt(volumeNum) * 0.35, 11);
  score += Math.min(Math.log10(1 + uniqueNFTs) * 3, 6);
  score += Math.min(Math.sqrt(totalDeFiActivities) * 1.3, 12);
  score += Math.min(Math.log10(1 + walletAge) * 3, 6);
  score += Math.min(Math.log10(1 + bestStreak) * 3, 6);
  score += Math.min(tokenDiversity, 4);
  score = Math.min(Math.round(score * 10) / 10, 100);

  let rank = 'BRONZE';
  if (score >= 90) rank = 'DIAMOND';
  else if (score >= 70) rank = 'PLATINUM';
  else if (score >= 50) rank = 'GOLD';
  else if (score >= 30) rank = 'SILVER';

  const totalTxs = transactions.length || 1;
  const feePerTx = totalFees / BigInt(totalTxs);
  const volumePerTx = totalVolume / BigInt(totalTxs);

  const contractCount = uniqueContractSet.size || 1;
  const nftCount = Math.max(nftUnique, 1);
  const contractNftRatio = (contractCount / nftCount).toFixed(2);

  const dailyAvg = walletAge > 0 ? (transactions.length / walletAge).toFixed(2) : transactions.length.toFixed(2);
  const monthlyAvg = walletAge > 0 ? (transactions.length / Math.max(walletAge / 30, 1)).toFixed(2) : transactions.length.toFixed(2);

  // Highest value moved in a single transaction, counting both the native value and
  // token transfers — on USDC-native chains native movement is recorded as an ERC-20
  // transfer, so tx.value alone would read $0.
  const nativeValueToUSD = (nativeAmount: number) => (exchangeRate > 0 ? nativeAmount * exchangeRate : nativeAmount);
  let highestValueUSD = transactions.reduce(
    (max, tx) => Math.max(max, nativeValueToUSD(weiToNumber(tx.value, nativeDecimals))),
    0
  );
  tokenTransfers.forEach(tf => {
    const amount = weiToNumber(tf.total?.value, parseInt(tf.token?.decimals || '', 10) || nativeDecimals);
    const tokenRate = parseFloat(tf.token?.exchange_rate || '')
      || ((tf.token?.symbol || '').toUpperCase() === nativeCurrency.toUpperCase() ? (exchangeRate > 0 ? exchangeRate : 1) : 0);
    highestValueUSD = Math.max(highestValueUSD, amount * tokenRate);
  });
  const highestVolumeTx = formatUSD(highestValueUSD);

  const approvalRate = totalTxs > 0 ? ((approveTx.length / totalTxs) * 100).toFixed(1) : '0.0';

  const sevenDaysAgo = Date.now() - 7 * 86400000;
  const recentTxs = transactions.filter(tx => new Date(tx.timestamp).getTime() > sevenDaysAgo);
  const recentTokenTransfers = tokenTransfers.filter(tf => new Date(tf.timestamp).getTime() > sevenDaysAgo);
  const recentNftTransfers = recentTokenTransfers.filter(tf =>
    tf.token?.type === 'ERC-721' || tf.token?.type === 'ERC-1155'
  );

  const countDeFiActivities = (methods: string[], txSet: Transaction[] = transactions) => {
    const matchedTxs = txSet.filter(tx =>
      methods.some(m => tx.method?.toLowerCase().includes(m))
    );
    const uniqueContracts = new Set(matchedTxs.map(tx => tx.to?.hash?.toLowerCase()).filter(Boolean) as string[]);
    return { activities: matchedTxs.length, protocols: uniqueContracts.size };
  };

  const staking = countDeFiActivities(stakingMethods, recentTxs);
  const swapping = countDeFiActivities(allSwapMethods, recentTxs);
  const liquidity = countDeFiActivities(liquidityMethods, recentTxs);
  const lending = countDeFiActivities(lendingMethods, recentTxs);
  const bridge = countDeFiActivities(bridgeMethods, recentTxs);
  const governance = countDeFiActivities(governanceMethods, recentTxs);

  // All-time counters powering the badge catalog
  const allTimeSwaps = countDeFiActivities(allSwapMethods).activities;
  const allTimeStakingLiquidity = countDeFiActivities([...stakingMethods, ...liquidityMethods]).activities;

  const recentVolume = recentTxs.reduce((sum, tx) => sum + BigInt(String(tx.value || '0')), BigInt(0));
  const recentFees = recentTxs.reduce((sum, tx) => sum + BigInt(tx.fee?.value || '0'), BigInt(0));
  const recentVolumeUSD = nativeToUSD(weiToNative(recentVolume.toString(), nativeDecimals), exchangeRate);
  const recentFeesUSD = nativeToUSD(weiToNative(recentFees.toString(), nativeDecimals), exchangeRate);

  return {
    score,
    rank,
    totalTransactions: transactions.length,
    outTransactions: outTx.length,
    inTransactions: inTx.length,
    approveCount: approveTx.length,
    uniqueContracts: uniqueContractSet.size,
    deployCount: deployTx.length,
    totalInteractions,
    volumeUSD,
    volumeNative: `${volumeNative} ${nativeCurrency}`,
    uniqueNFTs,
    totalMints,
    feesUSD,
    feesNative: `${feesNative} ${nativeCurrency}`,
    balanceUSD,
    balanceNative: `${balanceNative} ${nativeCurrency}`,
    stakingActivities: staking.activities,
    stakingProtocols: staking.protocols,
    swapActivities: swapping.activities,
    swapProtocols: swapping.protocols,
    liquidityActivities: liquidity.activities,
    liquidityProtocols: liquidity.protocols,
    lendingActivities: lending.activities,
    lendingProtocols: lending.protocols,
    bridgeActivities: bridge.activities,
    bridgeProtocols: bridge.protocols,
    governanceActivities: governance.activities,
    governanceProtocols: governance.protocols,
    uniqueTokenTrades: tokenCounts.size,
    totalTrades: tokenTransfers.length,
    nftUnique,
    tokenUnique,
    currentStreak,
    bestStreak,
    lastActivity,
    walletAge,
    daysActive: uniqueDays.size,
    weeksActive: uniqueWeeks.size,
    monthsActive: uniqueMonths.size,
    createdAt,
    sevenDayChange: {
      interactions: recentTxs.length,
      contracts: new Set(recentTxs.filter(tx => tx.to?.is_contract).map(tx => tx.to?.hash?.toLowerCase()).filter(Boolean)).size,
      volume: recentVolumeUSD,
      nfts: recentNftTransfers.length,
      fees: recentFeesUSD,
      staking: staking.activities,
      tokens: recentTokenTransfers.length,
    },
    feePerTransaction: `${weiToNative(feePerTx.toString(), nativeDecimals)} ${nativeCurrency} / ${nativeToUSD(weiToNative(feePerTx.toString(), nativeDecimals), exchangeRate)}`,
    volumePerTransaction: `${weiToNative(volumePerTx.toString(), nativeDecimals)} ${nativeCurrency} / ${nativeToUSD(weiToNative(volumePerTx.toString(), nativeDecimals), exchangeRate)}`,
    contractNftRatio,
    dailyTxAverage: dailyAvg,
    monthlyTxAverage: monthlyAvg,
    highestVolumeTx,
    approvalRate: `${approvalRate}%`,
    mostInteractedContract,
    mostInteractedContractCount,
    tokenDiversity,
    mostUsedToken,
    mostUsedTokenCount,
    volumeMovedNative,
    feesPaidNative,
    uniqueTokensSent,
    defiActivityCount: totalDeFiActivities,
    swapActivityCount: allTimeSwaps,
    stakingLiquidityActivityCount: allTimeStakingLiquidity,
    firstActivityAt,
    lastActivityAt,
  };
}

/**
 * Wei → native token amount as a number (6 decimals of precision), for numeric
 * aggregations such as USD volume and fee totals.
 */
function weiToNumber(weiValue: string | number, decimals: number = 18): number {
  try {
    const value = BigInt(String(weiValue ?? '0'));
    const divisor = BigInt(10) ** BigInt(decimals);
    const whole = value / divisor;
    const remainder = value % divisor;
    return Number(whole) + Number(remainder) / Number(divisor);
  } catch {
    return 0;
  }
}

/**
 * Convert native token value (ETH, USDC, etc.) to USD string.
 * If exchangeRate is provided (> 0), multiply native amount by rate.
 * If exchangeRate is 0 or not provided, format as-is (for USDC-native chains
 * where 1 token = 1 USD, or when price data is unavailable).
 */
function nativeToUSD(nativeValue: string, exchangeRate: number): string {
  const num = parseFloat(nativeValue) || 0;
  if (exchangeRate > 0) {
    return formatUSD(num * exchangeRate);
  }
  // No exchange rate — assume native value IS the USD value (e.g., USDC)
  return formatUSD(num);
}

export function getTransactionCalendarData(transactions: Transaction[]): Map<string, number> {
  const calendar = new Map<string, number>();
  transactions.forEach(tx => {
    const date = new Date(tx.timestamp);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    calendar.set(key, (calendar.get(key) || 0) + 1);
  });
  return calendar;
}
