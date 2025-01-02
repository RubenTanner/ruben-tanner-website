//welcome text
document.addEventListener("DOMContentLoaded", function () {
  const typewriterElement = document.getElementById("typewriter-heading");
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

//contact me form
const form = document.getElementById("contactForm");
const responseMessage = document.getElementById("responseMessage");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.get("email"),
        message: formData.get("message"),
      }),
    });

    const result = await response.json();

    if (response.ok) {
      responseMessage.textContent = "Message sent successfully!";
      responseMessage.style.color = "green";
      form.reset();
    } else {
      responseMessage.textContent = `Error: ${
        result.message || "Failed to send message."
      }`;
      responseMessage.style.color = "red";
    }
  } catch (error) {
    responseMessage.textContent = "Something went wrong. Please try again.";
    responseMessage.style.color = "red";
  }
});
