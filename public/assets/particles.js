/**
 * Interactive Particle System
 * A high-performance particle simulation with mouse interaction
 * Built with vanilla JavaScript and HTML5 Canvas
 *
 * Features:
 * - Real-time physics simulation
 * - Mouse attraction/repulsion
 * - Dynamic particle connections
 * - Adaptive performance optimization
 * - Smooth trail effects
 */

class Vector2D {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }

  subtract(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  }

  multiply(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  divide(scalar) {
    if (scalar !== 0) {
      this.x /= scalar;
      this.y /= scalar;
    }
    return this;
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const mag = this.magnitude();
    if (mag > 0) {
      this.divide(mag);
    }
    return this;
  }

  limit(max) {
    if (this.magnitude() > max) {
      this.normalize().multiply(max);
    }
    return this;
  }

  distance(vector) {
    const dx = this.x - vector.x;
    const dy = this.y - vector.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  copy() {
    return new Vector2D(this.x, this.y);
  }

  static random(min = -1, max = 1) {
    return new Vector2D(
      Math.random() * (max - min) + min,
      Math.random() * (max - min) + min
    );
  }
}

class Particle {
  constructor(x, y, canvas) {
    this.position = new Vector2D(x, y);
    this.velocity = Vector2D.random(-2, 2);
    this.acceleration = new Vector2D();
    this.canvas = canvas;

    // Visual properties
    this.radius = Math.random() * 3 + 1;
    this.mass = this.radius * 0.5;
    this.hue = Math.random() * 60 + 200; // Blue to purple range
    this.alpha = 0.8;

    // Trail system
    this.trail = [];
    this.maxTrailLength = 10;

    // Interaction properties
    this.isAttracted = false;
    this.originalRadius = this.radius;
  }

  applyForce(force) {
    // F = ma, so a = F/m
    const f = force.copy().divide(this.mass);
    this.acceleration.add(f);
  }

  update(mouse, interactionRadius, showTrails) {
    // Mouse interaction
    if (mouse.x !== null && mouse.y !== null) {
      const mousePos = new Vector2D(mouse.x, mouse.y);
      const distance = this.position.distance(mousePos);

      if (distance < interactionRadius) {
        // Calculate force based on distance
        const force = mousePos.copy().subtract(this.position);
        const strength = (interactionRadius - distance) / interactionRadius;

        // Attraction or repulsion based on mouse button
        if (mouse.isPressed) {
          // Repulsion
          force.multiply(-strength * 0.5);
          this.isAttracted = false;
        } else {
          // Attraction
          force.normalize().multiply(strength * 0.3);
          this.isAttracted = true;
        }

        this.applyForce(force);

        // Visual feedback
        this.radius = this.originalRadius + strength * 2;
        this.alpha = 0.8 + strength * 0.2;
      } else {
        this.isAttracted = false;
        this.radius = this.originalRadius;
        this.alpha = 0.8;
      }
    }

    // Update trail
    if (showTrails) {
      this.trail.push(this.position.copy());
      if (this.trail.length > this.maxTrailLength) {
        this.trail.shift();
      }
    } else {
      this.trail = [];
    }

    // Physics update
    this.velocity.add(this.acceleration);
    this.velocity.limit(5); // Max speed
    this.position.add(this.velocity);
    this.acceleration.multiply(0); // Reset acceleration

    // Boundary collision with bounce
    if (
      this.position.x <= this.radius ||
      this.position.x >= this.canvas.width - this.radius
    ) {
      this.velocity.x *= -0.8;
      this.position.x = Math.max(
        this.radius,
        Math.min(this.canvas.width - this.radius, this.position.x)
      );
    }

    if (
      this.position.y <= this.radius ||
      this.position.y >= this.canvas.height - this.radius
    ) {
      this.velocity.y *= -0.8;
      this.position.y = Math.max(
        this.radius,
        Math.min(this.canvas.height - this.radius, this.position.y)
      );
    }

    // Apply friction
    this.velocity.multiply(0.99);
  }

  draw(ctx, showTrails) {
    // Draw trail
    if (showTrails && this.trail.length > 1) {
      ctx.strokeStyle = `hsla(${this.hue}, 70%, 60%, 0.3)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);

      for (let i = 1; i < this.trail.length; i++) {
        const alpha = (i / this.trail.length) * 0.3;
        ctx.globalAlpha = alpha;
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Draw particle
    const gradient = ctx.createRadialGradient(
      this.position.x,
      this.position.y,
      0,
      this.position.x,
      this.position.y,
      this.radius
    );

    gradient.addColorStop(0, `hsla(${this.hue}, 70%, 70%, ${this.alpha})`);
    gradient.addColorStop(
      1,
      `hsla(${this.hue}, 70%, 50%, ${this.alpha * 0.3})`
    );

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Highlight if attracted
    if (this.isAttracted) {
      ctx.strokeStyle = `hsla(${this.hue}, 70%, 80%, 0.8)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(
        this.position.x,
        this.position.y,
        this.radius + 3,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  }
}

class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.mouse = { x: null, y: null, isPressed: false };

    // Settings
    this.particleCount = 150;
    this.interactionRadius = 100;
    this.showConnections = true;
    this.showTrails = false;

    // Performance monitoring
    this.fps = 60;
    this.frameCount = 0;
    this.lastTime = performance.now();

    this.init();
    this.setupEventListeners();
    this.animate();
  }

  init() {
    this.resizeCanvas();
    this.createParticles();
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = Math.min(600, window.innerHeight * 0.6);

    // Update existing particles positions if they're outside new bounds
    this.particles.forEach((particle) => {
      if (particle.position.x > this.canvas.width) {
        particle.position.x = this.canvas.width - particle.radius;
      }
      if (particle.position.y > this.canvas.height) {
        particle.position.y = this.canvas.height - particle.radius;
      }
    });
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      const x = Math.random() * (this.canvas.width - 20) + 10;
      const y = Math.random() * (this.canvas.height - 20) + 10;
      this.particles.push(new Particle(x, y, this.canvas));
    }
  }

  setupEventListeners() {
    // Mouse events
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener("mousedown", () => {
      this.mouse.isPressed = true;
    });

    this.canvas.addEventListener("mouseup", () => {
      this.mouse.isPressed = false;
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.mouse.x = null;
      this.mouse.y = null;
      this.mouse.isPressed = false;
    });

    // Touch events for mobile
    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      this.mouse.x = touch.clientX - rect.left;
      this.mouse.y = touch.clientY - rect.top;
    });

    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.mouse.isPressed = true;
    });

    this.canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      this.mouse.isPressed = false;
    });

    // Window resize
    window.addEventListener("resize", () => {
      this.resizeCanvas();
    });
  }

  drawConnections() {
    if (!this.showConnections) return;

    this.ctx.strokeStyle = "rgba(65, 105, 225, 0.1)";
    this.ctx.lineWidth = 1;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const distance = this.particles[i].position.distance(
          this.particles[j].position
        );

        if (distance < 80) {
          const alpha = ((80 - distance) / 80) * 0.2;
          this.ctx.strokeStyle = `rgba(65, 105, 225, ${alpha})`;

          this.ctx.beginPath();
          this.ctx.moveTo(
            this.particles[i].position.x,
            this.particles[i].position.y
          );
          this.ctx.lineTo(
            this.particles[j].position.x,
            this.particles[j].position.y
          );
          this.ctx.stroke();
        }
      }
    }
  }

  updateFPS() {
    this.frameCount++;
    const currentTime = performance.now();

    if (currentTime - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = currentTime;

      // Adaptive quality based on performance
      if (this.fps < 30 && this.particleCount > 50) {
        this.particleCount = Math.max(50, this.particleCount - 10);
        this.createParticles();
      }
    }
  }

  animate() {
    // Clear canvas with slight trail effect
    this.ctx.fillStyle = "rgba(15, 14, 23, 0.1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw particles
    this.particles.forEach((particle) => {
      particle.update(this.mouse, this.interactionRadius, this.showTrails);
      particle.draw(this.ctx, this.showTrails);
    });

    // Draw connections between nearby particles
    this.drawConnections();

    // Draw interaction radius when mouse is present
    if (this.mouse.x !== null && this.mouse.y !== null) {
      this.ctx.strokeStyle = this.mouse.isPressed
        ? "rgba(255, 100, 100, 0.3)"
        : "rgba(65, 105, 225, 0.3)";
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);
      this.ctx.beginPath();
      this.ctx.arc(
        this.mouse.x,
        this.mouse.y,
        this.interactionRadius,
        0,
        Math.PI * 2
      );
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }

    this.updateFPS();
    requestAnimationFrame(() => this.animate());
  }

  // Public methods for controls
  setParticleCount(count) {
    this.particleCount = count;
    this.createParticles();
  }

  setInteractionRadius(radius) {
    this.interactionRadius = radius;
  }

  toggleConnections() {
    this.showConnections = !this.showConnections;
  }

  toggleTrails() {
    this.showTrails = !this.showTrails;
  }

  reset() {
    this.createParticles();
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;

  const particleSystem = new ParticleSystem(canvas);

  // Setup controls
  const particleCountSlider = document.getElementById("particleCount");
  const particleCountValue = document.getElementById("particleCountValue");
  const interactionRadiusSlider = document.getElementById("interactionRadius");
  const interactionRadiusValue = document.getElementById(
    "interactionRadiusValue"
  );
  const toggleConnectionsBtn = document.getElementById("toggleConnections");
  const toggleTrailsBtn = document.getElementById("toggleTrails");
  const resetBtn = document.getElementById("resetParticles");

  if (particleCountSlider) {
    particleCountSlider.addEventListener("input", (e) => {
      const value = Number.parseInt(e.target.value);
      particleCountValue.textContent = value;
      particleSystem.setParticleCount(value);
    });
  }

  if (interactionRadiusSlider) {
    interactionRadiusSlider.addEventListener("input", (e) => {
      const value = Number.parseInt(e.target.value);
      interactionRadiusValue.textContent = value;
      particleSystem.setInteractionRadius(value);
    });
  }

  if (toggleConnectionsBtn) {
    toggleConnectionsBtn.addEventListener("click", () => {
      particleSystem.toggleConnections();
      toggleConnectionsBtn.textContent = particleSystem.showConnections
        ? "Hide Connections"
        : "Show Connections";
    });
  }

  if (toggleTrailsBtn) {
    toggleTrailsBtn.addEventListener("click", () => {
      particleSystem.toggleTrails();
      toggleTrailsBtn.textContent = particleSystem.showTrails
        ? "Hide Trails"
        : "Show Trails";
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      particleSystem.reset();
    });
  }
});
