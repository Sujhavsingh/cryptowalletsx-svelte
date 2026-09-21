<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import CardContent from '$lib/components/ui/CardContent.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';

  interface Props {
    score: number;
    rank: string;
  }

  let { score, rank }: Props = $props();

  const rankConfig: Record<string, { emoji: string; color: string; textColor: string; borderColor: string; bgColor: string; description: string }> = {
    NEWBIE: {
      emoji: '🌱', color: '#22c55e', textColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-500/30', bgColor: 'bg-green-500/10',
      description: 'Just getting started on-chain. Your first steps are in!',
    },
    BRONZE: {
      emoji: '🥉', color: '#cd7f32', textColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-500/30', bgColor: 'bg-amber-500/10',
      description: 'Getting started on this testnet. Keep building your on-chain activity!',
    },
    SILVER: {
      emoji: '🥈', color: '#c0c0c0', textColor: 'text-slate-300 dark:text-slate-200',
      borderColor: 'border-slate-400/30', bgColor: 'bg-slate-400/10',
      description: "Solid activity. You're building real on-chain presence!",
    },
    GOLD: {
      emoji: '🥇', color: '#ffd700', textColor: 'text-yellow-500 dark:text-yellow-400',
      borderColor: 'border-yellow-500/30', bgColor: 'bg-yellow-500/10',
      description: 'Impressive! Strong transaction volume and DeFi engagement.',
    },
    PLATINUM: {
      emoji: '💎', color: '#e5e4e2', textColor: 'text-cyan-300 dark:text-cyan-200',
      borderColor: 'border-cyan-400/30', bgColor: 'bg-cyan-400/10',
      description: 'Elite status! Deep protocol usage and consistent chain activity.',
    },
    DIAMOND: {
      emoji: '💠', color: '#b9f2ff', textColor: 'text-blue-300 dark:text-blue-200',
      borderColor: 'border-blue-400/30', bgColor: 'bg-blue-400/10',
      description: 'Top tier! Maximum on-chain mastery across all categories.',
    },
  };

  let config = $derived(rankConfig[rank] || rankConfig.BRONZE);
  let circumference = $derived(2 * Math.PI * 45);
  let strokeDashoffset = $derived(circumference - (score / 100) * circumference);
</script>

<Card class="glass-card bg-card/60 border-border/40">
  <CardContent class="p-4 sm:p-6 flex items-center gap-4 sm:gap-6">
    <div class="relative w-20 h-20 sm:w-28 sm:h-28 shrink-0">
      <svg class="w-20 h-20 sm:w-28 sm:h-28 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="6" class="text-muted/50" />
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke={config.color}
          stroke-width="6"
          stroke-linecap="round"
          stroke-dasharray={circumference}
          stroke-dashoffset={strokeDashoffset}
          class="score-circle-animated"
          style="filter: drop-shadow(0 0 8px {config.color}60)"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-xl sm:text-2xl font-bold" style="color: {config.color}">{score}</span>
        <span class="text-[9px] sm:text-[10px] text-muted-foreground">SCORE</span>
      </div>
    </div>
    <div class="space-y-1.5 sm:space-y-2 min-w-0">
      <Badge class="{config.textColor} {config.borderColor} {config.bgColor} border text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 gap-1.5">
        <span class="text-sm sm:text-base">{config.emoji}</span>
        {rank}
      </Badge>
      <p class="text-xs sm:text-sm text-muted-foreground">
        {config.description}
      </p>
    </div>
  </CardContent>
</Card>
