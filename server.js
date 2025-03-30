const express = require("express");
const fs = require("fs");
const path = require("path");
const subdomain = require("express-subdomain");
const app = express();

app.set("trust proxy", true); // Since we're behind Nginx
app.use(express.json());
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

// Subdomains
const blogRouter = express.Router();
const adminRouter = express.Router();

blogRouter.get("/", (req, res) => res.send("Blog landing page"));
adminRouter.get("/", (req, res) => res.send("Admin panel"));

app.use(subdomain("blog", blogRouter));
app.use(subdomain("admin", adminRouter));

app.get("/blog", (req, res) => res.send(getPosts()));

app.get("/blog/:id", (req, res) => {
  const post = getPosts().find((p) => p.id === req.params.id);
  if (!post)
    return res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
  res.send(post);
});

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

app.use("/blog/:id", (req, res, next) => {
  const posts = getPosts();
  const post = posts.find((p) => p.id === req.params.id);
  if (post) {
    post.views += 1;
    savePosts(posts);
  }
  next();
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
