// Mobile nav toggle
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("is-open");
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
      navLinks.classList.remove("is-open");
    }
  });
}

// Scroll reveal (fallback for browsers without JS animation libs)
const revealElements = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window && revealElements.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
    }
  );

  revealElements.forEach((el) => observer.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add("is-visible"));
}

// Animated skill bars
const skillBars = document.querySelectorAll(".skill-bar");

function animateSkillBars() {
  skillBars.forEach((bar) => {
    const target = bar.getAttribute("data-skill");
    const fill = bar.querySelector(".skill-fill");
    if (!fill) return;

    const barRect = bar.getBoundingClientRect();
    const isVisible =
      barRect.top < window.innerHeight - 80 && barRect.bottom > 80;

    if (isVisible && !fill.dataset.animated) {
      fill.style.width = `${target}%`;
      fill.dataset.animated = "true";
    }
  });
}

window.addEventListener("scroll", animateSkillBars);
window.addEventListener("load", animateSkillBars);

// GSAP-based animations (if available)
if (window.gsap) {
  if (window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Logo intro + subtle idle animation
  gsap.from(".logo", {
    opacity: 0,
    y: -12,
    duration: 0.7,
    ease: "power2.out",
  });

  gsap.to(".logo-mark", {
    y: -2,
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  // Hero intro timeline
  const heroTl = gsap.timeline();

  heroTl
    .from(".hero-content", {
      opacity: 0,
      y: 28,
      duration: 0.9,
      ease: "power3.out",
    })
    .from(
      ".profile-card",
      {
        opacity: 0,
        y: 32,
        duration: 0.9,
        ease: "power3.out",
      },
      "-=0.5"
    );

  // Hero orbit background animation
  gsap.to(".hero-orbit.orbit-1", {
    rotate: 360,
    duration: 40,
    ease: "none",
    repeat: -1,
  });

  gsap.to(".hero-orbit.orbit-2", {
    rotate: -360,
    duration: 55,
    ease: "none",
    repeat: -1,
  });

  gsap.to(".hero-orbit.orbit-3", {
    y: -14,
    duration: 6,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
  });

  // Section reveals
  gsap.utils.toArray("[data-reveal]").forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 26,
      duration: 0.7,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
      },
    });
  });

  // Card hover micro-interactions
  const hoverTargets = document.querySelectorAll(
    ".logo, .btn, .project-card, .service-card, .edu-card, .social-links a"
  );

  hoverTargets.forEach((el) => {
    const isLogo = el.classList.contains("logo");
    const scale = isLogo ? 1.04 : el.classList.contains("btn") ? 1.02 : 1.015;
    el.addEventListener("mouseenter", () => {
      gsap.to(el, {
        scale,
        duration: 0.18,
        ease: "power2.out",
      });
    });
    el.addEventListener("mouseleave", () => {
      gsap.to(el, {
        scale: 1,
        duration: 0.22,
        ease: "power2.out",
      });
    });
  });
}

// Toast notifications
function showToast(message, type = "success") {
  const root = document.getElementById("toast-root");
  if (!root) return;

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;

  const indicator = document.createElement("span");
  indicator.className = "toast-indicator";
  toast.appendChild(indicator);

  const text = document.createElement("span");
  text.textContent = message;
  toast.appendChild(text);

  root.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(4px)";
    setTimeout(() => {
      toast.remove();
    }, 200);
  }, 3200);
}

// EmailJS contact form
const contactForm = document.getElementById("contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nameInput = contactForm.elements.namedItem("name");
    const emailInput = contactForm.elements.namedItem("email");
    const messageInput = contactForm.elements.namedItem("message");
    const submitButton = contactForm.querySelector("button[type='submit']");

    const name = nameInput?.value.trim();
    const email = emailInput?.value.trim();
    const message = messageInput?.value.trim();

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !message) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    if (!emailPattern.test(email)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    if (!window.emailjs || !window.EMAILJS_CONFIG) {
      showToast("Email service is not configured yet.", "error");
      return;
    }

    const originalLabel = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.classList.add("is-loading");
    submitButton.innerHTML = `<span class="btn-spinner" aria-hidden="true"></span><span>Sending...</span>`;

    try {
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

      await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, {
        from_name: name,
        reply_to: email,
        message,
      });

      contactForm.reset();
      showToast("Message sent successfully. Thank you!", "success");
    } catch (error) {
      console.error("EmailJS error", error);
      showToast("Something went wrong while sending. Please try again.", "error");
    } finally {
      submitButton.disabled = false;
      submitButton.classList.remove("is-loading");
      submitButton.textContent = originalLabel;
    }
  });
}

// Footer year
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}


