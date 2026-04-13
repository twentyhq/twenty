'use client';

import {
  getImageFootprintScale,
  getImagePreviewZoom,
  getMeshFootprintScale,
  VIRTUAL_RENDER_HEIGHT,
} from '@/app/halftone/_lib/footprint';
import {
  applyHalftoneMaterialSettings,
  createHalftoneMaterial,
  createHalftoneMaterialAssets,
  disposeHalftoneMaterialAssets,
  type HalftoneMaterialAssets,
  type HalftoneTransmissionMaterial,
  renderHalftoneMaterialScene,
} from '@/app/halftone/_lib/materials';
import type {
  HalftoneExportPose,
  HalftoneStudioSettings,
} from '@/app/halftone/_lib/state';
import { styled } from '@linaria/react';
import { type MutableRefObject, useEffect, useRef } from 'react';
import * as THREE from 'three';

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
  uniform sampler2D tGlow;
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
      hoverHalftoneMask = smoothstep(hoverHalftoneRadiusPx, 0.0, fragDist);
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
      hoverLightStrength *
      hoverLightMask *
      mix(0.78, 1.18, motionBias) *
      0.22;
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

const IMAGE_POINTER_FOLLOW = 0.38;
const IMAGE_POINTER_VELOCITY_DAMPING = 0.82;
const MAX_PREVIEW_PIXEL_RATIO = 2;

