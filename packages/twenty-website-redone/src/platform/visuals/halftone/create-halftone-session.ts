import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

import {
  createVisualFrameLoop,
  type VisualFrame,
} from '../engine/create-visual-frame-loop';
import { createVisualRenderer } from '../three-runtime/create-visual-renderer';
import { BLUR_PASS_SHADERS } from './blur-pass-shaders';
import {
  halftoneInteraction,
  type HalftoneInitialPose,
} from './halftone-interaction-state';
import { HALFTONE_ROW_SHADER } from './halftone-row-shader';
import { type HalftoneSceneSettings } from './halftone-settings';

export type HalftoneSession = {
  dispose: () => void;
};

type CreateHalftoneSessionOptions = {
  container: HTMLElement;
  geometry: THREE.BufferGeometry;
  settings: HalftoneSceneSettings;
  initialPose?: HalftoneInitialPose & { timeElapsed?: number };
  // True renders exactly one settled frame: no loop, no pointer physics.
  reducedMotion?: boolean;
  onFirstFrame?: () => void;
};

// The model halftone renders at a fixed virtual height so the dash pattern
// keeps its authored density at every container size.
const VIRTUAL_RENDER_HEIGHT = 768;
// The row shader's density was authored at this camera distance.
const REFERENCE_PREVIEW_DISTANCE = 4;
const POINTER_EASING_DEFAULT = 0.12;
const POINTER_EASING_AUTOROTATE_DRAG = 0.08;
const AUTOROTATE_VELOCITY_DECAY = 0.92;

function createRenderTarget(width: number, height: number) {
  return new THREE.WebGLRenderTarget(width, height, {
    format: THREE.RGBAFormat,
    magFilter: THREE.LinearFilter,
    minFilter: THREE.LinearFilter,
  });
}

function setPrimaryLightPosition(
  light: THREE.DirectionalLight,
  angleDegrees: number,
  height: number,
) {
  const angle = (angleDegrees * Math.PI) / 180;
  light.position.set(Math.cos(angle) * 5, height, Math.sin(angle) * 5);
}

