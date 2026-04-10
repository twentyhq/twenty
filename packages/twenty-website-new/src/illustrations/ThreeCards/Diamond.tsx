'use client';

import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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

const GLB_URL = '/illustrations/home/three-cards/diamond.glb';

const LIGHTING = {
  ambientIntensity: 0.08,
  angleDegrees: 45,
  fillIntensity: 0.15,
  height: 2,
  intensity: 1.5,
};

const MATERIAL = {
  metalness: 0.16,
  roughness: 0.42,
};

const HALFTONE = {
  baseInk: 0.16,
  cellRatio: 2.2,
  contrast: 1.3,
  cutoff: 0.02,
  dashColor: '#4A38F5',
  maxBar: 0.24,
  numRows: 45,
  power: 1.1,
  shading: 1.6,
};

const ANIMATION: {
  autoRotateEnabled: boolean;
  autoSpeed: number;
  autoWobble: number;
  dragSens: number;
  followDragEnabled: boolean;
  followHoverEnabled: boolean;
  hoverEase: number;
  hoverRange: number;
  hoverReturn: boolean;
  rotateAxis: 'x' | 'y' | 'z' | 'xy';
  rotateEnabled: boolean;
  rotatePingPong: boolean;
  rotateSpeed: number;
} = {
  autoRotateEnabled: true,
  autoSpeed: 0.3,
  autoWobble: 0.3,
  dragSens: 0.008,
  followDragEnabled: false,
  followHoverEnabled: false,
  hoverEase: 0.08,
  hoverRange: 25,
  hoverReturn: true,
  rotateAxis: 'y',
  rotateEnabled: false,
  rotatePingPong: false,
  rotateSpeed: 1,
};

const INITIAL_POSE = {
  autoElapsed: 16.98333333333365,
  rotateElapsed: 0,
  rotationX: -0.06446908045975865,
  rotationY: 5.037500000000101,
  rotationZ: 0,
  targetRotationX: 0,
  targetRotationY: 0,
};

const BASE_CAMERA_DISTANCE = 5.05;
const MODEL_SCALE_TARGET = 2.75;

function createEnvironmentTexture(renderer: THREE.WebGLRenderer) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const environmentTexture = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0.04,
  ).texture;
  pmremGenerator.dispose();

  return environmentTexture;
}

type DiamondInteractionState = {
  autoElapsed: number;
  dragging: boolean;
  mouseX: number;
  mouseY: number;
  pointerX: number;
  pointerY: number;
  rotateElapsed: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  targetRotationX: number;
  targetRotationY: number;
  velocityX: number;
  velocityY: number;
};

function createInteractionState(): DiamondInteractionState {
  return {
    autoElapsed: INITIAL_POSE.autoElapsed,
    dragging: false,
    mouseX: 0.5,
    mouseY: 0.5,
    pointerX: 0,
    pointerY: 0,
    rotateElapsed: INITIAL_POSE.rotateElapsed,
    rotationX: INITIAL_POSE.rotationX,
    rotationY: INITIAL_POSE.rotationY,
    rotationZ: INITIAL_POSE.rotationZ,
    targetRotationX: INITIAL_POSE.targetRotationX,
    targetRotationY: INITIAL_POSE.targetRotationY,
    velocityX: 0,
    velocityY: 0,
  };
}

function createRenderTarget(width: number, height: number) {
  return new THREE.WebGLRenderTarget(width, height, {
    format: THREE.RGBAFormat,
    magFilter: THREE.LinearFilter,
    minFilter: THREE.LinearFilter,
  });
}

function disposeMaterial(material: THREE.Material | THREE.Material[]) {
  if (Array.isArray(material)) {
    material.forEach((item) => item.dispose());
    return;
  }

  material.dispose();
}

function disposeObjectSubtree(root: THREE.Object3D) {
  root.traverse((sceneObject) => {
    if (!(sceneObject instanceof THREE.Mesh)) {
      return;
    }

    sceneObject.geometry?.dispose();
    disposeMaterial(sceneObject.material);
  });
}

