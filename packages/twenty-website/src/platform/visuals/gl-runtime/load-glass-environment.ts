import { Texture } from 'ogl';

import { type VisualRenderingContext } from './create-visual-renderer';

const GLASS_ENVIRONMENT_URL = '/images/halftone/environment.jpg';
const GLASS_ENVIRONMENT_ZOOM = 1.55;
const MAX_TEXTURE_ANISOTROPY = 8;

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', () =>
      reject(new Error(`Image failed to load: ${url}`)),
    );
    image.src = url;
  });
}

function cropToZoom(image: HTMLImageElement, zoom: number) {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  if (zoom <= 1 || !width || !height) {
    return image;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    return image;
  }

  const cropWidth = width / zoom;
  const cropHeight = height / zoom;
  context.drawImage(
    image,
    (width - cropWidth) / 2,
    (height - cropHeight) / 2,
    cropWidth,
    cropHeight,
    0,
    0,
    width,
    height,
  );
  return canvas;
}

// The through-glass backdrop the refraction lookup samples, and the same
// texture stands in for the PMREM the glass material used as its envMap.
// PMREM prefilters with a GGX lobe per level; a box-filtered mip chain is
// the closest thing available without shipping a second baked asset, and
// glass here runs at roughness 0.26 where the two barely diverge.
export async function loadGlassEnvironment(gl: VisualRenderingContext) {
  const image = await loadImage(GLASS_ENVIRONMENT_URL);
  const cropped = cropToZoom(image, GLASS_ENVIRONMENT_ZOOM);

  const texture = new Texture(gl, {
    image: cropped,
    format: gl.RGBA,
    internalFormat: WebGL2RenderingContext.SRGB8_ALPHA8,
    type: gl.UNSIGNED_BYTE,
    wrapS: gl.CLAMP_TO_EDGE,
    wrapT: gl.CLAMP_TO_EDGE,
    minFilter: gl.LINEAR_MIPMAP_LINEAR,
    magFilter: gl.LINEAR,
    generateMipmaps: true,
    anisotropy: MAX_TEXTURE_ANISOTROPY,
    flipY: false,
  });

  texture.update();

  const mipCount =
    Math.floor(Math.log2(Math.max(texture.width ?? 1, texture.height ?? 1))) +
    1;

  return { texture, mipCount };
}
