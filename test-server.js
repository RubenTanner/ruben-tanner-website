const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Mock database for blog posts
const blogDB = path.join(__dirname, "blog-posts.json");
if (!fs.existsSync(blogDB)) fs.writeFileSync(blogDB, JSON.stringify([]));

function getPosts() {
  return JSON.parse(fs.readFileSync(blogDB, "utf8"));
}

function savePosts(posts) {
  fs.writeFileSync(blogDB, JSON.stringify(posts, null, 2));
}

// Routes for blog and admin subdomains
const blogRouter = express.Router();
const adminRouter = express.Router();

blogRouter.get("/", (req, res) => res.send("Blog landing page"));
adminRouter.get("/", (req, res) => res.send("Admin panel"));

app.use("/blog", blogRouter);
app.use("/admin", adminRouter);

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

// Start the HTTP server
const PORT = 3000; // Use port 3000 for local testing
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
