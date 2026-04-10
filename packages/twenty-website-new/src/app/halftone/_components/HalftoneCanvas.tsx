'use client';

import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { styled } from '@linaria/react';
import { type MutableRefObject, useEffect, useRef } from 'react';
import * as THREE from 'three';

type HalftoneSourceMode = 'shape' | 'image';
type HalftoneRotateAxis =
  | 'x'
  | 'y'
  | 'z'
  | 'xy'
  | '-x'
  | '-y'
  | '-z'
  | '-xy';
type HalftoneRotatePreset = 'axis' | 'lissajous' | 'orbit' | 'tumble';

interface HalftoneLightingSettings {
  intensity: number;
  fillIntensity: number;
  ambientIntensity: number;
  angleDegrees: number;
  height: number;
}

interface HalftoneMaterialSettings {
  roughness: number;
  metalness: number;
}

interface HalftoneEffectSettings {
  enabled: boolean;
  numRows: number;
  contrast: number;
  power: number;
  shading: number;
  baseInk: number;
  maxBar: number;
  rowMerge: number;
  cellRatio: number;
  cutoff: number;
  highlightOpen: number;
  shadowGrouping: number;
  shadowCrush: number;
  dashColor: string;
}

interface HalftoneBackgroundSettings {
  transparent: boolean;
  color: string;
}

interface HalftoneAnimationSettings {
  autoRotateEnabled: boolean;
  breatheEnabled: boolean;
  cameraParallaxEnabled: boolean;
  followHoverEnabled: boolean;
  followDragEnabled: boolean;
  floatEnabled: boolean;
  hoverLightEnabled: boolean;
  dragFlowEnabled: boolean;
  lightSweepEnabled: boolean;
  rotateEnabled: boolean;
  autoSpeed: number;
  autoWobble: number;
  breatheAmount: number;
  breatheSpeed: number;
  cameraParallaxAmount: number;
  cameraParallaxEase: number;
  driftAmount: number;
  hoverRange: number;
  hoverEase: number;
  hoverReturn: boolean;
  dragSens: number;
  dragFriction: number;
  dragMomentum: boolean;
  rotateAxis: HalftoneRotateAxis;
  rotatePreset: HalftoneRotatePreset;
  rotateSpeed: number;
  rotatePingPong: boolean;
  floatAmplitude: number;
  floatSpeed: number;
  lightSweepHeightRange: number;
  lightSweepRange: number;
  lightSweepSpeed: number;
  springDamping: number;
  springReturnEnabled: boolean;
  springStrength: number;
  hoverLightIntensity: number;
  hoverLightRadius: number;
  dragFlowDecay: number;
  dragFlowRadius: number;
  dragFlowStrength: number;
  hoverWarpStrength: number;
  hoverWarpRadius: number;
  dragWarpStrength: number;
  waveEnabled: boolean;
  waveSpeed: number;
  waveAmount: number;
}

interface HalftoneExportPose {
  autoElapsed: number;
  rotateElapsed: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  targetRotationX: number;
  targetRotationY: number;
  timeElapsed: number;
}

interface HalftoneStudioSettings {
  sourceMode: HalftoneSourceMode;
  shapeKey: string;
  lighting: HalftoneLightingSettings;
  material: HalftoneMaterialSettings;
  halftone: HalftoneEffectSettings;
  background: HalftoneBackgroundSettings;
  animation: HalftoneAnimationSettings;
}

const VIRTUAL_RENDER_HEIGHT = 768;

const passThroughVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const blurFragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D tInput;
  uniform vec2 dir;
  uniform vec2 res;

  varying vec2 vUv;

  void main() {
    vec4 sum = vec4(0.0);
    vec2 px = dir / res;

    float w[5];
    w[0] = 0.227027;
    w[1] = 0.1945946;
    w[2] = 0.1216216;
    w[3] = 0.054054;
    w[4] = 0.016216;

    sum += texture2D(tInput, vUv) * w[0];

    for (int i = 1; i < 5; i++) {
      float fi = float(i) * 3.0;
      sum += texture2D(tInput, vUv + px * fi) * w[i];
      sum += texture2D(tInput, vUv - px * fi) * w[i];
    }

    gl_FragColor = sum;
  }
`;

const imagePassthroughFragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D tImage;
  uniform vec2 imageSize;
  uniform vec2 viewportSize;
  uniform float zoom;

  varying vec2 vUv;

  void main() {
    float imageAspect = imageSize.x / imageSize.y;
    float viewAspect = viewportSize.x / viewportSize.y;

    vec2 uv = vUv;

    // Contain: show full image, letterbox/pillarbox as needed
    if (imageAspect > viewAspect) {
      float scale = viewAspect / imageAspect;
      uv.y = (uv.y - 0.5) / scale + 0.5;
    } else {
      float scale = imageAspect / viewAspect;
      uv.x = (uv.x - 0.5) / scale + 0.5;
    }

    uv = (uv - 0.5) / zoom + 0.5;

    float inBounds = step(0.0, uv.x) * step(uv.x, 1.0)
                   * step(0.0, uv.y) * step(uv.y, 1.0);

    vec4 color = texture2D(tImage, clamp(uv, 0.0, 1.0));

    gl_FragColor = vec4(color.rgb, inBounds);
  }
`;

const halftoneFragmentShader = /* glsl */ `
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
  uniform vec2 interactionUv;
  uniform vec2 interactionVelocity;
  uniform vec2 dragOffset;
  uniform float hoverLightStrength;
  uniform float hoverLightRadius;
  uniform float hoverFlowStrength;
  uniform float hoverFlowRadius;
  uniform float dragFlowStrength;
  uniform float dragFlowRadius;
  uniform float cropToBounds;

  varying vec2 vUv;

  void main() {
    // Crop to image bounds: discard fragments outside source image (image mode only)
    if (cropToBounds > 0.5) {
      vec4 boundsCheck = texture2D(tScene, vUv);
      if (boundsCheck.a < 0.01) {
        gl_FragColor = vec4(0.0);
        return;
      }
    }

    float baseRowH = resolution.y / (numRows * distanceScale);
    vec2 pointerPx = interactionUv * resolution;
    vec2 fragDelta = gl_FragCoord.xy - pointerPx;
    float fragDist = length(fragDelta);
    vec2 radialDir = fragDist > 0.001 ? fragDelta / fragDist : vec2(0.0, 1.0);
    float velocityMagnitude = length(interactionVelocity);
    vec2 motionDir = velocityMagnitude > 0.001
      ? interactionVelocity / velocityMagnitude
      : vec2(0.0, 0.0);
    float motionBias = velocityMagnitude > 0.001
      ? dot(-radialDir, motionDir) * 0.5 + 0.5
      : 0.5;

    float hoverLightMask = 0.0;
    if (hoverLightStrength > 0.0) {
      float lightRadiusPx = hoverLightRadius * resolution.y;
      hoverLightMask = smoothstep(lightRadiusPx, 0.0, fragDist);
    }

    float hoverFlowMask = 0.0;
    if (hoverFlowStrength > 0.0) {
      float hoverRadiusPx = hoverFlowRadius * resolution.y;
      hoverFlowMask = smoothstep(hoverRadiusPx, 0.0, fragDist);
    }

    float dragFlowMask = 0.0;
    if (dragFlowStrength > 0.0) {
      float dragRadiusPx = dragFlowRadius * resolution.y;
      dragFlowMask = smoothstep(dragRadiusPx, 0.0, fragDist);
    }

    vec2 hoverDisplacement =
      radialDir * hoverFlowStrength * hoverFlowMask * baseRowH * 0.55 +
      motionDir * hoverFlowStrength * hoverFlowMask * (0.4 + motionBias) * baseRowH * 1.15;
    vec2 dragDisplacement = dragOffset * dragFlowMask * dragFlowStrength * 0.8;
    vec2 effectCoord = gl_FragCoord.xy + hoverDisplacement + dragDisplacement;

    float densityBoost =
      hoverFlowStrength * hoverFlowMask * 0.22 +
      dragFlowStrength * dragFlowMask * 0.16;
    float rowH = baseRowH / (1.0 + densityBoost);

    float offsetY = effectCoord.y;
    float row = floor(offsetY / rowH);
    float rowFrac = offsetY / rowH - row;
    float rowV = (row + 0.5) * rowH / resolution.y;
    float dy = abs(rowFrac - 0.5);

    float waveOffset = waveAmount * sin(time * waveSpeed + row * 0.5) * rowH;
    float effectiveX = effectCoord.x + waveOffset;

    float localCellRatio = cellRatio * (
      1.0 +
      hoverFlowStrength * hoverFlowMask * 0.08 +
      dragFlowStrength * dragFlowMask * 0.1 * motionBias
    );
    float cellW = rowH * localCellRatio;
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
    float lightLift =
      hoverLightStrength * hoverLightMask * mix(0.78, 1.18, motionBias) * 0.34;
    float lightFocus = hoverLightStrength * hoverLightMask * 0.12;
    litLum = clamp(litLum + lightLift, 0.0, 1.0);
    litLum = clamp((litLum - cutoff) / max(1.0 - cutoff, 0.001), 0.0, 1.0);
    litLum = pow(litLum, max(contrast - lightFocus, 0.25));

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
    darkness = mix(
      darkness,
      mix(darkness, 1.0, shadowMask),
      shadowCrush
    );

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
`;

