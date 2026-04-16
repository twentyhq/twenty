'use client';

import { HalftoneCanvas } from '@/app/halftone/_components/HalftoneCanvas';
import {
  DEFAULT_GLASS_ANIMATION_SETTINGS,
  DEFAULT_GLASS_BACKGROUND_SETTINGS,
  DEFAULT_GLASS_MATERIAL_SETTINGS,
  DEFAULT_SHAPE_HALFTONE_SETTINGS,
  DEFAULT_SOLID_ANIMATION_SETTINGS,
  DEFAULT_SOLID_BACKGROUND_SETTINGS,
  DEFAULT_SOLID_MATERIAL_SETTINGS,
  type HalftoneMaterialSurface,
  type HalftoneStudioSettings,
} from '@/app/halftone/_lib/state';
import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const DRACO_DECODER_PATH =
  'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';
const EMPTY_TEXTURE_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO8B7Q8AAAAASUVORK5CYII=';
const VIRTUAL_RENDER_HEIGHT = 768;
const REFERENCE_PREVIEW_DISTANCE = 4;
const MIN_FOOTPRINT_SCALE = 0.001;

type HalftoneRotateAxis = 'x' | 'y' | 'z' | 'xy' | '-x' | '-y' | '-z' | '-xy';
type HalftoneRotatePreset = 'axis' | 'lissajous' | 'orbit' | 'tumble';
type HelpedHalftoneRenderer = 'legacy' | 'studio';

type ViewRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type HelpedHalftonePose = {
  autoElapsed: number;
  rotateElapsed: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  targetRotationX: number;
  targetRotationY: number;
  timeElapsed: number;
};

export type HelpedHalftoneSettings = {
  lighting: {
    intensity: number;
    fillIntensity: number;
    ambientIntensity: number;
    angleDegrees: number;
    height: number;
  };
  material: {
    roughness: number;
    metalness: number;
    surface?: HalftoneMaterialSurface;
    color?: string;
    thickness?: number;
    refraction?: number;
    environmentPower?: number;
  };
  halftone: {
    enabled: boolean;
    scale: number;
    power: number;
    width: number;
    imageContrast?: number;
    dashColor: string;
    hoverDashColor?: string;
  };
  animation: {
    autoRotateEnabled: boolean;
    breatheEnabled: boolean;
    cameraParallaxEnabled: boolean;
    followHoverEnabled: boolean;
    followDragEnabled: boolean;
    floatEnabled: boolean;
    hoverLightEnabled: boolean;
    dragFlowEnabled: boolean;
    lightSweepEnabled: boolean;
    rotateEnabled: boolean;
    autoSpeed: number;
    autoWobble: number;
    breatheAmount: number;
    breatheSpeed: number;
    cameraParallaxAmount: number;
    cameraParallaxEase: number;
    driftAmount: number;
    hoverRange: number;
    hoverEase: number;
    hoverReturn: boolean;
    dragSens: number;
    dragFriction: number;
    dragMomentum: boolean;
    rotateAxis: HalftoneRotateAxis;
    rotatePreset: HalftoneRotatePreset;
    rotateSpeed: number;
    rotatePingPong: boolean;
    floatAmplitude: number;
    floatSpeed: number;
    lightSweepHeightRange: number;
    lightSweepRange: number;
    lightSweepSpeed: number;
    springDamping: number;
    springReturnEnabled: boolean;
    springStrength: number;
    hoverHalftoneEnabled?: boolean;
    hoverHalftonePowerShift?: number;
    hoverHalftoneRadius?: number;
    hoverHalftoneWidthShift?: number;
    hoverLightIntensity: number;
    hoverLightRadius: number;
    dragFlowDecay: number;
    dragFlowRadius: number;
    dragFlowStrength: number;
    hoverWarpStrength: number;
    hoverWarpRadius: number;
    dragWarpStrength: number;
    waveEnabled: boolean;
    waveSpeed: number;
    waveAmount: number;
  };
};

type InteractionState = {
  autoElapsed: number;
  dragging: boolean;
  mouseX: number;
  mouseY: number;
  pointerX: number;
  pointerY: number;
  rotateElapsed: number;
  rotationX: number;
  rotationVelocityX: number;
  rotationY: number;
  rotationVelocityY: number;
  rotationZ: number;
  rotationVelocityZ: number;
  targetRotationX: number;
  targetRotationY: number;
  velocityX: number;
  velocityY: number;
};

const passThroughVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
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

function mergeGeometries(geometries: THREE.BufferGeometry[]) {
  if (geometries.length === 1) {
    return geometries[0];
  }

  let totalVertices = 0;
  let totalIndices = 0;
  let hasUv = false;

  const geometryInfos = geometries.map((geometry) => {
    const position = geometry.attributes.position;
    const normal = geometry.attributes.normal;
    const uv = geometry.attributes.uv ?? null;
    const index = geometry.index;
    const indexCount = index ? index.count : position.count;

    totalVertices += position.count;
    totalIndices += indexCount;
    hasUv = hasUv || uv !== null;

    return {
      index,
      indexCount,
      normal,
      position,
      uv,
      vertexCount: position.count,
    };
  });

  const positions = new Float32Array(totalVertices * 3);
  const normals = new Float32Array(totalVertices * 3);
  const uvs = hasUv ? new Float32Array(totalVertices * 2) : null;
  const indices = new Uint32Array(totalIndices);

  let vertexOffset = 0;
  let indexOffset = 0;

  for (const geometryInfo of geometryInfos) {
    for (
      let vertexIndex = 0;
      vertexIndex < geometryInfo.vertexCount;
      vertexIndex += 1
    ) {
      const positionOffset = (vertexOffset + vertexIndex) * 3;
      positions[positionOffset] = geometryInfo.position.getX(vertexIndex);
      positions[positionOffset + 1] = geometryInfo.position.getY(vertexIndex);
      positions[positionOffset + 2] = geometryInfo.position.getZ(vertexIndex);
      normals[positionOffset] = geometryInfo.normal.getX(vertexIndex);
      normals[positionOffset + 1] = geometryInfo.normal.getY(vertexIndex);
      normals[positionOffset + 2] = geometryInfo.normal.getZ(vertexIndex);

      if (uvs !== null) {
        const uvOffset = (vertexOffset + vertexIndex) * 2;
        uvs[uvOffset] = geometryInfo.uv?.getX(vertexIndex) ?? 0;
        uvs[uvOffset + 1] = geometryInfo.uv?.getY(vertexIndex) ?? 0;
      }
    }

    if (geometryInfo.index) {
      for (
        let localIndex = 0;
        localIndex < geometryInfo.indexCount;
        localIndex += 1
      ) {
        indices[indexOffset + localIndex] =
          geometryInfo.index.getX(localIndex) + vertexOffset;
      }
    } else {
      for (
        let localIndex = 0;
        localIndex < geometryInfo.indexCount;
        localIndex += 1
      ) {
        indices[indexOffset + localIndex] = localIndex + vertexOffset;
      }
    }

    vertexOffset += geometryInfo.vertexCount;
    indexOffset += geometryInfo.indexCount;
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));

  if (uvs !== null) {
    merged.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  }

  merged.setIndex(new THREE.BufferAttribute(indices, 1));

  return merged;
}

function normalizeImportedGeometry(geometry: THREE.BufferGeometry) {
  geometry.computeBoundingBox();

  let boundingBox = geometry.boundingBox;
  let center = new THREE.Vector3();
  let size = new THREE.Vector3();

  boundingBox?.getCenter(center);
  boundingBox?.getSize(size);
  geometry.translate(-center.x, -center.y, -center.z);

  const dimensions = [size.x, size.y, size.z];
  const thinnestAxis = dimensions.indexOf(Math.min(...dimensions));

  if (thinnestAxis === 0) {
    geometry.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI / 2));
  } else if (thinnestAxis === 1) {
    geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
  }

  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  const radius = geometry.boundingSphere?.radius || 1;
  const scale = 1.6 / radius;
  geometry.scale(scale, scale, scale);

  geometry.computeBoundingBox();
  boundingBox = geometry.boundingBox;
  center = new THREE.Vector3();
  boundingBox?.getCenter(center);
  geometry.translate(-center.x, -center.y, -center.z);

  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return geometry;
}

function createLoadingManager() {
  const loadingManager = new THREE.LoadingManager();
  loadingManager.setURLModifier((url) =>
    /\.(png|jpe?g|webp|gif|bmp)$/i.test(url) ? EMPTY_TEXTURE_DATA_URL : url,
  );

  return loadingManager;
}

