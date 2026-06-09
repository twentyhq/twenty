'use client';

import { createAnimationFrameLoop } from '@/lib/animation';
import { observeElementSize } from '@/lib/dom/observe-element-size';
import {
  createVisualRenderLoop,
  loadVisualImage,
  tryCreateSiteWebGlRenderer,
  type VisualRenderLoop,
  type VisualRenderLoopFrame,
} from '@/lib/visual-runtime';
import { useEffect, useState, type RefObject } from 'react';
import * as THREE from 'three';

const VIRTUAL_RENDER_HEIGHT = 800;

const HALFTONE_TILE_SIZE = 8;
const HALFTONE_POWER = 0.1;
const HALFTONE_WIDTH = 0.52;
const HALFTONE_CONTRAST = 0.95;
const HALFTONE_DASH_COLOR = '#ffffff';
const HALFTONE_HOVER_COLOR = '#ffffff';
const HALFTONE_HOVER_LIGHT_INTENSITY = 0.8;
const HALFTONE_HOVER_LIGHT_RADIUS = 0.14;
const HALFTONE_HOVER_VERTICAL_FADE = 0.5;
const HALFTONE_HOVER_FADE_IN = 18;
const HALFTONE_HOVER_FADE_OUT = 7;

const IMAGE_POINTER_FOLLOW = 0.38;

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
  uniform float contrast;

  varying vec2 vUv;

  void main() {
    float imageAspect = imageSize.x / imageSize.y;
    float viewAspect = viewportSize.x / viewportSize.y;

    vec2 uv = vUv - 0.5;
    float coverRatio = imageAspect / viewAspect;
    if (coverRatio > 1.0) {
      uv.x /= coverRatio;
    } else {
      uv.y *= coverRatio;
    }
    uv += 0.5;

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
  uniform vec2 interactionUv;
  uniform float hoverLightStrength;
  uniform float hoverLightRadius;
  uniform float hoverVerticalFade;

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
    // Only draw within the image footprint.
    vec4 boundsCheck = texture2D(tScene, vUv);
    if (boundsCheck.a < 0.01) {
      gl_FragColor = vec4(0.0);
      return;
    }

    vec2 fragCoord =
      (gl_FragCoord.xy / max(effectResolution, vec2(1.0))) * logicalResolution;
    float halftoneSize = max(tile, 1.0);
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

    vec2 cellIndex = floor(fragCoord / halftoneSize);
    vec2 sampleUv = clamp(
      (cellIndex + 0.5) * halftoneSize / logicalResolution,
      vec2(0.0),
      vec2(1.0)
    );
    vec2 cellUv = fract(fragCoord / halftoneSize);

    vec4 sceneSample = texture2D(tScene, sampleUv);
    float mask = smoothstep(0.02, 0.08, sceneSample.a);
    float localPower = clamp(s_3, -1.5, 1.5);
    float localWidth = clamp(s_4, 0.05, 1.4);
    float lightLift = hoverLightStrength * hoverLightMask * 0.22;
    float toneValue =
      (sceneSample.r + sceneSample.g + sceneSample.b) * (1.0 / 3.0);
    float bandRadius = clamp(
      toneValue + localPower * length(vec2(0.5)) * (1.0 / 3.0) + lightLift,
      0.0,
      1.0
    ) * 1.86 * 0.5;

    float alpha = 0.0;
    if (bandRadius > 0.0001) {
      float signedDistance = lineSimpleEt(cellUv, bandRadius, localWidth);
      float edge = 0.02;
      alpha = (1.0 - smoothstep(0.0, edge, signedDistance)) * mask;
    }

    vec3 activeDashColor = mix(dashColor, hoverDashColor, hoverLightMask);
    vec3 color = activeDashColor * alpha;
    gl_FragColor = vec4(color, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

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

async function mountProductBackgroundCanvas({
  container,
  imageUrl,
  dashColor = HALFTONE_DASH_COLOR,
  hoverColor = HALFTONE_HOVER_COLOR,
}: {
  container: HTMLDivElement;
  imageUrl: string;
  dashColor?: string;
  hoverColor?: string;
}): Promise<() => void> {
  const image = await loadVisualImage(imageUrl, {
    label: 'product background image',
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

  const imageMaterial = new THREE.ShaderMaterial({
    fragmentShader: imagePassthroughFragmentShader,
    uniforms: {
      contrast: { value: HALFTONE_CONTRAST },
      imageSize: { value: new THREE.Vector2(image.width, image.height) },
      tImage: { value: imageTexture },
      viewportSize: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
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
      dashColor: { value: new THREE.Color(dashColor) },
      effectResolution: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      hoverDashColor: { value: new THREE.Color(hoverColor) },
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

  const syncSize = () => {
    const virtualWidth = getVirtualWidth();
    const virtualHeight = getVirtualHeight();

    renderer.setSize(virtualWidth, virtualHeight, false);
    sceneTarget.setSize(virtualWidth, virtualHeight);
    halftoneMaterial.uniforms.effectResolution.value.set(
      virtualWidth,
      virtualHeight,
    );
    halftoneMaterial.uniforms.logicalResolution.value.set(
      virtualWidth,
      virtualHeight,
    );
    imageMaterial.uniforms.viewportSize.value.set(virtualWidth, virtualHeight);
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
    updatePointerPosition(event);
  };

  const handlePointerLeave = () => {
    pointer.pointerInside = false;
  };

  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerleave', handlePointerLeave);
  window.addEventListener('blur', handlePointerLeave);

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

    renderer.setRenderTarget(sceneTarget);
    renderer.render(imageScene, orthographicCamera);

    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(postScene, orthographicCamera);
  };

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

export function useProductBackgroundHalftone({
  imageUrl,
  dashColor,
  hoverColor,
  mountRef,
}: {
  imageUrl: string;
  dashColor?: string;
  hoverColor?: string;
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

    mountProductBackgroundCanvas({
      container,
      imageUrl,
      dashColor,
      hoverColor,
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
  }, [mountRef, imageUrl, dashColor, hoverColor]);

  return isReady;
}
