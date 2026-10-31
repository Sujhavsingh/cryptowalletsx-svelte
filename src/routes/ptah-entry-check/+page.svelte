<script lang="ts">
	import { onMount } from 'svelte';
	import HomeHeader from '$lib/components/home/HomeHeader.svelte';
	import Footer from '$lib/components/home/Footer.svelte';
	import SEO from '$lib/components/SEO.svelte';

	let token = $state('');
	let postUrl = $state('');
	let agent = $state<any>(null);
	let periodInfo = $state<any>(null);
	let schedule = $state<any[]>([]);
	let raw = $state('');
	let error = $state('');
	let busy = $state('');
	let lastChecked = $state('');
	let cacheState = $state('');
	let now = $state(new Date());

	if (typeof localStorage !== 'undefined') {
		const saved = localStorage.getItem('ptah-token');
		if (saved) token = saved;
	}

	onMount(() => {
		const timer = setInterval(() => {
			now = new Date();
		}, 1000);
		return () => clearInterval(timer);
	});

	function fmt(iso: string | null | undefined): string {
		if (!iso) return '—';
		return (
			new Date(iso).toLocaleString('en-IN', {
				timeZone: 'Asia/Kolkata',
				dateStyle: 'medium',
				timeStyle: 'short'
			}) + ' IST'
		);
	}

	function countdown(endIso: string | null | undefined): string {
		if (!endIso) return '—';
		const diff = Math.max(0, new Date(endIso).getTime() - now.getTime());
		const h = Math.floor(diff / 3_600_000);
		const m = Math.floor((diff % 3_600_000) / 60_000);
		const s = Math.floor((diff % 60_000) / 1000);
		return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	}

	function windowProgress(startIso: string, endIso: string): number {
		const start = new Date(startIso).getTime();
		const end = new Date(endIso).getTime();
		if (!start || !end || end <= start) return 0;
		return Math.min(100, Math.max(0, ((now.getTime() - start) / (end - start)) * 100));
	}

	function cleanUrl(u: string): string {
		try {
			const x = new URL(u.trim());
			x.search = '';
			x.hash = '';
			return x.toString();
		} catch {
			return u.trim();
		}
	}

	function ptahAmount(wei: string | null | undefined): string {
		if (!wei) return '—';
		try {
			const whole = BigInt(wei) / 1000000000000000000n;
			return whole.toString();
		} catch {
			return wei;
		}
	}

	function oddsText(entrants: number, slots: number): string {
		if (!entrants) return '—';
		if (entrants <= slots) return '100% (every entrant wins)';
		return ((slots / entrants) * 100).toFixed(1) + '%';
	}

	async function api(path: string, opts?: RequestInit): Promise<{ data: any; cache: string }> {
		const r = await fetch('/api/ptah/' + path, opts);
		const t = await r.text();
		let j: any;
		try {
			j = JSON.parse(t);
		} catch {
			j = { raw: t };
		}
		if (!r.ok || j.code !== 200) {
			throw new Error((j.message && j.message.text) || 'Ptah API error, code ' + (j.code || r.status));
		}
		return { data: j, cache: r.headers.get('X-Ptah-Cache') || '' };
	}

	async function check(fresh = false) {
		if (!/^\d+$/.test(token.trim())) {
			alert('Enter your Agent # as digits only.');
			return;
		}
		busy = 'check';
		error = '';
		try {
			const suffix = fresh ? '?fresh=1' : '';
			const res = await api('agents/' + token.trim() + suffix);
			agent = res.data.data.agent;
			cacheState = res.cache;
			raw = JSON.stringify(res.data, null, 2);
			lastChecked = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
			try {
				const periods = await api('periods');
				const list = periods.data.data.list || [];
				schedule = list;
				periodInfo = agent?.current ? list.find((p: any) => p.index === agent.current.period) : null;
			} catch {
				// Period stats are a bonus; the entry result is what matters.
			}
		} catch (e: any) {
			error = 'Check failed: ' + e.message;
			raw = String(e);
		} finally {
			busy = '';
		}
	}

	async function submit() {
		const url = cleanUrl(postUrl);
		if (!/^\d+$/.test(token.trim())) {
			alert('Enter your Agent # as digits only.');
			return;
		}
		if (!url) {
			alert("Paste today's post URL first.");
			return;
		}
		busy = 'submit';
		error = '';
		try {
			const before = await api('agents/' + token.trim());
			if (before.data.data.agent.current?.entered) {
				agent = before.data.data.agent;
				raw = JSON.stringify(before.data, null, 2);
				lastChecked = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
				alert('Already entered for Period ' + before.data.data.agent.current.period + ' — no submission sent, as a second one changes nothing.');
				return;
			}
			const res = await api('submissions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
				body: JSON.stringify({ token_id: token.trim(), url })
			});
			if (res.data.data?.status === 'already_entered') {
				agent = res.data.data.agent;
				raw = JSON.stringify(res.data, null, 2);
				alert('Already entered for Period ' + res.data.data.period + ' — no submission sent.');
				return;
			}
			const after = await api('agents/' + token.trim() + '?fresh=1');
			agent = after.data.data.agent;
			raw = JSON.stringify(after.data, null, 2);
			lastChecked = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
			if (after.data.data.agent.current?.entered) {
				alert('Confirmed: entered Period ' + after.data.data.agent.current.period + '. Submission status was: ' + res.data.data.status);
			} else {
				alert('Submission was sent, but the re-check still shows not entered. Do not spam the endpoint — wait a few minutes and press Check again.');
			}
		} catch (e: any) {
			error = 'Submission failed: ' + e.message;
			raw = String(e);
		} finally {
			busy = '';
		}
	}

	function saveToken() {
		try {
			localStorage.setItem('ptah-token', token.trim());
		} catch {}
	}
