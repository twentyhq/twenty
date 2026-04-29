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
export { loadVisualImage } from './load-visual-image';
export {
  createVisualMountScheduler,
  scheduleVisualMount,
  visualMountScheduler,
  type ScheduleVisualMountOptions,
  type VisualMountPriority,
  type VisualMountScheduler,
} from './visual-mount-scheduler';
export {
  createSiteWebGlRenderer,
  reportSiteWebGlRendererCreationFailure,
  SITE_WEBGL_CONTEXT_LOST_EVENT,
  tryCreateSiteWebGlRenderer,
  type SiteWebGlRendererCreationFailureHandler,
  type SiteWebGlRendererParameters,
} from './create-site-webgl-renderer';

export {
  createVisualRenderLoop,
  reportVisualRenderLoopErrorInDevelopment,
  type CreateVisualRenderLoopOptions,
  type VisualRenderLoop,
  type VisualRenderLoopCanceller,
  type VisualRenderLoopDocument,
  type VisualRenderLoopErrorHandler,
  type VisualRenderLoopFrame,
  type VisualRenderLoopFrameRenderer,
  type VisualRenderLoopScheduler,
} from './visual-render-loop';

export {
  createBoundedFailureCache,
  type BoundedFailureCache,
} from './bounded-failure-cache';

export { DRACO_DECODER_PATH, DRACO_DECODER_ORIGIN } from './draco-decoder-path';
