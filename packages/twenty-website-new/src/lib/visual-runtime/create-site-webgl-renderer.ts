import * as THREE from 'three';

export type SiteWebGlRendererParameters = THREE.WebGLRendererParameters & {
  /**
   * Fired when the renderer's WebGL context is lost (browser eviction,
   * GPU reset, tab backgrounded for a long time, etc.). The default
   * behavior is `event.preventDefault()` (so the browser is allowed to
   * restore the context later) plus `renderer.dispose()`. Components
   * that own additional GPU resources should pass a callback here to
   * dispose them and stop their rAF loop.
   */
  onContextLost?: (event: WebGLContextEvent) => void;
};

/**
 * Single construction site for every WebGL canvas on the marketing site.
 *
 * This is now a pure renderer factory — no policy checks, no budget
 * accounting. Both responsibilities live one layer up in `WebGlMount`,
 * which reserves a budget slot atomically when it decides to render
 * children. That removes the race condition that used to throw
 * `WebGlUnavailableError` from `await` paths (where it surfaced as an
 * uncaught promise rejection that React's error boundary couldn't catch).
 *
 * What this *does* still own:
 *   - `webglcontextlost` wiring with `preventDefault()` so the browser
 *     can restore the context and so the GLB+texture+shader graph isn't
 *     orphaned on the GPU.
 *   - A dispose override that swallows "delete: object does not belong
 *     to this context" errors that fire when consumer cleanup runs after
 *     the browser has already torn the context down.
 */
export function createSiteWebGlRenderer(
  parameters?: SiteWebGlRendererParameters,
): THREE.WebGLRenderer {
  const { onContextLost, ...rendererParameters } = parameters ?? {};

  const renderer = new THREE.WebGLRenderer(rendererParameters);
  const canvas = renderer.domElement;

  let disposed = false;
  const safeDispose = () => {
    if (disposed) {
      return;
    }
    disposed = true;
    canvas.removeEventListener('webglcontextlost', handleContextLost);
    try {
      originalDispose();
    } catch {
      // Disposing a renderer whose context was already torn down can
      // throw "delete: object does not belong to this context" — that's
      // a no-op for us and must not bubble up to the consumer.
    }
  };

  const handleContextLost = (event: Event) => {
    const webglEvent = event as WebGLContextEvent;
    if (typeof webglEvent.preventDefault === 'function') {
      webglEvent.preventDefault();
    }

    try {
      onContextLost?.(webglEvent);
    } catch (callbackError) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('onContextLost callback threw:', callbackError);
      }
    }

    safeDispose();
  };

  canvas.addEventListener('webglcontextlost', handleContextLost, false);

  const originalDispose = renderer.dispose.bind(renderer);
  renderer.dispose = safeDispose;

  return renderer;
}
