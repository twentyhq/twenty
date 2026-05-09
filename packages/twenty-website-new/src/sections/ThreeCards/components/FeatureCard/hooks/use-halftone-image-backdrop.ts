'use client';

import { useEffect, useRef, type RefObject } from 'react';
import type { HalftoneImageBackdropConfig } from '../utils/halftone-image-backdrop-config';

import * as THREE from 'three';
import { observeElementSize } from '@/lib/dom/observe-element-size';
import {
  createVisualRenderLoop,
  loadVisualImage,
  tryCreateSiteWebGlRenderer,
  type VisualRenderLoop,
} from '@/lib/visual-runtime';

const PASS_THROUGH_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const HALFTONE_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform sampler2D tImage;
  uniform vec2 imageSize;
  uniform vec2 logicalResolution;
  uniform float halftoneCellPx;
  uniform float halftonePower;
  uniform float halftoneWidth;
  uniform float imageContrast;
  uniform float imageZoom;
  uniform float imageFlipY;
  uniform vec3 dashColor;
  uniform vec3 hoverDashColor;
  uniform vec2 interactionUv;
  uniform vec2 interactionVelocity;
  uniform float hoverLightStrength;
  uniform float hoverLightRadius;

  varying vec2 vUv;

  float distanceToSegment(in vec2 point, in vec2 a, in vec2 b) {
    vec2 pa = point - a;
    vec2 ba = b - a;
    float denom = max(dot(ba, ba), 0.000001);
    float t = clamp(dot(pa, ba) / denom, 0.0, 1.0);
    return length(pa - ba * t);
  }

  float dashSdf(in vec2 cellUv, in float radius, in float thickness) {
    vec2 a = vec2(0.5) + vec2(-radius, 0.0);
    vec2 b = vec2(0.5) + vec2(radius, 0.0);
    float halfThickness = thickness * radius;
    return distanceToSegment(cellUv, a, b) - halfThickness;
  }

  vec2 mapToImageUv(in vec2 fragmentUv) {
    float imageAspect = imageSize.x / max(imageSize.y, 1.0);
    float viewAspect = logicalResolution.x / max(logicalResolution.y, 1.0);

    vec2 uv = fragmentUv;
    if (imageAspect > viewAspect) {
      float scale = viewAspect / imageAspect;
      uv.x = (uv.x - 0.5) * scale + 0.5;
    } else {
      float scale = imageAspect / viewAspect;
      uv.y = (uv.y - 0.5) * scale + 0.5;
    }

    uv = (uv - 0.5) / max(imageZoom, 0.001) + 0.5;
    uv.y = mix(uv.y, 1.0 - uv.y, imageFlipY);
    return uv;
  }

  void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    float cellSize = max(halftoneCellPx, 1.0);

    vec2 cellIndex = floor(fragCoord / cellSize);
    vec2 cellCenterFrag = (cellIndex + 0.5) * cellSize;
    vec2 cellUv = fract(fragCoord / cellSize);

    vec2 sampleFragmentUv = clamp(
      cellCenterFrag / max(logicalResolution, vec2(1.0)),
      vec2(0.0),
      vec2(1.0)
    );
    vec2 imageUv = mapToImageUv(sampleFragmentUv);

    float inImageBounds = step(0.0, imageUv.x) * step(imageUv.x, 1.0)
                        * step(0.0, imageUv.y) * step(imageUv.y, 1.0);

    vec3 imageColor = texture2D(tImage, clamp(imageUv, 0.0, 1.0)).rgb;
    imageColor = clamp((imageColor - 0.5) * imageContrast + 0.5, 0.0, 1.0);

    vec2 pointerPx = interactionUv * logicalResolution;
    vec2 fragDelta = fragCoord - pointerPx;
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
      float lightRadiusPx = hoverLightRadius * logicalResolution.y;
      hoverLightMask = smoothstep(lightRadiusPx, 0.0, fragDist);
    }

    float lightLift = hoverLightStrength * hoverLightMask
                    * mix(0.78, 1.18, motionBias) * 0.22;

    float averageLuminance = (imageColor.r + imageColor.g + imageColor.b) / 3.0;
    float bandRadius = clamp(
      averageLuminance + halftonePower * length(vec2(0.5)) / 3.0 + lightLift,
      0.0,
      1.0
    ) * 0.93;

    float alpha = 0.0;
    if (bandRadius > 0.0001) {
      float signedDistance = dashSdf(cellUv, bandRadius, halftoneWidth);
      alpha = (1.0 - smoothstep(0.0, 0.02, signedDistance)) * inImageBounds;
    }

    float hoverStrength = clamp(hoverLightMask * hoverLightStrength, 0.0, 1.0);
    vec3 activeDashColor = mix(dashColor, hoverDashColor, hoverStrength);

    gl_FragColor = vec4(activeDashColor, alpha);
  }
