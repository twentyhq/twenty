// @ts-nocheck
'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import * as THREE from 'three';
import { styled } from '@linaria/react';

const DEFAULT_DASH_COLOR = '#4A38F5';
const DEFAULT_HOVER_DASH_COLOR = '#8B7FF8';

const CSS_VAR_PATTERN = /^var\(\s*(--[^,)]+)(?:\s*,\s*([^)]+))?\s*\)$/;

function resolveColorValue(value: string, fallback: string) {
  if (typeof value !== 'string') {
    return fallback;
  }
  const match = value.trim().match(CSS_VAR_PATTERN);
  if (!match) {
    return value;
  }
  if (typeof window === 'undefined') {
    return match[2]?.trim() ?? fallback;
  }
  const resolved = getComputedStyle(document.documentElement)
    .getPropertyValue(match[1])
    .trim();
  return resolved || match[2]?.trim() || fallback;
}

const settings = {
  halftone: {
    scale: 24.72,
    power: -0.07,
    toneTarget: 'light',
    width: 0.46,
    imageContrast: 1,
  },
  animation: {
    hoverFadeIn: 10,
    hoverFadeOut: 5,
    hoverHalftonePowerShift: 0.45,
    hoverHalftoneRadius: 0.6,
    hoverHalftoneWidthShift: -0.1,
    pointerFollow: 0.3,
    waveSpeed: 1,
  },
};
const previewDistance = 4;
const VIRTUAL_RENDER_HEIGHT = 512;
const REFERENCE_CONTAINER_HEIGHT = 240;
const passThroughVertexShader =
  '\n  varying vec2 vUv;\n\n  void main() {\n    vUv = uv;\n    gl_Position = vec4(position, 1.0);\n  }\n';
const blurFragmentShader =
  '\n  precision highp float;\n\n  uniform sampler2D tInput;\n  uniform vec2 dir;\n  uniform vec2 res;\n\n  varying vec2 vUv;\n\n  void main() {\n    vec4 sum = vec4(0.0);\n    vec2 px = dir / res;\n\n    float w[5];\n    w[0] = 0.227027;\n    w[1] = 0.1945946;\n    w[2] = 0.1216216;\n    w[3] = 0.054054;\n    w[4] = 0.016216;\n\n    sum += texture2D(tInput, vUv) * w[0];\n\n    for (int i = 1; i < 5; i++) {\n      float fi = float(i) * 3.0;\n      sum += texture2D(tInput, vUv + px * fi) * w[i];\n      sum += texture2D(tInput, vUv - px * fi) * w[i];\n    }\n\n    gl_FragColor = sum;\n  }\n';
