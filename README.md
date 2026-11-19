# Abroad Hub

A dependency-free, mobile-first study-abroad planning hub for Nepali students. Browse and filter ten destinations, compare cost benchmarks in each destination's own currency, follow a country-specific process and fee breakdown, estimate a first-year NPR budget, and keep a checklist on this device.

## Run locally

Serve this folder over HTTP (ES modules do not load from `file://`):

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Add a country

Add a profile in `src/data/countries.js` with an `id`, `name`, `flag`, `region`, `studyTypes`, `currency`, `visaName`, `tuitionRange`, NPR `defaults`, `fees`, `process`, and `countrySource`; add the ID to `countryOrder`. The `profile()` helper creates the four consistent checklist sections from the profile and official source links. Keep sources official and update checklist `lastVerified` only when the guide entries have been reviewed.

The destination explorer supports country search, region and study-type filters, and side-by-side comparison for up to three countries. The selected country synchronizes across the destination cards, planner, process guide, fee breakdown, and checklist. Cost rows and destination cards link to their source and show the guide's review date. The fee panel distinguishes official-charge checks, living-funds benchmarks, institution-specific ranges, and policy-dependent insurance.

Checklist progress, country choice, and per-country budget edits are saved in the current browser using local storage; they are not synced across devices. “Export plan” opens a country-specific JSON summary that can be copied or downloaded. “Reset country data” clears only the selected country's saved checklist and budget after confirmation; other countries are preserved.

The checklist flags equivalence documents for foreign/non-NEB qualifications, name/date-of-birth consistency, written deposit refund terms, NOC eligibility, and checking current NOC/offer/invoice requirements with an authorized Nepali bank. The NOC fee is deliberately not hard-coded; use the live Ministry portal.

The app runs directly as native ES modules and needs no install or build step.

## Static go-live assets

The root contains the SVG mark, generated raster app icons, multi-size `favicon.ico`, `site.webmanifest`, Open Graph share image, `robots.txt`, `sitemap.xml`, and a static-host `404.html`. The default metadata uses `https://www.abroadhub.example/` as a reserved placeholder domain.

### Pre-deploy checklist

- [ ] Replace every `https://www.abroadhub.example/` placeholder in `index.html`, `robots.txt`, and `sitemap.xml` with the final HTTPS production origin. Update the canonical URL, Open Graph URL/image URL, and sitemap location together.
- [ ] Confirm the social share image is reachable at `/share-image.png` on the deployed host and preview the page in the platforms you plan to use.
- [ ] Recheck official visa fees, funds benchmarks, health coverage, exchange rates, and NOC/remittance rules before publishing.
- [ ] Deploy the folder as-is to a static host. Configure that host to serve `404.html` for unknown paths if it does not do so automatically.
- [ ] Smoke-test `/`, `/site.webmanifest`, `/robots.txt`, `/sitemap.xml`, each icon, and an unknown path over the production HTTPS domain.

## Important

Budget starter amounts and tuition ranges are editable planning assumptions, not official fees, proof-of-funds figures, quotes, or financial advice. Where a government publishes a fee or funds benchmark, its destination currency, source link, and guide review date are shown; where the amount depends on a live application, school, city, visa duration, or applicant, the guide says to confirm the amount rather than present a fixed figure. Amounts marked `*` are indicative or subject to change. NPR planner values are independent editable estimates, not live currency conversions. The Nepal Rastra Bank link is a reference for checking FX rates, not an FX feed used to calculate the planner.

Visa rules, tuition, health cover, exchange rates, payment channels, NOC requirements, and remittance arrangements can change. Confirm every figure and process with the linked official source, your institution, and an authorized Nepali bank before paying or applying. In particular, recheck Australian visa charges and Canada's current funds threshold before relying on the values shown. A “Last verified” date is the guide-entry review date, not a guarantee that a linked rule has not changed since review.
