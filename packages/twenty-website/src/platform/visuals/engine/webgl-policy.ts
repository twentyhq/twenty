// One-time WebGL capability probe, SSR-safe. The probe context is released
// immediately so it never counts against the browser's context limit.
let cachedSupportProbe: boolean | null = null;

export function isWebGlSupported(): boolean {
  if (cachedSupportProbe !== null) {
    return cachedSupportProbe;
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  try {
    const probeCanvas = document.createElement('canvas');
    const probeContext =
      probeCanvas.getContext('webgl2') ?? probeCanvas.getContext('webgl');

    if (!probeContext) {
      cachedSupportProbe = false;
      return cachedSupportProbe;
    }

    probeContext.getExtension('WEBGL_lose_context')?.loseContext();
    cachedSupportProbe = true;
    return cachedSupportProbe;
  } catch {
    cachedSupportProbe = false;
    return cachedSupportProbe;
  }
}