const halftoneFragmentShader =
  '\n  precision highp float;\n\n  uniform sampler2D tScene;\n  uniform vec2 effectResolution;\n  uniform vec2 logicalResolution;\n  uniform float tile;\n  uniform float s_3;\n  uniform float s_4;\n  uniform float applyToDarkAreas;\n  uniform vec3 dashColor;\n  uniform vec3 hoverDashColor;\n  uniform float time;\n  uniform float waveAmount;\n  uniform float waveSpeed;\n  uniform float footprintScale;\n  uniform vec2 interactionUv;\n  uniform float hoverHalftoneActive;\n  uniform float hoverHalftonePowerShift;\n  uniform float hoverHalftoneRadius;\n  uniform float hoverHalftoneWidthShift;\n\n  varying vec2 vUv;\n\n  float distSegment(in vec2 p, in vec2 a, in vec2 b) {\n    vec2 pa = p - a;\n    vec2 ba = b - a;\n    float denom = max(dot(ba, ba), 0.000001);\n    float h = clamp(dot(pa, ba) / denom, 0.0, 1.0);\n    return length(pa - ba * h);\n  }\n\n  float lineSimpleEt(in vec2 p, in float r, in float thickness) {\n    vec2 a = vec2(0.5) + vec2(-r, 0.0);\n    vec2 b = vec2(0.5) + vec2(r, 0.0);\n    float distToSegment = distSegment(p, a, b);\n    float halfThickness = thickness * r;\n    return distToSegment - halfThickness;\n  }\n\n  void main() {\n    vec2 fragCoord =\n      (gl_FragCoord.xy / max(effectResolution, vec2(1.0))) * logicalResolution;\n    float halftoneSize = max(tile * max(footprintScale, 0.001), 1.0);\n\n    float bandRow = floor(fragCoord.y / halftoneSize);\n    float waveOffset =\n      waveAmount * sin(time * waveSpeed + bandRow * 0.5) * halftoneSize;\n    vec2 effectCoord = fragCoord;\n    effectCoord.x += waveOffset;\n\n    vec2 cellIndex = floor(effectCoord / halftoneSize);\n    vec2 sampleUv = clamp(\n      (cellIndex + 0.5) * halftoneSize / logicalResolution,\n      vec2(0.0),\n      vec2(1.0)\n    );\n    vec2 cellUv = fract(effectCoord / halftoneSize);\n\n    float hoverHalftoneMask = 0.0;\n    if (hoverHalftoneActive > 0.0) {\n      vec2 pointerPx = interactionUv * logicalResolution;\n      float fragDist = length(fragCoord - pointerPx);\n      float hoverRadiusPx = hoverHalftoneRadius * logicalResolution.y;\n      hoverHalftoneMask =\n        smoothstep(hoverRadiusPx, 0.0, fragDist) *\n        clamp(hoverHalftoneActive, 0.0, 1.0);\n    }\n\n    vec4 sceneSample = texture2D(tScene, sampleUv);\n    float toneValue =\n      (sceneSample.r + sceneSample.g + sceneSample.b) * (1.0 / 3.0);\n    if (applyToDarkAreas > 0.5) {\n      toneValue = 1.0 - toneValue;\n    }\n    float localPower = clamp(\n      s_3 + hoverHalftonePowerShift * hoverHalftoneMask,\n      -1.5,\n      1.5\n    );\n    float localWidth = clamp(\n      s_4 + hoverHalftoneWidthShift * hoverHalftoneMask,\n      0.05,\n      1.4\n    );\n    float powerBias = localPower * length(vec2(0.5)) * (1.0 / 3.0);\n    float bandRadius = clamp(\n      toneValue + powerBias,\n      0.0,\n      1.0\n    ) * 1.86 * 0.5;\n\n    float alpha = 0.0;\n    if (bandRadius > 0.0001) {\n      float signedDistance = lineSimpleEt(cellUv, bandRadius, localWidth);\n      float edge = 0.02;\n      alpha = 1.0 - smoothstep(0.0, edge, signedDistance);\n    }\n\n    vec3 activeDashColor = mix(dashColor, hoverDashColor, hoverHalftoneMask);\n    vec3 color = activeDashColor * alpha;\n    gl_FragColor = vec4(color, alpha);\n\n    #include <tonemapping_fragment>\n    #include <colorspace_fragment>\n  }\n';
const imagePassthroughFragmentShader =
  '\n  precision highp float;\n\n  uniform sampler2D tImage;\n  uniform vec2 imageSize;\n  uniform vec2 viewportSize;\n  uniform float zoom;\n  uniform float contrast;\n\n  varying vec2 vUv;\n\n  void main() {\n    float imageAspect = imageSize.x / imageSize.y;\n    float viewAspect = viewportSize.x / viewportSize.y;\n\n    vec2 uv = vUv;\n\n    if (imageAspect > viewAspect) {\n      float scale = viewAspect / imageAspect;\n      uv.x = (uv.x - 0.5) * scale + 0.5;\n    } else {\n      float scale = imageAspect / viewAspect;\n      uv.y = (uv.y - 0.5) * scale + 0.5;\n    }\n\n    uv = (uv - 0.5) / zoom + 0.5;\n\n    vec4 color = texture2D(tImage, clamp(uv, 0.0, 1.0));\n    vec3 contrastColor = clamp((color.rgb - 0.5) * contrast + 0.5, 0.0, 1.0);\n\n    gl_FragColor = vec4(contrastColor, 1.0);\n  }\n';

const REFERENCE_PREVIEW_DISTANCE = 4;
const MIN_FOOTPRINT_SCALE = 0.001;

