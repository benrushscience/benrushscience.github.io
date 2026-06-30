(function () {
  const identityHref = "/assets/css/identity.css";
  const hasIdentityStylesheet = document.querySelector(`link[href="${identityHref}"]`);
  if (!hasIdentityStylesheet) {
    const identityStylesheet = document.createElement("link");
    identityStylesheet.rel = "stylesheet";
    identityStylesheet.href = identityHref;
    document.head.appendChild(identityStylesheet);
  }

  const links = document.querySelectorAll("nav a[href]");
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