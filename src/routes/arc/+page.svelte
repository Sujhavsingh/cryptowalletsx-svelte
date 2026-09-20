<script lang="ts">
  import { walletStore } from '$lib/stores/wallet.svelte';
  import { ARC_CONFIG } from '$lib/utils/constants';
  import CheckerPage from '$lib/components/arc/CheckerPage.svelte';
  import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
  title="Arc Mainnet Wallet Checker & Analytics"
  description="Check any Arc Mainnet wallet: wallet score, USDC balance, transaction history and DeFi activity on Circle's USDC-native Layer-1. Free, no wallet connect."
  keywords={["arc mainnet", "arc wallet checker", "arc mainnet usdc", "circle arc mainnet", "arc blockchain analytics", "arc wallet score", "arc mainnet explorer", "usdc native l1"]}
  canonicalUrl="https://cryptowalletsx.com/arc"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Arc Mainnet Wallet Checker',
        url: 'https://cryptowalletsx.com/arc',
        description: 'Analyze Arc Mainnet wallet stats, scores, USDC balance, transactions and DeFi activity on Circle\'s USDC-native Layer-1.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
          { '@type': 'ListItem', position: 2, name: 'Checkers', item: 'https://cryptowalletsx.com/checker' },
          { '@type': 'ListItem', position: 3, name: 'Arc Mainnet', item: 'https://cryptowalletsx.com/arc' }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'What is the Arc Mainnet wallet checker?', acceptedAnswer: { '@type': 'Answer', text: 'It is a free tool that analyzes any Arc Mainnet address and shows wallet score, USDC balance, transaction history, token transfers and DeFi activity on Circle\'s USDC-native Layer-1. It is read-only and never asks you to connect a wallet.' } },
          { '@type': 'Question', name: 'Which token pays for gas on Arc Mainnet?', acceptedAnswer: { '@type': 'Answer', text: 'Arc uses USDC as its native gas token instead of ETH, so every transaction is paid in USDC held on the Arc network. The native balance shown by this checker is your Arc USDC balance.' } },
          { '@type': 'Question', name: 'How is the Arc Mainnet wallet score calculated?', acceptedAnswer: { '@type': 'Answer', text: 'The score uses a logarithmic formula across transaction count, contract diversity, DeFi participation, volume, NFT activity and activity consistency. Early and varied activity counts for more than raw volume, so a wallet cannot buy a top score by moving large amounts alone.' } },
          { '@type': 'Question', name: 'Is Arc Mainnet USDC the same as Ethereum USDC?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Arc is a Circle-backed network, so the USDC balance on Arc is the same asset as USDC elsewhere. This checker reads your public Arc address only and does not move or custody funds.' } },
          { '@type': 'Question', name: 'Do I need to connect my wallet?', acceptedAnswer: { '@type': 'Answer', text: 'No. Paste any Arc Mainnet address to view its full analytics. The checker only reads public blockchain data from the Arc block explorer and never asks for a signature, seed phrase or private key.' } }
        ]
      }
    ]
  }}
/>

<CheckerPage config={ARC_CONFIG} store={walletStore} />
