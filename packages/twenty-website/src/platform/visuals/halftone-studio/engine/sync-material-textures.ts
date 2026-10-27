import {
  HALFTONE_MATERIALS,
  type HalftoneMaterialAssets,
  type HalftoneTransmissionMaterial,
} from './materials';
import type { HalftoneStudioSettings } from './studio-settings-types';

type MaterialTextureResources = {
  material: HalftoneTransmissionMaterial;
  materialAssets: HalftoneMaterialAssets;
};

export function syncMaterialTextures<
  TResources extends MaterialTextureResources,
>({
  resources,
  resourcesReference,
  settingsReference,
}: {
  resources: TResources;
  resourcesReference: { current: TResources | null };
  settingsReference: { current: HalftoneStudioSettings };
}) {
  void HALFTONE_MATERIALS.loadTextures({
    assets: resources.materialAssets,
    texture: settingsReference.current.material.texture,
  })
    .then((didLoadTextures) => {
      if (didLoadTextures && resourcesReference.current === resources) {
        HALFTONE_MATERIALS.applySettings(
          resources.material,
          settingsReference.current.material,
          resources.materialAssets,
        );
      }
    })
    .catch((error) => {
      console.error(error);
    });
}
