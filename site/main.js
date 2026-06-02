/* ─────────────────────────────────────────────────────────────
   Pedro Sanders — pedrosanders.me
   ───────────────────────────────────────────────────────────── */

// Google Apps Script web app URL for newsletter signups.
// Deploy a Google Apps Script bound to a Sheet (doPost appends a row),
// then paste the /exec URL here.
const NEWSLETTER_URL = "https://script.google.com/macros/s/AKfycbx6293GdHbIDtVSposlXJCNEsAcUXdBH3nNqxx5yyJHr5KpN9GmzUd0j_PO-V7UMEz7/exec";

// Contact email shown in the modal.
const CONTACT_EMAIL = "pedrosanders@fonoster.com";

(function () {
  "use strict";

  // ── Icons ──────────────────────────────────────────────────
  if (window.lucide) lucide.createIcons();

  // ── Scroll to top ──────────────────────────────────────────
  // The nav carries id="top" but is position:sticky, so a native #top
  // jump lands on an element already pinned to the viewport and does
  // nothing. Scroll the window explicitly instead.
  document.querySelectorAll('a[href="#top"]').forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // ── Mobile menu ────────────────────────────────────────────
  const navToggle = document.querySelector(".nav__toggle");
  const mobileMenu = document.getElementById("mobileMenu");
  if (navToggle && mobileMenu) {
    function setMenu(open) {
      mobileMenu.hidden = !open;
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      // lucide replaces the <i> with an <svg>, so rebuild the icon each time.
      navToggle.innerHTML = '<i data-lucide="' + (open ? "x" : "menu") + '"></i>';
      if (window.lucide) lucide.createIcons();
    }
    navToggle.addEventListener("click", function () {
      setMenu(mobileMenu.hidden);
    });
    // Close after picking a destination.
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    // Close on Escape or a tap outside the menu.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !mobileMenu.hidden) setMenu(false);
    });
    document.addEventListener("click", function (e) {
      if (mobileMenu.hidden) return;
      if (!mobileMenu.contains(e.target) && !navToggle.contains(e.target)) setMenu(false);
    });
  }

  // ── Newsletter forms ───────────────────────────────────────
  function showSuccess(form) {
    const onDark = form.classList.contains("signup--dark");
    const msg = document.createElement("div");
    msg.className = "signup__success" + (onDark ? " signup__success--ondark" : "");
    msg.setAttribute("role", "status");
    msg.innerHTML =
      '<i data-lucide="check-circle"></i>' +
      "<span>You're in — thanks for subscribing! Look out for your first email this Saturday.</span>";
    // Replace the form (and its helper note, if any) with the confirmation.
    const note = form.nextElementSibling;
    if (note && note.classList.contains("signup__note")) note.remove();
    form.replaceWith(msg);
    if (window.lucide) lucide.createIcons();
  }

  // Stricter than the browser's lenient type="email": requires a local part,
  // an "@", and a domain with a dot and a 2+ char TLD, with no whitespace.
  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  document.querySelectorAll("[data-newsletter]").forEach(function (form) {
    const input = form.querySelector('input[type="email"]');
    const field = input ? input.closest(".field") : null;
    const btn = form.querySelector(".signup__btn");
    const label = btn ? btn.querySelector(".signup__label") : null;

    function clearError() {
      if (field) field.classList.remove("field--error");
      if (input) input.removeAttribute("aria-invalid");
    }
    if (input) input.addEventListener("input", clearError);

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (!input) return;
      const email = input.value.trim();
      const original = label ? label.textContent : "";

      if (!isValidEmail(email)) {
        if (field) field.classList.add("field--error");
        input.setAttribute("aria-invalid", "true");
        input.focus();
        if (label) {
          label.textContent = "Enter a valid email";
          setTimeout(function () { label.textContent = original; }, 2600);
        }
        return;
      }

      clearError();
      if (label) label.textContent = "Sending…";
      btn.disabled = true;

      try {
        if (!NEWSLETTER_URL) throw new Error("not-configured");
        // Apps Script web apps don't return CORS headers, so we fire the
        // request in no-cors mode (text/plain avoids a preflight) and treat
        // a resolved fetch as success.
        await fetch(NEWSLETTER_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ email: email, source: "pedrosanders.me" })
        });
        showSuccess(form);
      } catch (err) {
        if (label) label.textContent = err.message === "not-configured" ? "Coming soon" : "Try again";
        btn.disabled = false;
        setTimeout(function () {
          if (label) label.textContent = original;
        }, 2600);
      }
    });
  });

  // ── Contact modal ──────────────────────────────────────────
  const modal = document.getElementById("contactModal");
  function openModal(e) {
    if (e) e.preventDefault();
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }
  document.querySelectorAll("[data-contact]").forEach(function (el) {
    el.addEventListener("click", openModal);
  });
  modal.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", closeModal);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  // ── Copy email ─────────────────────────────────────────────
  const copyBtn = document.getElementById("copyEmail");
  if (copyBtn) {
    copyBtn.addEventListener("click", async function () {
      try {
        await navigator.clipboard.writeText(CONTACT_EMAIL);
        const labelSpan = copyBtn.querySelector("span");
        const prev = labelSpan.textContent;
        copyBtn.classList.add("copied");
        labelSpan.textContent = "Copied!";
        setTimeout(function () {
          copyBtn.classList.remove("copied");
          labelSpan.textContent = prev;
        }, 1600);
      } catch (err) {
        /* clipboard unavailable — mailto link still works */
      }
    });
  }

  // ── Offers carousel dots (mobile) ──────────────────────────
  const scroller = document.querySelector(".offers__scroll");
  const dots = document.querySelectorAll(".offers__dots .dot");
  if (scroller && dots.length) {
    scroller.addEventListener(
      "scroll",
      function () {
        const max = scroller.scrollWidth - scroller.clientWidth;
        const ratio = max > 0 ? scroller.scrollLeft / max : 0;
        const active = Math.round(ratio * (dots.length - 1));
        dots.forEach(function (d, i) {
          d.classList.toggle("dot--active", i === active);
        });
      },
      { passive: true }
    );
  }
})();
