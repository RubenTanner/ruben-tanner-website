# ruben-tanner.uk

My personal website. Hand-written HTML, one stylesheet, and a little JavaScript for the theme switch and a chess board. No framework, no build step, no dependencies.

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
deploy/nginx.conf     the server block used on the VPS
dev.js                zero-dependency static server for local work
```

## Working on it

```
npm run dev
```

Then open http://localhost:3000. `dev.js` mirrors the nginx rules (clean URLs, real 404, `/blog` redirect) so what you see locally is what nginx serves.

## Deploying

Copy `public/` to the VPS and reload nginx. See the comments at the top of `deploy/nginx.conf`.

## History

- Oct 2024: vanilla HTML, mostly a home for the Destroyers strength tracker.
- Jan 2025: first proper redesign, still vanilla.
- Apr–Jun 2025: Express server, markdown blog, chess, particles, GitHub stats.
- Jan 2026: Next.js and shadcn.
- Sep 2026: back to static HTML, which is what this is.
