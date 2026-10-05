# ruben-tanner.uk

My personal website. Hand-written HTML, one stylesheet, and a little JavaScript for the theme switch and a chess board. No framework, no build step, no dependencies — just a tiny Node server in front of static files, run under PM2.

Live at [ruben-tanner.uk](https://www.ruben-tanner.uk).

## Layout

```
public/               everything that gets served
  index.html          the page
  404.html
  assets/site.css     the only stylesheet
  assets/site.js      theme toggle; loads the chess board on demand
  assets/chess.js     board UI
  assets/chess-worker.js  minimax engine in a Web Worker
  assets/vendor/      chess.js (BSD-2, self-hosted)
  assets/fonts/       Space Grotesk, IBM Plex Sans, IBM Plex Mono as woff2
server.js             the server: local dev AND production (via PM2)
ecosystem.config.js   PM2 process file
deploy/nginx.conf     the server block used on the VPS, reverse-proxies to PM2
```

## Working on it

```
npm run dev
```

Then open http://localhost:3000. `server.js` has no dependencies, so `npm install` isn't needed.

## Deploying

The VPS already runs this under PM2 rather than having nginx read the directory directly, so a deploy is: get the new files onto the VPS, then restart the PM2 process.

1. Copy the whole repo to the VPS (Cyberduck, rsync, git — whatever's easiest; there's no build step to run first).
2. On the VPS, in the repo directory:
   ```
   pm2 restart ruben-tanner.uk
   ```
   First time only: `pm2 start ecosystem.config.js && pm2 save`.

nginx (`deploy/nginx.conf`) just proxies `ruben-tanner.uk` / `www.ruben-tanner.uk` to whatever port `ecosystem.config.js` sets — update it once if that port ever changes, no redeploys needed after.

## History

- Oct 2024: vanilla HTML, mostly a home for the Destroyers strength tracker.
- Jan 2025: first proper redesign, still vanilla.
- Apr–Jun 2025: Express server, markdown blog, chess, particles, GitHub stats.
- Jan 2026: Next.js and shadcn.
- Oct 2026: back to static HTML served by a tiny Node process under PM2.
