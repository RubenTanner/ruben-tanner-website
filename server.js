const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const session = require("express-session");
require("dotenv").config();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Session setup for authentication
app.use(
  session({
    secret: process.env.ADMIN_PASSWORD || "default_secret",
    resave: false,
    saveUninitialised: false,
    cookie: { secure: false, maxAge: 3600000 }, // 1 hour
  })
);

// Blog database setup
const blogDB = path.join(__dirname, "blog-posts.json");
if (!fs.existsSync(blogDB)) fs.writeFileSync(blogDB, JSON.stringify([]));

function getPosts() {
  return JSON.parse(fs.readFileSync(blogDB, "utf8"));
}

function savePosts(posts) {
  fs.writeFileSync(blogDB, JSON.stringify(posts, null, 2));
}

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
}

// Authentication routes
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  // Check credentials against .env values
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.isAuthenticated = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get("/api/auth/status", (req, res) => {
  res.json({
    isAuthenticated: req.session && req.session.isAuthenticated === true,
  });
});

// Blog routes
app.get("/api/blog", (req, res) => {
  const posts = getPosts();
  res.json(posts);
});

app.get("/api/blog/:id", (req, res) => {
  const post = getPosts().find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  // Increment view count
  post.views = (post.views || 0) + 1;
  savePosts(getPosts());

  res.json(post);
});

// Admin routes for blog management (protected)
app.post("/api/blog", requireAuth, (req, res) => {
  const { title, content, summary, tags } = req.body;
  if (!title || !content)
    return res.status(400).json({ error: "Title and content are required" });

  const posts = getPosts();
  const id = `${Date.now()}`;
  const newPost = {
    id,
    title,
    content,
    summary: summary || "",
    tags: tags || [],
    date: new Date().toISOString(),
    views: 0,
  };

  posts.push(newPost);
  savePosts(posts);

  res.status(201).json(newPost);
});

// Update a blog post (protected)
app.put("/api/blog/:id", requireAuth, (req, res) => {
  const { title, content, summary, tags } = req.body;
  if (!title || !content)
    return res.status(400).json({ error: "Title and content are required" });

  const posts = getPosts();
  const postIndex = posts.findIndex((p) => p.id === req.params.id);

  if (postIndex === -1)
    return res.status(404).json({ error: "Post not found" });

  posts[postIndex] = {
    ...posts[postIndex],
    title,
    content,
    summary: summary || posts[postIndex].summary,
    tags: tags || posts[postIndex].tags,
    updated: new Date().toISOString(),
  };

  savePosts(posts);
  res.json(posts[postIndex]);
});

// Delete a blog post (protected)
app.delete("/api/blog/:id", requireAuth, (req, res) => {
  const posts = getPosts();
  const filteredPosts = posts.filter((p) => p.id !== req.params.id);

  if (filteredPosts.length === posts.length) {
    return res.status(404).json({ error: "Post not found" });
  }

  savePosts(filteredPosts);
  res.json({ success: true });
});

// Serve blog index page
app.get("/blog", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "blog", "index.html"));
});

// Serve individual blog posts
app.get("/blog/:id", (req, res) => {
  // Check if the ID exists in our blog posts
  const post = getPosts().find((p) => p.id === req.params.id);

  if (post) {
    // Serve the post template
    res.sendFile(path.join(__dirname, "public", "blog", "post-template.html"));
  } else {
    // If post doesn't exist, redirect to blog index
    res.redirect("/blog");
  }
});

// 404 fallback
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