function setPrimaryLightPosition(
  light: THREE.DirectionalLight,
  angleDegrees: number,
  height: number,
) {
  const lightAngle = THREE.MathUtils.degToRad(angleDegrees);
  light.position.set(
    Math.cos(lightAngle) * 5,
    height,
    Math.sin(lightAngle) * 5,
  );
}

function normalizeModelRoot(modelRoot: THREE.Object3D) {
  const bounds = new THREE.Box3().setFromObject(modelRoot);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const maxAxis = Math.max(size.x, size.y, size.z, 0.001);

  modelRoot.position.sub(center);
  modelRoot.scale.setScalar(MODEL_SCALE_TARGET / maxAxis);
}

function applyPhysicalMaterial(
  modelRoot: THREE.Object3D,
  environmentTexture: THREE.Texture,
) {
  modelRoot.traverse((sceneObject) => {
    if (!(sceneObject instanceof THREE.Mesh)) {
      return;
    }

    disposeMaterial(sceneObject.material);
    sceneObject.material = new THREE.MeshPhysicalMaterial({
      clearcoat: 0,
      clearcoatRoughness: 0.08,
      color: 0xd4d0c8,
      envMap: environmentTexture,
      envMapIntensity: 0.25,
      metalness: MATERIAL.metalness,
      reflectivity: 0.5,
      roughness: MATERIAL.roughness,
      transmission: 0,
    });
  });
}

