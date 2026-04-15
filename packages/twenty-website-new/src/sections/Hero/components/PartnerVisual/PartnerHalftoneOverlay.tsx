'use client';

import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const PREVIEW_DISTANCE = 3.2;
const SOURCE_PREVIEW_DISTANCE = 6.1;
const REFERENCE_PREVIEW_DISTANCE = 4;
const VIRTUAL_RENDER_HEIGHT = 768;

const HALFTONE_TILE_SIZE = 10;
const HALFTONE_POWER = -0.1;
const HALFTONE_WIDTH = 0.45;
const HALFTONE_CONTRAST = 1;
const HALFTONE_DASH_COLOR = '#959595';
const HALFTONE_HOVER_COLOR = '#4A38F5';
const HALFTONE_HOVER_RADIUS = 0.6;
const HALFTONE_HOVER_POWER_SHIFT = 0.9;
const HALFTONE_HOVER_WIDTH_SHIFT = -0.2;
const HALFTONE_HOVER_LIGHT_INTENSITY = 0;
const HALFTONE_HOVER_LIGHT_RADIUS = 0.2;
const HALFTONE_HOVER_FADE_IN = 18;
const HALFTONE_HOVER_FADE_OUT = 7;

const IMAGE_POINTER_FOLLOW = 0.38;
const IMAGE_POINTER_VELOCITY_DAMPING = 0.82;
const MIN_FOOTPRINT_SCALE = 0.001;

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

  varying vec2 vUv;

  void main() {
    float imageAspect = imageSize.x / imageSize.y;
    float viewAspect = viewportSize.x / viewportSize.y;

    vec2 uv = vUv;

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
  uniform vec3 dashColor;
  uniform vec3 hoverDashColor;
  uniform float time;
  uniform float waveAmount;
  uniform float waveSpeed;
  uniform float footprintScale;
  uniform vec2 interactionUv;
  uniform vec2 interactionVelocity;
  uniform vec2 dragOffset;
  uniform float hoverHalftoneActive;
  uniform float hoverHalftonePowerShift;
  uniform float hoverHalftoneRadius;
  uniform float hoverHalftoneWidthShift;
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

    float hoverHalftoneMask = 0.0;
    if (hoverHalftoneActive > 0.0) {
      float hoverHalftoneRadiusPx = hoverHalftoneRadius * logicalResolution.y;
      hoverHalftoneMask =
        smoothstep(hoverHalftoneRadiusPx, 0.0, fragDist) *
        clamp(hoverHalftoneActive, 0.0, 1.0);
    }

    float hoverFlowMask = 0.0;
    if (hoverFlowStrength > 0.0) {
      float hoverRadiusPx = hoverFlowRadius * logicalResolution.y;
      hoverFlowMask = smoothstep(hoverRadiusPx, 0.0, fragDist);
    }

    vec2 hoverDisplacement =
      radialDir * hoverFlowStrength * hoverFlowMask * halftoneSize * 0.55 +
      motionDir * hoverFlowStrength * hoverFlowMask * (0.4 + motionBias) * halftoneSize * 1.15;
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
    float localPower = clamp(
      s_3 + hoverHalftonePowerShift * hoverHalftoneMask,
      -1.5,
      1.5
    );
    float localWidth = clamp(
      s_4 + hoverHalftoneWidthShift * hoverHalftoneMask,
      0.05,
      1.4
    );
    float lightLift =
      hoverLightStrength * hoverLightMask * mix(0.78, 1.18, motionBias) * 0.22;
    float bandRadius = clamp(
      (
        (
          sceneSample.r +
          sceneSample.g +
          sceneSample.b +
          localPower * length(vec2(0.5))
        ) *
        (1.0 / 3.0)
      ) + lightLift,
      0.0,
      1.0
    ) * 1.86 * 0.5;

    float alpha = 0.0;
    if (bandRadius > 0.0001) {
      float signedDistance = lineSimpleEt(cellUv, bandRadius, localWidth);
      float edge = 0.02;
      alpha = (1.0 - smoothstep(0.0, edge, signedDistance)) * mask;
    }

    vec3 activeDashColor = mix(dashColor, hoverDashColor, hoverHalftoneMask);
    vec3 color = activeDashColor * alpha;
    gl_FragColor = vec4(color, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const OverlayMount = styled.div`
  inset: 0;
  position: absolute;
  z-index: 1;
`;

type PointerState = {
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
  rect: { height: number; width: number; x: number; y: number },
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
    height: maxY - minY,
    width: maxX - minX,
    x: minX,
    y: minY,
  };
}

function getRectArea(rect: { height: number; width: number } | null) {
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
  currentRect: { height: number; width: number } | null,
  referenceRect: { height: number; width: number } | null,
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

function getRelativeImageScale({
  imageHeight,
  imageWidth,
  previewDistance,
  referencePreviewDistance,
  viewportHeight,
  viewportWidth,
}: {
  imageHeight: number;
  imageWidth: number;
  previewDistance: number;
  referencePreviewDistance: number;
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
    zoom: getImagePreviewZoom(referencePreviewDistance),
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

function loadImage(imageUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error(`Failed to load hero image: ${imageUrl}`));
    image.src = imageUrl;
  });
}

async function mountHalftoneOverlay({
  container,
  imageUrl,
}: {
  container: HTMLDivElement;
  imageUrl: string;
}): Promise<() => void> {
  const image = await loadImage(imageUrl);

  const getWidth = () => Math.max(container.clientWidth, 1);
  const getHeight = () => Math.max(container.clientHeight, 1);
  const getVirtualHeight = () => Math.max(VIRTUAL_RENDER_HEIGHT, getHeight());
  const getVirtualWidth = () =>
    Math.max(
      Math.round(getVirtualHeight() * (getWidth() / Math.max(getHeight(), 1))),
      1,
    );

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(getVirtualWidth(), getVirtualHeight(), false);

  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cursor = 'crosshair';
  canvas.style.display = 'block';
  canvas.style.height = '100%';
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

  const imageMaterial = new THREE.ShaderMaterial({
    fragmentShader: imagePassthroughFragmentShader,
    uniforms: {
      contrast: { value: HALFTONE_CONTRAST },
      imageSize: { value: new THREE.Vector2(image.width, image.height) },
      tImage: { value: imageTexture },
      viewportSize: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      zoom: { value: getImagePreviewZoom(PREVIEW_DISTANCE) },
    },
    vertexShader: passThroughVertexShader,
  });

  const imageScene = new THREE.Scene();
  imageScene.add(new THREE.Mesh(fullScreenGeometry, imageMaterial));

  const halftoneMaterial = new THREE.ShaderMaterial({
    fragmentShader: halftoneFragmentShader,
    transparent: true,
    uniforms: {
      cropToBounds: { value: 1 },
      dashColor: { value: new THREE.Color(HALFTONE_DASH_COLOR) },
      dragFlowStrength: { value: 0 },
      dragOffset: { value: new THREE.Vector2(0, 0) },
      effectResolution: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      footprintScale: { value: 1 },
      hoverDashColor: { value: new THREE.Color(HALFTONE_HOVER_COLOR) },
      hoverFlowRadius: { value: 0.18 },
      hoverFlowStrength: { value: 0 },
      hoverHalftoneActive: { value: 0 },
      hoverHalftonePowerShift: { value: 0 },
      hoverHalftoneRadius: { value: HALFTONE_HOVER_RADIUS },
      hoverHalftoneWidthShift: { value: 0 },
      hoverLightRadius: { value: HALFTONE_HOVER_LIGHT_RADIUS },
      hoverLightStrength: { value: 0 },
      interactionUv: { value: new THREE.Vector2(0.5, 0.5) },
      interactionVelocity: { value: new THREE.Vector2(0, 0) },
      logicalResolution: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      s_3: { value: HALFTONE_POWER },
      s_4: { value: HALFTONE_WIDTH },
      tScene: { value: sceneTarget.texture },
      tile: { value: HALFTONE_TILE_SIZE },
      time: { value: 0 },
      waveAmount: { value: 0 },
      waveSpeed: { value: 1 },
    },
    vertexShader: passThroughVertexShader,
  });

  const postScene = new THREE.Scene();
  postScene.add(new THREE.Mesh(fullScreenGeometry, halftoneMaterial));

  const updateViewportUniforms = ({
    effectHeight,
    effectWidth,
    logicalHeight,
    logicalWidth,
  }: {
    effectHeight: number;
    effectWidth: number;
    logicalHeight: number;
    logicalWidth: number;
  }) => {
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

  const getHoverScale = () =>
    getRelativeImageScale({
      imageHeight: image.height,
      imageWidth: image.width,
      previewDistance: PREVIEW_DISTANCE,
      referencePreviewDistance: SOURCE_PREVIEW_DISTANCE,
      viewportHeight: getVirtualHeight(),
      viewportWidth: getVirtualWidth(),
    });

  const pointer: PointerState = {
    hoverStrength: 0,
    mouseX: 0.5,
    mouseY: 0.5,
    pointerInside: false,
    pointerVelocityX: 0,
    pointerVelocityY: 0,
    smoothedMouseX: 0.5,
    smoothedMouseY: 0.5,
  };

  const syncSize = () => {
    const virtualWidth = getVirtualWidth();
    const virtualHeight = getVirtualHeight();

    renderer.setSize(virtualWidth, virtualHeight, false);
    sceneTarget.setSize(virtualWidth, virtualHeight);
    updateViewportUniforms({
      effectHeight: virtualHeight,
      effectWidth: virtualWidth,
      logicalHeight: virtualHeight,
      logicalWidth: virtualWidth,
    });
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

    const deltaX = nextMouseX - pointer.mouseX;
    const deltaY = nextMouseY - pointer.mouseY;

    pointer.mouseX = nextMouseX;
    pointer.mouseY = nextMouseY;
    pointer.pointerInside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (options?.resetVelocity) {
      pointer.pointerVelocityX = 0;
      pointer.pointerVelocityY = 0;
      pointer.smoothedMouseX = nextMouseX;
      pointer.smoothedMouseY = nextMouseY;
      return;
    }

    pointer.pointerVelocityX = deltaX;
    pointer.pointerVelocityY = deltaY;
  };

  const handlePointerMove = (event: PointerEvent) => {
    const resetVelocity = !pointer.pointerInside;
    updatePointerPosition(
      event,
      resetVelocity ? { resetVelocity: true } : undefined,
    );
  };

  const handlePointerLeave = () => {
    pointer.pointerInside = false;
    pointer.pointerVelocityX = 0;
    pointer.pointerVelocityY = 0;
  };

  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerleave', handlePointerLeave);

  let animationFrameId = 0;
  let previousTimestamp = 0;

  const renderFrame = (timestamp: number) => {
    animationFrameId = window.requestAnimationFrame(renderFrame);
    halftoneMaterial.uniforms.time.value = timestamp / 1000;
    const hoverScale = getHoverScale();
    const deltaSeconds =
      previousTimestamp === 0
        ? 1 / 60
        : Math.min((timestamp - previousTimestamp) / 1000, 0.1);
    previousTimestamp = timestamp;
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
    pointer.pointerVelocityX *= IMAGE_POINTER_VELOCITY_DAMPING;
    pointer.pointerVelocityY *= IMAGE_POINTER_VELOCITY_DAMPING;

    halftoneMaterial.uniforms.interactionUv.value.set(
      pointer.smoothedMouseX,
      1 - pointer.smoothedMouseY,
    );
    halftoneMaterial.uniforms.interactionVelocity.value.set(
      pointer.pointerVelocityX * getVirtualWidth(),
      -pointer.pointerVelocityY * getVirtualHeight(),
    );
    halftoneMaterial.uniforms.hoverHalftoneActive.value = pointer.hoverStrength;
    halftoneMaterial.uniforms.hoverHalftonePowerShift.value =
      HALFTONE_HOVER_POWER_SHIFT;
    halftoneMaterial.uniforms.hoverHalftoneRadius.value =
      HALFTONE_HOVER_RADIUS * hoverScale;
    halftoneMaterial.uniforms.hoverHalftoneWidthShift.value =
      HALFTONE_HOVER_WIDTH_SHIFT;
    halftoneMaterial.uniforms.hoverLightStrength.value =
      HALFTONE_HOVER_LIGHT_INTENSITY * pointer.hoverStrength;
    halftoneMaterial.uniforms.hoverLightRadius.value =
      HALFTONE_HOVER_LIGHT_RADIUS * hoverScale;
    halftoneMaterial.uniforms.footprintScale.value = getHalftoneScale();
    imageMaterial.uniforms.zoom.value = getImagePreviewZoom(PREVIEW_DISTANCE);

    renderer.setRenderTarget(sceneTarget);
    renderer.render(imageScene, orthographicCamera);

    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(postScene, orthographicCamera);
  };

  renderFrame(0);

  return () => {
    window.cancelAnimationFrame(animationFrameId);
    resizeObserver.disconnect();
    canvas.removeEventListener('pointermove', handlePointerMove);
    canvas.removeEventListener('pointerleave', handlePointerLeave);
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

type PartnerHalftoneOverlayProps = {
  imageUrl: string;
};

export function PartnerHalftoneOverlay({
  imageUrl,
}: PartnerHalftoneOverlayProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const container = mountRef.current;

    if (!container) {
      return;
    }

    let disposed = false;
    const disposePromise = mountHalftoneOverlay({ container, imageUrl }).catch(
      (error) => {
        console.error(error);
        return undefined;
      },
    );

    return () => {
      disposed = true;

      void disposePromise.then((dispose) => {
        if (!disposed) {
          return;
        }

        dispose?.();
      });
    };
  }, [imageUrl]);

  return <OverlayMount ref={mountRef} />;
}
