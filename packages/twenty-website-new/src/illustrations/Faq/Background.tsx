'use client';

import { mergeGeometries } from '@/app/halftone/_lib/geometry-utils';
import { createEnvironmentTexture } from '@/app/halftone/_lib/model-loaders';
import {
  VIRTUAL_RENDER_HEIGHT,
  blurFragmentShader,
  halftoneFragmentShader,
  passThroughVertexShader,
} from '@/app/halftone/_lib/rendering';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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

  return await new Promise<THREE.BufferGeometry>((resolve, reject) => {
    new GLTFLoader(createLoadingManager()).parse(
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
