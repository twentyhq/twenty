'use client';

import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const VIRTUAL_RENDER_HEIGHT = 768;
const REFERENCE_PREVIEW_DISTANCE = 4;
const MIN_FOOTPRINT_SCALE = 0.001;
const MODEL_SCALE_TARGET = 2.75;
const LOCK_MODEL_URL = '/illustrations/home/three-cards/lock.glb';

export type ModelHalftoneRotateAxis =
  | 'x'
  | 'y'
  | 'z'
  | 'xy'
  | '-x'
  | '-y'
  | '-z'
  | '-xy';

export type ModelHalftoneLightingSettings = {
  ambientIntensity: number;
  angleDegrees: number;
  fillIntensity: number;
  height: number;
  intensity: number;
};

export type ModelHalftoneMaterialSettings = {
  metalness: number;
  roughness: number;
};

export type ModelHalftoneSettings = {
  dashColor: string;
  power: number;
  scale: number;
  width: number;
};

export type ModelHalftoneAnimationSettings = {
  autoRotateEnabled: boolean;
  autoSpeed: number;
  autoWobble: number;
  dragFriction: number;
  dragMomentum: boolean;
  dragSens: number;
  followDragEnabled: boolean;
  followHoverEnabled: boolean;
  hoverEase: number;
  hoverRange: number;
  hoverReturn: boolean;
  lightSweepEnabled: boolean;
  lightSweepHeightRange: number;
  lightSweepRange: number;
  lightSweepSpeed: number;
  rotateAxis: ModelHalftoneRotateAxis;
  rotateEnabled: boolean;
  rotatePingPong: boolean;
  rotateSpeed: number;
  springDamping: number;
  springReturnEnabled: boolean;
  springStrength: number;
};

export type ModelHalftoneIllustrationSettings = {
  animation: ModelHalftoneAnimationSettings;
  cameraDistance: number;
  halftone: ModelHalftoneSettings;
  lighting: ModelHalftoneLightingSettings;
  material: ModelHalftoneMaterialSettings;
  rotationOffsetX: number;
  rotationOffsetY: number;
  rotationOffsetZ: number;
};

const LOCK_EFFECT_SETTINGS: ModelHalftoneIllustrationSettings = {
  animation: {
    autoRotateEnabled: false,
    autoSpeed: 0.1,
    autoWobble: 0,
    dragFriction: 0.08,
    dragMomentum: true,
    dragSens: 0.008,
    followDragEnabled: true,
    followHoverEnabled: true,
    hoverEase: 0.08,
    hoverRange: 25,
    hoverReturn: true,
    lightSweepEnabled: true,
    lightSweepHeightRange: 0.5,
    lightSweepRange: 28,
    lightSweepSpeed: 0.2,
    rotateAxis: 'y',
    rotateEnabled: true,
    rotatePingPong: false,
    rotateSpeed: 0.1,
    springDamping: 0.4,
    springReturnEnabled: true,
    springStrength: 0.06,
  },
  cameraDistance: 4.27,
  halftone: {
    dashColor: '#4A38F5',
    power: 1.11,
    scale: 11.06,
    width: 1.03,
  },
  lighting: {
    ambientIntensity: 0,
    angleDegrees: 46,
    fillIntensity: 0,
    height: 2,
    intensity: 2,
  },
  material: {
    metalness: 1,
    roughness: 0,
  },
  rotationOffsetX: 0,
  rotationOffsetY: 0,
  rotationOffsetZ: 0,
} as const;

