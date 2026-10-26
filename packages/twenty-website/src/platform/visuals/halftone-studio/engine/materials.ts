import { isDefined } from 'twenty-shared/utils';

import { getMaterialTextureImages } from './get-material-texture-images';
import { HALFTONE_MATERIAL_CONSTANTS } from './material-constants';
import { HALFTONE_MATERIAL_IMAGE_URLS } from './material-image-urls';
import type { HalftoneMaterialTexture } from './material-texture';
import type { HalftoneMaterialTextureImage } from './material-texture-image';
import { resolveMaterialTextureSources } from './resolve-material-texture-sources';
import type { HalftoneMaterialSettings } from './studio-settings-types';
import * as THREE from 'three';

export type HalftoneMaterialAssets = {
  environmentTexture: THREE.Texture;
  glassTransmissionScene: THREE.Scene;
  imageTextureLoads: Partial<
    Record<HalftoneMaterialTextureImage, Promise<THREE.Texture>>
  >;
  imageTextures: Partial<Record<HalftoneMaterialTextureImage, THREE.Texture>>;
  renderer: THREE.WebGLRenderer;
};

// Adapted from MeshTransmissionMaterial in @react-three/drei (MIT): see DREI_LICENSE_NOTICE.
class TransmissionMaterial extends THREE.MeshPhysicalMaterial {
  declare anisotropicBlur: number;
  declare attenuationColor: THREE.Color;
  declare attenuationDistance: number;
  declare buffer: THREE.Texture | null;
  declare chromaticAberration: number;
  declare distortion: number;
  declare distortionScale: number;
  declare refractionEnvMap: THREE.Texture | null;
  declare rimIntensity: number;
  declare rimPower: number;
  declare temporalDistortion: number;
  declare thickness: number;
  declare time: number;
  declare _transmission: number;
  declare useEnvMapRefraction: number;

  private readonly halftoneUniforms: Record<string, { value: unknown }>;

