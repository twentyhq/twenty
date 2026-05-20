'use client';

import { createAnimationFrameLoop } from '@/lib/animation';
import {
  createVisualRenderLoop,
  loadVisualImage,
  tryCreateSiteWebGlRenderer,
  type VisualRenderLoopFrame,
  type VisualRenderLoop,
} from '@/lib/visual-runtime';
import { observeElementSize } from '@/lib/dom/observe-element-size';
import { useEffect, useState, type RefObject } from 'react';
import * as THREE from 'three';

const HOME_BACKGROUND_IMAGE_URL =
  '/illustrations/generated/home-background-bridge.png';

const REFERENCE_PREVIEW_DISTANCE = 4;

type HomeBackgroundBreakpoint = 'mobile' | 'tablet' | 'desktop';

type HomeBackgroundTuneValues = {
  horizontalOffsetPx: number;
  previewDistance: number;
  verticalAnchor: number;
  verticalOffsetPx: number;
};

const HOME_BACKGROUND_BREAKPOINT_MAX_WIDTHS: Record<
  Exclude<HomeBackgroundBreakpoint, 'desktop'>,
  number
> = {
  mobile: 767,
  tablet: 1199,
};

const HOME_BACKGROUND_TUNE_VALUES: Record<
  HomeBackgroundBreakpoint,
  HomeBackgroundTuneValues
> = {
  desktop: {
    horizontalOffsetPx: -151,
    previewDistance: 3.2,
    verticalAnchor: 0.5,
    verticalOffsetPx: 224,
  },
  mobile: {
    horizontalOffsetPx: -60,
    previewDistance: 3.2,
    verticalAnchor: 0,
    verticalOffsetPx: 0,
  },
  tablet: {
    horizontalOffsetPx: -120,
    previewDistance: 3.2,
    verticalAnchor: 0.5,
    verticalOffsetPx: 0,
  },
};

function getHomeBackgroundBreakpoint(
  viewportWidth: number,
): HomeBackgroundBreakpoint {
  if (viewportWidth <= HOME_BACKGROUND_BREAKPOINT_MAX_WIDTHS.mobile) {
    return 'mobile';
  }
  if (viewportWidth <= HOME_BACKGROUND_BREAKPOINT_MAX_WIDTHS.tablet) {
    return 'tablet';
  }
  return 'desktop';
}

function getActiveTuneValues(): HomeBackgroundTuneValues {
  const key =
    typeof window !== 'undefined'
      ? getHomeBackgroundBreakpoint(window.innerWidth)
      : 'desktop';
  return HOME_BACKGROUND_TUNE_VALUES[key];
}

const VIRTUAL_RENDER_HEIGHT = 768;
const MIN_FOOTPRINT_SCALE = 0.001;

const HALFTONE_EDGE_FADE_X = 0;
const HALFTONE_EDGE_FADE_Y = 0;
const HALFTONE_TILE_SIZE = 12;
const HALFTONE_POWER = -0.07;
const HALFTONE_WIDTH = 0.34;
const HALFTONE_CONTRAST = 1;
const HALFTONE_DASH_COLOR = '#4A38F5';
const HALFTONE_HOVER_COLOR = '#4A38F5';
const HALFTONE_HOVER_LIGHT_INTENSITY = 0.8;
const HALFTONE_HOVER_LIGHT_RADIUS = 0.14;
const HALFTONE_HOVER_VERTICAL_FADE = 0.5;
const HALFTONE_HOVER_FADE_IN = 18;
const HALFTONE_HOVER_FADE_OUT = 7;

const IMAGE_POINTER_FOLLOW = 0.38;
const IMAGE_POINTER_VELOCITY_DAMPING = 0.82;

const passThroughVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const imagePassthroughFragmentShader = `
  precision highp float;

  uniform sampler2D tImage;
  uniform vec2 imageSize;
  uniform vec2 viewportSize;
  uniform float zoom;
  uniform float contrast;
  uniform float verticalPixelOffset;
  uniform float horizontalPixelOffset;
  uniform float verticalAnchor;

  varying vec2 vUv;

  void main() {
    float imageAspect = imageSize.x / imageSize.y;
    float viewAspect = viewportSize.x / viewportSize.y;

    vec2 uv = vUv;

    // Always fit by width: the full horizontal span of the image is visible at
    // any container aspect ratio. Wider containers crop top/bottom of the
    // image; taller containers letterbox. verticalAnchor controls which edge
    // the letterboxed image sits against (0 = bottom, 0.5 = center, 1 = top).
    uv.y = (uv.y - verticalAnchor) * (imageAspect / viewAspect) + verticalAnchor;

    uv = (uv - 0.5) / zoom + 0.5;

    // Shift sampled image content on the canvas by the pixel offsets.
    uv.y += verticalPixelOffset / max(viewportSize.y, 1.0);
    uv.x -= horizontalPixelOffset / max(viewportSize.x, 1.0);

    float inBounds = step(0.0, uv.x) * step(uv.x, 1.0)
                   * step(0.0, uv.y) * step(uv.y, 1.0);

    vec4 color = texture2D(tImage, clamp(uv, 0.0, 1.0));
    vec3 contrastColor = clamp((color.rgb - 0.5) * contrast + 0.5, 0.0, 1.0);

    gl_FragColor = vec4(contrastColor, inBounds);
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
  uniform float applyToDarkAreas;
  uniform vec3 dashColor;
  uniform vec3 hoverDashColor;
  uniform float footprintScale;
  uniform vec2 interactionUv;
  uniform float hoverLightStrength;
  uniform float hoverLightRadius;
  uniform float hoverVerticalFade;
  uniform float cropToBounds;
  uniform vec2 edgeFade;

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

    float hoverLightMask = 0.0;
    if (hoverLightStrength > 0.0) {
      float lightRadiusPx = hoverLightRadius * logicalResolution.y;
      hoverLightMask = smoothstep(lightRadiusPx, 0.0, fragDist);
      float fadeRange = max(hoverVerticalFade, 0.0001);
      float verticalHoverFade =
        smoothstep(0.0, fadeRange, vUv.y) *
        smoothstep(0.0, fadeRange, 1.0 - vUv.y);
      hoverLightMask *= verticalHoverFade;
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
    float localPower = clamp(s_3, -1.5, 1.5);
    float localWidth = clamp(s_4, 0.05, 1.4);
    float lightLift = hoverLightStrength * hoverLightMask * 0.22;
    float toneValue =
      (sceneSample.r + sceneSample.g + sceneSample.b) * (1.0 / 3.0);
    if (applyToDarkAreas > 0.5) {
      toneValue = 1.0 - toneValue;
    }
    float bandRadius = clamp(
      toneValue + localPower * length(vec2(0.5)) + lightLift,
      0.0,
      1.0
    ) * 1.86 * 0.5;

    float alpha = 0.0;
    if (bandRadius > 0.0001) {
      float signedDistance = lineSimpleEt(cellUv, bandRadius, localWidth);
      float edge = 0.02;
      alpha = (1.0 - smoothstep(0.0, edge, signedDistance)) * mask;
    }

    // Fade halftone alpha toward the canvas edges so hovering into / out of
    // the region is a gradual visual transition rather than a hard cutoff.
    float edgeFadeMask =
      smoothstep(0.0, max(edgeFade.x, 0.0001), vUv.x) *
      smoothstep(0.0, max(edgeFade.x, 0.0001), 1.0 - vUv.x) *
      smoothstep(0.0, max(edgeFade.y, 0.0001), vUv.y) *
      smoothstep(0.0, max(edgeFade.y, 0.0001), 1.0 - vUv.y);
    alpha *= edgeFadeMask;

    vec3 activeDashColor = mix(dashColor, hoverDashColor, hoverLightMask);
    vec3 color = activeDashColor * alpha;
    gl_FragColor = vec4(color, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

type Rect = { height: number; width: number; x: number; y: number };

function clampRectToViewport(
  rect: Rect,
  viewportWidth: number,
  viewportHeight: number,
): Rect | null {
  const minX = Math.max(rect.x, 0);
  const minY = Math.max(rect.y, 0);
  const maxX = Math.min(rect.x + rect.width, viewportWidth);
  const maxY = Math.min(rect.y + rect.height, viewportHeight);

  if (maxX <= minX || maxY <= minY) {
    return null;
  }

  return {
    height: maxY - minY,
    width: maxX - minX,
    x: minX,
    y: minY,
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
}): Rect | null {
  if (
    imageWidth <= 0 ||
    imageHeight <= 0 ||
    viewportWidth <= 0 ||
    viewportHeight <= 0
  ) {
    return null;
  }

  const imageAspect = imageWidth / imageHeight;

  const fittedWidth = viewportWidth;
  const fittedHeight = viewportWidth / imageAspect;

  const scaledWidth = fittedWidth * zoom;
  const scaledHeight = fittedHeight * zoom;

  return clampRectToViewport(
    {
      height: scaledHeight,
      width: scaledWidth,
      x: (viewportWidth - scaledWidth) * 0.5,
      y: (viewportHeight - scaledHeight) * 0.5,
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
    format: THREE.RGBAFormat,
    magFilter: THREE.LinearFilter,
    minFilter: THREE.LinearFilter,
  });
}

type PointerState = {
  hoverStrength: number;
  mouseX: number;
  mouseY: number;
  pointerInside: boolean;
  smoothedMouseX: number;
  smoothedMouseY: number;
};

async function mountHomeBackgroundCanvas({
  container,
  imageUrl,
}: {
  container: HTMLDivElement;
  imageUrl: string;
}): Promise<() => void> {
  const image = await loadVisualImage(imageUrl, {
    label: 'home background image',
  });

  const getWidth = () => Math.max(container.clientWidth, 1);
  const getHeight = () => Math.max(container.clientHeight, 1);
  const getVirtualHeight = () => Math.max(VIRTUAL_RENDER_HEIGHT, getHeight());
  const getVirtualWidth = () =>
    Math.max(
      Math.round(getVirtualHeight() * (getWidth() / Math.max(getHeight(), 1))),
      1,
    );

  let renderLoop: VisualRenderLoop | null = null;
  const renderer = tryCreateSiteWebGlRenderer({
    alpha: true,
    antialias: false,
    onContextLost: () => {
      renderLoop?.stop();
    },
    powerPreference: 'high-performance',
  });

  if (renderer === null) {
    return () => {};
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(getVirtualWidth(), getVirtualHeight(), false);

  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.display = 'block';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.width = '100%';
  container.appendChild(canvas);

  const imageTexture = new THREE.Texture(image);
  imageTexture.colorSpace = THREE.SRGBColorSpace;
  imageTexture.generateMipmaps = false;
  imageTexture.magFilter = THREE.LinearFilter;
  imageTexture.minFilter = THREE.LinearFilter;
  imageTexture.needsUpdate = true;

  const sceneTarget = createRenderTarget(getVirtualWidth(), getVirtualHeight());
  const fullScreenGeometry = new THREE.PlaneGeometry(2, 2);
  const orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const initialTune = getActiveTuneValues();
  const imageMaterial = new THREE.ShaderMaterial({
    fragmentShader: imagePassthroughFragmentShader,
    uniforms: {
      contrast: { value: HALFTONE_CONTRAST },
      horizontalPixelOffset: { value: initialTune.horizontalOffsetPx },
      imageSize: { value: new THREE.Vector2(image.width, image.height) },
      tImage: { value: imageTexture },
      verticalAnchor: { value: initialTune.verticalAnchor },
      verticalPixelOffset: { value: initialTune.verticalOffsetPx },
      viewportSize: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      zoom: {
        value: getImagePreviewZoom(initialTune.previewDistance),
      },
    },
    vertexShader: passThroughVertexShader,
  });

  const imageScene = new THREE.Scene();
  imageScene.add(new THREE.Mesh(fullScreenGeometry, imageMaterial));

  const halftoneMaterial = new THREE.ShaderMaterial({
    fragmentShader: halftoneFragmentShader,
    transparent: true,
    uniforms: {
      applyToDarkAreas: { value: 1 },
      cropToBounds: { value: 1 },
      dashColor: { value: new THREE.Color(HALFTONE_DASH_COLOR) },
      edgeFade: {
        value: new THREE.Vector2(HALFTONE_EDGE_FADE_X, HALFTONE_EDGE_FADE_Y),
      },
      effectResolution: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      footprintScale: { value: 1 },
      hoverDashColor: { value: new THREE.Color(HALFTONE_HOVER_COLOR) },
      hoverLightRadius: { value: HALFTONE_HOVER_LIGHT_RADIUS },
      hoverLightStrength: { value: 0 },
      hoverVerticalFade: { value: HALFTONE_HOVER_VERTICAL_FADE },
      interactionUv: { value: new THREE.Vector2(0.5, 0.5) },
      logicalResolution: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      s_3: { value: HALFTONE_POWER },
      s_4: { value: HALFTONE_WIDTH },
      tScene: { value: sceneTarget.texture },
      tile: { value: HALFTONE_TILE_SIZE },
    },
    vertexShader: passThroughVertexShader,
  });

  const postScene = new THREE.Scene();
  postScene.add(new THREE.Mesh(fullScreenGeometry, halftoneMaterial));

  const updateViewportUniforms = (
    logicalWidth: number,
    logicalHeight: number,
    effectWidth: number,
    effectHeight: number,
  ) => {
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

  const syncSize = () => {
    const virtualWidth = getVirtualWidth();
    const virtualHeight = getVirtualHeight();

    renderer.setSize(virtualWidth, virtualHeight, false);
    sceneTarget.setSize(virtualWidth, virtualHeight);
    updateViewportUniforms(
      virtualWidth,
      virtualHeight,
      virtualWidth,
      virtualHeight,
    );
  };

  const stopObservingSize = observeElementSize(container, syncSize);

  const pointer: PointerState = {
    hoverStrength: 0,
    mouseX: 0.5,
    mouseY: 0.5,
    pointerInside: false,
    smoothedMouseX: 0.5,
    smoothedMouseY: 0.5,
  };

  const updatePointerPosition = (event: PointerEvent) => {
    const rect = container.getBoundingClientRect();
    const width = Math.max(rect.width, 1);
    const height = Math.max(rect.height, 1);

    pointer.mouseX = (event.clientX - rect.left) / width;
    pointer.mouseY = (event.clientY - rect.top) / height;
    pointer.pointerInside = true;
  };

  const handlePointerMove = (event: PointerEvent) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('[data-halftone-exclude]')) {
      pointer.pointerInside = false;
      return;
    }
    updatePointerPosition(event);
  };

  const handlePointerLeave = () => {
    pointer.pointerInside = false;
  };

  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerleave', handlePointerLeave);
  window.addEventListener('blur', handlePointerLeave);

  const getHalftoneFootprintScale = () =>
    getImageFootprintScale({
      imageHeight: image.height,
      imageWidth: image.width,
      previewDistance: getActiveTuneValues().previewDistance,
      viewportHeight: getVirtualHeight(),
      viewportWidth: getVirtualWidth(),
    });

  const renderFrame = (
    _timestamp: DOMHighResTimeStamp,
    { deltaSeconds }: VisualRenderLoopFrame,
  ) => {
    const hoverEasing =
      1 -
      Math.exp(
        -deltaSeconds *
          (pointer.pointerInside
            ? HALFTONE_HOVER_FADE_IN
            : HALFTONE_HOVER_FADE_OUT),
      );
    pointer.hoverStrength +=
      ((pointer.pointerInside ? 1 : 0) - pointer.hoverStrength) * hoverEasing;

    pointer.smoothedMouseX +=
      (pointer.mouseX - pointer.smoothedMouseX) * IMAGE_POINTER_FOLLOW;
    pointer.smoothedMouseY +=
      (pointer.mouseY - pointer.smoothedMouseY) * IMAGE_POINTER_FOLLOW;

    halftoneMaterial.uniforms.interactionUv.value.set(
      pointer.smoothedMouseX,
      1 - pointer.smoothedMouseY,
    );
    halftoneMaterial.uniforms.hoverLightStrength.value =
      HALFTONE_HOVER_LIGHT_INTENSITY * pointer.hoverStrength;
    const active = getActiveTuneValues();
    imageMaterial.uniforms.zoom.value = getImagePreviewZoom(
      active.previewDistance,
    );
    imageMaterial.uniforms.verticalPixelOffset.value = active.verticalOffsetPx;
    imageMaterial.uniforms.horizontalPixelOffset.value =
      active.horizontalOffsetPx;
    imageMaterial.uniforms.verticalAnchor.value = active.verticalAnchor;
    halftoneMaterial.uniforms.footprintScale.value =
      getHalftoneFootprintScale();

    renderer.setRenderTarget(sceneTarget);
    renderer.render(imageScene, orthographicCamera);

    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(postScene, orthographicCamera);
  };

  void IMAGE_POINTER_VELOCITY_DAMPING;

  renderLoop = createVisualRenderLoop({
    renderFrame,
    target: container,
    targetVisibilityOptions: { rootMargin: '100px' },
  });
  renderLoop.start();

  return () => {
    renderLoop?.dispose();
    stopObservingSize();
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerleave', handlePointerLeave);
    window.removeEventListener('blur', handlePointerLeave);
    halftoneMaterial.dispose();
    imageMaterial.dispose();
    imageTexture.dispose();
    fullScreenGeometry.dispose();
    sceneTarget.dispose();
    renderer.dispose();

    if (canvas.parentNode === container) {
      container.removeChild(canvas);
    }
  };
}

export function useHomeBackgroundHalftone({
  mountRef,
}: {
  mountRef: RefObject<HTMLDivElement | null>;
}) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const container = mountRef.current;

    if (!container) {
      return;
    }

    let disposed = false;
    let unmount: (() => void) | null = null;
    const readyTask = createAnimationFrameLoop({
      onFrame: () => {
        setIsReady(true);
        return false;
      },
    });

    mountHomeBackgroundCanvas({
      container,
      imageUrl: HOME_BACKGROUND_IMAGE_URL,
    })
      .then((dispose) => {
        if (disposed) {
          dispose();
          return;
        }
        unmount = dispose;
        readyTask.start();
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      disposed = true;
      readyTask.stop();
      unmount?.();
    };
  }, [mountRef]);

  return isReady;
}
