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
| `index.html` | Single-page markup. Lucide icons via CDN; brand logos (GitHub/Discord/X/LinkedIn/YouTube) are inline SVGs in the sprite at the top of `<body>` (Lucide dropped brand icons from core). |
| `styles.css` | All styling + responsive rules (breakpoints at 980px and 768px). |
| `main.js` | Newsletter submit, contact modal, copy-email, mobile offers carousel dots. |
| `assets/` | `favicon.svg`, `headshot.svg` (placeholder — replace with a real photo named `headshot.png` and update the `<img src>` in the hero). |
| `CNAME` | `pedrosanders.me` for GitHub Pages. |

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
- Headshot image (`assets/headshot.svg` → real photo).
- `assets/og-banner.png` (1200×630) referenced by OpenGraph/Twitter meta.
- Offer / essay / "Read all essays" / "More about me" links.
- Contact email is `pedrosanders@fonoster.com` (in the modal + `CONTACT_EMAIL` in `main.js`).
