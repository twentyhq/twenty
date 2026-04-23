/**
 * Whether a heavy WebGL visual is *eligible* to mount on this device.
 *
 * Two independent signals:
 *   1. A hard env kill switch (`NEXT_PUBLIC_DISABLE_HEAVY_VISUALS`) for
 *      emergency rollouts.
 *   2. A capability probe — can the browser actually create a WebGL
 *      context? Some Windows + integrated-GPU configs return `null` and
 *      crash on subsequent allocations.
 *
 * The page-wide context budget is NOT part of this policy. It is enforced
 * at mount time by `WebGlMount` via an atomic slot reservation, so the
 * policy stays a pure function of "is WebGL usable here at all?".
 *
 * `prefers-reduced-motion` is exposed for callers that want to opt their
 * own animation out — the policy does not silently deny on it because
 * that would change the design contract without the designer's input.
 */

export type WebGlPolicyDecision =
  | { allowed: true; reducedMotion: boolean }
  | { allowed: false; reason: WebGlPolicyDenialReason; reducedMotion: boolean };

export type WebGlPolicyDenialReason = 'kill-switch' | 'no-webgl-support';

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

export function isHeavyVisualsKillSwitchEnabled(): boolean {
  return readBooleanEnv(process.env.NEXT_PUBLIC_DISABLE_HEAVY_VISUALS);
}

let cachedSupportProbe: boolean | null = null;

/**
 * Probe whether the current browser can create a WebGL context at all.
 * Cached because creating a probe canvas costs a context slot on some
 * drivers — we run it exactly once per page load.
 */
export function detectWebGlSupport(): boolean {
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

export function detectPrefersReducedMotion(): boolean {
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
