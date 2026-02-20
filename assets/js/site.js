(function () {
  const links = document.querySelectorAll("nav a[href]");
  const current = window.location.pathname.replace(/\/$/, "");
  links.forEach((link) => {
    const target = new URL(link.href).pathname.replace(/\/$/, "");
    if (target === current) link.setAttribute("aria-current", "page");
  });
})();
