'use client';

import { styled } from '@linaria/react';
import { type RefObject, useEffect, useRef } from 'react';
import * as THREE from 'three';

const DEFAULT_IMAGE_URL =
  '/images/home/three-cards-feature/familiar-interface-gradient.webp';
const VIRTUAL_RENDER_HEIGHT = 800;
const REFERENCE_PREVIEW_DISTANCE = 4;
const PREVIEW_DISTANCE = REFERENCE_PREVIEW_DISTANCE;
const MIN_FOOTPRINT_SCALE = 0.001;
const HALFTONE_SCALE = 18;
const HALFTONE_POWER = -0.3;
const HALFTONE_WIDTH = 0.3;
const IMAGE_CONTRAST = 0.7;
const DASH_COLOR = '#777';
const HOVER_DASH_COLOR = '#777';
const HOVER_LIGHT_INTENSITY = 0.85;
const HOVER_LIGHT_RADIUS = 0.6;
const HOVER_HALFTONE_RADIUS = 0.45;
const IMAGE_POINTER_FOLLOW = 0.38;
const IMAGE_POINTER_VELOCITY_DAMPING = 0.82;
const IMAGE_HOVER_FADE_IN = 18;
const IMAGE_HOVER_FADE_OUT = 7;

export type HalftoneBackdropConfig = {
  activeHoverX?: number;
  activeHoverY?: number;
  dashColor?: string;
  halftonePower?: number;
  halftoneScale?: number;
  halftoneWidth?: number;
  hoverDashColor?: string;
  hoverHalftoneRadius?: number;
  hoverLightIntensity?: number;
  hoverLightRadius?: number;
  imageContrast?: number;
  previewDistance?: number;
};

type ResolvedHalftoneBackdropConfig = Required<HalftoneBackdropConfig>;

const DEFAULT_HALFTONE_BACKDROP_CONFIG: ResolvedHalftoneBackdropConfig = {
  activeHoverX: 0.16,
  activeHoverY: 0.46,
  dashColor: DASH_COLOR,
  halftonePower: HALFTONE_POWER,
  halftoneScale: HALFTONE_SCALE,
  halftoneWidth: HALFTONE_WIDTH,
  hoverDashColor: HOVER_DASH_COLOR,
  hoverHalftoneRadius: HOVER_HALFTONE_RADIUS,
  hoverLightIntensity: HOVER_LIGHT_INTENSITY,
  hoverLightRadius: HOVER_LIGHT_RADIUS,
  imageContrast: IMAGE_CONTRAST,
  previewDistance: PREVIEW_DISTANCE,
};

const passThroughVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const blurFragmentShader = `
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

const halftoneFragmentShader = `
  precision highp float;

  uniform sampler2D tScene;
  uniform vec2 effectResolution;
  uniform vec2 logicalResolution;
  uniform float tile;
  uniform float s_3;
  uniform float s_4;
  uniform vec3 dashColor;
  uniform vec3 hoverDashColor;
  uniform float footprintScale;
  uniform vec2 interactionUv;
  uniform vec2 interactionVelocity;
  uniform float hoverLightStrength;
  uniform float hoverLightRadius;

  varying vec2 vUv;

  float distSegment(in vec2 p, in vec2 a, in vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float denom = max(dot(ba, ba), 0.000001);
    float h = clamp(dot(pa, ba) / denom, 0.0, 1.0);
    return length(pa - ba * h);
  }

  float lineSimpleEt(in vec2 p, in float r, in float thickness) {
    vec2 a = vec2(0.5) + vec2(-r, 0.0);
    vec2 b = vec2(0.5) + vec2(r, 0.0);
    float distToSegment = distSegment(p, a, b);
    float halfThickness = thickness * r;
    return distToSegment - halfThickness;
  }

  void main() {
    vec2 fragCoord =
      (gl_FragCoord.xy / max(effectResolution, vec2(1.0))) * logicalResolution;
    float halftoneSize = max(tile * max(footprintScale, 0.001), 1.0);
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

    vec2 effectCoord = fragCoord;

    vec2 cellIndex = floor(effectCoord / halftoneSize);
    vec2 sampleUv = clamp(
      (cellIndex + 0.5) * halftoneSize / logicalResolution,
      vec2(0.0),
      vec2(1.0)
    );
    vec2 cellUv = fract(effectCoord / halftoneSize);

    vec4 sceneSample = texture2D(tScene, sampleUv);
    float mask = smoothstep(0.02, 0.08, sceneSample.a);
    float lightLift =
      hoverLightStrength * hoverLightMask * mix(0.78, 1.18, motionBias) * 0.22;
    float bandRadius = clamp(
      (
        (
          sceneSample.r +
          sceneSample.g +
          sceneSample.b +
          s_3 * length(vec2(0.5))
        ) *
        (1.0 / 3.0)
      ) + lightLift,
      0.0,
      1.0
    ) * 1.86 * 0.5;

    float alpha = 0.0;
    if (bandRadius > 0.0001) {
      float signedDistance = lineSimpleEt(cellUv, bandRadius, s_4);
      float edge = 0.02;
      alpha = (1.0 - smoothstep(0.0, edge, signedDistance)) * mask;
    }

    float hoverStrength = clamp(hoverLightMask * hoverLightStrength, 0.0, 1.0);
    vec3 activeDashColor = mix(dashColor, hoverDashColor, hoverStrength);
    vec3 color = activeDashColor * alpha;
    gl_FragColor = vec4(color, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const imagePassthroughFragmentShader = `
  precision highp float;

  uniform sampler2D tImage;
  uniform vec2 imageSize;
  uniform vec2 viewportSize;
  uniform float zoom;
  uniform float contrast;

  varying vec2 vUv;

  void main() {
    float imageAspect = imageSize.x / imageSize.y;
    float viewAspect = viewportSize.x / viewportSize.y;

    vec2 uv = vUv;

    if (imageAspect > viewAspect) {
      float scale = viewAspect / imageAspect;
      uv.x = (uv.x - 0.5) * scale + 0.5;
    } else {
      float scale = imageAspect / viewAspect;
      uv.y = (uv.y - 0.5) * scale + 0.5;
    }

    uv = (uv - 0.5) / zoom + 0.5;
    uv.y = 1.0 - uv.y;

    float inBounds = step(0.0, uv.x) * step(uv.x, 1.0)
                   * step(0.0, uv.y) * step(uv.y, 1.0);

    vec4 color = texture2D(tImage, clamp(uv, 0.0, 1.0));
    vec3 contrastColor = clamp((color.rgb - 0.5) * contrast + 0.5, 0.0, 1.0);

    gl_FragColor = vec4(contrastColor, inBounds);
  }
`;

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

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

function clampRectToViewport(
  rect: Rect,
  viewportWidth: number,
  viewportHeight: number,
) {
  const minX = Math.max(rect.x, 0);
  const minY = Math.max(rect.y, 0);
  const maxX = Math.min(rect.x + rect.width, viewportWidth);
  const maxY = Math.min(rect.y + rect.height, viewportHeight);

  if (maxX <= minX || maxY <= minY) {
    return null;
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function getRectArea(rect: Rect | null) {
  if (!rect) {
    return 0;
  }

  return Math.max(rect.width, 0) * Math.max(rect.height, 0);
}

function getImagePreviewZoom(previewDistance: number) {
  return REFERENCE_PREVIEW_DISTANCE / Math.max(previewDistance, 0.001);
}

function getContainedImageRect({
  imageHeight,
  imageWidth,
  viewportHeight,
  viewportWidth,
  zoom,
}: {
  imageHeight: number;
  imageWidth: number;
  viewportHeight: number;
  viewportWidth: number;
  zoom: number;
}) {
  if (
    imageWidth <= 0 ||
    imageHeight <= 0 ||
    viewportWidth <= 0 ||
    viewportHeight <= 0
  ) {
    return null;
  }

  const imageAspect = imageWidth / imageHeight;
  const viewAspect = viewportWidth / viewportHeight;

  let fittedWidth = viewportWidth;
  let fittedHeight = viewportHeight;

  if (imageAspect > viewAspect) {
    fittedHeight = viewportWidth / imageAspect;
  } else {
    fittedWidth = viewportHeight * imageAspect;
  }

  const scaledWidth = fittedWidth * zoom;
  const scaledHeight = fittedHeight * zoom;

  return clampRectToViewport(
    {
      x: (viewportWidth - scaledWidth) * 0.5,
      y: (viewportHeight - scaledHeight) * 0.5,
      width: scaledWidth,
      height: scaledHeight,
    },
    viewportWidth,
    viewportHeight,
  );
}

function getFootprintScaleFromRects(
  currentRect: Rect | null,
  referenceRect: Rect | null,
) {
  const currentArea = getRectArea(currentRect);
  const referenceArea = getRectArea(referenceRect);

  if (currentArea <= 0 || referenceArea <= 0) {
    return 1;
  }

  return Math.max(Math.sqrt(currentArea / referenceArea), MIN_FOOTPRINT_SCALE);
}

function getImageFootprintScale({
  imageHeight,
  imageWidth,
  previewDistance,
  viewportHeight,
  viewportWidth,
}: {
  imageHeight: number;
  imageWidth: number;
  previewDistance: number;
  viewportHeight: number;
  viewportWidth: number;
}) {
  const currentRect = getContainedImageRect({
    imageHeight,
    imageWidth,
    viewportHeight,
    viewportWidth,
    zoom: getImagePreviewZoom(previewDistance),
  });
  const referenceRect = getContainedImageRect({
    imageHeight,
    imageWidth,
    viewportHeight,
    viewportWidth,
    zoom: 1,
  });

  return getFootprintScaleFromRects(currentRect, referenceRect);
}

function createRenderTarget(width: number, height: number) {
  return new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  });
}

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

function loadImage(imageUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
    image.src = imageUrl;
  });
}

