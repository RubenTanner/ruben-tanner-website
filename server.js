const express = require("express");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const subdomain = require("express-subdomain");
const app = express();

app.use(express.json());

//this does all my SSL stuff
const sslOptions = {
  key: fs.readFileSync("/etc/letsencrypt/live/ruben-tanner.uk/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/ruben-tanner.uk/fullchain.pem"),
};

app.use(express.static(path.join(__dirname, "public")));

// Mock database for blog posts TODO replace with a real database
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
  if (!post)
    return res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
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
