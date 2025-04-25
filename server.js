const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const session = require("express-session");
const marked = require("marked");
const frontMatter = require("front-matter");
const fsExtra = require("fs-extra");
const hljs = require("highlight.js");
require("dotenv").config();

// Configure marked with syntax highlighting
marked.setOptions({
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true,
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Session setup for authentication
app.use(
  session({
    secret: process.env.ADMIN_PASSWORD || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 3600000 }, // 1 hour
  })
);

// Blog database setup
const blogDB = path.join(__dirname, "blog-posts.json");
const blogMarkdownDir = path.join(__dirname, "blog-content");

// Ensure blog content directory exists
fsExtra.ensureDirSync(blogMarkdownDir);

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

// Helper function to process markdown content
function processMarkdown(content) {
  return marked.parse(content);
}

// Helper function to get post content
async function getPostContent(post) {
  // Check if post has a markdown file
  const mdFilePath = path.join(blogMarkdownDir, `${post.id}.md`);

  if (fs.existsSync(mdFilePath)) {
    try {
      const mdContent = fs.readFileSync(mdFilePath, "utf8");

      // Check if the markdown has frontmatter
      const parsedContent = frontMatter(mdContent);

      // Update post with any frontmatter attributes
      if (parsedContent.attributes) {
        // Only update if the attribute exists in frontmatter
        if (parsedContent.attributes.title)
          post.title = parsedContent.attributes.title;
        if (parsedContent.attributes.summary)
          post.summary = parsedContent.attributes.summary;
        if (parsedContent.attributes.tags)
          post.tags = parsedContent.attributes.tags;
        if (parsedContent.attributes.date)
          post.date = parsedContent.attributes.date;
      }

      // Parse the markdown body to HTML
      post.content = processMarkdown(parsedContent.body);
      post.isMarkdown = true;
    } catch (error) {
      console.error(`Error processing markdown for post ${post.id}:`, error);
    }
  } else if (post.content && typeof post.content === "string") {
    // If no markdown file exists but content is in the JSON, check if it's markdown
    if (post.isMarkdown) {
      post.content = processMarkdown(post.content);
    }
  }

  return post;
}

// Blog routes
app.get("/api/blog", async (req, res) => {
  try {
    const posts = getPosts();

    // Process each post to check for markdown content
    // For the list view, we don't need to process the full content
    const processedPosts = await Promise.all(
      posts.map(async (post) => {
        // Create a copy of the post to avoid modifying the original
        const postCopy = { ...post };

        // If the post has a markdown file, get the frontmatter data
        const mdFilePath = path.join(blogMarkdownDir, `${post.id}.md`);
        if (fs.existsSync(mdFilePath)) {
          try {
            const mdContent = fs.readFileSync(mdFilePath, "utf8");
            const parsedContent = frontMatter(mdContent);

            // Update post with frontmatter attributes
            if (parsedContent.attributes) {
              if (parsedContent.attributes.title)
                postCopy.title = parsedContent.attributes.title;
              if (parsedContent.attributes.summary)
                postCopy.summary = parsedContent.attributes.summary;
              if (parsedContent.attributes.tags)
                postCopy.tags = parsedContent.attributes.tags;
              if (parsedContent.attributes.date)
                postCopy.date = parsedContent.attributes.date;
            }

            // For list view, we just need a summary, not the full content
            if (!postCopy.summary) {
              // Create a summary from the markdown content
              const plainText = parsedContent.body
                .replace(/#+\s+/g, "") // Remove headings
                .replace(/\[([^\]]+)\]$$[^)]+$$/g, "$1") // Replace links with just their text
                .replace(/!\[[^\]]*\]$$[^)]+$$/g, "[Image]") // Replace images
                .replace(/`{3}[\s\S]*?`{3}/g, "[Code Block]") // Replace code blocks
                .replace(/`([^`]+)`/g, "$1"); // Replace inline code

              postCopy.summary = plainText.substring(0, 200) + "...";
            }

            postCopy.hasMarkdownFile = true;
          } catch (error) {
            console.error(
              `Error processing frontmatter for post ${post.id}:`,
              error
            );
          }
        }

        return postCopy;
      })
    );

    res.json(processedPosts);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

app.get("/api/blog/:id", async (req, res) => {
  try {
    const posts = getPosts();
    const post = posts.find((p) => p.id === req.params.id);

    if (!post) return res.status(404).json({ error: "Post not found" });

    // Process the post to get markdown content if available
    const processedPost = await getPostContent(post);

    res.json(processedPost);
  } catch (error) {
    console.error(`Error fetching blog post ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to fetch blog post" });
  }
});

// Middleware to count views for a blog post
app.use("/blog/:id", (req, res, next) => {
  const posts = getPosts();
  const post = posts.find((p) => p.id === req.params.id);
  if (post) {
    post.views = (post.views || 0) + 1;
    savePosts(posts);
  }
  next();
});

// Admin routes for blog management (protected)
app.post("/api/blog", requireAuth, async (req, res) => {
  try {
    const { title, content, summary, tags, isMarkdown } = req.body;
    if (!title || !content)
      return res.status(400).json({ error: "Title and content are required" });

    const posts = getPosts();
    const id = `${Date.now()}`;
    const newPost = {
      id,
      title,
      content: isMarkdown ? "" : content, // If it's markdown, we'll save to file
      summary: summary || "",
      tags: tags || [],
      date: new Date().toISOString(),
      views: 0,
      isMarkdown: !!isMarkdown,
    };

    // If content is markdown, save it to a file
    if (isMarkdown) {
      const mdFilePath = path.join(blogMarkdownDir, `${id}.md`);

      // Create frontmatter
      const frontmatter = `---
title: ${title}
date: ${new Date().toISOString()}
${summary ? `summary: ${summary}` : ""}
${tags && tags.length ? `tags: [${tags.join(", ")}]` : ""}
---

${content}
`;

      fs.writeFileSync(mdFilePath, frontmatter, "utf8");
    }

    posts.push(newPost);
    savePosts(posts);

    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).json({ error: "Failed to create blog post" });
  }
});

// Update a blog post (protected)
app.put("/api/blog/:id", requireAuth, async (req, res) => {
  try {
    const { title, content, summary, tags, isMarkdown } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const posts = getPosts();
    const postIndex = posts.findIndex((p) => p.id === req.params.id);

    if (postIndex === -1)
      return res.status(404).json({ error: "Post not found" });

    // Update the post in JSON
    posts[postIndex] = {
      ...posts[postIndex],
      title,
      content: isMarkdown ? "" : content, // If it's markdown, we'll save to file
      summary: summary || posts[postIndex].summary,
      tags: tags || posts[postIndex].tags,
      updated: new Date().toISOString(),
      isMarkdown: !!isMarkdown,
    };

    // If content is markdown, save it to a file
    if (isMarkdown && content) {
      const mdFilePath = path.join(blogMarkdownDir, `${req.params.id}.md`);

      // Create frontmatter
      const frontmatter = `---
title: ${title}
date: ${posts[postIndex].date}
updated: ${new Date().toISOString()}
${summary ? `summary: ${summary}` : ""}
${tags && tags.length ? `tags: [${tags.join(", ")}]` : ""}
---

${content}
`;

      fs.writeFileSync(mdFilePath, frontmatter, "utf8");
    }

    savePosts(posts);
    res.json(posts[postIndex]);
  } catch (error) {
    console.error(`Error updating blog post ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to update blog post" });
  }
});

// Delete a blog post (protected)
app.delete("/api/blog/:id", requireAuth, (req, res) => {
  try {
    const posts = getPosts();
    const filteredPosts = posts.filter((p) => p.id !== req.params.id);

    if (filteredPosts.length === posts.length) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Delete the markdown file if it exists
    const mdFilePath = path.join(blogMarkdownDir, `${req.params.id}.md`);
    if (fs.existsSync(mdFilePath)) {
      fs.unlinkSync(mdFilePath);
    }

    savePosts(filteredPosts);
    res.json({ success: true });
  } catch (error) {
    console.error(`Error deleting blog post ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to delete blog post" });
  }
});

// Upload markdown file
app.post("/api/blog/upload-markdown", requireAuth, (req, res) => {
  try {
    const { id, markdown } = req.body;
    if (!id || !markdown) {
      return res
        .status(400)
        .json({ error: "Post ID and markdown content are required" });
    }

    const mdFilePath = path.join(blogMarkdownDir, `${id}.md`);
    fs.writeFileSync(mdFilePath, markdown, "utf8");

    res.json({ success: true });
  } catch (error) {
    console.error("Error uploading markdown:", error);
    res.status(500).json({ error: "Failed to upload markdown" });
  }
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
