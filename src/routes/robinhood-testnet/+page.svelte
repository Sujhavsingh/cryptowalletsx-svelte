<script lang="ts">
  import { robinhoodTestnetWalletStore } from '$lib/stores/wallet.svelte';
  import { ROBINHOOD_TESTNET_CONFIG } from '$lib/utils/constants';
  import CheckerPage from '$lib/components/arc/CheckerPage.svelte';
  import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
  title="Robinhood Testnet Wallet Checker & Stats"
  description="Check any Robinhood Chain testnet wallet: score, testnet ETH balance, transaction history and DeFi activity on the Arbitrum Orbit L2. Free, no signup."
  keywords={["robinhood testnet", "robinhood chain testnet", "robinhood testnet wallet", "robinhood chain testnet checker", "arbitrum orbit testnet", "robinhood testnet faucet", "testnet eth analytics", "robinhood wallet score"]}
  canonicalUrl="https://cryptowalletsx.com/robinhood-testnet"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Robinhood Testnet Wallet Checker',
        url: 'https://cryptowalletsx.com/robinhood-testnet',
        description: 'Analyze Robinhood Chain testnet wallet stats, scores, testnet ETH balance, transactions and DeFi activity on the Arbitrum Orbit L2.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
          { '@type': 'ListItem', position: 2, name: 'Checkers', item: 'https://cryptowalletsx.com/checker' },
          { '@type': 'ListItem', position: 3, name: 'Robinhood Testnet', item: 'https://cryptowalletsx.com/robinhood-testnet' }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'What is the Robinhood Chain testnet checker?', acceptedAnswer: { '@type': 'Answer', text: 'It is a free tool that analyzes any Robinhood Chain testnet address, showing wallet score, testnet ETH balance, transactions, tokens and DeFi activity. Paste an address and results load immediately, with no wallet connection.' } },
          { '@type': 'Question', name: 'Is the Robinhood Chain testnet wallet checker free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. It is completely free, requires no account, and only reads public data from the Robinhood Chain testnet explorer.' } },
          { '@type': 'Question', name: 'How do I get Robinhood testnet ETH?', acceptedAnswer: { '@type': 'Answer', text: 'Use the faucet on the Robinhood Chain testnet explorer at explorer.testnet.chain.robinhood.com, which also documents the testnet RPC and chain ID 46630 you need to add to your wallet.' } },
          { '@type': 'Question', name: 'Does the testnet checker also cover Robinhood Chain mainnet?', acceptedAnswer: { '@type': 'Answer', text: 'No. This page targets the testnet environment with chain ID 46630. For real-value activity on the Arbitrum Orbit L2, use the Robinhood Chain mainnet checker at cryptowalletsx.com/robinhood.' } },
          { '@type': 'Question', name: 'Is my data private?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The checker only reads public blockchain data in real time and never stores, tracks or shares wallet addresses or transaction histories. No private keys or signatures are ever requested.' } }
        ]
      }
    ]
  }}
/>

<CheckerPage config={ROBINHOOD_TESTNET_CONFIG} store={robinhoodTestnetWalletStore} />
