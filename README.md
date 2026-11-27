# Buckshot Roulette 3D

3D Buckshot Roulette game hosted on GitHub Pages.

## Set up free cross-device rooms with Supabase

1. Create a free project at [supabase.com](https://supabase.com/).
2. Open **SQL Editor → New query**, paste the contents of `supabase.sql`, and run it.
3. In **Project Settings → API**, copy the **Project URL** and the **anon/public key**.
   Never use or share the `service_role` key.
4. Open `relay-config.js` on the repository's `gh-page` branch in GitHub and select
   **Edit**. Fill in the two values below, then commit. You can also send these
   two public values to the maintainer to have them configured:

   ```js
   window.BS3D_SUPABASE_URL = 'https://your-project.supabase.co';
   window.BS3D_SUPABASE_ANON_KEY = 'your-anon-public-key';
   ```

5. Commit the change. GitHub Pages will redeploy automatically; reload the game.
   The menu should show `ONLINE: GLOBAL SYNC`.

The database policies intentionally allow unauthenticated game clients to read and
publish lobby packets. The anon/publishable key is intended for browser use; never
use or share the `service_role` or secret key. Room passwords and game state are
visible to clients, so do not reuse a real password or put sensitive information
in a room.
