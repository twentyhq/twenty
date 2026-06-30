import * as THREE from 'three';

import { WEBGL_CONTEXT_LOST_EVENT } from '../engine/webgl-context-lost-event';

type VisualRendererParameters = THREE.WebGLRendererParameters;

// The only place a WebGL context is created. Returns null instead of
// throwing (creation fails on exhausted GPUs); dispose is idempotent and
// survives an already-torn-down context; context loss dispatches the
// bubbling event VisualMount remounts on.
export function createVisualRenderer(
  parameters?: VisualRendererParameters,
): THREE.WebGLRenderer | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer(parameters);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('WebGL renderer creation failed:', error);
    }
    return null;
  }

  const canvas = renderer.domElement;
  const originalDispose = renderer.dispose.bind(renderer);

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
      // Disposing a renderer whose context the GPU already tore down can
      // throw; that is a no-op for us and must not reach the consumer.
    }
  };

  const handleContextLost = (event: Event) => {
    if (typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    canvas.dispatchEvent(
      new CustomEvent(WEBGL_CONTEXT_LOST_EVENT, { bubbles: true }),
    );
    safeDispose();
  };

  canvas.addEventListener('webglcontextlost', handleContextLost, false);
  renderer.dispose = safeDispose;

  return renderer;
}
