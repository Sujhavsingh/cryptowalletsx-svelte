<script lang="ts">
  import { truncateAddress } from '$lib/utils/format';

  interface Props {
    /** Address being fetched, shown in the status line. */
    address: string;
    chainName: string;
  }

  let { address, chainName }: Props = $props();

  /** One light sweep across a placeholder card. */
  const sweep =
    'pointer-events-none absolute inset-y-0 -inset-x-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent animate-[skeleton-shimmer_1.8s_ease-in-out_infinite]';

  const card = 'relative overflow-hidden glass-card bg-card/60 border border-border/40 rounded-xl';

  /** Widths of the placeholder text bars inside a stat tile. */
  const metricBars = [
    { label: '38%', value: '30%' },
    { label: '26%', value: '22%' },
    { label: '44%', value: '26%' },
    { label: '22%', value: '34%' },
  ];
</script>

<!--
  First-paint placeholder for the wallet screen, laid out like the real Wallet Stats
  grid so the page does not jump when the data lands: header strip, score tile, streak
  tile, badge block, then the stat tiles.
-->
<div class="space-y-6" aria-busy="true" aria-live="polite">
  <!-- Status strip -->
  <div class="{card} p-4 sm:p-5">
    <div class="flex items-center gap-3">
      <span class="relative flex w-2.5 h-2.5 shrink-0">
        <span class="absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-60 animate-ping"></span>
        <span class="relative inline-flex w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
      </span>
      <p class="text-xs sm:text-sm text-muted-foreground truncate">
        Fetching on-chain data for
        <span class="font-mono text-foreground">{truncateAddress(address, 6)}</span>
      </p>
      <span class="ml-auto hidden sm:inline text-[11px] text-muted-foreground shrink-0">{chainName}</span>
    </div>
    <div class="mt-4 h-1 w-full rounded-full bg-secondary/70 overflow-hidden">
      <div class="h-full w-1/3 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 animate-[skeleton-progress_1.6s_ease-in-out_infinite]"></div>
    </div>
  </div>

  <!-- Score tile + activity streak tile -->
  <div class="grid md:grid-cols-2 gap-4">
    {#each Array(2) as _}
      <div class="{card} p-5 h-[13rem]">
        <div class="flex items-center gap-2 mb-5">
          <div class="w-8 h-8 rounded-lg bg-secondary/70"></div>
          <div class="h-3.5 w-32 rounded-md bg-secondary/70"></div>
          <div class="ml-auto h-5 w-16 rounded-full bg-secondary/60"></div>
        </div>
        <div class="flex items-center gap-5">
          <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-secondary/60 shrink-0"></div>
          <div class="flex-1 space-y-3">
            {#each ['80%', '62%', '92%', '48%'] as width}
              <div class="h-3 rounded-md bg-secondary/70" style="width: {width}"></div>
            {/each}
          </div>
        </div>
        <div class={sweep}></div>
      </div>
    {/each}
  </div>

  <!-- Badge block -->
  <div class="{card} p-4 sm:p-6">
    <div class="flex items-start justify-between gap-3 mb-4 sm:mb-5">
      <div class="space-y-2">
        <div class="h-3.5 w-36 rounded-md bg-secondary/70"></div>
        <div class="h-3 w-24 rounded-md bg-secondary/50"></div>
      </div>
      <div class="space-y-2 flex flex-col items-end">
        <div class="h-4 w-20 rounded-md bg-secondary/70"></div>
        <div class="h-3 w-32 rounded-md bg-secondary/50"></div>
      </div>
    </div>
    <div class="h-1.5 sm:h-2 rounded-full bg-secondary/60 mb-4 sm:mb-5"></div>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
      {#each Array(8) as _}
        <div class="rounded-lg border border-border/30 p-2 sm:p-3 space-y-2">
          <div class="h-3 w-3/4 rounded-md bg-secondary/70"></div>
          <div class="h-4 w-16 rounded-full bg-secondary/60"></div>
          <div class="h-2.5 w-full rounded-md bg-secondary/50"></div>
          <div class="h-2.5 w-2/3 rounded-md bg-secondary/40"></div>
        </div>
      {/each}
    </div>
    <div class={sweep}></div>
  </div>

  <!-- Stat tiles -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
    {#each Array(9) as _}
      <div class="{card} p-3 sm:p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-secondary/70"></div>
            <div class="h-3.5 w-24 rounded-md bg-secondary/70"></div>
          </div>
          <div class="h-5 w-12 rounded-full bg-secondary/60"></div>
        </div>
        <div class="space-y-2 sm:space-y-2.5">
          {#each metricBars as metric}
            <div class="flex items-center justify-between gap-2">
              <div class="h-2.5 rounded-md bg-secondary/50" style="width: {metric.label}"></div>
              <div class="h-3 rounded-md bg-secondary/70" style="width: {metric.value}"></div>
            </div>
          {/each}
        </div>
        <div class={sweep}></div>
      </div>
    {/each}
  </div>
</div>
