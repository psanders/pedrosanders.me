/* ─────────────────────────────────────────────────────────────
   Pedro Sanders — pedrosanders.me
   ───────────────────────────────────────────────────────────── */

// Google Apps Script web app URL for newsletter signups.
// Deploy a Google Apps Script bound to a Sheet (doPost appends a row),
// then paste the /exec URL here.
const NEWSLETTER_URL = "";

// Contact email shown in the modal.
const CONTACT_EMAIL = "pedrosanders@fonoster.com";

(function () {
  "use strict";

  // ── Icons ──────────────────────────────────────────────────
  if (window.lucide) lucide.createIcons();

  // ── Newsletter forms ───────────────────────────────────────
  document.querySelectorAll("[data-newsletter]").forEach(function (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const btn = form.querySelector(".signup__btn");
      const label = btn.querySelector(".signup__label");
      const email = input.value.trim();
      if (!email) return;

      const original = label ? label.textContent : "";
      if (label) label.textContent = "Sending…";
      btn.disabled = true;

      try {
        if (!NEWSLETTER_URL) throw new Error("not-configured");
        await fetch(NEWSLETTER_URL, {
          method: "POST",
          body: JSON.stringify({ email: email, source: "pedrosanders.me" })
        });
        if (label) label.textContent = "Subscribed ✓";
        form.reset();
      } catch (err) {
        if (label) label.textContent = err.message === "not-configured" ? "Coming soon" : "Try again";
      } finally {
        setTimeout(function () {
          if (label) label.textContent = original;
          btn.disabled = false;
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