function extractMergedGeometry(root: THREE.Object3D, emptyMessage: string) {
  root.updateMatrixWorld(true);

  const geometries: THREE.BufferGeometry[] = [];

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh) || !object.geometry) {
      return;
    }

    const geometry = object.geometry.clone();

    if (!geometry.attributes.normal) {
      geometry.computeVertexNormals();
    }

    geometry.applyMatrix4(object.matrixWorld);
    geometries.push(geometry);
  });

  if (geometries.length === 0) {
    throw new Error(emptyMessage);
  }

  return normalizeImportedGeometry(mergeGeometries(geometries));
}

function parseGlbGeometry(buffer: ArrayBuffer, label: string) {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(DRACO_DECODER_PATH);

  const gltfLoader = new GLTFLoader(createLoadingManager());
  gltfLoader.setDRACOLoader(dracoLoader);

  return new Promise<THREE.BufferGeometry>((resolve, reject) => {
    gltfLoader.parse(
      buffer,
      '',
      (gltf) => {
        try {
          resolve(
            extractMergedGeometry(
              gltf.scene,
              `${label} did not contain any mesh geometry.`,
            ),
          );
        } catch (error) {
          reject(error);
        }
      },
      reject,
    );
  }).finally(() => {
    dracoLoader.dispose();
  });
}

async function loadGeometry(modelUrl: string, label: string) {
  const response = await fetch(modelUrl);

  if (!response.ok) {
    throw new Error(`Unable to load ${label} from ${modelUrl}.`);
  }

  const buffer = await response.arrayBuffer();

  return parseGlbGeometry(buffer, label);
}

