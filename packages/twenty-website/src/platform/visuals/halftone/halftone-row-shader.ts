// The legacy row-based halftone composite (the hourglass's authored look):
// horizontal dash rows with elliptical caps, wave drift, glow halo. Ported
// verbatim from the old hourglass pipeline.
export const HALFTONE_ROW_SHADER = {
  fragment: /* glsl */ `
  precision highp float;

  uniform sampler2D tScene;
  uniform sampler2D tGlow;
  uniform vec2 resolution;
  uniform float numRows;
  uniform float glowStr;
  uniform float contrast;
  uniform float power;
  uniform float shading;
  uniform float baseInk;
  uniform float maxBar;
  uniform float rowMerge;
  uniform float cellRatio;
  uniform float cutoff;
  uniform float highlightOpen;
  uniform float shadowGrouping;
  uniform float shadowCrush;
  uniform vec3 dashColor;
  uniform float time;
  uniform float waveAmount;
  uniform float waveSpeed;
  uniform float distanceScale;

  varying vec2 vUv;

  void main() {
    float rowH = resolution.y / (numRows * distanceScale);
    float row = floor(gl_FragCoord.y / rowH);
    float rowFrac = gl_FragCoord.y / rowH - row;
    float rowV = (row + 0.5) * rowH / resolution.y;
    float dy = abs(rowFrac - 0.5);

    float waveOffset = waveAmount * sin(time * waveSpeed + row * 0.5) * rowH;
    float effectiveX = gl_FragCoord.x + waveOffset;
    float cellW = rowH * cellRatio;
    float cellIdx = floor(effectiveX / cellW);
    float cellFrac = (effectiveX - cellIdx * cellW) / cellW;
    float cellU = (cellIdx + 0.5) * cellW / resolution.x;

    vec2 sampleUv = vec2(
      clamp(cellU, 0.0, 1.0),
      clamp(rowV, 0.0, 1.0)
    );

    vec4 sceneSample = texture2D(tScene, sampleUv);
    vec4 glowCell = texture2D(tGlow, sampleUv);

    float mask = smoothstep(0.02, 0.08, sceneSample.a);
    float lum = dot(sceneSample.rgb, vec3(0.299, 0.587, 0.114));
    float avgLum = dot(glowCell.rgb, vec3(0.299, 0.587, 0.114));
    float detail = lum - avgLum;

    float litLum = lum + max(detail, 0.0) * shading
      - max(-detail, 0.0) * shading * 0.55;
    litLum = clamp((litLum - cutoff) / max(1.0 - cutoff, 0.001), 0.0, 1.0);
    litLum = pow(litLum, max(contrast, 0.25));

    float darkness = 1.0 - litLum;
    float groupedLum = clamp((avgLum - cutoff) / max(1.0 - cutoff, 0.001), 0.0, 1.0);
    groupedLum = pow(groupedLum, max(contrast * 0.9, 0.25));
    float groupedDarkness = 1.0 - groupedLum;
    darkness = mix(darkness, max(darkness, groupedDarkness), shadowGrouping);
    darkness = clamp(
      (darkness - highlightOpen) / max(1.0 - highlightOpen, 0.001),
      0.0,
      1.0
    );

    float shadowMask = smoothstep(0.42, 0.96, darkness);
    darkness = mix(darkness, mix(darkness, 1.0, shadowMask), shadowCrush);

    float inkBase = baseInk * smoothstep(0.03, 0.24, darkness);
    float ink = mix(inkBase, 1.0, darkness);
    float fill = pow(ink, 1.05) * power;
    fill = clamp(fill, 0.0, 1.0) * mask;

    float dynamicBarHalf = mix(0.08, maxBar, smoothstep(0.03, 0.85, ink));
    float dynamicBarHalfY = min(
      dynamicBarHalf + rowMerge * smoothstep(0.42, 0.98, ink),
      0.78
    );
    float dx2 = abs(cellFrac - 0.5);
    float halfFill = fill * 0.5;
    float bodyHalfW = max(halfFill - dynamicBarHalf * (rowH / cellW), 0.0);
    float capRX = dynamicBarHalf * rowH;
    float capRY = dynamicBarHalfY * rowH;

    float inDash = 0.0;
    if (dx2 <= bodyHalfW) {
      float edgeDist = dynamicBarHalfY - dy;
      inDash = smoothstep(-0.03, 0.03, edgeDist);
    } else {
      float cdx = (dx2 - bodyHalfW) * cellW;
      float cdy = dy * rowH;
      float ellipseDist = sqrt(
        (cdx * cdx) / max(capRX * capRX, 0.0001) +
        (cdy * cdy) / max(capRY * capRY, 0.0001)
      );
      inDash = 1.0 - smoothstep(1.0 - 0.08, 1.0 + 0.08, ellipseDist);
    }

    inDash *= step(0.001, ink) * mask;
    inDash *= 1.0 + 0.03 * sin(time * 0.8 + row * 0.1);

    vec4 glow = texture2D(tGlow, vUv);
    float glowLum = dot(glow.rgb, vec3(0.299, 0.587, 0.114));
    float halo = glowLum * glowStr * 0.25 * (1.0 - inDash);
    float sharp = smoothstep(0.3, 0.5, inDash + halo);
    vec3 color = dashColor * sharp;

    gl_FragColor = vec4(color, sharp);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`,
};
