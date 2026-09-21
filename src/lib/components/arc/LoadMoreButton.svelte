<script lang="ts">
  import { ChevronDown } from 'lucide-svelte';
  import Button from '$lib/components/ui/Button.svelte';

  interface Props {
    /** How many items the caller is currently rendering. */
    visible: number;
    /** How many items exist in total. */
    total: number;
    /** How many more items one click reveals. */
    step?: number;
    /** Plural noun for the counter, e.g. "transactions". */
    label?: string;
    onclick: () => void;
    class?: string;
  }

  let { visible, total, step = 15, label = 'items', onclick, class: className = '' }: Props = $props();

  /** Never claim to show more rows than exist. */
  let shown = $derived(Math.min(visible, total));
  let remaining = $derived(Math.max(total - shown, 0));
</script>

{#if remaining > 0}
  <div class="flex flex-col items-center gap-1.5 pt-1 {className}">
    <Button variant="outline" size="sm" {onclick} class="font-medium">
      <ChevronDown class="w-3.5 h-3.5" />
      Load {Math.min(step, remaining)} more
    </Button>
    <p class="text-[11px] text-muted-foreground">Showing {shown} of {total} {label}</p>
  </div>
{/if}