function clampRectToViewport(
  rect: ViewRect,
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

function getRectArea(rect: ViewRect | null) {
  if (!rect) {
    return 0;
  }

  return Math.max(rect.width, 0) * Math.max(rect.height, 0);
}

function createBox3Corners(bounds: THREE.Box3) {
  const { min, max } = bounds;

  return [
    new THREE.Vector3(min.x, min.y, min.z),
    new THREE.Vector3(min.x, min.y, max.z),
    new THREE.Vector3(min.x, max.y, min.z),
    new THREE.Vector3(min.x, max.y, max.z),
    new THREE.Vector3(max.x, min.y, min.z),
    new THREE.Vector3(max.x, min.y, max.z),
    new THREE.Vector3(max.x, max.y, min.z),
    new THREE.Vector3(max.x, max.y, max.z),
  ];
}

function getFootprintScaleFromRects(
  currentRect: ViewRect | null,
  referenceRect: ViewRect | null,
) {
  const currentArea = getRectArea(currentRect);
  const referenceArea = getRectArea(referenceRect);

  if (currentArea <= 0 || referenceArea <= 0) {
    return 1;
  }

  return Math.max(Math.sqrt(currentArea / referenceArea), MIN_FOOTPRINT_SCALE);
}

function projectBox3ToViewport({
  camera,
  localBounds,
  meshMatrixWorld,
  viewportHeight,
  viewportWidth,
}: {
  camera: THREE.PerspectiveCamera;
  localBounds: THREE.Box3;
  meshMatrixWorld: THREE.Matrix4;
  viewportHeight: number;
  viewportWidth: number;
}) {
  if (localBounds.isEmpty() || viewportWidth <= 0 || viewportHeight <= 0) {
    return null;
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let hasProjectedCorner = false;

  for (const corner of createBox3Corners(localBounds)) {
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
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    },
    viewportWidth,
    viewportHeight,
  );
}

function getMeshFootprintScale({
  camera,
  localBounds,
  lookAtTarget,
  meshMatrixWorld,
  viewportHeight,
  viewportWidth,
}: {
  camera: THREE.PerspectiveCamera;
  localBounds: THREE.Box3;
  lookAtTarget: THREE.Vector3;
  meshMatrixWorld: THREE.Matrix4;
  viewportHeight: number;
  viewportWidth: number;
}) {
  const currentRect = projectBox3ToViewport({
    camera,
    localBounds,
    meshMatrixWorld,
    viewportHeight,
    viewportWidth,
  });
  const referenceCamera = camera.clone();
  const currentOffset = referenceCamera.position.clone().sub(lookAtTarget);
  const referenceOffset =
    currentOffset.lengthSq() > 0
      ? currentOffset.setLength(REFERENCE_PREVIEW_DISTANCE)
      : new THREE.Vector3(0, 0, REFERENCE_PREVIEW_DISTANCE);

  referenceCamera.position.copy(lookAtTarget).add(referenceOffset);
  referenceCamera.lookAt(lookAtTarget);
  referenceCamera.updateProjectionMatrix();
  referenceCamera.updateMatrixWorld(true);

  const referenceRect = projectBox3ToViewport({
    camera: referenceCamera,
    localBounds,
    meshMatrixWorld,
    viewportHeight,
    viewportWidth,
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

function createEnvironmentTexture(renderer: THREE.WebGLRenderer) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const environmentTexture = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0.04,
  ).texture;
  pmremGenerator.dispose();

  return environmentTexture;
}

function createInteractionState(
  initialPose: HelpedHalftonePose,
): InteractionState {
  return {
    autoElapsed: initialPose.autoElapsed,
    dragging: false,
    mouseX: 0.5,
    mouseY: 0.5,
    pointerX: 0,
    pointerY: 0,
    rotateElapsed: initialPose.rotateElapsed,
    rotationX: initialPose.rotationX,
    rotationVelocityX: 0,
    rotationY: initialPose.rotationY,
    rotationVelocityY: 0,
    rotationZ: initialPose.rotationZ,
    rotationVelocityZ: 0,
    targetRotationX: initialPose.targetRotationX,
    targetRotationY: initialPose.targetRotationY,
    velocityX: 0,
    velocityY: 0,
  };
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

const StyledVisualMount = styled.div`
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

const NOOP = () => {};

function getStudioMaterialSurface(
  settings: HelpedHalftoneSettings,
): HalftoneMaterialSurface {
  return settings.material.surface === 'glass' ? 'glass' : 'solid';
}

function createStudioSettings(
  settings: HelpedHalftoneSettings,
): HalftoneStudioSettings {
  const surface = getStudioMaterialSurface(settings);
  const defaultMaterial =
    surface === 'glass'
      ? DEFAULT_GLASS_MATERIAL_SETTINGS
      : DEFAULT_SOLID_MATERIAL_SETTINGS;
  const defaultAnimation =
    surface === 'glass'
      ? DEFAULT_GLASS_ANIMATION_SETTINGS
      : DEFAULT_SOLID_ANIMATION_SETTINGS;
  const defaultBackground =
    surface === 'glass'
      ? DEFAULT_GLASS_BACKGROUND_SETTINGS
      : DEFAULT_SOLID_BACKGROUND_SETTINGS;

  return {
    sourceMode: 'shape',
    shapeKey: 'helped',
    lighting: { ...settings.lighting },
    material: {
      ...defaultMaterial,
      ...settings.material,
      surface,
    },
    halftone: {
      ...DEFAULT_SHAPE_HALFTONE_SETTINGS,
      ...settings.halftone,
      hoverDashColor:
        settings.halftone.hoverDashColor ?? settings.halftone.dashColor,
      imageContrast:
        settings.halftone.imageContrast ??
        DEFAULT_SHAPE_HALFTONE_SETTINGS.imageContrast,
    },
    background: defaultBackground,
    animation: {
      ...defaultAnimation,
      ...settings.animation,
    },
  };
}

type HelpedHalftoneCanvasProps = {
  geometry: THREE.BufferGeometry;
  initialPose: HelpedHalftonePose;
  previewDistance: number;
  settings: HelpedHalftoneSettings;
};

function HelpedHalftoneCanvas({
  geometry,
  initialPose,
  previewDistance,
  settings,
}: HelpedHalftoneCanvasProps) {
  const mountReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountReference.current;

    if (!container) {
      return;
    }

    let animationFrameId = 0;

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

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
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

    const baseCameraDistance = previewDistance;
    const camera = new THREE.PerspectiveCamera(
      45,
      getWidth() / getHeight(),
      0.1,
      100,
    );
    camera.position.z = baseCameraDistance;

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

    const material = new THREE.MeshPhysicalMaterial({
      clearcoat: 0,
      clearcoatRoughness: 0.08,
      color: 0xd4d0c8,
      envMap: environmentTexture,
      envMapIntensity: 0.25,
      metalness: settings.material.metalness,
      reflectivity: 0.5,
      roughness: settings.material.roughness,
      transmission: 0,
    });

    geometry.computeBoundingBox();
    const mesh = new THREE.Mesh(geometry, material);
    scene3d.add(mesh);

    const sceneTarget = createRenderTarget(
      getVirtualWidth(),
      getVirtualHeight(),
    );
    const fullScreenGeometry = new THREE.PlaneGeometry(2, 2);
    const orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const halftoneMaterial = new THREE.ShaderMaterial({
      fragmentShader: halftoneFragmentShader,
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
        dashColor: { value: new THREE.Color(settings.halftone.dashColor) },
        time: { value: 0 },
        waveAmount: {
          value: settings.animation.waveEnabled
            ? settings.animation.waveAmount
            : 0,
        },
        waveSpeed: { value: settings.animation.waveSpeed },
        footprintScale: { value: 1.0 },
        interactionUv: { value: new THREE.Vector2(0.5, 0.5) },
        interactionVelocity: { value: new THREE.Vector2(0, 0) },
        dragOffset: { value: new THREE.Vector2(0, 0) },
        hoverLightStrength: { value: 0 },
        hoverLightRadius: { value: settings.animation.hoverLightRadius },
        hoverFlowStrength: { value: 0 },
        hoverFlowRadius: { value: settings.animation.dragFlowRadius },
        dragFlowStrength: { value: 0 },
        cropToBounds: { value: 0 },
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
    };

    const lookAtTarget = new THREE.Vector3();
    const interaction = createInteractionState(initialPose);
    const autoRotateEnabled = settings.animation.autoRotateEnabled;
    const followHoverEnabled = settings.animation.followHoverEnabled;
    const followDragEnabled = settings.animation.followDragEnabled;
    const rotateEnabled = settings.animation.rotateEnabled;

    const getHalftoneScale = (
      viewportWidth: number,
      viewportHeight: number,
      nextLookAtTarget: THREE.Vector3,
    ) => {
      if (!mesh.geometry.boundingBox) {
        mesh.geometry.computeBoundingBox();
      }

      if (!mesh.geometry.boundingBox) {
        return 1;
      }

      mesh.updateMatrixWorld();
      camera.updateMatrixWorld();

      return getMeshFootprintScale({
        camera,
        localBounds: mesh.geometry.boundingBox,
        lookAtTarget: nextLookAtTarget,
        meshMatrixWorld: mesh.matrixWorld,
        viewportHeight,
        viewportWidth,
      });
    };

    const syncSize = () => {
      const width = getWidth();
      const height = getHeight();
      const virtualWidth = getVirtualWidth();
      const virtualHeight = getVirtualHeight();

      renderer.setSize(virtualWidth, virtualHeight, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      sceneTarget.setSize(virtualWidth, virtualHeight);
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

    const handlePointerDown = (event: PointerEvent) => {
      updatePointerPosition(event);

      if (!followDragEnabled) {
        return;
      }

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
      updatePointerPosition(event);

      if (!interaction.dragging || !followDragEnabled) {
        return;
      }

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
      if (interaction.dragging) {
        return;
      }

      interaction.mouseX = 0.5;
      interaction.mouseY = 0.5;
    };

    const handlePointerUp = () => {
      interaction.dragging = false;
      canvas.style.cursor = followDragEnabled ? 'grab' : 'default';

      if (!settings.animation.springReturnEnabled) {
        return;
      }

      const springImpulse = Math.max(
        settings.animation.springStrength * 10,
        1.2,
      );
      interaction.rotationVelocityX += interaction.velocityX * springImpulse;
      interaction.rotationVelocityY += interaction.velocityY * springImpulse;
      interaction.rotationVelocityZ +=
        interaction.velocityY * springImpulse * 0.12;
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
    canvas.addEventListener('pointerleave', handlePointerLeave);
    canvas.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('pointercancel', handlePointerUp);
    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    const clock = new THREE.Clock();

    const renderFrame = () => {
      animationFrameId = window.requestAnimationFrame(renderFrame);

      const delta = clock.getDelta();
      const elapsedTime = initialPose.timeElapsed + clock.elapsedTime;
      halftoneMaterial.uniforms.time.value = elapsedTime;

      let baseRotationX = 0;
      let baseRotationY = 0;
      let baseRotationZ = 0;
      let meshOffsetY = 0;
      let meshScale = 1;
      let lightAngle = settings.lighting.angleDegrees;
      let lightHeight = settings.lighting.height;

      if (autoRotateEnabled) {
        interaction.autoElapsed += delta;
        baseRotationY += interaction.autoElapsed * settings.animation.autoSpeed;
        baseRotationX +=
          Math.sin(interaction.autoElapsed * 0.2) *
          settings.animation.autoWobble;
      }

      if (settings.animation.floatEnabled) {
        const floatPhase = elapsedTime * settings.animation.floatSpeed;
        const driftAmount = (settings.animation.driftAmount * Math.PI) / 180;

        meshOffsetY += Math.sin(floatPhase) * settings.animation.floatAmplitude;
        baseRotationX += Math.sin(floatPhase * 0.72) * driftAmount * 0.45;
        baseRotationZ += Math.cos(floatPhase * 0.93) * driftAmount * 0.3;
      }

      if (settings.animation.breatheEnabled) {
        meshScale *=
          1 +
          Math.sin(elapsedTime * settings.animation.breatheSpeed) *
            settings.animation.breatheAmount;
      }

      if (rotateEnabled) {
        interaction.rotateElapsed += delta;
        const rotateProgress = settings.animation.rotatePingPong
          ? Math.sin(
              interaction.rotateElapsed * settings.animation.rotateSpeed,
            ) * Math.PI
          : interaction.rotateElapsed * settings.animation.rotateSpeed;

        if (settings.animation.rotatePreset === 'axis') {
          const axisDirection = settings.animation.rotateAxis.startsWith('-')
            ? -1
            : 1;
          const axisProgress = rotateProgress * axisDirection;

          if (
            settings.animation.rotateAxis === 'x' ||
            settings.animation.rotateAxis === 'xy' ||
            settings.animation.rotateAxis === '-x' ||
            settings.animation.rotateAxis === '-xy'
          ) {
            baseRotationX += axisProgress;
          }

          if (
            settings.animation.rotateAxis === 'y' ||
            settings.animation.rotateAxis === 'xy' ||
            settings.animation.rotateAxis === '-y' ||
            settings.animation.rotateAxis === '-xy'
          ) {
            baseRotationY += axisProgress;
          }

          if (
            settings.animation.rotateAxis === 'z' ||
            settings.animation.rotateAxis === '-z'
          ) {
            baseRotationZ += axisProgress;
          }
        } else if (settings.animation.rotatePreset === 'lissajous') {
          baseRotationX += Math.sin(rotateProgress * 0.85) * 0.65;
          baseRotationY += Math.sin(rotateProgress * 1.35 + 0.8) * 1.05;
          baseRotationZ += Math.sin(rotateProgress * 0.55 + 1.6) * 0.32;
        } else if (settings.animation.rotatePreset === 'orbit') {
          baseRotationX += Math.sin(rotateProgress * 0.75) * 0.42;
          baseRotationY += Math.cos(rotateProgress) * 1.2;
          baseRotationZ += Math.sin(rotateProgress * 1.25) * 0.24;
        } else if (settings.animation.rotatePreset === 'tumble') {
          baseRotationX += rotateProgress * 0.55;
          baseRotationY += Math.sin(rotateProgress * 0.8) * 0.9;
          baseRotationZ += Math.cos(rotateProgress * 1.1) * 0.38;
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

      if (followHoverEnabled) {
        const rangeRadians = (settings.animation.hoverRange * Math.PI) / 180;

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

      if (followDragEnabled) {
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

      if (autoRotateEnabled && !followHoverEnabled && !followDragEnabled) {
        targetX = baseRotationX + interaction.targetRotationX;
        targetY = baseRotationY + interaction.targetRotationY;

        if (interaction.dragging) {
          targetX = interaction.targetRotationX;
          targetY = interaction.targetRotationY;
        }

        easing = 0.08;
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

      mesh.rotation.set(
        interaction.rotationX,
        interaction.rotationY,
        interaction.rotationZ,
      );
      mesh.position.y = meshOffsetY;
      mesh.scale.setScalar(meshScale);

      halftoneMaterial.uniforms.interactionUv.value.set(
        interaction.mouseX,
        interaction.mouseY,
      );
      halftoneMaterial.uniforms.interactionVelocity.value.set(
        interaction.velocityY * 12,
        interaction.velocityX * 12,
      );
      halftoneMaterial.uniforms.dragOffset.value.set(
        interaction.targetRotationY * 0.08,
        interaction.targetRotationX * 0.08,
      );

      if (settings.animation.cameraParallaxEnabled) {
        const cameraRange = settings.animation.cameraParallaxAmount;
        const cameraEase = settings.animation.cameraParallaxEase;
        const centeredX = (interaction.mouseX - 0.5) * 2;
        const centeredY = (0.5 - interaction.mouseY) * 2;
        const orbitYaw = centeredX * cameraRange;
        const orbitPitch = centeredY * cameraRange * 0.7;
        const horizontalRadius = Math.cos(orbitPitch) * baseCameraDistance;
        const targetCameraX = Math.sin(orbitYaw) * horizontalRadius;
        const targetCameraY = Math.sin(orbitPitch) * baseCameraDistance * 0.85;
        const targetCameraZ = Math.cos(orbitYaw) * horizontalRadius;

        camera.position.x += (targetCameraX - camera.position.x) * cameraEase;
        camera.position.y += (targetCameraY - camera.position.y) * cameraEase;
        camera.position.z += (targetCameraZ - camera.position.z) * cameraEase;
      } else {
        camera.position.x += (0 - camera.position.x) * 0.12;
        camera.position.y += (0 - camera.position.y) * 0.12;
        camera.position.z += (baseCameraDistance - camera.position.z) * 0.12;
      }

      lookAtTarget.set(0, meshOffsetY * 0.2, 0);

      camera.lookAt(lookAtTarget);
      setPrimaryLightPosition(primaryLight, lightAngle, lightHeight);
      halftoneMaterial.uniforms.footprintScale.value = getHalftoneScale(
        getVirtualWidth(),
        getVirtualHeight(),
        lookAtTarget,
      );

      if (!settings.halftone.enabled) {
        renderer.setRenderTarget(null);
        renderer.clear();
        renderer.render(scene3d, camera);
        return;
      }

      renderer.setRenderTarget(sceneTarget);
      renderer.render(scene3d, camera);

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
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      halftoneMaterial.dispose();
      fullScreenGeometry.dispose();
      material.dispose();
      sceneTarget.dispose();
      environmentTexture.dispose();
      renderer.dispose();

      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, [geometry, initialPose, previewDistance, settings]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return <StyledVisualMount aria-hidden ref={mountReference} />;
}

function StudioHelpedHalftoneCanvas({
  geometry,
  initialPose,
  previewDistance,
  settings,
}: HelpedHalftoneCanvasProps) {
  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <HalftoneCanvas
      geometry={geometry}
      imageElement={null}
      initialPose={initialPose}
      onFirstInteraction={NOOP}
      onPoseChange={NOOP}
      previewDistance={previewDistance}
      settings={createStudioSettings(settings)}
    />
  );
}

type HelpedHalftoneModelProps = {
  initialPose: HelpedHalftonePose;
  label: string;
  modelUrl: string;
  previewDistance: number;
  renderer?: HelpedHalftoneRenderer;
  settings: HelpedHalftoneSettings;
};

export function HelpedHalftoneModel({
  initialPose,
  label,
  modelUrl,
  previewDistance,
  renderer = 'legacy',
  settings,
}: HelpedHalftoneModelProps) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    let cancelled = false;

    void loadGeometry(modelUrl, label)
      .then((nextGeometry) => {
        if (cancelled) {
          nextGeometry.dispose();
          return;
        }

        setGeometry(nextGeometry);
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      cancelled = true;
    };
  }, [label, modelUrl]);

  if (!geometry) {
    return <StyledVisualMount aria-hidden />;
  }

  if (renderer === 'studio') {
    return (
      <StudioHelpedHalftoneCanvas
        geometry={geometry}
        initialPose={initialPose}
        previewDistance={previewDistance}
        settings={settings}
      />
    );
  }

  return (
    <HelpedHalftoneCanvas
      geometry={geometry}
      initialPose={initialPose}
      previewDistance={previewDistance}
      settings={settings}
    />
  );
}
