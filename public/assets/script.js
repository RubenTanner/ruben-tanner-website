//welcome text
document.addEventListener("DOMContentLoaded", function () {
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
const contactForm = document.querySelector("#contact form");
const responseMessage = document.querySelector("#responseMessage");

contactForm.addEventListener("submit", (event) => {
  setTimeout(() => {
    contactForm.reset();
    responseMessage.textContent = "Oh cool! I'll get back to you soon :)";
  }, 500); // give it a little bit for slow submissions
});
