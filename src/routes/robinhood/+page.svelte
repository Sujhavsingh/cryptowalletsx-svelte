<script lang="ts">
  import { robinhoodWalletStore } from '$lib/stores/wallet.svelte';
  import { ROBINHOOD_CONFIG } from '$lib/utils/constants';
  import CheckerPage from '$lib/components/arc/CheckerPage.svelte';
  import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
  title="Robinhood Chain Wallet Checker & Stats"
  description="Analyze any Robinhood Chain mainnet wallet: score, ETH balance, transactions, tokens and DeFi activity on the Arbitrum Orbit L2. Free real-time stats."
  keywords={["robinhood chain", "robinhood chain mainnet", "robinhood wallet checker", "robinhood chain analytics", "arbitrum orbit l2", "tokenized stocks", "rwa blockchain", "robinhood wallet score"]}
  canonicalUrl="https://cryptowalletsx.com/robinhood"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Robinhood Chain Wallet Checker',
        url: 'https://cryptowalletsx.com/robinhood',
        description: 'Analyze Robinhood Chain mainnet wallet stats, scores, ETH balance, transactions and DeFi activity on the Arbitrum Orbit L2.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
          { '@type': 'ListItem', position: 2, name: 'Checkers', item: 'https://cryptowalletsx.com/checker' },
          { '@type': 'ListItem', position: 3, name: 'Robinhood Chain', item: 'https://cryptowalletsx.com/robinhood' }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'What is the Robinhood Chain wallet checker?', acceptedAnswer: { '@type': 'Answer', text: 'It is a free read-only tool that analyzes any Robinhood Chain mainnet address and returns wallet score, ETH balance, transaction history, token balances, NFT holdings and DeFi activity using live explorer data.' } },
          { '@type': 'Question', name: 'Is Robinhood Chain live on mainnet?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Robinhood Chain mainnet runs as an Arbitrum Orbit L2 with chain ID 4663, ETH as the gas token and Blockscout as its explorer. Activity here carries real value, unlike the separate testnet with chain ID 46630.' } },
          { '@type': 'Question', name: 'What is Robinhood Chain used for?', acceptedAnswer: { '@type': 'Answer', text: 'Robinhood Chain is an Arbitrum Orbit L2 aimed at tokenized stocks and real-world assets. Its EVM compatibility means standard Solidity tooling works, and the explorer exposes token transfers so this checker can break down token and DeFi activity.' } },
          { '@type': 'Question', name: 'How is the Robinhood Chain wallet score calculated?', acceptedAnswer: { '@type': 'Answer', text: 'The score uses a logarithmic formula across transaction count, contract diversity, DeFi participation, volume, NFT activity and activity consistency, so consistent, varied activity outranks raw volume.' } },
          { '@type': 'Question', name: 'Do I need a Robinhood account to use the checker?', acceptedAnswer: { '@type': 'Answer', text: 'No. The checker reads public on-chain data from the Robinhood Chain explorer. You do not need a brokerage account, and you never connect a wallet or share a private key.' } }
        ]
      }
    ]
  }}
/>

<CheckerPage config={ROBINHOOD_CONFIG} store={robinhoodWalletStore} />
