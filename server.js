const express = require("express");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const subdomain = require("express-subdomain");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// env variables
dotenv.config();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// SSL stuff
const sslOptions = {
  key: fs.readFileSync("/etc/letsencrypt/live/ruben-tanner.uk/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/ruben-tanner.uk/fullchain.pem"),
};

app.use(express.static(path.join(__dirname, "public")));

// Mock database for blog posts TODO: Use a real database
const blogDB = path.join(__dirname, "blog-posts.json");
if (!fs.existsSync(blogDB)) fs.writeFileSync(blogDB, JSON.stringify([]));

function getPosts() {
  return JSON.parse(fs.readFileSync(blogDB, "utf8"));
}

function savePosts(posts) {
  fs.writeFileSync(blogDB, JSON.stringify(posts, null, 2));
}

// Subdomains stuff
const blogRouter = express.Router();
const adminRouter = express.Router();

blogRouter.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "blog.html"))
);
blogRouter.get("/:id", (req, res) => {
  const posts = getPosts();
  const post = posts.find((p) => p.id === req.params.id);
  if (!post)
    return res.status(404).sendFile(path.join(__dirname, "public", "404.html"));

  post.views += 1;
  savePosts(posts);
  res.sendFile(path.join(__dirname, "public", "single-post.html"));
});

adminRouter.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin-login.html"));
});
adminRouter.post("/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.redirect("/admin");
  } else {
    res.status(401).send("Unauthorized: Incorrect password");
  }
});

adminRouter.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});
adminRouter.post("/blog", (req, res) => {
  const { title, summary, content } = req.body;
  if (!title || !summary || !content) {
    return res.status(400).send("All fields are required");
  }

  const posts = getPosts();
  const newPost = {
    id: `${Date.now()}`,
    title,
    summary,
    content,
    views: 0,
  };
  posts.push(newPost);
  savePosts(posts);
  res.redirect("/admin");
});

// Use subdomain routing
app.use(subdomain("blog", blogRouter));
app.use(subdomain("admin", adminRouter));

// Catch-all for 404 errors
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

// HTTP to HTTPS redirection
http
  .createServer((req, res) => {
    res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
    res.end();
  })
  .listen(80);

// Start the HTTPS server
https.createServer(sslOptions, app).listen(443, () => {
  console.log("HTTPS Server running on port 443");
});
