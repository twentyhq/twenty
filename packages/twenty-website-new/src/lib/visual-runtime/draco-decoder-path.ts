/**
 * URL prefix from which `DRACOLoader` fetches its WASM/JS decoder bundle.
 *
 * Twelve different illustrations independently hard-coded this URL, which
 * meant every Three.js model on the site silently depended on gstatic's
 * availability and version pinning. Centralising it here means we change
 * the version (or the origin, in a future migration to a self-hosted copy)
 * in one place. The trailing slash matters: `DRACOLoader` appends file
 * names directly to it.
 */
export const DRACO_DECODER_PATH =
  'https://www.gstatic.com/draco/versioned/decoders/1.5.6/' as const;

/**
 * Origin of the decoder host, used by the root layout to emit a
 * `<link rel="preconnect">` so the first 3D model on the page does not pay
 * the full TLS handshake cost the moment it starts decoding.
 */
export const DRACO_DECODER_ORIGIN: string = new URL(DRACO_DECODER_PATH).origin;
