
/* =====================================================
   MyNomini.IN — Main JavaScript
   Guest website interactions
===================================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  initializeFooterYear();
  initializeMobileNavigation();
  initializeActiveNavigation();
  initializeAssetLinks();
});

/* Automatically update the copyright year */
function initializeFooterYear() {
  const yearElement = document.getElementById("footerYear");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

/* Bootstrap mobile navigation */
function initializeMobileNavigation() {
  const navbarElement = document.getElementById("mainNavbar");

  if (!navbarElement || typeof bootstrap === "undefined") {
    return;
  }

  const collapse = bootstrap.Collapse.getOrCreateInstance(
    navbarElement,
    { toggle: false }
  );

  navbarElement.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 992) {
        collapse.hide();
      }
    });
  });
}

/* Highlight the navigation item for the visible section */
function initializeActiveNavigation() {
  const navLinks = document.querySelectorAll(
    '.site-header .nav-link[href^="#"]'
  );

  const sections = Array.from(navLinks)
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!navLinks.length || !sections.length) {
    return;
  }

  function updateActiveLink() {
    let currentSection = sections[0];

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= 140) {
        currentSection = section;
      }
    });

    navLinks.forEach((link) => {
      const isActive =
        link.getAttribute("href") === `#${currentSection.id}`;

      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  window.addEventListener("scroll", updateActiveLink, {
    passive: true
  });

  updateActiveLink();
}

/* Make sure external asset links open safely */
function initializeAssetLinks() {
  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    link.setAttribute("rel", "noopener noreferrer");
  });
}

function initializeMobileNavigation() {
  const navbar = document.getElementById("mainNavbar");

  if (!navbar || typeof bootstrap === "undefined") {
    return;
  }

  const navLinks = navbar.querySelectorAll('a[href^="#"]');

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (!window.matchMedia("(max-width: 991.98px)").matches) {
        return;
      }

      const collapse = bootstrap.Collapse.getInstance(navbar);

      if (collapse && navbar.classList.contains("show")) {
        collapse.hide();
      }
    });
  });
}
