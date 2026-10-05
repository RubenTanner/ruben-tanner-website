// Zero-dependency static server for local development.
// Mirrors the production nginx behaviour in deploy/nginx.conf:
//   /            -> public/index.html
//   /foo         -> public/foo.html if it exists
//   /blog(/...)  -> 301 to /
//   anything else missing -> public/404.html with a 404 status
// Production is nginx; this file never runs on the server.

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

function send(res, status, file) {
  const type = TYPES[path.extname(file)] || "application/octet-stream";
  res.writeHead(status, { "Content-Type": type });
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