const INITIAL_POSE = {
  autoElapsed: 42.43333333333221,
  rotateElapsed: 89.98333333332951,
  rotationX: -8.99639917695435,
  rotationY: -8.99639917695435,
  rotationZ: LOCK_EFFECT_SETTINGS.rotationOffsetZ,
  targetRotationX: 0,
  targetRotationY: 0,
  timeElapsed: 851.4676000003166,
} as const;

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

    vec3 color = dashColor * alpha;
    gl_FragColor = vec4(color, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

type ViewportRect = {
  height: number;
  width: number;
  x: number;
  y: number;
};

type FootprintScaleScratch = {
  corners: THREE.Vector3[];
  currentOffset: THREE.Vector3;
  referenceCamera: THREE.PerspectiveCamera;
  referenceOffset: THREE.Vector3;
};

type DiamondInteractionState = {
  autoElapsed: number;
  dragging: boolean;
  mouseX: number;
  mouseY: number;
  pointerInside: boolean;
  pointerX: number;
  pointerY: number;
  rotateElapsed: number;
  rotationVelocityX: number;
  rotationVelocityY: number;
  rotationVelocityZ: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  targetRotationX: number;
  targetRotationY: number;
  velocityX: number;
  velocityY: number;
};

function clampRectToViewport(
  rect: ViewportRect,
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

function getRectArea(rect: ViewportRect | null) {
  if (!rect) {
    return 0;
  }

  return Math.max(rect.width, 0) * Math.max(rect.height, 0);
}

function createFootprintScaleScratch(): FootprintScaleScratch {
  return {
    corners: Array.from({ length: 8 }, () => new THREE.Vector3()),
    currentOffset: new THREE.Vector3(),
    referenceCamera: new THREE.PerspectiveCamera(),
    referenceOffset: new THREE.Vector3(),
  };
}

function writeBox3Corners(bounds: THREE.Box3, corners: THREE.Vector3[]) {
  const { min, max } = bounds;

  corners[0].set(min.x, min.y, min.z);
  corners[1].set(min.x, min.y, max.z);
  corners[2].set(min.x, max.y, min.z);
  corners[3].set(min.x, max.y, max.z);
  corners[4].set(max.x, min.y, min.z);
  corners[5].set(max.x, min.y, max.z);
  corners[6].set(max.x, max.y, min.z);
  corners[7].set(max.x, max.y, max.z);

  return corners;
}

function projectBox3ToViewport({
  camera,
  localBounds,
  meshMatrixWorld,
  scratch,
  viewportHeight,
  viewportWidth,
}: {
  camera: THREE.PerspectiveCamera;
  localBounds: THREE.Box3;
  meshMatrixWorld: THREE.Matrix4;
  scratch: FootprintScaleScratch;
  viewportHeight: number;
  viewportWidth: number;
}) {
  if (
    localBounds.isEmpty() ||
    viewportWidth <= 0 ||
    viewportHeight <= 0
  ) {
    return null;
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let hasProjectedCorner = false;

  for (const corner of writeBox3Corners(localBounds, scratch.corners)) {
    corner.applyMatrix4(meshMatrixWorld).project(camera);

    if (
      !Number.isFinite(corner.x) ||
      !Number.isFinite(corner.y) ||
      !Number.isFinite(corner.z)
    ) {
      continue;
    }

    hasProjectedCorner = true;

    const x = (corner.x * 0.5 + 0.5) * viewportWidth;
    const y = (1 - (corner.y * 0.5 + 0.5)) * viewportHeight;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  if (!hasProjectedCorner) {
    return null;
  }

  return clampRectToViewport(
    {
      height: maxY - minY,
      width: maxX - minX,
      x: minX,
      y: minY,
    },
    viewportWidth,
    viewportHeight,
  );
}

function getFootprintScaleFromRects(
  currentRect: ViewportRect | null,
  referenceRect: ViewportRect | null,
) {
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

function getObjectFootprintScale({
  camera,
  localBounds,
  lookAtTarget,
  meshMatrixWorld,
  scratch,
  viewportHeight,
  viewportWidth,
}: {
  camera: THREE.PerspectiveCamera;
  localBounds: THREE.Box3;
  lookAtTarget: THREE.Vector3;
  meshMatrixWorld: THREE.Matrix4;
  scratch: FootprintScaleScratch;
  viewportHeight: number;
  viewportWidth: number;
}) {
  const currentRect = projectBox3ToViewport({
    camera,
    localBounds,
    meshMatrixWorld,
    scratch,
    viewportHeight,
    viewportWidth,
  });

  const { currentOffset, referenceCamera, referenceOffset } = scratch;

  referenceCamera.copy(camera);
  currentOffset.copy(referenceCamera.position).sub(lookAtTarget);

  if (currentOffset.lengthSq() > 0) {
    referenceOffset.copy(currentOffset).setLength(REFERENCE_PREVIEW_DISTANCE);
  } else {
    referenceOffset.set(0, 0, REFERENCE_PREVIEW_DISTANCE);
  }

  referenceCamera.position.copy(lookAtTarget).add(referenceOffset);
  referenceCamera.lookAt(lookAtTarget);
  referenceCamera.updateProjectionMatrix();
  referenceCamera.updateMatrixWorld(true);

  const referenceRect = projectBox3ToViewport({
    camera: referenceCamera,
    localBounds,
    meshMatrixWorld,
    scratch,
    viewportHeight,
    viewportWidth,
  });

  return getFootprintScaleFromRects(currentRect, referenceRect);
}

function createEnvironmentTexture(renderer: THREE.WebGLRenderer) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const environmentTexture = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0.04,
  ).texture;

  pmremGenerator.dispose();

  return environmentTexture;
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
  materialSettings: ModelHalftoneMaterialSettings,
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
      metalness: materialSettings.metalness,
      reflectivity: 0.5,
      roughness: materialSettings.roughness,
      transmission: 0,
    });
  });
}

