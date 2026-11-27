# Buckshot Roulette 3D

3D Buckshot Roulette game hosted on GitHub Pages.

## Enable cross-device online rooms

GitHub Pages is static hosting, so cross-device rooms need a reachable relay. The
included Cloudflare Worker uses Durable Objects for short-lived message storage.
The Cloudflare Workers free plan is sufficient for small private games.

1. Create a free Cloudflare account and an API token with **Workers Scripts: Edit**
   permission. Find the Account ID on the Cloudflare dashboard overview.
2. In GitHub, open **Settings → Secrets and variables → Actions** and add
   `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as repository secrets.
3. Open **Actions → Deploy online relay → Run workflow**. The workflow output shows
   the deployed `workers.dev` URL.
4. Copy that URL into `relay-config.js`:
   `window.BS3D_RELAY_BASE = 'https://your-worker.your-account.workers.dev';`
5. Commit and push that setting to `gh-page`. GitHub Pages will redeploy the game.

If you can use a terminal instead, the same relay can be deployed with
`npx wrangler login` followed by `npx wrangler deploy` from the repository root.

When the relay is configured and reachable, the menu shows `ONLINE: GLOBAL SYNC`.
Otherwise it reports `OFFLINE: LOCAL TABS ONLY`; local browser-tab sync is not
cross-device multiplayer.

The relay is public and does not provide account authentication. Do not use
sensitive passwords or personal information in game rooms.
