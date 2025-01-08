const express = require("express");
const path = require("path");
const subdomain = require("express-subdomain");
const app = express();

// Middleware for static files
app.use(express.static(path.join(__dirname, "public")));

// Subdomains
const blogRouter = express.Router();
const adminRouter = express.Router();

blogRouter.get("/", (req, res) => res.send("Blog landing page"));
adminRouter.get("/", (req, res) => res.send("Admin panel"));

// Subdomain routing
app.use(subdomain("blog", blogRouter));
app.use(subdomain("admin", adminRouter));

// Main site
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);

// Start the server
const PORT = process.env.PORT || 80; // Use port 80 for HTTP
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