  public constructor(samples = 10) {
    super();

    this.halftoneUniforms = {
      chromaticAberration: { value: 0.05 },
      transmission: { value: 0 },
      _transmission: { value: 1 },
      transmissionMap: { value: null },
      refractionEnvMap: { value: null },
      useEnvMapRefraction: { value: 0 },
      roughness: { value: 0 },
      thickness: { value: 0 },
      thicknessMap: { value: null },
      attenuationDistance: { value: Infinity },
      attenuationColor: { value: new THREE.Color('white') },
      anisotropicBlur: { value: 0.1 },
      time: { value: 0 },
      distortion: { value: 0 },
      distortionScale: { value: 0.5 },
      temporalDistortion: { value: 0 },
      buffer: { value: null },
      rimIntensity: { value: 0 },
      rimPower: { value: 1 },
    };

    this.customProgramCacheKey = () => `halftone-transmission-${samples}`;

    this.onBeforeCompile = (shader) => {
      shader.uniforms = {
        ...shader.uniforms,
        ...this.halftoneUniforms,
      };
      shader.defines ??= {};

      if (this.anisotropy > 0) {
        shader.defines.USE_ANISOTROPY = '';
      }

      shader.defines.USE_TRANSMISSION = '';

      shader.fragmentShader =
        `
        uniform float chromaticAberration;
        uniform float anisotropicBlur;
        uniform float time;
        uniform float distortion;
        uniform float distortionScale;
        uniform float temporalDistortion;
        uniform sampler2D buffer;
        uniform float rimIntensity;
        uniform float rimPower;

        vec3 random3(vec3 c) {
          float j = 4096.0 * sin(dot(c, vec3(17.0, 59.4, 15.0)));
          vec3 r;
          r.z = fract(512.0 * j);
          j *= 0.125;
          r.x = fract(512.0 * j);
          j *= 0.125;
          r.y = fract(512.0 * j);
          return r - 0.5;
        }

        uint hash(uint x) {
          x += (x << 10u);
          x ^= (x >> 6u);
          x += (x << 3u);
          x ^= (x >> 11u);
          x += (x << 15u);
          return x;
        }

        uint hash(uvec2 v) { return hash(v.x ^ hash(v.y)); }
        uint hash(uvec3 v) { return hash(v.x ^ hash(v.y) ^ hash(v.z)); }
        uint hash(uvec4 v) {
          return hash(v.x ^ hash(v.y) ^ hash(v.z) ^ hash(v.w));
        }

        float floatConstruct(uint m) {
          const uint ieeeMantissa = 0x007FFFFFu;
          const uint ieeeOne = 0x3F800000u;
          m &= ieeeMantissa;
          m |= ieeeOne;
          float f = uintBitsToFloat(m);
          return f - 1.0;
        }

        float randomBase(float x) {
          return floatConstruct(hash(floatBitsToUint(x)));
        }
        float randomBase(vec2 v) {
          return floatConstruct(hash(floatBitsToUint(v)));
        }
        float randomBase(vec3 v) {
          return floatConstruct(hash(floatBitsToUint(v)));
        }
        float randomBase(vec4 v) {
          return floatConstruct(hash(floatBitsToUint(v)));
        }

        float rand(float seed) {
          return randomBase(vec3(gl_FragCoord.xy, seed));
        }

        const float F3 = 0.3333333;
        const float G3 = 0.1666667;

        float snoise(vec3 p) {
          vec3 s = floor(p + dot(p, vec3(F3)));
          vec3 x = p - s + dot(s, vec3(G3));
          vec3 e = step(vec3(0.0), x - x.yzx);
          vec3 i1 = e * (1.0 - e.zxy);
          vec3 i2 = 1.0 - e.zxy * (1.0 - e);
          vec3 x1 = x - i1 + G3;
          vec3 x2 = x - i2 + 2.0 * G3;
          vec3 x3 = x - 1.0 + 3.0 * G3;
          vec4 w;
          vec4 d;
          w.x = dot(x, x);
          w.y = dot(x1, x1);
          w.z = dot(x2, x2);
          w.w = dot(x3, x3);
          w = max(0.6 - w, 0.0);
          d.x = dot(random3(s), x);
          d.y = dot(random3(s + i1), x1);
          d.z = dot(random3(s + i2), x2);
          d.w = dot(random3(s + 1.0), x3);
          w *= w;
          w *= w;
          d *= w;
          return dot(d, vec4(52.0));
        }

        float snoiseFractal(vec3 m) {
          return 0.5333333 * snoise(m)
            + 0.2666667 * snoise(2.0 * m)
            + 0.1333333 * snoise(4.0 * m)
            + 0.0666667 * snoise(8.0 * m);
        }
      ` + shader.fragmentShader;

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <transmission_pars_fragment>',
        `
          #ifdef USE_TRANSMISSION
            uniform float _transmission;
            uniform float thickness;
            uniform float attenuationDistance;
            uniform vec3 attenuationColor;
            uniform sampler2D refractionEnvMap;
            uniform float useEnvMapRefraction;
            #ifdef USE_TRANSMISSIONMAP
              uniform sampler2D transmissionMap;
            #endif
            #ifdef USE_THICKNESSMAP
              uniform sampler2D thicknessMap;
            #endif
            uniform vec2 transmissionSamplerSize;
            uniform sampler2D transmissionSamplerMap;
            uniform mat4 modelMatrix;
            uniform mat4 projectionMatrix;
            varying vec3 vWorldPosition;

            vec3 getVolumeTransmissionRay(
              const in vec3 n,
              const in vec3 v,
              const in float thicknessValue,
              const in float ior,
              const in mat4 modelMatrix
            ) {
              vec3 refractionVector = refract(-v, normalize(n), 1.0 / ior);
              vec3 modelScale;
              modelScale.x = length(vec3(modelMatrix[0].xyz));
              modelScale.y = length(vec3(modelMatrix[1].xyz));
              modelScale.z = length(vec3(modelMatrix[2].xyz));
              return normalize(refractionVector) * thicknessValue * modelScale;
            }

            float applyIorToRoughness(
              const in float roughnessValue,
              const in float ior
            ) {
              return roughnessValue * clamp(ior * 2.0 - 2.0, 0.0, 1.0);
            }

            vec2 directionToEquirectUv(const in vec3 direction) {
              vec3 dir = normalize(direction);
              vec2 uv = vec2(
                atan(dir.z, dir.x) * 0.15915494309189535 + 0.5,
                asin(clamp(dir.y, -1.0, 1.0)) * 0.3183098861837907 + 0.5
              );

              return vec2(fract(uv.x), 1.0 - clamp(uv.y, 0.0, 1.0));
            }

            vec4 getTransmissionSample(
              const in vec2 fragCoord,
              const in vec3 transmissionDirection,
              const in float roughnessValue,
              const in float ior
            ) {
              if (useEnvMapRefraction > 0.5) {
                return texture2D(
                  refractionEnvMap,
                  directionToEquirectUv(transmissionDirection)
                );
              }

              float framebufferLod =
                log2(transmissionSamplerSize.x) *
                applyIorToRoughness(roughnessValue, ior);
              return texture2D(buffer, fragCoord.xy);
            }

            vec3 applyVolumeAttenuation(
              const in vec3 radiance,
              const in float transmissionDistance,
              const in vec3 attenuationColorValue,
              const in float attenuationDistanceValue
            ) {
              if (isinf(attenuationDistanceValue)) {
                return radiance;
              }

              vec3 attenuationCoefficient =
                -log(attenuationColorValue) / attenuationDistanceValue;
              vec3 transmittance =
                exp(-attenuationCoefficient * transmissionDistance);

              return transmittance * radiance;
            }

            vec4 getIBLVolumeRefraction(
              const in vec3 n,
              const in vec3 v,
              const in float roughnessValue,
              const in vec3 diffuseColor,
              const in vec3 specularColor,
              const in float specularF90,
              const in vec3 position,
              const in mat4 modelMatrix,
              const in mat4 viewMatrix,
              const in mat4 projMatrix,
              const in float ior,
              const in float thicknessValue,
              const in vec3 attenuationColorValue,
              const in float attenuationDistanceValue
            ) {
              vec3 transmissionRay = getVolumeTransmissionRay(
                n,
                v,
                thicknessValue,
                ior,
                modelMatrix
              );
              vec3 refractedRayExit = position + transmissionRay;
              vec4 normalizedDeviceCoordinates =
                projMatrix * viewMatrix * vec4(refractedRayExit, 1.0);
              vec2 refractionCoords = normalizedDeviceCoordinates.xy / normalizedDeviceCoordinates.w;
              refractionCoords += 1.0;
              refractionCoords /= 2.0;
              vec3 transmissionDirection = normalize(transmissionRay);
              vec4 transmittedLight = getTransmissionSample(
                refractionCoords,
                transmissionDirection,
                roughnessValue,
                ior
              );
              vec3 attenuatedColor = applyVolumeAttenuation(
                transmittedLight.rgb,
                length(transmissionRay),
                attenuationColorValue,
                attenuationDistanceValue
              );
              vec3 F = EnvironmentBRDF(
                n,
                v,
                specularColor,
                specularF90,
                roughnessValue
              );
              return vec4(
                (1.0 - F) * attenuatedColor * diffuseColor,
                transmittedLight.a
              );
            }
          #endif
        `,
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <transmission_fragment>',
        `
          material.transmission = _transmission;
          material.transmissionAlpha = 1.0;
          material.thickness = thickness;
          material.attenuationDistance = attenuationDistance;
          material.attenuationColor = attenuationColor;
          #ifdef USE_TRANSMISSIONMAP
            material.transmission *= texture2D(transmissionMap, vUv).r;
          #endif
          #ifdef USE_THICKNESSMAP
            material.thickness *= texture2D(thicknessMap, vUv).g;
          #endif

          vec3 transmissionPosition = vWorldPosition;
          float runningSeed = 0.0;
          vec3 transmissionViewDirection = normalize(cameraPosition - transmissionPosition);
          vec3 transmissionNormal = inverseTransformDirection(normal, viewMatrix);
          vec3 transmission = vec3(0.0);
          float transmissionR;
          float transmissionG;
          float transmissionB;
          float randomCoords = rand(runningSeed++);
          float thicknessSmear =
            thickness * max(pow(roughnessFactor, 0.33), anisotropicBlur);
          vec3 distortionNormal = vec3(0.0);
          vec3 temporalOffset = vec3(time, -time, -time) * temporalDistortion;

          if (distortion > 0.0) {
            distortionNormal = distortion * vec3(
              snoiseFractal(vec3(transmissionPosition * distortionScale + temporalOffset)),
              snoiseFractal(vec3(transmissionPosition.zxy * distortionScale - temporalOffset)),
              snoiseFractal(vec3(transmissionPosition.yxz * distortionScale + temporalOffset))
            );
          }

          for (float i = 0.0; i < ${samples}.0; i++) {
            vec3 sampleNorm = normalize(
              transmissionNormal +
              roughnessFactor * roughnessFactor * 2.0 *
              normalize(
                vec3(
                  rand(runningSeed++) - 0.5,
                  rand(runningSeed++) - 0.5,
                  rand(runningSeed++) - 0.5
                )
              ) *
              pow(rand(runningSeed++), 0.33) +
              distortionNormal
            );

            transmissionR = getIBLVolumeRefraction(
              sampleNorm,
              transmissionViewDirection,
              material.roughness,
              material.diffuseColor,
              material.specularColor,
              material.specularF90,
              transmissionPosition,
              modelMatrix,
              viewMatrix,
              projectionMatrix,
              material.ior,
              material.thickness + thicknessSmear * (i + randomCoords) / float(${samples}),
              material.attenuationColor,
              material.attenuationDistance
            ).r;

            transmissionG = getIBLVolumeRefraction(
              sampleNorm,
              transmissionViewDirection,
              material.roughness,
              material.diffuseColor,
              material.specularColor,
              material.specularF90,
              transmissionPosition,
              modelMatrix,
              viewMatrix,
              projectionMatrix,
              material.ior * (1.0 + chromaticAberration * (i + randomCoords) / float(${samples})),
              material.thickness + thicknessSmear * (i + randomCoords) / float(${samples}),
              material.attenuationColor,
              material.attenuationDistance
            ).g;

            transmissionB = getIBLVolumeRefraction(
              sampleNorm,
              transmissionViewDirection,
              material.roughness,
              material.diffuseColor,
              material.specularColor,
              material.specularF90,
              transmissionPosition,
              modelMatrix,
              viewMatrix,
              projectionMatrix,
              material.ior * (1.0 + 2.0 * chromaticAberration * (i + randomCoords) / float(${samples})),
              material.thickness + thicknessSmear * (i + randomCoords) / float(${samples}),
              material.attenuationColor,
              material.attenuationDistance
            ).b;

            transmission.r += transmissionR;
            transmission.g += transmissionG;
            transmission.b += transmissionB;
          }

          transmission /= ${samples}.0;
          totalDiffuse = mix(totalDiffuse, transmission.rgb, material.transmission);
          float rimGrazing =
            pow(1.0 - saturate(dot(normal, geometryViewDir)), rimPower);
          float rimLightFacing = 1.0;
          #if NUM_DIR_LIGHTS > 0
            vec2 rimScreenNormal = normal.xy / max(length(normal.xy), 0.0001);
            vec2 rimLightDirection = directionalLights[0].direction.xy;
            rimLightDirection /= max(length(rimLightDirection), 0.0001);
            rimLightFacing = mix(
              0.15,
              1.0,
              pow(abs(dot(rimScreenNormal, rimLightDirection)), 2.0)
            );
          #endif
          totalDiffuse += rimIntensity * rimGrazing * rimLightFacing;
        `,
      );
    };