</script>

<SEO
	title="Ptah Entry Check - Proof of Agent Daily Draw"
	description="Check today's Ptah Proof of Agent draw entry, see the cutoff countdown, odds and wins, and submit your post only if the automatic X scan has not picked it up yet. No wallet, no key, nothing to sign."
	canonicalUrl="https://cryptowalletsx.com/ptah-entry-check"
	ogImage="https://cryptowalletsx.com/og-image.png"
/>

<div class="min-h-screen flex flex-col">
	<HomeHeader />
	<main class="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
		<!-- Hero -->
		<div class="text-center max-w-3xl mx-auto mb-10">
			<p class="text-sm font-semibold tracking-wide text-cyan-500 uppercase mb-3">Ptah · Proof of Agent · Daily Draw</p>
			<h1 class="text-4xl sm:text-5xl font-bold gradient-text leading-tight">Did your post actually count?</h1>
			<p class="text-muted-foreground text-lg mt-4 leading-relaxed">
				Scan lag, a wrong Agent number, a missed cutoff — one small mistake and a day's entry is lost.
				Check your entry in seconds, before the window closes.
			</p>
			<div class="flex flex-wrap justify-center gap-2 mt-5 text-sm">
				<span class="px-3 py-1 rounded-full bg-card border border-border">No wallet</span>
				<span class="px-3 py-1 rounded-full bg-card border border-border">No sign-in</span>
				<span class="px-3 py-1 rounded-full bg-card border border-border">No key or seed phrase</span>
				<span class="px-3 py-1 rounded-full bg-card border border-border">Free to check</span>
			</div>
		</div>

		<!-- Checker -->
		<div class="p-6 sm:p-8 rounded-2xl bg-card/60 border border-border/40 glass-card max-w-3xl mx-auto space-y-5">
			<div>
				<label class="block text-sm font-medium mb-1" for="ptah-token">Your Agent #</label>
				<input id="ptah-token" class="w-full px-4 py-3 rounded-xl bg-background border border-border text-lg" inputmode="numeric" bind:value={token} onchange={saveToken} placeholder="e.g. 12345" />
				<p class="text-sm text-muted-foreground mt-1">The number on your soulbound Proof of Agent card. It is saved only in your own browser, never on this site.</p>
			</div>
			<div>
				<label class="block text-sm font-medium mb-1" for="ptah-url">Today's post URL <span class="text-muted-foreground font-normal">(only needed if you are not entered yet)</span></label>
				<input id="ptah-url" class="w-full px-4 py-3 rounded-xl bg-background border border-border" type="url" bind:value={postUrl} placeholder="https://x.com/username/status/1234567890" />
				<p class="text-sm text-muted-foreground mt-1">Paste as-is — tracking bits are stripped automatically. The post must be public, an original or quote post (not a reply), and its first Agent # must be your own.</p>
			</div>
			<div class="flex gap-3 flex-wrap">
				<button class="px-5 py-3 rounded-xl bg-emerald-500 text-emerald-950 font-semibold disabled:opacity-50" onclick={() => check(false)} disabled={busy !== ''}>Check today's entry</button>
				<button class="px-5 py-3 rounded-xl bg-secondary font-semibold disabled:opacity-50" onclick={submit} disabled={busy !== ''}>Submit this post via API</button>
				<button class="px-5 py-3 rounded-xl bg-secondary font-semibold disabled:opacity-50" onclick={() => check(true)} disabled={busy !== ''}>Refresh (fresh check)</button>
			</div>
			{#if lastChecked}
				<p class="text-sm text-muted-foreground">
					Last checked: {lastChecked}
					{#if cacheState === 'HIT'}· served from the 15-minute cache{/if}
					{#if cacheState === 'MISS'}· fresh from Ptah{/if}
				</p>
			{/if}
		</div>

		{#if error}
			<div class="p-5 rounded-xl bg-red-500/10 border border-red-500/30 mt-8 max-w-3xl mx-auto">
				<p class="text-red-400 font-semibold">{error}</p>
			</div>
		{/if}

		{#if agent}
			<!-- Status -->
			<div class="mt-10 max-w-3xl mx-auto">
				{#if agent.current}
					<div class="p-6 sm:p-8 rounded-2xl border text-center {agent.current.entered ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-red-500/10 border-red-500/40'}">
						<p class="text-3xl sm:text-4xl font-bold {agent.current.entered ? 'text-emerald-400' : 'text-red-400'}">
							{agent.current.entered ? '✅ ENTERED' : '❌ NOT ENTERED YET'}
						</p>
						<p class="text-muted-foreground mt-2">Period {agent.current.period} · draw closes {fmt(agent.current.window_end)}</p>
						<p class="text-2xl font-mono font-bold mt-4">⏳ {countdown(agent.current.window_end)} <span class="text-sm font-sans text-muted-foreground">left to the cutoff</span></p>
						<div class="h-2 rounded-full bg-background border border-border mt-5 overflow-hidden">
							<div class="h-full bg-cyan-500" style="width: {windowProgress(agent.current.window_start, agent.current.window_end)}%"></div>
						</div>
						<p class="text-sm text-muted-foreground mt-2">
							{agent.current.snapshot_at ? `Snapshot frozen at ${fmt(agent.current.snapshot_at)}` : 'Snapshot not frozen yet — entries can still land'}
						</p>
					</div>
				{:else}
					<p class="text-yellow-300 text-center">No draw window open (draws ended Nov 9).</p>
				{/if}
			</div>

			<!-- Stats -->
			<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
				<div class="p-5 rounded-xl bg-card/60 border border-border/40 glass-card"><p class="text-sm text-muted-foreground">Agent #</p><p class="text-2xl font-bold mt-1">{agent.token_id}</p></div>
				<div class="p-5 rounded-xl bg-card/60 border border-border/40 glass-card"><p class="text-sm text-muted-foreground">Card wallet</p><p class="text-sm font-mono break-all mt-1">{agent.owner}</p></div>
				<div class="p-5 rounded-xl bg-card/60 border border-border/40 glass-card">
					<p class="text-sm text-muted-foreground">This draw's odds</p>
					<p class="text-2xl font-bold mt-1">{periodInfo ? oddsText(periodInfo.entrants, periodInfo.slots) : '—'}</p>
					<p class="text-sm text-muted-foreground">{periodInfo ? `${periodInfo.entrants} entrants · ${periodInfo.slots} slots` : ''}</p>
				</div>
				<div class="p-5 rounded-xl bg-card/60 border border-border/40 glass-card">
					<p class="text-sm text-muted-foreground">Prize per slot</p>
					<p class="text-2xl font-bold mt-1">{periodInfo ? `${ptahAmount(periodInfo.per_slot_wei)} PTAH` : '—'}</p>
					<p class="text-sm text-muted-foreground">Airdropped automatically — nothing to claim</p>
				</div>
			</div>

			<!-- Entries + Wins -->
			<div class="grid md:grid-cols-2 gap-6 mt-6">
				<div class="p-6 rounded-xl bg-card/60 border border-border/40 glass-card">
					<h3 class="font-bold text-lg mb-3">Entries on record</h3>
					{#if agent.entries?.length}
						<ul class="space-y-3 text-sm">
							{#each agent.entries as e}
								<li class="border-b border-border/40 pb-3 last:border-0">
									<p class="font-semibold">Period {e.period} · {fmt(e.posted_at)}</p>
									<p class="text-muted-foreground">{e.post.platform}</p>
									<a class="text-sky-400 break-all" href={e.post.url} target="_blank" rel="noopener">{e.post.url}</a>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="text-sm text-muted-foreground">No entries yet.</p>
					{/if}
				</div>
				<div class="p-6 rounded-xl bg-card/60 border border-border/40 glass-card">
					<h3 class="font-bold text-lg mb-3">Wins (published draws only)</h3>
					{#if agent.wins?.length}
						<ul class="space-y-3 text-sm">
							{#each agent.wins as w}
								<li class="border-b border-border/40 pb-3 last:border-0">
									<p class="font-semibold">Period {w.period}, slot {w.slot} — {ptahAmount(w.amount_wei)} PTAH</p>
									{#if w.tx}
										<a class="text-sky-400" href={'https://bscscan.com/tx/' + w.tx} target="_blank" rel="noopener">Payout transaction →</a>
									{:else}
										<p class="text-muted-foreground">Payout not sent yet</p>
									{/if}
								</li>
							{/each}
						</ul>
					{:else}
						<p class="text-sm text-muted-foreground">No win in a published draw yet.</p>
					{/if}
				</div>
			</div>

			{#if raw}
				<details class="mt-6 max-w-3xl mx-auto">
					<summary class="cursor-pointer text-sm text-muted-foreground">Raw Ptah API response (last call)</summary>
					<pre class="whitespace-pre-wrap break-words bg-background border border-border rounded-lg p-3 text-xs overflow-auto mt-2">{raw}</pre>
				</details>
			{/if}
		{/if}

		<!-- How it works -->
		<div class="mt-12 grid md:grid-cols-3 gap-4">
			<div class="p-6 rounded-xl bg-card/60 border border-border/40 glass-card">
				<p class="text-2xl mb-2">1️⃣</p>
				<h3 class="font-bold mb-2">Check first</h3>
				<p class="text-sm text-muted-foreground leading-relaxed">Enter your Agent # and check. Results are cached for 15 minutes at the edge, so repeated checks don't hammer Ptah's API.</p>
			</div>
			<div class="p-6 rounded-xl bg-card/60 border border-border/40 glass-card">
				<p class="text-2xl mb-2">2️⃣</p>
				<h3 class="font-bold mb-2">If entered, stop</h3>
				<p class="text-sm text-muted-foreground leading-relaxed">One entry per card per day. A second submission changes nothing, so this page refuses to send one when you're already in.</p>
			</div>
			<div class="p-6 rounded-xl bg-card/60 border border-border/40 glass-card">
				<p class="text-2xl mb-2">3️⃣</p>
				<h3 class="font-bold mb-2">If not, submit</h3>
				<p class="text-sm text-muted-foreground leading-relaxed">Paste today's post and submit. The page re-checks fresh afterwards to prove the entry landed, before the 10:14 IST cutoff.</p>
			</div>
		</div>

		<!-- Schedule -->
		{#if schedule.length}
			<div class="mt-10">
				<h2 class="text-2xl font-bold mb-4">Draw schedule</h2>
				<p class="text-sm text-muted-foreground mb-4">Each window ends at 04:44 UTC / 10:14 IST. A post counts for the window in which it was published.</p>
				<div class="overflow-x-auto rounded-xl border border-border/40">
					<table class="w-full text-sm">
						<thead>
							<tr class="bg-card text-left">
								<th class="px-4 py-3">Period</th>
								<th class="px-4 py-3">Cutoff</th>
								<th class="px-4 py-3">Status</th>
								<th class="px-4 py-3">Entrants</th>
								<th class="px-4 py-3">Prize / slot</th>
							</tr>
						</thead>
						<tbody>
							{#each schedule as p}
								<tr class="border-t border-border/40">
									<td class="px-4 py-3 font-semibold">{p.index}</td>
									<td class="px-4 py-3">{fmt(p.window_end)}</td>
									<td class="px-4 py-3">{p.status}</td>
									<td class="px-4 py-3">{p.entrants ?? '—'}</td>
									<td class="px-4 py-3">{ptahAmount(p.per_slot_wei)} PTAH</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}

		<div class="mt-10 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
			<p>Ptah is an independent, unofficial project, not affiliated with or endorsed by Binance. Prizes are airdropped automatically to the wallet holding the card — there is nothing to claim, and this page never asks for a key, seed phrase, or signature.</p>
			<p class="mt-2"><a class="text-sky-400" href="https://ptah.trade/poa">ptah.trade/poa</a> · <a class="text-sky-400" href="https://ptah.trade/llms-full.txt">ptah.trade/llms-full.txt</a></p>
		</div>
	</main>
	<Footer />
</div>
