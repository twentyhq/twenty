# Brand assets (patch P3)

Files here replace the upstream file at the same path, relative to the engine root, when `apply-brand.mjs` runs. A file whose upstream path no longer exists fails the run.

Empty until the brand is chosen. Upstream files to replace (keep the same name, size and format):

| Upstream path | What it is |
| --- | --- |
| `packages/twenty-front/public/images/icons/android/*.png` | Favicon (48x48 is the `<link rel="icon">`), Android launcher icons, sign-in logo (192x192) |
| `packages/twenty-front/public/images/icons/ios/*.png` | Apple touch icons |
| `packages/twenty-front/public/images/icons/windows11/*.png` | PWA tiles listed in `manifest.json` |
| `packages/twenty-front/public/images/integrations/twenty-logo.svg` | Logo on onboarding and app-connection screens |

Example: `assets/packages/twenty-front/public/images/integrations/twenty-logo.svg`.

Emails load their logo from a URL, not a file: set `emailLogoUrl` in `brand.json` to a public URL of the logo (for example the 150x150 Windows tile on our app domain).
