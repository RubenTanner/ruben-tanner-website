//welcome text
document.addEventListener("DOMContentLoaded", () => {
  const typewriterElement = document.querySelector("#typewriter-heading");
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
});

// clear form when submitted
const contactFormOld = document.querySelector("#contact form"); // Renamed to avoid conflict
const responseMessageOld = document.querySelector("#responseMessage"); // Renamed to avoid conflict

contactFormOld.addEventListener("submit", (event) => {
  setTimeout(() => {
    contactFormOld.reset();
    responseMessageOld.textContent = "Oh cool! I'll get back to you soon :)";
  }, 500); // give it a little bit for slow submissions
});

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
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// Mobile menu toggle
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

// Theme toggle
themeToggle.addEventListener("click", () => {
  body.classList.toggle("dark-theme");

  // Save theme preference
  const isDarkTheme = body.classList.contains("dark-theme");
  localStorage.setItem("darkTheme", isDarkTheme);
});

// Check for saved theme preference
const savedTheme = localStorage.getItem("darkTheme");
if (savedTheme === "true") {
  body.classList.add("dark-theme");
}

// Custom cursor
document.addEventListener("mousemove", (e) => {
  cursor.style.opacity = "1";
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;

  // Scale effect on hoverable elements
  const hoverable = e.target.closest("a, button, .theme-toggle, .menu-toggle");
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

// Form submission
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
