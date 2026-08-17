(function () {
  const sharedStylesheets = [
    "/assets/css/identity.css",
    "/assets/css/nav.css",
    "/assets/css/page-heroes.css",
    "/assets/css/interactions.css",
    "/assets/css/featured.css",
    "/assets/css/mini-viz.css",
    "/assets/css/hero-images.css",
  ];

  sharedStylesheets.forEach((href) => {
    const hasStylesheet = document.querySelector(`link[href="${href}"]`);
    if (hasStylesheet) return;

    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = href;
    document.head.appendChild(stylesheet);
  });

  const header = document.querySelector("header");
  const siteHeader = document.querySelector(".site-header");
  const primaryNav = siteHeader ? siteHeader.querySelector("nav") : null;
  const main = document.querySelector("main");

  if (main && !main.id) main.id = "main-content";

  if (main && !document.querySelector(".skip-link")) {
    const skipLink = document.createElement("a");
    skipLink.className = "skip-link";
    skipLink.href = `#${main.id}`;
    skipLink.textContent = "Skip to main content";
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  if (header && siteHeader && primaryNav) {
    header.classList.add("site-nav-header");
    primaryNav.classList.add("site-nav");
    primaryNav.id = primaryNav.id || "primary-navigation";
    primaryNav.setAttribute("aria-label", "Primary navigation");

    if (!siteHeader.querySelector(".nav-toggle")) {
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "nav-toggle";
      toggle.setAttribute("aria-controls", primaryNav.id);
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = '<span class="nav-toggle-label">Menu</span><span class="nav-toggle-lines" aria-hidden="true"><span class="nav-toggle-line"></span><span class="nav-toggle-line"></span><span class="nav-toggle-line"></span></span>';
      siteHeader.insertBefore(toggle, primaryNav);

      function closeNav() {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      }

      toggle.addEventListener("click", () => {
        const isOpen = document.body.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
      });

      primaryNav.addEventListener("click", (event) => {
        if (event.target.closest("a")) closeNav();
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeNav();
      });

      window.addEventListener("resize", () => {
        if (window.innerWidth > 880) closeNav();
      });
    }

    function updateHeaderState() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });
  }

  const links = document.querySelectorAll(".site-header nav a[href]");
  const current = window.location.pathname.replace(/\/$/, "");
  links.forEach((link) => {
    const target = new URL(link.href).pathname.replace(/\/$/, "");
    if (target === current) link.setAttribute("aria-current", "page");
  });

  const acceptedPublicationTitle = "Multi-center validation of automated CT-based L1 vertebral Hounsfield unit measurement for opportunistic osteoporosis screening";

  const publicationGrid = document.querySelector(".science-page #publications .publication-grid");
  if (publicationGrid && !publicationGrid.textContent.includes(acceptedPublicationTitle)) {
    const publicationCard = document.createElement("article");
    publicationCard.className = "module-card publication-card";
    publicationCard.dataset.publicationId = "pickhardt-l1-hu-accepted";
    publicationCard.innerHTML = `
      <p class="module-kicker">Osteoporosis International · Accepted</p>
      <h3 class="module-title">${acceptedPublicationTitle}</h3>
      <p class="module-meta">Pickhardt, P.J.; Blake, G.M.; Lee, M.H.; Rule, A.D.; Pyrros, A.T.; Rockenbach, M.A.B.C.; Filice, R.W.; Rush, B.E.; Binkley, N.C.; Garrett, J.W.</p>
    `;
    publicationGrid.prepend(publicationCard);
  }

  const cvContent = document.querySelector(".cv-page .doc-content");
  if (cvContent && !cvContent.textContent.includes(acceptedPublicationTitle)) {
    const publicationsHeading = Array.from(cvContent.querySelectorAll(".cv-section-title")).find(
      (heading) => heading.textContent.trim().toUpperCase() === "PUBLICATIONS"
    );

    if (publicationsHeading) {
      const citation = document.createElement("p");
      citation.innerHTML = `Pickhardt, P.J., Blake, G.M., Lee, M.H., Rule, A.D., Pyrros, A.T., Rockenbach, M.A.B.C., Filice, R.W., <strong>Rush, B.E.</strong>, Binkley, N.C., Garrett, J.W. ${acceptedPublicationTitle}. <em>Osteoporosis International</em>, accepted.`;
      publicationsHeading.insertAdjacentElement("afterend", citation);
    }
  }

  const glowTargets = document.querySelectorAll(".button, .cv-page .cv-download-btn, .nav-toggle, .featured-control, .featured-resource-link");
  glowTargets.forEach((target) => {
    target.addEventListener("pointermove", (event) => {
      const rect = target.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      target.style.setProperty("--cursor-x", `${x}%`);
      target.style.setProperty("--cursor-y", `${y}%`);
    });
  });

  document.querySelectorAll("[data-featured-carousel]").forEach((carousel) => {
    const track = carousel.querySelector("[data-featured-track]");
    const previousButton = carousel.querySelector("[data-featured-prev]");
    const nextButton = carousel.querySelector("[data-featured-next]");
    const status = carousel.querySelector("[data-featured-status]");
    if (!track || !previousButton || !nextButton) return;

    const cards = Array.from(track.querySelectorAll(".featured-card"));

    function getStep() {
      const firstCard = cards[0];
      if (!firstCard) return track.clientWidth;
      const style = window.getComputedStyle(track);
      const gap = Number.parseFloat(style.columnGap || style.gap || "0") || 0;
      return firstCard.getBoundingClientRect().width + gap;
    }

    function getCurrentIndex() {
      const step = getStep();
      if (!step) return 0;
      return Math.round(track.scrollLeft / step);
    }

    function updateCarouselState() {
      const maxScroll = track.scrollWidth - track.clientWidth - 2;
      const atStart = track.scrollLeft <= 2;
      const atEnd = track.scrollLeft >= maxScroll;
      previousButton.disabled = atStart;
      nextButton.disabled = atEnd;

      if (status && cards.length) {
        const visibleIndex = Math.min(getCurrentIndex() + 1, cards.length);
        status.textContent = `Showing ${visibleIndex} of ${cards.length}`;
      }
    }

    function scrollByCard(direction) {
      track.scrollBy({ left: direction * getStep(), behavior: "smooth" });
    }

    previousButton.addEventListener("click", () => scrollByCard(-1));
    nextButton.addEventListener("click", () => scrollByCard(1));
    track.addEventListener("scroll", updateCarouselState, { passive: true });
    window.addEventListener("resize", updateCarouselState);

    cards.forEach((card, index) => {
      card.setAttribute("data-featured-index", String(index + 1));
    });

    updateCarouselState();
  });

  const revealSelectors = [
    ".home-hero",
    ".page-hero-header",
    ".home-identity-rail",
    ".featured-section",
    ".featured-card",
    ".section-heading",
    ".module-section",
    ".module-card",
    ".card-grid",
    ".card",
    ".science-section",
    ".cv-section",
    ".hero > .doc-content",
    ".podcast-embed-wrap",
  ];

  revealSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((item) => {
      if (item.closest("header")) return;
      item.classList.add("reveal-on-scroll");
    });
  });

  const revealItems = document.querySelectorAll(".reveal-on-scroll");
  if (!revealItems.length) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -36px 0px",
    }
  );

  revealItems.forEach((item, index) => {
    const siblings = Array.from(item.parentElement ? item.parentElement.children : []);
    const siblingIndex = Math.max(siblings.indexOf(item), 0);
    const delayIndex = Math.min(siblingIndex >= 0 ? siblingIndex : index, 5);
    item.style.setProperty("--reveal-delay", `${delayIndex * 55}ms`);
    observer.observe(item);
  });
})();
