// Production server, run under PM2 as "ruben-tanner.uk".
// Zero dependencies: serves public/ with the same rules the old nginx
// static-root config had, since nginx now reverse-proxies to this process
// instead of reading the directory directly. See deploy/nginx.conf.
//   /            -> public/index.html
//   /foo         -> public/foo.html if it exists
//   /blog(/...)  -> 301 to /
//   anything else missing -> public/404.html with a 404 status
//
// Also doubles as the local dev server: `npm run dev` / `npm run start`
// both run this file. Port comes from $PORT, falling back to 3000 so it
// still works with no environment set up at all.

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "public");
const PORT = Number(process.env.PORT) || 3000;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

// Assets aren't fingerprinted, so HTML always revalidates while fonts and
// images can sit for a while. Mirrors the Cache-Control values the old
// nginx static-root config used.
function cacheControl(ext) {
  if (ext === ".html") return "no-cache";
  if (ext === ".css" || ext === ".js") return "public, max-age=3600";
  if ([".woff2", ".png", ".ico", ".svg", ".webmanifest"].includes(ext)) {
    return "public, max-age=2592000";
  }
  return "no-cache";
}

function send(res, status, file) {
  const ext = path.extname(file);
  const type = TYPES[ext] || "application/octet-stream";
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": cacheControl(ext),
  });
  fs.createReadStream(file).pipe(res);
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    let pathname = decodeURIComponent(url.pathname);

    if (pathname === "/blog" || pathname.startsWith("/blog/")) {
      res.writeHead(301, { Location: "/" });
      return res.end();
    }

    if (pathname.endsWith("/")) pathname += "index.html";
    const candidates = [pathname, `${pathname}.html`].map((p) =>
      path.join(ROOT, p)
    );
    const file = candidates.find(
      (f) => f.startsWith(ROOT) && fs.existsSync(f) && fs.statSync(f).isFile()
    );

    if (file) return send(res, 200, file);
    send(res, 404, path.join(ROOT, "404.html"));
  })
  .listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });
