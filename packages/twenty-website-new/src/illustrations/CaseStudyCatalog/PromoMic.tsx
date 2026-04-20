// @ts-nocheck
'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import * as THREE from 'three';
import { styled } from '@linaria/react';

const settings = {
  "sourceMode": "image",
  "shapeKey": "torusKnot",
  "lighting": {
    "intensity": 1.5,
    "fillIntensity": 0.15,
    "ambientIntensity": 0.08,
    "angleDegrees": 45,
    "height": 2
  },
  "material": {
    "surface": "solid",
    "color": "#d4d0c8",
    "roughness": 0.42,
    "metalness": 0.16,
    "thickness": 150,
    "refraction": 2,
    "environmentPower": 5
  },
  "halftone": {
    "enabled": true,
    "scale": 16,
    "power": -0.07,
    "toneTarget": "dark",
    "width": 0.46,
    "imageContrast": 1,
    "dashColor": "#777",
    "hoverDashColor": "#4A38F5"
  },
  "background": {
    "transparent": true,
    "color": "#f3f3f3"
  },
  "animation": {
    "autoRotateEnabled": true,
    "breatheEnabled": false,
    "cameraParallaxEnabled": false,
    "followHoverEnabled": false,
    "followDragEnabled": false,
    "floatEnabled": false,
    "hoverHalftoneEnabled": false,
    "hoverLightEnabled": true,
    "dragFlowEnabled": false,
    "lightSweepEnabled": false,
    "rotateEnabled": false,
    "autoSpeed": 0.2,
    "autoWobble": 0.3,
    "breatheAmount": 0.04,
    "breatheSpeed": 0.8,
    "cameraParallaxAmount": 0.3,
    "cameraParallaxEase": 0.08,
    "driftAmount": 8,
    "hoverRange": 25,
    "hoverEase": 0.08,
    "hoverReturn": true,
    "dragSens": 0.008,
    "dragFriction": 0.08,
    "dragMomentum": true,
    "rotateAxis": "y",
    "rotatePreset": "axis",
    "rotateSpeed": 0.2,
    "rotatePingPong": false,
    "floatAmplitude": 0.16,
    "floatSpeed": 0.8,
    "lightSweepHeightRange": 0.5,
    "lightSweepRange": 28,
    "lightSweepSpeed": 0.7,
    "springDamping": 0.72,
    "springReturnEnabled": false,
    "springStrength": 0.18,
    "hoverHalftonePowerShift": 0.42,
    "hoverHalftoneRadius": 0.2,
    "hoverHalftoneWidthShift": -0.18,
    "hoverLightIntensity": 1.2,
    "hoverLightRadius": 0.32,
    "dragFlowDecay": 0.08,
    "dragFlowRadius": 0.24,
    "dragFlowStrength": 1.8,
    "hoverWarpStrength": 3,
    "hoverWarpRadius": 0.15,
    "dragWarpStrength": 5,
    "waveEnabled": false,
    "waveSpeed": 1,
    "waveAmount": 2
  }
};
const initialPose = {
  "autoElapsed": 0,
  "rotateElapsed": 0,
  "rotationX": 0,
  "rotationY": 0,
  "rotationZ": 0,
  "targetRotationX": 0,
  "targetRotationY": 0,
  "timeElapsed": 86.56079999985694
};
const previewDistance = 4;
const VIRTUAL_RENDER_HEIGHT = 768;
const passThroughVertexShader = "\n  varying vec2 vUv;\n\n  void main() {\n    vUv = uv;\n    gl_Position = vec4(position, 1.0);\n  }\n";
const blurFragmentShader = "\n  precision highp float;\n\n  uniform sampler2D tInput;\n  uniform vec2 dir;\n  uniform vec2 res;\n\n  varying vec2 vUv;\n\n  void main() {\n    vec4 sum = vec4(0.0);\n    vec2 px = dir / res;\n\n    float w[5];\n    w[0] = 0.227027;\n    w[1] = 0.1945946;\n    w[2] = 0.1216216;\n    w[3] = 0.054054;\n    w[4] = 0.016216;\n\n    sum += texture2D(tInput, vUv) * w[0];\n\n    for (int i = 1; i < 5; i++) {\n      float fi = float(i) * 3.0;\n      sum += texture2D(tInput, vUv + px * fi) * w[i];\n      sum += texture2D(tInput, vUv - px * fi) * w[i];\n    }\n\n    gl_FragColor = sum;\n  }\n";
const halftoneFragmentShader = "\n  precision highp float;\n\n  uniform sampler2D tScene;\n  uniform sampler2D tGlow;\n  uniform vec2 effectResolution;\n  uniform vec2 logicalResolution;\n  uniform float tile;\n  uniform float s_3;\n  uniform float s_4;\n  uniform float applyToDarkAreas;\n  uniform vec3 dashColor;\n  uniform vec3 hoverDashColor;\n  uniform float time;\n  uniform float waveAmount;\n  uniform float waveSpeed;\n  uniform float footprintScale;\n  uniform vec2 interactionUv;\n  uniform vec2 interactionVelocity;\n  uniform vec2 dragOffset;\n  uniform float hoverHalftoneActive;\n  uniform float hoverHalftonePowerShift;\n  uniform float hoverHalftoneRadius;\n  uniform float hoverHalftoneWidthShift;\n  uniform float hoverLightStrength;\n  uniform float hoverLightRadius;\n  uniform float hoverFlowStrength;\n  uniform float hoverFlowRadius;\n  uniform float dragFlowStrength;\n  uniform float cropToBounds;\n\n  varying vec2 vUv;\n\n  float distSegment(in vec2 p, in vec2 a, in vec2 b) {\n    vec2 pa = p - a;\n    vec2 ba = b - a;\n    float denom = max(dot(ba, ba), 0.000001);\n    float h = clamp(dot(pa, ba) / denom, 0.0, 1.0);\n    return length(pa - ba * h);\n  }\n\n  float lineSimpleEt(in vec2 p, in float r, in float thickness) {\n    vec2 a = vec2(0.5) + vec2(-r, 0.0);\n    vec2 b = vec2(0.5) + vec2(r, 0.0);\n    float distToSegment = distSegment(p, a, b);\n    float halfThickness = thickness * r;\n    return distToSegment - halfThickness;\n  }\n\n  void main() {\n    if (cropToBounds > 0.5) {\n      vec4 boundsCheck = texture2D(tScene, vUv);\n      if (boundsCheck.a < 0.01) {\n        gl_FragColor = vec4(0.0);\n        return;\n      }\n    }\n\n    vec2 fragCoord =\n      (gl_FragCoord.xy / max(effectResolution, vec2(1.0))) * logicalResolution;\n    float halftoneSize = max(tile * max(footprintScale, 0.001), 1.0);\n    vec2 pointerPx = interactionUv * logicalResolution;\n    vec2 fragDelta = fragCoord - pointerPx;\n    float fragDist = length(fragDelta);\n    vec2 radialDir = fragDist > 0.001 ? fragDelta / fragDist : vec2(0.0, 1.0);\n    float velocityMagnitude = length(interactionVelocity);\n    vec2 motionDir = velocityMagnitude > 0.001\n      ? interactionVelocity / velocityMagnitude\n      : vec2(0.0, 0.0);\n    float motionBias = velocityMagnitude > 0.001\n      ? dot(-radialDir, motionDir) * 0.5 + 0.5\n      : 0.5;\n\n    float hoverLightMask = 0.0;\n    if (hoverLightStrength > 0.0) {\n      float lightRadiusPx = hoverLightRadius * logicalResolution.y;\n      hoverLightMask = smoothstep(lightRadiusPx, 0.0, fragDist);\n    }\n\n    float hoverHalftoneMask = 0.0;\n    if (hoverHalftoneActive > 0.0) {\n      float hoverHalftoneRadiusPx = hoverHalftoneRadius * logicalResolution.y;\n      hoverHalftoneMask =\n        smoothstep(hoverHalftoneRadiusPx, 0.0, fragDist) *\n        clamp(hoverHalftoneActive, 0.0, 1.0);\n    }\n\n    float hoverFlowMask = 0.0;\n    if (hoverFlowStrength > 0.0) {\n      float hoverRadiusPx = hoverFlowRadius * logicalResolution.y;\n      hoverFlowMask = smoothstep(hoverRadiusPx, 0.0, fragDist);\n    }\n\n    vec2 hoverDisplacement =\n      radialDir * hoverFlowStrength * hoverFlowMask * halftoneSize * 0.55 +\n      motionDir * hoverFlowStrength * hoverFlowMask * (0.4 + motionBias) * halftoneSize * 1.15;\n    vec2 travelDisplacement = dragOffset * dragFlowStrength * 0.45;\n    vec2 effectCoord = fragCoord + hoverDisplacement + travelDisplacement;\n\n    float bandRow = floor(effectCoord.y / halftoneSize);\n    float waveOffset =\n      waveAmount * sin(time * waveSpeed + bandRow * 0.5) * halftoneSize;\n    effectCoord.x += waveOffset;\n\n    vec2 cellIndex = floor(effectCoord / halftoneSize);\n    vec2 sampleUv = clamp(\n      (cellIndex + 0.5) * halftoneSize / logicalResolution,\n      vec2(0.0),\n      vec2(1.0)\n    );\n    vec2 cellUv = fract(effectCoord / halftoneSize);\n\n    vec4 sceneSample = texture2D(tScene, sampleUv);\n    float mask = smoothstep(0.02, 0.08, sceneSample.a);\n    float localPower = clamp(\n      s_3 + hoverHalftonePowerShift * hoverHalftoneMask,\n      -1.5,\n      1.5\n    );\n    float localWidth = clamp(\n      s_4 + hoverHalftoneWidthShift * hoverHalftoneMask,\n      0.05,\n      1.4\n    );\n    float lightLift =\n      hoverLightStrength * hoverLightMask * mix(0.78, 1.18, motionBias) * 0.22;\n    float toneValue =\n      (sceneSample.r + sceneSample.g + sceneSample.b) * (1.0 / 3.0);\n    if (applyToDarkAreas > 0.5) {\n      toneValue = 1.0 - toneValue;\n    }\n    // Preserve the pre-toneTarget light-mode response by keeping the power\n    // bias inside the averaged tone calculation.\n    float powerBias = localPower * length(vec2(0.5)) * (1.0 / 3.0);\n    float bandRadius = clamp(\n      toneValue + powerBias + lightLift,\n      0.0,\n      1.0\n    ) * 1.86 * 0.5;\n\n    float alpha = 0.0;\n    if (bandRadius > 0.0001) {\n      float signedDistance = lineSimpleEt(cellUv, bandRadius, localWidth);\n      float edge = 0.02;\n      alpha = (1.0 - smoothstep(0.0, edge, signedDistance)) * mask;\n    }\n\n    vec3 activeDashColor = mix(dashColor, hoverDashColor, hoverHalftoneMask);\n    vec3 color = activeDashColor * alpha;\n    gl_FragColor = vec4(color, alpha);\n\n    #include <tonemapping_fragment>\n    #include <colorspace_fragment>\n  }\n";
const imagePassthroughFragmentShader = "\n  precision highp float;\n\n  uniform sampler2D tImage;\n  uniform vec2 imageSize;\n  uniform vec2 viewportSize;\n  uniform float zoom;\n  uniform float contrast;\n\n  varying vec2 vUv;\n\n  void main() {\n    float imageAspect = imageSize.x / imageSize.y;\n    float viewAspect = viewportSize.x / viewportSize.y;\n\n    vec2 uv = vUv;\n\n    if (imageAspect > viewAspect) {\n      float scale = viewAspect / imageAspect;\n      uv.x = (uv.x - 0.5) * scale + 0.5;\n    } else {\n      float scale = imageAspect / viewAspect;\n      uv.y = (uv.y - 0.5) * scale + 0.5;\n    }\n\n    uv = (uv - 0.5) / zoom + 0.5;\n\n    vec4 color = texture2D(tImage, clamp(uv, 0.0, 1.0));\n    vec3 contrastColor = clamp((color.rgb - 0.5) * contrast + 0.5, 0.0, 1.0);\n\n    gl_FragColor = vec4(contrastColor, 1.0);\n  }\n";


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

function getImagePreviewZoom(previewDistance) {
  return REFERENCE_PREVIEW_DISTANCE / Math.max(previewDistance, 0.001);
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

  return Math.max(
    Math.sqrt(currentArea / referenceArea),
    MIN_FOOTPRINT_SCALE,
  );
}

function getImageFootprintScale({
  imageHeight,
  imageWidth,
  previewDistance,
  viewportHeight,
  viewportWidth,
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

function createRenderTarget(width, height) {
  return new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  });
}

function createInteractionState() {
  return {
    autoElapsed: initialPose.autoElapsed,
    activePointerId: null,
    dragging: false,
    hoverStrength: 0,
    mouseX: 0.5,
    mouseY: 0.5,
    pointerInside: false,
    pointerVelocityX: 0,
    pointerVelocityY: 0,
    pointerX: 0,
    pointerY: 0,
    rotateElapsed: initialPose.rotateElapsed,
    rotationX: initialPose.rotationX,
    rotationVelocityX: 0,
    rotationY: initialPose.rotationY,
    rotationVelocityY: 0,
    rotationZ: initialPose.rotationZ,
    rotationVelocityZ: 0,
    smoothedMouseX: 0.5,
    smoothedMouseY: 0.5,
    targetRotationX: initialPose.targetRotationX,
    targetRotationY: initialPose.targetRotationY,
    velocityX: 0,
    velocityY: 0,
  };
}





async function mountHalftoneCanvas(options) {
  const {
    container,
    imageUrl,
    onError,
  } = options;

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
    img.onload = () => resolve(img);
    img.onerror = () => {
      const error = new Error('Failed to load image');
      onError?.(error);
      reject(error);
    };
    img.src = imageUrl;
  });

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
      viewportSize: { value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()) },
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
      tGlow: { value: blurTargetB.texture },
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
      dashColor: { value: new THREE.Color(settings.halftone.dashColor) },
      hoverDashColor: {
        value: new THREE.Color(settings.halftone.hoverDashColor),
      },
      time: { value: 0 },
      waveAmount: { value: 0 },
      waveSpeed: { value: settings.animation.waveSpeed },
      footprintScale: { value: 1.0 },
      interactionUv: { value: new THREE.Vector2(0.5, 0.5) },
      interactionVelocity: { value: new THREE.Vector2(0, 0) },
      dragOffset: { value: new THREE.Vector2(0, 0) },
      hoverHalftoneActive: { value: 0 },
      hoverHalftonePowerShift: { value: 0 },
      hoverHalftoneRadius: { value: settings.animation.hoverHalftoneRadius },
      hoverHalftoneWidthShift: { value: 0 },
      hoverLightStrength: { value: 0 },
      hoverLightRadius: { value: settings.animation.hoverLightRadius },
      hoverFlowStrength: { value: 0 },
      hoverFlowRadius: { value: 0.18 },
      dragFlowStrength: { value: 0 },
      cropToBounds: { value: 1 },
    },
    vertexShader: passThroughVertexShader,
    fragmentShader: halftoneFragmentShader,
  });

  const blurHorizontalScene = new THREE.Scene();
  blurHorizontalScene.add(new THREE.Mesh(fullScreenGeometry, blurHorizontalMaterial));

  const blurVerticalScene = new THREE.Scene();
  blurVerticalScene.add(new THREE.Mesh(fullScreenGeometry, blurVerticalMaterial));

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
      previewDistance,
      viewportHeight: getVirtualHeight(),
      viewportWidth: getVirtualWidth(),
    });

  const interaction = createInteractionState();
  const imagePointerFollow = 0.38;
  const imagePointerVelocityDamping = 0.82;
  const imageHoverFadeIn = 18;
  const imageHoverFadeOut = 7;

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

  const updatePointerPosition = (event, options = {}) => {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(rect.width, 1);
    const height = Math.max(rect.height, 1);

    const nextMouseX = THREE.MathUtils.clamp(
      (event.clientX - rect.left) / width, 0, 1,
    );
    const nextMouseY = THREE.MathUtils.clamp(
      (event.clientY - rect.top) / height, 0, 1,
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

    if (options.resetVelocity) {
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

  const releasePointerCapture = (pointerId) => {
    if (pointerId === null) {
      return;
    }

    if (!canvas.hasPointerCapture(pointerId)) {
      return;
    }

    try {
      canvas.releasePointerCapture(pointerId);
    } catch (error) {
      void error;
    }
  };

  const handlePointerDown = (event) => {
    updatePointerPosition(event, { resetVelocity: true });
    interaction.pointerX = event.clientX;
    interaction.pointerY = event.clientY;
  };

  const handlePointerMove = (event) => {
    const resetVelocity = !interaction.pointerInside && !interaction.dragging;
    updatePointerPosition(
      event,
      resetVelocity ? { resetVelocity: true } : undefined,
    );
  };

  const handlePointerLeave = () => {
    if (interaction.dragging) {
      return;
    }

    interaction.pointerInside = false;
    interaction.pointerVelocityX = 0;
    interaction.pointerVelocityY = 0;
  };

  const handlePointerUp = (event) => {
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
  };

  const handlePointerCancel = () => {
    releasePointerCapture(interaction.activePointerId);
    interaction.activePointerId = null;
    interaction.dragging = false;
    interaction.pointerInside = false;
    interaction.pointerVelocityX = 0;
    interaction.pointerVelocityY = 0;
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

  const clock = new THREE.Timer();
  clock.connect(document);
  let animationFrameId = 0;

  const renderFrame = (timestamp) => {
    animationFrameId = window.requestAnimationFrame(renderFrame);
    clock.update(timestamp);

    const deltaSeconds = clock.getDelta();
    const elapsedTime = clock.getElapsed();
    halftoneMaterial.uniforms.time.value = elapsedTime;
    const hoverEasing =
      1 -
      Math.exp(
        -deltaSeconds *
          (interaction.pointerInside ? imageHoverFadeIn : imageHoverFadeOut),
      );
    interaction.hoverStrength +=
      ((interaction.pointerInside ? 1 : 0) - interaction.hoverStrength) *
      hoverEasing;

    interaction.smoothedMouseX +=
      (interaction.mouseX - interaction.smoothedMouseX) * imagePointerFollow;
    interaction.smoothedMouseY +=
      (interaction.mouseY - interaction.smoothedMouseY) * imagePointerFollow;
    interaction.pointerVelocityX *= imagePointerVelocityDamping;
    interaction.pointerVelocityY *= imagePointerVelocityDamping;

    halftoneMaterial.uniforms.interactionUv.value.set(
      interaction.smoothedMouseX,
      1 - interaction.smoothedMouseY,
    );
    halftoneMaterial.uniforms.interactionVelocity.value.set(
      interaction.pointerVelocityX * getVirtualWidth(),
      -interaction.pointerVelocityY * getVirtualHeight(),
    );
    halftoneMaterial.uniforms.dragOffset.value.set(0, 0);
    halftoneMaterial.uniforms.hoverHalftoneActive.value =
      settings.animation.hoverHalftoneEnabled ? interaction.hoverStrength : 0;
    halftoneMaterial.uniforms.hoverHalftonePowerShift.value =
      settings.animation.hoverHalftoneEnabled
        ? settings.animation.hoverHalftonePowerShift
        : 0;
    halftoneMaterial.uniforms.hoverHalftoneRadius.value =
      settings.animation.hoverHalftoneRadius;
    halftoneMaterial.uniforms.hoverHalftoneWidthShift.value =
      settings.animation.hoverHalftoneEnabled
        ? settings.animation.hoverHalftoneWidthShift
        : 0;
    halftoneMaterial.uniforms.hoverLightStrength.value =
      settings.animation.hoverLightEnabled
        ? settings.animation.hoverLightIntensity * interaction.hoverStrength
        : 0;
    halftoneMaterial.uniforms.hoverLightRadius.value =
      settings.animation.hoverLightRadius;
    halftoneMaterial.uniforms.hoverFlowStrength.value = 0;
    halftoneMaterial.uniforms.hoverFlowRadius.value = 0.18;
    halftoneMaterial.uniforms.dragFlowStrength.value = 0;
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
    clock.dispose();
    resizeObserver.disconnect();
    canvas.removeEventListener('pointermove', handlePointerMove);
    canvas.removeEventListener('pointerleave', handlePointerLeave);
    canvas.removeEventListener('pointerup', handlePointerUp);
    canvas.removeEventListener('pointercancel', handlePointerCancel);
    window.removeEventListener('blur', handleWindowBlur);
    canvas.removeEventListener('pointerdown', handlePointerDown);
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
  background: transparent;
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

type PromoMicProps = {
  imageUrl?: string;
  style?: CSSProperties;
};

export function PromoMic({
  imageUrl = "/illustrations/generated/partner-meeting.webp",
  style,
}: PromoMicProps) {
  const mountReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountReference.current;

    if (!container) {
      return;
    }

    const unmount = mountHalftoneCanvas({
      container,
      imageUrl,
      onError: (error) => {
        if (process.env.NODE_ENV !== 'production') {
          console.error(error);
        }
      },
    });

    return () => {
      void Promise.resolve(unmount).then((dispose) => dispose?.());
    };
  }, [imageUrl]);

  return <StyledVisualMount aria-hidden ref={mountReference} style={style} />;
}

export default PromoMic;
