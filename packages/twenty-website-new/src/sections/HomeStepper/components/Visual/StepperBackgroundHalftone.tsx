'use client';

import {
  VIRTUAL_RENDER_HEIGHT,
  getImageFootprintScale,
  getImagePreviewZoom,
} from '@/app/halftone/_lib/footprint';
import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const PREVIEW_DISTANCE = 4;
const HOVER_FADE_IN = 18;
const HOVER_FADE_OUT = 7;

const HALFTONE_SETTINGS = {
  animation: {
    hoverHalftoneEnabled: true,
    hoverHalftonePowerShift: 0.62,
    hoverHalftoneRadius: 0.6,
    hoverHalftoneWidthShift: -0.18,
    hoverLightEnabled: false,
    hoverLightIntensity: 0.12,
    hoverLightRadius: 0.8,
    waveAmount: 2,
    waveEnabled: false,
    waveSpeed: 1,
  },
  halftone: {
    dashColor: '#dddddd',
    hoverDashColor: '#FFF',
    imageContrast: 1.12,
    minimumTone: 0.26,
    power: 0.18,
    scale: 12,
    width: 0.72,
  },
};

const passThroughVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
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

    // Cover: match the underlying NextImage background crop.
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

const halftoneFragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D tScene;
  uniform vec2 effectResolution;
  uniform vec2 logicalResolution;
  uniform float tile;
  uniform float s_3;
  uniform float s_4;
  uniform vec3 dashColor;
  uniform vec3 hoverDashColor;
  uniform float minimumTone;
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
    float tonalAverage = (
      (
        sceneSample.r +
        sceneSample.g +
        sceneSample.b +
        localPower * length(vec2(0.5))
      ) *
      (1.0 / 3.0)
    ) + lightLift;
    float bandRadius = clamp(
      max(tonalAverage, minimumTone),
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

const OverlayRoot = styled.div`
  inset: 0;
  pointer-events: none;
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

function createRenderTarget(width: number, height: number) {
  return new THREE.WebGLRenderTarget(width, height, {
    format: THREE.RGBAFormat,
    magFilter: THREE.LinearFilter,
    minFilter: THREE.LinearFilter,
  });
}

function createPointerState(): PointerState {
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

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}

async function mountHalftoneCanvas({
  container,
  imageUrl,
}: {
  container: HTMLDivElement;
  imageUrl: string;
}) {
  const getHeight = () => Math.max(container.clientHeight, 1);
  const getWidth = () => Math.max(container.clientWidth, 1);
  const getVirtualHeight = () => Math.max(VIRTUAL_RENDER_HEIGHT, getHeight());
  const getVirtualWidth = () =>
    Math.max(
      Math.round(getVirtualHeight() * (getWidth() / Math.max(getHeight(), 1))),
      1,
    );

  const image = await loadImage(imageUrl);

  if (!container.isConnected) {
    return;
  }

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(1);
  renderer.setSize(getVirtualWidth(), getVirtualHeight(), false);

  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.display = 'block';
  canvas.style.height = '100%';
  canvas.style.touchAction = 'auto';
  canvas.style.width = '100%';
  container.appendChild(canvas);

  const interactionTarget = container.parentElement?.parentElement ?? container;

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
      contrast: { value: HALFTONE_SETTINGS.halftone.imageContrast },
      imageSize: { value: new THREE.Vector2(image.width, image.height) },
      tImage: { value: imageTexture },
      viewportSize: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      zoom: { value: getImagePreviewZoom(PREVIEW_DISTANCE) },
    },
    vertexShader: passThroughVertexShader,
  });

  const halftoneMaterial = new THREE.ShaderMaterial({
    fragmentShader: halftoneFragmentShader,
    transparent: true,
    uniforms: {
      cropToBounds: { value: 1 },
      dashColor: {
        value: new THREE.Color(HALFTONE_SETTINGS.halftone.dashColor),
      },
      dragFlowStrength: { value: 0 },
      dragOffset: { value: new THREE.Vector2(0, 0) },
      effectResolution: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      footprintScale: { value: 1 },
      hoverDashColor: {
        value: new THREE.Color(HALFTONE_SETTINGS.halftone.hoverDashColor),
      },
      hoverFlowRadius: { value: 0.18 },
      hoverFlowStrength: { value: 0 },
      hoverHalftoneActive: { value: 0 },
      hoverHalftonePowerShift: {
        value: HALFTONE_SETTINGS.animation.hoverHalftonePowerShift,
      },
      hoverHalftoneRadius: {
        value: HALFTONE_SETTINGS.animation.hoverHalftoneRadius,
      },
      hoverHalftoneWidthShift: { value: 0 },
      hoverLightRadius: {
        value: HALFTONE_SETTINGS.animation.hoverLightRadius,
      },
      hoverLightStrength: { value: 0 },
      interactionUv: { value: new THREE.Vector2(0.5, 0.5) },
      interactionVelocity: { value: new THREE.Vector2(0, 0) },
      logicalResolution: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      minimumTone: { value: HALFTONE_SETTINGS.halftone.minimumTone },
      s_3: { value: HALFTONE_SETTINGS.halftone.power },
      s_4: { value: HALFTONE_SETTINGS.halftone.width },
      tScene: { value: sceneTarget.texture },
      tile: { value: HALFTONE_SETTINGS.halftone.scale },
      time: { value: 0 },
      waveAmount: {
        value: HALFTONE_SETTINGS.animation.waveEnabled
          ? HALFTONE_SETTINGS.animation.waveAmount
          : 0,
      },
      waveSpeed: { value: HALFTONE_SETTINGS.animation.waveSpeed },
    },
    vertexShader: passThroughVertexShader,
  });

  const imageScene = new THREE.Scene();
  imageScene.add(new THREE.Mesh(fullScreenGeometry, imageMaterial));

  const postScene = new THREE.Scene();
  postScene.add(new THREE.Mesh(fullScreenGeometry, halftoneMaterial));

  const updateViewportUniforms = (width: number, height: number) => {
    halftoneMaterial.uniforms.effectResolution.value.set(width, height);
    halftoneMaterial.uniforms.logicalResolution.value.set(width, height);
    imageMaterial.uniforms.viewportSize.value.set(width, height);
  };

  const getHalftoneScale = () =>
    getImageFootprintScale({
      imageHeight: image.height,
      imageWidth: image.width,
      previewDistance: PREVIEW_DISTANCE,
      viewportHeight: getVirtualHeight(),
      viewportWidth: getVirtualWidth(),
    });

  const pointerState = createPointerState();

  const syncSize = () => {
    const virtualWidth = getVirtualWidth();
    const virtualHeight = getVirtualHeight();

    renderer.setSize(virtualWidth, virtualHeight, false);
    sceneTarget.setSize(virtualWidth, virtualHeight);
    updateViewportUniforms(virtualWidth, virtualHeight);
  };

  const resizeObserver = new ResizeObserver(syncSize);
  resizeObserver.observe(container);

  const updatePointerPosition = (
    event: PointerEvent,
    options?: { resetVelocity?: boolean },
  ) => {
    const rect = interactionTarget.getBoundingClientRect();
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

    const deltaX = nextMouseX - pointerState.mouseX;
    const deltaY = nextMouseY - pointerState.mouseY;

    pointerState.mouseX = nextMouseX;
    pointerState.mouseY = nextMouseY;
    pointerState.pointerInside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (options?.resetVelocity) {
      pointerState.pointerVelocityX = 0;
      pointerState.pointerVelocityY = 0;
      pointerState.smoothedMouseX = nextMouseX;
      pointerState.smoothedMouseY = nextMouseY;
      return;
    }

    pointerState.pointerVelocityX = deltaX;
    pointerState.pointerVelocityY = deltaY;
  };

  const handlePointerMove = (event: PointerEvent) => {
    const shouldResetVelocity = !pointerState.pointerInside;
    updatePointerPosition(
      event,
      shouldResetVelocity ? { resetVelocity: true } : undefined,
    );
  };

  const handlePointerLeave = () => {
    pointerState.pointerInside = false;
    pointerState.pointerVelocityX = 0;
    pointerState.pointerVelocityY = 0;
  };

  interactionTarget.addEventListener('pointerleave', handlePointerLeave);
  interactionTarget.addEventListener('pointermove', handlePointerMove);

  const clock = new THREE.Timer();
  clock.connect(document);
  let animationFrameId = 0;

  const renderFrame = (timestamp?: number) => {
    animationFrameId = window.requestAnimationFrame(renderFrame);
    clock.update(timestamp);
    const deltaSeconds = clock.getDelta();
    const hoverEasing =
      1 -
      Math.exp(
        -deltaSeconds *
          (pointerState.pointerInside ? HOVER_FADE_IN : HOVER_FADE_OUT),
      );
    pointerState.hoverStrength +=
      ((pointerState.pointerInside ? 1 : 0) - pointerState.hoverStrength) *
      hoverEasing;

    pointerState.smoothedMouseX +=
      (pointerState.mouseX - pointerState.smoothedMouseX) * 0.38;
    pointerState.smoothedMouseY +=
      (pointerState.mouseY - pointerState.smoothedMouseY) * 0.38;
    pointerState.pointerVelocityX *= 0.82;
    pointerState.pointerVelocityY *= 0.82;

    halftoneMaterial.uniforms.footprintScale.value = getHalftoneScale();
    halftoneMaterial.uniforms.hoverHalftoneActive.value =
      HALFTONE_SETTINGS.animation.hoverHalftoneEnabled
        ? pointerState.hoverStrength
        : 0;
    halftoneMaterial.uniforms.hoverHalftonePowerShift.value =
      HALFTONE_SETTINGS.animation.hoverHalftoneEnabled
        ? HALFTONE_SETTINGS.animation.hoverHalftonePowerShift
        : 0;
    halftoneMaterial.uniforms.hoverHalftoneWidthShift.value =
      HALFTONE_SETTINGS.animation.hoverHalftoneEnabled
        ? HALFTONE_SETTINGS.animation.hoverHalftoneWidthShift
        : 0;
    halftoneMaterial.uniforms.hoverLightStrength.value =
      HALFTONE_SETTINGS.animation.hoverLightEnabled
        ? HALFTONE_SETTINGS.animation.hoverLightIntensity *
          pointerState.hoverStrength
        : 0;
    halftoneMaterial.uniforms.interactionUv.value.set(
      pointerState.smoothedMouseX,
      1 - pointerState.smoothedMouseY,
    );
    halftoneMaterial.uniforms.interactionVelocity.value.set(
      pointerState.pointerVelocityX * getVirtualWidth(),
      -pointerState.pointerVelocityY * getVirtualHeight(),
    );
    halftoneMaterial.uniforms.time.value = clock.getElapsed();
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
    clock.dispose();
    resizeObserver.disconnect();
    interactionTarget.removeEventListener('pointerleave', handlePointerLeave);
    interactionTarget.removeEventListener('pointermove', handlePointerMove);
    fullScreenGeometry.dispose();
    halftoneMaterial.dispose();
    imageMaterial.dispose();
    imageTexture.dispose();
    renderer.dispose();
    sceneTarget.dispose();

    if (canvas.parentNode === container) {
      container.removeChild(canvas);
    }
  };
}

type StepperBackgroundHalftoneProps = {
  imageUrl?: string;
};

export function StepperBackgroundHalftone({
  imageUrl = '/images/home/stepper/background.webp',
}: StepperBackgroundHalftoneProps) {
  const mountReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const container = mountReference.current;

    if (!container) {
      return;
    }

    let cleanup: (() => void) | undefined;
    let isDisposed = false;

    void mountHalftoneCanvas({ container, imageUrl })
      .then((nextCleanup) => {
        if (!nextCleanup) {
          return;
        }

        if (isDisposed) {
          nextCleanup();
          return;
        }

        cleanup = nextCleanup;
      })
      .catch((error: unknown) => {
        console.error(error);
      });

    return () => {
      isDisposed = true;
      cleanup?.();
    };
  }, [imageUrl]);

  return <OverlayRoot aria-hidden ref={mountReference} />;
}
