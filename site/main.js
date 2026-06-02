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