// The complete rows-variant halftone scene: standard-material mesh, double
// gaussian blur chain, row composite — ported from the authored hourglass
// pipeline. (The band variant with the transmission material arrives with
// its consumers.)
export function createHalftoneSession({
  container,
  geometry,
  settings,
  initialPose,
  reducedMotion = false,
  onFirstFrame,
}: CreateHalftoneSessionOptions): HalftoneSession | null {
  if (settings.halftone.variant !== 'rows') {
    throw new Error('createHalftoneSession: only the rows variant is ported.');
  }
  const halftoneSettings = settings.halftone;

  const getWidth = () => Math.max(container.clientWidth, 1);
  const getHeight = () => Math.max(container.clientHeight, 1);
  const getVirtualHeight = () => Math.max(VIRTUAL_RENDER_HEIGHT, getHeight());
  const getVirtualWidth = () =>
    Math.max(
      Math.round(getVirtualHeight() * (getWidth() / Math.max(getHeight(), 1))),
      1,
    );

  const wantsPointer =
    settings.animation.followDragEnabled ||
    settings.animation.autoRotateEnabled;

  const renderer = createVisualRenderer({ antialias: false, alpha: true });
  if (renderer === null) {
    return null;
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(getVirtualWidth(), getVirtualHeight(), false);

  const canvas = renderer.domElement;
  canvas.style.cursor = !reducedMotion && wantsPointer ? 'grab' : 'default';
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

  const camera = new THREE.PerspectiveCamera(
    45,
    getWidth() / getHeight(),
    0.1,
    100,
  );
  camera.position.z = settings.previewDistance;

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

  scene3d.add(
    new THREE.AmbientLight(0xffffff, settings.lighting.ambientIntensity),
  );

  const material = new THREE.MeshPhysicalMaterial({
    clearcoat: 0,
    clearcoatRoughness: 0.08,
    color: settings.material.color,
    envMap: environmentTexture,
    envMapIntensity: 0.25,
    metalness: settings.material.metalness,
    reflectivity: 0.5,
    roughness: settings.material.roughness,
    transmission: 0,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = settings.modelOffsetY;
  scene3d.add(mesh);
  camera.lookAt(0, settings.modelOffsetY * 0.2, 0);

  const sceneTarget = createRenderTarget(getVirtualWidth(), getVirtualHeight());
  const blurTargetA = createRenderTarget(getVirtualWidth(), getVirtualHeight());
  const blurTargetB = createRenderTarget(getVirtualWidth(), getVirtualHeight());
  const fullScreenGeometry = new THREE.PlaneGeometry(2, 2);
  const orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const createBlurMaterial = (directionX: number, directionY: number) =>
    new THREE.ShaderMaterial({
      uniforms: {
        dir: { value: new THREE.Vector2(directionX, directionY) },
        res: {
          value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
        },
        tInput: { value: null },
      },
      vertexShader: BLUR_PASS_SHADERS.vertex,
      fragmentShader: BLUR_PASS_SHADERS.fragment,
    });

  const blurHorizontalMaterial = createBlurMaterial(1, 0);
  const blurVerticalMaterial = createBlurMaterial(0, 1);

  const halftoneMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      baseInk: { value: halftoneSettings.baseInk },
      cellRatio: { value: halftoneSettings.cellRatio },
      contrast: { value: halftoneSettings.contrast },
      cutoff: { value: halftoneSettings.cutoff },
      dashColor: { value: new THREE.Color(halftoneSettings.dashColor) },
      distanceScale: {
        value: settings.previewDistance / REFERENCE_PREVIEW_DISTANCE,
      },
      glowStr: { value: halftoneSettings.glowStrength },
      highlightOpen: { value: halftoneSettings.highlightOpen },
      maxBar: { value: halftoneSettings.maxBar },
      numRows: { value: halftoneSettings.numRows },
      power: { value: halftoneSettings.power },
      resolution: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      rowMerge: { value: halftoneSettings.rowMerge },
      shading: { value: halftoneSettings.shading },
      shadowCrush: { value: halftoneSettings.shadowCrush },
      shadowGrouping: { value: halftoneSettings.shadowGrouping },
      tGlow: { value: blurTargetB.texture },
      tScene: { value: sceneTarget.texture },
      time: { value: 0 },
      waveAmount: {
        value: settings.animation.waveEnabled
          ? settings.animation.waveAmount
          : 0,
      },
      waveSpeed: { value: settings.animation.waveSpeed },
    },
    vertexShader: BLUR_PASS_SHADERS.vertex,
    fragmentShader: HALFTONE_ROW_SHADER.fragment,
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

  const interaction = halftoneInteraction.create(initialPose);

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

  const sizeObserver =
    typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(syncSize);
  sizeObserver?.observe(container);

  const updatePointerPosition = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    interaction.mouseX = THREE.MathUtils.clamp(
      (event.clientX - rect.left) / Math.max(rect.width, 1),
      0,
      1,
    );
    interaction.mouseY = THREE.MathUtils.clamp(
      (event.clientY - rect.top) / Math.max(rect.height, 1),
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
    if (
      !interaction.dragging ||
      (!settings.animation.followDragEnabled &&
        !settings.animation.autoRotateEnabled)
    ) {
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

  const handlePointerUp = () => {
    interaction.dragging = false;
    canvas.style.cursor = 'grab';
  };

  if (!reducedMotion && wantsPointer) {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerdown', handlePointerDown);
  }

  let firstFrameNotified = false;

  const renderFrame = ({ deltaSeconds, elapsedSeconds }: VisualFrame) => {
    const elapsedTime = (initialPose?.timeElapsed ?? 0) + elapsedSeconds;
    halftoneMaterial.uniforms.time.value = elapsedTime;

    let baseRotationX = 0;
    let baseRotationY = 0;
    let baseRotationZ = 0;

    if (settings.animation.autoRotateEnabled) {
      if (!interaction.dragging) {
        interaction.autoElapsed += deltaSeconds;
        interaction.targetRotationX += interaction.velocityX;
        interaction.targetRotationY += interaction.velocityY;
        interaction.velocityX *= AUTOROTATE_VELOCITY_DECAY;
        interaction.velocityY *= AUTOROTATE_VELOCITY_DECAY;
      }
      baseRotationY += interaction.autoElapsed * settings.animation.autoSpeed;
      baseRotationX +=
        Math.sin(interaction.autoElapsed * 0.2) * settings.animation.autoWobble;
    }

    if (settings.animation.rotateEnabled) {
      interaction.rotateElapsed += deltaSeconds;
      const rotateProgress = settings.animation.rotatePingPong
        ? Math.sin(interaction.rotateElapsed * settings.animation.rotateSpeed) *
          Math.PI
        : interaction.rotateElapsed * settings.animation.rotateSpeed;

      if (settings.animation.rotatePreset === 'axis') {
        const axisDirection = settings.animation.rotateAxis.startsWith('-')
          ? -1
          : 1;
        const axisProgress = rotateProgress * axisDirection;
        const axis = settings.animation.rotateAxis;
        if (axis === 'x' || axis === 'xy' || axis === '-x' || axis === '-xy') {
          baseRotationX += axisProgress;
        }
        if (axis === 'y' || axis === 'xy' || axis === '-y' || axis === '-xy') {
          baseRotationY += axisProgress;
        }
        if (axis === 'z' || axis === '-z') {
          baseRotationZ += axisProgress;
        }
      }
    }

    let targetX = baseRotationX;
    let targetY = baseRotationY;
    let easing = POINTER_EASING_DEFAULT;

    if (settings.animation.followHoverEnabled) {
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

    if (
      settings.animation.autoRotateEnabled &&
      !settings.animation.followHoverEnabled &&
      !settings.animation.followDragEnabled
    ) {
      targetX = baseRotationX + interaction.targetRotationX;
      targetY = baseRotationY + interaction.targetRotationY;
      if (interaction.dragging) {
        targetX = interaction.targetRotationX;
        targetY = interaction.targetRotationY;
      }
      easing = POINTER_EASING_AUTOROTATE_DRAG;
    }

    interaction.rotationX += (targetX - interaction.rotationX) * easing;
    interaction.rotationY += (targetY - interaction.rotationY) * easing;
    interaction.rotationZ +=
      (baseRotationZ - interaction.rotationZ) *
      (settings.animation.rotatePingPong ? 0.18 : 0.12);

    mesh.rotation.set(
      interaction.rotationX,
      interaction.rotationY,
      interaction.rotationZ,
    );

    if (!halftoneSettings.enabled) {
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(scene3d, camera);
      return;
    }

    renderer.setRenderTarget(sceneTarget);
    renderer.render(scene3d, camera);

    // Two full blur rounds: the glow buffer feeds both cell averaging and
    // the halo term, and the authored look depends on the wider spread.
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

    if (!firstFrameNotified) {
      firstFrameNotified = true;
      onFirstFrame?.();
    }
  };

  let frameLoop: ReturnType<typeof createVisualFrameLoop> | null = null;

  if (reducedMotion) {
    // One settled frame; resizes re-render so the still stays crisp.
    renderFrame({ deltaSeconds: 0, elapsedSeconds: 0, timestamp: 0 });
    sizeObserver?.disconnect();
    const stillObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            syncSize();
            renderFrame({ deltaSeconds: 0, elapsedSeconds: 0, timestamp: 0 });
          });
    stillObserver?.observe(container);

    return {
      dispose() {
        stillObserver?.disconnect();
        disposeResources();
      },
    };
  }

  frameLoop = createVisualFrameLoop({
    renderFrame,
    target: container,
    targetVisibilityOptions: { rootMargin: '100px' },
  });
  frameLoop.start();

  function disposeResources() {
    blurHorizontalMaterial.dispose();
    blurVerticalMaterial.dispose();
    halftoneMaterial.dispose();
    fullScreenGeometry.dispose();
    material.dispose();
    sceneTarget.dispose();
    blurTargetA.dispose();
    blurTargetB.dispose();
    environmentTexture.dispose();
    renderer?.dispose();
    if (canvas.parentNode === container) {
      container.removeChild(canvas);
    }
  }

  return {
    dispose() {
      frameLoop?.dispose();
      sizeObserver?.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      disposeResources();
    },
  };
}
