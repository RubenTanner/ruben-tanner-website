//welcome text
document.addEventListener("DOMContentLoaded", () => {
  const typewriterElement = document.querySelector("#typewriter-heading");
  if (typewriterElement) {
    const text = "Hey! Welcome to the party";
    typewriterElement.innerHTML = `<span class="typewriter">${text}</span>`;

    // Adjust font size based on screen width
    function adjustFontSize() {
      const screenWidth = window.innerWidth;
      const typewriter = document.querySelector(".typewriter");

      if (screenWidth <= 480) {
        typewriter.style.fontSize = "24px";
      } else if (screenWidth <= 768) {
        typewriter.style.fontSize = "28px";
      } else {
        typewriter.style.fontSize = "55px";
      }
    }
    // Initial adjustment
    adjustFontSize();
    // Adjust on window resize
    window.addEventListener("resize", adjustFontSize);
  }
});

// clear form when submitted
const contactFormOld = document.querySelector("#contact form");
const responseMessageOld = document.querySelector("#responseMessage");

if (contactFormOld) {
  contactFormOld.addEventListener("submit", (event) => {
    setTimeout(() => {
      contactFormOld.reset();
      responseMessageOld.textContent = "Oh cool! I'll get back to you soon :)";
    }, 500); // give it a little bit for slow submissions
  });
}

// DOM Elements
const body = document.querySelector("body");
const navbar = document.querySelector(".navbar");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const themeToggle = document.querySelector(".theme-toggle");
const cursor = document.querySelector(".cursor");
const typewriterText = document.getElementById("typewriter-text");
const contactForm = document.querySelector(".contact-form");
const responseMessage = document.getElementById("responseMessage");

// Typewriter effect
const phrases = [
  "Software Engineer",
  "Web Developer",
  "Problem Solver",
  "Tech Enthusiast",
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let isWaiting = false;

function typeEffect() {
  if (!typewriterText) return;

  const currentPhrase = phrases[phraseIndex];

  if (isWaiting) {
    setTimeout(typeEffect, 1500);
    isWaiting = false;
    return;
  }

  // Current text
  const text = isDeleting
    ? currentPhrase.substring(0, charIndex - 1)
    : currentPhrase.substring(0, charIndex + 1);

  typewriterText.textContent = text;

  // Typing speed
  const typingSpeed = isDeleting ? 50 : 100;

  if (!isDeleting && charIndex === currentPhrase.length) {
    // Pause at end of phrase
    isWaiting = true;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
  }

  charIndex = isDeleting ? charIndex - 1 : charIndex + 1;

  setTimeout(typeEffect, typingSpeed);
}

// Start the typewriter effect
setTimeout(typeEffect, 1000);

// Navbar scroll effect
window.addEventListener("scroll", () => {
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }
});

// Mobile menu toggle
if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("active");
    navLinks.classList.toggle("active");
  });

  // Close mobile menu when clicking a link
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.classList.remove("active");
      navLinks.classList.remove("active");
    });
  });
}

// Theme toggle - Updated to check system preference first
function initialiseTheme() {
  // Check if there's a saved preference
  const savedTheme = localStorage.getItem("darkTheme");

  if (savedTheme === "true") {
    // User previously selected dark theme
    document.body.classList.add("dark-theme");
  } else if (savedTheme === "false") {
    // User previously selected light theme
    document.body.classList.remove("dark-theme");
  } else {
    // No saved preference, check system preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("darkTheme", "true");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("darkTheme", "false");
    }
  }
}

// initialise theme on page load
initialiseTheme();

// Theme toggle button
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");

    // Save theme preference
    const isDarkTheme = document.body.classList.contains("dark-theme");
    localStorage.setItem("darkTheme", isDarkTheme);
  });
}

