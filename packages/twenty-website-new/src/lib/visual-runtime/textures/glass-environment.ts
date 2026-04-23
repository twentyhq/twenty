/**
 * Path to the shared glass-environment equirectangular texture.
 *
 * This image was previously inlined as a ~235 KB base64 data URL inside four
 * separate illustration modules, which forced V8 to parse, intern and retain
 * roughly 940 KB of duplicated string data on every page load (and prevented
 * the browser from caching it across illustrations). Hosting it once under
 * `/public` lets it be:
 *
 *   - downloaded a single time
 *   - cached by the browser across illustrations and across page loads
 *   - parsed by the JPEG decoder (native, GPU-friendly) instead of by V8
 *
 * The image is loaded via `THREE.TextureLoader().load(url)`, which is already
 * asynchronous, so the call sites need no other change.
 */
export const GLASS_ENVIRONMENT_TEXTURE_URL =
  '/illustrations/common/glass-environment.jpg' as const;
