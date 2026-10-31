<script lang="ts">
	import HomeHeader from '$lib/components/home/HomeHeader.svelte';
	import Footer from '$lib/components/home/Footer.svelte';
	import SEO from '$lib/components/SEO.svelte';

	let token = $state('43160');
	let postUrl = $state('');
	let agent = $state<any>(null);
	let raw = $state('');
	let error = $state('');
	let busy = $state('');

	if (typeof localStorage !== 'undefined') {
		const saved = localStorage.getItem('ptah-token');
		if (saved) token = saved;
	}

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

	function ptahAmount(wei: string): string {
		try {
			return (BigInt(wei) / 1000000000000000000n).toString();
		} catch {
			return wei;
		}
	}

	async function api(path: string, opts?: RequestInit) {
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
		return j;
	}

	async function check() {
		if (!/^\d+$/.test(token.trim())) {
			alert('Enter your Agent # as digits only.');
			return;
		}
		busy = 'check';
		error = '';
		try {
			const j = await api('agents/' + token.trim());
			agent = j.data.agent;
			raw = JSON.stringify(j, null, 2);
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
			if (before.data.agent.current?.entered) {
				agent = before.data.agent;
				raw = JSON.stringify(before, null, 2);
				alert(
					'Already entered for Period ' + before.data.agent.current.period + ' — no submission sent, as a second one changes nothing.'
				);
				return;
			}
			const res = await api('submissions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
				body: JSON.stringify({ token_id: token.trim(), url })
			});
			const after = await api('agents/' + token.trim());
			agent = after.data.agent;
			raw = JSON.stringify(after, null, 2);
			if (after.data.agent.current?.entered) {
				alert('Confirmed: entered Period ' + after.data.agent.current.period + '. Submission status was: ' + res.data.status);
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
	description="Check today's Ptah Proof of Agent draw entry, and submit your post only if the automatic X scan has not picked it up yet. No wallet, no key, nothing to sign."
	canonicalUrl="https://cryptowalletsx.com/ptah-entry-check"
	ogImage="https://cryptowalletsx.com/og-image.png"
/>

<div class="min-h-screen flex flex-col">
	<HomeHeader />
	<main class="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full">
		<div class="flex items-center gap-3 mb-8">
			<div>
				<h1 class="text-3xl sm:text-4xl font-bold gradient-text">Ptah Entry Check</h1>
				<p class="text-sm text-muted-foreground">Proof of Agent daily draw — check today's entry, and submit it only if the automatic X scan hasn't picked it up yet. No wallet, no private key, nothing to sign.</p>
			</div>
		</div>

		<div class="p-5 rounded-xl bg-card/60 border border-border/40 glass-card space-y-4">
			<div>
				<label class="block text-sm text-muted-foreground mb-1" for="ptah-token">Agent # (your POA card token_id)</label>
				<input id="ptah-token" class="w-full px-3 py-2 rounded-lg bg-background border border-border" inputmode="numeric" bind:value={token} onchange={saveToken} placeholder="e.g. 43160" />
			</div>
			<div>
				<label class="block text-sm text-muted-foreground mb-1" for="ptah-url">Today's X / Binance Square post URL (only needed if you are not entered yet)</label>
				<input id="ptah-url" class="w-full px-3 py-2 rounded-lg bg-background border border-border" type="url" bind:value={postUrl} placeholder="https://x.com/username/status/1234567890" />
				<p class="text-sm text-muted-foreground mt-1">Paste the link as-is — share-tracking bits like ?s=… and ?a=… are stripped automatically. The post must be public, an original or quote post (not a reply), and its first Agent # must be your own number.</p>
			</div>
			<div class="flex gap-3 flex-wrap">
				<button class="px-4 py-2 rounded-lg bg-emerald-500 text-emerald-950 font-semibold disabled:opacity-50" onclick={check} disabled={busy !== ''}>Check today's entry</button>
				<button class="px-4 py-2 rounded-lg bg-secondary font-semibold disabled:opacity-50" onclick={submit} disabled={busy !== ''}>Submit this post via API</button>
				<button class="px-4 py-2 rounded-lg bg-secondary font-semibold disabled:opacity-50" onclick={check} disabled={busy !== ''}>Check wins</button>
			</div>
		</div>

		{#if agent || error}
			<div class="p-5 rounded-xl bg-card/60 border border-border/40 glass-card mt-6 space-y-4">
				{#if error}
					<p class="text-red-400 font-semibold">{error}</p>
				{:else if agent?.current}
					<p class="font-bold">
						{#if agent.current.entered}
							<span class="text-emerald-400">✅ ENTERED — Period {agent.current.period}</span>
						{:else}
							<span class="text-red-400">❌ NOT ENTERED YET — Period {agent.current.period}</span>
						{/if}
					</p>
					<div class="grid sm:grid-cols-2 gap-3 text-sm">
						<div><p class="text-muted-foreground">Agent #</p><p>{agent.token_id}</p></div>
						<div><p class="text-muted-foreground">Wallet</p><p class="break-all">{agent.owner}</p></div>
						<div><p class="text-muted-foreground">Window ends (cutoff)</p><p>{fmt(agent.current.window_end)} ({agent.current.window_end})</p></div>
						<div><p class="text-muted-foreground">Snapshot frozen at</p><p>{agent.current.snapshot_at ? fmt(agent.current.snapshot_at) : 'Not frozen yet'}</p></div>
					</div>
				{:else}
					<p class="text-yellow-300">No draw window open (draws ended Nov 9).</p>
				{/if}

				{#if agent}
					<div>
						<h3 class="font-bold mb-2">Entries on record</h3>
						{#if agent.entries?.length}
							<ul class="space-y-1 text-sm">
								{#each agent.entries as e}
									<li>Period {e.period} — {fmt(e.posted_at)} — {e.post.platform} — <a class="text-sky-400 break-all" href={e.post.url} target="_blank" rel="noopener">{e.post.url}</a></li>
								{/each}
							</ul>
						{:else}
							<p class="text-sm text-muted-foreground">No entries yet.</p>
						{/if}
					</div>
					<div>
						<h3 class="font-bold mb-2">Wins (published draws only)</h3>
						{#if agent.wins?.length}
							<ul class="space-y-1 text-sm">
								{#each agent.wins as w}
									<li>
										Period {w.period}, slot {w.slot} — {ptahAmount(w.amount_wei)} PTAH (exact wei: {w.amount_wei})
										{#if w.tx}
											— <a class="text-sky-400" href={'https://bscscan.com/tx/' + w.tx} target="_blank" rel="noopener">payout</a>
										{:else}
											— payout not sent yet
										{/if}
									</li>
								{/each}
							</ul>
						{:else}
							<p class="text-sm text-muted-foreground">No win in a published draw yet.</p>
						{/if}
					</div>
				{/if}

				<div>
					<p class="text-sm text-muted-foreground mb-1">Raw Ptah API response (last call)</p>
					<pre class="whitespace-pre-wrap break-words bg-background border border-border rounded-lg p-3 text-xs overflow-auto">{raw}</pre>
				</div>
			</div>
		{/if}

		<div class="p-5 rounded-xl bg-card/60 border border-border/40 glass-card mt-6">
			<h3 class="font-bold mb-3">How it works</h3>
			<ol class="list-decimal ml-5 space-y-2 text-muted-foreground">
				<li><b class="text-foreground">Check first.</b> This page calls Ptah's public API through this site's own proxy (<code>/api/ptah/…</code> → <code>https://ptah.trade/api/poa/…</code>), because Ptah's API does not send browser CORS headers.</li>
				<li><b class="text-foreground">If <code>entered</code> is already <code>true</code>, stop.</b> You are in today's draw. A second submission changes nothing — one entry per card per day.</li>
				<li><b class="text-foreground">If <code>entered</code> is <code>false</code></b> and you pasted today's post, Submit sends <code>POST /api/poa/submissions</code> with <code>token_id</code> and the canonical post URL, plus a fresh UUID <code>Idempotency-Key</code> header, then re-checks the card to prove the entry landed.</li>
				<li>Draws run daily until Nov 9. Each window ends at <b class="text-foreground">04:44 UTC = 10:14 IST</b>. A post counts for the window in which it was published.</li>
			</ol>
			<p class="text-sm text-muted-foreground mt-4">Ptah is an independent, unofficial project, not affiliated with or endorsed by Binance. Prizes are airdropped automatically to the wallet holding the card — there is nothing to claim, and this page never asks for a key, seed phrase, or signature.</p>
			<p class="text-sm mt-2"><a class="text-sky-400" href="https://ptah.trade/poa">ptah.trade/poa</a> · <a class="text-sky-400" href="https://ptah.trade/llms-full.txt">ptah.trade/llms-full.txt</a></p>
		</div>
	</main>
	<Footer />
</div>
