import * as THREE from 'three';

type SiteWebGlRendererParameters = THREE.WebGLRendererParameters & {
  onContextLost?: (event: WebGLContextEvent) => void;
};

export const SITE_WEBGL_CONTEXT_LOST_EVENT = 'sitewebglcontextlost';

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

    canvas.dispatchEvent(
      new CustomEvent(SITE_WEBGL_CONTEXT_LOST_EVENT, { bubbles: true }),
    );

    safeDispose();
  };

  canvas.addEventListener('webglcontextlost', handleContextLost, false);

  const originalDispose = renderer.dispose.bind(renderer);
  renderer.dispose = safeDispose;

  return renderer;
}

type SiteWebGlRendererCreationFailureHandler = (error: unknown) => void;

const reportSiteWebGlRendererCreationFailure: SiteWebGlRendererCreationFailureHandler =
  (error) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('WebGL renderer creation failed:', error);
    }
  };

export function tryCreateSiteWebGlRenderer(
  parameters?: SiteWebGlRendererParameters,
  onError: SiteWebGlRendererCreationFailureHandler = reportSiteWebGlRendererCreationFailure,
): THREE.WebGLRenderer | null {
  try {
    return createSiteWebGlRenderer(parameters);
  } catch (error) {
    onError(error);
    return null;
  }
}
