(function () {
  const sharedStylesheets = ["/assets/css/identity.css", "/assets/css/nav.css", "/assets/css/page-heroes.css"];
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
      threshold: 0.16,
      rootMargin: "0px 0px -32px 0px",
    }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 70, 260)}ms`;
    observer.observe(item);
  });
})();