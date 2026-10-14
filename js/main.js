
"use strict";

/* =========================================
   MyNominee.In — Main JavaScript
   File: js/main.js
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  initializeLoader();
  initializeNavbar();
  initializeCopyrightYear();
  initializeSmoothNavigation();
});

const currentPage = window.location.pathname
  .split("/")
  .pop()
  .toLowerCase();

document.querySelectorAll(".site-navbar .nav-link").forEach((link) => {
  const page = link.dataset.page;

  const isActive =
    (page === "home" && (currentPage === "" || currentPage === "index.html")) ||
    (page === "analysis" && currentPage === "analysis.html");

  link.classList.toggle("active", isActive);

  if (isActive) {
    link.setAttribute("aria-current", "page");
  } else {
    link.removeAttribute("aria-current");
  }
});

const footerYear = document.getElementById("footerYear");

if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}


/* ---------- 1. Page loader ---------- */

function initializeLoader() {
  const loader = document.getElementById("pageLoader");

  if (!loader) return;

  let loaderHidden = false;

  function hideLoader() {
    if (loaderHidden) return;

    loaderHidden = true;
    loader.classList.add("is-hidden");

    // Remove it from keyboard and screen-reader navigation
    // after the fade-out animation.
    window.setTimeout(() => {
      loader.style.display = "none";
    }, 500);
  }

  // Allow the page to finish rendering before hiding the loader.
  if (document.readyState === "complete") {
    window.setTimeout(hideLoader, 250);
  } else {
    window.addEventListener("load", () => {
      window.setTimeout(hideLoader, 250);
    }, { once: true });
  }

  // Safety fallback in case a resource loads very slowly.
  window.setTimeout(hideLoader, 4000);
}

/* ---------- 2. Navbar scroll effect ---------- */

function initializeNavbar() {
  const navbar = document.querySelector(".site-navbar");

  if (!navbar) return;

  function updateNavbar() {
    navbar.classList.toggle("navbar-scrolled", window.scrollY > 20);
  }

  updateNavbar();

  window.addEventListener("scroll", updateNavbar, {
    passive: true
  });
}

/* ---------- 3. Dynamic copyright year ---------- */

function initializeCopyrightYear() {
  const yearElement = document.getElementById("currentYear");

  if (!yearElement) return;

  yearElement.textContent = new Date().getFullYear();
}

/* ---------- 4. Smooth anchor navigation ---------- */

function initializeSmoothNavigation() {
  const navigationLinks = document.querySelectorAll(
    '.site-navbar a[href^="#"]'
  );

  navigationLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const navbarCollapse = document.getElementById("mainNavigation");

      // Close Bootstrap's mobile navigation after selecting a section.
      if (
        navbarCollapse &&
        navbarCollapse.classList.contains("show") &&
        window.bootstrap
      ) {
        const collapseInstance =
          window.bootstrap.Collapse.getInstance(navbarCollapse);

        if (collapseInstance) {
          collapseInstance.hide();
        }
      }
    });
  });
}
