const progress = document.getElementById("progress");
const year = document.getElementById("year");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
const themeToggle = document.getElementById("themeToggle");
const backTop = document.getElementById("backTop");
const sections = [...document.querySelectorAll("main section[id]")];

if (year) year.textContent = new Date().getFullYear();

const themeStorageKey = "portfolio-theme";
const applyTheme = (theme) => {
  const useLightMode = theme === "light";
  document.body.classList.toggle("light-mode", useLightMode);
  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", useLightMode ? "true" : "false");
    themeToggle.setAttribute("aria-label", useLightMode ? "Switch to dark mode" : "Switch to light mode");
    themeToggle.setAttribute("title", useLightMode ? "Switch to dark mode" : "Switch to light mode");
  }
};

try {
  applyTheme(window.localStorage.getItem(themeStorageKey) === "light" ? "light" : "dark");
} catch {
  applyTheme("dark");
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("light-mode") ? "dark" : "light";
    applyTheme(nextTheme);
    try {
      window.localStorage.setItem(themeStorageKey, nextTheme);
    } catch {
      // Ignore storage issues and keep the in-memory theme switch.
    }
  });
}

const setProgress = () => {
  const top = window.scrollY || document.documentElement.scrollTop;
  const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const pct = h > 0 ? (top / h) * 100 : 0;
  progress.style.width = `${pct}%`;

  if (backTop) backTop.classList.toggle("show", top > 420);

  let current = "";
  sections.forEach((section) => {
    const start = section.offsetTop - 120;
    if (top >= start) current = section.id;
  });

  document.querySelectorAll(".nav-links a").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === `#${current}`);
  });
};

window.addEventListener("scroll", setProgress, { passive: true });
setProgress();

if (backTop) {
  backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  navLinks.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("in");
  });
}, { threshold: 0.12 });
revelsSafeObserve();

function revelsSafeObserve() {
  reveals.forEach((el) => observer.observe(el));
}

const accordion = document.getElementById("experienceAccordion");
if (accordion) {
  accordion.querySelectorAll(".acc-head").forEach((head) => {
    head.addEventListener("click", () => {
      const item = head.closest(".acc-item");
      const isOpen = item.classList.contains("open");
      accordion.querySelectorAll(".acc-item").forEach((x) => {
        x.classList.remove("open");
        x.querySelector(".acc-head")?.setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        head.setAttribute("aria-expanded", "true");
      }
    });
  });
}

const slider = document.getElementById("achievementSlider");
const sliderProgressBar = document.getElementById("sliderProgressBar");
if (slider) {
  const slides = [...slider.querySelectorAll(".news-slide")];
  const dots = [...slider.querySelectorAll(".slider-dot")];
  const buttons = [...slider.querySelectorAll(".slider-btn")];
  const cycleMs = 5000;
  let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
  let startedAt = performance.now();
  let sliderFrame = null;
  let pausedAt = 0;
  let isPaused = false;

  if (activeIndex < 0) activeIndex = 0;

  const renderSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.hidden = !isActive;
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
    startedAt = performance.now();
    if (sliderProgressBar) {
      sliderProgressBar.style.transform = "scaleX(0)";
    }
  };

  const stopSlider = () => {
    if (sliderFrame) {
      window.cancelAnimationFrame(sliderFrame);
      sliderFrame = null;
    }
  };

  const tickSlider = (now) => {
    if (isPaused) return;
    const progress = Math.min((now - startedAt) / cycleMs, 1);
    if (sliderProgressBar) {
      sliderProgressBar.style.transform = `scaleX(${progress})`;
    }
    if (progress >= 1) {
      renderSlide(activeIndex + 1);
    }
    sliderFrame = window.requestAnimationFrame(tickSlider);
  };

  const startSlider = () => {
    stopSlider();
    if (isPaused && pausedAt) {
      startedAt += performance.now() - pausedAt;
    }
    isPaused = false;
    pausedAt = 0;
    sliderFrame = window.requestAnimationFrame(tickSlider);
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      renderSlide(activeIndex + Number(button.dataset.dir || 1));
      startSlider();
    });
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      renderSlide(index);
      startSlider();
    });
  });

  slider.addEventListener("mouseenter", () => {
    isPaused = true;
    pausedAt = performance.now();
    stopSlider();
  });
  slider.addEventListener("mouseleave", startSlider);

  renderSlide(activeIndex);
  startSlider();
}

const projectSection = document.getElementById("projects");
const filters = document.getElementById("projectFilters");
const projectGrid = document.getElementById("projectGrid");
if (filters && projectGrid && projectSection) {
  const cards = [...projectSection.querySelectorAll(".project")];
  const archive = projectSection.querySelector(".project-archive");
  filters.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      filters.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const key = chip.dataset.filter;
      let showArchive = false;

      cards.forEach((card) => {
        const tags = (card.dataset.tags || "").split(" ");
        const show = key === "all" || tags.includes(key);
        card.style.display = show ? "block" : "none";
        if (show && card.closest(".project-archive")) showArchive = true;
      });

      if (archive && key !== "all") {
        archive.open = showArchive;
      }
    });
  });
}

