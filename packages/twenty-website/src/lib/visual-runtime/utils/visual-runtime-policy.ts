export type WebGlPolicyDecision =
  | { allowed: true; reducedMotion: boolean }
  | { allowed: false; reason: WebGlPolicyDenialReason; reducedMotion: boolean };

type WebGlPolicyDenialReason = 'kill-switch' | 'no-webgl-support';

export class WebGlUnavailableError extends Error {
  readonly reason: WebGlPolicyDenialReason;

  constructor(reason: WebGlPolicyDenialReason) {
    super(`WebGL is unavailable (${reason})`);
    this.name = 'WebGlUnavailableError';
    this.reason = reason;
  }
}

function readBooleanEnv(value: string | undefined): boolean {
  if (value === undefined) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

function isHeavyVisualsKillSwitchEnabled(): boolean {
  return readBooleanEnv(process.env.NEXT_PUBLIC_DISABLE_HEAVY_VISUALS);
}

let cachedSupportProbe: boolean | null = null;

function detectWebGlSupport(): boolean {
  if (cachedSupportProbe !== null) {
    return cachedSupportProbe;
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    cachedSupportProbe = false;
    return cachedSupportProbe;
  }

  try {
    const probeCanvas = document.createElement('canvas');
    const probeContext =
      probeCanvas.getContext('webgl2') ??
      probeCanvas.getContext('webgl') ??
      probeCanvas.getContext('experimental-webgl');

    if (!probeContext) {
      cachedSupportProbe = false;
      return cachedSupportProbe;
    }

    const loseContextExtension = (
      probeContext as WebGLRenderingContext
    ).getExtension('WEBGL_lose_context');
    loseContextExtension?.loseContext();

    cachedSupportProbe = true;
    return cachedSupportProbe;
  } catch {
    cachedSupportProbe = false;
    return cachedSupportProbe;
  }
}

function detectPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !('matchMedia' in window)) {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function evaluateWebGlPolicy(): WebGlPolicyDecision {
  const reducedMotion = detectPrefersReducedMotion();

  if (isHeavyVisualsKillSwitchEnabled()) {
    return { allowed: false, reason: 'kill-switch', reducedMotion };
  }

  if (!detectWebGlSupport()) {
    return { allowed: false, reason: 'no-webgl-support', reducedMotion };
  }

  return { allowed: true, reducedMotion };
}
