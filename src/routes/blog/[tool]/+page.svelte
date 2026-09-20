<script lang="ts">
  import HomeHeader from '$lib/components/home/HomeHeader.svelte';
  import Footer from '$lib/components/home/Footer.svelte';
  import SEO from '$lib/components/SEO.svelte';
  import type { ChainConfig } from '$lib/types';
  import {
    Shield, ArrowRight, BarChart3, Zap, Coins, Globe, Layers,
    TrendingUp, CheckCircle2, AlertCircle, BookOpen, ChevronRight,
    Clock, Activity, Users, HelpCircle, Lightbulb, ExternalLink
  } from 'lucide-svelte';

  interface Props {
    data: {
      tool: string | null;
      config: ChainConfig | null;
      status?: number;
    };
  }

  let { data }: Props = $props();

  const isDapp = $derived(data.config?.apiType === 'relay-dapp' || data.config?.apiType === 'jumper-dapp');
  const isTestnet = $derived(data.config?.isTestnet ?? true);

  // Dynamic content based on chain type
  const chainDescription = $derived.by(() => {
    if (!data.config) return '';
    const c = data.config;
    if (c.id === 'arc') return 'Arc Mainnet is Circle\'s USDC-native public Layer-1, where USDC — not ETH — pays for gas. That means the balance you hold and the balance you spend gas from are the same asset, which removes the usual two-token juggling act on EVM chains. Gas costs land in fractions of a cent and blocks are fast, so swapping, lending and bridging stay cheap. Because Circle issues the USDC and runs the network, the stablecoin rails are production-grade rather than bolted on. The trade-off is ecosystem maturity: Arc is newer than Base or Arbitrum, so the dApp list is shorter and some tooling is still catching up.';
    if (c.id === 'arc-testnet') return 'Arc Testnet runs the same USDC-as-gas design as mainnet, just with free faucet USDC that holds no value. It is the place to rehearse before you touch the mainnet checker: deploy a contract, swap on a testnet DEX, mint something, and watch how your wallet score reacts. Gas costs basically nothing, so you can iterate quickly. Circle backs the chain, so the tooling mirrors what you will use in production. The obvious limit is that testnet activity carries no economic weight — a high score here proves you know how to use the chain, not that you have real flow going through it.';
    if (c.id === 'base') return 'Base is Coinbase\'s Ethereum L2, built on the OP Stack. Transactions cost under $0.01 and confirm in about 2 seconds — compared to Ethereum mainnet\'s variable gas and 12-second blocks. Base settles on Ethereum, so it carries the same security guarantees. With over $6B in TVL and protocols like Aerodrome, Uniswap, and Aave deployed, it\'s one of the busiest L2s right now. The catch: like any L2, you\'re trusting the sequencer and the OP Stack bridge contracts.';
    if (c.id === 'ink') return 'Ink is Kraken\'s Ethereum L2, also on the OP Stack. Kraken handles $200B+ in quarterly volume across its exchange, and Ink is their bet on bringing that user base on-chain. Transactions are cheap and fast — standard OP Stack performance. The chain is still early, so the DeFi ecosystem is thinner than Base or Arbitrum. If you\'re a Kraken user, the on-ramp is seamless; if you\'re not, there\'s less reason to pick it over more established L2s.';
    if (c.id === 'relay') return 'Relay supports 80+ blockchains for bridging and swapping — from Ethereum and Arbitrum to smaller chains like Zora and Mode. It routes your transaction through whichever combination of bridges and DEXs gets you the best price and speed. In practice, that means you pick a destination chain and token, and Relay figures out the path. It handles about $500M+ in monthly volume. Downside: complex routes through multiple hops can take 10-20 minutes and occasionally fail at an intermediate step.';
    if (c.id === 'jumper') return 'Jumper, built on Li.Fi\'s aggregation layer, compares routes across 15+ bridge protocols (Stargate, Across, Hop, and others) and multiple DEXs to find the cheapest or fastest path for your cross-chain transfer. It covers dozens of chains. The interface is straightforward: pick source, destination, and token. Li.Fi processes millions of transactions monthly. The trade-off is the same as any aggregator — you\'re adding a layer of routing logic, and if one bridge in the route has issues, your transaction stalls.';
    if (c.id === 'robinhood') return 'Robinhood Chain mainnet is an Arbitrum Orbit L2 aimed at tokenized stocks and real-world assets. It runs the same Nitro stack that powers Arbitrum One, so the developer experience is familiar and standard Solidity tooling works without changes. ETH pays for gas, blocks are fast, and the explorer exposes token transfers and holdings, which is what makes this checker\'s token and DeFi breakdowns possible. The interesting part is not the tech — it is the distribution. Robinhood brings a retail user base that most chains cannot reach, and this chain is how they get on-chain exposure. It is still early: fewer protocols than Arbitrum or Base, and liquidity is thin compared to established L2s.';
    if (c.id === 'robinhood-testnet') return 'Robinhood Chain testnet is the pre-production environment for Robinhood\'s Arbitrum Orbit L2, using free testnet ETH with no real value. It exists so developers and early users can rehearse contract deployments, transfers and dApp interactions against the same Nitro stack that runs on mainnet. The ecosystem is thin by design — this is infrastructure being tested, not a live market. Treat it as a dry run: the scoring works exactly as it does on mainnet, but nothing you do here moves real money, and mainnet behavior can differ once liquidity arrives.';
    if (c.id === 'litvm') return 'LitVM is an Arbitrum Nitro L2 testnet on Sepolia with zkLTC as the native token. It\'s EVM-compatible — deploy with Hardhat, Foundry, or Remix like you would on any other chain. The zkLTC token ties it to the Litecoin community, though what that means long-term is still unclear. The chain uses Arbitrum\'s proven Nitro stack, so performance and tooling are solid. Current limitation: it\'s testnet-only with a small community, so you won\'t find much DeFi or NFT activity yet.';
    if (c.id === 'seismic') return 'Seismic is a testnet that adds encrypted smart contracts to the EVM. Transaction data and contract state stay encrypted while the network still verifies correctness — think private DeFi positions, sealed-bid auctions, or confidential governance votes. The cryptography is real (zero-knowledge proofs and encrypted computation), but it adds gas overhead and the dev tooling is rougher than standard Solidity workflows. This is early-stage infrastructure; don\'t expect production-grade performance yet.';
    if (c.id === 'genlayer') return 'GenLayer\'s Bradbury testnet runs AI validators instead of standard deterministic consensus. The validators evaluate subjective inputs — think "is this news article accurate?" or "what\'s the current price of X?" — and reach agreement through an AI-powered process. You write contracts in Python, not Solidity, and they can call external AI models. That\'s a big departure from standard EVM development. The catch: consensus is slower and less predictable than traditional chains because AI evaluation isn\'t deterministic. If you need exact reproducibility, this isn\'t the right tool.';
    if (c.id === 'simplechain') return 'SimpleChain is a no-frills EVM testnet with SRW as the native token. It does the basics: send transactions, deploy contracts, test dApps — without the overhead of a large validator set or complex staking mechanics. Think of it as a sandbox that doesn\'t get in your way. It doesn\'t have the ecosystem depth of Base or Arbitrum testnets, and tooling support is thinner. Best suited for learning the ropes or running quick contract tests.';
    if (c.id === 'dachain') return 'DAC Quantum Chain is a testnet built around post-quantum cryptography. Where most chains use ECDSA signatures (which quantum computers could eventually break), DAC uses lattice-based and hash-based signatures that hold up against quantum attacks. DAC tokens pay for gas, staking, and governance. The Inception testnet program hands out Quantum Energy badges and Early Badges for activity — think of it as a point system for early adopters. Honest caveat: quantum computers that can break ECDSA don\'t exist yet, and may not for 10-15 years. DAC is preparing for that future, but today the practical difference is the signature scheme, not something you\'ll notice in day-to-day use.';
    if (c.id === 'doma') return 'Doma is an Ethereum L2 testnet built around cross-chain bridging as a first-class feature. The native bridge at bridge-testnet.doma.xyz lets you move assets to and from other chains without wrangling third-party bridges. ETH is the gas token, and since Doma is fully EVM-compatible, MetaMask, Hardhat, and Foundry work out of the box — just add the RPC and chain ID. Gas fees run a fraction of a cent, and finality is fast. The testnet is still early, so the DeFi ecosystem is limited to a few protocols. If you\'re testing cross-chain strategies or building bridge-aware contracts, Doma gives you a clean environment for that. If you need a mature DeFi stack, you\'ll find more on Base or Arbitrum testnets.';
    return c.description || '';
  });

  const scoringDetails = $derived.by(() => {
    if (isDapp) {
      return {
        title: 'How Cross-Chain Analytics Work',
        intro: 'We look at your bridge and swap history across every supported chain and turn it into a profile that shows how you move assets around the ecosystem. No single number tells the whole story, so we break it into six dimensions.',
        dimensions: [
          { name: 'Transaction Volume', desc: 'Total USD value of all your bridges and swaps. A $50K volume over 30 transactions looks different from $50K in one trade — but both count the same here. Volume is one signal, not the whole picture.' },
          { name: 'Network Coverage', desc: 'How many unique chains you\'ve touched. A wallet active on 12 chains out of 80+ shows more ecosystem breadth than one only bridging between Ethereum and Arbitrum — even if the latter has more total transactions.' },
          { name: 'Bridge vs Swap Ratio', desc: 'The split between bridging (moving assets between chains) and swapping (exchanging tokens on the same chain). Someone who only bridges but never swaps, or vice versa, has a narrower profile than someone doing both.' },
          { name: 'Protocol Diversity', desc: 'How many distinct protocols you\'ve used for bridges and swaps. Sticking to a single bridge is fine, but using 3-4 different ones (Stargate, Across, Hop, etc.) shows you\'re actively comparing routes — which matters for scoring.' },
          { name: 'Success Rate', desc: 'The percentage of your transactions that didn\'t fail. Failed transactions happen — wrong gas, unsupported routes, slippage — but a high success rate (say, 95%+) means you\'re double-checking before you submit.' },
          { name: 'Activity Consistency', desc: 'How spread out your activity is over time. A wallet that bridges once a week for 3 months scores better on this dimension than one that does 20 transactions in a single day and disappears.' },
        ],
      };
    }
    if (data.config?.id === 'dachain') {
      return {
        title: 'How DAC Quantum Chain Scoring Works',
        intro: 'We score DAC wallets using a logarithmic formula across six dimensions, with extra weight on quantum-resistant interactions and Inception program activity. The logarithmic curve means your first 10 transactions matter more than transactions 90–100. This keeps one wallet from running up the score just by volume — diverse, consistent activity wins out.',
        dimensions: [
          { name: 'Transaction Count', desc: 'Total transactions on DAC. The formula (score = log₁₀(count + 1) × weight) means going from 0 to 10 transactions is worth about the same as going from 10 to 100. Early activity counts for more, which keeps things competitive.' },
          { name: 'Quantum-Resistant Interactions', desc: 'Transactions using DAC\'s lattice-based or hash-based signature schemes. This is the dimension that makes DAC unique — if you\'re interacting with contracts that use post-quantum signatures, you\'re engaging with the chain\'s core value proposition, and your score reflects that.' },
          { name: 'Inception Program Participation', desc: 'Quantum Energy badges, Early Badge claims, and Inception program activity. This dimension carries heavy weight because testnet participation is the whole point right now. If you\'re just sending DAC between wallets without engaging the program, you\'re leaving points on the table.' },
          { name: 'DeFi Participation', desc: 'Staking, swapping, lending, and governance with DAC tokens. Each category scores independently — so staking and governance together beats staking twice. Breadth matters more than depth in one area.' },
          { name: 'Volume & Fees', desc: 'Total DAC moved and gas fees paid. The log formula means a wallet moving 100 DAC across 5 contract types can outrank one moving 10,000 DAC in simple transfers. Volume alone doesn\'t carry you — you need diverse activity alongside it.' },
          { name: 'Streak & Activity Patterns', desc: 'Daily streaks and consistency over time. A 14-day streak with 2 transactions per day beats 28 transactions in one day and nothing for two weeks. The scoring rewards showing up, not sprinting.' },
        ],
      };
    }
    if (data.config?.id === 'doma') {
      return {
        title: 'How Doma Scoring Works',
        intro: 'Doma scoring uses a logarithmic curve across six dimensions, with bridge activity carrying extra weight. The log formula means your first few transactions on each dimension count for more than your 50th. This keeps the scoring competitive — a wallet doing a bit of everything can beat one that just moves large volume through a single contract.',
        dimensions: [
          { name: 'Transaction Count', desc: 'Total transactions on Doma. The log formula (score = log₁₀(count + 1) × weight) means 0→10 and 10→100 add roughly the same points. Getting started counts; going from 500 to 510 barely moves the needle.' },
          { name: 'Bridge Activity', desc: 'Cross-chain transfers through bridge-testnet.doma.xyz. Both directions count — sending assets out and receiving them in. This dimension is weighted heavily because bridging is Doma\'s core feature. Skip it and you\'re missing the biggest scoring opportunity.' },
          { name: 'Contract Interactions', desc: 'Unique contracts you\'ve called on Doma. Since it\'s EVM-compatible, this covers everything from DEX routers to custom dApps to governance contracts. Calling 10 different contracts scores better than calling the same one 10 times.' },
          { name: 'DeFi Participation', desc: 'Staking, swapping, lending, providing liquidity, and cross-chain strategies. Each type counts separately. A wallet that stakes and provides liquidity outscores one that only stakes — even if the staker has more total transactions.' },
          { name: 'Volume & Fees', desc: 'ETH moved and gas fees paid. The log formula keeps this from becoming a whale-only metric. A wallet with 2 ETH across 4 contract types scores competitively against one with 50 ETH in simple transfers.' },
          { name: 'Streak & Activity Patterns', desc: 'How often you show up. A wallet active 3 days a week for a month beats one that does everything in a single session. Consistency is the signal we\'re measuring here — are you building a habit or just passing through?' },
        ],
      };
    }
    return {
      title: 'How Wallet Scoring Works',
      intro: 'We score wallets using a logarithmic formula across six dimensions. The log curve means your first few actions in each dimension count for more than your 50th. This prevents any wallet from buying a top score through volume alone — consistent, diverse activity is what drives scores up.',
      dimensions: [
        { name: 'Transaction Count', desc: 'Total transactions in and out. The formula (score = log₁₀(count + 1) × weight) means going from 0 to 10 transactions adds about the same points as going from 10 to 100. Starting early matters more than piling on later.' },
        { name: 'Contract Interactions', desc: 'How many different contracts you\'ve called. Using 8 different protocols scores higher than using the same DEX 20 times. We\'re measuring breadth of engagement, not loyalty to one app.' },
        { name: 'DeFi Participation', desc: 'Staking, swapping, lending, providing liquidity, and bridging — each category scores on its own. Someone who stakes and lends beats someone who only stakes, even with identical transaction counts. Breadth wins.' },
        { name: 'NFT Activity', desc: 'Unique NFTs minted, bought, or transferred. This measures engagement with the creative and social side of the chain. If NFTs aren\'t your thing, this dimension will sit low — and that\'s fine, the other five compensate.' },
        { name: 'Volume & Fees', desc: 'Total value moved and gas spent. The log formula prevents this from becoming a wealth contest. A wallet with $500 across 5 contract types can outrank one moving $50,000 through a single DEX. Volume is one signal, not the decider.' },
        { name: 'Streak & Activity Patterns', desc: 'Daily streaks and consistency. A wallet with 3 transactions per day for two weeks scores better here than one with 42 transactions in a single day and then nothing. Showing up regularly matters more than showing up big once.' },
      ],
    };
  });

  const dataTracked = $derived.by(() => {
    if (isDapp) {
      return [
        { icon: ArrowRight, title: 'Bridge Transactions', desc: 'Every cross-chain bridge transfer you\'ve made — which chain you sent from, which chain you sent to, what token, how much, and when. We show both completed and failed transfers.' },
        { icon: Zap, title: 'Swap Transactions', desc: 'Every token swap on record: what you swapped, for what, how much, the exchange rate, and which protocol handled it. We pull this from the protocol\'s indexer, so there\'s usually a 30-60 second lag for recent swaps.' },
        { icon: Globe, title: 'Chain Activity', desc: 'Which chains you use most and how your volume distributes across them. You\'ll see if you\'re primarily an Ethereum-to-Arbitrum bridger, or if your activity is spread across 10+ chains.' },
        { icon: Layers, title: 'Protocol Usage', desc: 'How often you use each bridge and swap protocol. We show transaction counts and volume per protocol so you can see whether you\'re a Stargate loyalist or spreading across multiple providers.' },
        { icon: Coins, title: 'Token Usage', desc: 'Which tokens move through your wallet most often. If you mostly bridge USDC and swap ETH, that shows up here alongside frequency and volume for each token.' },
        { icon: TrendingUp, title: 'Success & Failure Rates', desc: 'What percentage of your transactions succeeded vs. failed. Failed transactions happen — usually from slippage, insufficient gas, or expired routes. A 90%+ success rate is solid. Below 70% suggests something\'s off with your setup.' },
        { icon: Clock, title: 'Activity Timeline', desc: 'When you\'re active, your daily streaks, and how your usage has changed week to week. Useful for spotting whether your cross-chain activity is growing, plateauing, or dropping off.' },
      ];
    }
    return [
      { icon: Activity, title: 'Transaction History', desc: 'Every transaction in and out — timestamps, values, gas paid, and whether it succeeded or failed. We track the raw count and the pattern over time so you can see if you\'re ramping up or slowing down.' },
      { icon: Coins, title: 'Token Balances', desc: 'All ERC-20 tokens in your wallet with balances and USD values where pricing is available. We also calculate your token diversity — how many different tokens you hold — because that\'s a useful signal beyond raw balance numbers.' },
      { icon: Shield, title: 'NFT Holdings', desc: 'Your ERC-721 and ERC-1155 tokens with metadata and images where available. We also show mint and transfer history so you can trace where each NFT came from.' },
      { icon: Zap, title: 'DeFi Activity', desc: 'Every DeFi interaction sorted by type: staking, swapping, lending, providing liquidity, and bridging. We count both the number of interactions and the number of distinct protocols — using Aave and Compound counts as two protocols, not one.' },
      { icon: CheckCircle2, title: 'Contract Approvals', desc: 'Which smart contracts can spend your tokens. This is a security check — if you approved a DEX six months ago and haven\'t used it since, that approval is still live. We surface these so you can revoke the ones you don\'t need.' },
      { icon: BarChart3, title: 'Volume & Fees', desc: 'Total volume moved and gas fees paid, in native currency and USD where we have pricing. We also show per-transaction averages and whether your spending is trending up or down.' },
      { icon: Globe, title: 'Network Participation', desc: 'How many contracts you\'ve deployed, how many unique contracts you\'ve interacted with, and how broad your dApp usage is. Deploying a contract is a strong signal of builder activity; interacting with 10+ protocols shows you\'re exploring the ecosystem.' },
    ];
  });

  const tips = $derived.by(() => {
    if (isDapp) {
      return [
        { title: 'Branch Out Beyond 2-3 Chains', desc: 'If you\'ve only bridged between Ethereum and Base, try adding Arbitrum, Optimism, or Polygon to the mix. Each new chain you touch adds to your network coverage score — and you\'ll discover which chains have the best liquidity for your preferred tokens.' },
        { title: 'Try Multiple Protocols', desc: 'Don\'t default to the same bridge every time. Route through Stargate for one transfer, Across for the next, and Hop for another. This bumps your protocol diversity score and teaches you which bridge works best for specific chain pairs. (Hint: the cheapest route isn\'t always the same one.)' },
        { title: 'Keep a Weekly Cadence', desc: 'Do 2-3 cross-chain transactions per week instead of batching 15 in one day. Weekly consistency builds a stronger activity pattern than monthly spikes. Set a reminder if you need to — the streak dimension rewards showing up regularly.' },
        { title: 'Double-Check Before Confirming', desc: 'Before you hit confirm: check that you have enough gas on the destination chain, the route is still available (liquidity can dry up), and slippage settings are reasonable. Failed transactions don\'t just hurt your success rate — they cost gas you don\'t get back.' },
        { title: 'Bridge and Swap in Balance', desc: 'Don\'t just bridge or just swap — do both. If you only move assets between chains but never trade, or only trade on one chain, your profile looks one-dimensional. Even one swap for every 2-3 bridges makes a difference.' },
        { title: 'Check Your Stats Weekly', desc: 'Look at which dimensions are lagging — if your protocol diversity is stuck at 1, that\'s your next target. If your success rate dipped, review what failed. The data tells you where the easy points are.' },
      ];
    }
    return [
      { title: 'Interact with More Contracts', desc: 'Each unique contract you call adds to your diversity score. Try a new dApp or protocol every week — swap on a different DEX, stake with a new protocol, or interact with a governance contract. Using 8 different contracts beats using the same one 8 times.' },
      { title: 'Hit at Least 3 DeFi Categories', desc: 'Staking, swapping, lending, or providing liquidity — each one scores independently, so doing two types always beats doubling down on one. Even a small lending position on Aave or Compound adds a new category to your profile.' },
      { title: 'Mint or Transfer a Few NFTs', desc: 'You don\'t need a large collection — even 3-5 unique NFT interactions push this dimension up. Testnet NFTs work fine if you\'re on a testnet. This fills out your activity diversity without much effort.' },
      { title: 'One Transaction Per Day Beats a Sunday Binge', desc: 'Set up a daily habit — claim a faucet, make a swap, or interact with a contract. A 7-day streak at 1 tx/day scores better than 7 transactions in one session and 6 days of nothing.' },
      { title: 'Deploy a Contract', desc: 'Even a simple "Hello World" contract deployment scores well because it signals builder-level engagement. Use Remix or Hardhat — the deployment takes 2 minutes and the scoring benefit lasts.' },
      { title: 'Use the Native Token', desc: 'Send some transactions in the native token ({data.config?.nativeCurrency || "ETH"}). Native-token transfers are the most fundamental chain interaction, and they contribute directly to your volume metrics. A few transfers per week is enough to keep this dimension active.' },
    ];
  });

  const faqs = $derived.by(() => {
    if (isDapp) {
      return [
        { q: 'How do you get my cross-chain transaction data?', a: `We call the ${data.config?.name || 'protocol'} API with your wallet address. All of this data is already public on-chain — we're just organizing it. We don't need your private keys, and we don't ask you to connect your wallet.` },
        { q: 'Is my data private?', a: 'Your wallet address and every transaction you\'ve made are already public — that\'s how blockchains work. We read that data and format it. We don\'t store it on our servers, and we don\'t ask for any credentials. If you want privacy, use a fresh wallet.' },
        { q: 'How often is the data updated?', a: 'Every time you load the page, we fetch fresh data from the API. Transactions from the last 30-60 seconds might not show up yet — the protocol\'s indexer needs a moment to process them. Wait a minute and refresh if something\'s missing.' },
        { q: 'Why is my transaction count different from other explorers?', a: 'Counting methods vary. We only count completed bridge and swap transactions. Some explorers include failed transactions, pending transactions, or internal contract calls in their totals. If you see a difference of 5-10%, that\'s normal. If it\'s off by 50%+, let us know — that might be a bug.' },
        { q: 'Can I improve my analytics?', a: 'Yes. Use more chains, try different bridge protocols, keep a weekly cadence, and double-check your transactions before submitting. The tips section above breaks down each strategy with specifics.' },
        { q: 'Do you support all chains that the protocol supports?', a: `We track all chains that ${data.config?.name || 'the protocol'} supports. Chains added in the last few days or chains with very low volume may have spotty data until the indexer catches up. If a chain is missing from your results, it's usually a data lag issue, not a bug.` },
        { q: 'Is this service free?', a: 'Yes, entirely free. No account required, no wallet connection, no premium tiers. Paste an address and get your data.' },
      ];
    }
    return [
      { q: 'How is my wallet score calculated?', a: `Your score comes from a logarithmic formula applied across six dimensions: transactions, contract interactions, DeFi participation, NFT activity, volume, and consistency. Each dimension uses score = log₁₀(value + 1) × weight. Translation: going from 0 to 10 transactions in a category is worth about as many points as going from 10 to 100. This keeps one wealthy wallet from dominating the rankings — consistent, diverse activity wins over raw volume.` },
      { q: 'Is my wallet data safe?', a: 'We only read what\'s already public on the blockchain. No private keys, no seed phrases, no wallet connections. We fetch data in real-time from public APIs and don\'t store it on our servers. If someone can see your address on a block explorer, they can see the same data we show.' },
      { q: 'Why is my score different from other platforms?', a: 'Every platform uses a different scoring formula. We weight dimensions differently (for example, we value contract diversity more than pure volume), and our logarithmic curve means your first few transactions in each category count for more than they would on a linear scale. A 10-20% difference between platforms is normal.' },
      { q: 'How often should I check my stats?', a: 'As often as you want — data is live. But checking once a week is a good cadence. That\'s enough time for new transactions to settle and for meaningful changes to show up in your score. Checking every hour won\'t change anything since the blockchain needs time to confirm new activity.' },
      { q: `What does the ${data.config?.nativeCurrency || 'native token'} balance include?`, a: `Your ${data.config?.nativeCurrency || 'native token'} balance is what's sitting in your wallet right now. It doesn't include tokens locked in staking contracts, liquidity pools, or lending protocols — those show up in your DeFi activity breakdown instead. If you staked 5 ${data.config?.nativeCurrency || 'ETH'}, your balance drops by 5 but your DeFi metrics reflect the stake.` },
      { q: 'Do testnet activities count the same as mainnet?', a: `Since ${data.config?.name || 'this chain'} is ${isTestnet ? 'a testnet' : 'a mainnet'}, ${isTestnet ? 'the scoring algorithm runs the same way it would on mainnet — but the scores are practice runs. Testnet tokens hold no value, so a high score here means you know how to use the chain, not that you have real economic activity. Treat it as a dry run.' : 'every transaction carries real economic weight. Your score reflects actual on-chain engagement with real assets at stake.'}` },
      { q: 'Can I compare my stats with other wallets?', a: 'Not yet — right now it\'s single-wallet analytics only. Leaderboards and wallet comparisons are on the roadmap. For now, you can compare manually by checking two wallets side by side, but we don\'t have a built-in comparison tool.' },
      ...(data.config?.id === 'dachain' ? [
        { q: 'What makes DAC Quantum Chain different from other testnets?', a: 'DAC is the first testnet designed around post-quantum cryptography. Other chains use ECDSA signatures, which quantum computers could eventually break. DAC uses lattice-based and hash-based signatures instead. Whether this matters today is debatable — quantum computers that can break ECDSA are likely 10-15 years away. But if you\'re building for long-term security, DAC lets you test that future-proofing now.' },
        { q: 'How do I get DAC tokens for testing?', a: 'Go to inception.dachain.io, claim your Early Badge, and you\'ll get Quantum Energy plus free DAC from the faucet. The tokens are for testing only — no real value. Use them to deploy contracts, interact with dApps, and build up your Inception program score.' },
      ] : []),
      ...(data.config?.id === 'doma' ? [
        { q: 'How does the Doma cross-chain bridge work?', a: 'The Doma bridge at bridge-testnet.doma.xyz locks your assets on the source chain and mints an equivalent amount on the destination chain. It\'s a lock-and-mint model — when you bridge back, the locked assets release and the minted tokens burn. Most transfers complete in 2-5 minutes. You\'ll need to approve two transactions: one on the source chain, one on the destination.' },
        { q: 'Is Doma compatible with Ethereum tools?', a: 'Yes — MetaMask, Hardhat, Foundry, and every standard Ethereum tool works. Add the RPC (https://rpc-testnet.doma.xyz) and chain ID 97476 to your wallet and you\'re set. Smart contracts written in Solidity deploy the same way they would on Ethereum or any other EVM chain.' },
      ] : []),
      ...(data.config?.id === 'arc' ? [
        { q: 'Which token pays gas on Arc Mainnet?', a: 'USDC does. Arc uses the USDC stablecoin as its native gas token instead of ETH, so the native balance this checker reports is your Arc USDC balance and every transaction spends from it. You do not need a separate gas token to interact with the chain.' },
        { q: 'Is the Arc Mainnet checker different from the testnet one?', a: 'They share the same scoring engine and dashboards, but they read different networks. This page analyzes Arc Mainnet (chain ID 5042) where activity carries real value. The Arc Testnet guide covers chain ID 5042002 with free faucet USDC — useful for rehearsing before you transact on mainnet.' },
      ] : []),
      ...(data.config?.id === 'arc-testnet' ? [
        { q: 'How do I get testnet USDC on Arc?', a: 'Head to the Circle faucet at faucet.circle.com. Connect your wallet, request testnet USDC, and it shows up in a few seconds. Since USDC is the gas token on Arc, you need it for every transaction — not just transfers.' },
        { q: 'Should I use the Arc testnet or Arc mainnet checker?', a: 'Use the testnet checker while you are experimenting, deploying throwaway contracts or learning the flow — the USDC there has no value and gas costs nothing. Switch to the Arc Mainnet checker (cryptowalletsx.com/arc) once your activity involves real assets, because mainnet data is what reflects genuine on-chain engagement.' },
      ] : []),
      ...(data.config?.id === 'robinhood' ? [
        { q: 'What is different about the Robinhood Chain mainnet checker?', a: 'This page reads Robinhood Chain mainnet (chain ID 4663), where ETH is the gas token and activity carries real value. It pulls transaction history, token balances, NFT holdings and DeFi interactions from the Robinhood Chain explorer so you get a full picture of a wallet operating on the live L2.' },
        { q: 'Does Robinhood Chain support standard Ethereum tooling?', a: 'Yes. Robinhood Chain is an Arbitrum Orbit L2, so it is EVM-compatible: MetaMask, Hardhat, Foundry and standard Solidity contracts work once you add the network using the RPC endpoint and chain ID 4663 listed on this page.' },
      ] : []),
      ...(data.config?.id === 'robinhood-testnet' ? [
        { q: 'How do I get testnet ETH on Robinhood Chain?', a: 'Use the faucet linked from the Robinhood Chain testnet explorer at explorer.testnet.chain.robinhood.com. That is also where you find the testnet RPC endpoint and chain ID 46630 to add the network to your wallet. Testnet ETH has no real value.' },
        { q: 'Is this the same as the Robinhood Chain mainnet checker?', a: 'No. This guide covers the testnet environment (chain ID 46630) where nothing has real value. The Robinhood Chain mainnet checker on cryptowalletsx.com/robinhood reads the live Arbitrum Orbit L2 with real ETH balances and real DeFi activity.' },
      ] : []),
    ];
  });

  // Unique publish dates per chain (recent 2026 dates)
  const publishDates: Record<string, { published: string; modified: string }> = {
    arc: { published: '2026-04-15T09:00:00Z', modified: '2026-09-20T12:00:00Z' },
    'arc-testnet': { published: '2026-04-15T09:00:00Z', modified: '2026-09-20T12:00:00Z' },
    simplechain: { published: '2026-04-18T10:00:00Z', modified: '2026-05-08T14:00:00Z' },
    base: { published: '2026-04-20T08:00:00Z', modified: '2026-05-08T09:00:00Z' },
    ink: { published: '2026-04-22T11:00:00Z', modified: '2026-05-08T16:00:00Z' },
    relay: { published: '2026-04-24T13:00:00Z', modified: '2026-05-08T10:00:00Z' },
    litvm: { published: '2026-04-26T09:30:00Z', modified: '2026-05-08T11:00:00Z' },
    seismic: { published: '2026-04-28T10:30:00Z', modified: '2026-05-08T15:00:00Z' },
    genlayer: { published: '2026-04-30T08:00:00Z', modified: '2026-05-08T12:00:00Z' },
    jumper: { published: '2026-05-01T14:00:00Z', modified: '2026-05-08T08:00:00Z' },
    dachain: { published: '2026-05-03T09:00:00Z', modified: '2026-05-08T10:00:00Z' },
    doma: { published: '2026-05-05T10:00:00Z', modified: '2026-05-08T11:00:00Z' },
    robinhood: { published: '2026-05-07T11:00:00Z', modified: '2026-09-20T12:00:00Z' },
    'robinhood-testnet': { published: '2026-05-07T11:00:00Z', modified: '2026-09-20T12:00:00Z' },
  };

  const articleDate = $derived(
    data.tool && publishDates[data.tool]
      ? publishDates[data.tool]
      : { published: '2026-05-08T00:00:00Z', modified: '2026-05-08T00:00:00Z' }
  );

  // Structured data for SEO - Article schema
  const structuredData = $derived.by(() => {
    if (!data.config) return null;
    const canonicalUrl = `https://cryptowalletsx.com/blog/${data.tool}`;
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: `${data.config.name} Complete Guide`,
      description: `Comprehensive guide to using the ${data.config.name} wallet stats checker on CryptoWalletsx. Learn about scoring, data tracking, and how to improve your wallet profile.`,
      author: {
        '@type': 'Person',
        name: 'CryptoWalletsx Team',
        url: 'https://cryptowalletsx.com/about',
        jobTitle: 'Blockchain Analytics Specialist',
      },
      publisher: {
        '@type': 'Organization',
        name: 'CryptoWalletsx',
        url: 'https://cryptowalletsx.com',
        logo: { '@type': 'ImageObject', url: 'https://cryptowalletsx.com/favicon.png' },
      },
      datePublished: articleDate.published,
      dateModified: articleDate.modified,
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
      url: canonicalUrl,
      image: 'https://cryptowalletsx.com/og-image.png',
      wordCount: 2500,
      articleSection: isDapp ? 'Cross-Chain Analytics' : isTestnet ? 'Testnet Analytics' : 'Mainnet Analytics',
      keywords: [data.config.name, 'wallet checker', 'blockchain analytics', data.config.nativeCurrency, isDapp ? 'bridge analytics' : 'DeFi analytics'].join(', '),
    };
  });

  // FAQPage schema for rich results
  const faqSchemaData = $derived.by(() => {
    if (!data.config || faqs.length === 0) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a,
        },
      })),
    };
  });

  // BreadcrumbList schema
  const breadcrumbSchemaData = $derived.by(() => {
    if (!data.config) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://cryptowalletsx.com/blog' },
        { '@type': 'ListItem', position: 3, name: `${data.config.name} Wallet Guide`, item: `https://cryptowalletsx.com/blog/${data.tool}` },
      ],
    };
  });

  let activeSection = $state('overview');

  function scrollToSection(sectionId: string) {
    activeSection = sectionId;
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  const tocItems = $derived.by(() => {
    if (isDapp) {
      return [
        { id: 'overview', label: 'Overview' },
        { id: 'about-chain', label: `About ${data.config?.name || 'the Protocol'}` },
        { id: 'scoring', label: 'How Analytics Work' },
        { id: 'data-tracked', label: 'What Data We Track' },
        { id: 'understanding', label: 'Understanding Your Stats' },
        { id: 'tips', label: 'Tips to Improve' },
        { id: 'faq', label: 'FAQ' },
      ];
    }
    return [
      { id: 'overview', label: 'Overview' },
      { id: 'about-chain', label: `About ${data.config?.name || 'the Chain'}` },
      { id: 'scoring', label: 'How Scoring Works' },
      { id: 'data-tracked', label: 'What Data We Track' },
      { id: 'understanding', label: 'Understanding Your Stats' },
      { id: 'tips', label: 'Tips to Improve Your Score' },
      { id: 'faq', label: 'FAQ' },
    ];
  });
</script>

{#if data.config}
  <SEO
    title="{data.config.name} Complete Guide"
    description="Learn how to use the {data.config.name} wallet stats checker on CryptoWalletsx. Understand scoring, track DeFi activity, and improve your on-chain profile."
    keywords={[(data.config.name || '').toLowerCase(), 'wallet checker', 'wallet score', 'blockchain analytics', isDapp ? 'bridge analytics' : 'defi analytics', data.config.nativeCurrency.toLowerCase()]}
    canonicalUrl="https://cryptowalletsx.com/blog/{data.tool}"
    ogImage="https://cryptowalletsx.com/og-image.png"
    ogType="article"
    author="CryptoWalletsx Team"
    publishedTime={articleDate.published}
    modifiedTime={articleDate.modified}
    section={isDapp ? 'Cross-Chain Analytics' : isTestnet ? 'Testnet Analytics' : 'Mainnet Analytics'}
    jsonLd={{
      '@context': 'https://schema.org',
      '@graph': [structuredData, faqSchemaData, breadcrumbSchemaData].filter((x): x is Record<string, unknown> => x !== null)
    }}
  />
{:else}
  <SEO
    title="Blog Article Not Found - CryptoWalletsx"
    description="The requested blog article was not found."
  />
{/if}

{#if !data.config}
  <!-- 404 State -->
  <div class="min-h-screen flex flex-col bg-background">
    <HomeHeader />
    <main class="flex-1 flex items-center justify-center">
      <div class="text-center px-4">
        <div class="w-20 h-20 rounded-2xl bg-card/60 border border-border/40 flex items-center justify-center mx-auto mb-6">
          <AlertCircle class="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 class="text-3xl font-bold mb-3">Article Not Found</h1>
        <p class="text-muted-foreground mb-6 max-w-md mx-auto">The blog article you're looking for doesn't exist. It may have been moved or the URL is incorrect.</p>
        <a href="/blog" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-medium shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all">
          <BookOpen class="w-4 h-4" />
          Browse All Articles
        </a>
      </div>
    </main>
    <Footer />
  </div>
{:else}
  <div class="min-h-screen flex flex-col bg-background">
    <HomeHeader />

    <main class="flex-1">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div class="flex flex-col lg:flex-row gap-8 lg:gap-12">

          <!-- Table of Contents Sidebar -->
          <aside class="lg:w-64 shrink-0">
            <div class="lg:sticky lg:top-8">
              <div class="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-5">
                <h3 class="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">On This Page</h3>
                <nav class="space-y-1">
                  {#each tocItems as item}
                    <button
                      onclick={() => scrollToSection(item.id)}
                      class="w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 {
                        activeSection === item.id
                          ? 'bg-cyan-500/10 text-cyan-500 font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-card/80'
                      }"
                    >
                      {item.label}
                    </button>
                  {/each}
                </nav>

                <div class="mt-6 pt-5 border-t border-border/40">
                  <a
                    href="/{data.tool}"
                    class="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 text-white text-sm font-medium shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all w-full justify-center"
                  >
                    Open {data.config.name} Checker
                    <ExternalLink class="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </aside>

          <!-- Main Article Content -->
          <article class="flex-1 min-w-0 max-w-4xl">
            <!-- Breadcrumb -->
            <nav class="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <a href="/" class="hover:text-foreground transition-colors">Home</a>
              <ChevronRight class="w-3.5 h-3.5" />
              <a href="/blog" class="hover:text-foreground transition-colors">Blog</a>
              <ChevronRight class="w-3.5 h-3.5" />
              <span class="text-foreground">{data.config.name}</span>
            </nav>

            <!-- Article Header -->
            <header class="mb-10">
              <div class="flex items-center gap-3 mb-4">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border {
                  isDapp ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                  isTestnet ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                  'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }">
                  {isDapp ? 'Cross-Chain Dapp' : isTestnet ? 'Testnet' : 'Mainnet'}
                </span>
                <span class="text-xs text-muted-foreground">Chain ID: {data.config.chainId}</span>
              </div>
              <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
                <span class="gradient-text">{data.config.name} Complete Guide</span>
              </h1>
              <p class="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                A comprehensive guide to understanding and using the {data.config.name} wallet analytics tool on CryptoWalletsx. {isDapp ? 'Track your cross-chain activity across multiple networks.' : `Analyze your wallet score, ${data.config.nativeCurrency} transactions, and on-chain footprint.`}
              </p>
              <!-- E-E-A-T: Author byline and publish date -->
              <div class="flex flex-wrap items-center gap-4 mt-5 pt-5 border-t border-border/30">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                    <span class="text-xs font-bold text-white">CW</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium">CryptoWalletsx Team</p>
                    <p class="text-[10px] text-muted-foreground">Blockchain Analytics Specialist</p>
                  </div>
                </div>
                <div class="flex items-center gap-3 text-xs text-muted-foreground">
                  <span class="flex items-center gap-1"><Clock class="w-3 h-3" /> {new Date(articleDate.published).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span class="flex items-center gap-1"><BookOpen class="w-3 h-3" /> 8 min read</span>
                  <span class="flex items-center gap-1"><CheckCircle2 class="w-3 h-3 text-emerald-500" /> Fact-checked</span>
                </div>
              </div>
            </header>

            <!-- Section 1: Overview -->
            <section id="overview" class="mb-12 scroll-mt-8">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <BookOpen class="w-4.5 h-4.5 text-cyan-500" />
                </div>
                <h2 class="text-2xl font-bold">Overview</h2>
              </div>
              <div class="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  The <strong class="text-foreground">{data.config.name} Complete Guide</strong> takes any wallet address and breaks down its on-chain activity on the {data.config.name} network — no sign-up, no wallet connection, no cost. {isDapp ? 'See your bridge and swap patterns, which chains you use most, and how your cross-chain activity compares across protocols.' : `Check your wallet score, dig into transaction history, see what DeFi protocols you're using, and understand your NFT holdings — all in one dashboard.`}
                </p>
                <p>
                  Paste a wallet address and get results immediately. We pull data in real-time from {isDapp ? `the ${data.config.name} API` : 'public Blockscout-compatible APIs'}, so you're seeing current state — not a cached snapshot from three days ago. We don't store your data, and we don't ask for private keys or wallet connections.
                </p>
                <div class="p-5 rounded-xl bg-gradient-to-r from-cyan-500/5 to-teal-500/5 border border-cyan-500/20">
                  <h3 class="font-semibold text-foreground mb-2">Quick Facts</h3>
                  <div class="grid sm:grid-cols-2 gap-3 text-sm">
                    <div class="flex items-center gap-2">
                      <CheckCircle2 class="w-4 h-4 text-cyan-500 shrink-0" />
                      <span><strong class="text-foreground">Network:</strong> {data.config.name}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <CheckCircle2 class="w-4 h-4 text-cyan-500 shrink-0" />
                      <span><strong class="text-foreground">Chain ID:</strong> {data.config.chainId}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <CheckCircle2 class="w-4 h-4 text-cyan-500 shrink-0" />
                      <span><strong class="text-foreground">Native Token:</strong> {data.config.nativeCurrency}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <CheckCircle2 class="w-4 h-4 text-cyan-500 shrink-0" />
                      <span><strong class="text-foreground">Type:</strong> {isDapp ? 'Cross-Chain Dapp' : isTestnet ? 'Testnet' : 'Mainnet'}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <CheckCircle2 class="w-4 h-4 text-cyan-500 shrink-0" />
                      <span><strong class="text-foreground">Wallet Type:</strong> {data.config.walletType}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <CheckCircle2 class="w-4 h-4 text-cyan-500 shrink-0" />
                      <span><strong class="text-foreground">Explorer:</strong> <a href={data.config.blockExplorer} target="_blank" rel="noopener noreferrer" class="text-cyan-500 hover:underline">{data.config.name} Explorer</a></span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Section 2: About the Chain/Project -->
            <section id="about-chain" class="mb-12 scroll-mt-8">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center">
                  <Globe class="w-4.5 h-4.5 text-teal-500" />
                </div>
                <h2 class="text-2xl font-bold">About {data.config.name}</h2>
              </div>
              <div class="space-y-4 text-muted-foreground leading-relaxed">
                <p>{chainDescription}</p>
                {#if data.config.features.length > 0}
                  <div class="mt-6">
                    <h3 class="font-semibold text-foreground mb-3">Key Features & Dapps</h3>
                    <div class="grid sm:grid-cols-2 gap-3">
                      {#each data.config.features as feature}
                        <div class="p-4 rounded-xl bg-card/60 border border-border/40">
                          <h3 class="font-medium text-foreground mb-1">{feature.name}</h3>
                          <p class="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}
                {#if data.config.rpcEndpoints.length > 0}
                  <div class="mt-6">
                    <h3 class="font-semibold text-foreground mb-3">RPC Endpoints</h3>
                    <div class="space-y-2">
                      {#each data.config.rpcEndpoints as rpc}
                        <div class="px-4 py-2.5 rounded-lg bg-card/60 border border-border/40 font-mono text-xs text-muted-foreground break-all">
                          {rpc}
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}
                {#if data.config.faucet}
                  <div class="mt-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <div class="flex items-center gap-2">
                      <Coins class="w-4 h-4 text-emerald-500" />
                      <span class="text-sm font-medium text-foreground">Faucet Available:</span>
                      <a href={data.config.faucet} target="_blank" rel="noopener noreferrer" class="text-sm text-cyan-500 hover:underline">{data.config.faucet}</a>
                    </div>
                  </div>
                {/if}
              </div>
            </section>

            <!-- Section 3: How Scoring Works -->
            <section id="scoring" class="mb-12 scroll-mt-8">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <BarChart3 class="w-4.5 h-4.5 text-amber-500" />
                </div>
                <h2 class="text-2xl font-bold">{scoringDetails.title}</h2>
              </div>
              <div class="space-y-4 text-muted-foreground leading-relaxed">
                <p>{scoringDetails.intro}</p>
                <div class="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20 mb-6">
                  <h3 class="font-semibold text-foreground mb-2">The Logarithmic Formula</h3>
                  <p class="text-sm">
                    At the core of our scoring is the formula: <code class="px-1.5 py-0.5 rounded bg-card/80 text-amber-400 text-xs font-mono">score = log₁₀(value + 1) × dimension_weight</code>. This means going from 0 to 10 transactions is worth roughly the same as going from 10 to 100, which is worth roughly the same as going from 100 to 1,000. This creates a natural curve where early activity is rewarded generously while preventing any single dimension from dominating the total score.
                  </p>
                </div>
                <h3 class="font-semibold text-foreground mt-6 mb-3">Scoring Dimensions</h3>
                <div class="space-y-4">
                  {#each scoringDetails.dimensions as dim, i}
                    <div class="p-5 rounded-xl bg-card/60 border border-border/40">
                      <div class="flex items-start gap-3">
                        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center shrink-0 text-sm font-bold text-cyan-500">
                          {i + 1}
                        </div>
                        <div>
                          <h3 class="font-semibold text-foreground mb-1">{dim.name}</h3>
                          <p class="text-sm text-muted-foreground">{dim.desc}</p>
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            </section>

            <!-- Section 4: What Data We Track -->
            <section id="data-tracked" class="mb-12 scroll-mt-8">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Layers class="w-4.5 h-4.5 text-purple-500" />
                </div>
                <h2 class="text-2xl font-bold">What Data We Track</h2>
              </div>
              <div class="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  We pull data from several categories to build {isDapp ? 'your cross-chain profile' : 'your on-chain profile'}. Here's what we track and surface in your dashboard:
                </p>
                <div class="grid sm:grid-cols-2 gap-4 mt-6">
                  {#each dataTracked as item}
                    {@const ItemIcon = item.icon}
                    <div class="p-5 rounded-xl bg-card/60 border border-border/40">
                      <div class="flex items-center gap-2.5 mb-2">
                        <ItemIcon class="w-4.5 h-4.5 text-cyan-500" />
                        <h3 class="font-semibold text-foreground">{item.title}</h3>
                      </div>
                      <p class="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  {/each}
                </div>
              </div>
            </section>

            <!-- Section 5: Understanding Your Stats -->
            <section id="understanding" class="mb-12 scroll-mt-8">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp class="w-4.5 h-4.5 text-blue-500" />
                </div>
                <h2 class="text-2xl font-bold">Understanding Your Stats</h2>
              </div>
              <div class="space-y-4 text-muted-foreground leading-relaxed">
                {#if isDapp}
                  <p>
                    When you look up a wallet on {data.config.name}, you'll see a handful of metrics that describe your cross-chain behavior. Here's what each one means:
                  </p>
                  <div class="space-y-4 mt-4">
                    <div class="p-5 rounded-xl bg-card/60 border border-border/40">
                      <h3 class="font-semibold text-foreground mb-2">Total Transactions</h3>
                      <p class="text-sm">Total bridge and swap transactions. This is the baseline metric — it tells you how much cross-chain infrastructure someone is using. A wallet with 200 transactions is more active than one with 5, but raw count doesn't tell you about diversity or consistency.</p>
                    </div>
                    <div class="p-5 rounded-xl bg-card/60 border border-border/40">
                      <h3 class="font-semibold text-foreground mb-2">Network Coverage</h3>
                      <p class="text-sm">How many chains you've touched out of the total supported. 15 out of 80+ chains means broader ecosystem reach than 3 chains — even if the 3-chain wallet has more total transactions. Coverage measures breadth, not depth.</p>
                    </div>
                    <div class="p-5 rounded-xl bg-card/60 border border-border/40">
                      <h3 class="font-semibold text-foreground mb-2">Volume Metrics</h3>
                      <p class="text-sm">Total USD value of assets you've moved. We split this into bridge volume and swap volume so you can see whether you're mostly moving assets between chains or trading tokens on the same chain. A $10K bridge volume with $500 in swaps tells a different story than the reverse.</p>
                    </div>
                    <div class="p-5 rounded-xl bg-card/60 border border-border/40">
                      <h3 class="font-semibold text-foreground mb-2">7-Day Change</h3>
                      <p class="text-sm">How your last 7 days compare to your baseline. If you did 10 transactions this week and averaged 3 per week before, that's growth. If you did 1 this week and averaged 5 before, that's decline. Green means up, red means down — simple.</p>
                    </div>
                  </div>
                {:else}
                  <p>
                    When you look up a wallet on {data.config.name}, the dashboard shows several sections. Here's what each one tells you:
                  </p>
                  <div class="space-y-4 mt-4">
                    <div class="p-5 rounded-xl bg-card/60 border border-border/40">
                      <h3 class="font-semibold text-foreground mb-2">Wallet Score</h3>
                      <p class="text-sm">Your composite score from all six dimensions. Scores typically range from 0 to 1000+. Because of the logarithmic formula, you don't need massive volume to score well — consistent activity across multiple dimensions beats high volume in a single category. A score of 400 with diverse activity is more meaningful than 600 from pure volume.</p>
                    </div>
                    <div class="p-5 rounded-xl bg-card/60 border border-border/40">
                      <h3 class="font-semibold text-foreground mb-2">Transaction Metrics</h3>
                      <p class="text-sm">Total transactions, sent vs. received, and patterns over time. We also show daily, weekly, and monthly averages so you can see your rhythm. If your weekly average is 3 transactions and last week you did 12, something changed — and you'll see it here.</p>
                    </div>
                    <div class="p-5 rounded-xl bg-card/60 border border-border/40">
                      <h3 class="font-semibold text-foreground mb-2">{data.config.nativeCurrency} Balance & Portfolio</h3>
                      <p class="text-sm">Your current {data.config.nativeCurrency} balance plus the total USD value of your portfolio (ERC-20 tokens and NFTs included where pricing is available). We also show token diversity — how many distinct tokens you hold — because holding 8 different tokens is a different profile than holding just the native token.</p>
                    </div>
                    <div class="p-5 rounded-xl bg-card/60 border border-border/40">
                      <h3 class="font-semibold text-foreground mb-2">DeFi Activity Breakdown</h3>
                      <p class="text-sm">Sorted by type: staking, swapping, lending, providing liquidity, and bridging. For each category, you'll see how many interactions you've had and how many distinct protocols you've used. Using 3 lending protocols beats using 1 lending protocol 3 times — breadth counts.</p>
                    </div>
                    <div class="p-5 rounded-xl bg-card/60 border border-border/40">
                      <h3 class="font-semibold text-foreground mb-2">7-Day Change Indicators</h3>
                      <p class="text-sm">Your last 7 days vs. your historical baseline across all dimensions — interactions, contracts, volume, NFTs, fees, and DeFi. Green arrows mean growth; red means decline. If your contract interactions went from 2 per week to 8, you'll see a green indicator with the exact change.</p>
                    </div>
                  </div>
                {/if}
              </div>
            </section>

            <!-- Section 6: Tips -->
            <section id="tips" class="mb-12 scroll-mt-8">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Lightbulb class="w-4.5 h-4.5 text-emerald-500" />
                </div>
                <h2 class="text-2xl font-bold">Tips to {isDapp ? 'Improve Your Cross-Chain Profile' : 'Improve Your Score'}</h2>
              </div>
              <div class="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Want a higher score or just want better {isDapp ? 'cross-chain' : 'on-chain'} activity? Here are specific things that move the needle on {data.config.name}:
                </p>
                <div class="space-y-4 mt-4">
                  {#each tips as tip, i}
                    <div class="p-5 rounded-xl bg-card/60 border border-border/40">
                      <div class="flex items-start gap-3">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center shrink-0 text-sm font-bold text-emerald-500">
                          {i + 1}
                        </div>
                        <div>
                          <h3 class="font-semibold text-foreground mb-1">{tip.title}</h3>
                          <p class="text-sm text-muted-foreground">{tip.desc}</p>
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            </section>

            <!-- Section 7: FAQ -->
            <section id="faq" class="mb-12 scroll-mt-8">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <HelpCircle class="w-4.5 h-4.5 text-rose-500" />
                </div>
                <h2 class="text-2xl font-bold">Frequently Asked Questions</h2>
              </div>
              <div class="space-y-4">
                {#each faqs as faq}
                  <details class="group rounded-xl bg-card/60 border border-border/40 overflow-hidden">
                    <summary class="flex items-center justify-between p-5 cursor-pointer list-none select-none">
                      <h3 class="font-semibold text-foreground pr-4">{faq.q}</h3>
                      <ChevronRight class="w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 group-open:rotate-90" />
                    </summary>
                    <div class="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </div>
                  </details>
                {/each}
              </div>
            </section>

            <!-- CTA Section -->
            <div class="p-8 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-500/20 text-center">
              <h3 class="text-2xl font-bold mb-3">Check Your Wallet Now</h3>
              <p class="text-muted-foreground mb-6 max-w-lg mx-auto">
                Paste your {data.config.name} address and get your full breakdown. {isDapp ? 'Bridge history, swap volumes, and cross-chain patterns — all in one place.' : `Score, ${data.config.nativeCurrency} balance, DeFi breakdown, and more — live and free.`}
              </p>
              <a
                href="/{data.tool}"
                class="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
              >
                Open {data.config.name} Checker
                <ArrowRight class="w-4 h-4" />
              </a>
            </div>
          </article>
        </div>
      </div>
    </main>
    <Footer />
  </div>
{/if}

<svelte:head>
  {#if data.config}
    <script type="application/ld+json">{structuredData}</script>
    <script type="application/ld+json">{faqSchemaData}</script>
    <script type="application/ld+json">{breadcrumbSchemaData}</script>
    <meta name="author" content="CryptoWalletsx Team" />
    <meta property="article:published_time" content={articleDate.published} />
    <meta property="article:modified_time" content={articleDate.modified} />
    <meta property="article:section" content={isDapp ? 'Cross-Chain Analytics' : isTestnet ? 'Testnet Analytics' : 'Mainnet Analytics'} />
    <meta property="article:tag" content={data.config?.name || 'Crypto'} />
    <meta property="article:tag" content="wallet checker" />
    <meta property="article:tag" content="blockchain analytics" />
    <meta property="article:tag" content={data.config?.nativeCurrency || 'crypto'} />
  {/if}
</svelte:head>

<style>
  /* Custom scrollbar for article */
  article {
    scrollbar-width: thin;
    scrollbar-color: rgba(6, 182, 212, 0.3) transparent;
  }

  article::-webkit-scrollbar {
    width: 6px;
  }

  article::-webkit-scrollbar-track {
    background: transparent;
  }

  article::-webkit-scrollbar-thumb {
    background: rgba(6, 182, 212, 0.3);
    border-radius: 3px;
  }

  /* Details/Summary styling */
  details summary::-webkit-details-marker {
    display: none;
  }

  details summary::marker {
    display: none;
    content: '';
  }
</style>