    Object.keys(this.halftoneUniforms).forEach((key) => {
      Object.defineProperty(this, key, {
        configurable: true,
        enumerable: true,
        get: () => this.halftoneUniforms[key]?.value,
        set: (value) => {
          this.halftoneUniforms[key]!.value = value;
        },
      });
    });
  }
}

const MAX_TEXTURE_ANISOTROPY = 8;

function setTextureSampling({
  renderer,
  texture,
}: {
  renderer: THREE.WebGLRenderer;
  texture: THREE.Texture;
}) {
  texture.generateMipmaps = true;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.anisotropy = Math.min(
    renderer.capabilities.getMaxAnisotropy(),
    MAX_TEXTURE_ANISOTROPY,
  );
}

function createGlassTransmissionScene(environmentTexture: THREE.Texture) {
  const transmissionScene = new THREE.Scene();
  transmissionScene.background = environmentTexture;

  return transmissionScene;
}

function loadTexture({
  colorSpace,
  renderer,
  url,
}: {
  colorSpace: THREE.ColorSpace;
  renderer: THREE.WebGLRenderer;
  url: string;
}) {
  const loader = new THREE.TextureLoader();

  return new Promise<THREE.Texture>((resolve, reject) => {
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

async function loadEnvironmentTexture(renderer: THREE.WebGLRenderer) {
  const equirectangularTexture = await loadTexture({
    colorSpace: THREE.SRGBColorSpace,
    renderer,
    url: HALFTONE_MATERIAL_IMAGE_URLS.environment,
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

async function loadImageTexture({
  assets,
  image,
}: {
  assets: Pick<HalftoneMaterialAssets, 'imageTextures' | 'renderer'>;
  image: HalftoneMaterialTextureImage;
}) {
  const texture = await loadTexture({
    colorSpace: THREE.NoColorSpace,
    renderer: assets.renderer,
    url: HALFTONE_MATERIAL_IMAGE_URLS.textures[image],
  });
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  assets.imageTextures[image] = texture;

  return texture;
}

async function loadHalftoneMaterialTextures({
  assets,
  texture,
}: {
  assets: Pick<
    HalftoneMaterialAssets,
    'imageTextureLoads' | 'imageTextures' | 'renderer'
  >;
  texture: HalftoneMaterialTexture;
}) {
  const missingImages = getMaterialTextureImages(texture).filter(
    (image) => !isDefined(assets.imageTextures[image]),
  );

  await Promise.all(
    missingImages.map((image) => {
      const imageLoad =
        assets.imageTextureLoads[image] ??
        loadImageTexture({ assets, image }).finally(() => {
          assets.imageTextureLoads[image] = undefined;
        });
      assets.imageTextureLoads[image] = imageLoad;

      return imageLoad;
    }),
  );

  return missingImages.length > 0;
}

async function createHalftoneMaterialAssets({
  renderer,
  texture,
}: {
  renderer: THREE.WebGLRenderer;
  texture: HalftoneMaterialTexture;
}): Promise<HalftoneMaterialAssets> {
  const imageTextureAssets: Pick<
    HalftoneMaterialAssets,
    'imageTextureLoads' | 'imageTextures' | 'renderer'
  > = { imageTextureLoads: {}, imageTextures: {}, renderer };
  const [environmentTexture] = await Promise.all([
    loadEnvironmentTexture(renderer),
    loadHalftoneMaterialTextures({ assets: imageTextureAssets, texture }),
  ]);

  return {
    ...imageTextureAssets,
    environmentTexture,
    glassTransmissionScene: createGlassTransmissionScene(environmentTexture),
  };
}

export type HalftoneTransmissionMaterial = TransmissionMaterial;

function createHalftoneMaterial() {
  return new TransmissionMaterial();
}

function applyHalftoneMaterialSettings(
  material: TransmissionMaterial,
  settings: HalftoneMaterialSettings,
  assets: HalftoneMaterialAssets,
) {
  const isGlass = settings.surface === 'glass';
  const textureSources = resolveMaterialTextureSources({
    sources: assets.imageTextures,
    texture: settings.texture,
  });

  textureSources.roughness?.repeat.set(
    settings.textureTiling,
    settings.textureTiling,
  );
  textureSources.bump?.repeat.set(
    settings.textureTiling,
    settings.textureTiling,
  );

  material.color.set(settings.color);
  material.roughness = settings.roughness;
  material.metalness = settings.metalness;
  material.envMap = assets.environmentTexture;
  material.envMapIntensity = settings.environmentPower;
  material.envMapRotation.set(
    0,
    THREE.MathUtils.degToRad(settings.environmentRotation),
    0,
  );
  assets.glassTransmissionScene.backgroundIntensity =
    settings.environmentPower *
    HALFTONE_MATERIAL_CONSTANTS.glassTransmissionBackgroundScale;
  assets.glassTransmissionScene.backgroundRotation.copy(
    material.envMapRotation,
  );
  material.clearcoat = isGlass ? 1 : 0;
  material.clearcoatRoughness = isGlass
    ? Math.max(settings.roughness * 0.25, 0.01)
    : 0.08;
  material.reflectivity = isGlass ? 0.98 : 0.5;
  material.transmission = 0;
  material._transmission = isGlass ? 1 : 0;
  material.refractionEnvMap = null;
  material.useEnvMapRefraction = 0;
  material.thickness = isGlass
    ? settings.thickness *
      HALFTONE_MATERIAL_CONSTANTS.glassThicknessToWorldUnits
    : 0;
  material.ior = isGlass ? settings.refraction : 1.5;
  material.buffer = null;
  material.roughnessMap = textureSources.roughness;
  material.bumpMap = textureSources.bump;
  material.bumpScale = textureSources.bumpScale;
  material.side = THREE.FrontSide;
  material.attenuationColor.set('white');
  material.attenuationDistance = Infinity;
  material.anisotropicBlur = isGlass
    ? THREE.MathUtils.lerp(0.03, 0.12, settings.roughness)
    : 0.1;
  material.chromaticAberration = isGlass ? 0.6 : 0.05;
  material.distortion = 0;
  material.distortionScale = 0.5;
  material.temporalDistortion = 0;
  material.rimIntensity = isGlass
    ? HALFTONE_MATERIAL_CONSTANTS.glassRimIntensity
    : 0;
  material.rimPower = HALFTONE_MATERIAL_CONSTANTS.glassRimPower;
  material.userData.halftoneIsGlass = isGlass;

  material.needsUpdate = true;
}

function renderHalftoneMaterialScene(options: {
  camera: THREE.Camera;
  elapsedTime: number;
  material: TransmissionMaterial;
  outputTarget: THREE.WebGLRenderTarget | null;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  transmissionScene: THREE.Scene;
  transmissionBacksideTarget: THREE.WebGLRenderTarget;
  transmissionTarget: THREE.WebGLRenderTarget;
}) {
  const {
    camera,
    elapsedTime,
    material,
    outputTarget,
    renderer,
    scene,
    transmissionScene,
    transmissionBacksideTarget,
    transmissionTarget,
  } = options;

  material.time = elapsedTime;

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
    material.envMapIntensity =
      HALFTONE_MATERIAL_CONSTANTS.glassBacksideEnvironmentIntensity;
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

function disposeHalftoneMaterialAssets(assets: HalftoneMaterialAssets) {
  assets.environmentTexture.dispose();
  Object.values(assets.imageTextures).forEach((texture) => texture.dispose());
}

export const HALFTONE_MATERIALS = {
  create: createHalftoneMaterial,
  createAssets: createHalftoneMaterialAssets,
  loadTextures: loadHalftoneMaterialTextures,
  applySettings: applyHalftoneMaterialSettings,
  renderScene: renderHalftoneMaterialScene,
  disposeAssets: disposeHalftoneMaterialAssets,
};
