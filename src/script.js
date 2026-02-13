const body = document.body;
const music = document.getElementById("bg-music");
const toggle = document.querySelector(".sound-toggle");
const toggleLabel = document.querySelector(".sound-toggle .sound-label");
let hasMusicStarted = false;
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const unlockScroll = () => {
  body.classList.remove("is-locked");
};

const fadeInMusic = () => {
  if (!music) return;
  music.volume = 0;
  music
    .play()
    .then(() => {
      if (!hasMusicStarted) {
        body.classList.add("music-started");
        setTimeout(() => body.classList.remove("music-started"), 2000);
        hasMusicStarted = true;
      }
      gsap.to(music, { volume: 0.2, duration: 3, ease: "power1.out" });
    })
    .catch(() => {
      // Autoplay is blocked until user interacts; keep button available.
    });
};

const updateToggle = (isPlaying) => {
  toggle.classList.toggle("is-playing", isPlaying);
  toggle.setAttribute("aria-pressed", String(isPlaying));
  if (toggleLabel) {
    toggleLabel.textContent = isPlaying ? "Sound on" : "Sound off";
  }
};

const handleToggle = () => {
  if (!music) return;
  if (music.paused) {
    fadeInMusic();
    updateToggle(true);
  } else {
    music.pause();
    updateToggle(false);
  }
};

if (toggle) {
  toggle.addEventListener("click", handleToggle);
  document.addEventListener(
    "click",
    () => {
      if (music && music.paused) {
        fadeInMusic();
        updateToggle(true);
      }
    },
    { once: true },
  );
}

const hero = document.querySelector("[data-animate='hero'] .content");
const animatedSections = Array.from(
  document.querySelectorAll("[data-animate='true'] .content"),
);
const postcard = document.querySelector(".postcard");

if (!prefersReducedMotion && hero) {
  gsap.fromTo(
    hero,
    { opacity: 0, y: 18 },
    {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: "power3.out",
      onComplete: unlockScroll,
    },
  );
} else {
  unlockScroll();
}

if (!prefersReducedMotion && animatedSections.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const content = entry.target;
        if (content.dataset.played === "true") return;
        const isSlow = content.closest("section")?.dataset.pace === "slow";
        gsap.fromTo(
          content,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: isSlow ? 1.35 : 1.05,
            ease: "power3.out",
          },
        );
        content.dataset.played = "true";
      });
    },
    { threshold: 0.6 },
  );

  animatedSections.forEach((section) => observer.observe(section));
}

const revealPs = () => {
  const nearBottom =
    window.scrollY + window.innerHeight >= document.body.scrollHeight - 12;
  if (nearBottom) {
    body.classList.add("show-ps");
  }
};

let lastTopAt = 0;
const secretSection = document.querySelector("[data-secret]");
const unlockSecret = () => {
  if (!secretSection) return;
  body.classList.add("secret-unlocked");
  secretSection.setAttribute("aria-hidden", "false");
  gsap.to(secretSection, { opacity: 1, duration: 1, ease: "power2.out" });
  setTimeout(revealPostcard, 350);
};

const handleScroll = () => {
  revealPs();
  if (window.scrollY <= 2) {
    const now = Date.now();
    if (now - lastTopAt < 1500) {
      unlockSecret();
    }
    lastTopAt = now;
  }
};

const revealPostcard = () => {
  if (!postcard) return;
  postcard.classList.add("is-visible");
  postcard.setAttribute("aria-hidden", "false");
};

const setScrollProgress = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  body.style.setProperty("--scroll-progress", progress.toFixed(4));
};

let ticking = false;
const handleScrollProgress = () => {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(() => {
    setScrollProgress();
    ticking = false;
  });
};

window.addEventListener("scroll", handleScroll, { passive: true });
window.addEventListener("scroll", handleScrollProgress, { passive: true });
window.addEventListener("resize", setScrollProgress, { passive: true });
window.addEventListener("load", () => setTimeout(unlockScroll, 900));
window.addEventListener("load", setScrollProgress, { passive: true });