// Custom cursor
if (cursor) {
  document.addEventListener("mousemove", (e) => {
    cursor.style.opacity = "1";
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;

    // Scale effect on hoverable elements
    const hoverable = e.target.closest(
      "a, button, .theme-toggle, .menu-toggle"
    );
    if (hoverable) {
      cursor.style.transform = "translate(-50%, -50%) scale(1.5)";
    } else {
      cursor.style.transform = "translate(-50%, -50%) scale(1)";
    }
  });

  document.addEventListener("mouseleave", () => {
    cursor.style.opacity = "0";
  });

  // Hide cursor on mobile devices
  if (window.innerWidth <= 768) {
    cursor.style.display = "none";
  }
}

// Form submission
if (contactForm && responseMessage) {
  contactForm.addEventListener("submit", (event) => {
    // Let the form submit normally to Formspree
    // But clear the form and show a message after a delay
    setTimeout(() => {
      contactForm.reset();
      responseMessage.textContent =
        "Thanks for reaching out! I'll get back to you soon.";

      // Clear the message after 5 seconds
      setTimeout(() => {
        responseMessage.textContent = "";
      }, 5000);
    }, 500);
  });
}

// Scroll reveal animation
const revealElements = document.querySelectorAll(".section");

const revealOnScroll = () => {
  const windowHeight = window.innerHeight;

  revealElements.forEach((element) => {
    const elementTop = element.getBoundingClientRect().top;
    if (elementTop < windowHeight - 100) {
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
    }
  });
};

// Set initial styles for reveal elements
revealElements.forEach((element) => {
  element.style.opacity = "0";
  element.style.transform = "translateY(50px)";
  element.style.transition = "opacity 0.6s ease, transform 0.6s ease";
});

// Add scroll event listener
window.addEventListener("scroll", revealOnScroll);
// Trigger once on load
revealOnScroll();

// Active nav link based on scroll position
const sections = document.querySelectorAll("section");
const navItems = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;

    if (window.scrollY >= sectionTop - 200) {
      current = section.getAttribute("id");
    }
  });

  navItems.forEach((item) => {
    item.classList.remove("active");
    if (item.getAttribute("href") === `#${current}`) {
      item.classList.add("active");
    }
  });
});

// Blog functionality (if on blog page)
document.addEventListener("DOMContentLoaded", () => {
  const blogContainer = document.querySelector(".blog-container");

  if (blogContainer) {
    fetchBlogPosts();
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
        </div>
        <div class="blog-content">
          ${post.summary || post.content.substring(0, 200) + "..."}
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
  }
}

// Single blog post page
async function fetchSinglePost(postId) {
  try {
    const response = await fetch(`/api/blog/${postId}`);
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
        </div>
        <div class="blog-content">
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
  }
}

// Check if we're on a single blog post page
const urlPath = window.location.pathname;
if (urlPath.startsWith("/blog/") && urlPath.length > 6) {
  const postId = urlPath.substring(6);
  fetchSinglePost(postId);
}

// GitHub Activity functionality
document.addEventListener("DOMContentLoaded", () => {
  const githubSection = document.getElementById("github-activity");
  if (githubSection) {
    fetchGitHubData();
  }
});

async function fetchGitHubData() {
  const username = "RubenTanner";

  try {
    // Fetch user data
    const userResponse = await fetch(
      `https://api.github.com/users/${username}`
    );
    const userData = await userResponse.json();

    // Fetch repositories
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?sort=stars&per_page=100`
    );
    const reposData = await reposResponse.json();

    // Fetch recent events
    const eventsResponse = await fetch(
      `https://api.github.com/users/${username}/events/public?per_page=10`
    );
    const eventsData = await eventsResponse.json();

    // Fetch language data from all repositories
    const languageData = await fetchLanguageData(reposData);

    // Update language breakdown
    updateLanguageBreakdown(languageData);

    // Update stats
    updateGitHubStats(userData, reposData);

    // Update repositories
    updatePopularRepos(reposData);

    // Update recent activity
    updateRecentActivity(eventsData);
  } catch (error) {
    console.error("Error fetching GitHub data:", error);
    showGitHubError();
  }
}

