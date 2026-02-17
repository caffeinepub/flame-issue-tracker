# Specification

## Summary
**Goal:** Replace the app’s header logo with the uploaded image and add a matching favicon.

**Planned changes:**
- Convert/crop/scale the uploaded `website logo.png` into a square 512×512 logo asset at `frontend/public/assets/generated/flame-issue-tracker-logo.dim_512x512.png` (maintaining the existing header reference path).
- Ensure the header renders the updated logo correctly and crisply at the current size (`h-10 w-10`) across all pages and viewports.
- Generate a favicon derived from the uploaded logo and reference it in `frontend/index.html` via a `<link rel="icon" ...>` tag.

**User-visible outcome:** The site header displays the new uploaded logo on all pages, and browser tabs show the new favicon (after hard refresh).
