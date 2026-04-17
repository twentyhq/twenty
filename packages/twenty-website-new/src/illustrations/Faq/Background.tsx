'use client';

import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createSiteWebGlRenderer } from '@/lib/webgl';

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

const DRACO_DECODER_PATH =
  'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';

const GLB_URL = '/illustrations/common/faq/faq.glb';

const LIGHT_INTENSITY = 3.1;
const FILL_LIGHT_INTENSITY = 0.15;
const AMBIENT_LIGHT_INTENSITY = 0.08;
const LIGHT_ANGLE_DEGREES = 45;
const LIGHT_HEIGHT = 2;

const MATERIAL_ROUGHNESS = 0.42;
const MATERIAL_METALNESS = 0.16;

const HALFTONE_ROWS = 127;
const HALFTONE_CONTRAST = 1.6;
const HALFTONE_POWER = 1.2;
const HALFTONE_SHADING = 1.6;
const HALFTONE_BASE_INK = 0.16;
const HALFTONE_MAX_BAR = 0.24;
const HALFTONE_CELL_RATIO = 2.2;
const HALFTONE_CUTOFF = 0.02;
const HALFTONE_DASH_COLOR = '#4A38F5';

const ROTATE_AXIS: 'x' | 'y' | 'z' | 'xy' | '-x' | '-y' | '-z' | '-xy' = '-z';
const ROTATE_SPEED = 0.1;
const ROTATE_PING_PONG = false;
const INITIAL_ROTATE_ELAPSED = 275.10000000007847;
const INITIAL_TIME_ELAPSED = 249.21849999998116;
const BASE_CAMERA_DISTANCE = 4;
const MODEL_OFFSET_Y = 0.52;

const EMPTY_TEXTURE_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO8B7Q8AAAAASUVORK5CYII=';

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
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
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