const REFERENCE_PREVIEW_DISTANCE = 4;
const IMAGE_POINTER_FOLLOW = 0.38;
const IMAGE_POINTER_VELOCITY_DAMPING = 0.82;
const IMAGE_DRAG_OFFSET_LIMIT = 0.08;
const MAX_PREVIEW_PIXEL_RATIO = 2;

function createEnvironmentTexture(renderer: THREE.WebGLRenderer) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const environmentTexture = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0.04,
  ).texture;
  pmremGenerator.dispose();

  return environmentTexture;
}

const CanvasMount = styled.div<{ $background: string }>`
  background: ${(props) => props.$background};
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

export type HalftoneSnapshotFn = (
  width: number,
  height: number,
) => Promise<Blob | null>;

type HalftoneCanvasProps = {
  geometry: THREE.BufferGeometry | null;
  initialPose?: Partial<HalftoneExportPose>;
  imageElement: HTMLImageElement | null;
  onFirstInteraction: () => void;
  onPoseChange: (pose: HalftoneExportPose) => void;
  previewDistance: number;
  settings: HalftoneStudioSettings;
  snapshotRef?: MutableRefObject<HalftoneSnapshotFn | null>;
};

type SceneResources = {
  ambientLight: THREE.AmbientLight;
  blurHorizontalMaterial: THREE.ShaderMaterial;
  blurHorizontalScene: THREE.Scene;
  blurTargetA: THREE.WebGLRenderTarget;
  blurTargetB: THREE.WebGLRenderTarget;
  blurVerticalMaterial: THREE.ShaderMaterial;
  blurVerticalScene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  canvas: HTMLCanvasElement;
  environmentTexture: THREE.Texture;
  fillLight: THREE.DirectionalLight;
  fullScreenGeometry: THREE.PlaneGeometry;
  halftoneMaterial: THREE.ShaderMaterial;
  imageMaterial: THREE.ShaderMaterial;
  imageScene: THREE.Scene;
  imageTexture: THREE.Texture | null;
  material: THREE.MeshPhysicalMaterial;
  mesh: THREE.Mesh;
  orthographicCamera: THREE.OrthographicCamera;
  postScene: THREE.Scene;
  primaryLight: THREE.DirectionalLight;
  renderer: THREE.WebGLRenderer;
  scene3d: THREE.Scene;
  sceneTarget: THREE.WebGLRenderTarget;
};

type InteractionState = {
  activePointerId: number | null;
  autoElapsed: number;
  dragOffsetX: number;
  dragOffsetY: number;
  dragging: boolean;
  mouseX: number;
  mouseY: number;
  pointerInside: boolean;
  pointerVelocityX: number;
  pointerVelocityY: number;
  pointerX: number;
  pointerY: number;
  rotateElapsed: number;
  rotationX: number;
  rotationVelocityX: number;
  rotationY: number;
  rotationVelocityY: number;
  rotationZ: number;
  rotationVelocityZ: number;
  smoothedMouseX: number;
  smoothedMouseY: number;
  targetRotationX: number;
  targetRotationY: number;
  velocityX: number;
  velocityY: number;
};

type PixelBounds = {
  maxX: number;
  maxY: number;
  minX: number;
  minY: number;
};

function createRenderTarget(width: number, height: number) {
  return new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  });
}

function createInteractionState(
  initialPose?: Partial<HalftoneExportPose>,
): InteractionState {
  return {
    activePointerId: null,
    autoElapsed: initialPose?.autoElapsed ?? 0,
    dragOffsetX: 0,
    dragOffsetY: 0,
    dragging: false,
    mouseX: 0.5,
    mouseY: 0.5,
    pointerInside: false,
    pointerVelocityX: 0,
    pointerVelocityY: 0,
    pointerX: 0,
    pointerY: 0,
    rotateElapsed: initialPose?.rotateElapsed ?? 0,
    rotationX: initialPose?.rotationX ?? 0,
    rotationVelocityX: 0,
    rotationY: initialPose?.rotationY ?? 0,
    rotationVelocityY: 0,
    rotationZ: initialPose?.rotationZ ?? 0,
    rotationVelocityZ: 0,
    smoothedMouseX: 0.5,
    smoothedMouseY: 0.5,
    targetRotationX: initialPose?.targetRotationX ?? 0,
    targetRotationY: initialPose?.targetRotationY ?? 0,
    velocityX: 0,
    velocityY: 0,
  };
}

function getAlphaCropBounds(
  pixels: Uint8Array,
  width: number,
  height: number,
  threshold = 8,
  padding = 1,
): PixelBounds | null {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = pixels[(y * width + x) * 4 + 3];

      if (alpha <= threshold) {
        continue;
      }

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) {
    return null;
  }

  return {
    minX: Math.max(minX - padding, 0),
    minY: Math.max(minY - padding, 0),
    maxX: Math.min(maxX + padding, width - 1),
    maxY: Math.min(maxY + padding, height - 1),
  };
}

function getCanvasCursor(
  settings: HalftoneStudioSettings,
  isDragging: boolean,
) {
  if (settings.sourceMode === 'image') {
    if (settings.animation.dragFlowEnabled) {
      return isDragging ? 'grabbing' : 'crosshair';
    }

    return 'crosshair';
  }

  if (
    settings.animation.followDragEnabled ||
    settings.animation.autoRotateEnabled
  ) {
    return isDragging ? 'grabbing' : 'grab';
  }

  return 'default';
}

function setPrimaryLightPosition(
  light: THREE.DirectionalLight,
  angleDegrees: number,
  height: number,
) {
  const lightAngle = (angleDegrees * Math.PI) / 180;
  light.position.set(
    Math.cos(lightAngle) * 5,
    height,
    Math.sin(lightAngle) * 5,
  );
}

function getImagePreviewZoom(previewDistance: number) {
  return REFERENCE_PREVIEW_DISTANCE / Math.max(previewDistance, 0.001);
}

function updateLighting(
  resources: SceneResources,
  settings: HalftoneStudioSettings,
) {
  resources.primaryLight.intensity = settings.lighting.intensity;
  setPrimaryLightPosition(
    resources.primaryLight,
    settings.lighting.angleDegrees,
    settings.lighting.height,
  );
  resources.fillLight.intensity = settings.lighting.fillIntensity;
  resources.ambientLight.intensity = settings.lighting.ambientIntensity;
}

function updateMaterial(
  resources: SceneResources,
  settings: HalftoneStudioSettings,
) {
  resources.material.roughness = settings.material.roughness;
  resources.material.metalness = settings.material.metalness;
  resources.material.needsUpdate = true;
}

function updateHalftone(
  resources: SceneResources,
  settings: HalftoneStudioSettings,
) {
  resources.halftoneMaterial.uniforms.numRows.value = settings.halftone.numRows;
  resources.halftoneMaterial.uniforms.contrast.value =
    settings.halftone.contrast;
  resources.halftoneMaterial.uniforms.power.value = settings.halftone.power;
  resources.halftoneMaterial.uniforms.shading.value = settings.halftone.shading;
  resources.halftoneMaterial.uniforms.baseInk.value = settings.halftone.baseInk;
  resources.halftoneMaterial.uniforms.maxBar.value = settings.halftone.maxBar;
  resources.halftoneMaterial.uniforms.rowMerge.value =
    settings.halftone.rowMerge;
  resources.halftoneMaterial.uniforms.cellRatio.value =
    settings.halftone.cellRatio;
  resources.halftoneMaterial.uniforms.cutoff.value = settings.halftone.cutoff;
  resources.halftoneMaterial.uniforms.highlightOpen.value =
    settings.halftone.highlightOpen;
  resources.halftoneMaterial.uniforms.shadowGrouping.value =
    settings.halftone.shadowGrouping;
  resources.halftoneMaterial.uniforms.shadowCrush.value =
    settings.halftone.shadowCrush;
  (resources.halftoneMaterial.uniforms.dashColor.value as THREE.Color).set(
    settings.halftone.dashColor,
  );
  resources.halftoneMaterial.uniforms.waveAmount.value =
    settings.animation.waveEnabled && settings.sourceMode !== 'image'
      ? settings.animation.waveAmount
      : 0;
  resources.halftoneMaterial.uniforms.waveSpeed.value =
    settings.animation.waveSpeed;
}

function syncResources(
  resources: SceneResources,
  settings: HalftoneStudioSettings,
) {
  updateLighting(resources, settings);
  updateMaterial(resources, settings);
  updateHalftone(resources, settings);
}

function applySpringStep(
  current: number,
  target: number,
  velocity: number,
  strength: number,
  damping: number,
) {
  const nextVelocity = (velocity + (target - current) * strength) * damping;
  const nextValue = current + nextVelocity;

  return {
    value: nextValue,
    velocity: nextVelocity,
  };
}

function resetInteractionState(
  interactionState: InteractionState,
  animation: HalftoneStudioSettings['animation'],
) {
  interactionState.activePointerId = null;
  interactionState.dragging = false;
  interactionState.dragOffsetX = 0;
  interactionState.dragOffsetY = 0;
  interactionState.mouseX = 0.5;
  interactionState.mouseY = 0.5;
  interactionState.pointerInside = false;
  interactionState.pointerVelocityX = 0;
  interactionState.pointerVelocityY = 0;
  interactionState.smoothedMouseX = 0.5;
  interactionState.smoothedMouseY = 0.5;
  interactionState.targetRotationX = 0;
  interactionState.targetRotationY = 0;
  interactionState.velocityX = 0;
  interactionState.velocityY = 0;
  interactionState.rotationVelocityX = 0;
  interactionState.rotationVelocityY = 0;
  interactionState.rotationVelocityZ = 0;

  if (animation.autoRotateEnabled) {
    interactionState.autoElapsed = 0;
  }
}

export function HalftoneCanvas({
  geometry,
  initialPose,
  imageElement,
  onFirstInteraction,
  onPoseChange,
  previewDistance,
  settings,
  snapshotRef,
}: HalftoneCanvasProps) {
  const mountReference = useRef<HTMLDivElement>(null);
  const resourcesReference = useRef<SceneResources | null>(null);
  const settingsReference = useRef(settings);
  const interactionReference = useRef<InteractionState>(
    createInteractionState(initialPose),
  );
  const animationReference = useRef(settings.animation);
  const didInteractReference = useRef(false);
  const initialPoseReference = useRef(initialPose);
  const poseChangeReference = useRef(onPoseChange);
  const previewDistanceReference = useRef(previewDistance);

  useEffect(() => {
    initialPoseReference.current = initialPose;
    interactionReference.current = createInteractionState(initialPose);
  }, [initialPose]);

  useEffect(() => {
    poseChangeReference.current = onPoseChange;
  }, [onPoseChange]);

  useEffect(() => {
    previewDistanceReference.current = previewDistance;

    const resources = resourcesReference.current;

    if (!resources) {
      return;
    }

    resources.camera.position.z = previewDistance;
  }, [previewDistance]);

  useEffect(() => {
    settingsReference.current = settings;

    const resources = resourcesReference.current;

    if (!resources) {
      animationReference.current = settings.animation;
      return;
    }

    const prev = animationReference.current;
    const next = settings.animation;

    if (
      prev.autoRotateEnabled !== next.autoRotateEnabled ||
      prev.followHoverEnabled !== next.followHoverEnabled ||
      prev.followDragEnabled !== next.followDragEnabled ||
      prev.hoverLightEnabled !== next.hoverLightEnabled ||
      prev.dragFlowEnabled !== next.dragFlowEnabled
    ) {
      resetInteractionState(interactionReference.current, next);
    }

    if (
      (!prev.rotateEnabled && next.rotateEnabled) ||
      prev.rotatePreset !== next.rotatePreset
    ) {
      interactionReference.current.rotateElapsed = 0;
    }

    animationReference.current = settings.animation;
    syncResources(resources, settings);
    resources.canvas.style.cursor = getCanvasCursor(
      settings,
      interactionReference.current.dragging,
    );
  }, [settings]);

  useEffect(() => {
    const resources = resourcesReference.current;

    if (!resources || !geometry) {
      return;
    }

    resources.mesh.geometry = geometry;
  }, [geometry]);

  useEffect(() => {
    const resources = resourcesReference.current;

    if (!resources) {
      return;
    }

    if (imageElement) {
      if (resources.imageTexture) {
        resources.imageTexture.dispose();
      }

      const texture = new THREE.Texture(imageElement);
      texture.needsUpdate = true;
      texture.colorSpace = THREE.SRGBColorSpace;
      resources.imageTexture = texture;
      resources.imageMaterial.uniforms.tImage.value = texture;
      resources.imageMaterial.uniforms.imageSize.value.set(
        imageElement.naturalWidth,
        imageElement.naturalHeight,
      );
    } else {
      if (resources.imageTexture) {
        resources.imageTexture.dispose();
        resources.imageTexture = null;
        resources.imageMaterial.uniforms.tImage.value = null;
      }
    }
  }, [imageElement]);

  useEffect(() => {
    const container = mountReference.current;

    if (!container || !geometry) {
      return;
    }

    let animationFrameId = 0;
    let cancelled = false;

    const getWidth = () => Math.max(container.clientWidth, 1);
    const getHeight = () => Math.max(container.clientHeight, 1);
    const getVirtualHeight = () => Math.max(VIRTUAL_RENDER_HEIGHT, getHeight());
    const getVirtualWidth = () =>
      Math.max(
        Math.round(
          getVirtualHeight() * (getWidth() / Math.max(getHeight(), 1)),
        ),
        1,
      );
    const getRenderScale = () =>
      Math.min(window.devicePixelRatio || 1, MAX_PREVIEW_PIXEL_RATIO);
    const getRenderHeight = () =>
      Math.max(Math.round(getVirtualHeight() * getRenderScale()), 1);
    const getRenderWidth = () =>
      Math.max(Math.round(getVirtualWidth() * getRenderScale()), 1);

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(getRenderWidth(), getRenderHeight(), false);

    const canvas = renderer.domElement;
    canvas.style.cursor = getCanvasCursor(settingsReference.current, false);
    canvas.style.display = 'block';
    canvas.style.height = '100%';
    canvas.style.touchAction = 'none';
    canvas.style.width = '100%';
    container.appendChild(canvas);

    const environmentTexture = createEnvironmentTexture(renderer);

    const scene3d = new THREE.Scene();
    scene3d.background = null;

    const camera = new THREE.PerspectiveCamera(
      45,
      getWidth() / getHeight(),
      0.1,
      100,
    );
    camera.position.z = previewDistance;

    const primaryLight = new THREE.DirectionalLight(0xffffff, 1.5);
    scene3d.add(primaryLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.15);
    fillLight.position.set(-3, -1, 1);
    scene3d.add(fillLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.08);
    scene3d.add(ambientLight);

    const material = new THREE.MeshPhysicalMaterial({
      color: 0xd4d0c8,
      roughness: 0.42,
      metalness: 0.16,
      envMap: environmentTexture,
      envMapIntensity: 0.25,
      clearcoat: 0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.5,
      transmission: 0,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene3d.add(mesh);

    const sceneTarget = createRenderTarget(getRenderWidth(), getRenderHeight());
    const blurTargetA = createRenderTarget(getRenderWidth(), getRenderHeight());
    const blurTargetB = createRenderTarget(getRenderWidth(), getRenderHeight());
    const fullScreenGeometry = new THREE.PlaneGeometry(2, 2);
    const orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const blurHorizontalMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tInput: { value: null },
        dir: { value: new THREE.Vector2(1, 0) },
        res: {
          value: new THREE.Vector2(getRenderWidth(), getRenderHeight()),
        },
      },
      vertexShader: passThroughVertexShader,
      fragmentShader: blurFragmentShader,
    });

    const blurVerticalMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tInput: { value: null },
        dir: { value: new THREE.Vector2(0, 1) },
        res: {
          value: new THREE.Vector2(getRenderWidth(), getRenderHeight()),
        },
      },
      vertexShader: passThroughVertexShader,
      fragmentShader: blurFragmentShader,
    });

    const halftoneMaterial = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        tScene: { value: sceneTarget.texture },
        tGlow: { value: blurTargetB.texture },
        resolution: {
          value: new THREE.Vector2(getRenderWidth(), getRenderHeight()),
        },
        numRows: { value: settings.halftone.numRows },
        glowStr: { value: 0 },
        contrast: { value: settings.halftone.contrast },
        power: { value: settings.halftone.power },
        shading: { value: settings.halftone.shading },
        baseInk: { value: settings.halftone.baseInk },
        maxBar: { value: settings.halftone.maxBar },
        rowMerge: { value: settings.halftone.rowMerge },
        cellRatio: { value: settings.halftone.cellRatio },
        cutoff: { value: settings.halftone.cutoff },
        highlightOpen: { value: settings.halftone.highlightOpen },
        shadowGrouping: { value: settings.halftone.shadowGrouping },
        shadowCrush: { value: settings.halftone.shadowCrush },
        dashColor: { value: new THREE.Color(settings.halftone.dashColor) },
        time: { value: 0 },
        waveAmount: { value: 0 },
        waveSpeed: { value: 1 },
        distanceScale: { value: 1.0 },
        interactionUv: { value: new THREE.Vector2(0.5, 0.5) },
        interactionVelocity: { value: new THREE.Vector2(0, 0) },
        dragOffset: { value: new THREE.Vector2(0, 0) },
        hoverLightStrength: { value: 0 },
        hoverLightRadius: { value: 0.2 },
        hoverFlowStrength: { value: 0 },
        hoverFlowRadius: { value: 0.18 },
        dragFlowStrength: { value: 0 },
        dragFlowRadius: { value: 0.24 },
        cropToBounds: { value: 0 },
      },
      vertexShader: passThroughVertexShader,
      fragmentShader: halftoneFragmentShader,
    });

    const blurHorizontalScene = new THREE.Scene();
    blurHorizontalScene.add(
      new THREE.Mesh(fullScreenGeometry, blurHorizontalMaterial),
    );

    const blurVerticalScene = new THREE.Scene();
    blurVerticalScene.add(
      new THREE.Mesh(fullScreenGeometry, blurVerticalMaterial),
    );

    const postScene = new THREE.Scene();
    postScene.add(new THREE.Mesh(fullScreenGeometry, halftoneMaterial));

    const imageMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tImage: { value: null },
        imageSize: { value: new THREE.Vector2(1, 1) },
        viewportSize: {
          value: new THREE.Vector2(getRenderWidth(), getRenderHeight()),
        },
        zoom: { value: getImagePreviewZoom(previewDistance) },
      },
      vertexShader: passThroughVertexShader,
      fragmentShader: imagePassthroughFragmentShader,
    });

    const imageScene = new THREE.Scene();
    imageScene.add(new THREE.Mesh(fullScreenGeometry, imageMaterial));

    const resources: SceneResources = {
      ambientLight,
      blurHorizontalMaterial,
      blurHorizontalScene,
      blurTargetA,
      blurTargetB,
      blurVerticalMaterial,
      blurVerticalScene,
      camera,
      canvas,
      environmentTexture,
      fillLight,
      fullScreenGeometry,
      halftoneMaterial,
      imageMaterial,
      imageScene,
      imageTexture: null,
      material,
      mesh,
      orthographicCamera,
      postScene,
      primaryLight,
      renderer,
      scene3d,
      sceneTarget,
    };

    resourcesReference.current = resources;
    syncResources(resources, settingsReference.current);

    // Snapshot: render the current frame at arbitrary resolution and return a PNG blob
    const captureSnapshot: HalftoneSnapshotFn = async (
      snapshotWidth: number,
      snapshotHeight: number,
    ) => {
      const activeSettings = settingsReference.current;
      const isImage =
        activeSettings.sourceMode === 'image' &&
        resources.imageTexture !== null;

      // Create temporary render targets at export resolution
      const snapScene = createRenderTarget(snapshotWidth, snapshotHeight);
      const snapBlurA = createRenderTarget(snapshotWidth, snapshotHeight);
      const snapBlurB = createRenderTarget(snapshotWidth, snapshotHeight);

      // Save current renderer state
      const prevSize = renderer.getSize(new THREE.Vector2());

      // Resize renderer to snapshot resolution
      renderer.setSize(snapshotWidth, snapshotHeight, false);

      // Update material uniforms for snapshot resolution
      blurHorizontalMaterial.uniforms.res.value.set(
        snapshotWidth,
        snapshotHeight,
      );
      blurVerticalMaterial.uniforms.res.value.set(
        snapshotWidth,
        snapshotHeight,
      );
      halftoneMaterial.uniforms.resolution.value.set(
        snapshotWidth,
        snapshotHeight,
      );
      // Disable distance scaling and pointer effects for export
      halftoneMaterial.uniforms.distanceScale.value = 1.0;
      halftoneMaterial.uniforms.hoverLightStrength.value = 0;
      halftoneMaterial.uniforms.hoverFlowStrength.value = 0;
      halftoneMaterial.uniforms.dragFlowStrength.value = 0;
      halftoneMaterial.uniforms.interactionVelocity.value.set(0, 0);
      halftoneMaterial.uniforms.dragOffset.value.set(0, 0);
      halftoneMaterial.uniforms.cropToBounds.value = isImage ? 1 : 0;

      if (isImage) {
        imageMaterial.uniforms.viewportSize.value.set(
          snapshotWidth,
          snapshotHeight,
        );
        imageMaterial.uniforms.zoom.value = 1;
      } else {
        camera.aspect = snapshotWidth / snapshotHeight;
        camera.updateProjectionMatrix();
      }

      // Render scene to snapshot target
      renderer.setRenderTarget(snapScene);
      if (isImage) {
        renderer.render(imageScene, orthographicCamera);
      } else {
        renderer.render(scene3d, camera);
      }

      // Blur passes
      halftoneMaterial.uniforms.tScene.value = snapScene.texture;

      blurHorizontalMaterial.uniforms.tInput.value = snapScene.texture;
      renderer.setRenderTarget(snapBlurA);
      renderer.render(blurHorizontalScene, orthographicCamera);

      blurVerticalMaterial.uniforms.tInput.value = snapBlurA.texture;
      renderer.setRenderTarget(snapBlurB);
      renderer.render(blurVerticalScene, orthographicCamera);

      blurHorizontalMaterial.uniforms.tInput.value = snapBlurB.texture;
      renderer.setRenderTarget(snapBlurA);
      renderer.render(blurHorizontalScene, orthographicCamera);

      blurVerticalMaterial.uniforms.tInput.value = snapBlurA.texture;
      renderer.setRenderTarget(snapBlurB);
      renderer.render(blurVerticalScene, orthographicCamera);

      halftoneMaterial.uniforms.tGlow.value = snapBlurB.texture;

      // Final halftone render to a target we can read pixels from
      const outputTarget = createRenderTarget(snapshotWidth, snapshotHeight);
      renderer.setRenderTarget(outputTarget);
      renderer.clear();
      renderer.render(postScene, orthographicCamera);

      // Read pixels
      const pixelBuffer = new Uint8Array(snapshotWidth * snapshotHeight * 4);
      renderer.readRenderTargetPixels(
        outputTarget,
        0,
        0,
        snapshotWidth,
        snapshotHeight,
        pixelBuffer,
      );

      // Restore renderer state
      renderer.setSize(prevSize.x, prevSize.y, false);
      halftoneMaterial.uniforms.tScene.value = sceneTarget.texture;
      halftoneMaterial.uniforms.tGlow.value = blurTargetB.texture;
      blurHorizontalMaterial.uniforms.res.value.set(prevSize.x, prevSize.y);
      blurVerticalMaterial.uniforms.res.value.set(prevSize.x, prevSize.y);
      halftoneMaterial.uniforms.resolution.value.set(prevSize.x, prevSize.y);
      halftoneMaterial.uniforms.distanceScale.value = isImage
        ? 1
        : previewDistanceReference.current / REFERENCE_PREVIEW_DISTANCE;
      if (isImage) {
        imageMaterial.uniforms.viewportSize.value.set(prevSize.x, prevSize.y);
        imageMaterial.uniforms.zoom.value = getImagePreviewZoom(
          previewDistanceReference.current,
        );
      } else {
        camera.aspect = getWidth() / Math.max(getHeight(), 1);
        camera.updateProjectionMatrix();
      }

      // Dispose temporary targets
      snapScene.dispose();
      snapBlurA.dispose();
      snapBlurB.dispose();
      outputTarget.dispose();

      // Convert pixels to PNG via canvas
      // WebGL readPixels returns rows bottom-to-top, so flip vertically
      const flippedBuffer = new Uint8Array(snapshotWidth * snapshotHeight * 4);
      const rowSize = snapshotWidth * 4;
      for (let y = 0; y < snapshotHeight; y++) {
        const srcOffset = y * rowSize;
        const dstOffset = (snapshotHeight - 1 - y) * rowSize;
        flippedBuffer.set(
          pixelBuffer.subarray(srcOffset, srcOffset + rowSize),
          dstOffset,
        );
      }

      const cropBounds = getAlphaCropBounds(
        flippedBuffer,
        snapshotWidth,
        snapshotHeight,
      ) ?? {
        minX: 0,
        minY: 0,
        maxX: snapshotWidth - 1,
        maxY: snapshotHeight - 1,
      };
      const croppedWidth = cropBounds.maxX - cropBounds.minX + 1;
      const croppedHeight = cropBounds.maxY - cropBounds.minY + 1;
      const croppedBuffer = new Uint8ClampedArray(
        croppedWidth * croppedHeight * 4,
      );

      for (let y = 0; y < croppedHeight; y++) {
        const sourceStart =
          ((cropBounds.minY + y) * snapshotWidth + cropBounds.minX) * 4;
        const sourceEnd = sourceStart + croppedWidth * 4;
        const destinationStart = y * croppedWidth * 4;

        croppedBuffer.set(
          flippedBuffer.subarray(sourceStart, sourceEnd),
          destinationStart,
        );
      }

      const imageData = new ImageData(
        croppedBuffer,
        croppedWidth,
        croppedHeight,
      );
      const offscreen = document.createElement('canvas');
      offscreen.width = croppedWidth;
      offscreen.height = croppedHeight;
      const ctx = offscreen.getContext('2d');

      if (!ctx) {
        return null;
      }

      ctx.putImageData(imageData, 0, 0);

      return new Promise<Blob | null>((resolve) => {
        offscreen.toBlob((blob) => resolve(blob), 'image/png');
      });
    };

    if (snapshotRef) {
      snapshotRef.current = captureSnapshot;
    }

    const syncSize = () => {
      if (cancelled) {
        return;
      }

      const width = getWidth();
      const height = getHeight();
      const renderWidth = getRenderWidth();
      const renderHeight = getRenderHeight();

      renderer.setSize(renderWidth, renderHeight, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      sceneTarget.setSize(renderWidth, renderHeight);
      blurTargetA.setSize(renderWidth, renderHeight);
      blurTargetB.setSize(renderWidth, renderHeight);
      blurHorizontalMaterial.uniforms.res.value.set(renderWidth, renderHeight);
      blurVerticalMaterial.uniforms.res.value.set(renderWidth, renderHeight);
      halftoneMaterial.uniforms.resolution.value.set(renderWidth, renderHeight);
      imageMaterial.uniforms.viewportSize.value.set(renderWidth, renderHeight);
    };

    const resizeObserver = new ResizeObserver(syncSize);
    resizeObserver.observe(container);

    const updatePointerPosition = (
      event: PointerEvent,
      options?: { resetVelocity?: boolean },
    ) => {
      const interaction = interactionReference.current;
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);

      const nextMouseX = THREE.MathUtils.clamp(
        (event.clientX - rect.left) / width,
        0,
        1,
      );
      const nextMouseY = THREE.MathUtils.clamp(
        (event.clientY - rect.top) / height,
        0,
        1,
      );

      const deltaX = nextMouseX - interaction.mouseX;
      const deltaY = nextMouseY - interaction.mouseY;

      interaction.mouseX = nextMouseX;
      interaction.mouseY = nextMouseY;
      interaction.pointerInside =
        interaction.dragging ||
        (event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom);

      if (options?.resetVelocity) {
        interaction.pointerVelocityX = 0;
        interaction.pointerVelocityY = 0;
        interaction.smoothedMouseX = nextMouseX;
        interaction.smoothedMouseY = nextMouseY;
      } else {
        interaction.pointerVelocityX = deltaX;
        interaction.pointerVelocityY = deltaY;
      }

      return { deltaX, deltaY };
    };

    const releasePointerCapture = (pointerId: number | null) => {
      if (pointerId === null) {
        return;
      }

      if (!canvas.hasPointerCapture(pointerId)) {
        return;
      }

      try {
        canvas.releasePointerCapture(pointerId);
      } catch {
        // Ignore capture release failures during teardown.
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      const interaction = interactionReference.current;
      const activeSettings = settingsReference.current;
      const canDrag =
        activeSettings.sourceMode === 'image'
          ? activeSettings.animation.dragFlowEnabled
          : activeSettings.animation.followDragEnabled ||
            activeSettings.animation.autoRotateEnabled;

      updatePointerPosition(event, { resetVelocity: true });
      interaction.pointerX = event.clientX;
      interaction.pointerY = event.clientY;

      if (canDrag) {
        interaction.dragging = true;
        interaction.activePointerId = event.pointerId;
        interaction.velocityX = 0;
        interaction.velocityY = 0;

        try {
          canvas.setPointerCapture(event.pointerId);
        } catch {
          // Pointer capture can fail in some browsers if the canvas is detached.
        }
      }

      canvas.style.cursor = getCanvasCursor(
        activeSettings,
        interaction.dragging,
      );

      if (!didInteractReference.current) {
        didInteractReference.current = true;
        onFirstInteraction();
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const interaction = interactionReference.current;
      const resetVelocity = !interaction.pointerInside && !interaction.dragging;
      const pointerStep = updatePointerPosition(
        event,
        resetVelocity ? { resetVelocity: true } : undefined,
      );
      const activeSettings = settingsReference.current;

      if (!interaction.dragging) {
        return;
      }

      if (
        interaction.activePointerId !== null &&
        event.pointerId !== interaction.activePointerId
      ) {
        return;
      }

      if (activeSettings.sourceMode === 'image') {
        if (!activeSettings.animation.dragFlowEnabled) {
          return;
        }

        interaction.dragOffsetX = THREE.MathUtils.clamp(
          interaction.dragOffsetX + pointerStep.deltaX * 2.2,
          -IMAGE_DRAG_OFFSET_LIMIT,
          IMAGE_DRAG_OFFSET_LIMIT,
        );
        interaction.dragOffsetY = THREE.MathUtils.clamp(
          interaction.dragOffsetY + pointerStep.deltaY * 2.2,
          -IMAGE_DRAG_OFFSET_LIMIT,
          IMAGE_DRAG_OFFSET_LIMIT,
        );
        return;
      }

      const animation = activeSettings.animation;

      if (!animation.followDragEnabled && !animation.autoRotateEnabled) {
        return;
      }

      const deltaX =
        (event.clientX - interaction.pointerX) * animation.dragSens;
      const deltaY =
        (event.clientY - interaction.pointerY) * animation.dragSens;
      interaction.velocityX = deltaY;
      interaction.velocityY = deltaX;
      interaction.targetRotationY += deltaX;
      interaction.targetRotationX += deltaY;
      interaction.pointerX = event.clientX;
      interaction.pointerY = event.clientY;
    };

    const handlePointerLeave = () => {
      const interaction = interactionReference.current;
      const activeSettings = settingsReference.current;

      if (interaction.dragging) {
        return;
      }

      interaction.pointerInside = false;
      interaction.pointerVelocityX = 0;
      interaction.pointerVelocityY = 0;

      if (activeSettings.sourceMode !== 'image') {
        interaction.mouseX = 0.5;
        interaction.mouseY = 0.5;
      }

      canvas.style.cursor = getCanvasCursor(activeSettings, false);
    };

    const handlePointerUp = (event: PointerEvent) => {
      const interaction = interactionReference.current;
      const activeSettings = settingsReference.current;
      const animation = activeSettings.animation;

      updatePointerPosition(event, { resetVelocity: true });
      releasePointerCapture(interaction.activePointerId);
      interaction.activePointerId = null;
      interaction.dragging = false;
      const rect = canvas.getBoundingClientRect();
      interaction.pointerInside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!interaction.pointerInside && activeSettings.sourceMode !== 'image') {
        interaction.mouseX = 0.5;
        interaction.mouseY = 0.5;
      }

      canvas.style.cursor = getCanvasCursor(activeSettings, false);

      if (!animation.springReturnEnabled) {
        return;
      }

      const springImpulse = Math.max(animation.springStrength * 10, 1.2);
      interaction.rotationVelocityX += interaction.velocityX * springImpulse;
      interaction.rotationVelocityY += interaction.velocityY * springImpulse;
      interaction.rotationVelocityZ +=
        interaction.velocityY * springImpulse * 0.12;
      interaction.targetRotationX = 0;
      interaction.targetRotationY = 0;
      interaction.velocityX = 0;
      interaction.velocityY = 0;
    };

    const handlePointerCancel = () => {
      const interaction = interactionReference.current;
      const activeSettings = settingsReference.current;
      releasePointerCapture(interaction.activePointerId);
      interaction.activePointerId = null;
      interaction.dragging = false;
      interaction.dragOffsetX = 0;
      interaction.dragOffsetY = 0;
      interaction.pointerInside = false;
      interaction.pointerVelocityX = 0;
      interaction.pointerVelocityY = 0;

      if (activeSettings.sourceMode !== 'image') {
        interaction.mouseX = 0.5;
        interaction.mouseY = 0.5;
      }

      canvas.style.cursor = getCanvasCursor(activeSettings, false);
    };

    const handleWindowBlur = () => {
      handlePointerCancel();
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerCancel);
    window.addEventListener('blur', handleWindowBlur);
    canvas.addEventListener('pointerdown', handlePointerDown);

    const clock = new THREE.Clock();

    const renderFrame = () => {
      if (cancelled) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(renderFrame);

      const interaction = interactionReference.current;
      const activeSettings = settingsReference.current;
      const elapsedTime =
        (initialPoseReference.current?.timeElapsed ?? 0) +
        clock.getElapsedTime();
      const delta = 1 / 60;
      const baseDistance = previewDistanceReference.current;
      const isImageMode = activeSettings.sourceMode === 'image';
      const hasImageTexture = resources.imageTexture !== null;

      halftoneMaterial.uniforms.time.value = elapsedTime;
      halftoneMaterial.uniforms.waveAmount.value =
        activeSettings.animation.waveEnabled && !isImageMode
          ? activeSettings.animation.waveAmount
          : 0;
      halftoneMaterial.uniforms.waveSpeed.value =
        activeSettings.animation.waveSpeed;
      halftoneMaterial.uniforms.distanceScale.value = isImageMode
        ? 1
        : baseDistance / REFERENCE_PREVIEW_DISTANCE;

      // Image mode selected but no image loaded yet — show empty canvas
      if (isImageMode && !hasImageTexture) {
        renderer.setRenderTarget(null);
        renderer.clear();
        return;
      }

      halftoneMaterial.uniforms.cropToBounds.value = isImageMode ? 1 : 0;

      if (isImageMode) {
        const pointerFollow = interaction.dragging
          ? 0.46
          : IMAGE_POINTER_FOLLOW;
        const pointerActive = interaction.pointerInside || interaction.dragging;

        interaction.smoothedMouseX +=
          (interaction.mouseX - interaction.smoothedMouseX) * pointerFollow;
        interaction.smoothedMouseY +=
          (interaction.mouseY - interaction.smoothedMouseY) * pointerFollow;
        interaction.pointerVelocityX *= IMAGE_POINTER_VELOCITY_DAMPING;
        interaction.pointerVelocityY *= IMAGE_POINTER_VELOCITY_DAMPING;

        if (activeSettings.animation.dragFlowEnabled) {
          const dragDecay = 1 - activeSettings.animation.dragFlowDecay;
          interaction.dragOffsetX *= dragDecay;
          interaction.dragOffsetY *= dragDecay;

          if (Math.abs(interaction.dragOffsetX) < 0.00005) {
            interaction.dragOffsetX = 0;
          }

          if (Math.abs(interaction.dragOffsetY) < 0.00005) {
            interaction.dragOffsetY = 0;
          }
        } else {
          interaction.dragOffsetX = 0;
          interaction.dragOffsetY = 0;
        }

        const dragActive =
          activeSettings.animation.dragFlowEnabled &&
          (interaction.dragging ||
            Math.abs(interaction.dragOffsetX) > 0.0005 ||
            Math.abs(interaction.dragOffsetY) > 0.0005);

        halftoneMaterial.uniforms.interactionUv.value.set(
          interaction.smoothedMouseX,
          1 - interaction.smoothedMouseY,
        );
        halftoneMaterial.uniforms.interactionVelocity.value.set(
          interaction.pointerVelocityX * getRenderWidth(),
          -interaction.pointerVelocityY * getRenderHeight(),
        );
        halftoneMaterial.uniforms.dragOffset.value.set(
          interaction.dragOffsetX * getRenderWidth(),
          -interaction.dragOffsetY * getRenderHeight(),
        );
        halftoneMaterial.uniforms.hoverLightStrength.value =
          pointerActive && activeSettings.animation.hoverLightEnabled
            ? activeSettings.animation.hoverLightIntensity
            : 0;
        halftoneMaterial.uniforms.hoverLightRadius.value =
          activeSettings.animation.hoverLightRadius;
        halftoneMaterial.uniforms.hoverFlowStrength.value = 0;
        halftoneMaterial.uniforms.hoverFlowRadius.value = 0.18;
        halftoneMaterial.uniforms.dragFlowStrength.value = dragActive
          ? activeSettings.animation.dragFlowStrength
          : 0;
        halftoneMaterial.uniforms.dragFlowRadius.value =
          activeSettings.animation.dragFlowRadius;

        imageMaterial.uniforms.zoom.value = getImagePreviewZoom(baseDistance);
        imageMaterial.uniforms.viewportSize.value.set(
          getRenderWidth(),
          getRenderHeight(),
        );

        poseChangeReference.current({
          autoElapsed: 0,
          rotateElapsed: 0,
          rotationX: 0,
          rotationY: 0,
          rotationZ: 0,
          targetRotationX: interaction.targetRotationX,
          targetRotationY: interaction.targetRotationY,
          timeElapsed: elapsedTime,
        });

        if (!activeSettings.halftone.enabled) {
          renderer.setRenderTarget(null);
          renderer.clear();
          renderer.render(imageScene, orthographicCamera);
          return;
        }

        renderer.setRenderTarget(sceneTarget);
        renderer.render(imageScene, orthographicCamera);
      }

      if (!isImageMode) {
        let baseRotationX = 0;
        let baseRotationY = 0;
        let baseRotationZ = 0;
        let meshOffsetY = 0;
        let meshScale = 1;
        let lightAngle = activeSettings.lighting.angleDegrees;
        let lightHeight = activeSettings.lighting.height;

        if (activeSettings.animation.autoRotateEnabled) {
          if (!interaction.dragging) {
            interaction.autoElapsed += delta;
            interaction.targetRotationX += interaction.velocityX;
            interaction.targetRotationY += interaction.velocityY;
            interaction.velocityX *= 0.92;
            interaction.velocityY *= 0.92;
          }

          baseRotationY +=
            interaction.autoElapsed * activeSettings.animation.autoSpeed;
          baseRotationX +=
            Math.sin(interaction.autoElapsed * 0.2) *
            activeSettings.animation.autoWobble;
        }

        if (activeSettings.animation.floatEnabled) {
          const floatPhase = elapsedTime * activeSettings.animation.floatSpeed;
          const driftAmount =
            (activeSettings.animation.driftAmount * Math.PI) / 180;

          meshOffsetY +=
            Math.sin(floatPhase) * activeSettings.animation.floatAmplitude;
          baseRotationX += Math.sin(floatPhase * 0.72) * driftAmount * 0.45;
          baseRotationZ += Math.cos(floatPhase * 0.93) * driftAmount * 0.3;
        }

        if (activeSettings.animation.breatheEnabled) {
          meshScale *=
            1 +
            Math.sin(elapsedTime * activeSettings.animation.breatheSpeed) *
              activeSettings.animation.breatheAmount;
        }

        if (activeSettings.animation.rotateEnabled) {
          interaction.rotateElapsed += delta;
          const rotateProgress = activeSettings.animation.rotatePingPong
            ? Math.sin(
                interaction.rotateElapsed *
                  activeSettings.animation.rotateSpeed,
              ) * Math.PI
            : interaction.rotateElapsed * activeSettings.animation.rotateSpeed;

          if (activeSettings.animation.rotatePreset === 'axis') {
            const axisDirection =
              activeSettings.animation.rotateAxis.startsWith('-') ? -1 : 1;
            const axisProgress = rotateProgress * axisDirection;

            if (
              activeSettings.animation.rotateAxis === 'x' ||
              activeSettings.animation.rotateAxis === 'xy' ||
              activeSettings.animation.rotateAxis === '-x' ||
              activeSettings.animation.rotateAxis === '-xy'
            ) {
              baseRotationX += axisProgress;
            }

            if (
              activeSettings.animation.rotateAxis === 'y' ||
              activeSettings.animation.rotateAxis === 'xy' ||
              activeSettings.animation.rotateAxis === '-y' ||
              activeSettings.animation.rotateAxis === '-xy'
            ) {
              baseRotationY += axisProgress;
            }

            if (
              activeSettings.animation.rotateAxis === 'z' ||
              activeSettings.animation.rotateAxis === '-z'
            ) {
              baseRotationZ += axisProgress;
            }
          } else if (activeSettings.animation.rotatePreset === 'lissajous') {
            baseRotationX += Math.sin(rotateProgress * 0.85) * 0.65;
            baseRotationY += Math.sin(rotateProgress * 1.35 + 0.8) * 1.05;
            baseRotationZ += Math.sin(rotateProgress * 0.55 + 1.6) * 0.32;
          } else if (activeSettings.animation.rotatePreset === 'orbit') {
            baseRotationX += Math.sin(rotateProgress * 0.75) * 0.42;
            baseRotationY += Math.cos(rotateProgress) * 1.2;
            baseRotationZ += Math.sin(rotateProgress * 1.25) * 0.24;
          } else if (activeSettings.animation.rotatePreset === 'tumble') {
            baseRotationX += rotateProgress * 0.55;
            baseRotationY += Math.sin(rotateProgress * 0.8) * 0.9;
            baseRotationZ += Math.cos(rotateProgress * 1.1) * 0.38;
          }
        }

        if (activeSettings.animation.lightSweepEnabled) {
          const lightPhase =
            elapsedTime * activeSettings.animation.lightSweepSpeed;
          lightAngle +=
            Math.sin(lightPhase) * activeSettings.animation.lightSweepRange;
          lightHeight +=
            Math.cos(lightPhase * 0.85) *
            activeSettings.animation.lightSweepHeightRange;
        }

        let targetX = baseRotationX;
        let targetY = baseRotationY;
        let easing = 0.12;

        if (activeSettings.animation.followHoverEnabled) {
          const rangeRadians =
            (activeSettings.animation.hoverRange * Math.PI) / 180;

          if (
            activeSettings.animation.hoverReturn ||
            interaction.mouseX !== 0.5 ||
            interaction.mouseY !== 0.5
          ) {
            targetX += (interaction.mouseY - 0.5) * rangeRadians;
            targetY += (interaction.mouseX - 0.5) * rangeRadians;
          }

          easing = activeSettings.animation.hoverEase;
        }

        if (activeSettings.animation.followDragEnabled) {
          if (!interaction.dragging && activeSettings.animation.dragMomentum) {
            interaction.targetRotationX += interaction.velocityX;
            interaction.targetRotationY += interaction.velocityY;
            interaction.velocityX *= 1 - activeSettings.animation.dragFriction;
            interaction.velocityY *= 1 - activeSettings.animation.dragFriction;
          }

          targetX += interaction.targetRotationX;
          targetY += interaction.targetRotationY;
          easing = activeSettings.animation.dragFriction;
        }

        if (
          activeSettings.animation.autoRotateEnabled &&
          !activeSettings.animation.followHoverEnabled &&
          !activeSettings.animation.followDragEnabled
        ) {
          targetX = baseRotationX + interaction.targetRotationX;
          targetY = baseRotationY + interaction.targetRotationY;

          if (interaction.dragging) {
            targetX = interaction.targetRotationX;
            targetY = interaction.targetRotationY;
          }

          easing = 0.08;
        }

        if (activeSettings.animation.springReturnEnabled) {
          const springX = applySpringStep(
            interaction.rotationX,
            targetX,
            interaction.rotationVelocityX,
            activeSettings.animation.springStrength,
            activeSettings.animation.springDamping,
          );
          const springY = applySpringStep(
            interaction.rotationY,
            targetY,
            interaction.rotationVelocityY,
            activeSettings.animation.springStrength,
            activeSettings.animation.springDamping,
          );
          const springZ = applySpringStep(
            interaction.rotationZ,
            baseRotationZ,
            interaction.rotationVelocityZ,
            activeSettings.animation.springStrength,
            activeSettings.animation.springDamping,
          );

          interaction.rotationX = springX.value;
          interaction.rotationY = springY.value;
          interaction.rotationZ = springZ.value;
          interaction.rotationVelocityX = springX.velocity;
          interaction.rotationVelocityY = springY.velocity;
          interaction.rotationVelocityZ = springZ.velocity;
        } else {
          interaction.rotationX += (targetX - interaction.rotationX) * easing;
          interaction.rotationY += (targetY - interaction.rotationY) * easing;
          interaction.rotationZ +=
            (baseRotationZ - interaction.rotationZ) *
            (activeSettings.animation.rotatePingPong ? 0.18 : 0.12);
        }

        mesh.rotation.set(
          interaction.rotationX,
          interaction.rotationY,
          interaction.rotationZ,
        );
        mesh.position.y = meshOffsetY;
        mesh.scale.setScalar(meshScale);

        if (activeSettings.animation.cameraParallaxEnabled) {
          const cameraRange = activeSettings.animation.cameraParallaxAmount;
          const cameraEase = activeSettings.animation.cameraParallaxEase;
          const centeredX = (interaction.mouseX - 0.5) * 2;
          const centeredY = (0.5 - interaction.mouseY) * 2;
          const orbitYaw = centeredX * cameraRange;
          const orbitPitch = centeredY * cameraRange * 0.7;
          const horizontalRadius = Math.cos(orbitPitch) * baseDistance;
          const targetCameraX = Math.sin(orbitYaw) * horizontalRadius;
          const targetCameraY = Math.sin(orbitPitch) * baseDistance * 0.85;
          const targetCameraZ = Math.cos(orbitYaw) * horizontalRadius;

          camera.position.x += (targetCameraX - camera.position.x) * cameraEase;
          camera.position.y += (targetCameraY - camera.position.y) * cameraEase;
          camera.position.z += (targetCameraZ - camera.position.z) * cameraEase;
        } else {
          camera.position.x += (0 - camera.position.x) * 0.12;
          camera.position.y += (0 - camera.position.y) * 0.12;
          camera.position.z += (baseDistance - camera.position.z) * 0.12;
        }

        camera.lookAt(0, meshOffsetY * 0.2, 0);
        setPrimaryLightPosition(primaryLight, lightAngle, lightHeight);

        poseChangeReference.current({
          autoElapsed: interaction.autoElapsed,
          rotateElapsed: interaction.rotateElapsed,
          rotationX: interaction.rotationX,
          rotationY: interaction.rotationY,
          rotationZ: interaction.rotationZ,
          targetRotationX: interaction.targetRotationX,
          targetRotationY: interaction.targetRotationY,
          timeElapsed: elapsedTime,
        });

        if (!activeSettings.halftone.enabled) {
          renderer.setRenderTarget(null);
          renderer.clear();
          renderer.render(scene3d, camera);
          return;
        }

        renderer.setRenderTarget(sceneTarget);
        renderer.render(scene3d, camera);
        halftoneMaterial.uniforms.hoverLightStrength.value = 0;
        halftoneMaterial.uniforms.hoverFlowStrength.value = 0;
        halftoneMaterial.uniforms.dragFlowStrength.value = 0;
        halftoneMaterial.uniforms.interactionVelocity.value.set(0, 0);
        halftoneMaterial.uniforms.dragOffset.value.set(0, 0);
      } // end if (!isImageMode)

      blurHorizontalMaterial.uniforms.tInput.value = sceneTarget.texture;
      renderer.setRenderTarget(blurTargetA);
      renderer.render(blurHorizontalScene, orthographicCamera);

      blurVerticalMaterial.uniforms.tInput.value = blurTargetA.texture;
      renderer.setRenderTarget(blurTargetB);
      renderer.render(blurVerticalScene, orthographicCamera);

      blurHorizontalMaterial.uniforms.tInput.value = blurTargetB.texture;
      renderer.setRenderTarget(blurTargetA);
      renderer.render(blurHorizontalScene, orthographicCamera);

      blurVerticalMaterial.uniforms.tInput.value = blurTargetA.texture;
      renderer.setRenderTarget(blurTargetB);
      renderer.render(blurVerticalScene, orthographicCamera);

      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(postScene, orthographicCamera);
    };

    renderFrame();

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerCancel);
      window.removeEventListener('blur', handleWindowBlur);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.cancelAnimationFrame(animationFrameId);

      blurHorizontalMaterial.dispose();
      blurVerticalMaterial.dispose();
      halftoneMaterial.dispose();
      imageMaterial.dispose();

      if (resources.imageTexture) {
        resources.imageTexture.dispose();
      }

      fullScreenGeometry.dispose();
      material.dispose();
      sceneTarget.dispose();
      blurTargetA.dispose();
      blurTargetB.dispose();
      environmentTexture.dispose();
      renderer.dispose();
      resourcesReference.current = null;

      if (snapshotRef) {
        snapshotRef.current = null;
      }

      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, [onFirstInteraction]);

  return (
    <CanvasMount
      $background={settings.background.color}
      aria-hidden
      ref={mountReference}
    />
  );
}
