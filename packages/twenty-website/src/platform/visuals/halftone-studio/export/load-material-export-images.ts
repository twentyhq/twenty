import { getMaterialTextureImages } from '../engine/get-material-texture-images';
import { HALFTONE_MATERIAL_IMAGE_URLS } from '../engine/material-image-urls';
import type { HalftoneStudioSettings } from '../engine/studio-settings-types';

import { blobToDataUrl } from './blob-to-data-url';
import type { HalftoneMaterialExportImages } from './exporter-types';

async function fetchImageDataUrl(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Unable to load ${url}.`);
  }

  return await blobToDataUrl({ blob: await response.blob(), label: url });
}

export async function loadMaterialExportImages(
  settings: Pick<HalftoneStudioSettings, 'material' | 'sourceMode'>,
): Promise<HalftoneMaterialExportImages | undefined> {
  if (settings.sourceMode === 'image') {
    return undefined;
  }

  const [environment, textureEntries] = await Promise.all([
    fetchImageDataUrl(HALFTONE_MATERIAL_IMAGE_URLS.environment),
    Promise.all(
      getMaterialTextureImages(settings.material.texture).map(
        async (image) =>
          [
            image,
            await fetchImageDataUrl(
              HALFTONE_MATERIAL_IMAGE_URLS.textures[image],
            ),
          ] as const,
      ),
    ),
  ]);

  return { environment, textures: Object.fromEntries(textureEntries) };
}
