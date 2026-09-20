<script lang="ts">
  import { ChevronDown, Search, Wallet, BarChart3, FileText, HelpCircle, Info, ArrowRight, Activity, Zap } from 'lucide-svelte';
  import type { ChainConfig } from '$lib/types';

  interface Props {
    config: ChainConfig;
    // Host route pages that already emit their own FAQPage entity pass false here
    // so the same URL does not ship two FAQPage blocks.
    emitFaqSchema?: boolean;
  }

  let { config, emitFaqSchema = true }: Props = $props();

  let openFaq = $state<number | null>(null);

  const isDapp = $derived(config.apiType === 'relay-dapp' || config.apiType === 'jumper-dapp');
  const chainId = $derived(config.id);

  function toggleFaq(index: number) {
    openFaq = openFaq === index ? null : index;
  }

  // Chain-specific "About" content
  const aboutContent: Record<string, string[]> = {
    arc: [
      `Arc Mainnet is Circle's USDC-native public Layer-1, and the detail that matters most is what pays for gas: USDC, not ETH. Every transaction draws from the same stablecoin balance you hold, so there is no separate gas token to top up. Fees land in fractions of a cent and blocks are quick, which keeps swapping, lending and bridging cheap.`,
      `Because Circle issues the USDC and operates the network, the stablecoin rails are native rather than bolted on. Arc is EVM-compatible, so MetaMask, Hardhat and Foundry work after you add the network with the RPC endpoint and chain ID listed on this page. Existing Solidity contracts deploy the same way they do on any other EVM chain.`,
      `The honest trade-off is maturity. Arc is newer than Base or Arbitrum, so the list of live dApps is shorter and liquidity is thinner. If you want deep DeFi, established L2s still win. If you want to see what a stablecoin-first chain looks like in practice — and track a wallet operating on it — Arc is the one to watch.`
    ],
    'arc-testnet': [
      `Arc Testnet is the rehearsal stage for the mainnet network, using the same USDC-as-gas design but with free faucet USDC that holds no real value. Gas costs effectively nothing, so you can deploy contracts, swap on testnet DEXs, mint NFTs and iterate without watching a balance drain.`,
      `It is the right place to learn how the checker's scoring reacts to your activity before you touch real assets. MetaMask works out of the box; you add the testnet RPC and chain ID 5042002, pull USDC from the Circle faucet at faucet.circle.com, and start transacting.`,
      `The limit is obvious: nothing here carries economic weight. A strong testnet score means you know how to use the chain, not that real value is flowing through it. Use it as a dry run, then check the same wallet on Arc Mainnet to see how your real activity scores.`
    ],
    simplechain: [
      `SimpleChain does exactly what it says on the tin. It's a straightforward EVM testnet where you can learn the ropes without getting lost in complex tooling or niche features. The native token is SRW, and that's pretty much all you need to know to get started.`,
      `There's no flashy DeFi ecosystem here, no NFT marketplace, no governance token drama. Just a clean sandbox for deploying contracts, testing transactions, and getting comfortable with how EVM chains work. Sometimes that's exactly what you need — especially if you're just starting out.`,
      `The block explorer is simple, the RPC is simple, the whole thing is simple. And honestly? That's refreshing. Not every chain needs to be a sprawling ecosystem. Sometimes you just want to deploy a contract, call a function, and confirm it worked.`
    ],
    base: [
      `Base is Coinbase's Ethereum L2, built on the OP Stack. That sentence alone tells you a lot — it's got serious institutional backing, deep liquidity, and a user base that's already comfortable with crypto. Transactions cost under a penny and confirm in about 2 seconds.`,
      `The TVL speaks for itself: over $6 billion locked. That's not testnet money or speculative hype. That's real DeFi activity — Aerodrome, Morpho, Aave, and dozens of other protocols are live and thriving. If you're building on Base, you're building where the users already are.`,
      `What makes Base interesting beyond the numbers is the ecosystem play. Coinbase has 100M+ verified users. Base is positioned to be the on-ramp for a lot of them. The Farcaster integration, the smart wallet infrastructure, the developer tooling — it all points toward making crypto feel less like a hobbyist project and more like a product people actually use.`
    ],
    ink: [
      `Ink is Kraken's entry into the L2 space, built on the OP Stack like Base. That means it inherits the same fast confirmations and low fees, but with Kraken's ecosystem behind it instead of Coinbase's. The chain is live and operational, but it's still early days compared to more established L2s.`,
      `The DeFi ecosystem on Ink is thinner than what you'd find on Base or Arbitrum. Fewer protocols, less liquidity, smaller TVL. But that's not necessarily a bad thing if you're looking for early opportunities or want to be part of building out the infrastructure from scratch.`,
      `What Ink has going for it is Kraken's reputation and user base. Kraken is one of the oldest and most respected exchanges in crypto. If they push their users toward Ink — and they've signaled that they will — the activity could ramp up fast. Right now, it's a chain for people who like getting in early.`
    ],
    litvm: [
      `LitVM is an Arbitrum Nitro L2 running on Sepolia with zkLTC as its native token. If you've used any Arbitrum chain before, the developer experience will feel familiar. It's EVM-compatible, so your existing Solidity contracts and tooling work without modification.`,
      `The community around LitVM is small but active. You won't find the same level of DeFi activity or protocol diversity as on mainnet L2s, but that's expected for a testnet. What you will find is a functioning chain where you can test deployments, experiment with transactions, and get a feel for how L2s operate.`,
      `The zkLTC token is the native currency here, which gives LitVM a bit of a unique identity compared to the flood of ETH-denominated testnets. It's a solid choice for developers who want to test on an Arbitrum-style chain without dealing with mainnet costs.`
    ],
    seismic: [
      `Seismic is a testnet that does something most chains don't: encrypted smart contracts. The chain uses zero-knowledge proofs and encrypted computation, which means you can run contracts where the inputs and outputs aren't visible to everyone on-chain. That's a big deal for anything that needs privacy.`,
      `The trade-off? Gas overhead. Encryption and ZK proofs add computational cost to every transaction. You'll notice higher gas fees compared to a standard EVM chain. That's the price of privacy, and it's worth understanding before you start building.`,
      `Seismic runs on ETH as its native currency, and it's EVM-compatible at the core. You can use MetaMask, deploy Solidity contracts, and follow the same workflows you're used to. The encrypted computation layer is what sets it apart — if your use case needs confidential on-chain logic, this is where you experiment.`
    ],
    genlayer: [
      `GenLayer throws out the standard blockchain consensus model and replaces it with AI validators. Instead of deterministic execution where every node runs the same code and gets the same result, GenLayer's validators use AI to evaluate and agree on outcomes. That's a fundamentally different approach to how smart contracts work.`,
      `And here's the kicker: contracts are written in Python, not Solidity. If you're a Python developer who's been put off by Solidity's quirks, GenLayer is built for you. The "intelligent contracts" can make API calls, process natural language, and handle non-deterministic logic that would be impossible on a traditional EVM chain.`,
      `The Bradbury testnet is where all of this is being tested right now. The GEN token powers the network. It's experimental, it's ambitious, and it's not trying to be just another L2. Whether AI-driven consensus actually works at scale is an open question, but GenLayer is one of the few projects actually trying to answer it.`
    ],
    relay: [
      `Relay isn't a blockchain — it's a cross-chain bridge and swap protocol that connects over 80 different networks. You give it a source chain, a destination chain, and a token, and it figures out the best route. Sometimes that's a direct bridge, sometimes it hops through intermediate chains. The routing algorithm optimizes for price and speed automatically.`,
      `The volume numbers are real: Relay processes over $500 million in monthly transactions. That's not theoretical. People use this thing heavily, and for good reason — it's one of the fastest ways to move assets between chains without manually checking which bridge has the best rate.`,
      `For anyone managing positions across multiple chains, Relay is a core piece of infrastructure. The analytics here tell you not just what you've bridged, but how your cross-chain behavior compares to other users. Which chains you favor, which tokens you move most, and how your bridge activity has evolved over time.`
    ],
    jumper: [
      `Jumper is built on top of Li.Fi's aggregation technology. Instead of running its own bridges, it compares routes across 15+ different bridge protocols to find you the cheapest or fastest way to move assets between chains. Think of it like a flight aggregator, but for cross-chain transfers.`,
      `The Li.Fi API that powers Jumper is one of the most comprehensive bridge aggregation services in the space. It covers everything from big names like Stargate and Across to smaller, niche bridges. The comparison isn't just about price — it factors in speed, gas costs on both chains, and liquidity availability.`,
      `If you're someone who regularly bridges assets, Jumper's analytics give you a clear picture of your cross-chain activity. Which protocols you actually use, which routes are your go-to, how much you're spending on fees, and whether your bridge choices are optimal. It's a level of insight you don't get from just using the bridge UI.`
    ],
    dachain: [
      `DAC Quantum Chain is a testnet built around post-quantum cryptography. While most blockchains use elliptic curve signatures that quantum computers could theoretically break, DAC uses lattice-based and hash-based signatures that are designed to resist quantum attacks. That's not a theoretical concern anymore — it's a legitimate future-proofing play.`,
      `The chain is in its "Inception" phase, which means there's an active program encouraging early participation. You can claim testnet tokens, deploy contracts, and earn quantum badges. The DAC token is the native currency, and the whole ecosystem is geared toward building and testing quantum-resistant applications.`,
      `Should you care about post-quantum crypto today? Depends on your timeline. If you're building something that needs to be secure for decades, absolutely. If you're just testing contracts for fun, DAC still works as a functional EVM testnet — the quantum-resistant signatures are the differentiator, not the only feature.`
    ],
    doma: [
      `Doma is an L2 testnet with native cross-chain bridging built right in. Most L2s treat bridging as something you handle with external protocols. Doma bakes it into the chain itself, which makes moving assets between Doma and other networks feel like a first-class operation rather than a workaround.`,
      `It's EVM-compatible, so MetaMask works out of the box. No custom wallet setup, no weird RPC configuration headaches. You add the network, fund the wallet from the faucet, and you're off. The ETH-native environment means the learning curve is essentially flat if you've used any Ethereum L2 before.`,
      `The cross-chain bridge is the main draw here. If you're building an application that needs to interact with multiple chains, Doma's native bridging could save you from integrating third-party bridge contracts. It's still a testnet, so the bridge connects to other test environments — but the architecture is worth understanding if cross-chain is your thing.`
    ],
    robinhood: [
      `Robinhood Chain is an Arbitrum Orbit L2 built for tokenized stocks and real-world assets. It runs the same Nitro stack that powers Arbitrum One, so performance and tooling feel familiar: EVM-compatible contracts, standard wallets, fast blocks, and ETH as the gas token.`,
      `The interesting part is not the technology — it is the distribution behind it. Robinhood brings a large retail user base, and this chain is how that audience gets direct on-chain exposure. That is why the ecosystem is worth tracking even while it is still young.`,
      `Be realistic about the current state: fewer protocols than Arbitrum or Base, thinner liquidity, and an ecosystem that is still forming. For tokenized-equity and RWA use cases it is one of the few live environments to test against, which makes it useful for early exploration.`
    ],
    'robinhood-testnet': [
      `Robinhood Chain Testnet is the pre-production environment for the Arbitrum Orbit L2, running the same Nitro stack with free testnet ETH that carries no value. It exists so developers can rehearse deployments, transfers and dApp interactions before mainnet activity involves real assets.`,
      `The ecosystem here is thin by design. You will not find deep liquidity or dozens of protocols, because this is infrastructure being tested rather than a live market. What you do get is a faithful preview of the transaction flow, gas mechanics and tooling you will use on the mainnet chain.`,
      `Treat your score here as a dry run. The scoring engine works exactly as it does on mainnet, but nothing you do moves real money — and mainnet behavior can differ once liquidity arrives. Check the mainnet Robinhood Chain checker when you want a picture of real activity.`
    ]
  };

  // Chain-specific FAQs
  const faqContent: Record<string, Array<{ q: string; a: string }>> = {
    arc: [
      { q: 'What token pays gas on Arc Mainnet?', a: 'USDC. Arc uses Circle\'s stablecoin as its native gas token, so the balance shown at the top of this page is your Arc USDC balance and every transaction spends from it. You do not need a separate gas token to use the chain.' },
      { q: 'Is Arc Mainnet the same as Arc Testnet?', a: 'No. This checker reads Arc Mainnet (chain ID 5042), where USDC and activity carry real value. Arc Testnet runs the same design on chain ID 5042002 with free faucet USDC and is covered by the separate Arc Testnet checker.' },
      { q: 'How do I add Arc Mainnet to my wallet?', a: 'Add a custom network using the RPC endpoint and chain ID 5042 listed on this page. Any EVM wallet — MetaMask, Rabby, and others — works, because Arc is EVM-compatible.' },
      { q: 'How accurate is the wallet scoring on Arc?', a: 'The score is computed from live data returned by the Arc block explorer: transactions, token transfers, token balances, NFTs and contract interactions for that address. It reflects activity on Arc only, not on other networks.' },
      { q: 'What does my rank (Bronze, Silver, etc.) mean?', a: 'Ranks come from your total score out of 100. Bronze is 0-29, Silver is 30-49, Gold is 50-69, Platinum is 70-89, and Diamond is 90-100. Higher ranks reflect more diverse and consistent on-chain behaviour.' },
      { q: 'Can I use MetaMask with Arc?', a: 'Yes. Arc is EVM-compatible, so MetaMask and other EVM wallets work once the network is added. This checker never asks you to connect a wallet — it only reads public explorer data for the address you paste.' },
      { q: 'How often does the wallet data update?', a: 'Every time you scan an address, the page pulls fresh data from the Arc block explorer. Results are not cached on our side, so you always see the current snapshot of that wallet\'s activity.' }
    ],
    'arc-testnet': [
      { q: 'How do I get testnet USDC on Arc?', a: 'Head to the Circle faucet at faucet.circle.com. Connect your wallet, request testnet USDC, and it shows up in a few seconds. Since USDC is the gas token on Arc, you need it for every transaction — not just for transfers.' },
      { q: 'Is Arc Testnet USDC worth anything?', a: 'No. Testnet USDC has zero real-world value. It exists purely for testing, so never treat it as money or try to bridge it anywhere.' },
      { q: 'Why does Arc use USDC instead of ETH for gas?', a: 'Because Arc is built on Circle\'s infrastructure with the explicit goal of making USDC the primary currency. Using USDC for gas means you test in an environment that mirrors how the mainnet chain actually operates.' },
      { q: 'Can I use MetaMask with Arc Testnet?', a: 'Yes. Arc is EVM-compatible, so MetaMask, Rabby and any other EVM wallet works once you add the testnet network using the RPC endpoint and chain ID 5042002 listed on this page.' },
      { q: 'Does my Arc Testnet score affect anything on mainnet?', a: 'No. Testnet scoring only reflects testnet activity. Some projects treat testnet participation as a signal for early access, but there is no guarantee — and the score itself is a practice run.' },
      { q: 'Where is the mainnet checker?', a: 'The Arc Mainnet checker lives at cryptowalletsx.com/arc and reads chain ID 5042, where USDC and transactions carry real value. Use this testnet page while experimenting.' }
    ],
    simplechain: [
      { q: 'How do I get SRW tokens on SimpleChain?', a: 'Use the faucet or request tokens through the SimpleChain community channels. SRW is the native token — you need it for gas on every transaction.' },
      { q: 'Is SimpleChain suitable for production deployments?', a: 'No. SimpleChain is a testnet designed for learning and experimentation. Don\'t deploy anything here that you expect to be permanent or valuable.' },
      { q: 'What can I actually do on SimpleChain?', a: 'Deploy Solidity contracts, send SRW between wallets, and interact with contracts you\'ve deployed. It\'s a clean environment for testing without the complexity of a full DeFi ecosystem.' },
      { q: 'Does SimpleChain support ERC-20 and ERC-721 tokens?', a: 'Yes, since it\'s EVM-compatible, you can deploy and interact with standard ERC-20 and ERC-721 contracts. The block explorer tracks token transfers and NFT activity.' },
      { q: 'How is the wallet score calculated?', a: 'The score combines transaction count, contract interactions, volume, NFT activity, DeFi participation, wallet age, activity streaks, and token diversity. Each dimension uses a logarithmic formula so that early activity counts more than incremental gains at high levels.' },
      { q: 'Can I use Hardhat or Foundry with SimpleChain?', a: 'Absolutely. Point your Hardhat config or Foundry RPC URL to the SimpleChain RPC endpoint and you\'re set. Standard EVM development tools work without any modifications.' }
    ],
    base: [
      { q: 'Is Base a mainnet or testnet?', a: 'Base is a mainnet. Real ETH, real tokens, real value. Transactions cost actual money (though very little — typically under $0.01). Don\'t confuse it with Base Sepolia, which is the testnet version.' },
      { q: 'How does Base compare to Arbitrum and Optimism?', a: 'All three are Ethereum L2s built on the OP Stack. Base has the advantage of Coinbase\'s distribution. Arbitrum has more DeFi TVL and mature protocols. Optimism has the RetroPGF ecosystem. They\'re all solid choices — the right one depends on what you\'re building.' },
      { q: 'What DeFi protocols are available on Base?', a: 'Aerodrome is the dominant DEX. You\'ve also got Aave, Compound, Morpho, and a growing list of lending and yield protocols. The ecosystem is expanding fast with new protocols launching regularly.' },
      { q: 'How do I bridge assets to Base?', a: 'Use the official Base Bridge, or cross-chain aggregators like Relay or Jumper. The official bridge is the simplest option. Aggregators might find cheaper routes if you\'re bridging from chains other than Ethereum.' },
      { q: 'What does the wallet score tell me about my Base activity?', a: 'It gives you a snapshot of how active and diverse your on-chain behavior is. A high score means you\'re doing more than just holding — you\'re interacting with contracts, using DeFi, and staying active over time.' },
      { q: 'Does the score include activity from other chains?', a: 'No. The score only reflects your activity on Base. If you want a cross-chain view, check the Relay or Jumper analytics tools which aggregate activity across multiple networks.' },
      { q: 'Why is my transaction count different from what I see on Basescan?', a: 'We pull data from the Blockscout API, which may index transactions slightly differently than Etherscan-powered explorers. The core numbers should be consistent, but there can be minor variations in how internal transactions are counted.' }
    ],
    ink: [
      { q: 'Is Ink on mainnet?', a: 'Yes. Ink is a live mainnet L2 built on the OP Stack. Transactions use real ETH. It\'s not a testnet — your activity here has real economic weight.' },
      { q: 'How does Ink differ from Base?', a: 'Both are OP Stack L2s, but the backers are different. Base is backed by Coinbase; Ink is backed by Kraken. The tech is similar, but the ecosystems and target audiences differ. Ink is earlier in its development cycle.' },
      { q: 'What DeFi protocols are available on Ink?', a: 'The ecosystem is growing but smaller than Base or Arbitrum. You\'ll find some DEXs and lending protocols, but don\'t expect the same depth of options. This is a chain for early adopters right now.' },
      { q: 'How do I bridge to Ink?', a: 'Use the official Ink bridge or cross-chain aggregators. The official bridge connects through Ethereum mainnet, similar to other OP Stack chains.' },
      { q: 'What does the wallet score measure on Ink?', a: 'It tracks your on-chain activity specifically on Ink — transactions, contract interactions, DeFi usage, NFT activity, wallet age, and more. The score helps you understand how engaged you are with the Ink ecosystem.' },
      { q: 'Will Kraken reward Ink users?', a: 'There\'s no official confirmation of token airdrops or rewards. But Kraken has built this chain for a reason, and historically, chains backed by major exchanges have found ways to incentivize early users. That\'s speculation, not a promise.' }
    ],
    litvm: [
      { q: 'What is zkLTC?', a: 'zkLTC is the native token of the LitVM testnet. It has no real-world value — it\'s used purely for paying gas fees on the testnet. Think of it as play money for testing blockchain operations.' },
      { q: 'Is LitVM related to Litecoin?', a: 'The zkLTC naming is a nod to Litecoin, but LitVM is an independent Arbitrum Nitro L2 testnet. It runs on the Sepolia testnet infrastructure. The token name is branding, not a technical connection.' },
      { q: 'Can I deploy Solidity contracts on LitVM?', a: 'Yes. LitVM is EVM-compatible, so standard Solidity contracts, Hardhat, Foundry, and all your usual tools work. Deploy just like you would on any other EVM chain.' },
      { q: 'How do I get zkLTC tokens?', a: 'Check the LitVM community or Discord for faucet information. Testnet tokens are typically available for free through official channels.' },
      { q: 'What does my LitVM score tell me?', a: 'Your score reflects your on-chain activity on LitVM specifically — transactions, contracts interacted with, volume moved, NFTs collected, and DeFi activity. It\'s a measure of how active you are on this testnet.' },
      { q: 'Is LitVM a good proxy for Arbitrum mainnet?', a: 'Reasonably yes, since it runs on Arbitrum Nitro. The transaction flow, gas mechanics, and confirmation times are similar. But testnet behavior never perfectly replicates mainnet conditions.' }
    ],
    seismic: [
      { q: 'What are encrypted smart contracts?', a: 'Encrypted smart contracts allow you to run logic where the inputs and outputs are hidden from public view on the blockchain. Instead of all data being visible to anyone, ZK proofs verify the computation happened correctly without revealing the underlying data.' },
      { q: 'Why is gas more expensive on Seismic?', a: 'Encryption and zero-knowledge proofs require more computational work than standard transaction execution. That extra computation translates to higher gas costs. It\'s the trade-off for privacy.' },
      { q: 'What use cases need encrypted contracts?', a: 'Sealed-bid auctions, private voting, confidential DeFi positions, healthcare data processing, any scenario where you don\'t want on-chain data publicly visible. If you\'re building something where transparency is a bug rather than a feature, Seismic is worth exploring.' },
      { q: 'Is Seismic EVM-compatible?', a: 'Yes, at its core. You use MetaMask, write Solidity, and follow standard EVM development patterns. The encrypted computation layer is an addition on top of the standard EVM execution environment.' },
      { q: 'How does the wallet score work on a privacy chain?', a: 'The score uses publicly visible data — transaction counts, gas usage, contract addresses you\'ve interacted with. It doesn\'t peek into encrypted data. Your score reflects your visible on-chain footprint.' },
      { q: 'Can I use Seismic for production applications?', a: 'Not yet. Seismic is currently a testnet. The technology is promising but needs more testing before you\'d want to rely on it for anything with real value at stake.' }
    ],
    genlayer: [
      { q: 'What are "intelligent contracts"?', a: 'Intelligent contracts are GenLayer\'s term for smart contracts written in Python that are executed and validated by AI validators. Unlike traditional smart contracts that always produce the same output for the same input, intelligent contracts can handle non-deterministic operations like API calls, natural language processing, and AI inference.' },
      { q: 'Why Python instead of Solidity?', a: 'Because AI validators need flexibility that Solidity doesn\'t offer. Python is the language of AI/ML, has enormous developer adoption, and makes it trivial to integrate external APIs and AI models. It\'s a deliberate design choice to enable a different kind of on-chain computation.' },
      { q: 'How does AI consensus work?', a: 'Instead of every node running the same code and comparing results (deterministic consensus), GenLayer\'s AI validators each process the contract independently and then reach agreement on the outcome. This allows for non-deterministic results while still maintaining blockchain guarantees.' },
      { q: 'Is GenLayer live on mainnet?', a: 'No. The Bradbury testnet is the current testing environment. The GEN token is testnet-only at this point. Mainnet launch timeline hasn\'t been finalized.' },
      { q: 'What can I actually build with intelligent contracts?', a: 'AI-powered oracles, natural language processing on-chain, dynamic pricing based on real-world data, automated content moderation, sentiment analysis triggers — basically anything where you need AI to make a decision that gets recorded on-chain.' },
      { q: 'How reliable is AI consensus compared to traditional consensus?', a: 'That\'s the big question. Traditional consensus is deterministic and provably correct. AI consensus introduces probability and subjectivity. GenLayer\'s approach is novel but unproven at scale. The testnet is where you form your own opinion on this.' }
    ],
    relay: [
      { q: 'Is Relay a blockchain?', a: 'No. Relay is a cross-chain bridge and swap protocol. It connects to 80+ blockchains but doesn\'t have its own chain. Think of it as a routing layer that moves your assets between chains.' },
      { q: 'How does Relay find the best route?', a: 'Relay\'s routing algorithm considers price, speed, liquidity availability, and gas costs on both source and destination chains. Sometimes the cheapest route isn\'t the fastest, and vice versa. The algorithm balances these factors automatically.' },
      { q: 'What does the analytics score measure for Relay?', a: 'Since Relay is a dapp rather than a chain, the score measures your cross-chain activity — how many networks you\'ve used, bridge vs. swap ratio, total volume, success rate, and how diverse your chain coverage is. It\'s a measure of your cross-chain footprint.' },
      { q: 'Does the score include activity from chains I didn\'t bridge through Relay?', a: 'No. The analytics only capture transactions that went through Relay\'s infrastructure. If you bridged using another protocol, that activity won\'t appear here.' },
      { q: 'What does the success rate tell me?', a: 'Your success rate is the percentage of Relay transactions that completed successfully versus failed. A low rate might indicate you\'re dealing with chains that have frequent congestion, or you might be hitting slippage limits on swaps.' },
      { q: 'Can I see which tokens I bridge most often?', a: 'Yes. The token usage breakdown shows which tokens you move most frequently and in what volume. It\'s useful for understanding your own cross-chain behavior patterns.' },
      { q: 'How far back does the transaction history go?', a: 'We pull the full available history from the Relay API. Most transactions from the past several months should be captured, though very old transactions might not be available depending on API retention.' }
    ],
    jumper: [
      { q: 'How is Jumper different from using a bridge directly?', a: 'Jumper aggregates 15+ bridge protocols and compares their rates. Instead of manually checking Stargate, Across, Hop, and others to find the best price, Jumper does the comparison for you. It\'s like using a flight aggregator instead of checking every airline individually.' },
      { q: 'What is Li.Fi and how does it relate to Jumper?', a: 'Li.Fi is the aggregation protocol that powers Jumper. Jumper is the consumer-facing product; Li.Fi is the infrastructure layer. The API that drives our analytics comes from Li.Fi\'s data.' },
      { q: 'What does the analytics score measure for Jumper?', a: 'The score measures your cross-chain activity through Jumper/Li.Fi — how many networks you\'ve interacted with, bridge vs. swap activity, volume, protocol diversity, and success rate. It captures your multi-chain footprint specifically through the Jumper ecosystem.' },
      { q: 'Why might my Jumper transactions show as failed?', a: 'Common reasons: insufficient gas on the destination chain, slippage too tight, liquidity unavailable on the chosen route, or the bridge protocol itself having issues. Jumper aggregates other protocols, so failures can originate from any underlying bridge.' },
      { q: 'Can I see which bridge protocols I use most?', a: 'Yes. The protocol usage breakdown shows which bridges and exchanges handle your transfers. This is helpful for understanding whether you\'re consistently using the cheapest option or sticking with familiar names.' },
      { q: 'Does Jumper charge extra fees on top of the bridge?', a: 'Jumper may charge a small fee on top of the underlying bridge cost. The fee is transparent in the transaction details. The total cost (bridge fee + gas + Jumper fee) is what gets compared across routes.' },
      { q: 'How many chains does Jumper support?', a: 'Jumper supports 25+ chains through the Li.Fi aggregation layer. The exact number changes as new chains and bridges are integrated. Check the chain activity section of your analytics for the current list.' }
    ],
    dachain: [
      { q: 'What is post-quantum cryptography?', a: 'Post-quantum cryptography refers to cryptographic algorithms designed to be secure against attacks by quantum computers. Current blockchain signatures (like ECDSA) could theoretically be broken by sufficiently powerful quantum computers. Lattice-based and hash-based signatures used by DAC are designed to resist these attacks.' },
      { q: 'Should I be worried about quantum computers breaking crypto?', a: 'Not today, but the threat is real enough that NIST has been standardizing post-quantum algorithms since 2022. A sufficiently powerful quantum computer could break today\'s elliptic curve signatures. Nobody knows when that will happen, but chains preparing now are ahead of the curve.' },
      { q: 'What is the Inception program?', a: 'The Inception program is DAC\'s early participation initiative. You complete on-chain activities like deploying contracts and making transactions to earn quantum badges and testnet tokens. It\'s designed to bootstrap activity on the network while giving users a reason to explore the chain.' },
      { q: 'How do I get DAC tokens?', a: 'Visit the Inception portal at inception.dachain.io. The faucet there provides testnet DAC tokens for gas. These tokens have no real-world value.' },
      { q: 'Can I deploy standard Solidity contracts on DAC?', a: 'Yes. DAC is EVM-compatible at the application layer. The quantum-resistant signatures operate at the consensus level, so your contracts and transactions work the same way they would on any other EVM chain.' },
      { q: 'What makes DAC different from other quantum-resistant chains?', a: 'DAC combines lattice-based and hash-based signature schemes specifically for blockchain use. Most post-quantum efforts focus on TLS or general encryption. DAC is one of the few chains building this into the core protocol from day one.' }
    ],
    doma: [
      { q: 'How does Doma\'s native bridging work?', a: 'Doma has bridging infrastructure built directly into the chain protocol, rather than relying solely on external bridge contracts. This means cross-chain transfers can be initiated and tracked natively, with the chain itself managing the bridge state.' },
      { q: 'Which chains can Doma bridge to?', a: 'Currently, Doma\'s testnet bridge connects to other testnet environments. The exact list of supported chains can be found at the Doma bridge interface. Mainnet bridging capabilities will expand over time.' },
      { q: 'Is Doma EVM-compatible?', a: 'Yes, fully. MetaMask works out of the box, Solidity contracts deploy normally, and standard EVM tools like Hardhat and Foundry work without modification. The L2 architecture is straightforward if you\'ve used any Ethereum rollup before.' },
      { q: 'How do I get testnet ETH on Doma?', a: 'Use the Doma bridge faucet at bridge-testnet.doma.xyz. You can bridge testnet ETH from other networks or claim directly if the faucet supports it.' },
      { q: 'What does the wallet score tell me on Doma?', a: 'Your score reflects on-chain activity on Doma specifically — transactions, contract interactions, bridge usage, NFTs, and DeFi activity. Since Doma has native bridging, bridge transactions factor into the scoring differently than on chains where bridging is external.' },
      { q: 'Is Doma planning a mainnet launch?', a: 'Doma is currently in testnet. No official mainnet date has been announced. The testnet is the place to get familiar with the chain\'s unique bridging architecture.' }
    ],
    robinhood: [
      { q: 'Is Robinhood Chain on mainnet?', a: 'Yes. This checker reads Robinhood Chain mainnet, an Arbitrum Orbit L2 with chain ID 4663 where ETH pays for gas and activity carries real value. It is a separate network from the Robinhood Chain testnet with chain ID 46630.' },
      { q: 'What is Robinhood Chain used for?', a: 'Robinhood Chain targets tokenized stocks and real-world assets on an Arbitrum Orbit L2. Because it is EVM-compatible, standard Solidity contracts, wallets and developer tooling work without modification.' },
      { q: 'How is Robinhood\'s chain different from other Arbitrum Orbit chains?', a: 'Technically it is a standard Arbitrum Orbit L2 running the Nitro stack. The difference is distribution: Robinhood brings a large retail user base, which is what makes on-chain activity here worth tracking early.' },
      { q: 'What DeFi protocols are live on Robinhood Chain?', a: 'The ecosystem is still forming, with fewer protocols and thinner liquidity than Arbitrum One or Base. The DeFi activity section of this tool shows exactly which contracts a wallet has interacted with, so you can see what is live rather than relying on a static list.' },
      { q: 'Will there be a Robinhood token?', a: 'There is no official announcement of a Robinhood Chain token, and any claim otherwise is speculation. This tool reports on-chain activity only — it makes no airdrop predictions.' },
      { q: 'What does my wallet score mean on Robinhood Chain?', a: 'It reflects real on-chain activity: transactions, contract diversity, DeFi participation, volume, NFT activity and consistency. Because the chain is young, scores skew low — early, varied activity counts for more than raw volume.' }
    ],
    'robinhood-testnet': [
      { q: 'How do I get testnet ETH on Robinhood Chain?', a: 'Use the faucet available from the Robinhood Chain testnet explorer at explorer.testnet.chain.robinhood.com. Testnet ETH has no real value and exists only for testing transactions and contract deployments.' },
      { q: 'Is this the same as the Robinhood Chain mainnet checker?', a: 'No. This page reads the testnet environment with chain ID 46630. The mainnet checker at cryptowalletsx.com/robinhood reads the live Arbitrum Orbit L2 with real ETH balances and real DeFi activity.' },
      { q: 'Do I need a Robinhood account to use the testnet?', a: 'No. The testnet is open to anyone with an EVM wallet. You do not need a brokerage account to add the network or interact with contracts.' },
      { q: 'What does my testnet wallet score tell me?', a: 'It tracks testnet activity — transactions, contracts interacted with, token transfers, volume and DeFi participation. Since nothing here has value, the score is best used to gauge your own engagement and track testing progress.' },
      { q: 'Can I deploy contracts on the Robinhood testnet?', a: 'Yes. The testnet runs the same Arbitrum Nitro stack as mainnet, so standard Solidity contracts and tools like Hardhat, Foundry and Remix work after you add the testnet RPC and chain ID 46630.' }
    ]
  };

  const about = $derived(aboutContent[chainId] || []);
  const faqs = $derived(faqContent[chainId] || []);

  // Schema markup
  const howToSchema = $derived({
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to Check Your ${config.name} Wallet Score`,
    description: `Step-by-step guide to analyzing your ${config.name} wallet activity using our stats checker tool.`,
    totalTime: 'PT2M',
    step: [
      { '@type': 'HowToStep', name: 'Enter Your Wallet Address', text: `Paste your ${config.name} wallet address (0x...) into the search field on the homepage.`, position: 1 },
      { '@type': 'HowToStep', name: 'Click Scan', text: 'Hit the scan button or press Enter to start the analysis. The tool will fetch your on-chain data from the block explorer.', position: 2 },
      { '@type': 'HowToStep', name: 'Review Your Score', text: 'Your wallet score and rank (Bronze through Diamond) will appear at the top of the results page, along with a detailed breakdown.', position: 3 },
      { '@type': 'HowToStep', name: 'Explore Detailed Stats', text: 'Scroll through transaction history, DeFi activity, NFT holdings, token balances, and protocol interactions for a complete picture.', position: 4 },
      { '@type': 'HowToStep', name: 'Track Your Progress', text: 'Re-scan your wallet periodically to see how your score changes as you interact more with the chain.', position: 5 }
    ]
  });

  const faqSchema = $derived({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a
      }
    }))
  });

  // SoftwareApplication and BreadcrumbList are emitted by the host route page's
  // <SEO> block, so this component only contributes HowTo (and FAQPage unless the
  // host page already declares one).
  const shouldEmitFaqSchema = $derived(emitFaqSchema && faqs.length > 0);

  const checkerLabel = $derived(isDapp ? 'Analytics Tool' : 'Stats Checker');
</script>

<section class="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">

  <!-- About Section -->
  {#if about.length > 0}
    <div>
      <h2 class="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Info class="w-5 h-5 text-primary" />
        </div>
        About {config.name}
      </h2>
      <div class="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 sm:p-8 space-y-4">
        {#each about as paragraph}
          <p class="text-muted-foreground leading-relaxed text-sm sm:text-base">{paragraph}</p>
        {/each}
      </div>
    </div>
  {/if}

  <!-- How to Use Section -->
  <div>
    <h2 class="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Zap class="w-5 h-5 text-primary" />
      </div>
      How to Use This {checkerLabel}
    </h2>
    <div class="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 sm:p-8">
      <div class="space-y-6">
        <!-- Step 1 -->
        <div class="flex gap-4 items-start">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">1</div>
          <div>
            <h3 class="font-semibold mb-1">Enter Your Wallet Address</h3>
            <p class="text-sm text-muted-foreground">Paste your {config.name} wallet address into the search field at the top of this page. It should start with 0x and be 42 characters long. Works with any EVM-compatible wallet.</p>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="flex gap-4 items-start">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">2</div>
          <div>
            <h3 class="font-semibold mb-1">Hit Scan</h3>
            <p class="text-sm text-muted-foreground">Click the scan button or press Enter. The tool pulls your on-chain data from the {config.name} {isDapp ? 'API' : 'block explorer'}. Takes a few seconds depending on how much history you have.</p>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="flex gap-4 items-start">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">3</div>
          <div>
            <h3 class="font-semibold mb-1">{#if isDapp}Check Your Cross-Chain Stats{:else}See Your Score and Rank{/if}</h3>
            <p class="text-sm text-muted-foreground">{#if isDapp}Your cross-chain activity summary appears at the top — total volume, networks used, success rate, and your overall analytics breakdown.{:else}Your wallet score (0-100) and rank (Bronze through Diamond) show up right away. The score is calculated from multiple dimensions of your on-chain activity.{/if}</p>
          </div>
        </div>

        <!-- Step 4 -->
        <div class="flex gap-4 items-start">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">4</div>
          <div>
            <h3 class="font-semibold mb-1">Explore the Details</h3>
            <p class="text-sm text-muted-foreground">{#if isDapp}Dig into per-chain activity, token usage patterns, bridge vs. swap breakdowns, and protocol-level analytics. Each section gives you a different angle on your cross-chain behavior.{:else}Scroll through tabs to see transaction history, DeFi protocol interactions, NFT holdings, token balances, and more. Each tab reveals a different layer of your wallet's activity.{/if}</p>
          </div>
        </div>

        <!-- Step 5 -->
        <div class="flex gap-4 items-start">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">5</div>
          <div>
            <h3 class="font-semibold mb-1">Come Back and Track Progress</h3>
            <p class="text-sm text-muted-foreground">Your score changes as you use the chain more. Re-scan your wallet every so often to see how your activity has evolved. {#if !isDapp}More diverse activity across DeFi, NFTs, and contracts pushes your score up.{/if}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- How Scoring Works Section -->
  <div>
    <h2 class="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <BarChart3 class="w-5 h-5 text-primary" />
      </div>
      {#if isDapp}How Cross-Chain Scoring Works{:else}How Scoring Works{/if}
    </h2>
    <div class="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 sm:p-8 space-y-6">
      {#if isDapp}
        <p class="text-muted-foreground leading-relaxed text-sm sm:text-base">
          The cross-chain analytics score measures how active and diversified your {config.name} usage is. It's not just about volume — it's about breadth. Someone who bridges small amounts across 10 chains scores differently than someone who moves everything through one route.
        </p>
        <p class="text-muted-foreground leading-relaxed text-sm sm:text-base">
          The score factors in how many networks you've touched, your bridge-to-swap ratio, total and per-chain volume, success rate, and how recently you've been active. Each dimension contributes to the total, but the weighting favors diversity and consistency over raw numbers.
        </p>
      {:else}
        <p class="text-muted-foreground leading-relaxed text-sm sm:text-base">
          Your wallet score is calculated from 8 dimensions of on-chain activity. Each uses a logarithmic or square root formula — which means early activity moves the needle a lot, but you need increasingly more action to keep gaining points. This prevents whales from dominating the top ranks just by moving large amounts of tokens.
        </p>

        <div class="grid sm:grid-cols-2 gap-4">
          {#each [
            { dim: 'Transaction Count', formula: 'log₁₀(count + 1) × 2.5', max: '8 pts', desc: 'How many transactions you\'ve sent. The first 100 get you most of the points.' },
            { dim: 'Contract Interactions', formula: 'log₁₀(contracts + 1) × 5', max: '10 pts', desc: 'How many unique contracts you\'ve interacted with. Using different dapps counts more than spamming one.' },
            { dim: 'Volume', formula: '√volume × 0.35', max: '11 pts', desc: 'Total value moved. Square root means $100K isn\'t worth 100x more than $1K.' },
            { dim: 'NFT Activity', formula: 'log₁₀(uniqueNFTs + 1) × 3', max: '6 pts', desc: 'How many different NFT collections you\'ve minted or collected.' },
            { dim: 'DeFi Participation', formula: '√(defiActivities) × 1.3', max: '12 pts', desc: 'Swaps, staking, lending, liquidity, bridging, governance — the biggest scoring bucket.' },
            { dim: 'Wallet Age', formula: 'log₁₀(age + 1) × 3', max: '6 pts', desc: 'How many days since your first transaction. Older wallets get more points.' },
            { dim: 'Best Streak', formula: 'log₁₀(streak + 1) × 3', max: '6 pts', desc: 'Longest run of consecutive active days. Consistency beats bursts.' },
            { dim: 'Token Diversity', formula: 'min(diversity, 4)', max: '4 pts', desc: 'Number of different tokens you\'ve transacted with. Capped at 4.' }
          ] as item}
            <div class="p-4 rounded-xl bg-secondary/40 border border-border/30">
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium text-sm">{item.dim}</span>
                <span class="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary">{item.max}</span>
              </div>
              <code class="text-xs text-muted-foreground block mb-2">{item.formula}</code>
              <p class="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          {/each}
        </div>
      {/if}

      <!-- Rank tiers -->
      <div>
        <h3 class="font-semibold mb-3 text-sm">Rank Tiers</h3>
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {#each [
            { rank: 'BRONZE', range: '0–29', color: 'from-amber-700 to-amber-900', textColor: 'text-amber-600 dark:text-amber-400' },
            { rank: 'SILVER', range: '30–49', color: 'from-gray-400 to-gray-600', textColor: 'text-gray-500 dark:text-gray-300' },
            { rank: 'GOLD', range: '50–69', color: 'from-yellow-500 to-amber-600', textColor: 'text-yellow-600 dark:text-yellow-400' },
            { rank: 'PLATINUM', range: '70–89', color: 'from-cyan-400 to-teal-500', textColor: 'text-cyan-600 dark:text-cyan-400' },
            { rank: 'DIAMOND', range: '90–100', color: 'from-violet-400 to-indigo-500', textColor: 'text-violet-600 dark:text-violet-400' }
          ] as tier}
            <div class="text-center p-3 rounded-xl bg-secondary/40 border border-border/30">
              <div class="text-lg font-bold {tier.textColor} mb-0.5">{tier.rank}</div>
              <div class="text-xs text-muted-foreground">{tier.range}</div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- FAQ Section -->
  {#if faqs.length > 0}
    <div>
      <h2 class="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <HelpCircle class="w-5 h-5 text-primary" />
        </div>
        Frequently Asked Questions
      </h2>
      <div class="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl overflow-hidden divide-y divide-border/30">
        {#each faqs as faq, i}
          <button
            class="w-full text-left px-6 py-4 hover:bg-secondary/30 transition-colors flex items-start gap-3"
            onclick={() => toggleFaq(i)}
          >
            <ChevronDown class="w-5 h-5 shrink-0 mt-0.5 text-muted-foreground transition-transform duration-200 {openFaq === i ? 'rotate-180' : ''}" />
            <div class="flex-1">
              <span class="font-medium text-sm sm:text-base">{faq.q}</span>
              {#if openFaq === i}
                <p class="mt-2 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              {/if}
            </div>
          </button>
        {/each}
      </div>
    </div>
  {/if}

</section>

<!-- Related Tools Section -->
<section class="max-w-4xl mx-auto px-4 sm:px-6 py-12">
  <h2 class="text-2xl sm:text-3xl font-bold mb-6">Related Tools</h2>
  <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <a href="/arc" class="p-4 rounded-xl bg-card/60 border border-border/40 hover:border-cyan-500/30 transition-all group">
      <h3 class="font-semibold mb-1 group-hover:text-cyan-500 transition-colors">Arc Mainnet</h3>
      <p class="text-sm text-muted-foreground">USDC-native L1 wallet analytics</p>
    </a>
    <a href="/arc-testnet" class="p-4 rounded-xl bg-card/60 border border-border/40 hover:border-cyan-500/30 transition-all group">
      <h3 class="font-semibold mb-1 group-hover:text-cyan-500 transition-colors">Arc Testnet</h3>
      <p class="text-sm text-muted-foreground">Circle testnet wallet analytics</p>
    </a>
    <a href="/robinhood" class="p-4 rounded-xl bg-card/60 border border-border/40 hover:border-emerald-500/30 transition-all group">
      <h3 class="font-semibold mb-1 group-hover:text-emerald-500 transition-colors">Robinhood Chain</h3>
      <p class="text-sm text-muted-foreground">Orbit L2 wallet analytics</p>
    </a>
    <a href="/robinhood-testnet" class="p-4 rounded-xl bg-card/60 border border-border/40 hover:border-emerald-500/30 transition-all group">
      <h3 class="font-semibold mb-1 group-hover:text-emerald-500 transition-colors">Robinhood Testnet</h3>
      <p class="text-sm text-muted-foreground">Testnet wallet analytics</p>
    </a>
    <a href="/base" class="p-4 rounded-xl bg-card/60 border border-border/40 hover:border-blue-500/30 transition-all group">
      <h3 class="font-semibold mb-1 group-hover:text-blue-500 transition-colors">Base</h3>
      <p class="text-sm text-muted-foreground">Coinbase L2 wallet scoring & stats</p>
    </a>
    <a href="/ink" class="p-4 rounded-xl bg-card/60 border border-border/40 hover:border-purple-500/30 transition-all group">
      <h3 class="font-semibold mb-1 group-hover:text-purple-500 transition-colors">Ink</h3>
      <p class="text-sm text-muted-foreground">Kraken L2 wallet analytics</p>
    </a>
    <a href="/relay" class="p-4 rounded-xl bg-card/60 border border-border/40 hover:border-orange-500/30 transition-all group">
      <h3 class="font-semibold mb-1 group-hover:text-orange-500 transition-colors">Relay Bridge</h3>
      <p class="text-sm text-muted-foreground">Cross-chain bridge analytics</p>
    </a>
    <a href="/jumper" class="p-4 rounded-xl bg-card/60 border border-border/40 hover:border-indigo-500/30 transition-all group">
      <h3 class="font-semibold mb-1 group-hover:text-indigo-500 transition-colors">Jumper/Li.Fi</h3>
      <p class="text-sm text-muted-foreground">Multi-chain swap aggregator</p>
    </a>
    <a href="/layerzero-stats" class="p-4 rounded-xl bg-card/60 border border-border/40 hover:border-sky-500/30 transition-all group">
      <h3 class="font-semibold mb-1 group-hover:text-sky-500 transition-colors">LayerZero Stats</h3>
      <p class="text-sm text-muted-foreground">Cross-chain airdrop eligibility</p>
    </a>
  </div>
</section>

<!-- Schema Markup -->
<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify(howToSchema)}</script>`}
  {#if shouldEmitFaqSchema}
    {@html `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`}
  {/if}
</svelte:head>