async function mountFamiliarInterfaceGradient({
  container,
  config,
  imageUrl,
  isExternallyActive,
  pointerTarget,
}: {
  container: HTMLDivElement;
  config: ResolvedHalftoneBackdropConfig;
  imageUrl: string;
  isExternallyActive: () => boolean;
  pointerTarget?: HTMLElement | null;
}) {
  const HOVER_STRENGTH_STOP_EPSILON = 0.001;
  const POINTER_POSITION_STOP_EPSILON = 0.001;
  const POINTER_VELOCITY_STOP_EPSILON = 0.0001;
  const image = await loadImage(imageUrl);
  const getWidth = () => Math.max(container.clientWidth, 1);
  const getHeight = () => Math.max(container.clientHeight, 1);
  const getVirtualHeight = () => Math.max(VIRTUAL_RENDER_HEIGHT, getHeight());
  const getVirtualWidth = () =>
    Math.max(
      Math.round(getVirtualHeight() * (getWidth() / Math.max(getHeight(), 1))),
      1,
    );

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(getVirtualWidth(), getVirtualHeight(), false);

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
  imageTexture.needsUpdate = true;

  const sceneTarget = createRenderTarget(getVirtualWidth(), getVirtualHeight());
  const blurTargetA = createRenderTarget(getVirtualWidth(), getVirtualHeight());
  const blurTargetB = createRenderTarget(getVirtualWidth(), getVirtualHeight());
  const fullScreenGeometry = new THREE.PlaneGeometry(2, 2);
  const orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const imageMaterial = new THREE.ShaderMaterial({
    uniforms: {
      contrast: { value: config.imageContrast },
      imageSize: { value: new THREE.Vector2(image.width, image.height) },
      tImage: { value: imageTexture },
      viewportSize: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      zoom: { value: getImagePreviewZoom(config.previewDistance) },
    },
    fragmentShader: imagePassthroughFragmentShader,
    vertexShader: passThroughVertexShader,
  });

  const blurHorizontalMaterial = new THREE.ShaderMaterial({
    uniforms: {
      dir: { value: new THREE.Vector2(1, 0) },
      res: { value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()) },
      tInput: { value: null },
    },
    fragmentShader: blurFragmentShader,
    vertexShader: passThroughVertexShader,
  });

  const blurVerticalMaterial = new THREE.ShaderMaterial({
    uniforms: {
      dir: { value: new THREE.Vector2(0, 1) },
      res: { value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()) },
      tInput: { value: null },
    },
    fragmentShader: blurFragmentShader,
    vertexShader: passThroughVertexShader,
  });

  const halftoneMaterial = new THREE.ShaderMaterial({
    fragmentShader: halftoneFragmentShader,
    transparent: true,
    uniforms: {
      dashColor: { value: new THREE.Color(config.dashColor) },
      effectResolution: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      footprintScale: { value: 1 },
      hoverDashColor: { value: new THREE.Color(config.hoverDashColor) },
      hoverLightRadius: { value: config.hoverLightRadius },
      hoverLightStrength: { value: 0 },
      interactionUv: { value: new THREE.Vector2(0.5, 0.5) },
      interactionVelocity: { value: new THREE.Vector2(0, 0) },
      logicalResolution: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      s_3: { value: config.halftonePower },
      s_4: { value: config.halftoneWidth },
      tScene: { value: sceneTarget.texture },
      tile: { value: config.halftoneScale },
    },
    vertexShader: passThroughVertexShader,
  });

  const fullScreenMesh = new THREE.Mesh(fullScreenGeometry, imageMaterial);
  const blurHorizontalMesh = new THREE.Mesh(
    fullScreenGeometry,
    blurHorizontalMaterial,
  );
  const blurVerticalMesh = new THREE.Mesh(
    fullScreenGeometry,
    blurVerticalMaterial,
  );
  const postProcessMesh = new THREE.Mesh(fullScreenGeometry, halftoneMaterial);

  const imageScene = new THREE.Scene();
  imageScene.add(fullScreenMesh);

  const blurHorizontalScene = new THREE.Scene();
  blurHorizontalScene.add(blurHorizontalMesh);

  const blurVerticalScene = new THREE.Scene();
  blurVerticalScene.add(blurVerticalMesh);

  const postScene = new THREE.Scene();
  postScene.add(postProcessMesh);

  const updateViewportUniforms = (
    logicalWidth: number,
    logicalHeight: number,
    effectWidth: number,
    effectHeight: number,
  ) => {
    blurHorizontalMaterial.uniforms.res.value.set(effectWidth, effectHeight);
    blurVerticalMaterial.uniforms.res.value.set(effectWidth, effectHeight);
    halftoneMaterial.uniforms.effectResolution.value.set(
      effectWidth,
      effectHeight,
    );
    halftoneMaterial.uniforms.logicalResolution.value.set(
      logicalWidth,
      logicalHeight,
    );
    imageMaterial.uniforms.viewportSize.value.set(logicalWidth, logicalHeight);
  };

  const getHalftoneScale = () =>
    getImageFootprintScale({
      imageHeight: image.height,
      imageWidth: image.width,
      previewDistance: config.previewDistance,
      viewportHeight: getVirtualHeight(),
      viewportWidth: getVirtualWidth(),
    });

  const interaction = createInteractionState();
  let animationFrameId: number | null = null;
  let lastFrameTime: number | null = null;

  const renderBackdrop = (deltaSeconds: number) => {
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

    halftoneMaterial.uniforms.interactionUv.value.set(
      interaction.smoothedMouseX,
      1 - interaction.smoothedMouseY,
    );
    halftoneMaterial.uniforms.interactionVelocity.value.set(
      interaction.pointerVelocityX * getVirtualWidth(),
      -interaction.pointerVelocityY * getVirtualHeight(),
    );
    halftoneMaterial.uniforms.hoverLightStrength.value =
      config.hoverLightIntensity * interaction.hoverStrength;
    halftoneMaterial.uniforms.hoverLightRadius.value =
      config.hoverHalftoneRadius + config.hoverLightRadius * 0.5;
    halftoneMaterial.uniforms.footprintScale.value = getHalftoneScale();
    imageMaterial.uniforms.zoom.value = getImagePreviewZoom(
      config.previewDistance,
    );

    renderer.setRenderTarget(sceneTarget);
    renderer.render(imageScene, orthographicCamera);

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
    animationFrameId = null;

    const deltaSeconds =
      lastFrameTime === null
        ? 1 / 60
        : Math.min((timestamp - lastFrameTime) / 1000, 0.1);

    lastFrameTime = timestamp;

    if (renderBackdrop(deltaSeconds)) {
      animationFrameId = window.requestAnimationFrame(runFrame);
      return;
    }

    lastFrameTime = null;
  };

  const ensureAnimationLoop = () => {
    if (animationFrameId !== null) {
      return;
    }

    animationFrameId = window.requestAnimationFrame(runFrame);
  };

  const syncSize = () => {
    const virtualWidth = getVirtualWidth();
    const virtualHeight = getVirtualHeight();

    renderer.setSize(virtualWidth, virtualHeight, false);
    sceneTarget.setSize(virtualWidth, virtualHeight);
    blurTargetA.setSize(virtualWidth, virtualHeight);
    blurTargetB.setSize(virtualWidth, virtualHeight);
    updateViewportUniforms(
      virtualWidth,
      virtualHeight,
      virtualWidth,
      virtualHeight,
    );

    if (animationFrameId === null) {
      renderBackdrop(0);
    }
  };

  const resizeObserver = new ResizeObserver(syncSize);
  resizeObserver.observe(container);
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
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      resizeObserver.disconnect();
      trackingElement.removeEventListener('pointermove', handlePointerMove);
      trackingElement.removeEventListener('pointerleave', handlePointerLeave);
      blurHorizontalMaterial.dispose();
      blurVerticalMaterial.dispose();
      halftoneMaterial.dispose();
      imageMaterial.dispose();
      imageTexture.dispose();
      fullScreenGeometry.dispose();
      sceneTarget.dispose();
      blurTargetA.dispose();
      blurTargetB.dispose();
      renderer.dispose();

      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    },
    wake: ensureAnimationLoop,
  };
}