const CanvasMount = styled.div<{ $background: string }>`
  background: ${(props) => props.$background};
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

export type HalftoneSnapshotFn = (
  width: number,
  height: number,
  options?: {
    backgroundColor?: string;
    includeBackground?: boolean;
  },
) => Promise<Blob | null>;

type HalftoneCanvasProps = {
  geometry: THREE.BufferGeometry | null;
  initialPose?: Partial<HalftoneExportPose>;
  imageElement: HTMLImageElement | null;
  onFirstInteraction: () => void;
  onPoseChange: (pose: HalftoneExportPose) => void;
  previewDistance: number;
  settings: HalftoneStudioSettings;
  snapshotRef?: MutableRefObject<HalftoneSnapshotFn | null>;
};

type SceneResources = {
  ambientLight: THREE.AmbientLight;
  blurHorizontalMaterial: THREE.ShaderMaterial;
  blurHorizontalScene: THREE.Scene;
  blurTargetA: THREE.WebGLRenderTarget;
  blurTargetB: THREE.WebGLRenderTarget;
  blurVerticalMaterial: THREE.ShaderMaterial;
  blurVerticalScene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  canvas: HTMLCanvasElement;
  fillLight: THREE.DirectionalLight;
  fullScreenGeometry: THREE.PlaneGeometry;
  halftoneMaterial: THREE.ShaderMaterial;
  imageMaterial: THREE.ShaderMaterial;
  imageScene: THREE.Scene;
  imageTexture: THREE.Texture | null;
  materialAssets: HalftoneMaterialAssets;
  material: HalftoneTransmissionMaterial;
  mesh: THREE.Mesh;
  orthographicCamera: THREE.OrthographicCamera;
  postScene: THREE.Scene;
  primaryLight: THREE.DirectionalLight;
  renderer: THREE.WebGLRenderer;
  scene3d: THREE.Scene;
  sceneTarget: THREE.WebGLRenderTarget;
  transmissionBacksideTarget: THREE.WebGLRenderTarget;
  transmissionTarget: THREE.WebGLRenderTarget;
};

type InteractionState = {
  activePointerId: number | null;
  autoElapsed: number;
  dragging: boolean;
  mouseX: number;
  mouseY: number;
  pointerInside: boolean;
  pointerVelocityX: number;
  pointerVelocityY: number;
  pointerX: number;
  pointerY: number;
  rotateElapsed: number;
  rotationX: number;
  rotationVelocityX: number;
  rotationY: number;
  rotationVelocityY: number;
  rotationZ: number;
  rotationVelocityZ: number;
  smoothedMouseX: number;
  smoothedMouseY: number;
  targetRotationX: number;
  targetRotationY: number;
  velocityX: number;
  velocityY: number;
};

type PixelBounds = {
  maxX: number;
  maxY: number;
  minX: number;
  minY: number;
};

function createRenderTarget(width: number, height: number) {
  return new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  });
}

function createInteractionState(
  initialPose?: Partial<HalftoneExportPose>,
): InteractionState {
  return {
    activePointerId: null,
    autoElapsed: initialPose?.autoElapsed ?? 0,
    dragging: false,
    mouseX: 0.5,
    mouseY: 0.5,
    pointerInside: false,
    pointerVelocityX: 0,
    pointerVelocityY: 0,
    pointerX: 0,
    pointerY: 0,
    rotateElapsed: initialPose?.rotateElapsed ?? 0,
    rotationX: initialPose?.rotationX ?? 0,
    rotationVelocityX: 0,
    rotationY: initialPose?.rotationY ?? 0,
    rotationVelocityY: 0,
    rotationZ: initialPose?.rotationZ ?? 0,
    rotationVelocityZ: 0,
    smoothedMouseX: 0.5,
    smoothedMouseY: 0.5,
    targetRotationX: initialPose?.targetRotationX ?? 0,
    targetRotationY: initialPose?.targetRotationY ?? 0,
    velocityX: 0,
    velocityY: 0,
  };
}

function getAlphaCropBounds(
  pixels: Uint8Array,
  width: number,
  height: number,
  threshold = 8,
  padding = 1,
): PixelBounds | null {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = pixels[(y * width + x) * 4 + 3];

      if (alpha <= threshold) {
        continue;
      }

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) {
    return null;
  }

  return {
    minX: Math.max(minX - padding, 0),
    minY: Math.max(minY - padding, 0),
    maxX: Math.min(maxX + padding, width - 1),
    maxY: Math.min(maxY + padding, height - 1),
  };
}

function getCanvasCursor(
  settings: HalftoneStudioSettings,
  isDragging: boolean,
) {
  if (settings.sourceMode === 'image') {
    return 'crosshair';
  }

  if (settings.animation.followDragEnabled) {
    return isDragging ? 'grabbing' : 'grab';
  }

  return 'default';
}

function setPrimaryLightPosition(
  light: THREE.DirectionalLight,
  angleDegrees: number,
  height: number,
) {
  const lightAngle = (angleDegrees * Math.PI) / 180;
  light.position.set(
    Math.cos(lightAngle) * 5,
    height,
    Math.sin(lightAngle) * 5,
  );
}

function updateLighting(
  resources: SceneResources,
  settings: HalftoneStudioSettings,
) {
  resources.primaryLight.intensity = settings.lighting.intensity;
  setPrimaryLightPosition(
    resources.primaryLight,
    settings.lighting.angleDegrees,
    settings.lighting.height,
  );
  resources.fillLight.intensity = settings.lighting.fillIntensity;
  resources.ambientLight.intensity = settings.lighting.ambientIntensity;
}

function updateMaterial(
  resources: SceneResources,
  settings: HalftoneStudioSettings,
) {
  applyHalftoneMaterialSettings(
    resources.material,
    settings.material,
    resources.materialAssets,
  );
}

function updateHalftone(
  resources: SceneResources,
  settings: HalftoneStudioSettings,
) {
  resources.halftoneMaterial.uniforms.tile.value = settings.halftone.scale;
  resources.halftoneMaterial.uniforms.s_3.value = settings.halftone.power;
  resources.halftoneMaterial.uniforms.s_4.value = settings.halftone.width;
  (resources.halftoneMaterial.uniforms.dashColor.value as THREE.Color).set(
    settings.halftone.dashColor,
  );
  (resources.halftoneMaterial.uniforms.hoverDashColor.value as THREE.Color).set(
    settings.halftone.hoverDashColor,
  );
  resources.halftoneMaterial.uniforms.waveAmount.value =
    settings.animation.waveEnabled && settings.sourceMode !== 'image'
      ? settings.animation.waveAmount
      : 0;
  resources.halftoneMaterial.uniforms.waveSpeed.value =
    settings.animation.waveSpeed;
  resources.imageMaterial.uniforms.contrast.value =
    settings.halftone.imageContrast;
}

function syncResources(
  resources: SceneResources,
  settings: HalftoneStudioSettings,
) {
  updateLighting(resources, settings);
  updateMaterial(resources, settings);
  updateHalftone(resources, settings);
}

function applySpringStep(
  current: number,
  target: number,
  velocity: number,
  strength: number,
  damping: number,
) {
  const nextVelocity = (velocity + (target - current) * strength) * damping;
  const nextValue = current + nextVelocity;

  return {
    value: nextValue,
    velocity: nextVelocity,
  };
}

function resetInteractionState(
  interactionState: InteractionState,
  animation: HalftoneStudioSettings['animation'],
) {
  interactionState.activePointerId = null;
  interactionState.dragging = false;
  interactionState.mouseX = 0.5;
  interactionState.mouseY = 0.5;
  interactionState.pointerInside = false;
  interactionState.pointerVelocityX = 0;
  interactionState.pointerVelocityY = 0;
  interactionState.smoothedMouseX = 0.5;
  interactionState.smoothedMouseY = 0.5;
  interactionState.targetRotationX = 0;
  interactionState.targetRotationY = 0;
  interactionState.velocityX = 0;
  interactionState.velocityY = 0;
  interactionState.rotationVelocityX = 0;
  interactionState.rotationVelocityY = 0;
  interactionState.rotationVelocityZ = 0;

  if (animation.autoRotateEnabled) {
    interactionState.autoElapsed = 0;
  }
}

export function HalftoneCanvas({
  geometry,
  initialPose,
  imageElement,
  onFirstInteraction,
  onPoseChange,
  previewDistance,
  settings,
  snapshotRef,
}: HalftoneCanvasProps) {
  const mountReference = useRef<HTMLDivElement>(null);
  const resourcesReference = useRef<SceneResources | null>(null);
  const settingsReference = useRef(settings);
  const interactionReference = useRef<InteractionState>(
    createInteractionState(initialPose),
  );
  const animationReference = useRef(settings.animation);
  const didInteractReference = useRef(false);
  const initialPoseReference = useRef(initialPose);
  const poseChangeReference = useRef(onPoseChange);
  const previewDistanceReference = useRef(previewDistance);
  const geometryReference = useRef(geometry);
  const snapshotReference = useRef(snapshotRef);

  useEffect(() => {
    initialPoseReference.current = initialPose;
    interactionReference.current = createInteractionState(initialPose);
  }, [initialPose]);

  useEffect(() => {
    poseChangeReference.current = onPoseChange;
  }, [onPoseChange]);

  useEffect(() => {
    previewDistanceReference.current = previewDistance;

    const resources = resourcesReference.current;

    if (!resources) {
      return;
    }

    resources.camera.position.z = previewDistance;
  }, [previewDistance]);

  useEffect(() => {
    settingsReference.current = settings;

    const resources = resourcesReference.current;

    if (!resources) {
      animationReference.current = settings.animation;
      return;
    }

    const prev = animationReference.current;
    const next = settings.animation;

    if (
      prev.autoRotateEnabled !== next.autoRotateEnabled ||
      prev.followHoverEnabled !== next.followHoverEnabled ||
      prev.followDragEnabled !== next.followDragEnabled ||
      prev.hoverHalftoneEnabled !== next.hoverHalftoneEnabled ||
      prev.hoverLightEnabled !== next.hoverLightEnabled ||
      prev.dragFlowEnabled !== next.dragFlowEnabled
    ) {
      resetInteractionState(interactionReference.current, next);
    }

    if (
      (!prev.rotateEnabled && next.rotateEnabled) ||
      prev.rotatePreset !== next.rotatePreset
    ) {
      interactionReference.current.rotateElapsed = 0;
    }

    animationReference.current = settings.animation;
    syncResources(resources, settings);
    resources.canvas.style.cursor = getCanvasCursor(
      settings,
      interactionReference.current.dragging,
    );
  }, [settings]);

  useEffect(() => {
    geometryReference.current = geometry;

    const resources = resourcesReference.current;

    if (!resources || !geometry) {
      return;
    }

    resources.mesh.geometry = geometry;
  }, [geometry]);

  useEffect(() => {
    snapshotReference.current = snapshotRef;
  }, [snapshotRef]);

  useEffect(() => {
    const resources = resourcesReference.current;

    if (!resources) {
      return;
    }

    if (imageElement) {
      if (resources.imageTexture) {
        resources.imageTexture.dispose();
      }

      const texture = new THREE.Texture(imageElement);
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
      texture.colorSpace = THREE.SRGBColorSpace;
      resources.imageTexture = texture;
      resources.imageMaterial.uniforms.tImage.value = texture;
      resources.imageMaterial.uniforms.imageSize.value.set(
        imageElement.naturalWidth,
        imageElement.naturalHeight,
      );
    } else {
      if (resources.imageTexture) {
        resources.imageTexture.dispose();
        resources.imageTexture = null;
        resources.imageMaterial.uniforms.tImage.value = null;
      }
    }
  }, [imageElement]);

  useEffect(() => {
    const container = mountReference.current;
    const initialSettings = settingsReference.current;
    const initialPreviewDistance = previewDistanceReference.current;
    const activeSnapshotRef = snapshotReference.current;

    if (!container || !geometryReference.current) {
      return;
    }

    let animationFrameId = 0;
    let cancelled = false;

    const getWidth = () => Math.max(container.clientWidth, 1);
    const getHeight = () => Math.max(container.clientHeight, 1);
    const getVirtualHeight = () => Math.max(VIRTUAL_RENDER_HEIGHT, getHeight());
    const getVirtualWidth = () =>
      Math.max(
        Math.round(
          getVirtualHeight() * (getWidth() / Math.max(getHeight(), 1)),
        ),
        1,
      );
    const getRenderScale = () =>
      Math.min(window.devicePixelRatio || 1, MAX_PREVIEW_PIXEL_RATIO);
    const getRenderHeight = () =>
      Math.max(Math.round(getVirtualHeight() * getRenderScale()), 1);
    const getRenderWidth = () =>
      Math.max(Math.round(getVirtualWidth() * getRenderScale()), 1);

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(getRenderWidth(), getRenderHeight(), false);

    const canvas = renderer.domElement;
    canvas.style.cursor = getCanvasCursor(settingsReference.current, false);
    canvas.style.display = 'block';
    canvas.style.height = '100%';
    canvas.style.touchAction = 'none';
    canvas.style.width = '100%';
    container.appendChild(canvas);

    let cleanup = () => {
      renderer.dispose();
      resourcesReference.current = null;

      if (activeSnapshotRef) {
        activeSnapshotRef.current = null;
      }

      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };

    void (async () => {
      const materialAssets = await createHalftoneMaterialAssets(renderer);

      if (cancelled) {
        disposeHalftoneMaterialAssets(materialAssets);
        cleanup();

        return;
      }

      const scene3d = new THREE.Scene();
      scene3d.background = null;

      const camera = new THREE.PerspectiveCamera(
        45,
        getWidth() / getHeight(),
        0.1,
        100,
      );
      camera.position.z = initialPreviewDistance;

      const primaryLight = new THREE.DirectionalLight(0xffffff, 1.5);
      scene3d.add(primaryLight);

      const fillLight = new THREE.DirectionalLight(0xffffff, 0.15);
      fillLight.position.set(-3, -1, 1);
      scene3d.add(fillLight);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.08);
      scene3d.add(ambientLight);

      const material = createHalftoneMaterial();
      applyHalftoneMaterialSettings(
        material,
        settingsReference.current.material,
        materialAssets,
      );

      const currentGeometry = geometryReference.current;

      if (!currentGeometry) {
        disposeHalftoneMaterialAssets(materialAssets);
        cleanup();

        return;
      }

      const mesh = new THREE.Mesh(currentGeometry, material);
      scene3d.add(mesh);

      const sceneTarget = createRenderTarget(
        getRenderWidth(),
        getRenderHeight(),
      );
      const transmissionBacksideTarget = createRenderTarget(
        getRenderWidth(),
        getRenderHeight(),
      );
      const transmissionTarget = createRenderTarget(
        getRenderWidth(),
        getRenderHeight(),
      );
      const blurTargetA = createRenderTarget(
        getRenderWidth(),
        getRenderHeight(),
      );
      const blurTargetB = createRenderTarget(
        getRenderWidth(),
        getRenderHeight(),
      );
      const fullScreenGeometry = new THREE.PlaneGeometry(2, 2);
      const orthographicCamera = new THREE.OrthographicCamera(
        -1,
        1,
        1,
        -1,
        0,
        1,
      );

      const blurHorizontalMaterial = new THREE.ShaderMaterial({
        uniforms: {
          tInput: { value: null },
          dir: { value: new THREE.Vector2(1, 0) },
          res: {
            value: new THREE.Vector2(getRenderWidth(), getRenderHeight()),
          },
        },
        vertexShader: passThroughVertexShader,
        fragmentShader: blurFragmentShader,
      });

      const blurVerticalMaterial = new THREE.ShaderMaterial({
        uniforms: {
          tInput: { value: null },
          dir: { value: new THREE.Vector2(0, 1) },
          res: {
            value: new THREE.Vector2(getRenderWidth(), getRenderHeight()),
          },
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
            value: new THREE.Vector2(getRenderWidth(), getRenderHeight()),
          },
          logicalResolution: {
            value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
          },
          tile: { value: initialSettings.halftone.scale },
          s_3: { value: initialSettings.halftone.power },
          s_4: { value: initialSettings.halftone.width },
          dashColor: {
            value: new THREE.Color(initialSettings.halftone.dashColor),
          },
          hoverDashColor: {
            value: new THREE.Color(initialSettings.halftone.hoverDashColor),
          },
          time: { value: 0 },
          waveAmount: { value: 0 },
          waveSpeed: { value: 1 },
          footprintScale: { value: 1.0 },
          interactionUv: { value: new THREE.Vector2(0.5, 0.5) },
          interactionVelocity: { value: new THREE.Vector2(0, 0) },
          dragOffset: { value: new THREE.Vector2(0, 0) },
          hoverHalftoneActive: { value: 0 },
          hoverHalftonePowerShift: { value: 0 },
          hoverHalftoneRadius: { value: 0.2 },
          hoverHalftoneWidthShift: { value: 0 },
          hoverLightStrength: { value: 0 },
          hoverLightRadius: { value: 0.2 },
          hoverFlowStrength: { value: 0 },
          hoverFlowRadius: { value: 0.18 },
          dragFlowStrength: { value: 0 },
          cropToBounds: { value: 0 },
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

      const imageMaterial = new THREE.ShaderMaterial({
        uniforms: {
          tImage: { value: null },
          imageSize: { value: new THREE.Vector2(1, 1) },
          viewportSize: {
            value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
          },
          zoom: { value: getImagePreviewZoom(initialPreviewDistance) },
          contrast: { value: initialSettings.halftone.imageContrast },
        },
        vertexShader: passThroughVertexShader,
        fragmentShader: imagePassthroughFragmentShader,
      });

      const imageScene = new THREE.Scene();
      imageScene.add(new THREE.Mesh(fullScreenGeometry, imageMaterial));

      const resources: SceneResources = {
        ambientLight,
        blurHorizontalMaterial,
        blurHorizontalScene,
        blurTargetA,
        blurTargetB,
        blurVerticalMaterial,
        blurVerticalScene,
        camera,
        canvas,
        fillLight,
        fullScreenGeometry,
        halftoneMaterial,
        imageMaterial,
        imageScene,
        imageTexture: null,
        materialAssets,
        material,
        mesh,
        orthographicCamera,
        postScene,
        primaryLight,
        renderer,
        scene3d,
        sceneTarget,
        transmissionBacksideTarget,
        transmissionTarget,
      };

      const updateViewportUniforms = (
        logicalWidth: number,
        logicalHeight: number,
        effectWidth: number,
        effectHeight: number,
      ) => {
        blurHorizontalMaterial.uniforms.res.value.set(
          effectWidth,
          effectHeight,
        );
        blurVerticalMaterial.uniforms.res.value.set(effectWidth, effectHeight);
        halftoneMaterial.uniforms.effectResolution.value.set(
          effectWidth,
          effectHeight,
        );
        halftoneMaterial.uniforms.logicalResolution.value.set(
          logicalWidth,
          logicalHeight,
        );
        imageMaterial.uniforms.viewportSize.value.set(
          logicalWidth,
          logicalHeight,
        );
      };

      const getImageHalftoneScale = (
        viewportWidth: number,
        viewportHeight: number,
        activePreviewDistance: number,
      ) => {
        const imageSize = imageMaterial.uniforms.imageSize
          .value as THREE.Vector2;

        return getImageFootprintScale({
          imageHeight: imageSize.y,
          imageWidth: imageSize.x,
          previewDistance: activePreviewDistance,
          viewportHeight,
          viewportWidth,
        });
      };

      const getMeshHalftoneScale = (
        viewportWidth: number,
        viewportHeight: number,
        lookAtTarget: THREE.Vector3,
      ) => {
        if (!mesh.geometry.boundingBox) {
          mesh.geometry.computeBoundingBox();
        }

        const localBounds = mesh.geometry.boundingBox;

        if (!localBounds) {
          return 1;
        }

        mesh.updateMatrixWorld();
        camera.updateMatrixWorld();

        return getMeshFootprintScale({
          camera,
          localBounds,
          lookAtTarget,
          meshMatrixWorld: mesh.matrixWorld,
          viewportHeight,
          viewportWidth,
        });
      };

      resourcesReference.current = resources;
      const latestGeometry = geometryReference.current;

      if (latestGeometry && resources.mesh.geometry !== latestGeometry) {
        resources.mesh.geometry = latestGeometry;
      }

      syncResources(resources, settingsReference.current);

      const captureSnapshot: HalftoneSnapshotFn = async (
        snapshotWidth: number,
        snapshotHeight: number,
        options,
      ) => {
        const activeSettings = settingsReference.current;
        const isImage =
          activeSettings.sourceMode === 'image' &&
          resources.imageTexture !== null;
        const includeBackground = options?.includeBackground ?? false;
        const backgroundColor =
          options?.backgroundColor ?? activeSettings.background.color;

        const snapScene = createRenderTarget(snapshotWidth, snapshotHeight);
        const snapTransmissionBackside = createRenderTarget(
          snapshotWidth,
          snapshotHeight,
        );
        const snapTransmission = createRenderTarget(
          snapshotWidth,
          snapshotHeight,
        );
        const snapBlurA = createRenderTarget(snapshotWidth, snapshotHeight);
        const snapBlurB = createRenderTarget(snapshotWidth, snapshotHeight);

        const prevSize = renderer.getSize(new THREE.Vector2());

        renderer.setSize(snapshotWidth, snapshotHeight, false);

        updateViewportUniforms(
          snapshotWidth,
          snapshotHeight,
          snapshotWidth,
          snapshotHeight,
        );
        halftoneMaterial.uniforms.hoverHalftoneActive.value = 0;
        halftoneMaterial.uniforms.hoverHalftonePowerShift.value = 0;
        halftoneMaterial.uniforms.hoverHalftoneWidthShift.value = 0;
        halftoneMaterial.uniforms.hoverLightStrength.value = 0;
        halftoneMaterial.uniforms.hoverFlowStrength.value = 0;
        halftoneMaterial.uniforms.dragFlowStrength.value = 0;
        halftoneMaterial.uniforms.interactionVelocity.value.set(0, 0);
        halftoneMaterial.uniforms.dragOffset.value.set(0, 0);
        halftoneMaterial.uniforms.cropToBounds.value = isImage ? 1 : 0;

        if (isImage) {
          imageMaterial.uniforms.zoom.value = getImagePreviewZoom(
            previewDistanceReference.current,
          );
          halftoneMaterial.uniforms.footprintScale.value =
            getImageHalftoneScale(
              snapshotWidth,
              snapshotHeight,
              previewDistanceReference.current,
            );
        } else {
          camera.aspect = snapshotWidth / snapshotHeight;
          camera.updateProjectionMatrix();
          halftoneMaterial.uniforms.footprintScale.value = getMeshHalftoneScale(
            snapshotWidth,
            snapshotHeight,
            new THREE.Vector3(0, mesh.position.y * 0.2, 0),
          );
        }

        if (isImage) {
          renderer.setRenderTarget(snapScene);
          renderer.render(imageScene, orthographicCamera);
        } else {
          renderHalftoneMaterialScene({
            camera,
            elapsedTime: halftoneMaterial.uniforms.time.value as number,
            material,
            mesh,
            outputTarget: snapScene,
            renderer,
            scene: scene3d,
            transmissionBackground: materialAssets.glassBackgroundTexture,
            transmissionScene: materialAssets.glassTransmissionScene,
            transmissionBacksideTarget: snapTransmissionBackside,
            transmissionTarget: snapTransmission,
          });
        }

        halftoneMaterial.uniforms.tScene.value = snapScene.texture;

        blurHorizontalMaterial.uniforms.tInput.value = snapScene.texture;
        renderer.setRenderTarget(snapBlurA);
        renderer.render(blurHorizontalScene, orthographicCamera);

        blurVerticalMaterial.uniforms.tInput.value = snapBlurA.texture;
        renderer.setRenderTarget(snapBlurB);
        renderer.render(blurVerticalScene, orthographicCamera);

        blurHorizontalMaterial.uniforms.tInput.value = snapBlurB.texture;
        renderer.setRenderTarget(snapBlurA);
        renderer.render(blurHorizontalScene, orthographicCamera);

        blurVerticalMaterial.uniforms.tInput.value = snapBlurA.texture;
        renderer.setRenderTarget(snapBlurB);
        renderer.render(blurVerticalScene, orthographicCamera);

        halftoneMaterial.uniforms.tGlow.value = snapBlurB.texture;

        const outputTarget = createRenderTarget(snapshotWidth, snapshotHeight);
        renderer.setRenderTarget(outputTarget);
        renderer.clear();
        renderer.render(postScene, orthographicCamera);

        const pixelBuffer = new Uint8Array(snapshotWidth * snapshotHeight * 4);
        renderer.readRenderTargetPixels(
          outputTarget,
          0,
          0,
          snapshotWidth,
          snapshotHeight,
          pixelBuffer,
        );

        renderer.setSize(prevSize.x, prevSize.y, false);
        halftoneMaterial.uniforms.tScene.value = sceneTarget.texture;
        halftoneMaterial.uniforms.tGlow.value = blurTargetB.texture;
        updateViewportUniforms(
          getVirtualWidth(),
          getVirtualHeight(),
          prevSize.x,
          prevSize.y,
        );
        if (isImage) {
          imageMaterial.uniforms.zoom.value = getImagePreviewZoom(
            previewDistanceReference.current,
          );
        } else {
          camera.aspect = getWidth() / Math.max(getHeight(), 1);
          camera.updateProjectionMatrix();
        }

        snapScene.dispose();
        snapTransmissionBackside.dispose();
        snapTransmission.dispose();
        snapBlurA.dispose();
        snapBlurB.dispose();
        outputTarget.dispose();

        const flippedBuffer = new Uint8Array(
          snapshotWidth * snapshotHeight * 4,
        );
        const rowSize = snapshotWidth * 4;
        for (let y = 0; y < snapshotHeight; y++) {
          const srcOffset = y * rowSize;
          const dstOffset = (snapshotHeight - 1 - y) * rowSize;
          flippedBuffer.set(
            pixelBuffer.subarray(srcOffset, srcOffset + rowSize),
            dstOffset,
          );
        }

        const fullSnapshotBounds = {
          minX: 0,
          minY: 0,
          maxX: snapshotWidth - 1,
          maxY: snapshotHeight - 1,
        };
        const alphaCropBounds = getAlphaCropBounds(
          flippedBuffer,
          snapshotWidth,
          snapshotHeight,
        );
        const cropBounds = includeBackground
          ? fullSnapshotBounds
          : (alphaCropBounds ?? fullSnapshotBounds);
        const croppedWidth = cropBounds.maxX - cropBounds.minX + 1;
        const croppedHeight = cropBounds.maxY - cropBounds.minY + 1;
        const croppedBuffer = new Uint8ClampedArray(
          croppedWidth * croppedHeight * 4,
        );

        for (let y = 0; y < croppedHeight; y++) {
          const sourceStart =
            ((cropBounds.minY + y) * snapshotWidth + cropBounds.minX) * 4;
          const sourceEnd = sourceStart + croppedWidth * 4;
          const destinationStart = y * croppedWidth * 4;

          croppedBuffer.set(
            flippedBuffer.subarray(sourceStart, sourceEnd),
            destinationStart,
          );
        }

        const imageData = new ImageData(
          croppedBuffer,
          croppedWidth,
          croppedHeight,
        );
        const offscreen = document.createElement('canvas');
        offscreen.width = croppedWidth;
        offscreen.height = croppedHeight;
        const ctx = offscreen.getContext('2d');

        if (!ctx) {
          return null;
        }

        if (includeBackground) {
          const sourceCanvas = document.createElement('canvas');
          sourceCanvas.width = croppedWidth;
          sourceCanvas.height = croppedHeight;
          const sourceContext = sourceCanvas.getContext('2d');

          if (!sourceContext) {
            return null;
          }

          sourceContext.putImageData(imageData, 0, 0);
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, croppedWidth, croppedHeight);
          ctx.drawImage(sourceCanvas, 0, 0);
        } else {
          ctx.putImageData(imageData, 0, 0);
        }

        return new Promise<Blob | null>((resolve) => {
          offscreen.toBlob((blob) => resolve(blob), 'image/png');
        });
      };

      if (activeSnapshotRef) {
        activeSnapshotRef.current = captureSnapshot;
      }

      const syncSize = () => {
        if (cancelled) {
          return;
        }

        const width = getWidth();
        const height = getHeight();
        const logicalWidth = getVirtualWidth();
        const logicalHeight = getVirtualHeight();
        const renderWidth = getRenderWidth();
        const renderHeight = getRenderHeight();

        renderer.setSize(renderWidth, renderHeight, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        sceneTarget.setSize(renderWidth, renderHeight);
        transmissionBacksideTarget.setSize(renderWidth, renderHeight);
        transmissionTarget.setSize(renderWidth, renderHeight);
        blurTargetA.setSize(renderWidth, renderHeight);
        blurTargetB.setSize(renderWidth, renderHeight);
        updateViewportUniforms(
          logicalWidth,
          logicalHeight,
          renderWidth,
          renderHeight,
        );
      };

      const resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(container);

      const updatePointerPosition = (
        event: PointerEvent,
        options?: { resetVelocity?: boolean },
      ) => {
        const interaction = interactionReference.current;
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
          interaction.dragging ||
          (event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom);

        if (options?.resetVelocity) {
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

      const releasePointerCapture = (pointerId: number | null) => {
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

      const markFirstInteraction = () => {
        if (didInteractReference.current) {
          return;
        }

        didInteractReference.current = true;
        onFirstInteraction();
      };

      const handlePointerDown = (event: PointerEvent) => {
        const interaction = interactionReference.current;
        const activeSettings = settingsReference.current;
        const canDrag =
          activeSettings.sourceMode === 'image'
            ? false
            : activeSettings.animation.followDragEnabled;

        updatePointerPosition(event, { resetVelocity: true });
        interaction.pointerX = event.clientX;
        interaction.pointerY = event.clientY;

        if (canDrag) {
          interaction.dragging = true;
          interaction.activePointerId = event.pointerId;
          interaction.velocityX = 0;
          interaction.velocityY = 0;

          try {
            canvas.setPointerCapture(event.pointerId);
          } catch (error) {
            void error;
          }
        }

        canvas.style.cursor = getCanvasCursor(
          activeSettings,
          interaction.dragging,
        );

        markFirstInteraction();
      };

      const handlePointerMove = (event: PointerEvent) => {
        const interaction = interactionReference.current;
        const resetVelocity =
          !interaction.pointerInside && !interaction.dragging;
        updatePointerPosition(
          event,
          resetVelocity ? { resetVelocity: true } : undefined,
        );
        const activeSettings = settingsReference.current;

        if (
          activeSettings.sourceMode === 'image' &&
          interaction.pointerInside
        ) {
          markFirstInteraction();
        }

        if (!interaction.dragging) {
          return;
        }

        if (
          interaction.activePointerId !== null &&
          event.pointerId !== interaction.activePointerId
        ) {
          return;
        }

        const animation = activeSettings.animation;

        if (!animation.followDragEnabled) {
          return;
        }

        const deltaX =
          (event.clientX - interaction.pointerX) * animation.dragSens;
        const deltaY =
          (event.clientY - interaction.pointerY) * animation.dragSens;
        interaction.velocityX = deltaY;
        interaction.velocityY = deltaX;
        interaction.targetRotationY += deltaX;
        interaction.targetRotationX += deltaY;
        interaction.pointerX = event.clientX;
        interaction.pointerY = event.clientY;
      };

      const handlePointerLeave = () => {
        const interaction = interactionReference.current;
        const activeSettings = settingsReference.current;

        if (interaction.dragging) {
          return;
        }

        interaction.pointerInside = false;
        interaction.pointerVelocityX = 0;
        interaction.pointerVelocityY = 0;

        if (activeSettings.sourceMode !== 'image') {
          interaction.mouseX = 0.5;
          interaction.mouseY = 0.5;
        }

        canvas.style.cursor = getCanvasCursor(activeSettings, false);
      };

      const handlePointerUp = (event: PointerEvent) => {
        const interaction = interactionReference.current;
        const activeSettings = settingsReference.current;
        const animation = activeSettings.animation;

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

        if (
          !interaction.pointerInside &&
          activeSettings.sourceMode !== 'image'
        ) {
          interaction.mouseX = 0.5;
          interaction.mouseY = 0.5;
        }

        canvas.style.cursor = getCanvasCursor(activeSettings, false);

        if (!animation.springReturnEnabled) {
          return;
        }

        const springImpulse = Math.max(animation.springStrength * 10, 1.2);
        interaction.rotationVelocityX += interaction.velocityX * springImpulse;
        interaction.rotationVelocityY += interaction.velocityY * springImpulse;
        interaction.rotationVelocityZ +=
          interaction.velocityY * springImpulse * 0.12;
        interaction.targetRotationX = 0;
        interaction.targetRotationY = 0;
        interaction.velocityX = 0;
        interaction.velocityY = 0;
      };

      const handlePointerCancel = () => {
        const interaction = interactionReference.current;
        const activeSettings = settingsReference.current;
        releasePointerCapture(interaction.activePointerId);
        interaction.activePointerId = null;
        interaction.dragging = false;
        interaction.pointerInside = false;
        interaction.pointerVelocityX = 0;
        interaction.pointerVelocityY = 0;

        interaction.mouseX = 0.5;
        interaction.mouseY = 0.5;
        interaction.smoothedMouseX = 0.5;
        interaction.smoothedMouseY = 0.5;

        canvas.style.cursor = getCanvasCursor(activeSettings, false);
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

      const renderFrame = (timestamp?: DOMHighResTimeStamp) => {
        if (cancelled) {
          return;
        }

        animationFrameId = window.requestAnimationFrame(renderFrame);
        clock.update(timestamp);

        const interaction = interactionReference.current;
        const activeSettings = settingsReference.current;
        const delta = clock.getDelta();
        const elapsedTime =
          (initialPoseReference.current?.timeElapsed ?? 0) + clock.getElapsed();
        const baseDistance = previewDistanceReference.current;
        const logicalWidth = getVirtualWidth();
        const logicalHeight = getVirtualHeight();
        const isImageMode = activeSettings.sourceMode === 'image';
        const hasImageTexture = resources.imageTexture !== null;

        halftoneMaterial.uniforms.time.value = elapsedTime;
        halftoneMaterial.uniforms.waveAmount.value =
          activeSettings.animation.waveEnabled && !isImageMode
            ? activeSettings.animation.waveAmount
            : 0;
        halftoneMaterial.uniforms.waveSpeed.value =
          activeSettings.animation.waveSpeed;

        if (isImageMode && !hasImageTexture) {
          renderer.setRenderTarget(null);
          renderer.clear();
          return;
        }

        halftoneMaterial.uniforms.cropToBounds.value = isImageMode ? 1 : 0;

        if (isImageMode) {
          const pointerActive = interaction.pointerInside;

          interaction.smoothedMouseX +=
            (interaction.mouseX - interaction.smoothedMouseX) *
            IMAGE_POINTER_FOLLOW;
          interaction.smoothedMouseY +=
            (interaction.mouseY - interaction.smoothedMouseY) *
            IMAGE_POINTER_FOLLOW;
          interaction.pointerVelocityX *= IMAGE_POINTER_VELOCITY_DAMPING;
          interaction.pointerVelocityY *= IMAGE_POINTER_VELOCITY_DAMPING;

          halftoneMaterial.uniforms.interactionUv.value.set(
            interaction.smoothedMouseX,
            1 - interaction.smoothedMouseY,
          );
          halftoneMaterial.uniforms.interactionVelocity.value.set(
            interaction.pointerVelocityX * logicalWidth,
            -interaction.pointerVelocityY * logicalHeight,
          );
          halftoneMaterial.uniforms.dragOffset.value.set(0, 0);
          halftoneMaterial.uniforms.hoverHalftoneActive.value =
            pointerActive && activeSettings.animation.hoverHalftoneEnabled
              ? 1
              : 0;
          halftoneMaterial.uniforms.hoverHalftonePowerShift.value =
            pointerActive && activeSettings.animation.hoverHalftoneEnabled
              ? activeSettings.animation.hoverHalftonePowerShift
              : 0;
          halftoneMaterial.uniforms.hoverHalftoneRadius.value =
            activeSettings.animation.hoverHalftoneRadius;
          halftoneMaterial.uniforms.hoverHalftoneWidthShift.value =
            pointerActive && activeSettings.animation.hoverHalftoneEnabled
              ? activeSettings.animation.hoverHalftoneWidthShift
              : 0;
          halftoneMaterial.uniforms.hoverLightStrength.value =
            pointerActive && activeSettings.animation.hoverLightEnabled
              ? activeSettings.animation.hoverLightIntensity
              : 0;
          halftoneMaterial.uniforms.hoverLightRadius.value =
            activeSettings.animation.hoverLightRadius;
          halftoneMaterial.uniforms.hoverFlowStrength.value = 0;
          halftoneMaterial.uniforms.hoverFlowRadius.value = 0.18;
          halftoneMaterial.uniforms.dragFlowStrength.value = 0;

          imageMaterial.uniforms.zoom.value = getImagePreviewZoom(baseDistance);
          imageMaterial.uniforms.viewportSize.value.set(
            logicalWidth,
            logicalHeight,
          );
          halftoneMaterial.uniforms.footprintScale.value =
            getImageHalftoneScale(logicalWidth, logicalHeight, baseDistance);

          poseChangeReference.current({
            autoElapsed: 0,
            rotateElapsed: 0,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            targetRotationX: interaction.targetRotationX,
            targetRotationY: interaction.targetRotationY,
            timeElapsed: elapsedTime,
          });

          if (!activeSettings.halftone.enabled) {
            renderer.setRenderTarget(null);
            renderer.clear();
            renderer.render(imageScene, orthographicCamera);
            return;
          }

          renderer.setRenderTarget(sceneTarget);
          renderer.render(imageScene, orthographicCamera);
        }

        if (!isImageMode) {
          let baseRotationX = 0;
          let baseRotationY = 0;
          let baseRotationZ = 0;
          let meshOffsetY = 0;
          let meshScale = 1;
          let lightAngle = activeSettings.lighting.angleDegrees;
          let lightHeight = activeSettings.lighting.height;

          if (activeSettings.animation.autoRotateEnabled) {
            interaction.autoElapsed += delta;
            baseRotationY +=
              interaction.autoElapsed * activeSettings.animation.autoSpeed;
            baseRotationX +=
              Math.sin(interaction.autoElapsed * 0.2) *
              activeSettings.animation.autoWobble;
          }

          if (activeSettings.animation.floatEnabled) {
            const floatPhase =
              elapsedTime * activeSettings.animation.floatSpeed;
            const driftAmount =
              (activeSettings.animation.driftAmount * Math.PI) / 180;

            meshOffsetY +=
              Math.sin(floatPhase) * activeSettings.animation.floatAmplitude;
            baseRotationX += Math.sin(floatPhase * 0.72) * driftAmount * 0.45;
            baseRotationZ += Math.cos(floatPhase * 0.93) * driftAmount * 0.3;
          }

          if (activeSettings.animation.breatheEnabled) {
            meshScale *=
              1 +
              Math.sin(elapsedTime * activeSettings.animation.breatheSpeed) *
                activeSettings.animation.breatheAmount;
          }

          if (activeSettings.animation.rotateEnabled) {
            interaction.rotateElapsed += delta;
            const rotateProgress = activeSettings.animation.rotatePingPong
              ? Math.sin(
                  interaction.rotateElapsed *
                    activeSettings.animation.rotateSpeed,
                ) * Math.PI
              : interaction.rotateElapsed *
                activeSettings.animation.rotateSpeed;

            if (activeSettings.animation.rotatePreset === 'axis') {
              const axisDirection =
                activeSettings.animation.rotateAxis.startsWith('-') ? -1 : 1;
              const axisProgress = rotateProgress * axisDirection;

              if (
                activeSettings.animation.rotateAxis === 'x' ||
                activeSettings.animation.rotateAxis === 'xy' ||
                activeSettings.animation.rotateAxis === '-x' ||
                activeSettings.animation.rotateAxis === '-xy'
              ) {
                baseRotationX += axisProgress;
              }

              if (
                activeSettings.animation.rotateAxis === 'y' ||
                activeSettings.animation.rotateAxis === 'xy' ||
                activeSettings.animation.rotateAxis === '-y' ||
                activeSettings.animation.rotateAxis === '-xy'
              ) {
                baseRotationY += axisProgress;
              }

              if (
                activeSettings.animation.rotateAxis === 'z' ||
                activeSettings.animation.rotateAxis === '-z'
              ) {
                baseRotationZ += axisProgress;
              }
            } else if (activeSettings.animation.rotatePreset === 'lissajous') {
              baseRotationX += Math.sin(rotateProgress * 0.85) * 0.65;
              baseRotationY += Math.sin(rotateProgress * 1.35 + 0.8) * 1.05;
              baseRotationZ += Math.sin(rotateProgress * 0.55 + 1.6) * 0.32;
            } else if (activeSettings.animation.rotatePreset === 'orbit') {
              baseRotationX += Math.sin(rotateProgress * 0.75) * 0.42;
              baseRotationY += Math.cos(rotateProgress) * 1.2;
              baseRotationZ += Math.sin(rotateProgress * 1.25) * 0.24;
            } else if (activeSettings.animation.rotatePreset === 'tumble') {
              baseRotationX += rotateProgress * 0.55;
              baseRotationY += Math.sin(rotateProgress * 0.8) * 0.9;
              baseRotationZ += Math.cos(rotateProgress * 1.1) * 0.38;
            }
          }

          if (activeSettings.animation.lightSweepEnabled) {
            const lightPhase =
              elapsedTime * activeSettings.animation.lightSweepSpeed;
            lightAngle +=
              Math.sin(lightPhase) * activeSettings.animation.lightSweepRange;
            lightHeight +=
              Math.cos(lightPhase * 0.85) *
              activeSettings.animation.lightSweepHeightRange;
          }

          let targetX = baseRotationX;
          let targetY = baseRotationY;
          let easing = 0.12;

          if (activeSettings.animation.followHoverEnabled) {
            const rangeRadians =
              (activeSettings.animation.hoverRange * Math.PI) / 180;

            if (
              activeSettings.animation.hoverReturn ||
              interaction.mouseX !== 0.5 ||
              interaction.mouseY !== 0.5
            ) {
              targetX += (interaction.mouseY - 0.5) * rangeRadians;
              targetY += (interaction.mouseX - 0.5) * rangeRadians;
            }

            easing = activeSettings.animation.hoverEase;
          }

          if (activeSettings.animation.followDragEnabled) {
            if (
              !interaction.dragging &&
              activeSettings.animation.dragMomentum
            ) {
              interaction.targetRotationX += interaction.velocityX;
              interaction.targetRotationY += interaction.velocityY;
              interaction.velocityX *=
                1 - activeSettings.animation.dragFriction;
              interaction.velocityY *=
                1 - activeSettings.animation.dragFriction;
            }

            targetX += interaction.targetRotationX;
            targetY += interaction.targetRotationY;
            easing = activeSettings.animation.dragFriction;
          }

          if (
            activeSettings.animation.autoRotateEnabled &&
            !activeSettings.animation.followHoverEnabled &&
            !activeSettings.animation.followDragEnabled
          ) {
            targetX = baseRotationX + interaction.targetRotationX;
            targetY = baseRotationY + interaction.targetRotationY;

            if (interaction.dragging) {
              targetX = interaction.targetRotationX;
              targetY = interaction.targetRotationY;
            }

            easing = 0.08;
          }

          if (activeSettings.animation.springReturnEnabled) {
            const springX = applySpringStep(
              interaction.rotationX,
              targetX,
              interaction.rotationVelocityX,
              activeSettings.animation.springStrength,
              activeSettings.animation.springDamping,
            );
            const springY = applySpringStep(
              interaction.rotationY,
              targetY,
              interaction.rotationVelocityY,
              activeSettings.animation.springStrength,
              activeSettings.animation.springDamping,
            );
            const springZ = applySpringStep(
              interaction.rotationZ,
              baseRotationZ,
              interaction.rotationVelocityZ,
              activeSettings.animation.springStrength,
              activeSettings.animation.springDamping,
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
              (activeSettings.animation.rotatePingPong ? 0.18 : 0.12);
          }

          mesh.rotation.set(
            interaction.rotationX,
            interaction.rotationY,
            interaction.rotationZ,
          );
          mesh.position.y = meshOffsetY;
          mesh.scale.setScalar(meshScale);

          if (activeSettings.animation.cameraParallaxEnabled) {
            const cameraRange = activeSettings.animation.cameraParallaxAmount;
            const cameraEase = activeSettings.animation.cameraParallaxEase;
            const centeredX = (interaction.mouseX - 0.5) * 2;
            const centeredY = (0.5 - interaction.mouseY) * 2;
            const orbitYaw = centeredX * cameraRange;
            const orbitPitch = centeredY * cameraRange * 0.7;
            const horizontalRadius = Math.cos(orbitPitch) * baseDistance;
            const targetCameraX = Math.sin(orbitYaw) * horizontalRadius;
            const targetCameraY = Math.sin(orbitPitch) * baseDistance * 0.85;
            const targetCameraZ = Math.cos(orbitYaw) * horizontalRadius;

            camera.position.x +=
              (targetCameraX - camera.position.x) * cameraEase;
            camera.position.y +=
              (targetCameraY - camera.position.y) * cameraEase;
            camera.position.z +=
              (targetCameraZ - camera.position.z) * cameraEase;
          } else {
            camera.position.x += (0 - camera.position.x) * 0.12;
            camera.position.y += (0 - camera.position.y) * 0.12;
            camera.position.z += (baseDistance - camera.position.z) * 0.12;
          }

          const lookAtTarget = new THREE.Vector3(0, meshOffsetY * 0.2, 0);

          camera.lookAt(lookAtTarget);
          setPrimaryLightPosition(primaryLight, lightAngle, lightHeight);
          halftoneMaterial.uniforms.footprintScale.value = getMeshHalftoneScale(
            logicalWidth,
            logicalHeight,
            lookAtTarget,
          );

          poseChangeReference.current({
            autoElapsed: interaction.autoElapsed,
            rotateElapsed: interaction.rotateElapsed,
            rotationX: interaction.rotationX,
            rotationY: interaction.rotationY,
            rotationZ: interaction.rotationZ,
            targetRotationX: interaction.targetRotationX,
            targetRotationY: interaction.targetRotationY,
            timeElapsed: elapsedTime,
          });

          if (!activeSettings.halftone.enabled) {
            renderHalftoneMaterialScene({
              camera,
              elapsedTime,
              material,
              mesh,
              outputTarget: null,
              renderer,
              scene: scene3d,
              transmissionBackground: materialAssets.glassBackgroundTexture,
              transmissionScene: materialAssets.glassTransmissionScene,
              transmissionBacksideTarget,
              transmissionTarget,
            });
            return;
          }

          renderHalftoneMaterialScene({
            camera,
            elapsedTime,
            material,
            mesh,
            outputTarget: sceneTarget,
            renderer,
            scene: scene3d,
            transmissionBackground: materialAssets.glassBackgroundTexture,
            transmissionScene: materialAssets.glassTransmissionScene,
            transmissionBacksideTarget,
            transmissionTarget,
          });
          halftoneMaterial.uniforms.hoverHalftoneActive.value = 0;
          halftoneMaterial.uniforms.hoverHalftonePowerShift.value = 0;
          halftoneMaterial.uniforms.hoverHalftoneWidthShift.value = 0;
          halftoneMaterial.uniforms.hoverLightStrength.value = 0;
          halftoneMaterial.uniforms.hoverFlowStrength.value = 0;
          halftoneMaterial.uniforms.dragFlowStrength.value = 0;
          halftoneMaterial.uniforms.interactionVelocity.value.set(0, 0);
          halftoneMaterial.uniforms.dragOffset.value.set(0, 0);
        }

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

      cleanup = () => {
        resizeObserver.disconnect();
        canvas.removeEventListener('pointermove', handlePointerMove);
        canvas.removeEventListener('pointerleave', handlePointerLeave);
        canvas.removeEventListener('pointerup', handlePointerUp);
        canvas.removeEventListener('pointercancel', handlePointerCancel);
        window.removeEventListener('blur', handleWindowBlur);
        canvas.removeEventListener('pointerdown', handlePointerDown);
        window.cancelAnimationFrame(animationFrameId);
        clock.dispose();

        blurHorizontalMaterial.dispose();
        blurVerticalMaterial.dispose();
        halftoneMaterial.dispose();
        imageMaterial.dispose();

        if (resources.imageTexture) {
          resources.imageTexture.dispose();
        }

        fullScreenGeometry.dispose();
        material.dispose();
        sceneTarget.dispose();
        transmissionBacksideTarget.dispose();
        transmissionTarget.dispose();
        blurTargetA.dispose();
        blurTargetB.dispose();
        disposeHalftoneMaterialAssets(materialAssets);
        renderer.dispose();
        resourcesReference.current = null;

        if (activeSnapshotRef) {
          activeSnapshotRef.current = null;
        }

        if (canvas.parentNode === container) {
          container.removeChild(canvas);
        }
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [onFirstInteraction]);

  return (
    <CanvasMount
      $background={settings.background.color}
      aria-hidden
      ref={mountReference}
    />
  );
}