function clampRectToViewport(rect, viewportWidth, viewportHeight) {
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

function getRectArea(rect) {
  if (!rect) {
    return 0;
  }

  return Math.max(rect.width, 0) * Math.max(rect.height, 0);
}

function getImagePreviewZoom(distance) {
  return REFERENCE_PREVIEW_DISTANCE / Math.max(distance, 0.001);
}

function getContainedImageRect({
  imageHeight,
  imageWidth,
  viewportHeight,
  viewportWidth,
  zoom,
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

function getFootprintScaleFromRects(currentRect, referenceRect) {
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
  distance,
  viewportHeight,
  viewportWidth,
}) {
  const currentRect = getContainedImageRect({
    imageHeight,
    imageWidth,
    viewportHeight,
    viewportWidth,
    zoom: getImagePreviewZoom(distance),
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

function createRenderTarget(width, height) {
  return new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  });
}

async function mountHalftoneCanvas(options) {
  const { container, imageUrl } = options;
  const dashColor = resolveColorValue(options.dashColor, DEFAULT_DASH_COLOR);
  const hoverDashColor = resolveColorValue(
    options.hoverDashColor,
    DEFAULT_HOVER_DASH_COLOR,
  );

  const getWidth = () => Math.max(container.clientWidth, 1);
  const getHeight = () => Math.max(container.clientHeight, 1);
  const getVirtualHeight = () => Math.max(VIRTUAL_RENDER_HEIGHT, getHeight());
  const getVirtualWidth = () =>
    Math.max(
      Math.round(getVirtualHeight() * (getWidth() / Math.max(getHeight(), 1))),
      1,
    );

  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(getVirtualWidth(), getVirtualHeight(), false);

  const canvas = renderer.domElement;
  canvas.style.display = 'block';
  canvas.style.height = '100%';
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
      tImage: { value: imageTexture },
      imageSize: { value: new THREE.Vector2(image.width, image.height) },
      viewportSize: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      zoom: { value: getImagePreviewZoom(previewDistance) },
      contrast: { value: settings.halftone.imageContrast },
    },
    vertexShader: passThroughVertexShader,
    fragmentShader: imagePassthroughFragmentShader,
  });

  const imageScene = new THREE.Scene();
  imageScene.add(new THREE.Mesh(fullScreenGeometry, imageMaterial));

  const blurHorizontalMaterial = new THREE.ShaderMaterial({
    uniforms: {
      tInput: { value: null },
      dir: { value: new THREE.Vector2(1, 0) },
      res: { value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()) },
    },
    vertexShader: passThroughVertexShader,
    fragmentShader: blurFragmentShader,
  });

  const blurVerticalMaterial = new THREE.ShaderMaterial({
    uniforms: {
      tInput: { value: null },
      dir: { value: new THREE.Vector2(0, 1) },
      res: { value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()) },
    },
    vertexShader: passThroughVertexShader,
    fragmentShader: blurFragmentShader,
  });

  const halftoneMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      tScene: { value: sceneTarget.texture },
      effectResolution: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      logicalResolution: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      tile: { value: settings.halftone.scale },
      s_3: { value: settings.halftone.power },
      s_4: { value: settings.halftone.width },
      applyToDarkAreas: {
        value: settings.halftone.toneTarget === 'dark' ? 1 : 0,
      },
      dashColor: { value: new THREE.Color(dashColor) },
      hoverDashColor: {
        value: new THREE.Color(hoverDashColor),
      },
      time: { value: 0 },
      waveAmount: { value: 0 },
      waveSpeed: { value: settings.animation.waveSpeed },
      footprintScale: { value: 1.0 },
      interactionUv: { value: new THREE.Vector2(0.5, 0.5) },
      hoverHalftoneActive: { value: 0 },
      hoverHalftonePowerShift: {
        value: settings.animation.hoverHalftonePowerShift,
      },
      hoverHalftoneRadius: { value: settings.animation.hoverHalftoneRadius },
      hoverHalftoneWidthShift: {
        value: settings.animation.hoverHalftoneWidthShift,
      },
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
    logicalWidth,
    logicalHeight,
    effectWidth,
    effectHeight,
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
      distance: previewDistance,
      viewportHeight: getVirtualHeight(),
      viewportWidth: getVirtualWidth(),
    });

  const TARGET_TILE_CSS_SIZE =
    (settings.halftone.scale * REFERENCE_CONTAINER_HEIGHT) /
    VIRTUAL_RENDER_HEIGHT;

  const updateTileUniform = () => {
    const virtualHeight = getVirtualHeight();
    const containerHeight = Math.max(getHeight(), 1);
    halftoneMaterial.uniforms.tile.value =
      (TARGET_TILE_CSS_SIZE * virtualHeight) / containerHeight;
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
    updateTileUniform();
  };

  updateTileUniform();

  const resizeObserver = new ResizeObserver(syncSize);
  resizeObserver.observe(container);

  const interaction = {
    pointerInside: false,
    mouseX: 0.5,
    mouseY: 0.5,
    smoothedMouseX: 0.5,
    smoothedMouseY: 0.5,
    hoverStrength: 0,
  };

  const pointerFollow = settings.animation.pointerFollow;
  const hoverFadeIn = settings.animation.hoverFadeIn;
  const hoverFadeOut = settings.animation.hoverFadeOut;

  const updatePointer = (event) => {
    const rect = container.getBoundingClientRect();
    const width = Math.max(rect.width, 1);
    const height = Math.max(rect.height, 1);
    interaction.mouseX = THREE.MathUtils.clamp(
      (event.clientX - rect.left) / width,
      0,
      1,
    );
    interaction.mouseY = THREE.MathUtils.clamp(
      (event.clientY - rect.top) / height,
      0,
      1,
    );
  };

  const handlePointerEnter = (event) => {
    updatePointer(event);
    interaction.smoothedMouseX = interaction.mouseX;
    interaction.smoothedMouseY = interaction.mouseY;
    interaction.pointerInside = true;
  };

  const handlePointerMove = (event) => {
    updatePointer(event);
    interaction.pointerInside = true;
  };

  const handlePointerLeave = () => {
    interaction.pointerInside = false;
  };

  container.addEventListener('pointerenter', handlePointerEnter);
  container.addEventListener('pointermove', handlePointerMove);
  container.addEventListener('pointerleave', handlePointerLeave);

  const clock = new THREE.Timer();
  clock.connect(document);
  let animationFrameId = 0;

  const renderFrame = (timestamp) => {
    animationFrameId = window.requestAnimationFrame(renderFrame);
    clock.update(timestamp);

    const deltaSeconds = clock.getDelta();
    const hoverEasing =
      1 -
      Math.exp(
        -deltaSeconds * (interaction.pointerInside ? hoverFadeIn : hoverFadeOut),
      );
    interaction.hoverStrength +=
      ((interaction.pointerInside ? 1 : 0) - interaction.hoverStrength) *
      hoverEasing;
    interaction.smoothedMouseX +=
      (interaction.mouseX - interaction.smoothedMouseX) * pointerFollow;
    interaction.smoothedMouseY +=
      (interaction.mouseY - interaction.smoothedMouseY) * pointerFollow;

    halftoneMaterial.uniforms.interactionUv.value.set(
      interaction.smoothedMouseX,
      1 - interaction.smoothedMouseY,
    );
    halftoneMaterial.uniforms.hoverHalftoneActive.value =
      interaction.hoverStrength;
    halftoneMaterial.uniforms.time.value = clock.getElapsed();
    imageMaterial.uniforms.zoom.value = getImagePreviewZoom(previewDistance);
    halftoneMaterial.uniforms.footprintScale.value = getHalftoneScale();

    renderer.setRenderTarget(sceneTarget);
    renderer.render(imageScene, orthographicCamera);

    blurHorizontalMaterial.uniforms.tInput.value = sceneTarget.texture;
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
    clock.dispose();
    resizeObserver.disconnect();
    container.removeEventListener('pointerenter', handlePointerEnter);
    container.removeEventListener('pointermove', handlePointerMove);
    container.removeEventListener('pointerleave', handlePointerLeave);
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

const StyledVisualMount = styled.div`
  background: #000;
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

type CustomerCasesCoverProps = {
  imageUrl: string;
  style?: CSSProperties;
  dashColor?: string;
  hoverDashColor?: string;
};

export function CustomerCasesCover({
  imageUrl,
  style,
  dashColor = DEFAULT_DASH_COLOR,
  hoverDashColor = DEFAULT_HOVER_DASH_COLOR,
}: CustomerCasesCoverProps) {
  const mountReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountReference.current;

    if (!container) {
      return;
    }

    const unmountPromise = mountHalftoneCanvas({
      container,
      imageUrl,
      dashColor,
      hoverDashColor,
    }).catch((error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error(error);
      }
      return undefined;
    });

    return () => {
      void unmountPromise.then((dispose) => dispose?.());
    };
  }, [imageUrl, dashColor, hoverDashColor]);

  return <StyledVisualMount aria-hidden ref={mountReference} style={style} />;
}
