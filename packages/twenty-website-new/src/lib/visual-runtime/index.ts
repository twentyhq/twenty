export {
  evaluateWebGlPolicy,
  detectWebGlSupport,
  detectPrefersReducedMotion,
  isHeavyVisualsKillSwitchEnabled,
  WebGlUnavailableError,
  type WebGlPolicyDecision,
  type WebGlPolicyDenialReason,
} from './visual-runtime-policy';

export {
  getActiveWebGlContextCount,
  getMaxActiveWebGlContexts,
  subscribeToActiveWebGlContextCount,
  tryReserveWebGlContextSlot,
} from './active-webgl-context-budget';

export { useWebGlPolicy } from './use-webgl-policy';
export { WebGlErrorBoundary } from './webgl-error-boundary';
export { WebGlMount } from './webgl-mount';
export {
  createSiteWebGlRenderer,
  type SiteWebGlRendererParameters,
} from './create-site-webgl-renderer';

export { createFrameTimer, type FrameTimer } from './frame-timer';

export {
  createBoundedFailureCache,
  type BoundedFailureCache,
} from './bounded-failure-cache';

export { DRACO_DECODER_PATH, DRACO_DECODER_ORIGIN } from './draco-decoder-path';
