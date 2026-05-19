import type { HalftoneMaterialSettings } from '@/lib/halftone/utils/state';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import * as THREE from 'three';

export type HalftoneMaterialAssets = {
  glassBackgroundTexture: THREE.Texture;
  glassEnvironmentTexture: THREE.Texture;
  glassTransmissionScene: THREE.Scene;
  solidEnvironmentTexture: THREE.Texture;
};

export class HalftoneTransmissionMaterial extends THREE.MeshPhysicalMaterial {
  declare anisotropicBlur: number;
  declare attenuationColor: THREE.Color;
  declare attenuationDistance: number;
  declare buffer: THREE.Texture | null;
  declare chromaticAberration: number;
  declare distortion: number;
  declare distortionScale: number;
  declare refractionEnvMap: THREE.Texture | null;
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
              vec4 ndcPos =
                projMatrix * viewMatrix * vec4(refractedRayExit, 1.0);
              vec2 refractionCoords = ndcPos.xy / ndcPos.w;
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

          vec3 pos = vWorldPosition;
          float runningSeed = 0.0;
          vec3 v = normalize(cameraPosition - pos);
          vec3 n = inverseTransformDirection(normal, viewMatrix);
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
              snoiseFractal(vec3(pos * distortionScale + temporalOffset)),
              snoiseFractal(vec3(pos.zxy * distortionScale - temporalOffset)),
              snoiseFractal(vec3(pos.yxz * distortionScale + temporalOffset))
            );
          }

          for (float i = 0.0; i < ${samples}.0; i++) {
            vec3 sampleNorm = normalize(
              n +
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
              v,
              material.roughness,
              material.diffuseColor,
              material.specularColor,
              material.specularF90,
              pos,
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
              v,
              material.roughness,
              material.diffuseColor,
              material.specularColor,
              material.specularF90,
              pos,
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
              v,
              material.roughness,
              material.diffuseColor,
              material.specularColor,
              material.specularF90,
              pos,
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

const GLASS_THICKNESS_TO_WORLD_UNITS = 1 / 320;
const GLASS_ATTENUATION_DISTANCE_MIN = 0.12;
const GLASS_ENVIRONMENT_INTENSITY_BASE = 0.18;
const GLASS_ENVIRONMENT_INTENSITY_MULTIPLIER = 0.12;
const GLASS_ENVIRONMENT_ZOOM = 1.55;
const GLASS_TRANSMISSION_BACKGROUND = new THREE.Color(0x030303);
const GLASS_TEXTURE_URLS = {
  environment: '/halftone/materials/glass/environment.jpg',
} as const;
const MAX_TEXTURE_ANISOTROPY = 8;

function setTextureSampling(
  texture: THREE.Texture,
  renderer: THREE.WebGLRenderer,
) {
  texture.generateMipmaps = true;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.anisotropy = Math.min(
    renderer.capabilities.getMaxAnisotropy(),
    MAX_TEXTURE_ANISOTROPY,
  );
}

function disposeEnvironmentScene(scene: THREE.Scene) {
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh;

    if (mesh.geometry) {
      mesh.geometry.dispose();
    }

    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((material) => material.dispose());
      return;
    }

    mesh.material?.dispose?.();
  });
}

function createSolidEnvironmentTexture(renderer: THREE.WebGLRenderer) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const environmentTexture = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0.04,
  ).texture;
  pmremGenerator.dispose();

  return environmentTexture;
}

function getTextureImageSize(texture: THREE.Texture) {
  const image = texture.image as
    | {
        height?: number;
        naturalHeight?: number;
        naturalWidth?: number;
        videoHeight?: number;
        videoWidth?: number;
        width?: number;
      }
    | undefined;
  const width =
    image?.naturalWidth ?? image?.videoWidth ?? image?.width ?? undefined;
  const height =
    image?.naturalHeight ?? image?.videoHeight ?? image?.height ?? undefined;

  return {
    height,
    width,
  };
}

