const progress = document.getElementById("progress");
const year = document.getElementById("year");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
const backTop = document.getElementById("backTop");
const sections = [...document.querySelectorAll("main section[id]")];

if (year) year.textContent = new Date().getFullYear();

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

const filters = document.getElementById("projectFilters");
const projectGrid = document.getElementById("projectGrid");
if (filters && projectGrid) {
  const cards = [...projectGrid.querySelectorAll(".project")];
  filters.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      filters.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const key = chip.dataset.filter;

      cards.forEach((card) => {
        const tags = (card.dataset.tags || "").split(" ");
        const show = key === "all" || tags.includes(key);
        card.style.display = show ? "block" : "none";
      });
    });
  });
}

const modal = document.getElementById("mediaModal");
const frame = document.getElementById("mediaFrame");
const closeModal = document.getElementById("closeModal");

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

// Click/hover expansion behavior for project cards
document.querySelectorAll(".project").forEach((card) => {
  card.addEventListener("click", (e) => {
    const interactive = e.target.closest("a, button, video");
    if (interactive) return;
    card.classList.toggle("expanded");
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

// Auto style project links
document.querySelectorAll(".project-links a").forEach((a) => {
  const href = (a.getAttribute("href") || "").toLowerCase();
  const label = (a.textContent || "").toLowerCase();
  if (href.includes("github.com") || label.includes("github")) {
    a.classList.add("link-github");
  }
  if (
    label.includes("demo") ||
    label.includes("play") ||
    label.includes("devpost") ||
    href.includes("youtube.com") ||
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
