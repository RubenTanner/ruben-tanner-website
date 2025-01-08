const express = require("express");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const subdomain = require("express-subdomain");
const app = express();

// SSL options for HTTPS
const sslOptions = {
  key: fs.readFileSync("/etc/letsencrypt/live/ruben-tanner.uk/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/ruben-tanner.uk/fullchain.pem"),
};

// Middleware to parse JSON data
app.use(express.json());

// Static file serving for styles and scripts
app.use(express.static(path.join(__dirname, "public")));

// Mock database for blog posts
const blogDB = path.join(__dirname, "blog-posts.json");
if (!fs.existsSync(blogDB)) fs.writeFileSync(blogDB, JSON.stringify([]));

// Helper to read/write blog posts
function getPosts() {
  return JSON.parse(fs.readFileSync(blogDB, "utf8"));
}

function savePosts(posts) {
  fs.writeFileSync(blogDB, JSON.stringify(posts, null, 2));
}

// Subdomains
const blogRouter = express.Router();
const adminRouter = express.Router();

blogRouter.get("/", (req, res) => res.send("Blog landing page"));
adminRouter.get("/", (req, res) => res.send("Admin panel"));

app.use(subdomain("blog", blogRouter));
app.use(subdomain("admin", adminRouter));

// Route to list all blog posts
app.get("/blog", (req, res) => {
  const posts = getPosts();
  res.send(posts);
});

// Route to serve a single blog post
app.get("/blog/:id", (req, res) => {
  const posts = getPosts();
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).send("Post not found");
  res.send(post);
});

// Admin route to create a blog post
app.post("/admin/blog", (req, res) => {
  const { title, content } = req.body;
  if (!title || !content)
    return res.status(400).send("Title and content are required");

  const posts = getPosts();
  const id = `${Date.now()}`;
  const newPost = { id, title, content, views: 0 };
  posts.push(newPost);
  savePosts(posts);

  res.status(201).send(newPost);
});

// Middleware to count views for a blog post
app.use("/blog/:id", (req, res, next) => {
  const posts = getPosts();
  const post = posts.find((p) => p.id === req.params.id);
  if (post) {
    post.views += 1;
    savePosts(posts);
  }
  next();
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