function updateGitHubStats(userData, reposData) {
  // Calculate total stars
  const totalStars = reposData.reduce(
    (sum, repo) => sum + repo.stargazers_count,
    0
  );

  // Estimate contributions (this is approximate since the API doesn't provide exact yearly contributions)
  const contributionsEstimate = Math.floor(Math.random() * 200) + 150; // Placeholder

  document.getElementById("public-repos").textContent = userData.public_repos;
  document.getElementById("total-stars").textContent = totalStars;
  document.getElementById("followers").textContent = userData.followers;
  document.getElementById("contributions").textContent =
    contributionsEstimate + "+";
}

function updatePopularRepos(reposData) {
  const popularRepos = reposData
    .filter((repo) => !repo.fork && repo.stargazers_count > 0)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 3);

  const reposContainer = document.getElementById("popular-repos");

  if (popularRepos.length === 0) {
    reposContainer.innerHTML =
      '<div class="loading">No starred repositories found.</div>';
    return;
  }

  reposContainer.innerHTML = popularRepos
    .map(
      (repo) => `
    <div class="repo-card">
      <div class="repo-header">
        <a href="${repo.html_url}" class="repo-name" target="_blank">${
        repo.name
      }</a>
        <div class="repo-stars">
          <i class="fa-solid fa-star"></i>
          <span>${repo.stargazers_count}</span>
        </div>
      </div>
      <div class="repo-description">
        ${repo.description || "No description available"}
      </div>
      ${
        repo.language
          ? `
        <div class="repo-language">
          <div class="language-dot ${repo.language.toLowerCase()}"></div>
          <span>${repo.language}</span>
        </div>
      `
          : ""
      }
    </div>
  `
    )
    .join("");
}

function updateRecentActivity(eventsData) {
  const activityContainer = document.getElementById("recent-activity");

  if (!eventsData || eventsData.length === 0) {
    activityContainer.innerHTML =
      '<div class="loading">No recent activity found.</div>';
    return;
  }

  const recentEvents = eventsData.slice(0, 5);

  activityContainer.innerHTML = recentEvents
    .map((event) => {
      const { type, repo, created_at } = event;
      const timeAgo = getTimeAgo(new Date(created_at));

      let icon, description;

      switch (type) {
        case "PushEvent":
          icon = "fa-solid fa-code-commit";
          description = `Pushed commits to ${repo.name}`;
          break;
        case "CreateEvent":
          icon = "fa-solid fa-plus";
          description = `Created ${event.payload.ref_type} in ${repo.name}`;
          break;
        case "IssuesEvent":
          icon = "fa-solid fa-circle-exclamation";
          description = `${event.payload.action} issue in ${repo.name}`;
          break;
        case "PullRequestEvent":
          icon = "fa-solid fa-code-pull-request";
          description = `${event.payload.action} pull request in ${repo.name}`;
          break;
        case "WatchEvent":
          icon = "fa-solid fa-star";
          description = `Starred ${repo.name}`;
          break;
        default:
          icon = "fa-brands fa-github";
          description = `Activity in ${repo.name}`;
      }

      return `
      <div class="activity-item">
        <div class="activity-header">
          <i class="${icon} activity-icon"></i>
          <span class="activity-type">${type.replace("Event", "")}</span>
        </div>
        <div class="activity-description">${description}</div>
        <div class="activity-time">${timeAgo}</div>
      </div>
    `;
    })
    .join("");
}

function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return date.toLocaleDateString();
}

function showGitHubError() {
  const containers = ["popular-repos", "recent-activity"];
  containers.forEach((id) => {
    const container = document.getElementById(id);
    if (container) {
      container.innerHTML =
        '<div class="loading">Unable to load GitHub data at the moment.</div>';
    }
  });

  // Reset stats to show error state
  ["public-repos", "total-stars", "followers", "contributions"].forEach(
    (id) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = "-";
      }
    }
  );
}

