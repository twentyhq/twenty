import { isDefined } from 'twenty-shared/utils';

import { HALFTONE_MATERIAL_CONSTANTS } from '../engine/material-constants';
import type { HalftoneMaterialTexture } from '../engine/material-texture';
import { resolveMaterialTextureSources } from '../engine/resolve-material-texture-sources';

import type { HalftoneMaterialExportImages } from './exporter-types';
import { TRANSMISSION_MATERIAL_RUNTIME_SOURCE } from './transmission-material-runtime-source';
import { DREI_LICENSE_NOTICE } from '@/platform/visuals/three-runtime/drei-license-notice';

const MATERIAL_RUNTIME_SOURCE = String.raw`
const GLASS_THICKNESS_TO_WORLD_UNITS = ${HALFTONE_MATERIAL_CONSTANTS.glassThicknessToWorldUnits};
const GLASS_BACKSIDE_ENVIRONMENT_INTENSITY = ${HALFTONE_MATERIAL_CONSTANTS.glassBacksideEnvironmentIntensity};
const GLASS_TRANSMISSION_BACKGROUND_SCALE = ${HALFTONE_MATERIAL_CONSTANTS.glassTransmissionBackgroundScale};
const GLASS_RIM_INTENSITY = ${HALFTONE_MATERIAL_CONSTANTS.glassRimIntensity};
const GLASS_RIM_POWER = ${HALFTONE_MATERIAL_CONSTANTS.glassRimPower};
const MAX_TEXTURE_ANISOTROPY = 8;

function setTextureSampling({ renderer, texture }) {
  texture.generateMipmaps = true;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.anisotropy = Math.min(
    renderer.capabilities.getMaxAnisotropy(),
    MAX_TEXTURE_ANISOTROPY,
  );
}

function createGlassTransmissionScene(environmentTexture) {
  const transmissionScene = new THREE.Scene();
  transmissionScene.background = environmentTexture;

  return transmissionScene;
}

function loadTexture({ colorSpace, renderer, url }) {
  const loader = new THREE.TextureLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (texture) => {
        texture.colorSpace = colorSpace;
        setTextureSampling({ renderer, texture });
        resolve(texture);
      },
      undefined,
      reject,
    );
  });
}

async function loadEnvironmentTexture(renderer) {
  const equirectangularTexture = await loadTexture({
    colorSpace: THREE.SRGBColorSpace,
    renderer,
    url: ENVIRONMENT_DATA_URL,
  });
  equirectangularTexture.mapping = THREE.EquirectangularReflectionMapping;
  equirectangularTexture.wrapS = THREE.RepeatWrapping;
  equirectangularTexture.wrapT = THREE.ClampToEdgeWrapping;

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const environmentTexture = pmremGenerator.fromEquirectangular(
    equirectangularTexture,
  ).texture;
  pmremGenerator.dispose();
  equirectangularTexture.dispose();

  return environmentTexture;
}

async function loadImageTexture({ renderer, url }) {
  const texture = await loadTexture({
    colorSpace: THREE.NoColorSpace,
    renderer,
    url,
  });
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  return texture;
}

async function createHalftoneMaterialAssets(renderer) {
  const [environmentTexture, [roughnessTexture, bumpTexture]] =
    await Promise.all([
      loadEnvironmentTexture(renderer),
      loadMaterialImageTextures(renderer),
    ]);

  return {
    bumpTexture,
    environmentTexture,
    glassTransmissionScene: createGlassTransmissionScene(environmentTexture),
    roughnessTexture,
  };
}

function applyHalftoneMaterialSettings(material, materialSettings, materialAssets) {
  const isGlass = materialSettings.surface === 'glass';
  const { bumpTexture, roughnessTexture } = materialAssets;

  roughnessTexture?.repeat.set(
    materialSettings.textureTiling,
    materialSettings.textureTiling,
  );
  bumpTexture?.repeat.set(
    materialSettings.textureTiling,
    materialSettings.textureTiling,
  );

  material.color.set(materialSettings.color);
  material.roughness = materialSettings.roughness;
  material.metalness = materialSettings.metalness;
  material.envMap = materialAssets.environmentTexture;
  material.envMapIntensity = materialSettings.environmentPower;
  material.envMapRotation.set(
    0,
    THREE.MathUtils.degToRad(materialSettings.environmentRotation),
    0,
  );
  materialAssets.glassTransmissionScene.backgroundIntensity =
    materialSettings.environmentPower * GLASS_TRANSMISSION_BACKGROUND_SCALE;
  materialAssets.glassTransmissionScene.backgroundRotation.copy(
    material.envMapRotation,
  );
  material.clearcoat = isGlass ? 1 : 0;
  material.clearcoatRoughness = isGlass
    ? Math.max(materialSettings.roughness * 0.25, 0.01)
    : 0.08;
  material.reflectivity = isGlass ? 0.98 : 0.5;
  material.transmission = 0;
  material._transmission = isGlass ? 1 : 0;
  material.refractionEnvMap = null;
  material.useEnvMapRefraction = 0;
  material.thickness = isGlass
    ? materialSettings.thickness * GLASS_THICKNESS_TO_WORLD_UNITS
    : 0;
  material.ior = isGlass ? materialSettings.refraction : 1.5;
  material.buffer = null;
  material.roughnessMap = roughnessTexture;
  material.bumpMap = bumpTexture;
  material.bumpScale = BUMP_SCALE;
  material.side = THREE.FrontSide;
  material.attenuationColor.set('white');
  material.attenuationDistance = Infinity;
  material.anisotropicBlur = isGlass
    ? THREE.MathUtils.lerp(0.03, 0.12, materialSettings.roughness)
    : 0.1;
  material.chromaticAberration = isGlass ? 0.6 : 0.05;
  material.distortion = 0;
  material.distortionScale = 0.5;
  material.temporalDistortion = 0;
  material.rimIntensity = isGlass ? GLASS_RIM_INTENSITY : 0;
  material.rimPower = GLASS_RIM_POWER;
  material.userData.halftoneIsGlass = isGlass;

  material.needsUpdate = true;
}

function renderHalftoneMaterialScene({
  camera,
  material,
  outputTarget,
  renderer,
  scene,
  transmissionScene,
  transmissionBacksideTarget,
  transmissionTarget,
}) {
  if (material.userData.halftoneIsGlass) {
    const thickness = material.thickness;
    const envMapIntensity = material.envMapIntensity;
    const rimIntensity = material.rimIntensity;

    renderer.setRenderTarget(transmissionBacksideTarget);
    renderer.clear();
    renderer.render(transmissionScene, camera);

    material.buffer = transmissionBacksideTarget.texture;
    material.thickness = 0;
    material.rimIntensity = 0;
    material.side = THREE.BackSide;
    material.needsUpdate = true;
    material.envMapIntensity = GLASS_BACKSIDE_ENVIRONMENT_INTENSITY;
    renderer.setRenderTarget(transmissionTarget);
    renderer.clear();
    renderer.render(transmissionScene, camera);
    renderer.autoClearColor = false;
    renderer.render(scene, camera);
    renderer.autoClearColor = true;

    material.buffer = transmissionTarget.texture;
    material.thickness = thickness;
    material.rimIntensity = rimIntensity;
    material.side = THREE.FrontSide;
    material.needsUpdate = true;
    material.envMapIntensity = envMapIntensity;
  }

  renderer.setRenderTarget(outputTarget);
  renderer.clear();
  renderer.render(scene, camera);
}

function disposeHalftoneMaterialAssets(materialAssets) {
  materialAssets.environmentTexture.dispose();
  materialAssets.roughnessTexture?.dispose();
  materialAssets.bumpTexture?.dispose();
}
`;

function createImageTextureLoadSource(url: string | null) {
  return isDefined(url)
    ? `loadImageTexture({ renderer, url: ${JSON.stringify(url)} })`
    : 'null';
}

export function createMaterialRuntimeSource({
  materialImages,
  texture,
}: {
  materialImages: HalftoneMaterialExportImages;
  texture: HalftoneMaterialTexture;
}) {
  const textureSources = resolveMaterialTextureSources({
    sources: materialImages.textures,
    texture,
  });

  return `
/*!
${DREI_LICENSE_NOTICE}
*/
const ENVIRONMENT_DATA_URL = ${JSON.stringify(materialImages.environment)};
const BUMP_SCALE = ${textureSources.bumpScale};

function loadMaterialImageTextures(renderer) {
  return Promise.all([
    ${createImageTextureLoadSource(textureSources.roughness)},
    ${createImageTextureLoadSource(textureSources.bump)},
  ]);
}
${TRANSMISSION_MATERIAL_RUNTIME_SOURCE}
${MATERIAL_RUNTIME_SOURCE}`;
}
