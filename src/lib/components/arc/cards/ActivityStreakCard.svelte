<script lang="ts">
  import { Flame, Clock, Calendar, CalendarDays, CalendarRange, CalendarClock } from 'lucide-svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import CardContent from '$lib/components/ui/CardContent.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import type { WalletStats } from '$lib/types';

  interface Props { stats: WalletStats; }
  let { stats }: Props = $props();

  function formatDate(iso: string | null): string {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  let firstActivityDate = $derived(formatDate(stats.firstActivityAt || stats.createdAt));
  let lastActivityDate = $derived(formatDate(stats.lastActivityAt));

  let periods = $derived([
    { label: 'Days', value: stats.daysActive, suffix: 'd' },
    { label: 'Weeks', value: stats.weeksActive, suffix: 'w' },
    { label: 'Months', value: stats.monthsActive, suffix: 'mo' },
  ]);
</script>

<Card class="glass-card bg-card/60 border-border/40">
  <CardContent class="p-4 sm:p-6">
    <h3 class="text-xs sm:text-sm font-semibold mb-3 sm:mb-4 flex items-center gap-2">
      <Flame class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500" />
      Activity Streak
    </h3>
    <div class="space-y-2 sm:space-y-3">
      <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
        <div class="flex items-center gap-1.5 sm:gap-2">
          <Badge class="bg-cyan-500/15 text-cyan-500 border-cyan-500/30 text-[10px] sm:text-xs">
            <Flame class="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {stats.currentStreak}
          </Badge>
          <span class="text-[10px] sm:text-xs text-muted-foreground">Current</span>
        </div>
        <div class="flex items-center gap-1.5 sm:gap-2">
          <Badge class="bg-amber-500/15 text-amber-500 border-amber-500/30 text-[10px] sm:text-xs">
            <Flame class="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {stats.bestStreak}
          </Badge>
          <span class="text-[10px] sm:text-xs text-muted-foreground">Best Streak</span>
        </div>
      </div>

      <div class="flex items-start gap-1.5 sm:gap-2">
        <Clock class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground mt-0.5 shrink-0" />
        <span class="text-xs sm:text-sm font-medium">
          Last Activity: {stats.lastActivity}
          <span class="text-muted-foreground">/ {lastActivityDate}</span>
        </span>
      </div>

      <div class="flex items-start gap-1.5 sm:gap-2">
        <CalendarClock class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground mt-0.5 shrink-0" />
        <span class="text-xs sm:text-sm font-medium">
          Wallet Age: {stats.walletAge}d
          <span class="text-muted-foreground">/ {firstActivityDate}</span>
        </span>
      </div>

      <div class="grid grid-cols-3 gap-2 sm:gap-3">
        {#each periods as period}
          <div class="flex items-center gap-1.5 sm:gap-2">
            {#if period.label === 'Days'}
              <CalendarDays class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground shrink-0" />
            {:else if period.label === 'Weeks'}
              <CalendarRange class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground shrink-0" />
            {:else}
              <Calendar class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground shrink-0" />
            {/if}
            <span class="text-xs sm:text-sm font-medium">{period.value}{period.suffix}</span>
            <span class="text-[10px] sm:text-xs text-muted-foreground">{period.label}</span>
          </div>
        {/each}
      </div>
    </div>
  </CardContent>
</Card>
