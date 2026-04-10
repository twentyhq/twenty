'use client';

import { mergeGeometries } from '@/app/halftone/_lib/geometry-utils';
import { createEnvironmentTexture } from '@/app/halftone/_lib/model-loaders';
import {
  VIRTUAL_RENDER_HEIGHT,
  blurFragmentShader,
  halftoneFragmentShader,
  passThroughVertexShader,
} from '@/app/halftone/_lib/rendering';
import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const GLB_URL = '/illustrations/common/footer/footer.glb';

const LIGHT_INTENSITY = 4;
const FILL_LIGHT_INTENSITY = 1.33;
const AMBIENT_LIGHT_INTENSITY = 0.28;
const LIGHT_ANGLE_DEGREES = 167;
const LIGHT_HEIGHT = 2.1;

const MATERIAL_ROUGHNESS = 0.42;
const MATERIAL_METALNESS = 0.16;

const HALFTONE_ROWS = 124;
const HALFTONE_CONTRAST = 2.7;
const HALFTONE_POWER = 1;
const HALFTONE_SHADING = 2.9;
const HALFTONE_BASE_INK = 0.19;
const HALFTONE_MAX_BAR = 0.25;
const HALFTONE_CELL_RATIO = 2.2;
const HALFTONE_CUTOFF = 0.02;
const HALFTONE_DASH_COLOR = '#2a2a2a';

const DRAG_SENSITIVITY = 0.008;
const DRAG_FRICTION = 0.08;
const DRAG_MOMENTUM = true;
const BREATHE_AMOUNT = 0.04;
const BREATHE_SPEED = 0.8;

const INITIAL_ROTATION_X = -0.5858908325312259;
const INITIAL_ROTATION_Y = 0.45733435420243096;
const INITIAL_ROTATION_Z = 0;
const INITIAL_TARGET_ROTATION_X = -0.5858908325312265;
const INITIAL_TARGET_ROTATION_Y = 0.4573343542024313;
const INITIAL_TIME_ELAPSED = 287.372499999977;
const BASE_CAMERA_DISTANCE = 4;

const EMPTY_TEXTURE_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO8B7Q8AAAAASUVORK5CYII=';

type FooterInteractionState = {
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

function createInteractionState(): FooterInteractionState {
  return {
    dragging: false,
    mouseX: 0.5,
    mouseY: 0.5,
    pointerX: 0,
    pointerY: 0,
    rotationX: INITIAL_ROTATION_X,
    rotationY: INITIAL_ROTATION_Y,
    rotationZ: INITIAL_ROTATION_Z,
    targetRotationX: INITIAL_TARGET_ROTATION_X,
    targetRotationY: INITIAL_TARGET_ROTATION_Y,
    velocityX: 0,
    velocityY: 0,
  };
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
  const scale = 2 / radius;
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

async function loadFooterGeometry(modelUrl: string) {
  const response = await fetch(modelUrl);

  if (!response.ok) {
    throw new Error(`Unable to load footer model from ${modelUrl}.`);
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
              'Footer model did not contain any mesh geometry.',
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

function createFooterMaterial(environmentTexture: THREE.Texture) {
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

const FooterBackgroundCanvasRoot = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;

  & canvas {
    display: block;
    height: 100%;
    pointer-events: auto;
    width: 100%;
  }
`;

const FooterVisualCanvasMount = styled.div`
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

export function FooterBackground() {
  const mountReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountReference.current;

    if (!container) {
      return;
    }

    let cancelled = false;
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

    const material = createFooterMaterial(environmentTexture);
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
      interaction.dragging = false;
      interaction.pointerX = event.clientX;
      interaction.pointerY = event.clientY;
      interaction.velocityX = 0;
      interaction.velocityY = 0;
      canvas.style.cursor = 'default';
    };

    const handlePointerMove = (event: PointerEvent) => {
      updatePointerPosition(event);
    };

    const handleWindowPointerMove = (event: PointerEvent) => {
      updatePointerPosition(event);

      if (!interaction.dragging) {
        return;
      }

      const deltaX = (event.clientX - interaction.pointerX) * DRAG_SENSITIVITY;
      const deltaY = (event.clientY - interaction.pointerY) * DRAG_SENSITIVITY;
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

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('blur', handleWindowBlur);

    loadFooterGeometry(GLB_URL)
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

      const elapsedTime = INITIAL_TIME_ELAPSED + clock.getElapsedTime();
      halftoneMaterial.uniforms.time.value = elapsedTime;
      halftoneMaterial.uniforms.interactionUv.value.set(
        interaction.mouseX,
        1 - interaction.mouseY,
      );

      if (!interaction.dragging && DRAG_MOMENTUM) {
        interaction.targetRotationX += interaction.velocityX;
        interaction.targetRotationY += interaction.velocityY;
        interaction.velocityX *= 1 - DRAG_FRICTION;
        interaction.velocityY *= 1 - DRAG_FRICTION;
      }

      interaction.rotationX +=
        (interaction.targetRotationX - interaction.rotationX) * DRAG_FRICTION;
      interaction.rotationY +=
        (interaction.targetRotationY - interaction.rotationY) * DRAG_FRICTION;
      interaction.rotationZ += (0 - interaction.rotationZ) * 0.12;

      const meshScale =
        1 + Math.sin(elapsedTime * BREATHE_SPEED) * BREATHE_AMOUNT;

      mesh.rotation.set(
        interaction.rotationX,
        interaction.rotationY,
        interaction.rotationZ,
      );
      mesh.position.y = 0;
      mesh.scale.setScalar(meshScale);

      camera.position.x += (0 - camera.position.x) * 0.12;
      camera.position.y += (0 - camera.position.y) * 0.12;
      camera.position.z += (BASE_CAMERA_DISTANCE - camera.position.z) * 0.12;
      camera.lookAt(0, 0, 0);
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
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('blur', handleWindowBlur);
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
      dracoLoader.dispose();

      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  return (
    <FooterBackgroundCanvasRoot aria-hidden>
      <FooterVisualCanvasMount ref={mountReference} />
    </FooterBackgroundCanvasRoot>
  );
}
