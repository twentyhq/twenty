import * as THREE from 'three';

export type SiteWebGlRendererParameters = THREE.WebGLRendererParameters;

// Single construction site for all Twenty website WebGL canvases.
// Keeps renderer policy (limits, logging, pooling) in one module.
// Context count is still bounded by the browser; pair with viewport gating
// (`WebGlWhenInViewport` via `IllustrationMount`) and avoid extra canvases.

export function createSiteWebGlRenderer(
  parameters?: SiteWebGlRendererParameters,
): THREE.WebGLRenderer {
  return new THREE.WebGLRenderer(parameters);
}