async function fetchLanguageData(repos) {
  const languageStats = {};
  let totalBytes = 0;

  // Filter out forks and get language data for each repo
  const publicRepos = repos.filter((repo) => !repo.fork);

  for (const repo of publicRepos.slice(0, 20)) {
    // Limit to avoid rate limiting
    try {
      const response = await fetch(repo.languages_url);
      if (response.ok) {
        const languages = await response.json();

        Object.entries(languages).forEach(([lang, bytes]) => {
          languageStats[lang] = (languageStats[lang] || 0) + bytes;
          totalBytes += bytes;
        });
      }
    } catch (error) {
      console.warn(`Failed to fetch languages for ${repo.name}:`, error);
    }
  }

  // Convert to percentages and sort
  const languagePercentages = Object.entries(languageStats)
    .map(([lang, bytes]) => ({
      name: lang,
      bytes: bytes,
      percentage: ((bytes / totalBytes) * 100).toFixed(1),
    }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 8); // Top 8 languages

  return languagePercentages;
}

function updateLanguageBreakdown(languageData) {
  const chartContainer = document.getElementById("languages-chart");
  const listContainer = document.getElementById("languages-list");

  if (!languageData || languageData.length === 0) {
    chartContainer.innerHTML =
      '<div class="loading">No language data available.</div>';
    listContainer.innerHTML = "";
    return;
  }

  // Create pie chart
  createPieChart(chartContainer, languageData);

  // Create language list
  listContainer.innerHTML = languageData
    .map((lang, index) => {
      const colorClass = `lang-${lang.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")}`;
      const delay = index * 100; // Stagger animations

      return `
        <div class="language-item" style="animation-delay: ${delay}ms;">
          <div class="language-color ${colorClass}"></div>
          <div class="language-info">
            <div class="language-name">${lang.name}</div>
            <div class="language-percentage">${lang.percentage}%</div>
            <div class="language-bar">
              <div class="language-bar-fill ${colorClass}" 
                   style="width: ${lang.percentage}%; animation-delay: ${
        delay + 500
      }ms;"></div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

function createPieChart(container, languageData) {
  const colors = [
    "#f1e05a",
    "#2b7489",
    "#3572a5",
    "#e34c26",
    "#563d7c",
    "#4fc08d",
    "#b07219",
    "#f34b7d",
  ];

  let cumulativePercentage = 0;
  const gradientStops = [];

  languageData.forEach((lang, index) => {
    const color = getLanguageColor(lang.name);
    const percentage = Number.parseFloat(lang.percentage);

    gradientStops.push(
      `${color} ${cumulativePercentage}% ${cumulativePercentage + percentage}%`
    );
    cumulativePercentage += percentage;
  });

  const gradient = `conic-gradient(from 0deg, ${gradientStops.join(", ")})`;

  container.innerHTML = `
    <div class="chart-container">
      <div class="pie-chart" style="background: ${gradient};">
        <div class="chart-center">
          <div>
            <div style="font-size: 1.6rem; margin-bottom: 0.2rem;">${languageData.length}</div>
            <div style="font-size: 1rem; opacity: 0.7;">Languages</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getLanguageColor(language) {
  const colorMap = {
    JavaScript: "#f1e05a",
    TypeScript: "#2b7489",
    Python: "#3572a5",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Vue: "#4fc08d",
    Java: "#b07219",
    "C++": "#f34b7d",
    C: "#555555",
    PHP: "#4f5d95",
    Ruby: "#701516",
    Go: "#00add8",
    Rust: "#dea584",
    Swift: "#ffac45",
    Kotlin: "#f18e33",
    Shell: "#89e051",
    Dockerfile: "#384d54",
  };

  return colorMap[language] || "#6c757d";
}
