# Specification

## Summary
**Goal:** Fix admin allowlist loading to grant access to authenticated user with Principal ID jwxbf-7t3mq-z2mw2-kglpm-vjiqq-yfjhx-fxojo-5k7kl-i6gx5-idwc6-qqe.

**Planned changes:**
- Fix backend getAdminAllowlist() query to return the complete admin allowlist without throwing errors, with robust error handling to always return a valid array
- Ensure Principal 'jwxbf-7t3mq-z2mw2-kglpm-vjiqq-yfjhx-fxojo-5k7kl-i6gx5-idwc6-qqe' is hardcoded as a permanent super-admin in AccessControl initialization
- Add defensive error handling in AccessDeniedScreen component to keep Principal ID visible and copyable when allowlist fetch fails
- Add backend logging during AccessControl initialization and getAdminAllowlist() execution to verify super-admin presence

**User-visible outcome:** The authenticated user with the specified Principal ID will be recognized as an admin and granted access to restricted areas. If the allowlist cannot be loaded, the user will still see their Principal ID and be able to copy it, with a clear error message displayed.
