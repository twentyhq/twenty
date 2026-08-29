import { Texture } from 'ogl';

import { type VisualRenderingContext } from './create-visual-renderer';

const ENVIRONMENT_URL = '/images/halftone/room-environment.bin';
const ENVIRONMENT_MAGIC = 0x4e45_5754; // 'TWEN' little-endian

type EnvironmentMip = {
  width: number;
  height: number;
  data: Uint16Array;
};

let environmentPromise: Promise<EnvironmentMip[]> | null = null;

function decodeEnvironment(buffer: ArrayBuffer): EnvironmentMip[] {
  const header = new DataView(buffer);
  if (header.getUint32(0, true) !== ENVIRONMENT_MAGIC) {
    throw new Error('Not a room-environment buffer');
  }

  const mipCount = header.getUint32(4, true);
  const mips: EnvironmentMip[] = [];
  let offset = 8;

  for (let level = 0; level < mipCount; level += 1) {
    const width = header.getUint32(offset, true);
    const height = header.getUint32(offset + 4, true);
    offset += 8;
    const byteLength = width * height * 4 * 2;
    mips.push({
      width,
      height,
      data: new Uint16Array(buffer.slice(offset, offset + byteLength)),
    });
    offset += byteLength;
  }

  return mips;
}

function fetchEnvironment() {
  if (environmentPromise === null) {
    environmentPromise = fetch(ENVIRONMENT_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Environment request failed (${response.status})`);
        }
        return response.arrayBuffer();
      })
      .then(decodeEnvironment)
      .catch((error: unknown) => {
        environmentPromise = null;
        throw error;
      });
  }
  return environmentPromise;
}

// The prefiltered room radiance three used to rebuild with PMREMGenerator on
// every mount. ogl's Texture uploads a single level, so the mip chain the
// roughness lookup depends on is pushed by hand.
export async function loadEnvironmentTexture(gl: VisualRenderingContext) {
  const mips = await fetchEnvironment();
  const base = mips[0];

  const texture = new Texture(gl, {
    image: base.data,
    width: base.width,
    height: base.height,
    format: gl.RGBA,
    internalFormat: WebGL2RenderingContext.RGBA16F,
    type: WebGL2RenderingContext.HALF_FLOAT,
    minFilter: gl.LINEAR_MIPMAP_LINEAR,
    magFilter: gl.LINEAR,
    wrapS: gl.REPEAT,
    wrapT: gl.CLAMP_TO_EDGE,
    generateMipmaps: false,
    flipY: false,
  });

  texture.update();
  texture.bind();
  for (let level = 1; level < mips.length; level += 1) {
    const mip = mips[level];
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      WebGL2RenderingContext.RGBA16F,
      mip.width,
      mip.height,
      0,
      gl.RGBA,
      WebGL2RenderingContext.HALF_FLOAT,
      mip.data,
    );
  }
  gl.texParameteri(
    gl.TEXTURE_2D,
    WebGL2RenderingContext.TEXTURE_MAX_LEVEL,
    mips.length - 1,
  );

  return { texture, mipCount: mips.length };
}
