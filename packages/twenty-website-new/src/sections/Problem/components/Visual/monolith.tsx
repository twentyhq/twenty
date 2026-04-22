'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import * as THREE from 'three';
import { createSiteWebGlRenderer } from '@/lib/webgl';

const IMAGE_SRC = '/images/home/problem/monolith-problem.webp';
const PREVIEW_DISTANCE = 4;
const VIRTUAL_RENDER_HEIGHT = 768;
const REFERENCE_PREVIEW_DISTANCE = 4;
const MIN_FOOTPRINT_SCALE = 0.001;
const IMAGE_POINTER_FOLLOW = 0.38;
const IMAGE_POINTER_VELOCITY_DAMPING = 0.82;

type HalftoneTuning = {
  dashColor: string;
  imageContrast: number;
  power: number;
  scale: number;
  width: number;
};

type AnimationTuning = {
  hoverLightEnabled: boolean;
  hoverLightIntensity: number;
  hoverLightRadius: number;
  waveSpeed: number;
};

type MonolithTuning = {
  animation: AnimationTuning;
  backgroundColor: string;
  halftone: HalftoneTuning;
};

const DEFAULT_TUNING: MonolithTuning = {
  halftone: {
    dashColor: '#BABABA',
    imageContrast: 1,
    power: 0.21,
    scale: 10,
    width: 0.65,
  },
  animation: {
    hoverLightEnabled: true,
    hoverLightIntensity: 0.13,
    hoverLightRadius: 1,
    waveSpeed: 1,
  },
  backgroundColor: '#1C1C1C',
};

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

const halftoneFragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D tScene;
  uniform sampler2D tGlow;
  uniform vec2 effectResolution;
  uniform vec2 logicalResolution;
  uniform float tile;
  uniform float s_3;
  uniform float s_4;
  uniform vec3 dashColor;
  uniform float time;
  uniform float waveAmount;
  uniform float waveSpeed;
  uniform float footprintScale;
  uniform vec2 interactionUv;
  uniform vec2 interactionVelocity;
  uniform vec2 dragOffset;
  uniform float hoverLightStrength;
  uniform float hoverLightRadius;
  uniform float hoverFlowStrength;
  uniform float hoverFlowRadius;
  uniform float dragFlowStrength;
  uniform float cropToBounds;

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
    if (cropToBounds > 0.5) {
      vec4 boundsCheck = texture2D(tScene, vUv);
      if (boundsCheck.a < 0.01) {
        gl_FragColor = vec4(0.0);
        return;
      }
    }

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

    float hoverFlowMask = 0.0;
    if (hoverFlowStrength > 0.0) {
      float hoverRadiusPx = hoverFlowRadius * logicalResolution.y;
      hoverFlowMask = smoothstep(hoverRadiusPx, 0.0, fragDist);
    }

    vec2 hoverDisplacement =
      radialDir * hoverFlowStrength * hoverFlowMask * halftoneSize * 0.55 +
      motionDir * hoverFlowStrength * hoverFlowMask *
        (0.4 + motionBias) * halftoneSize * 1.15;
    vec2 travelDisplacement = dragOffset * dragFlowStrength * 0.45;
    vec2 effectCoord = fragCoord + hoverDisplacement + travelDisplacement;

    float bandRow = floor(effectCoord.y / halftoneSize);
    float waveOffset =
      waveAmount * sin(time * waveSpeed + bandRow * 0.5) * halftoneSize;
    effectCoord.x += waveOffset;

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
        ) * (1.0 / 3.0)
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

    vec3 color = dashColor * alpha;
    gl_FragColor = vec4(color, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const imagePassthroughFragmentShader = /* glsl */ `
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

    // Cover: fill the full masked area and crop overflow.
    if (imageAspect > viewAspect) {
      float scale = viewAspect / imageAspect;
      uv.x = (uv.x - 0.5) * scale + 0.5;
    } else {
      float scale = imageAspect / viewAspect;
      uv.y = (uv.y - 0.5) * scale + 0.5;
    }

    uv = (uv - 0.5) / zoom + 0.5;

    float inBounds = step(0.0, uv.x) * step(uv.x, 1.0)
      * step(0.0, uv.y) * step(uv.y, 1.0);

    vec4 color = texture2D(tImage, clamp(uv, 0.0, 1.0));
    vec3 contrastColor = clamp((color.rgb - 0.5) * contrast + 0.5, 0.0, 1.0);

    gl_FragColor = vec4(contrastColor, inBounds);
  }
`;

type Rect = {
  height: number;
  width: number;
  x: number;
  y: number;
};

type InteractionState = {
  mouseX: number;
  mouseY: number;
  pointerInside: boolean;
  pointerVelocityX: number;
  pointerVelocityY: number;
  smoothedMouseX: number;
  smoothedMouseY: number;
};

type MountHalftoneCanvasOptions = {
  container: HTMLDivElement;
  imageUrl: string;
  signal: AbortSignal;
};

type MonolithProps = {
  imageUrl?: string;
  style?: CSSProperties;
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

function createRenderTarget(width: number, height: number) {
  return new THREE.WebGLRenderTarget(width, height, {
    format: THREE.RGBAFormat,
    magFilter: THREE.LinearFilter,
    minFilter: THREE.LinearFilter,
  });
}

function createInteractionState(): InteractionState {
  return {
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

function getContainedImageRect(options: {
  imageHeight: number;
  imageWidth: number;
  viewportHeight: number;
  viewportWidth: number;
  zoom: number;
}) {
  const { imageHeight, imageWidth, viewportHeight, viewportWidth, zoom } =
    options;

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

function getImageFootprintScale(options: {
  imageHeight: number;
  imageWidth: number;
  previewDistance: number;
  viewportHeight: number;
  viewportWidth: number;
}) {
  const {
    imageHeight,
    imageWidth,
    previewDistance,
    viewportHeight,
    viewportWidth,
  } = options;

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

function createAbortError() {
  return new DOMException('Aborted', 'AbortError');
}

function loadImage(imageUrl: string, signal: AbortSignal) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    if (signal.aborted) {
      reject(createAbortError());
      return;
    }

    const image = new Image();
    image.decoding = 'async';

    const cleanup = () => {
      image.onload = null;
      image.onerror = null;
      signal.removeEventListener('abort', handleAbort);
    };
    const handleAbort = () => {
      cleanup();
      image.src = '';
      reject(createAbortError());
    };

    image.onload = () => {
      cleanup();
      resolve(image);
    };
    image.onerror = () => {
      cleanup();
      reject(new Error(`Failed to load image: ${imageUrl}`));
    };
    signal.addEventListener('abort', handleAbort, { once: true });
    image.src = imageUrl;
  });
}

async function mountHalftoneCanvas(options: MountHalftoneCanvasOptions) {
  const { container, imageUrl, signal } = options;
  const tuning = DEFAULT_TUNING;

  const getWidth = () => Math.max(container.clientWidth, 1);
  const getHeight = () => Math.max(container.clientHeight, 1);
  const getVirtualHeight = () => Math.max(VIRTUAL_RENDER_HEIGHT, getHeight());
  const getVirtualWidth = () =>
    Math.max(
      Math.round(getVirtualHeight() * (getWidth() / Math.max(getHeight(), 1))),
      1,
    );

  const image = await loadImage(imageUrl, signal);

  if (signal.aborted) {
    return undefined;
  }

  const renderer = createSiteWebGlRenderer({ alpha: true, antialias: false });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(1);
  renderer.setSize(getVirtualWidth(), getVirtualHeight(), false);

  const canvas = renderer.domElement;
  canvas.style.cursor = 'default';
  canvas.style.display = 'block';
  canvas.style.height = '100%';
  canvas.style.touchAction = 'none';
  canvas.style.width = '100%';
  container.appendChild(canvas);

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
      contrast: { value: tuning.halftone.imageContrast },
      imageSize: { value: new THREE.Vector2(image.width, image.height) },
      tImage: { value: imageTexture },
      viewportSize: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      zoom: { value: getImagePreviewZoom(PREVIEW_DISTANCE) },
    },
    vertexShader: passThroughVertexShader,
    fragmentShader: imagePassthroughFragmentShader,
  });

  const imageScene = new THREE.Scene();
  imageScene.add(new THREE.Mesh(fullScreenGeometry, imageMaterial));

  const blurHorizontalMaterial = new THREE.ShaderMaterial({
    uniforms: {
      dir: { value: new THREE.Vector2(1, 0) },
      res: { value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()) },
      tInput: { value: null },
    },
    vertexShader: passThroughVertexShader,
    fragmentShader: blurFragmentShader,
  });

  const blurVerticalMaterial = new THREE.ShaderMaterial({
    uniforms: {
      dir: { value: new THREE.Vector2(0, 1) },
      res: { value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()) },
      tInput: { value: null },
    },
    vertexShader: passThroughVertexShader,
    fragmentShader: blurFragmentShader,
  });

  const halftoneMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      cropToBounds: { value: 1 },
      dashColor: { value: new THREE.Color(tuning.halftone.dashColor) },
      dragFlowStrength: { value: 0 },
      dragOffset: { value: new THREE.Vector2(0, 0) },
      effectResolution: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      footprintScale: { value: 1 },
      hoverFlowRadius: { value: 0.18 },
      hoverFlowStrength: { value: 0 },
      hoverLightRadius: { value: tuning.animation.hoverLightRadius },
      hoverLightStrength: { value: 0 },
      interactionUv: { value: new THREE.Vector2(0.5, 0.5) },
      interactionVelocity: { value: new THREE.Vector2(0, 0) },
      logicalResolution: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      s_3: { value: tuning.halftone.power },
      s_4: { value: tuning.halftone.width },
      tGlow: { value: blurTargetB.texture },
      tile: { value: tuning.halftone.scale },
      time: { value: 0 },
      tScene: { value: sceneTarget.texture },
      waveAmount: { value: 0 },
      waveSpeed: { value: tuning.animation.waveSpeed },
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
      previewDistance: PREVIEW_DISTANCE,
      viewportHeight: getVirtualHeight(),
      viewportWidth: getVirtualWidth(),
    });

  const interaction = createInteractionState();

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
  };

  const resizeObserver = new ResizeObserver(syncSize);
  resizeObserver.observe(container);

  const updatePointerPosition = (
    event: PointerEvent,
    options?: { resetVelocity?: boolean },
  ) => {
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

  const handlePointerDown = (event: PointerEvent) => {
    updatePointerPosition(event, { resetVelocity: true });
  };

  const handlePointerMove = (event: PointerEvent) => {
    updatePointerPosition(event, {
      resetVelocity: !interaction.pointerInside,
    });
  };

  const handlePointerLeave = () => {
    interaction.pointerInside = false;
    interaction.pointerVelocityX = 0;
    interaction.pointerVelocityY = 0;
  };

  const handlePointerUp = (event: PointerEvent) => {
    updatePointerPosition(event, { resetVelocity: true });
  };

  const handleWindowBlur = () => {
    interaction.pointerInside = false;
    interaction.pointerVelocityX = 0;
    interaction.pointerVelocityY = 0;
  };

  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointerleave', handlePointerLeave);
  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('blur', handleWindowBlur);

  const clock = new THREE.Clock();
  let animationFrameId = 0;

  const renderFrame = () => {
    animationFrameId = window.requestAnimationFrame(renderFrame);

    halftoneMaterial.uniforms.time.value = clock.getElapsedTime();
    halftoneMaterial.uniforms.dashColor.value.set(tuning.halftone.dashColor);
    halftoneMaterial.uniforms.s_3.value = tuning.halftone.power;
    halftoneMaterial.uniforms.s_4.value = tuning.halftone.width;
    halftoneMaterial.uniforms.tile.value = tuning.halftone.scale;
    halftoneMaterial.uniforms.waveSpeed.value = tuning.animation.waveSpeed;
    imageMaterial.uniforms.contrast.value = tuning.halftone.imageContrast;

    interaction.smoothedMouseX +=
      (interaction.mouseX - interaction.smoothedMouseX) * IMAGE_POINTER_FOLLOW;
    interaction.smoothedMouseY +=
      (interaction.mouseY - interaction.smoothedMouseY) * IMAGE_POINTER_FOLLOW;
    interaction.pointerVelocityX *= IMAGE_POINTER_VELOCITY_DAMPING;
    interaction.pointerVelocityY *= IMAGE_POINTER_VELOCITY_DAMPING;

    halftoneMaterial.uniforms.interactionUv.value.set(
      interaction.smoothedMouseX,
      1 - interaction.smoothedMouseY,
    );
    halftoneMaterial.uniforms.interactionVelocity.value.set(
      interaction.pointerVelocityX * getVirtualWidth(),
      -interaction.pointerVelocityY * getVirtualHeight(),
    );
    halftoneMaterial.uniforms.dragOffset.value.set(0, 0);
    halftoneMaterial.uniforms.hoverLightStrength.value =
      interaction.pointerInside && tuning.animation.hoverLightEnabled
        ? tuning.animation.hoverLightIntensity
        : 0;
    halftoneMaterial.uniforms.hoverLightRadius.value =
      tuning.animation.hoverLightRadius;
    halftoneMaterial.uniforms.hoverFlowStrength.value = 0;
    halftoneMaterial.uniforms.hoverFlowRadius.value = 0.18;
    halftoneMaterial.uniforms.dragFlowStrength.value = 0;
    imageMaterial.uniforms.zoom.value = getImagePreviewZoom(PREVIEW_DISTANCE);
    halftoneMaterial.uniforms.footprintScale.value = getHalftoneScale();

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
  };

  renderFrame();

  return () => {
    window.cancelAnimationFrame(animationFrameId);
    resizeObserver.disconnect();
    canvas.removeEventListener('pointerdown', handlePointerDown);
    canvas.removeEventListener('pointerleave', handlePointerLeave);
    canvas.removeEventListener('pointermove', handlePointerMove);
    canvas.removeEventListener('pointerup', handlePointerUp);
    window.removeEventListener('blur', handleWindowBlur);
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
  };
}

export default function Monolith({
  imageUrl = IMAGE_SRC,
  style,
}: MonolithProps) {
  const mountReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountReference.current;

    if (!container) {
      return;
    }

    const abortController = new AbortController();
    const unmountPromise = mountHalftoneCanvas({
      container,
      imageUrl,
      signal: abortController.signal,
    }).catch((error) => {
      if (error.name !== 'AbortError') {
        console.error(error);
      }
      return undefined;
    });

    return () => {
      abortController.abort();
      void unmountPromise.then((dispose) => dispose?.());
    };
  }, [imageUrl]);

  return (
    <div
      ref={mountReference}
      style={{
        background: DEFAULT_TUNING.backgroundColor,
        height: '100%',
        width: '100%',
        ...style,
      }}
    />
  );
}
