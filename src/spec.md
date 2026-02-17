# Specification

## Summary
**Goal:** Ensure the user’s Internet Identity Principal is reliably available from the backend and visible in the app, including restoring a working `/api/whoami` page.

**Planned changes:**
- Add a new public backend query method in `backend/main.mo` that returns the current caller’s Principal (and role if available) in a frontend-friendly format.
- Add a frontend SPA route at `/api/whoami` that displays the current Principal fetched from the backend and includes a one-click Copy action with confirmation.
- Display the authenticated user’s Principal (shortened with a way to view/copy the full value) in the main authenticated UI.
- Update the Access Denied experience to provide English troubleshooting guidance and a link to `/api/whoami` for retrieving the user’s Principal.

**User-visible outcome:** Users can see and copy their current Principal from both `/api/whoami` and the main authenticated UI, and Access Denied screens guide non-admin users to retrieve and share their Principal for admin enablement.
