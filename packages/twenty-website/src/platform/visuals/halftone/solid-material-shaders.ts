// A metalness/roughness surface lit by two directional lights, one ambient
// term and the baked room environment, with an optional glass path behind
// USE_TRANSMISSION. Ported function-for-function from
// three's ShaderChunk (common, bsdfs, lights_physical_pars_fragment,
// envmap_physical_pars_fragment) at the settings these scenes actually use:
// no maps, no sheen, no iridescence.
//
// The glass path is the old TransmissionMaterial's environment-refraction
// branch. Its three-pass backside variant was unreachable: applySettings set
// useEnvMapRefraction for every glass surface, and renderScene returned after
// one pass whenever that was on.
//
// The DFG lookups are three's own precomputed table, so the specular and IBL
// terms match MeshPhysicalMaterial rather than approximating it.
//
// GLSL ES 3.00 rather than the 1.00 the fullscreen passes use: the roughness
// lookup needs an explicit textureLod, which 1.00 only exposes behind an
// extension, and dFdx/dFdy are core here.
export const SOLID_MATERIAL_SHADERS = {
  vertex: /* glsl */ `#version 300 es
  in vec3 position;
  in vec3 normal;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat3 normalMatrix;
  uniform mat4 modelMatrix;

  out vec3 vViewNormal;
  out vec3 vViewPosition;
  out vec3 vWorldPosition;

  void main() {
    vViewNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`,
  fragment: /* glsl */ `#version 300 es
  precision highp float;

  #define PI 3.141592653589793
  #define RECIPROCAL_PI 0.3183098861837907
  #define EPSILON 1e-6

  uniform vec3 diffuse;
  uniform float roughness;
  uniform float metalness;
  uniform float envMapIntensity;
  uniform float envMapMaxLod;
  uniform sampler2D envMap;
  uniform sampler2D dfgLUT;

  uniform vec3 ambientLightColor;
  uniform vec3 primaryLightColor;
  uniform vec3 primaryLightDirection;
  uniform vec3 fillLightColor;
  uniform vec3 fillLightDirection;

  uniform mat4 viewMatrix;

  in vec3 vViewNormal;
  in vec3 vViewPosition;
  in vec3 vWorldPosition;

  out vec4 fragColor;

  #ifdef USE_TRANSMISSION
    uniform mat4 modelMatrix;
    uniform vec3 cameraPosition;
    uniform sampler2D refractionEnvMap;
    uniform float ior;
    uniform float thickness;
    uniform float attenuationDistance;
    uniform vec3 attenuationColor;
    uniform float chromaticAberration;
    uniform float anisotropicBlur;
    uniform float clearcoatAmount;
    uniform float clearcoatRoughness;
  #endif

  float pow2(const in float x) { return x * x; }
  float pow4(const in float x) { float x2 = x * x; return x2 * x2; }
  float saturateValue(const in float x) { return clamp(x, 0.0, 1.0); }

  vec3 inverseTransformDirection(in vec3 dir, in mat4 matrix) {
    return normalize((vec4(dir, 0.0) * matrix).xyz);
  }

  vec3 BRDF_Lambert(const in vec3 diffuseColor) {
    return RECIPROCAL_PI * diffuseColor;
  }

  vec3 F_Schlick(const in vec3 f0, const in float f90, const in float dotVH) {
    float fresnel = exp2((-5.55473 * dotVH - 6.98316) * dotVH);
    return f0 * (1.0 - fresnel) + (f90 * fresnel);
  }

  float V_GGX_SmithCorrelated(
    const in float alpha,
    const in float dotNL,
    const in float dotNV
  ) {
    float a2 = pow2(alpha);
    float gv = dotNL * sqrt(a2 + (1.0 - a2) * pow2(dotNV));
    float gl = dotNV * sqrt(a2 + (1.0 - a2) * pow2(dotNL));
    return 0.5 / max(gv + gl, EPSILON);
  }

  float D_GGX(const in float alpha, const in float dotNH) {
    float a2 = pow2(alpha);
    float denom = pow2(dotNH) * (a2 - 1.0) + 1.0;
    return RECIPROCAL_PI * a2 / pow2(denom);
  }

  vec2 sampleDfg(const in float materialRoughness, const in float dotNV) {
    return texture(dfgLUT, vec2(materialRoughness, dotNV)).rg;
  }

  vec3 BRDF_GGX(
    const in vec3 lightDir,
    const in vec3 viewDir,
    const in vec3 normal,
    const in vec3 specularColorBlended,
    const in float specularF90,
    const in float materialRoughness
  ) {
    float alpha = pow2(materialRoughness);
    vec3 halfDir = normalize(lightDir + viewDir);

    float dotNL = saturateValue(dot(normal, lightDir));
    float dotNV = saturateValue(dot(normal, viewDir));
    float dotNH = saturateValue(dot(normal, halfDir));
    float dotVH = saturateValue(dot(viewDir, halfDir));

    vec3 F = F_Schlick(specularColorBlended, specularF90, dotVH);
    float V = V_GGX_SmithCorrelated(alpha, dotNL, dotNV);
    float D = D_GGX(alpha, dotNH);

    return F * (V * D);
  }

  vec3 BRDF_GGX_Multiscatter(
    const in vec3 lightDir,
    const in vec3 viewDir,
    const in vec3 normal,
    const in vec3 specularColorBlended,
    const in float specularF90,
    const in float materialRoughness
  ) {
    vec3 singleScatter = BRDF_GGX(
      lightDir,
      viewDir,
      normal,
      specularColorBlended,
      specularF90,
      materialRoughness
    );

    float dotNL = saturateValue(dot(normal, lightDir));
    float dotNV = saturateValue(dot(normal, viewDir));

    vec2 dfgV = sampleDfg(materialRoughness, dotNV);
    vec2 dfgL = sampleDfg(materialRoughness, dotNL);

    vec3 FssEssV = specularColorBlended * dfgV.x + specularF90 * dfgV.y;
    vec3 FssEssL = specularColorBlended * dfgL.x + specularF90 * dfgL.y;

    float EmsV = 1.0 - (dfgV.x + dfgV.y);
    float EmsL = 1.0 - (dfgL.x + dfgL.y);

    vec3 Favg =
      specularColorBlended + (1.0 - specularColorBlended) * 0.047619;
    vec3 Fms =
      FssEssV * FssEssL * Favg / (1.0 - EmsV * EmsL * Favg + EPSILON);

    return singleScatter + Fms * (EmsV * EmsL);
  }

  void computeMultiscattering(
    const in vec3 normal,
    const in vec3 viewDir,
    const in vec3 specularColor,
    const in float specularF90,
    const in float materialRoughness,
    inout vec3 singleScatter,
    inout vec3 multiScatter
  ) {
    float dotNV = saturateValue(dot(normal, viewDir));
    vec2 fab = sampleDfg(materialRoughness, dotNV);

    vec3 Fr = specularColor;
    vec3 FssEss = Fr * fab.x + specularF90 * fab.y;

    float Ess = fab.x + fab.y;
    float Ems = 1.0 - Ess;

    vec3 Favg = Fr + (1.0 - Fr) * 0.047619;
    vec3 Fms = FssEss * Favg / (1.0 - Ems * Favg);

    singleScatter += FssEss;
    multiScatter += Fms * Ems;
  }

  vec2 directionToEquirectUv(const in vec3 direction) {
    vec3 dir = normalize(direction);
    vec2 uv = vec2(
      atan(dir.z, dir.x) * 0.15915494309189535 + 0.5,
      asin(clamp(dir.y, -1.0, 1.0)) * 0.3183098861837907 + 0.5
    );
    return vec2(fract(uv.x), 1.0 - clamp(uv.y, 0.0, 1.0));
  }

  vec3 sampleEnvironment(const in vec3 direction, const in float lod) {
    return textureLod(envMap, directionToEquirectUv(direction), lod).rgb;
  }

  vec3 getIBLIrradiance(const in vec3 normal) {
    vec3 worldNormal = inverseTransformDirection(normal, viewMatrix);
    return PI * sampleEnvironment(worldNormal, envMapMaxLod) * envMapIntensity;
  }

  vec3 getIBLRadiance(
    const in vec3 viewDir,
    const in vec3 normal,
    const in float materialRoughness
  ) {
    vec3 reflectVec = reflect(-viewDir, normal);
    reflectVec = normalize(mix(reflectVec, normal, pow4(materialRoughness)));
    reflectVec = inverseTransformDirection(reflectVec, viewMatrix);
    return sampleEnvironment(reflectVec, materialRoughness * envMapMaxLod) *
      envMapIntensity;
  }


  #ifdef USE_TRANSMISSION

    #define TRANSMISSION_SAMPLES 10

    vec3 EnvironmentBRDF(
      const in vec3 normal,
      const in vec3 viewDir,
      const in vec3 specularColor,
      const in float specularF90,
      const in float materialRoughness
    ) {
      float dotNV = saturateValue(dot(normal, viewDir));
      vec2 fab = sampleDfg(materialRoughness, dotNV);
      return specularColor * fab.x + specularF90 * fab.y;
    }

    uint hashUint(uint x) {
      x += (x << 10u);
      x ^= (x >> 6u);
      x += (x << 3u);
      x ^= (x >> 11u);
      x += (x << 15u);
      return x;
    }

    uint hashUint(uvec3 v) {
      return hashUint(v.x ^ hashUint(v.y) ^ hashUint(v.z));
    }

    float floatConstruct(uint m) {
      const uint ieeeMantissa = 0x007FFFFFu;
      const uint ieeeOne = 0x3F800000u;
      m &= ieeeMantissa;
      m |= ieeeOne;
      return uintBitsToFloat(m) - 1.0;
    }

    float rand(float seed) {
      return floatConstruct(
        hashUint(floatBitsToUint(vec3(gl_FragCoord.xy, seed)))
      );
    }

    vec3 getVolumeTransmissionRay(
      const in vec3 n,
      const in vec3 v,
      const in float thicknessValue,
      const in float iorValue
    ) {
      vec3 refractionVector = refract(-v, normalize(n), 1.0 / iorValue);
      vec3 modelScale;
      modelScale.x = length(vec3(modelMatrix[0].xyz));
      modelScale.y = length(vec3(modelMatrix[1].xyz));
      modelScale.z = length(vec3(modelMatrix[2].xyz));
      return normalize(refractionVector) * thicknessValue * modelScale;
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
      return exp(-attenuationCoefficient * transmissionDistance) * radiance;
    }

    vec3 getIBLVolumeRefraction(
      const in vec3 n,
      const in vec3 v,
      const in vec3 diffuseColorValue,
      const in vec3 specularColorValue,
      const in float specularF90,
      const in float materialRoughness,
      const in float iorValue,
      const in float thicknessValue
    ) {
      vec3 transmissionRay =
        getVolumeTransmissionRay(n, v, thicknessValue, iorValue);
      vec3 transmissionDirection = normalize(transmissionRay);
      vec3 transmittedLight =
        texture(refractionEnvMap, directionToEquirectUv(transmissionDirection)).rgb;
      vec3 attenuatedColor = applyVolumeAttenuation(
        transmittedLight,
        length(transmissionRay),
        attenuationColor,
        attenuationDistance
      );
      vec3 F = EnvironmentBRDF(
        n, v, specularColorValue, specularF90, materialRoughness
      );
      return (1.0 - F) * attenuatedColor * diffuseColorValue;
    }

  #endif

  void main() {
    vec3 normal = normalize(vViewNormal);
    vec3 viewDir = normalize(-vViewPosition);

    // three floors roughness at the base mip of a 256 cubemap and adds the
    // screen-space derivative of the normal, which keeps grazing edges of
    // these dense meshes from aliasing into the halftone pass.
    vec3 dxy = max(abs(dFdx(normal)), abs(dFdy(normal)));
    float geometryRoughness = max(max(dxy.x, dxy.y), dxy.z);
    float materialRoughness = min(
      max(roughness, 0.0525) + geometryRoughness,
      1.0
    );

    vec3 diffuseContribution = diffuse * (1.0 - metalness);
    vec3 specularColor = vec3(0.04);
    vec3 specularColorBlended = mix(specularColor, diffuse, metalness);
    float specularF90 = 1.0;

    vec3 directDiffuse = vec3(0.0);
    vec3 directSpecular = vec3(0.0);

    vec3 primaryDirection = normalize(primaryLightDirection);
    float primaryDotNL = saturateValue(dot(normal, primaryDirection));
    vec3 primaryIrradiance = primaryDotNL * primaryLightColor;
    directSpecular += primaryIrradiance * BRDF_GGX_Multiscatter(
      primaryDirection, viewDir, normal, specularColorBlended, specularF90,
      materialRoughness
    );
    directDiffuse += primaryIrradiance * BRDF_Lambert(diffuseContribution);

    vec3 fillDirection = normalize(fillLightDirection);
    float fillDotNL = saturateValue(dot(normal, fillDirection));
    vec3 fillIrradiance = fillDotNL * fillLightColor;
    directSpecular += fillIrradiance * BRDF_GGX_Multiscatter(
      fillDirection, viewDir, normal, specularColorBlended, specularF90,
      materialRoughness
    );
    directDiffuse += fillIrradiance * BRDF_Lambert(diffuseContribution);

    vec3 irradiance = ambientLightColor + getIBLIrradiance(normal);
    vec3 radiance = getIBLRadiance(viewDir, normal, materialRoughness);

    vec3 singleScatteringDielectric = vec3(0.0);
    vec3 multiScatteringDielectric = vec3(0.0);
    vec3 singleScatteringMetallic = vec3(0.0);
    vec3 multiScatteringMetallic = vec3(0.0);

    computeMultiscattering(
      normal, viewDir, specularColor, specularF90, materialRoughness,
      singleScatteringDielectric, multiScatteringDielectric
    );
    computeMultiscattering(
      normal, viewDir, diffuse, specularF90, materialRoughness,
      singleScatteringMetallic, multiScatteringMetallic
    );

    vec3 singleScattering = mix(
      singleScatteringDielectric, singleScatteringMetallic, metalness
    );
    vec3 multiScattering = mix(
      multiScatteringDielectric, multiScatteringMetallic, metalness
    );

    vec3 totalScatteringDielectric =
      singleScatteringDielectric + multiScatteringDielectric;
    vec3 indirectDiffuseColor =
      diffuseContribution * (1.0 - totalScatteringDielectric);

    vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;

    vec3 indirectSpecular = radiance * singleScattering;
    indirectSpecular += multiScattering * cosineWeightedIrradiance;
    vec3 indirectDiffuse = indirectDiffuseColor * cosineWeightedIrradiance;

    vec3 totalDiffuse = directDiffuse + indirectDiffuse;
    vec3 totalSpecular = directSpecular + indirectSpecular;

    #ifdef USE_TRANSMISSION

      // World-space refraction, sampled once per channel per sample so the
      // ior offset produces the authored chromatic split.
      vec3 worldNormal = inverseTransformDirection(normal, viewMatrix);
      vec3 worldViewDir = normalize(cameraPosition - vWorldPosition);
      float runningSeed = 0.0;
      float randomCoords = rand(runningSeed++);
      float thicknessSmear =
        thickness * max(pow(materialRoughness, 0.33), anisotropicBlur);
      vec3 transmission = vec3(0.0);

      for (int i = 0; i < TRANSMISSION_SAMPLES; i++) {
        float sampleIndex = float(i);
        vec3 jitter = normalize(vec3(
          rand(runningSeed++) - 0.5,
          rand(runningSeed++) - 0.5,
          rand(runningSeed++) - 0.5
        ));
        vec3 sampleNorm = normalize(
          worldNormal +
          materialRoughness * materialRoughness * 2.0 * jitter *
          pow(rand(runningSeed++), 0.33)
        );

        float sampleThickness = thickness +
          thicknessSmear * (sampleIndex + randomCoords) /
          float(TRANSMISSION_SAMPLES);
        float aberration =
          (sampleIndex + randomCoords) / float(TRANSMISSION_SAMPLES);

        transmission.r += getIBLVolumeRefraction(
          sampleNorm, worldViewDir, diffuse, specularColorBlended,
          specularF90, materialRoughness, ior, sampleThickness
        ).r;
        transmission.g += getIBLVolumeRefraction(
          sampleNorm, worldViewDir, diffuse, specularColorBlended,
          specularF90, materialRoughness,
          ior * (1.0 + chromaticAberration * aberration), sampleThickness
        ).g;
        transmission.b += getIBLVolumeRefraction(
          sampleNorm, worldViewDir, diffuse, specularColorBlended,
          specularF90, materialRoughness,
          ior * (1.0 + 2.0 * chromaticAberration * aberration), sampleThickness
        ).b;
      }

      totalDiffuse = transmission / float(TRANSMISSION_SAMPLES);

    #endif

    vec3 outgoingLight = totalDiffuse + totalSpecular;

    #ifdef USE_TRANSMISSION

      // Clearcoat is 1 for every glass surface these scenes author.
      vec3 clearcoatF0 = vec3(0.04);
      float clearcoatF90 = 1.0;
      float clearcoatAlpha = pow2(clearcoatRoughness);
      vec3 clearcoatSpecular = vec3(0.0);

      vec3 ccHalfPrimary = normalize(primaryDirection + viewDir);
      clearcoatSpecular += primaryIrradiance * (
        F_Schlick(clearcoatF0, clearcoatF90,
          saturateValue(dot(viewDir, ccHalfPrimary))) *
        V_GGX_SmithCorrelated(clearcoatAlpha, primaryDotNL,
          saturateValue(dot(normal, viewDir))) *
        D_GGX(clearcoatAlpha, saturateValue(dot(normal, ccHalfPrimary)))
      );

      vec3 ccHalfFill = normalize(fillDirection + viewDir);
      clearcoatSpecular += fillIrradiance * (
        F_Schlick(clearcoatF0, clearcoatF90,
          saturateValue(dot(viewDir, ccHalfFill))) *
        V_GGX_SmithCorrelated(clearcoatAlpha, fillDotNL,
          saturateValue(dot(normal, viewDir))) *
        D_GGX(clearcoatAlpha, saturateValue(dot(normal, ccHalfFill)))
      );

      clearcoatSpecular += getIBLRadiance(viewDir, normal, clearcoatRoughness) *
        EnvironmentBRDF(
          normal, viewDir, clearcoatF0, clearcoatF90, clearcoatRoughness
        );

      float dotNVcc = saturateValue(dot(normal, viewDir));
      vec3 Fcc = F_Schlick(clearcoatF0, clearcoatF90, dotNVcc);
      outgoingLight = outgoingLight * (1.0 - clearcoatAmount * Fcc) +
        clearcoatSpecular * clearcoatAmount;

    #endif

    fragColor = vec4(outgoingLight, 1.0);
  }
`,
};
