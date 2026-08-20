<script lang="ts">
  import { Zap, ExternalLink, MessageCircle } from 'lucide-svelte';
</script>

<footer class="border-t border-border/40 bg-card/30 mt-auto" role="contentinfo">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-10">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
      <!-- Brand -->
      <div class="col-span-2 md:col-span-1 flex flex-col gap-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
            <Zap class="w-4 h-4 text-white" />
          </div>
          <span class="font-bold text-lg gradient-text">CryptoWalletsX</span>
        </div>
        <p class="text-xs text-muted-foreground">
          Free multi-chain crypto wallet analytics. Powered by Blockscout &amp; Etherscan APIs.
        </p>
      </div>

      <!-- Tools -->
      <nav aria-label="Footer tools navigation">
        <h3 class="text-sm font-semibold mb-3 text-foreground">Tools</h3>
        <ul class="space-y-2 text-sm">
          <li><a href="/checker" class="text-muted-foreground hover:text-foreground transition-colors">All Checkers</a></li>
          <li><a href="/arc" class="text-muted-foreground hover:text-foreground transition-colors">Arc Testnet</a></li>
          <li><a href="/base" class="text-muted-foreground hover:text-foreground transition-colors">Base</a></li>
          <li><a href="/ink" class="text-muted-foreground hover:text-foreground transition-colors">Ink</a></li>
          <li><a href="/soneium" class="text-muted-foreground hover:text-foreground transition-colors">Soneium</a></li>
          <li><a href="/aligned-airdrop" class="text-muted-foreground hover:text-foreground transition-colors">Aligned Airdrop</a></li>
        </ul>
      </nav>

      <!-- Resources -->
      <nav aria-label="Footer resources navigation">
        <h3 class="text-sm font-semibold mb-3 text-foreground">Resources</h3>
        <ul class="space-y-2 text-sm">
          <li><a href="/blog" class="text-muted-foreground hover:text-foreground transition-colors">Blog</a></li>
          <li><a href="/about" class="text-muted-foreground hover:text-foreground transition-colors">About</a></li>
          <li><a href="/contact" class="text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
          <li><a href="/privacy" class="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a></li>
          <li><a href="/feed.xml" class="text-muted-foreground hover:text-foreground transition-colors">RSS Feed</a></li>
        </ul>
      </nav>

      <!-- Social -->
      <div>
        <h3 class="text-sm font-semibold mb-3 text-foreground">Connect</h3>
        <div class="flex items-center gap-3">
          <a
            href="https://twitter.com/cryptowalletsx"
            target="_blank"
            rel="noopener noreferrer"
            class="w-9 h-9 rounded-lg bg-secondary/60 hover:bg-cyan-500/15 hover:text-cyan-500 flex items-center justify-center transition-colors"
            title="Twitter / X"
            aria-label="Follow us on Twitter"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
          </a>
          <a
            href="https://github.com/Sujhavsingh/cryptowalletsx-svelte"
            target="_blank"
            rel="noopener noreferrer"
            class="w-9 h-9 rounded-lg bg-secondary/60 hover:bg-cyan-500/15 hover:text-cyan-500 flex items-center justify-center transition-colors"
            title="GitHub"
            aria-label="View source on GitHub"
          >
            <ExternalLink class="w-4 h-4" />
          </a>
          <a
            href="https://discord.gg/cryptowalletsx"
            target="_blank"
            rel="noopener noreferrer"
            class="w-9 h-9 rounded-lg bg-secondary/60 hover:bg-cyan-500/15 hover:text-cyan-500 flex items-center justify-center transition-colors"
            title="Discord"
            aria-label="Join our Discord"
          >
            <MessageCircle class="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>

    <div class="mt-8 pt-4 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-2">
      <p class="text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} CryptoWalletsX. All rights reserved. Not financial advice.
      </p>
      <p class="text-xs text-muted-foreground">
        <a href="/feed.xml" class="hover:text-foreground transition-colors">RSS</a>
        &middot;
        <a href="/sitemap.xml" class="hover:text-foreground transition-colors">Sitemap</a>
      </p>
    </div>
  </div>
</footer>