function createZoomedGlassTexture(
  sourceTexture: THREE.Texture,
  renderer: THREE.WebGLRenderer,
  zoom: number,
) {
  if (zoom <= 1) {
    return sourceTexture;
  }

  const { width, height } = getTextureImageSize(sourceTexture);

  if (!width || !height) {
    return sourceTexture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');

  if (!context) {
    return sourceTexture;
  }

  const cropWidth = width / zoom;
  const cropHeight = height / zoom;
  const sourceX = (width - cropWidth) / 2;
  const sourceY = (height - cropHeight) / 2;

  context.drawImage(
    sourceTexture.image as CanvasImageSource,
    sourceX,
    sourceY,
    cropWidth,
    cropHeight,
    0,
    0,
    width,
    height,
  );

  const zoomedTexture = new THREE.CanvasTexture(canvas);
  zoomedTexture.colorSpace = sourceTexture.colorSpace;
  zoomedTexture.wrapS = THREE.ClampToEdgeWrapping;
  zoomedTexture.wrapT = THREE.ClampToEdgeWrapping;
  setTextureSampling(zoomedTexture, renderer);
  zoomedTexture.needsUpdate = true;

  return zoomedTexture;
}

function createStudioGlassEnvironmentScene(backdropTexture?: THREE.Texture) {
  const studioScene = new THREE.Scene();
  studioScene.background = backdropTexture ?? GLASS_TRANSMISSION_BACKGROUND;
  studioScene.backgroundIntensity = backdropTexture ? 1 : 0.4;

  return studioScene;
}

function createStudioGlassEnvironmentTexture(
  renderer: THREE.WebGLRenderer,
  backdropTexture?: THREE.Texture,
) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const environmentTexture = backdropTexture
    ? pmremGenerator.fromEquirectangular(backdropTexture).texture
    : pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  pmremGenerator.dispose();

  return environmentTexture;
}

