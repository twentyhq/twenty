import { HALFTONE_TRANSMISSION_SHADER_SOURCE } from './transmission-shader-source';

export const TRANSMISSION_MATERIAL_RUNTIME_SOURCE = String.raw`
const HALFTONE_TRANSMISSION_SHADER_PREFIX = ${JSON.stringify(
  HALFTONE_TRANSMISSION_SHADER_SOURCE.prefix,
)};
const HALFTONE_TRANSMISSION_PARS_FRAGMENT = ${JSON.stringify(
  HALFTONE_TRANSMISSION_SHADER_SOURCE.parsFragment,
)};
const HALFTONE_TRANSMISSION_FRAGMENT_TEMPLATE = ${JSON.stringify(
  HALFTONE_TRANSMISSION_SHADER_SOURCE.fragmentTemplate,
)};

class HalftoneTransmissionMaterial extends THREE.MeshPhysicalMaterial {
  constructor(samples = 10) {
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

    this.customProgramCacheKey = () => 'halftone-transmission-' + samples;

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
        HALFTONE_TRANSMISSION_SHADER_PREFIX + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <transmission_pars_fragment>',
        HALFTONE_TRANSMISSION_PARS_FRAGMENT,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <transmission_fragment>',
        HALFTONE_TRANSMISSION_FRAGMENT_TEMPLATE.replaceAll(
          '__SAMPLES__',
          String(samples),
        ),
      );
    };

    Object.keys(this.halftoneUniforms).forEach((key) => {
      Object.defineProperty(this, key, {
        configurable: true,
        enumerable: true,
        get: () => this.halftoneUniforms[key]?.value,
        set: (value) => {
          this.halftoneUniforms[key].value = value;
        },
      });
    });
  }
}

function createHalftoneMaterial() {
  return new HalftoneTransmissionMaterial();
}
`;
