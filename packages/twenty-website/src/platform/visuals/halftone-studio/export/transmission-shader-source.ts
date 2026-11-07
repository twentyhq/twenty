// Adapted from MeshTransmissionMaterial in @react-three/drei (MIT): see DREI_LICENSE_NOTICE.
const HALFTONE_TRANSMISSION_SHADER_PREFIX = String.raw`
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
`;

const HALFTONE_TRANSMISSION_PARS_FRAGMENT = String.raw`
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
`;

const HALFTONE_TRANSMISSION_FRAGMENT_TEMPLATE = String.raw`
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

for (float i = 0.0; i < __SAMPLES__.0; i++) {
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
    material.thickness + thicknessSmear * (i + randomCoords) / float(__SAMPLES__),
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
    material.ior * (1.0 + chromaticAberration * (i + randomCoords) / float(__SAMPLES__)),
    material.thickness + thicknessSmear * (i + randomCoords) / float(__SAMPLES__),
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
    material.ior * (1.0 + 2.0 * chromaticAberration * (i + randomCoords) / float(__SAMPLES__)),
    material.thickness + thicknessSmear * (i + randomCoords) / float(__SAMPLES__),
    material.attenuationColor,
    material.attenuationDistance
  ).b;

  transmission.r += transmissionR;
  transmission.g += transmissionG;
  transmission.b += transmissionB;
}

transmission /= __SAMPLES__.0;
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
`;

export const HALFTONE_TRANSMISSION_SHADER_SOURCE = {
  fragmentTemplate: HALFTONE_TRANSMISSION_FRAGMENT_TEMPLATE,
  parsFragment: HALFTONE_TRANSMISSION_PARS_FRAGMENT,
  prefix: HALFTONE_TRANSMISSION_SHADER_PREFIX,
};
