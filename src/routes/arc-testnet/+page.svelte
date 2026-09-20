<script lang="ts">
  import { arcTestnetWalletStore } from '$lib/stores/wallet.svelte';
  import { ARC_TESTNET_CONFIG } from '$lib/utils/constants';
  import CheckerPage from '$lib/components/arc/CheckerPage.svelte';
  import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
  title="Arc Testnet Wallet Checker & Analytics"
  description="Analyze any Arc Testnet address: wallet score, testnet USDC balance, transactions and DeFi activity on Circle's USDC-native testnet. Free, no wallet connect."
  keywords={["arc testnet", "arc testnet wallet checker", "circle arc testnet", "testnet usdc", "arc testnet explorer", "arc testnet wallet score", "arc scan", "arc blockchain analytics"]}
  canonicalUrl="https://cryptowalletsx.com/arc-testnet"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Arc Testnet Wallet Checker',
        url: 'https://cryptowalletsx.com/arc-testnet',
        description: 'Analyze Arc Testnet wallet stats, scores, testnet USDC balance, transactions and DeFi activity on Circle\'s USDC-native testnet.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
          { '@type': 'ListItem', position: 2, name: 'Checkers', item: 'https://cryptowalletsx.com/checker' },
          { '@type': 'ListItem', position: 3, name: 'Arc Testnet', item: 'https://cryptowalletsx.com/arc-testnet' }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'What is the Arc testnet wallet checker?', acceptedAnswer: { '@type': 'Answer', text: 'It is a free tool that analyzes any Arc testnet address, showing wallet score, testnet USDC balance, transaction history, token transfers and DeFi activity on Circle\'s USDC-native testnet in real time. No wallet connection required.' } },
          { '@type': 'Question', name: 'Is Arc testnet USDC worth real money?', acceptedAnswer: { '@type': 'Answer', text: 'No. Arc testnet USDC holds no real value. It exists for testing smart contracts, DeFi flows and wallet interactions with near-zero gas fees before you use the Arc mainnet checker.' } },
          { '@type': 'Question', name: 'Where do I get Arc testnet USDC?', acceptedAnswer: { '@type': 'Answer', text: 'Request testnet USDC from the Circle faucet at faucet.circle.com, then add the Arc testnet RPC and chain ID 5042002 to your wallet to start transacting.' } },
          { '@type': 'Question', name: 'How is the Arc testnet wallet score calculated?', acceptedAnswer: { '@type': 'Answer', text: 'The score uses a logarithmic formula across transaction count, contract diversity, DeFi participation, volume, NFT activity and activity consistency. Testnet scores are practice runs because the tokens carry no economic value.' } },
          { '@type': 'Question', name: 'What is the difference between Arc mainnet and Arc testnet?', acceptedAnswer: { '@type': 'Answer', text: 'Arc mainnet is Circle\'s live USDC-native Layer-1 with chain ID 5042, where activity carries real value. Arc testnet is the pre-production environment with chain ID 5042002 and free faucet USDC for testing.' } }
        ]
      }
    ]
  }}
/>

<CheckerPage config={ARC_TESTNET_CONFIG} store={arcTestnetWalletStore} />
