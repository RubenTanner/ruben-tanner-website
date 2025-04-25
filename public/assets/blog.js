// Blog functionality
document.addEventListener("DOMContentLoaded", () => {
  const blogContainer = document.querySelector(".blog-container");

  if (blogContainer) {
    // Check if we're on a single blog post page
    const urlPath = window.location.pathname;
    if (
      urlPath.startsWith("/blog/") &&
      urlPath.length > 6 &&
      !urlPath.endsWith(".html")
    ) {
      const postId = urlPath.substring(6);
      fetchSinglePost(postId);
    } else {
      // We're on the main blog page
      fetchBlogPosts();
    }
  }
});

async function fetchBlogPosts() {
  try {
    const response = await fetch("/api/blog");
    const posts = await response.json();

    const blogContainer = document.querySelector(".blog-container");

    if (posts.length === 0) {
      blogContainer.innerHTML =
        '<div class="blog-empty">No blog posts yet. Check back soon!</div>';
      return;
    }

    // Sort posts by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Render posts
    blogContainer.innerHTML = posts
      .map(
        (post) => `
        <article class="blog-post">
          <h2 class="blog-title">${post.title}</h2>
          <div class="blog-meta">
            <span><i class="fa-regular fa-calendar"></i> ${new Date(
              post.date
            ).toLocaleDateString()}</span>
            <span><i class="fa-regular fa-eye"></i> ${
              post.views || 0
            } views</span>
            ${
              post.hasMarkdownFile
                ? '<span><i class="fa-brands fa-markdown"></i> Markdown</span>'
                : ""
            }
          </div>
          <div class="blog-content">
            ${post.summary || post.content?.substring(0, 200) + "..."}
          </div>
          <div class="blog-tags">
            ${
              post.tags
                ? post.tags
                    .map((tag) => `<span class="blog-tag">${tag}</span>`)
                    .join("")
                : ""
            }
          </div>
          <a href="/blog/${post.id}" class="view-button">Read More</a>
        </article>
      `
      )
      .join("");
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    document.querySelector(".blog-container").innerHTML =
      '<div class="error-message">Error loading blog posts. Please try again later.</div>';
  }
}

async function fetchSinglePost(postId) {
  try {
    const response = await fetch(`/api/blog/${postId}`);

    if (!response.ok) {
      throw new Error("Post not found");
    }

    const post = await response.json();

    const blogContainer = document.querySelector(".blog-container");

    blogContainer.innerHTML = `
        <article class="blog-post">
          <h1 class="blog-title">${post.title}</h1>
          <div class="blog-meta">
            <span><i class="fa-regular fa-calendar"></i> ${new Date(
              post.date
            ).toLocaleDateString()}</span>
            <span><i class="fa-regular fa-eye"></i> ${
              post.views || 0
            } views</span>
            ${
              post.updated
                ? `<span><i class="fa-solid fa-pen-to-square"></i> Updated: ${new Date(
                    post.updated
                  ).toLocaleDateString()}</span>`
                : ""
            }
            ${
              post.isMarkdown
                ? '<span><i class="fa-brands fa-markdown"></i> Markdown</span>'
                : ""
            }
          </div>
          <div class="blog-content markdown-content">
            ${post.content}
          </div>
          <div class="blog-tags">
            ${
              post.tags
                ? post.tags
                    .map((tag) => `<span class="blog-tag">${tag}</span>`)
                    .join("")
                : ""
            }
          </div>
          <a href="/blog" class="view-button">Back to Blog</a>
        </article>
      `;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    document.querySelector(".blog-container").innerHTML = `
        <div class="error-message">
          <h2>Post Not Found</h2>
          <p>The blog post you're looking for doesn't exist or has been removed.</p>
          <a href="/blog" class="view-button">Back to Blog</a>
        </div>
      `;
  }
}
