import {
  Camera,
  Mesh,
  type OGLRenderingContext,
  Renderer,
  RenderTarget,
  Transform,
} from 'ogl';

import { WEBGL_CONTEXT_LOST_EVENT } from '../engine/webgl-context-lost-event';

// ogl types its context as `WebGL2RenderingContext | WebGLRenderingContext`,
// so WebGL2-only enums are not reachable through it. They are read off the
// WebGL2RenderingContext constructor instead, which is typed and needs no
// narrowing — these renderers are always created with `webgl: 2`.
export type VisualRenderingContext = OGLRenderingContext;

export type VisualRenderer = {
  gl: VisualRenderingContext;
  canvas: HTMLCanvasElement;
  setSize: (width: number, height: number) => void;
  render: (options: {
    scene: Mesh | Transform;
    camera?: Camera;
    target?: RenderTarget | null;
    clear?: boolean;
  }) => void;
  dispose: () => void;
};

type CreateVisualRendererOptions = {
  alpha?: boolean;
  antialias?: boolean;
  depth?: boolean;
};

// The only place a WebGL context is created. Returns null instead of
// throwing (creation fails on exhausted GPUs); dispose is idempotent and
// survives an already-torn-down context; context loss dispatches the
// bubbling event VisualMount remounts on.
export function createVisualRenderer({
  alpha = true,
  antialias = false,
  depth = true,
}: CreateVisualRendererOptions = {}): VisualRenderer | null {
  let renderer: Renderer;
  try {
    renderer = new Renderer({ alpha, antialias, depth, dpr: 1, webgl: 2 });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('WebGL renderer creation failed:', error);
    }
    return null;
  }

  const gl = renderer.gl;
  if (!gl || !renderer.isWebgl2) {
    return null;
  }

  const canvas = gl.canvas;
  gl.clearColor(0, 0, 0, 0);

  let disposed = false;

  const safeDispose = () => {
    if (disposed) {
      return;
    }
    disposed = true;
    canvas.removeEventListener('webglcontextlost', handleContextLost);
    try {
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      // Losing an already-torn-down context throws; that is a no-op for us
      // and must not reach the consumer.
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

  return {
    gl,
    canvas,
    // ogl's own setSize writes px into canvas.style, which fights the 100%
    // sizing every session applies. Drive the drawing buffer directly.
    setSize: (width, height) => {
      renderer.width = width;
      renderer.height = height;
      canvas.width = width;
      canvas.height = height;
    },
    render: ({ scene, camera, target = null, clear }) => {
      if (disposed) {
        return;
      }
      renderer.render({
        scene,
        camera,
        target: target ?? undefined,
        clear,
        frustumCull: false,
        sort: false,
      });
    },
    dispose: safeDispose,
  };
}