const StyledVisualMount = styled.div`
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

export function Diamond() {
  const mountReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountReference.current;

    if (!container) {
      return;
    }

    const getWidth = () => Math.max(container.clientWidth, 1);
    const getHeight = () => Math.max(container.clientHeight, 1);
    const getVirtualHeight = () => Math.max(VIRTUAL_RENDER_HEIGHT, getHeight());
    const getVirtualWidth = () =>
      Math.max(
        Math.round(getVirtualHeight() * (getWidth() / Math.max(getHeight(), 1))),
        1,
      );

    let animationFrameId = 0;
    let cancelled = false;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(getVirtualWidth(), getVirtualHeight(), false);

    const canvas = renderer.domElement;
    canvas.style.cursor = 'grab';
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
    camera.position.z = BASE_CAMERA_DISTANCE;

    const primaryLight = new THREE.DirectionalLight(0xffffff, LIGHTING.intensity);
    setPrimaryLightPosition(primaryLight, LIGHTING.angleDegrees, LIGHTING.height);
    scene3d.add(primaryLight);

    const fillLight = new THREE.DirectionalLight(
      0xffffff,
      LIGHTING.fillIntensity,
    );
    fillLight.position.set(-3, -1, 1);
    scene3d.add(fillLight);

    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      LIGHTING.ambientIntensity,
    );
    scene3d.add(ambientLight);

    const pivot = new THREE.Group();
    scene3d.add(pivot);

    const sceneTarget = createRenderTarget(getVirtualWidth(), getVirtualHeight());
    const blurTargetA = createRenderTarget(getVirtualWidth(), getVirtualHeight());
    const blurTargetB = createRenderTarget(getVirtualWidth(), getVirtualHeight());
    const fullScreenGeometry = new THREE.PlaneGeometry(2, 2);
    const orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

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
      transparent: true,
      uniforms: {
        baseInk: { value: HALFTONE.baseInk },
        cellRatio: { value: HALFTONE.cellRatio },
        contrast: { value: HALFTONE.contrast },
        cropToBounds: { value: 0 },
        cutoff: { value: HALFTONE.cutoff },
        dashColor: { value: new THREE.Color(HALFTONE.dashColor) },
        distanceScale: { value: 1 },
        dragFlowRadius: { value: 0 },
        dragFlowStrength: { value: 0 },
        dragOffset: { value: new THREE.Vector2(0, 0) },
        glowStr: { value: 0 },
        hoverFlowRadius: { value: 0 },
        hoverFlowStrength: { value: 0 },
        hoverLightRadius: { value: 0 },
        hoverLightStrength: { value: 0 },
        interactionUv: { value: new THREE.Vector2(0.5, 0.5) },
        interactionVelocity: { value: new THREE.Vector2(0, 0) },
        maxBar: { value: HALFTONE.maxBar },
        numRows: { value: HALFTONE.numRows },
        power: { value: HALFTONE.power },
        resolution: {
          value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
        },
        shading: { value: HALFTONE.shading },
        tGlow: { value: blurTargetB.texture },
        tScene: { value: sceneTarget.texture },
        time: { value: 0 },
        waveAmount: { value: 0 },
        waveSpeed: { value: 0 },
      },
      fragmentShader: halftoneFragmentShader,
      vertexShader: passThroughVertexShader,
    });

    const blurHorizontalScene = new THREE.Scene();
    blurHorizontalScene.add(
      new THREE.Mesh(fullScreenGeometry, blurHorizontalMaterial),
    );

    const blurVerticalScene = new THREE.Scene();
    blurVerticalScene.add(new THREE.Mesh(fullScreenGeometry, blurVerticalMaterial));

    const postScene = new THREE.Scene();
    postScene.add(new THREE.Mesh(fullScreenGeometry, halftoneMaterial));

    const interaction = createInteractionState();

    const syncSize = () => {
      const width = getWidth();
      const height = getHeight();
      const virtualWidth = getVirtualWidth();
      const virtualHeight = getVirtualHeight();

      renderer.setSize(virtualWidth, virtualHeight, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      sceneTarget.setSize(virtualWidth, virtualHeight);
      blurTargetA.setSize(virtualWidth, virtualHeight);
      blurTargetB.setSize(virtualWidth, virtualHeight);
      blurHorizontalMaterial.uniforms.res.value.set(virtualWidth, virtualHeight);
      blurVerticalMaterial.uniforms.res.value.set(virtualWidth, virtualHeight);
      halftoneMaterial.uniforms.resolution.value.set(virtualWidth, virtualHeight);
    };

    const resizeObserver = new ResizeObserver(syncSize);
    resizeObserver.observe(container);

    const handlePointerDown = (event: PointerEvent) => {
      interaction.dragging = true;
      interaction.pointerX = event.clientX;
      interaction.pointerY = event.clientY;
      interaction.velocityX = 0;
      interaction.velocityY = 0;
      canvas.style.cursor = 'grabbing';
    };

    const handlePointerMove = (event: PointerEvent) => {
      interaction.mouseX = event.clientX / window.innerWidth;
      interaction.mouseY = event.clientY / window.innerHeight;

      if (
        !interaction.dragging ||
        (!ANIMATION.followDragEnabled && !ANIMATION.autoRotateEnabled)
      ) {
        return;
      }

      const deltaX = (event.clientX - interaction.pointerX) * ANIMATION.dragSens;
      const deltaY = (event.clientY - interaction.pointerY) * ANIMATION.dragSens;

      interaction.velocityX = deltaY;
      interaction.velocityY = deltaX;
      interaction.targetRotationY += deltaX;
      interaction.targetRotationX += deltaY;
      interaction.pointerX = event.clientX;
      interaction.pointerY = event.clientY;
    };

    const handlePointerUp = () => {
      interaction.dragging = false;
      canvas.style.cursor = 'grab';
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerdown', handlePointerDown);

    const clock = new THREE.Clock();

    const renderFrame = () => {
      if (cancelled) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(renderFrame);

      const delta = 1 / 60;
      const elapsedTime = clock.getElapsedTime();
      halftoneMaterial.uniforms.time.value = elapsedTime;

      let baseRotationX = 0;
      let baseRotationY = 0;
      let baseRotationZ = 0;

      if (ANIMATION.autoRotateEnabled) {
        if (!interaction.dragging) {
          interaction.autoElapsed += delta;
          interaction.targetRotationX += interaction.velocityX;
          interaction.targetRotationY += interaction.velocityY;
          interaction.velocityX *= 0.92;
          interaction.velocityY *= 0.92;
        }

        baseRotationY += interaction.autoElapsed * ANIMATION.autoSpeed;
        baseRotationX +=
          Math.sin(interaction.autoElapsed * 0.2) * ANIMATION.autoWobble;
      }

      if (ANIMATION.rotateEnabled) {
        interaction.rotateElapsed += delta;
        const rotateAngle = ANIMATION.rotatePingPong
          ? Math.sin(interaction.rotateElapsed * ANIMATION.rotateSpeed) * Math.PI
          : interaction.rotateElapsed * ANIMATION.rotateSpeed;

        if (
          ANIMATION.rotateAxis === 'x' ||
          ANIMATION.rotateAxis === 'xy'
        ) {
          baseRotationX += rotateAngle;
        }

        if (
          ANIMATION.rotateAxis === 'y' ||
          ANIMATION.rotateAxis === 'xy'
        ) {
          baseRotationY += rotateAngle;
        }

        if (ANIMATION.rotateAxis === 'z') {
          baseRotationZ = rotateAngle;
        }
      }

      let targetX = baseRotationX;
      let targetY = baseRotationY;
      let easing = 0.12;

      if (ANIMATION.followHoverEnabled) {
        const rangeRadians = THREE.MathUtils.degToRad(ANIMATION.hoverRange);

        if (
          ANIMATION.hoverReturn ||
          interaction.mouseX !== 0.5 ||
          interaction.mouseY !== 0.5
        ) {
          targetX += (interaction.mouseY - 0.5) * rangeRadians;
          targetY += (interaction.mouseX - 0.5) * rangeRadians;
        }

        easing = ANIMATION.hoverEase;
      }

      if (ANIMATION.followDragEnabled) {
        targetX += interaction.targetRotationX;
        targetY += interaction.targetRotationY;
        easing = 0.08;
      }

      if (
        ANIMATION.autoRotateEnabled &&
        !ANIMATION.followHoverEnabled &&
        !ANIMATION.followDragEnabled
      ) {
        targetX = baseRotationX + interaction.targetRotationX;
        targetY = baseRotationY + interaction.targetRotationY;

        if (interaction.dragging) {
          targetX = interaction.targetRotationX;
          targetY = interaction.targetRotationY;
        }

        easing = 0.08;
      }

      interaction.rotationX += (targetX - interaction.rotationX) * easing;
      interaction.rotationY += (targetY - interaction.rotationY) * easing;
      interaction.rotationZ += (baseRotationZ - interaction.rotationZ) * 0.12;

      pivot.rotation.set(
        interaction.rotationX,
        interaction.rotationY,
        interaction.rotationZ,
      );

      renderer.setRenderTarget(sceneTarget);
      renderer.render(scene3d, camera);

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

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      'https://www.gstatic.com/draco/versioned/decoders/1.5.6/',
    );

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      GLB_URL,
      (gltf) => {
        if (cancelled) {
          disposeObjectSubtree(gltf.scene);
          return;
        }

        const modelRoot = gltf.scene;
        normalizeModelRoot(modelRoot);
        applyPhysicalMaterial(modelRoot, environmentTexture);
        pivot.add(modelRoot);
      },
      undefined,
      (error) => {
        if (!cancelled) {
          console.error(error);
        }
      },
    );

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.cancelAnimationFrame(animationFrameId);
      disposeObjectSubtree(scene3d);
      blurHorizontalMaterial.dispose();
      blurVerticalMaterial.dispose();
      halftoneMaterial.dispose();
      fullScreenGeometry.dispose();
      sceneTarget.dispose();
      blurTargetA.dispose();
      blurTargetB.dispose();
      environmentTexture.dispose();
      renderer.dispose();
      dracoLoader.dispose();

      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  return <StyledVisualMount aria-hidden ref={mountReference} />;
}