function createFallbackGlassBackdropTexture(renderer: THREE.WebGLRenderer) {
  const texture = new THREE.DataTexture(
    new Uint8Array([3, 3, 3, 255]),
    1,
    1,
    THREE.RGBAFormat,
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  setTextureSampling(texture, renderer);
  texture.needsUpdate = true;

  return texture;
}

function loadTexture(
  url: string,
  renderer: THREE.WebGLRenderer,
  colorSpace: THREE.ColorSpace,
) {
  const loader = new THREE.TextureLoader();

  return new Promise<THREE.Texture>((resolve, reject) => {
    loader.load(
      url,
      (texture) => {
        texture.colorSpace = colorSpace;
        setTextureSampling(texture, renderer);
        resolve(texture);
      },
      undefined,
      reject,
    );
  });
}

async function loadGlassEnvironmentAssets(renderer: THREE.WebGLRenderer) {
  const sourceBackgroundTexture = await loadTexture(
    GLASS_TEXTURE_URLS.environment,
    renderer,
    THREE.SRGBColorSpace,
  );
  const backgroundTexture = createZoomedGlassTexture(
    sourceBackgroundTexture,
    renderer,
    GLASS_ENVIRONMENT_ZOOM,
  );
  if (backgroundTexture !== sourceBackgroundTexture) {
    sourceBackgroundTexture.dispose();
  }
  backgroundTexture.mapping = THREE.EquirectangularReflectionMapping;
  backgroundTexture.wrapS = THREE.ClampToEdgeWrapping;
  backgroundTexture.wrapT = THREE.ClampToEdgeWrapping;
  backgroundTexture.needsUpdate = true;
  const transmissionScene =
    createStudioGlassEnvironmentScene(backgroundTexture);
  const environmentTexture = createStudioGlassEnvironmentTexture(
    renderer,
    backgroundTexture,
  );

  return {
    backgroundTexture,
    environmentTexture,
    glassTransmissionScene: transmissionScene,
  };
}

function getGlassEnvironmentIntensity(power: number) {
  return (
    GLASS_ENVIRONMENT_INTENSITY_BASE +
    power * GLASS_ENVIRONMENT_INTENSITY_MULTIPLIER
  );
}

export async function createHalftoneMaterialAssets(
  renderer: THREE.WebGLRenderer,
): Promise<HalftoneMaterialAssets> {
  const solidEnvironmentTexture = createSolidEnvironmentTexture(renderer);

  try {
    const glassEnvironmentAssets = await loadGlassEnvironmentAssets(renderer);

    return {
      glassBackgroundTexture: glassEnvironmentAssets.backgroundTexture,
      glassEnvironmentTexture: glassEnvironmentAssets.environmentTexture,
      glassTransmissionScene: glassEnvironmentAssets.glassTransmissionScene,
      solidEnvironmentTexture,
    };
  } catch {
    const transmissionScene = createStudioGlassEnvironmentScene();
    const fallbackGlassBackdropTexture =
      createFallbackGlassBackdropTexture(renderer);
    const fallbackGlassEnvironmentTexture =
      createStudioGlassEnvironmentTexture(renderer);

    return {
      glassBackgroundTexture: fallbackGlassBackdropTexture,
      glassEnvironmentTexture: fallbackGlassEnvironmentTexture,
      glassTransmissionScene: transmissionScene,
      solidEnvironmentTexture,
    };
  }
}

export function createHalftoneMaterial() {
  return new HalftoneTransmissionMaterial();
}

export function applyHalftoneMaterialSettings(
  material: HalftoneTransmissionMaterial,
  settings: HalftoneMaterialSettings,
  assets: HalftoneMaterialAssets,
) {
  const isGlass = settings.surface === 'glass';
  const glassThickness = settings.thickness * GLASS_THICKNESS_TO_WORLD_UNITS;
  const glassEnvironmentIntensity = getGlassEnvironmentIntensity(
    settings.environmentPower,
  );
  const glassAttenuationDistance = Math.max(
    glassThickness * 4,
    GLASS_ATTENUATION_DISTANCE_MIN,
  );

  material.color.set(isGlass ? '#ffffff' : settings.color);
  material.roughness = settings.roughness;
  material.metalness = settings.metalness;
  material.envMap = isGlass
    ? assets.glassEnvironmentTexture
    : assets.solidEnvironmentTexture;
  material.envMapIntensity = isGlass ? glassEnvironmentIntensity : 0.25;
  material.clearcoat = isGlass ? 1 : 0;
  material.clearcoatRoughness = isGlass
    ? Math.max(settings.roughness * 0.25, 0.01)
    : 0.08;
  material.reflectivity = isGlass ? 0.98 : 0.5;
  material.transmission = 0;
  material._transmission = isGlass ? 1 : 0;
  material.refractionEnvMap = isGlass ? assets.glassBackgroundTexture : null;
  material.useEnvMapRefraction = isGlass ? 1 : 0;
  material.thickness = isGlass ? glassThickness : 0;
  material.ior = isGlass ? settings.refraction : 1.5;
  material.buffer = null;
  material.bumpMap = null;
  material.bumpScale = 0;
  material.roughnessMap = null;
  material.side = THREE.FrontSide;
  material.transparent = false;
  material.opacity = 1;
  material.depthWrite = true;
  material.attenuationColor.set(isGlass ? settings.color : 'white');
  material.attenuationDistance = isGlass ? glassAttenuationDistance : Infinity;
  material.anisotropicBlur = isGlass
    ? THREE.MathUtils.lerp(0.03, 0.12, settings.roughness)
    : 0.1;
  material.chromaticAberration = isGlass ? 0 : 0.05;
  material.distortion = 0;
  material.distortionScale = 0.5;
  material.temporalDistortion = 0;
  material.userData.halftoneIsGlass = isGlass;
  material.userData.halftoneGlassBacksideThickness = isGlass
    ? glassThickness * 2
    : 0;
  material.userData.halftoneGlassBacksideEnvIntensity = isGlass
    ? glassEnvironmentIntensity * 2.8
    : 0;
  material.userData.halftoneUseEnvironmentRefraction = isGlass;

  material.needsUpdate = true;
}

export function renderHalftoneMaterialScene(options: {
  camera: THREE.Camera;
  elapsedTime: number;
  material: HalftoneTransmissionMaterial;
  mesh: THREE.Mesh;
  outputTarget: THREE.WebGLRenderTarget | null;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  transmissionBackground?: THREE.Color | THREE.Texture | null;
  transmissionBackgroundIntensity?: number;
  transmissionScene?: THREE.Scene;
  transmissionBacksideTarget: THREE.WebGLRenderTarget;
  transmissionTarget: THREE.WebGLRenderTarget;
}) {
  const {
    camera,
    elapsedTime,
    material,
    mesh,
    outputTarget,
    renderer,
    scene,
    transmissionBackground,
    transmissionBackgroundIntensity,
    transmissionScene,
    transmissionBacksideTarget,
    transmissionTarget,
  } = options;
  const isGlass = material.userData.halftoneIsGlass === true;

  material.time = elapsedTime;

  if (!isGlass) {
    renderer.setRenderTarget(outputTarget);
    renderer.clear();
    renderer.render(scene, camera);

    return;
  }

  const useEnvironmentRefraction =
    material.userData.halftoneUseEnvironmentRefraction === true;

  if (useEnvironmentRefraction) {
    material.buffer = null;
    renderer.setRenderTarget(outputTarget);
    renderer.clear();
    renderer.render(scene, camera);

    return;
  }

  const previousToneMapping = renderer.toneMapping;
  const previousVisibility = mesh.visible;
  const previousBackground = scene.background;
  const previousBackgroundIntensity = scene.backgroundIntensity;
  const previousSide = material.side;
  const previousThickness = material.thickness;
  const previousEnvMapIntensity = material.envMapIntensity;
  const backsideThickness =
    (material.userData.halftoneGlassBacksideThickness as number | undefined) ??
    previousThickness;
  const backsideEnvMapIntensity =
    (material.userData.halftoneGlassBacksideEnvIntensity as
      | number
      | undefined) ?? previousEnvMapIntensity;
  const backgroundIntensity =
    transmissionBackgroundIntensity ?? previousEnvMapIntensity;

  renderer.toneMapping = THREE.NoToneMapping;

  if (transmissionScene) {
    renderer.setRenderTarget(transmissionBacksideTarget);
    renderer.clear();
    renderer.render(transmissionScene, camera);
  } else {
    scene.background = transmissionBackground ?? GLASS_TRANSMISSION_BACKGROUND;
    scene.backgroundIntensity = transmissionBackground
      ? backgroundIntensity
      : 1;
    mesh.visible = false;
    renderer.setRenderTarget(transmissionBacksideTarget);
    renderer.clear();
    renderer.render(scene, camera);
    mesh.visible = previousVisibility;
  }

  material.buffer = transmissionBacksideTarget.texture;
  material.thickness = backsideThickness;
  material.side = THREE.BackSide;
  material.envMapIntensity = backsideEnvMapIntensity;
  renderer.setRenderTarget(transmissionTarget);
  renderer.clear();
  renderer.render(scene, camera);

  material.buffer = transmissionTarget.texture;
  material.thickness = previousThickness;
  material.side = previousSide;
  material.envMapIntensity = previousEnvMapIntensity;
  if (!transmissionScene) {
    scene.background = previousBackground;
    scene.backgroundIntensity = previousBackgroundIntensity;
  }
  renderer.setRenderTarget(outputTarget);
  renderer.clear();
  renderer.render(scene, camera);
  renderer.toneMapping = previousToneMapping;
}

export function disposeHalftoneMaterialAssets(assets: HalftoneMaterialAssets) {
  assets.glassBackgroundTexture.dispose();

  if (assets.glassEnvironmentTexture !== assets.glassBackgroundTexture) {
    assets.glassEnvironmentTexture.dispose();
  }

  disposeEnvironmentScene(assets.glassTransmissionScene);
  assets.solidEnvironmentTexture.dispose();
}
