import { Mesh, Program, Triangle } from 'ogl';

import { type VisualRenderingContext } from './create-visual-renderer';

type FullscreenPassUniforms = Record<string, { value: unknown }>;

// Generic over the uniform record so callers keep the value types they wrote
// (a Vec2 stays a Vec2), instead of reading them back out of an unknown and
// asserting at every mutation site.
type CreateFullscreenPassOptions<TUniforms extends FullscreenPassUniforms> = {
  gl: VisualRenderingContext;
  fragment: string;
  vertex: string;
  uniforms: TUniforms;
  transparent?: boolean;
};

export type FullscreenPass<
  TUniforms extends FullscreenPassUniforms = FullscreenPassUniforms,
> = {
  mesh: Mesh;
  uniforms: TUniforms;
  dispose: () => void;
};

// A single oversized triangle carrying one fragment program. Replaces the
// three Scene + OrthographicCamera + PlaneGeometry(2,2) + Mesh quartet that
// every halftone pass used to allocate.
export function createFullscreenPass<TUniforms extends FullscreenPassUniforms>({
  gl,
  fragment,
  vertex,
  uniforms,
  transparent = false,
}: CreateFullscreenPassOptions<TUniforms>): FullscreenPass<TUniforms> {
  const geometry = new Triangle(gl);
  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms,
    transparent,
    depthTest: false,
    depthWrite: false,
    cullFace: null,
  });

  return {
    mesh: new Mesh(gl, { geometry, program }),
    uniforms,
    dispose: () => {
      program.remove();
      geometry.remove();
    },
  };
}
