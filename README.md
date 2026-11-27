# Buckshot Roulette 3D

3D Buckshot Roulette game hosted on GitHub Pages.

## Enable cross-device online rooms

GitHub Pages is static hosting, so cross-device rooms need a reachable relay. The
included Cloudflare Worker uses Durable Objects for short-lived message storage.
The Cloudflare Workers free plan is sufficient for small private games.

1. Install Node.js, create a free Cloudflare account, then authenticate from this
   repository with `npx wrangler login`.
2. Deploy the relay from the repository root with `npx wrangler deploy`.
3. Copy the `workers.dev` URL printed by Wrangler into `relay-config.js`:
   `window.BS3D_RELAY_BASE = 'https://your-worker.your-account.workers.dev';`
4. Commit and push that setting to `gh-page`. GitHub Pages will redeploy the game.

When the relay is configured and reachable, the menu shows `ONLINE: GLOBAL SYNC`.
Otherwise it reports `OFFLINE: LOCAL TABS ONLY`; local browser-tab sync is not
cross-device multiplayer.

The relay is public and does not provide account authentication. Do not use
sensitive passwords or personal information in game rooms.
