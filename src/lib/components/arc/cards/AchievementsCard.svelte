<script lang="ts">
  import { Award, Check, Lock } from 'lucide-svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import CardContent from '$lib/components/ui/CardContent.svelte';
  import { computeAchievements, getNativeTokenPrice, badgeTierLabel, type BadgeTier } from '$lib/utils/badges';
  import type { ChainConfig, WalletStats } from '$lib/types';

  interface Props {
    stats: WalletStats;
    config: ChainConfig;
  }

  let { stats, config }: Props = $props();

  // Native token price (one cached /stats request per chain) — 0 until it resolves
  let nativePrice = $state(0);
  $effect(() => {
    let active = true;
    getNativeTokenPrice(config).then(price => {
      if (active) nativePrice = price;
    });
    return () => { active = false; };
  });

  let achievements = $derived(computeAchievements(stats, config, nativePrice));

  const tierStyles: Record<BadgeTier, { pill: string; ring: string; icon: string }> = {
    BRONZE: {
      pill: 'bg-amber-700/15 text-amber-700 dark:text-amber-500 border-amber-700/30',
      ring: 'border-amber-700/40',
      icon: 'text-amber-700 dark:text-amber-500',
    },
    SILVER: {
      pill: 'bg-slate-400/15 text-slate-600 dark:text-slate-300 border-slate-400/30',
      ring: 'border-slate-400/40',
      icon: 'text-slate-600 dark:text-slate-300',
    },
    GOLD: {
      pill: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
      ring: 'border-yellow-500/40',
      icon: 'text-yellow-600 dark:text-yellow-400',
    },
    LEGEND: {
      pill: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/30',
      ring: 'border-fuchsia-500/40',
      icon: 'text-fuchsia-600 dark:text-fuchsia-400',
    },
    CHAIN: {
      pill: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
      ring: 'border-cyan-500/40',
      icon: 'text-cyan-600 dark:text-cyan-400',
    },
  };

  let tierStyleFor = (tier: BadgeTier) => tierStyles[tier] || tierStyles.BRONZE;

  let tileClass = (tier: BadgeTier, earned: boolean) =>
    earned
      ? `bg-secondary/40 ${tierStyleFor(tier).ring}`
      : 'bg-secondary/10 border-border/30 opacity-60';
</script>

<Card class="glass-card bg-card/60 border-border/40">
  <CardContent class="p-4 sm:p-6">
    <div class="flex items-start justify-between flex-wrap gap-2 mb-3 sm:mb-4">
      <div class="min-w-0">
        <h3 class="text-xs sm:text-sm font-semibold flex items-center gap-2">
          <Award class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500" />
          On-Chain Badges
        </h3>
        <p class="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{config.name}</p>
      </div>
      <div class="text-right shrink-0">
        <p class="text-sm sm:text-base font-bold">
          {achievements.earned} / {achievements.total}
          <span class="text-xs sm:text-sm font-medium text-cyan-500">({achievements.percent}%)</span>
        </p>
        <p class="text-[10px] sm:text-xs text-muted-foreground">
          {achievements.earned} / {achievements.total} Unlocked · {achievements.percent}% Completed
        </p>
      </div>
    </div>

    <div
      class="h-1.5 sm:h-2 rounded-full bg-muted/50 overflow-hidden mb-3 sm:mb-4"
      role="progressbar"
      aria-label="On-chain badges unlocked"
      aria-valuenow={achievements.earned}
      aria-valuemin={0}
      aria-valuemax={achievements.total}
    >
      <div
        class="h-full rounded-full transition-all duration-1000"
        style="width: {achievements.percent}%; background: linear-gradient(90deg, #06b6d4, #14b8a6)"
      ></div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
      {#each achievements.items as item (item.id)}
        {@const tierStyle = tierStyleFor(item.tier)}
        <div class="rounded-lg border p-2 sm:p-3 flex flex-col gap-1 transition-colors {tileClass(item.tier, item.earned)}">
          <div class="flex items-start justify-between gap-1">
            <span class="text-[11px] sm:text-xs font-semibold leading-tight {item.earned ? '' : 'text-muted-foreground'}">{item.name}</span>
            {#if item.earned}
              <Check class="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 {tierStyle.icon}" />
            {:else}
              <Lock class="w-3 h-3 shrink-0 text-muted-foreground" />
            {/if}
          </div>
          <span class="self-start px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold border {tierStyle.pill}">
            {badgeTierLabel(item.tier, config)}
          </span>
          <p class="text-[10px] sm:text-[11px] text-muted-foreground leading-snug">{item.description}</p>
          <span class="mt-auto pt-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide {item.earned ? tierStyle.icon : 'text-muted-foreground/70'}">
            {item.earned ? 'Earned' : 'Locked'}
          </span>
        </div>
      {/each}
    </div>
  </CardContent>
</Card>
