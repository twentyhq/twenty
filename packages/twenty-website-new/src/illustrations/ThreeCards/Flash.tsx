'use client';

import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const DRACO_DECODER_PATH =
  'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';

const GLB_URL = '/illustrations/home/three-cards/flash.glb';
const VIRTUAL_RENDER_HEIGHT = 768;

const LIGHTING = {
  intensity: 4,
  fillIntensity: 1.31,
  ambientIntensity: 0.1,
  angleDegrees: 25,
  height: 2,
};

const MATERIAL = {
  roughness: 0.42,
  metalness: 0.16,
};

const HALFTONE = {
  numRows: 48,
  contrast: 2.7,
  power: 1.1,
  shading: 3,
  baseInk: 0.19,
  maxBar: 0.23,
  cellRatio: 2,
  cutoff: 0.02,
  dashColor: '#4A38F5',
  waveAmount: 0,
  waveSpeed: 0,
};

const ANIMATION = {
  autoSpeed: 0.1,
  autoWobble: 0.3,
  dragFriction: 0.08,
  dragMomentum: true,
  dragSens: 0.008,
  followDragEnabled: true,
  followHoverEnabled: true,
  hoverEase: 0.08,
  hoverRange: 25,
  hoverReturn: true,
};

const INITIAL_POSE = {
  autoElapsed: 16.16666666666703,
  rotationX: -0.09184084195435831,
  rotationY: 1.7614744750399298,
  rotationZ: 0,
  targetRotationX: 0,
  targetRotationY: 0,
  timeElapsed: 325.47089999996314,
};

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
  uniform float cellRatio;
  uniform float cutoff;
  uniform vec3 dashColor;
  uniform float time;
  uniform float waveAmount;
  uniform float waveSpeed;

  varying vec2 vUv;

  void main() {
    float rowH = resolution.y / numRows;
    float row = floor(gl_FragCoord.y / rowH);
    float rowFrac = gl_FragCoord.y / rowH - row;
    float rowV = (row + 0.5) * rowH / resolution.y;
    float dy = abs(rowFrac - 0.5);

    float waveOffset = waveAmount * sin(time * waveSpeed + row * 0.5) * rowH;
    float effectiveX = gl_FragCoord.x + waveOffset;

    float cellW = rowH * cellRatio;
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
    litLum = clamp((litLum - cutoff) / max(1.0 - cutoff, 0.001), 0.0, 1.0);
    litLum = pow(litLum, contrast);

    float ink = mix(baseInk, 1.0, 1.0 - litLum);
    float fill = pow(ink, 1.05) * power;
    fill = clamp(fill, 0.0, 1.0) * mask;

    float dynamicBarHalf = mix(0.08, maxBar, smoothstep(0.03, 0.85, ink));
    float dx2 = abs(cellFrac - 0.5);
    float halfFill = fill * 0.5;
    float bodyHalfW = max(halfFill - dynamicBarHalf * (rowH / cellW), 0.0);
    float capR = dynamicBarHalf * rowH;

    float inDash = 0.0;
    if (dx2 <= bodyHalfW) {
      float edgeDist = dynamicBarHalf - dy;
      inDash = smoothstep(-0.03, 0.03, edgeDist);
    } else {
      float cdx = (dx2 - bodyHalfW) * cellW;
      float cdy = dy * rowH;
      float d = sqrt(cdx * cdx + cdy * cdy);
      inDash = 1.0 - smoothstep(capR - 1.5, capR + 1.5, d);
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

const EMPTY_TEXTURE_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO8B7Q8AAAAASUVORK5CYII=';

function createLoadingManager() {
  const loadingManager = new THREE.LoadingManager();
  loadingManager.setURLModifier((url) =>
    /\.(png|jpe?g|webp|gif|bmp)$/i.test(url) ? EMPTY_TEXTURE_DATA_URL : url,
  );
  return loadingManager;
}

function mergeGeometries(geometries: THREE.BufferGeometry[]) {
  if (geometries.length === 1) {
    return geometries[0];
  }

  let totalVertices = 0;
  let totalIndices = 0;
  let hasUv = false;

  const geometryInfos = geometries.map((geometry) => {
    const position = geometry.attributes.position as THREE.BufferAttribute;
    const normal = geometry.attributes.normal as THREE.BufferAttribute;
    const uv = (geometry.attributes.uv as THREE.BufferAttribute) ?? null;
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

function extractMergedGeometry(root: THREE.Object3D) {
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
    throw new Error('Model did not contain any mesh geometry.');
  }

  return normalizeImportedGeometry(mergeGeometries(geometries));
}

function parseGlbGeometry(buffer: ArrayBuffer): Promise<THREE.BufferGeometry> {
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
          resolve(extractMergedGeometry(gltf.scene));
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

async function loadGeometry(modelUrl: string) {
  const response = await fetch(modelUrl);

  if (!response.ok) {
    throw new Error('Unable to load model from ' + modelUrl);
  }

  const buffer = await response.arrayBuffer();
  return parseGlbGeometry(buffer);
}

function createRenderTarget(width: number, height: number) {
  return new THREE.WebGLRenderTarget(width, height, {
    format: THREE.RGBAFormat,
    magFilter: THREE.LinearFilter,
    minFilter: THREE.LinearFilter,
  });
}

type InteractionState = {
  autoElapsed: number;
  dragging: boolean;
  mouseX: number;
  mouseY: number;
  pointerX: number;
  pointerY: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  targetRotationX: number;
  targetRotationY: number;
  velocityX: number;
  velocityY: number;
};

function createInteractionState(): InteractionState {
  return {
    autoElapsed: INITIAL_POSE.autoElapsed,
    dragging: false,
    mouseX: 0.5,
    mouseY: 0.5,
    pointerX: 0,
    pointerY: 0,
    rotationX: INITIAL_POSE.rotationX,
    rotationY: INITIAL_POSE.rotationY,
    rotationZ: INITIAL_POSE.rotationZ,
    targetRotationX: INITIAL_POSE.targetRotationX,
    targetRotationY: INITIAL_POSE.targetRotationY,
    velocityX: 0,
    velocityY: 0,
  };
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

async function mountFlashCanvas(container: HTMLDivElement) {
  const getWidth = () => Math.max(container.clientWidth, 1);
  const getHeight = () => Math.max(container.clientHeight, 1);
  const getVirtualHeight = () => Math.max(VIRTUAL_RENDER_HEIGHT, getHeight());
  const getVirtualWidth = () =>
    Math.max(
      Math.round(getVirtualHeight() * (getWidth() / Math.max(getHeight(), 1))),
      1,
    );

  let geometry: THREE.BufferGeometry;

  try {
    geometry = await loadGeometry(GLB_URL);
  } catch (error) {
    console.error(error);
    geometry = new THREE.TorusKnotGeometry(1, 0.35, 200, 32);
  }

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

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const environmentTexture = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0.04,
  ).texture;
  pmremGenerator.dispose();

  const scene3d = new THREE.Scene();
  scene3d.background = null;

  const baseCameraDistance = 4;
  const camera = new THREE.PerspectiveCamera(
    45,
    getWidth() / getHeight(),
    0.1,
    100,
  );
  camera.position.z = baseCameraDistance;

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

  const material = new THREE.MeshPhysicalMaterial({
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

  const mesh = new THREE.Mesh(geometry, material);
  scene3d.add(mesh);

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
      cutoff: { value: HALFTONE.cutoff },
      dashColor: { value: new THREE.Color(HALFTONE.dashColor) },
      glowStr: { value: 0 },
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
      waveAmount: { value: HALFTONE.waveAmount },
      waveSpeed: { value: HALFTONE.waveSpeed },
    },
    fragmentShader: halftoneFragmentShader,
    vertexShader: passThroughVertexShader,
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

    if (!interaction.dragging || !ANIMATION.followDragEnabled) {
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

  const handlePointerLeave = () => {
    if (interaction.dragging) {
      return;
    }

    interaction.mouseX = 0.5;
    interaction.mouseY = 0.5;
  };

  const handlePointerUp = () => {
    interaction.dragging = false;
    canvas.style.cursor = 'grab';
  };

  const handleWindowBlur = () => {
    handlePointerUp();
    handlePointerLeave();
  };

  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointerleave', handlePointerLeave);
  canvas.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('blur', handleWindowBlur);
  window.addEventListener('pointermove', handleWindowPointerMove);
  window.addEventListener('pointerup', handlePointerUp);

  const clock = new THREE.Clock();
  let animationFrameId = 0;

  const renderFrame = () => {
    animationFrameId = window.requestAnimationFrame(renderFrame);

    const delta = Math.min(clock.getDelta(), 0.1);
    const elapsedTime = INITIAL_POSE.timeElapsed + clock.getElapsedTime();

    halftoneMaterial.uniforms.time.value = elapsedTime;

    if (!interaction.dragging) {
      interaction.autoElapsed += delta;

      if (ANIMATION.dragMomentum) {
        interaction.targetRotationX += interaction.velocityX;
        interaction.targetRotationY += interaction.velocityY;
        interaction.velocityX *= 1 - ANIMATION.dragFriction;
        interaction.velocityY *= 1 - ANIMATION.dragFriction;
      }
    }

    const baseRotationX =
      Math.sin(interaction.autoElapsed * 0.2) * ANIMATION.autoWobble;
    const baseRotationY = interaction.autoElapsed * ANIMATION.autoSpeed;

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
      easing = ANIMATION.dragFriction;
    }

    interaction.rotationX += (targetX - interaction.rotationX) * easing;
    interaction.rotationY += (targetY - interaction.rotationY) * easing;
    interaction.rotationZ += (0 - interaction.rotationZ) * 0.12;

    mesh.rotation.set(
      interaction.rotationX,
      interaction.rotationY,
      interaction.rotationZ,
    );

    camera.position.x += (0 - camera.position.x) * 0.12;
    camera.position.y += (0 - camera.position.y) * 0.12;
    camera.position.z += (baseCameraDistance - camera.position.z) * 0.12;
    camera.lookAt(0, 0, 0);
    setPrimaryLightPosition(
      primaryLight,
      LIGHTING.angleDegrees,
      LIGHTING.height,
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

  return () => {
    window.cancelAnimationFrame(animationFrameId);
    resizeObserver.disconnect();
    canvas.removeEventListener('pointerdown', handlePointerDown);
    canvas.removeEventListener('pointerleave', handlePointerLeave);
    canvas.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('blur', handleWindowBlur);
    window.removeEventListener('pointermove', handleWindowPointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
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
}

const StyledVisualMount = styled.div`
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

export function Flash() {
  const mountReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountReference.current;

    if (!container) {
      return;
    }

    const unmount = mountFlashCanvas(container);

    return () => {
      void Promise.resolve(unmount).then((dispose) => dispose?.());
    };
  }, []);

  return <StyledVisualMount aria-hidden ref={mountReference} />;
}
