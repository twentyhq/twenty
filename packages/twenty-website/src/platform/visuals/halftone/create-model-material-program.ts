import { Program, type Texture, Vec3 } from 'ogl';

import { type VisualRenderingContext } from '../gl-runtime/create-visual-renderer';

import { linearColorFromHex } from '../gl-runtime/linear-color-from-hex';
import { SOLID_MATERIAL_SHADERS } from './solid-material-shaders';
import { type HalftoneMaterialSettings } from './halftone-settings';

const SOLID_ENVIRONMENT_INTENSITY = 0.25;
const GLASS_ENVIRONMENT_INTENSITY_BASE = 0.18;
const GLASS_ENVIRONMENT_INTENSITY_MULTIPLIER = 0.12;
const GLASS_THICKNESS_TO_WORLD_UNITS = 1 / 320;
const GLASS_ATTENUATION_DISTANCE_MIN = 0.12;
const SOLID_CHROMATIC_ABERRATION = 0.05;

type CreateModelMaterialProgramOptions = {
  gl: VisualRenderingContext;
  material: HalftoneMaterialSettings;
  lighting: {
    ambientIntensity: number;
    fillIntensity: number;
    intensity: number;
  };
  environmentTexture: Texture;
  environmentMaxLod: number;
  refractionEnvironmentTexture?: Texture;
  dfgLut: Texture;
  primaryLightDirection: Vec3;
  fillLightDirection: Vec3;
};

// The #define mirrors three's own USE_TRANSMISSION branch, so glass and solid
// stay one shader with one set of BRDF functions rather than two files that
// drift.
function withTransmissionDefine(source: string) {
  return source.replace(
    '#version 300 es',
    '#version 300 es\n#define USE_TRANSMISSION',
  );
}

export function createModelMaterialProgram({
  gl,
  material,
  lighting,
  environmentTexture,
  environmentMaxLod,
  refractionEnvironmentTexture,
  dfgLut,
  primaryLightDirection,
  fillLightDirection,
}: CreateModelMaterialProgramOptions) {
  const isGlass = material.surface === 'glass';
  const glassThickness = material.thickness * GLASS_THICKNESS_TO_WORLD_UNITS;
  const glassEnvironmentIntensity =
    GLASS_ENVIRONMENT_INTENSITY_BASE +
    material.environmentPower * GLASS_ENVIRONMENT_INTENSITY_MULTIPLIER;

  const uniforms: Record<string, { value: unknown }> = {
    diffuse: {
      value: linearColorFromHex(isGlass ? 0xffffff : material.color),
    },
    roughness: { value: material.roughness },
    metalness: { value: material.metalness },
    envMap: { value: environmentTexture },
    envMapIntensity: {
      value: isGlass ? glassEnvironmentIntensity : SOLID_ENVIRONMENT_INTENSITY,
    },
    envMapMaxLod: { value: environmentMaxLod },
    dfgLUT: { value: dfgLut },
    ambientLightColor: {
      value: new Vec3(
        lighting.ambientIntensity,
        lighting.ambientIntensity,
        lighting.ambientIntensity,
      ),
    },
    primaryLightColor: {
      value: new Vec3(
        lighting.intensity,
        lighting.intensity,
        lighting.intensity,
      ),
    },
    primaryLightDirection: { value: primaryLightDirection },
    fillLightColor: {
      value: new Vec3(
        lighting.fillIntensity,
        lighting.fillIntensity,
        lighting.fillIntensity,
      ),
    },
    fillLightDirection: { value: fillLightDirection },
  };

  if (isGlass) {
    uniforms.refractionEnvMap = { value: refractionEnvironmentTexture };
    uniforms.ior = { value: material.refraction };
    uniforms.thickness = { value: glassThickness };
    uniforms.attenuationDistance = {
      value: Math.max(glassThickness * 4, GLASS_ATTENUATION_DISTANCE_MIN),
    };
    uniforms.attenuationColor = { value: linearColorFromHex(material.color) };
    uniforms.chromaticAberration = { value: 0 };
    uniforms.anisotropicBlur = {
      value: 0.03 + (0.12 - 0.03) * material.roughness,
    };
    uniforms.clearcoatAmount = { value: 1 };
    uniforms.clearcoatRoughness = {
      value: Math.max(material.roughness * 0.25, 0.01),
    };
  } else {
    uniforms.chromaticAberration = { value: SOLID_CHROMATIC_ABERRATION };
  }

  return new Program(gl, {
    vertex: isGlass
      ? withTransmissionDefine(SOLID_MATERIAL_SHADERS.vertex)
      : SOLID_MATERIAL_SHADERS.vertex,
    fragment: isGlass
      ? withTransmissionDefine(SOLID_MATERIAL_SHADERS.fragment)
      : SOLID_MATERIAL_SHADERS.fragment,
    uniforms,
  });
}
