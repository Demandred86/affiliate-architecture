# Cloudflare configuration

- Configuration file: `wrangler.jsonc`
- Assets directory: `./apps/site/dist`
- Build command: `npm run build:site`
- Deploy command: `npx wrangler deploy`
- Validation result: Passed without deploying. `wrangler.jsonc` parsed as valid JSONC with `name`, `compatibility_date`, and `assets.directory` set to `./apps/site/dist` (no Worker `main`). `npm run build:site` succeeded. Confirmed `apps/site/dist/best-pruning-shears-for-small-hands/index.html` exists. Wrangler was not installed; deploy was not run.