function createLoadingManager() {
  const loadingManager = new THREE.LoadingManager();
  loadingManager.setURLModifier((url) =>
    /\.(png|jpe?g|webp|gif|bmp)$/i.test(url) ? EMPTY_TEXTURE_DATA_URL : url,
  );

  return loadingManager;
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

async function loadFaqGeometry(modelUrl: string) {
  const response = await fetch(modelUrl);

  if (!response.ok) {
    throw new Error(`Unable to load FAQ model from ${modelUrl}.`);
  }

  const buffer = await response.arrayBuffer();

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(DRACO_DECODER_PATH);

  const gltfLoader = new GLTFLoader(createLoadingManager());
  gltfLoader.setDRACOLoader(dracoLoader);

  return await new Promise<THREE.BufferGeometry>((resolve, reject) => {
    gltfLoader.parse(
      buffer,
      '',
      (gltf) => {
        try {
          resolve(
            extractMergedGeometry(
              gltf.scene,
              'FAQ model did not contain any mesh geometry.',
            ),
          );
        } catch (error) {
          reject(error);
        } finally {
          disposeObjectSubtree(gltf.scene);
        }
      },
      reject,
    );
  });
}

function createFaqMaterial(environmentTexture: THREE.Texture) {
  return new THREE.MeshPhysicalMaterial({
    color: 0xd4d0c8,
    roughness: MATERIAL_ROUGHNESS,
    metalness: MATERIAL_METALNESS,
    envMap: environmentTexture,
    envMapIntensity: 0.25,
    clearcoat: 0,
    clearcoatRoughness: 0.08,
    reflectivity: 0.5,
    transmission: 0,
  });
}

const FaqVisualShell = styled.div`
  bottom: 0;
  display: block;
  left: auto;
  opacity: 0.45;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  right: -5%;
  top: 0;
  transform: translateY(-11%);
  width: min(70vw, 750px);

  @media (min-width: ${theme.breakpoints.md}px) {
    right: -10%;
    transform: translateY(-12%);
    width: min(60vw, 900px);
  }
`;

const FaqVisualCanvasMount = styled.div`
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

export function FaqBackground() {
  const mountReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountReference.current;

    if (!container) {
      return;
    }

    let cancelled = false;
    let animationFrameId = 0;
    let rotateElapsed = INITIAL_ROTATE_ELAPSED;

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

    const renderer = createSiteWebGlRenderer({ antialias: false, alpha: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(getVirtualWidth(), getVirtualHeight(), false);

    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.height = '100%';
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

    const primaryLight = new THREE.DirectionalLight(0xffffff, LIGHT_INTENSITY);
    setPrimaryLightPosition(primaryLight, LIGHT_ANGLE_DEGREES, LIGHT_HEIGHT);
    scene3d.add(primaryLight);

    const fillLight = new THREE.DirectionalLight(
      0xffffff,
      FILL_LIGHT_INTENSITY,
    );
    fillLight.position.set(-3, -1, 1);
    scene3d.add(fillLight);

    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      AMBIENT_LIGHT_INTENSITY,
    );
    scene3d.add(ambientLight);

    const material = createFaqMaterial(environmentTexture);
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), material);
    mesh.visible = false;
    scene3d.add(mesh);

    const sceneTarget = createRenderTarget(
      getVirtualWidth(),
      getVirtualHeight(),
    );
    const blurTargetA = createRenderTarget(
      getVirtualWidth(),
      getVirtualHeight(),
    );
    const blurTargetB = createRenderTarget(
      getVirtualWidth(),
      getVirtualHeight(),
    );
    const fullScreenGeometry = new THREE.PlaneGeometry(2, 2);
    const orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const blurHorizontalMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tInput: { value: null },
        dir: { value: new THREE.Vector2(1, 0) },
        res: {
          value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
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
          value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
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
        resolution: {
          value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
        },
        numRows: { value: HALFTONE_ROWS },
        glowStr: { value: 0 },
        contrast: { value: HALFTONE_CONTRAST },
        power: { value: HALFTONE_POWER },
        shading: { value: HALFTONE_SHADING },
        baseInk: { value: HALFTONE_BASE_INK },
        maxBar: { value: HALFTONE_MAX_BAR },
        cellRatio: { value: HALFTONE_CELL_RATIO },
        cutoff: { value: HALFTONE_CUTOFF },
        dashColor: { value: new THREE.Color(HALFTONE_DASH_COLOR) },
        time: { value: 0 },
        waveAmount: { value: 0 },
        waveSpeed: { value: 1 },
        distanceScale: { value: 1 },
        interactionUv: { value: new THREE.Vector2(0.5, 0.5) },
        interactionVelocity: { value: new THREE.Vector2(0, 0) },
        dragOffset: { value: new THREE.Vector2(0, 0) },
        hoverLightStrength: { value: 0 },
        hoverLightRadius: { value: 0.2 },
        hoverFlowStrength: { value: 0 },
        hoverFlowRadius: { value: 0.18 },
        dragFlowStrength: { value: 0 },
        dragFlowRadius: { value: 0.24 },
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
      blurHorizontalMaterial.uniforms.res.value.set(
        virtualWidth,
        virtualHeight,
      );
      blurVerticalMaterial.uniforms.res.value.set(virtualWidth, virtualHeight);
      halftoneMaterial.uniforms.resolution.value.set(
        virtualWidth,
        virtualHeight,
      );
    };

    const resizeObserver = new ResizeObserver(syncSize);
    resizeObserver.observe(container);

    loadFaqGeometry(GLB_URL)
      .then((geometry) => {
        if (cancelled) {
          geometry.dispose();
          return;
        }

        mesh.geometry.dispose();
        mesh.geometry = geometry;
        mesh.visible = true;
      })
      .catch((error) => {
        console.error(error);
      });

    const clock = new THREE.Clock();

    const renderFrame = () => {
      if (cancelled) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(renderFrame);

      const delta = 1 / 60;
      const elapsedTime = INITIAL_TIME_ELAPSED + clock.getElapsedTime();
      halftoneMaterial.uniforms.time.value = elapsedTime;

      rotateElapsed += delta;

      const rotateProgress = ROTATE_PING_PONG
        ? Math.sin(rotateElapsed * ROTATE_SPEED) * Math.PI
        : rotateElapsed * ROTATE_SPEED;
      const axisDirection = ROTATE_AXIS.startsWith('-') ? -1 : 1;
      const axisProgress = rotateProgress * axisDirection;

      let rotationX = 0;
      let rotationY = 0;
      let rotationZ = 0;

      if (
        ROTATE_AXIS === 'x' ||
        ROTATE_AXIS === 'xy' ||
        ROTATE_AXIS === '-x' ||
        ROTATE_AXIS === '-xy'
      ) {
        rotationX += axisProgress;
      }

      if (
        ROTATE_AXIS === 'y' ||
        ROTATE_AXIS === 'xy' ||
        ROTATE_AXIS === '-y' ||
        ROTATE_AXIS === '-xy'
      ) {
        rotationY += axisProgress;
      }

      if (ROTATE_AXIS === 'z' || ROTATE_AXIS === '-z') {
        rotationZ += axisProgress;
      }

      mesh.rotation.set(rotationX, rotationY, rotationZ);
      mesh.position.y = MODEL_OFFSET_Y;
      mesh.scale.setScalar(1);

      camera.position.x += (0 - camera.position.x) * 0.12;
      camera.position.y += (0 - camera.position.y) * 0.12;
      camera.position.z += (BASE_CAMERA_DISTANCE - camera.position.z) * 0.12;
      camera.lookAt(0, MODEL_OFFSET_Y * 0.2, 0);
      setPrimaryLightPosition(primaryLight, LIGHT_ANGLE_DEGREES, LIGHT_HEIGHT);

      renderer.setRenderTarget(sceneTarget);
      renderer.clear();
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

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      window.cancelAnimationFrame(animationFrameId);
      blurHorizontalMaterial.dispose();
      blurVerticalMaterial.dispose();
      halftoneMaterial.dispose();
      fullScreenGeometry.dispose();
      mesh.geometry.dispose();
      material.dispose();
      sceneTarget.dispose();
      blurTargetA.dispose();
      blurTargetB.dispose();
      environmentTexture.dispose();
      renderer.dispose();

      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  return (
    <FaqVisualShell>
      <FaqVisualCanvasMount aria-hidden ref={mountReference} />
    </FaqVisualShell>
  );
}
