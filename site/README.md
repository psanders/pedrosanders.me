# pedrosanders.me

Static personal site — plain `index.html` + `styles.css` + `main.js`, no build step.
Design source of truth: `../pencil.pen` (Pencil dev).

## Local preview

```bash
cd site
python3 -m http.server 4317
# open http://localhost:4317
```

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | Landing page (hero, community, about, lead magnet, offers, writing, newsletter). |
| `roadmap.html` | Offer detail page — "Voice AI Infrastructure Roadmap" ($1,200). |
| `embed.html` | Offer detail page — "The Embed" (from $15K). |
| `styles.css` | All styling + responsive rules (breakpoints at 980px and 768px). |
| `main.js` | Newsletter submit, contact modal, copy-email, mobile offers carousel dots. |
| `assets/` | `favicon.svg`, `headshot.png` (exported from the Pencil design). |
| `CNAME` | `pedrosanders.me` for GitHub Pages. |

### Icons
Two icon sets, both via CDN:
- **Lucide** (`<i data-lucide="…">`, replaced by `lucide.createIcons()`) for UI glyphs
  (mail, arrow, check, x, map, sparkles…). Lucide renders an `<svg class="lucide"
  stroke="currentColor">`, so size/color are set on `.lucide`, not `i`.
- **Phosphor** (`<i class="ph ph-…-logo">`, web font) for brand logos
  (GitHub/Discord/YouTube/LinkedIn/X) — matches the Pencil design. Lucide no longer
  ships brand icons.

## Newsletter → Google Sheet (Apps Script)

Both signup forms (hero + final CTA) POST `{ email, source }` as JSON. Until the
endpoint is set, the buttons show "Coming soon".

1. Create a Google Sheet, then **Extensions → Apps Script** and add:

   ```js
   function doPost(e) {
     const data = JSON.parse(e.postData.contents);
     const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     sheet.appendRow([new Date(), data.email, data.source || ""]);
     return ContentService
       .createTextOutput(JSON.stringify({ result: "ok" }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

2. **Deploy → New deployment → Web app**, execute as *Me*, access *Anyone*.
3. Copy the `/exec` URL into `NEWSLETTER_URL` at the top of `main.js`.

## Placeholders to finalize

- Social links — all `href="#"` (nav community row + footer). Drop in real URLs.
- `assets/og-banner.png` (1200×630) referenced by OpenGraph/Twitter meta.
- Essay / "Read all essays" / "More about me" links, and the $49 Handbook "Get it" link.
- Offer-page CTAs ("Book the Roadmap", "See how it works") currently open the
  contact modal — swap to a payment/booking link when ready.
- Contact email is `pedrosanders@fonoster.com` (in the modal + `CONTACT_EMAIL` in `main.js`).
