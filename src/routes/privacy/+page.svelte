<script lang="ts">
  import HomeHeader from '$lib/components/home/HomeHeader.svelte';
  import Footer from '$lib/components/home/Footer.svelte';
  import { Shield } from 'lucide-svelte';
  import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
  title="Privacy Policy - CryptoWalletsx"
  description="Privacy policy for CryptoWalletsx. Learn how we handle data, cookies, and your rights. We collect minimal personal information."
  canonicalUrl="https://cryptowalletsx.com/privacy"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: 'Privacy Policy',
        url: 'https://cryptowalletsx.com/privacy',
        description: 'Privacy policy for CryptoWalletsx multi-chain crypto wallet analytics platform.',
        publisher: {
          '@type': 'Organization',
          name: 'CryptoWalletsX',
          url: 'https://cryptowalletsx.com'
        }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
          { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: 'https://cryptowalletsx.com/privacy' }
        ]
      }
    ]
  }}
/>

<div class="min-h-screen flex flex-col">
  <HomeHeader />
  <main class="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
    <div class="flex items-center gap-3 mb-8">
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
        <Shield class="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 class="text-3xl sm:text-4xl font-bold gradient-text">Privacy Policy</h1>
        <p class="text-sm text-muted-foreground">Last updated: May 2026</p>
      </div>
    </div>

    <div class="prose prose-slate dark:prose-invert max-w-none space-y-8">
      <section>
        <h2 class="text-xl font-bold mb-3 text-foreground">1. Introduction</h2>
        <p class="text-muted-foreground leading-relaxed">
          CryptoWalletsX ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard information when you use our website at cryptowalletsx.com (the "Service"). By accessing or using our Service, you agree to the collection and use of information in accordance with this policy. We believe in transparency and minimal data collection — our platform is designed to provide blockchain analytics without compromising your personal information.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-bold mb-3 text-foreground">2. Information We Collect</h2>
        <p class="text-muted-foreground leading-relaxed mb-4">
          CryptoWalletsX operates as a blockchain analytics tool that fetches publicly available on-chain data. We adhere to a minimal data collection philosophy:
        </p>
        <div class="space-y-4">
          <div class="p-4 rounded-xl bg-card/60 border border-border/40">
            <h3 class="font-semibold text-foreground mb-2">Wallet Addresses You Enter</h3>
            <p class="text-sm text-muted-foreground">When you input a wallet address for analysis, it is processed client-side and used to fetch publicly available blockchain data from third-party APIs (Blockscout). We do not store wallet addresses on our servers unless you explicitly save them in your browser's local storage.</p>
          </div>
          <div class="p-4 rounded-xl bg-card/60 border border-border/40">
            <h3 class="font-semibold text-foreground mb-2">Automatically Collected Data</h3>
            <p class="text-sm text-muted-foreground">We may collect basic analytics data such as page views, browser type, device type, and general geographic region. This data is aggregated and anonymized — it cannot be used to identify you personally. We use this solely to improve the user experience and optimize performance of our platform.</p>
          </div>
          <div class="p-4 rounded-xl bg-card/60 border border-border/40">
            <h3 class="font-semibold text-foreground mb-2">Data We Do NOT Collect</h3>
            <p class="text-sm text-muted-foreground">We do not collect private keys, seed phrases, passwords, or any sensitive cryptographic material. We never ask you to connect your wallet in a way that grants us access to your funds. Our analytics are read-only and do not require wallet connection or authentication.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-bold mb-3 text-foreground">3. How We Use Information</h2>
        <p class="text-muted-foreground leading-relaxed">
          The limited information we collect is used exclusively for the following purposes: providing and maintaining our blockchain analytics services, improving the functionality and user experience of our platform, displaying relevant on-chain data and statistics, ensuring the security and stability of our services, and complying with applicable legal requirements. We do not sell, rent, or trade any user data to third parties under any circumstances. Your blockchain queries remain private and are not shared with advertisers or data brokers.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-bold mb-3 text-foreground">4. Third-Party Services</h2>
        <p class="text-muted-foreground leading-relaxed">
          Our Service relies on third-party blockchain APIs to fetch on-chain data. These include Blockscout APIs for Arc, Robinhood Chain, and SimpleChain data. When you query a wallet address, your browser makes direct requests to these APIs. Please note that these third-party services have their own privacy policies, and we encourage you to review them. We are not responsible for the privacy practices of these external services, though we carefully select partners who share our commitment to user privacy.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-bold mb-3 text-foreground">5. Google AdSense and Advertising</h2>
        <p class="text-muted-foreground leading-relaxed mb-4">
          CryptoWalletsX uses Google AdSense to display advertisements. Google AdSense uses cookies to serve ads based on your prior visits to our website or other websites. Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the Internet. You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" class="text-cyan-500 hover:underline">Google Ads Settings</a>. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" class="text-cyan-500 hover:underline">aboutads.info</a>.
        </p>
        <div class="space-y-4">
          <div class="p-4 rounded-xl bg-card/60 border border-border/40">
            <h3 class="font-semibold text-foreground mb-2">Types of Cookies Used by Google AdSense</h3>
            <p class="text-sm text-muted-foreground">Google AdSense may use the following types of cookies on our website: advertising cookies (to deliver relevant ads based on your interests), analytics cookies (to measure ad performance and site engagement), and functional cookies (to remember your consent preferences). These cookies are set by Google's servers and are subject to Google's own privacy policy available at <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" class="text-cyan-500 hover:underline">policies.google.com/privacy</a>.</p>
          </div>
          <div class="p-4 rounded-xl bg-card/60 border border-border/40">
            <h3 class="font-semibold text-foreground mb-2">Third-Party Ad Vendors</h3>
            <p class="text-sm text-muted-foreground">Some ads on our site may be served by Google through its advertising partners. These partners may use cookies and similar technologies to collect information about your visits to this and other websites to provide advertisements about goods and services of interest to you. A list of Google's advertising partners can be found at <a href="https://www.google.com/intl/en/policies/technologies/ads/" target="_blank" rel="noopener noreferrer" class="text-cyan-500 hover:underline">Google Ads Technology</a>. You can learn more about how Google uses data when you visit our site at <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" class="text-cyan-500 hover:underline">How Google Uses Information from Sites</a>.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-bold mb-3 text-foreground">6. Cookies and Local Storage</h2>
        <p class="text-muted-foreground leading-relaxed mb-4">
          CryptoWalletsX uses cookies and local storage for the following purposes:
        </p>
        <div class="space-y-4">
          <div class="p-4 rounded-xl bg-card/60 border border-border/40">
            <h3 class="font-semibold text-foreground mb-2">Essential Cookies</h3>
            <p class="text-sm text-muted-foreground">These are necessary for the website to function properly. They include cookies for theme selection (dark/light mode) and cookie consent preferences. These cannot be disabled as the site would not function correctly without them.</p>
          </div>
          <div class="p-4 rounded-xl bg-card/60 border border-border/40">
            <h3 class="font-semibold text-foreground mb-2">Analytics Cookies</h3>
            <p class="text-sm text-muted-foreground">We use Google Analytics to collect anonymized data about how visitors use our site. This includes page views, session duration, and general geographic location. This data helps us improve our platform. You can opt out of Google Analytics by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" class="text-cyan-500 hover:underline">Google Analytics Opt-out Browser Add-on</a>.</p>
          </div>
          <div class="p-4 rounded-xl bg-card/60 border border-border/40">
            <h3 class="font-semibold text-foreground mb-2">Advertising Cookies</h3>
            <p class="text-sm text-muted-foreground">As described in Section 5, Google AdSense uses advertising cookies to serve personalized ads. You can manage your advertising cookie preferences through our cookie consent banner or by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" class="text-cyan-500 hover:underline">Google Ads Settings</a>. You can also clear all cookies at any time through your browser settings.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-bold mb-3 text-foreground">7. Data Security</h2>
        <p class="text-muted-foreground leading-relaxed">
          We implement industry-standard security measures to protect the information transmitted through our Service. All communications between your browser and our servers are encrypted using HTTPS/TLS protocols. Since we collect minimal personal data, the risk of data exposure is significantly reduced. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security of any information transmitted to or through our platform.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-bold mb-3 text-foreground">8. Your Rights</h2>
        <p class="text-muted-foreground leading-relaxed">
          You have the right to access, correct, or delete any personal information we hold about you. Since we collect minimal data, most actions you take on our platform are not tied to personal identifiers. You can clear any locally stored preferences at any time through your browser settings. If you have questions about your data or wish to exercise your rights under applicable data protection laws (including GDPR or CCPA), please contact us through our Contact page.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-bold mb-3 text-foreground">9. Changes to This Policy</h2>
        <p class="text-muted-foreground leading-relaxed">
          We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will post the updated policy on this page with a revised "Last updated" date. Your continued use of the Service after any changes constitutes your acceptance of the updated Privacy Policy. We encourage you to review this page periodically for the latest information on our privacy practices.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-bold mb-3 text-foreground">10. Contact Us</h2>
        <p class="text-muted-foreground leading-relaxed">
          If you have any questions about this Privacy Policy or our data practices, please reach out to us through our <a href="/contact" class="text-cyan-500 hover:underline">Contact page</a>. We aim to respond to all privacy-related inquiries within 48 hours.
        </p>
      </section>
    </div>
  </main>
  <Footer />
</div>