const VisualMount = styled.div`
  background: transparent;
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

type FamiliarInterfaceGradientBackdropProps = {
  active?: boolean;
  config?: HalftoneBackdropConfig;
  imageUrl?: string;
  pointerTargetRef?: RefObject<HTMLElement | null>;
};

export function FamiliarInterfaceGradientBackdrop({
  active = false,
  config,
  imageUrl = DEFAULT_IMAGE_URL,
  pointerTargetRef,
}: FamiliarInterfaceGradientBackdropProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const wakeRef = useRef<VoidFunction | null>(null);
  const resolvedConfig = {
    ...DEFAULT_HALFTONE_BACKDROP_CONFIG,
    ...config,
  };

  activeRef.current = active;

  useEffect(() => {
    const container = mountRef.current;

    if (!container) {
      return;
    }

    let dispose: VoidFunction | undefined;
    let cancelled = false;

    void mountFamiliarInterfaceGradient({
      config: resolvedConfig,
      container,
      imageUrl,
      isExternallyActive: () => activeRef.current,
      pointerTarget: pointerTargetRef?.current,
    })
      .then((mountedGradient) => {
        if (cancelled) {
          mountedGradient.dispose();
          return;
        }

        wakeRef.current = mountedGradient.wake;
        dispose = mountedGradient.dispose;
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      cancelled = true;
      wakeRef.current = null;
      dispose?.();
    };
  }, [
    imageUrl,
    resolvedConfig.dashColor,
    resolvedConfig.halftonePower,
    resolvedConfig.halftoneScale,
    resolvedConfig.halftoneWidth,
    resolvedConfig.hoverDashColor,
    resolvedConfig.hoverHalftoneRadius,
    resolvedConfig.hoverLightIntensity,
    resolvedConfig.hoverLightRadius,
    resolvedConfig.imageContrast,
    resolvedConfig.previewDistance,
  ]);

  useEffect(() => {
    wakeRef.current?.();
  }, [active]);

  return <VisualMount aria-hidden ref={mountRef} />;
}