function createInteractionState(
  settings: ModelHalftoneIllustrationSettings,
): DiamondInteractionState {
  return {
    autoElapsed: INITIAL_POSE.autoElapsed,
    dragging: false,
    mouseX: 0.5,
    mouseY: 0.5,
    pointerInside: false,
    pointerX: 0,
    pointerY: 0,
    rotateElapsed: INITIAL_POSE.rotateElapsed,
    rotationVelocityX: 0,
    rotationVelocityY: 0,
    rotationVelocityZ: 0,
    rotationX: INITIAL_POSE.rotationX,
    rotationY: INITIAL_POSE.rotationY,
    rotationZ: settings.rotationOffsetZ,
    targetRotationX: INITIAL_POSE.targetRotationX,
    targetRotationY: INITIAL_POSE.targetRotationY,
    velocityX: 0,
    velocityY: 0,
  };
}

function applySpringStep(
  current: number,
  target: number,
  velocity: number,
  strength: number,
  damping: number,
) {
  const nextVelocity = (velocity + (target - current) * strength) * damping;

  return {
    value: current + nextVelocity,
    velocity: nextVelocity,
  };
}

const StyledVisualMount = styled.div`
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

type ModelHalftoneIllustrationProps = {
  modelUrl: string;
  settings: ModelHalftoneIllustrationSettings;
};

export function ModelHalftoneIllustration({
  modelUrl,
  settings,
}: ModelHalftoneIllustrationProps) {
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
    let modelRoot: THREE.Object3D | null = null;
    let modelLocalBounds: THREE.Box3 | null = null;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(getVirtualWidth(), getVirtualHeight(), false);

    const canvas = renderer.domElement;
    canvas.style.cursor = settings.animation.followDragEnabled
      ? 'grab'
      : 'default';
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
    camera.position.z = settings.cameraDistance;

    const primaryLight = new THREE.DirectionalLight(
      0xffffff,
      settings.lighting.intensity,
    );
    setPrimaryLightPosition(
      primaryLight,
      settings.lighting.angleDegrees,
      settings.lighting.height,
    );
    scene3d.add(primaryLight);

    const fillLight = new THREE.DirectionalLight(
      0xffffff,
      settings.lighting.fillIntensity,
    );
    fillLight.position.set(-3, -1, 1);
    scene3d.add(fillLight);

    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      settings.lighting.ambientIntensity,
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
      fragmentShader: halftoneFragmentShader,
      transparent: true,
      uniforms: {
        cropToBounds: { value: 0 },
        dashColor: { value: new THREE.Color(settings.halftone.dashColor) },
        dragFlowStrength: { value: 0 },
        dragOffset: { value: new THREE.Vector2(0, 0) },
        effectResolution: {
          value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
        },
        footprintScale: { value: 1 },
        hoverFlowRadius: { value: 0.18 },
        hoverFlowStrength: { value: 0 },
        hoverLightRadius: { value: 0.2 },
        hoverLightStrength: { value: 0 },
        interactionUv: { value: new THREE.Vector2(0.5, 0.5) },
        interactionVelocity: { value: new THREE.Vector2(0, 0) },
        logicalResolution: {
          value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
        },
        s_3: { value: settings.halftone.power },
        s_4: { value: settings.halftone.width },
        tGlow: { value: blurTargetB.texture },
        tScene: { value: sceneTarget.texture },
        tile: { value: settings.halftone.scale },
        time: { value: 0 },
        waveAmount: { value: 0 },
        waveSpeed: { value: 1 },
      },
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
    };

    const interaction = createInteractionState(settings);
    const footprintScratch = createFootprintScaleScratch();
    const lookAtTarget = new THREE.Vector3(0, 0, 0);

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
      updateViewportUniforms(
        virtualWidth,
        virtualHeight,
        virtualWidth,
        virtualHeight,
      );
    };

    const resizeObserver = new ResizeObserver(syncSize);
    resizeObserver.observe(container);

    const updatePointerPosition = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);
      const localX = (event.clientX - rect.left) / width;
      const localY = (event.clientY - rect.top) / height;

      interaction.pointerInside =
        localX >= 0 &&
        localX <= 1 &&
        localY >= 0 &&
        localY <= 1;
      interaction.mouseX = THREE.MathUtils.clamp(localX, 0, 1);
      interaction.mouseY = THREE.MathUtils.clamp(localY, 0, 1);
    };

    const handlePointerEnter = (event: PointerEvent) => {
      updatePointerPosition(event);
      interaction.pointerInside = true;
    };

    const handlePointerDown = (event: PointerEvent) => {
      updatePointerPosition(event);
      interaction.dragging = true;
      interaction.pointerX = event.clientX;
      interaction.pointerY = event.clientY;
      interaction.velocityX = 0;
      interaction.velocityY = 0;
      canvas.style.cursor = 'grabbing';
    };

    const handlePointerMove = (event: PointerEvent) => {
      updatePointerPosition(event);
    };

    const handleWindowPointerMove = (event: PointerEvent) => {
      if (!interaction.dragging || !settings.animation.followDragEnabled) {
        return;
      }

      updatePointerPosition(event);

      const deltaX =
        (event.clientX - interaction.pointerX) * settings.animation.dragSens;
      const deltaY =
        (event.clientY - interaction.pointerY) * settings.animation.dragSens;
      interaction.velocityX = deltaY;
      interaction.velocityY = deltaX;
      interaction.targetRotationY += deltaX;
      interaction.targetRotationX += deltaY;
      interaction.pointerX = event.clientX;
      interaction.pointerY = event.clientY;
    };

    const handlePointerLeave = () => {
      interaction.pointerInside = false;

      if (interaction.dragging) {
        return;
      }

      interaction.mouseX = 0.5;
      interaction.mouseY = 0.5;
    };

    const handlePointerUp = () => {
      interaction.dragging = false;
      canvas.style.cursor = settings.animation.followDragEnabled
        ? 'grab'
        : 'default';

      if (!settings.animation.springReturnEnabled) {
        return;
      }

      const springImpulse = Math.max(
        settings.animation.springStrength * 10,
        1.2,
      );
      interaction.rotationVelocityX += interaction.velocityX * springImpulse;
      interaction.rotationVelocityY += interaction.velocityY * springImpulse;
      interaction.rotationVelocityZ += interaction.velocityY * springImpulse * 0.12;
      interaction.targetRotationX = 0;
      interaction.targetRotationY = 0;
      interaction.velocityX = 0;
      interaction.velocityY = 0;
    };

    const handleWindowBlur = () => {
      handlePointerUp();
      handlePointerLeave();
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerenter', handlePointerEnter);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    canvas.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('blur', handleWindowBlur);

    const clock = new THREE.Clock();

    const renderFrame = () => {
      if (cancelled) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(renderFrame);

      const delta = clock.getDelta();
      const elapsedTime = INITIAL_POSE.timeElapsed + clock.elapsedTime;
      halftoneMaterial.uniforms.time.value = elapsedTime;
      halftoneMaterial.uniforms.interactionUv.value.set(
        interaction.mouseX,
        1 - interaction.mouseY,
      );
      halftoneMaterial.uniforms.interactionVelocity.value.set(
        interaction.velocityY,
        -interaction.velocityX,
      );

      let baseRotationX = settings.rotationOffsetX;
      let baseRotationY = settings.rotationOffsetY;
      let baseRotationZ = settings.rotationOffsetZ;
      let lightAngle = settings.lighting.angleDegrees;
      let lightHeight = settings.lighting.height;

      if (settings.animation.autoRotateEnabled) {
        interaction.autoElapsed += delta;
        baseRotationY += interaction.autoElapsed * settings.animation.autoSpeed;
        baseRotationX +=
          Math.sin(interaction.autoElapsed * 0.2) *
          settings.animation.autoWobble;
      }

      if (settings.animation.rotateEnabled) {
        interaction.rotateElapsed += delta;
        const rotateProgress = settings.animation.rotatePingPong
          ? Math.sin(interaction.rotateElapsed * settings.animation.rotateSpeed) *
            Math.PI
          : interaction.rotateElapsed * settings.animation.rotateSpeed;
        const axisDirection = settings.animation.rotateAxis.startsWith('-')
          ? -1
          : 1;
        const axisProgress = rotateProgress * axisDirection;

        if (settings.animation.rotateAxis.includes('x')) {
          baseRotationX += axisProgress;
        }

        if (settings.animation.rotateAxis.includes('y')) {
          baseRotationY += axisProgress;
        }

        if (settings.animation.rotateAxis.includes('z')) {
          baseRotationZ += axisProgress;
        }
      }

      if (settings.animation.lightSweepEnabled) {
        const lightPhase = elapsedTime * settings.animation.lightSweepSpeed;
        lightAngle += Math.sin(lightPhase) * settings.animation.lightSweepRange;
        lightHeight +=
          Math.cos(lightPhase * 0.85) *
          settings.animation.lightSweepHeightRange;
      }

      let targetX = baseRotationX;
      let targetY = baseRotationY;
      let easing = 0.12;

      if (settings.animation.followHoverEnabled) {
        const rangeRadians = THREE.MathUtils.degToRad(
          settings.animation.hoverRange,
        );

        if (
          settings.animation.hoverReturn ||
          interaction.mouseX !== 0.5 ||
          interaction.mouseY !== 0.5
        ) {
          targetX += (interaction.mouseY - 0.5) * rangeRadians;
          targetY += (interaction.mouseX - 0.5) * rangeRadians;
        }

        easing = settings.animation.hoverEase;
      }

      if (settings.animation.followDragEnabled) {
        if (!interaction.dragging && settings.animation.dragMomentum) {
          interaction.targetRotationX += interaction.velocityX;
          interaction.targetRotationY += interaction.velocityY;
          interaction.velocityX *= 1 - settings.animation.dragFriction;
          interaction.velocityY *= 1 - settings.animation.dragFriction;
        }

        targetX += interaction.targetRotationX;
        targetY += interaction.targetRotationY;
        easing = settings.animation.dragFriction;
      }

      if (settings.animation.springReturnEnabled) {
        const springX = applySpringStep(
          interaction.rotationX,
          targetX,
          interaction.rotationVelocityX,
          settings.animation.springStrength,
          settings.animation.springDamping,
        );
        const springY = applySpringStep(
          interaction.rotationY,
          targetY,
          interaction.rotationVelocityY,
          settings.animation.springStrength,
          settings.animation.springDamping,
        );
        const springZ = applySpringStep(
          interaction.rotationZ,
          baseRotationZ,
          interaction.rotationVelocityZ,
          settings.animation.springStrength,
          settings.animation.springDamping,
        );

        interaction.rotationX = springX.value;
        interaction.rotationY = springY.value;
        interaction.rotationZ = springZ.value;
        interaction.rotationVelocityX = springX.velocity;
        interaction.rotationVelocityY = springY.velocity;
        interaction.rotationVelocityZ = springZ.velocity;
      } else {
        interaction.rotationX += (targetX - interaction.rotationX) * easing;
        interaction.rotationY += (targetY - interaction.rotationY) * easing;
        interaction.rotationZ +=
          (baseRotationZ - interaction.rotationZ) *
          (settings.animation.rotatePingPong ? 0.18 : 0.12);
      }

      pivot.rotation.set(
        interaction.rotationX,
        interaction.rotationY,
        interaction.rotationZ,
      );

      camera.lookAt(lookAtTarget);
      camera.updateMatrixWorld(true);
      setPrimaryLightPosition(primaryLight, lightAngle, lightHeight);

      if (modelRoot && modelLocalBounds) {
        modelRoot.updateMatrixWorld(true);
        halftoneMaterial.uniforms.footprintScale.value = getObjectFootprintScale(
          {
            camera,
            localBounds: modelLocalBounds,
            lookAtTarget,
            meshMatrixWorld: modelRoot.matrixWorld,
            scratch: footprintScratch,
            viewportHeight: getVirtualHeight(),
            viewportWidth: getVirtualWidth(),
          },
        );
      }

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
      modelUrl,
      (gltf) => {
        if (cancelled) {
          disposeObjectSubtree(gltf.scene);
          return;
        }

        const nextModelRoot = gltf.scene;
        normalizeModelRoot(nextModelRoot);
        applyPhysicalMaterial(
          nextModelRoot,
          environmentTexture,
          settings.material,
        );
        nextModelRoot.updateMatrixWorld(true);
        const worldBounds = new THREE.Box3().setFromObject(nextModelRoot);
        modelLocalBounds = worldBounds.applyMatrix4(
          nextModelRoot.matrixWorld.clone().invert(),
        );
        modelRoot = nextModelRoot;
        pivot.add(nextModelRoot);
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
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerenter', handlePointerEnter);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('blur', handleWindowBlur);
      window.cancelAnimationFrame(animationFrameId);

      if (modelRoot) {
        disposeObjectSubtree(modelRoot);
      }

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
  }, [modelUrl, settings]);

  return <StyledVisualMount aria-hidden ref={mountReference} />;
}

export function Lock() {
  return (
    <ModelHalftoneIllustration
      modelUrl={LOCK_MODEL_URL}
      settings={LOCK_EFFECT_SETTINGS}
    />
  );
}