`;

const REFERENCE_PREVIEW_DISTANCE = 4;
const MAX_DEVICE_PIXEL_RATIO = 2;
const IMAGE_POINTER_FOLLOW = 0.38;
const IMAGE_POINTER_VELOCITY_DAMPING = 0.82;
const IMAGE_HOVER_FADE_IN = 18;
const IMAGE_HOVER_FADE_OUT = 7;

const HOVER_STRENGTH_STOP_EPSILON = 0.001;
const POINTER_POSITION_STOP_EPSILON = 0.001;
const POINTER_VELOCITY_STOP_EPSILON = 0.0001;

type InteractionState = {
  hoverStrength: number;
  mouseX: number;
  mouseY: number;
  pointerInside: boolean;
  pointerVelocityX: number;
  pointerVelocityY: number;
  smoothedMouseX: number;
  smoothedMouseY: number;
};

function createInteractionState(): InteractionState {
  return {
    hoverStrength: 0,
    mouseX: 0.5,
    mouseY: 0.5,
    pointerInside: false,
    pointerVelocityX: 0,
    pointerVelocityY: 0,
    smoothedMouseX: 0.5,
    smoothedMouseY: 0.5,
  };
}

function getImagePreviewZoom(previewDistance: number) {
  return REFERENCE_PREVIEW_DISTANCE / Math.max(previewDistance, 0.001);
}

function getDevicePixelRatio() {
  if (typeof window === 'undefined') {
    return 1;
  }
  return Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
}

async function mountHalftoneImageBackdrop({
  config,
  container,
  isExternallyActive,
  pointerTarget,
}: {
  config: HalftoneImageBackdropConfig;
  container: HTMLDivElement;
  isExternallyActive: () => boolean;
  pointerTarget?: HTMLElement | null;
}) {
  const image = await loadVisualImage(config.imageUrl, {
    crossOrigin: 'anonymous',
    label: 'halftone image backdrop',
  });

  let renderLoop: VisualRenderLoop | null = null;
  const renderer = tryCreateSiteWebGlRenderer({
    alpha: true,
    antialias: false,
    onContextLost: () => {
      renderLoop?.stop();
    },
    premultipliedAlpha: false,
  });

  if (renderer === null) {
    return {
      dispose: () => {},
      wake: () => {},
    };
  }

  renderer.setClearColor(0x000000, 0);
  const pixelRatio = getDevicePixelRatio();
  renderer.setPixelRatio(pixelRatio);

  const canvas = renderer.domElement;
  canvas.style.cursor = 'default';
  canvas.style.display = 'block';
  canvas.style.height = '100%';
  canvas.style.touchAction = 'none';
  canvas.style.width = '100%';
  container.appendChild(canvas);

  const trackingElement = pointerTarget ?? canvas;

  const imageTexture = new THREE.Texture(image);
  imageTexture.colorSpace = THREE.SRGBColorSpace;
  imageTexture.minFilter = THREE.LinearFilter;
  imageTexture.magFilter = THREE.LinearFilter;
  imageTexture.generateMipmaps = false;
  imageTexture.needsUpdate = true;

  const fullScreenGeometry = new THREE.PlaneGeometry(2, 2);
  const orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const halftoneMaterial = new THREE.ShaderMaterial({
    fragmentShader: HALFTONE_FRAGMENT_SHADER,
    transparent: true,
    uniforms: {
      dashColor: { value: new THREE.Color(config.dashColor) },
      halftoneCellPx: {
        value: Math.max(config.halftoneScalePx * pixelRatio, 1),
      },
      halftonePower: { value: config.halftonePower },
      halftoneWidth: { value: config.halftoneWidth },
      hoverDashColor: { value: new THREE.Color(config.hoverDashColor) },
      hoverLightRadius: { value: config.hoverLightRadius },
      hoverLightStrength: { value: 0 },
      imageContrast: { value: config.imageContrast },
      imageFlipY: { value: config.flipImageY ? 1 : 0 },
      imageSize: { value: new THREE.Vector2(image.width, image.height) },
      imageZoom: { value: getImagePreviewZoom(config.previewDistance) },
      interactionUv: { value: new THREE.Vector2(0.5, 0.5) },
      interactionVelocity: { value: new THREE.Vector2(0, 0) },
      logicalResolution: { value: new THREE.Vector2(1, 1) },
      tImage: { value: imageTexture },
    },
    vertexShader: PASS_THROUGH_VERTEX_SHADER,
  });

  const fullScreenMesh = new THREE.Mesh(fullScreenGeometry, halftoneMaterial);
  const scene = new THREE.Scene();
  scene.add(fullScreenMesh);

  const interaction = createInteractionState();
  let lastFrameTime: number | null = null;

  const renderFrame = (deltaSeconds: number) => {
    const externalActive = isExternallyActive();
    const isHoverActive = externalActive || interaction.pointerInside;
    const targetHoverStrength = isHoverActive ? 1 : 0;
    const hoverEasing =
      1 -
      Math.exp(
        -deltaSeconds *
          (isHoverActive ? IMAGE_HOVER_FADE_IN : IMAGE_HOVER_FADE_OUT),
      );

    interaction.hoverStrength +=
      (targetHoverStrength - interaction.hoverStrength) * hoverEasing;

    if (
      Math.abs(targetHoverStrength - interaction.hoverStrength) <=
      HOVER_STRENGTH_STOP_EPSILON
    ) {
      interaction.hoverStrength = targetHoverStrength;
    }

    const targetMouseX =
      externalActive && !interaction.pointerInside
        ? config.activeHoverX
        : interaction.mouseX;
    const targetMouseY =
      externalActive && !interaction.pointerInside
        ? config.activeHoverY
        : interaction.mouseY;

    interaction.smoothedMouseX +=
      (targetMouseX - interaction.smoothedMouseX) * IMAGE_POINTER_FOLLOW;
    interaction.smoothedMouseY +=
      (targetMouseY - interaction.smoothedMouseY) * IMAGE_POINTER_FOLLOW;

    if (
      Math.abs(targetMouseX - interaction.smoothedMouseX) <=
      POINTER_POSITION_STOP_EPSILON
    ) {
      interaction.smoothedMouseX = targetMouseX;
    }

    if (
      Math.abs(targetMouseY - interaction.smoothedMouseY) <=
      POINTER_POSITION_STOP_EPSILON
    ) {
      interaction.smoothedMouseY = targetMouseY;
    }

    interaction.pointerVelocityX *= IMAGE_POINTER_VELOCITY_DAMPING;
    interaction.pointerVelocityY *= IMAGE_POINTER_VELOCITY_DAMPING;

    if (
      Math.abs(interaction.pointerVelocityX) <= POINTER_VELOCITY_STOP_EPSILON
    ) {
      interaction.pointerVelocityX = 0;
    }

    if (
      Math.abs(interaction.pointerVelocityY) <= POINTER_VELOCITY_STOP_EPSILON
    ) {
      interaction.pointerVelocityY = 0;
    }

    const logicalRes = halftoneMaterial.uniforms.logicalResolution.value;
    halftoneMaterial.uniforms.interactionUv.value.set(
      interaction.smoothedMouseX,
      1 - interaction.smoothedMouseY,
    );
    halftoneMaterial.uniforms.interactionVelocity.value.set(
      interaction.pointerVelocityX * logicalRes.x,
      -interaction.pointerVelocityY * logicalRes.y,
    );
    halftoneMaterial.uniforms.hoverLightStrength.value =
      config.hoverLightIntensity * interaction.hoverStrength;
    halftoneMaterial.uniforms.hoverLightRadius.value =
      config.hoverHalftoneRadius + config.hoverLightRadius * 0.5;
    halftoneMaterial.uniforms.imageZoom.value = getImagePreviewZoom(
      config.previewDistance,
    );

    renderer.render(scene, orthographicCamera);

    return (
      isHoverActive ||
      interaction.hoverStrength !== targetHoverStrength ||
      interaction.smoothedMouseX !== targetMouseX ||
      interaction.smoothedMouseY !== targetMouseY ||
      interaction.pointerVelocityX !== 0 ||
      interaction.pointerVelocityY !== 0
    );
  };

  const runFrame = (timestamp: number) => {
    const deltaSeconds =
      lastFrameTime === null
        ? 1 / 60
        : Math.min((timestamp - lastFrameTime) / 1000, 0.1);

    lastFrameTime = timestamp;

    if (renderFrame(deltaSeconds)) {
      return true;
    }

    lastFrameTime = null;
    return false;
  };

  const ensureAnimationLoop = () => {
    renderLoop?.start();
  };

  const syncSize = () => {
    const cssWidth = Math.max(container.clientWidth, 1);
    const cssHeight = Math.max(container.clientHeight, 1);

    renderer.setSize(cssWidth, cssHeight, false);
    halftoneMaterial.uniforms.logicalResolution.value.set(
      cssWidth * pixelRatio,
      cssHeight * pixelRatio,
    );
    halftoneMaterial.uniforms.halftoneCellPx.value = Math.max(
      config.halftoneScalePx * pixelRatio,
      1,
    );

    if (!renderLoop?.isRunning()) {
      renderFrame(0);
    }
  };

  renderLoop = createVisualRenderLoop({
    renderFrame: runFrame,
    target: container,
    targetVisibilityOptions: { rootMargin: '100px' },
  });

  const stopObservingSize = observeElementSize(container, syncSize);
  syncSize();

  const updatePointerPosition = (
    event: PointerEvent,
    options?: { resetVelocity?: boolean },
  ) => {
    const rect = trackingElement.getBoundingClientRect();
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
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (options?.resetVelocity) {
      interaction.pointerVelocityX = 0;
      interaction.pointerVelocityY = 0;
      interaction.smoothedMouseX = nextMouseX;
      interaction.smoothedMouseY = nextMouseY;
      return;
    }

    interaction.pointerVelocityX = deltaX;
    interaction.pointerVelocityY = deltaY;
  };

  const handlePointerMove = (event: PointerEvent) => {
    const shouldReset = !interaction.pointerInside;
    updatePointerPosition(
      event,
      shouldReset ? { resetVelocity: true } : undefined,
    );
    ensureAnimationLoop();
  };

  const handlePointerLeave = () => {
    interaction.pointerInside = false;
    interaction.pointerVelocityX = 0;
    interaction.pointerVelocityY = 0;
    ensureAnimationLoop();
  };

  trackingElement.addEventListener('pointermove', handlePointerMove);
  trackingElement.addEventListener('pointerleave', handlePointerLeave);

  if (isExternallyActive()) {
    ensureAnimationLoop();
  }

  return {
    dispose: () => {
      renderLoop?.dispose();
      stopObservingSize();
      trackingElement.removeEventListener('pointermove', handlePointerMove);
      trackingElement.removeEventListener('pointerleave', handlePointerLeave);

      halftoneMaterial.dispose();
      imageTexture.dispose();
      fullScreenGeometry.dispose();
      renderer.dispose();

      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    },
    wake: ensureAnimationLoop,
  };
}

export function useHalftoneImageBackdrop({
  active,
  config,
  mountRef,
  pointerTargetRef,
}: {
  active: boolean;
  config: HalftoneImageBackdropConfig;
  mountRef: RefObject<HTMLDivElement | null>;
  pointerTargetRef?: RefObject<HTMLElement | null>;
}) {
  const activeRef = useRef(active);
  const wakeRef = useRef<VoidFunction | null>(null);
  const {
    activeHoverX,
    activeHoverY,
    dashColor,
    flipImageY,
    halftonePower,
    halftoneScalePx,
    halftoneWidth,
    hoverDashColor,
    hoverHalftoneRadius,
    hoverLightIntensity,
    hoverLightRadius,
    imageContrast,
    imageUrl,
    previewDistance,
  } = config;

  activeRef.current = active;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) {
      return;
    }

    let dispose: VoidFunction | undefined;
    let cancelled = false;

    void mountHalftoneImageBackdrop({
      config: {
        activeHoverX,
        activeHoverY,
        dashColor,
        flipImageY,
        halftonePower,
        halftoneScalePx,
        halftoneWidth,
        hoverDashColor,
        hoverHalftoneRadius,
        hoverLightIntensity,
        hoverLightRadius,
        imageContrast,
        imageUrl,
        previewDistance,
      },
      container,
      isExternallyActive: () => activeRef.current,
      pointerTarget: pointerTargetRef?.current,
    })
      .then((mounted) => {
        if (cancelled) {
          mounted.dispose();
          return;
        }
        wakeRef.current = mounted.wake;
        dispose = mounted.dispose;
      })
      .catch((error) => {
        if (process.env.NODE_ENV !== 'production') {
          console.error('HalftoneImageBackdrop failed to mount:', error);
        }
      });

    return () => {
      cancelled = true;
      wakeRef.current = null;
      dispose?.();
    };
  }, [
    activeHoverX,
    activeHoverY,
    dashColor,
    flipImageY,
    halftonePower,
    halftoneScalePx,
    halftoneWidth,
    hoverDashColor,
    hoverHalftoneRadius,
    hoverLightIntensity,
    hoverLightRadius,
    imageContrast,
    imageUrl,
    mountRef,
    previewDistance,
    pointerTargetRef,
  ]);

  useEffect(() => {
    wakeRef.current?.();
  }, [active]);
}
