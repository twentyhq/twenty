// Light zone only: nothing exported here may value-import three. The heavy
// zones (three-runtime/, halftone/) are reached exclusively through the
// rigs' dynamic imports.
export {
  createBoundedFailureCache,
  type BoundedFailureCache,
} from './engine/bounded-failure-cache';
export {
  createVisualFrameLoop,
  type VisualFrame,
  type VisualFrameLoop,
} from './engine/create-visual-frame-loop';
export {
  createWebGlContextBudget,
  type WebGlContextBudget,
} from './engine/create-webgl-context-budget';
export { loadVisualImage } from './engine/load-visual-image';
export {
  observeElementVisibility,
  type ObserveElementVisibilityOptions,
} from './engine/observe-element-visibility';
export { useAsyncImage } from './engine/use-async-image';
export { useAsyncResource } from './engine/use-async-resource';
export { useVisualRuntime } from './engine/use-visual-runtime';
export { useWebGlGate, type WebGlGate } from './engine/use-webgl-gate';
export { VisualErrorBoundary } from './engine/VisualErrorBoundary';
export { VisualMount, type VisualMountProps } from './engine/VisualMount';
export {
  VisualRuntimeContext,
  type VisualRuntimeValue,
} from './engine/visual-runtime-context';
export { webGlContextBudget } from './engine/webgl-context-budget';
export { WEBGL_CONTEXT_LOST_EVENT } from './engine/webgl-context-lost-event';
export { isWebGlSupported } from './engine/webgl-policy';
export { HalftoneModel, type HalftoneModelProps } from './rigs/HalftoneModel';