document.querySelectorAll(".project").forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const rx = `${(0.5 - py) * 4}deg`;
    const ry = `${(px - 0.5) * 6}deg`;
    card.style.setProperty("--rx", rx);
    card.style.setProperty("--ry", ry);
    card.style.setProperty("--mx", `${px * 100}%`);
    card.style.setProperty("--my", `${py * 100}%`);
  });

  card.addEventListener("mouseleave", () => {
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
    card.style.setProperty("--mx", "50%");
    card.style.setProperty("--my", "50%");
  });
});

const modal = document.getElementById("mediaModal");
const frame = document.getElementById("mediaFrame");
const closeModal = document.getElementById("closeModal");

function applyMiddleClip(video) {
  if (!video || video.dataset.middleClipApplied === "true") return;

  const updateRange = () => {
    const duration = Number(video.duration || 0);
    if (!duration || !Number.isFinite(duration)) return;
    video.dataset.clipStart = String(duration * 0.2);
    video.dataset.clipEnd = String(duration * 0.8);
  };

  video.addEventListener("loadedmetadata", updateRange);
  video.addEventListener("play", () => {
    const start = Number(video.dataset.clipStart || 0);
    const end = Number(video.dataset.clipEnd || 0);
    if (start && end && (video.currentTime < start || video.currentTime >= end)) {
      video.currentTime = start;
    }
  });
  video.addEventListener("timeupdate", () => {
    const start = Number(video.dataset.clipStart || 0);
    const end = Number(video.dataset.clipEnd || 0);
    if (start && end && video.currentTime >= end) {
      video.pause();
      video.currentTime = start;
    }
  });

  video.dataset.middleClipApplied = "true";
  if (video.readyState >= 1) updateRange();
}

function openPreview(card) {
  if (!modal || !frame) return;

  const type = card.dataset.mediaType;
  const src = card.dataset.mediaSrc;
  frame.innerHTML = "";

  if (!src) {
    const p = document.createElement("p");
    p.textContent = "No media uploaded yet for this project.";
    frame.appendChild(p);
    modal.showModal();
    return;
  }

  if (type === "pdf") {
    window.open(src, "_blank", "noopener");
    return;
  }

  if (type === "video") {
    const video = document.createElement("video");
    video.controls = true;
    video.src = src;
    applyMiddleClip(video);
    video.addEventListener("error", () => {
      frame.innerHTML = "<p>Media not found yet. Upload the video file into assets/media.</p>";
    });
    video.innerText = "Your browser does not support video playback.";
    frame.appendChild(video);
  } else {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "Project preview";
    img.addEventListener("error", () => {
      frame.innerHTML = "<p>Media not found yet. Upload the image file into assets/media.</p>";
    });
    frame.appendChild(img);
  }

  modal.showModal();
}

document.querySelectorAll(".project-preview").forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".project");
    openPreview(card);
  });
});

// Gallery "show more" toggle
document.querySelectorAll(".gallery-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetSel = btn.dataset.target;
    const grid = targetSel ? document.querySelector(targetSel) : null;
    if (!grid) return;
    const showing = grid.classList.toggle("show-all");
    btn.textContent = showing ? "Show less media" : "Show more media";
  });
});

document.querySelectorAll(".media-thumb").forEach((el) => {
  el.addEventListener("click", () => {
    const type = el.dataset.mediaType;
    const src = el.dataset.mediaSrc;
    openPreview({ dataset: { mediaType: type, mediaSrc: src } });
  });
});

document.querySelectorAll(".media-doc").forEach((btn) => {
  btn.addEventListener("click", () => {
    const src = btn.dataset.mediaSrc;
    if (src) window.open(src, "_blank", "noopener");
  });
});

document.querySelectorAll("video").forEach((video) => applyMiddleClip(video));

// Auto style project links
document.querySelectorAll(".project-links a, .news-links a").forEach((a) => {
  const href = (a.getAttribute("href") || "").toLowerCase();
  const label = (a.textContent || "").toLowerCase();
  if (href.includes("github.com") || label.includes("github")) {
    a.classList.add("link-github");
  }
  if (href.includes("youtube.com") || href.includes("youtu.be")) {
    a.classList.add("link-youtube");
  }
  if (
    label.includes("demo") ||
    label.includes("play") ||
    label.includes("devpost") ||
    href.includes("youtube.com") ||
    href.includes("youtu.be") ||
    href.includes("drive.google.com") ||
    href.includes("itch.io")
  ) {
    a.classList.add("link-demo");
  }
});

if (closeModal && modal) {
  closeModal.addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => {
    const rect = modal.getBoundingClientRect();
    const inDialog = rect.top <= e.clientY && e.clientY <= rect.top + rect.height && rect.left <= e.clientX && e.clientX <= rect.left + rect.width;
    if (!inDialog) modal.close();
  });
}
