import * as THREE from 'three';

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
import { halftoneMaterials } from './halftone-materials';
import { HALFTONE_PASS_SHADER } from './halftone-pass-shader';
import { type HalftoneSceneSettings } from './halftone-settings';

export type BandSession = {
  dispose: () => void;
};

type CreateBandSessionOptions = {
  container: HTMLElement;
  geometry: THREE.BufferGeometry;
  settings: HalftoneSceneSettings;
  initialPose?: HalftoneInitialPose & { timeElapsed?: number };
  reducedMotion?: boolean;
  onFirstFrame?: () => void;
};

const VIRTUAL_RENDER_HEIGHT = 768;
const REFERENCE_PREVIEW_DISTANCE = 4;
const MIN_FOOTPRINT_SCALE = 0.001;

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

// Mesh footprint: how much screen area the model covers relative to the
// same model at the reference distance — keeps the dash tile density
// authored-constant across camera distances and container sizes.
type ViewportRect = { x: number; y: number; width: number; height: number };

function clampRectToViewport(
  rect: ViewportRect,
  viewportWidth: number,
  viewportHeight: number,
): ViewportRect | null {
  const minX = Math.max(rect.x, 0);
  const minY = Math.max(rect.y, 0);
  const maxX = Math.min(rect.x + rect.width, viewportWidth);
  const maxY = Math.min(rect.y + rect.height, viewportHeight);
  if (maxX <= minX || maxY <= minY) {
    return null;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function getRectArea(rect: ViewportRect | null) {
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

function projectBox3ToViewport({
  camera,
  localBounds,
  meshMatrixWorld,
  viewportWidth,
  viewportHeight,
}: {
  camera: THREE.Camera;
  localBounds: THREE.Box3;
  meshMatrixWorld: THREE.Matrix4;
  viewportWidth: number;
  viewportHeight: number;
}): ViewportRect | null {
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
    { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
    viewportWidth,
    viewportHeight,
  );
}

function getMeshFootprintScale({
  camera,
  localBounds,
  lookAtTarget,
  meshMatrixWorld,
  viewportWidth,
  viewportHeight,
}: {
  camera: THREE.PerspectiveCamera;
  localBounds: THREE.Box3;
  lookAtTarget: THREE.Vector3;
  meshMatrixWorld: THREE.Matrix4;
  viewportWidth: number;
  viewportHeight: number;
}) {
  const currentRect = projectBox3ToViewport({
    camera,
    localBounds,
    meshMatrixWorld,
    viewportWidth,
    viewportHeight,
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
    viewportWidth,
    viewportHeight,
  });

  const currentArea = getRectArea(currentRect);
  const referenceArea = getRectArea(referenceRect);
  if (currentArea <= 0 || referenceArea <= 0) {
    return 1;
  }
  return Math.max(Math.sqrt(currentArea / referenceArea), MIN_FOOTPRINT_SCALE);
}

// The band-variant model scene: transmission material (solid or glass),
// breathe/float/rotate-preset/spring/parallax animation, per-frame mesh
// footprint, blur chain, band dash composite. Ported from the old
// HalftoneCanvas shape mode.
export async function createBandSession({
  container,
  geometry,
  settings,
  initialPose,
  reducedMotion = false,
  onFirstFrame,
}: CreateBandSessionOptions): Promise<BandSession | null> {
  if (settings.halftone.variant !== 'band') {
    throw new Error('createBandSession: settings must use the band variant.');
  }
  const halftoneSettings = settings.halftone;
  const animation = settings.animation;

  const getWidth = () => Math.max(container.clientWidth, 1);
  const getHeight = () => Math.max(container.clientHeight, 1);
  const getVirtualHeight = () => Math.max(VIRTUAL_RENDER_HEIGHT, getHeight());
  const getVirtualWidth = () =>
    Math.max(
      Math.round(getVirtualHeight() * (getWidth() / Math.max(getHeight(), 1))),
      1,
    );

  const renderer = createVisualRenderer({ antialias: false, alpha: true });
  if (renderer === null) {
    return null;
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(getVirtualWidth(), getVirtualHeight(), false);

  const canvas = renderer.domElement;
  canvas.style.cursor = reducedMotion ? 'default' : 'grab';
  canvas.style.display = 'block';
  canvas.style.height = '100%';
  canvas.style.touchAction = 'none';
  canvas.style.width = '100%';
  container.appendChild(canvas);

  const materialAssets = await halftoneMaterials.createAssets(renderer);

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

  const material = halftoneMaterials.create();
  halftoneMaterials.applySettings(material, settings.material, materialAssets);

  const mesh = new THREE.Mesh(geometry, material);
  scene3d.add(mesh);

  const sceneTarget = createRenderTarget(getVirtualWidth(), getVirtualHeight());
  const transmissionBacksideTarget = createRenderTarget(
    getVirtualWidth(),
    getVirtualHeight(),
  );
  const transmissionTarget = createRenderTarget(
    getVirtualWidth(),
    getVirtualHeight(),
  );
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
      tScene: { value: sceneTarget.texture },
      tGlow: { value: blurTargetB.texture },
      effectResolution: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      logicalResolution: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      tile: { value: halftoneSettings.scale },
      s_3: { value: halftoneSettings.power },
      s_4: { value: halftoneSettings.width },
      applyToDarkAreas: {
        value: halftoneSettings.toneTarget === 'dark' ? 1 : 0,
      },
      dashColor: { value: new THREE.Color(halftoneSettings.dashColor) },
      hoverDashColor: {
        value: new THREE.Color(halftoneSettings.hoverDashColor),
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
    vertexShader: BLUR_PASS_SHADERS.vertex,
    fragmentShader: HALFTONE_PASS_SHADER.fragment,
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
    const virtualWidth = getVirtualWidth();
    const virtualHeight = getVirtualHeight();

    renderer.setSize(virtualWidth, virtualHeight, false);
    camera.aspect = getWidth() / getHeight();
    camera.updateProjectionMatrix();
    sceneTarget.setSize(virtualWidth, virtualHeight);
    transmissionBacksideTarget.setSize(virtualWidth, virtualHeight);
    transmissionTarget.setSize(virtualWidth, virtualHeight);
    blurTargetA.setSize(virtualWidth, virtualHeight);
    blurTargetB.setSize(virtualWidth, virtualHeight);
    blurHorizontalMaterial.uniforms.res.value.set(virtualWidth, virtualHeight);
    blurVerticalMaterial.uniforms.res.value.set(virtualWidth, virtualHeight);
    halftoneMaterial.uniforms.effectResolution.value.set(
      virtualWidth,
      virtualHeight,
    );
    halftoneMaterial.uniforms.logicalResolution.value.set(
      virtualWidth,
      virtualHeight,
    );
  };

  const getMeshHalftoneScale = (lookAtTarget: THREE.Vector3) => {
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
      viewportWidth: getVirtualWidth(),
      viewportHeight: getVirtualHeight(),
    });
  };

  // Pointer handlers are canvas-scoped (the old shape mode's binding), so
  // overlapping cards never fight over one drag.
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

  const endDrag = () => {
    if (interaction.activePointerId !== null) {
      canvas.releasePointerCapture?.(interaction.activePointerId);
      interaction.activePointerId = null;
    }
    interaction.dragging = false;
    canvas.style.cursor = 'grab';
  };

  const handlePointerDown = (event: PointerEvent) => {
    updatePointerPosition(event);
    if (!animation.followDragEnabled && !animation.autoRotateEnabled) {
      return;
    }
    interaction.dragging = true;
    interaction.activePointerId = event.pointerId;
    canvas.setPointerCapture?.(event.pointerId);
    interaction.pointerX = event.clientX;
    interaction.pointerY = event.clientY;
    interaction.velocityX = 0;
    interaction.velocityY = 0;
    canvas.style.cursor = 'grabbing';
  };

  const handlePointerMove = (event: PointerEvent) => {
    updatePointerPosition(event);
    interaction.pointerInside = true;
    if (!interaction.dragging) {
      return;
    }
    const deltaX = (event.clientX - interaction.pointerX) * animation.dragSens;
    const deltaY = (event.clientY - interaction.pointerY) * animation.dragSens;
    interaction.velocityX = deltaY;
    interaction.velocityY = deltaX;
    interaction.targetRotationY += deltaX;
    interaction.targetRotationX += deltaY;
    interaction.pointerX = event.clientX;
    interaction.pointerY = event.clientY;
  };

  const handlePointerLeave = () => {
    interaction.pointerInside = false;
    interaction.mouseX = 0.5;
    interaction.mouseY = 0.5;
  };

  if (!reducedMotion) {
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    window.addEventListener('blur', endDrag);
  }

  let firstFrameNotified = false;

  const renderFrame = ({ deltaSeconds, elapsedSeconds }: VisualFrame) => {
    const elapsedTime = (initialPose?.timeElapsed ?? 0) + elapsedSeconds;

    halftoneMaterial.uniforms.time.value = elapsedTime;
    halftoneMaterial.uniforms.waveAmount.value = animation.waveEnabled
      ? animation.waveAmount
      : 0;
    halftoneMaterial.uniforms.waveSpeed.value = animation.waveSpeed;

    let baseRotationX = initialPose?.rotationX ?? 0;
    let baseRotationY = initialPose?.rotationY ?? 0;
    let baseRotationZ = initialPose?.rotationZ ?? 0;
    let meshOffsetY = 0;
    let meshScale = 1;
    let lightAngle = settings.lighting.angleDegrees;
    let lightHeight = settings.lighting.height;

    if (animation.autoRotateEnabled) {
      interaction.autoElapsed += deltaSeconds;
      baseRotationY += interaction.autoElapsed * animation.autoSpeed;
      baseRotationX +=
        Math.sin(interaction.autoElapsed * 0.2) * animation.autoWobble;
    }

    if (animation.floatEnabled) {
      const floatPhase = elapsedTime * animation.floatSpeed;
      const driftAmount = (animation.driftAmount * Math.PI) / 180;
      meshOffsetY += Math.sin(floatPhase) * animation.floatAmplitude;
      baseRotationX += Math.sin(floatPhase * 0.72) * driftAmount * 0.45;
      baseRotationZ += Math.cos(floatPhase * 0.93) * driftAmount * 0.3;
    }

    if (animation.breatheEnabled) {
      meshScale *=
        1 +
        Math.sin(elapsedTime * animation.breatheSpeed) *
          animation.breatheAmount;
    }

    if (animation.rotateEnabled) {
      interaction.rotateElapsed += deltaSeconds;
      const rotateProgress = animation.rotatePingPong
        ? Math.sin(interaction.rotateElapsed * animation.rotateSpeed) * Math.PI
        : interaction.rotateElapsed * animation.rotateSpeed;

      if (animation.rotatePreset === 'axis') {
        const axisDirection = animation.rotateAxis.startsWith('-') ? -1 : 1;
        const axisProgress = rotateProgress * axisDirection;
        const axis = animation.rotateAxis;
        if (axis === 'x' || axis === 'xy' || axis === '-x' || axis === '-xy') {
          baseRotationX += axisProgress;
        }
        if (axis === 'y' || axis === 'xy' || axis === '-y' || axis === '-xy') {
          baseRotationY += axisProgress;
        }
        if (axis === 'z' || axis === '-z') {
          baseRotationZ += axisProgress;
        }
      } else if (animation.rotatePreset === 'lissajous') {
        baseRotationX += Math.sin(rotateProgress * 0.85) * 0.65;
        baseRotationY += Math.sin(rotateProgress * 1.35 + 0.8) * 1.05;
        baseRotationZ += Math.sin(rotateProgress * 0.55 + 1.6) * 0.32;
      } else if (animation.rotatePreset === 'orbit') {
        baseRotationX += Math.sin(rotateProgress * 0.75) * 0.42;
        baseRotationY += Math.cos(rotateProgress) * 1.2;
        baseRotationZ += Math.sin(rotateProgress * 1.25) * 0.24;
      } else if (animation.rotatePreset === 'tumble') {
        baseRotationX += rotateProgress * 0.55;
        baseRotationY += Math.sin(rotateProgress * 0.8) * 0.9;
        baseRotationZ += Math.cos(rotateProgress * 1.1) * 0.38;
      }
    }

    if (animation.lightSweepEnabled) {
      const lightPhase = elapsedTime * animation.lightSweepSpeed;
      lightAngle += Math.sin(lightPhase) * animation.lightSweepRange;
      lightHeight +=
        Math.cos(lightPhase * 0.85) * animation.lightSweepHeightRange;
    }

    let targetX = baseRotationX;
    let targetY = baseRotationY;
    let easing = 0.12;

    if (animation.followHoverEnabled) {
      const rangeRadians = (animation.hoverRange * Math.PI) / 180;
      if (
        animation.hoverReturn ||
        interaction.mouseX !== 0.5 ||
        interaction.mouseY !== 0.5
      ) {
        targetX += (interaction.mouseY - 0.5) * rangeRadians;
        targetY += (interaction.mouseX - 0.5) * rangeRadians;
      }
      easing = animation.hoverEase;
    }

    if (animation.followDragEnabled) {
      if (!interaction.dragging && animation.dragMomentum) {
        interaction.targetRotationX += interaction.velocityX;
        interaction.targetRotationY += interaction.velocityY;
        interaction.velocityX *= 1 - animation.dragFriction;
        interaction.velocityY *= 1 - animation.dragFriction;
      }
      targetX += interaction.targetRotationX;
      targetY += interaction.targetRotationY;
      easing = animation.dragFriction;
    }

    if (
      animation.autoRotateEnabled &&
      !animation.followHoverEnabled &&
      !animation.followDragEnabled
    ) {
      targetX = baseRotationX + interaction.targetRotationX;
      targetY = baseRotationY + interaction.targetRotationY;
      if (interaction.dragging) {
        targetX = interaction.targetRotationX;
        targetY = interaction.targetRotationY;
      }
      easing = 0.08;
    }

    if (animation.springReturnEnabled) {
      const springX = halftoneInteraction.springStep({
        current: interaction.rotationX,
        damping: animation.springDamping,
        strength: animation.springStrength,
        target: targetX,
        velocity: interaction.rotationVelocityX,
      });
      const springY = halftoneInteraction.springStep({
        current: interaction.rotationY,
        damping: animation.springDamping,
        strength: animation.springStrength,
        target: targetY,
        velocity: interaction.rotationVelocityY,
      });
      const springZ = halftoneInteraction.springStep({
        current: interaction.rotationZ,
        damping: animation.springDamping,
        strength: animation.springStrength,
        target: baseRotationZ,
        velocity: interaction.rotationVelocityZ,
      });
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
        (animation.rotatePingPong ? 0.18 : 0.12);
    }

    mesh.rotation.set(
      interaction.rotationX,
      interaction.rotationY,
      interaction.rotationZ,
    );
    mesh.position.y = meshOffsetY;
    mesh.scale.setScalar(meshScale);

    if (animation.cameraParallaxEnabled) {
      const cameraRange = animation.cameraParallaxAmount;
      const cameraEase = animation.cameraParallaxEase;
      const centeredX = (interaction.mouseX - 0.5) * 2;
      const centeredY = (0.5 - interaction.mouseY) * 2;
      const orbitYaw = centeredX * cameraRange;
      const orbitPitch = centeredY * cameraRange * 0.7;
      const horizontalRadius = Math.cos(orbitPitch) * settings.previewDistance;
      camera.position.x +=
        (Math.sin(orbitYaw) * horizontalRadius - camera.position.x) *
        cameraEase;
      camera.position.y +=
        (Math.sin(orbitPitch) * settings.previewDistance * 0.85 -
          camera.position.y) *
        cameraEase;
      camera.position.z +=
        (Math.cos(orbitYaw) * horizontalRadius - camera.position.z) *
        cameraEase;
    } else {
      camera.position.x += (0 - camera.position.x) * 0.12;
      camera.position.y += (0 - camera.position.y) * 0.12;
      camera.position.z +=
        (settings.previewDistance - camera.position.z) * 0.12;
    }

    const lookAtTarget = new THREE.Vector3(0, meshOffsetY * 0.2, 0);
    camera.lookAt(lookAtTarget);
    setPrimaryLightPosition(primaryLight, lightAngle, lightHeight);
    halftoneMaterial.uniforms.footprintScale.value =
      getMeshHalftoneScale(lookAtTarget);

    if (!halftoneSettings.enabled) {
      halftoneMaterials.renderScene({
        camera,
        elapsedTime,
        material,
        mesh,
        outputTarget: null,
        renderer,
        scene: scene3d,
        transmissionBacksideTarget,
        transmissionTarget,
        transmissionScene: materialAssets.glassTransmissionScene,
      });
      return;
    }

    halftoneMaterials.renderScene({
      camera,
      elapsedTime,
      material,
      mesh,
      outputTarget: sceneTarget,
      renderer,
      scene: scene3d,
      transmissionBacksideTarget,
      transmissionTarget,
      transmissionScene: materialAssets.glassTransmissionScene,
    });

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

  const sizeObserver =
    typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(syncSize);
  sizeObserver?.observe(container);

  function disposeResources() {
    blurHorizontalMaterial.dispose();
    blurVerticalMaterial.dispose();
    halftoneMaterial.dispose();
    fullScreenGeometry.dispose();
    material.dispose();
    sceneTarget.dispose();
    transmissionBacksideTarget.dispose();
    transmissionTarget.dispose();
    blurTargetA.dispose();
    blurTargetB.dispose();
    halftoneMaterials.disposeAssets(materialAssets);
    renderer?.dispose();
    if (canvas.parentNode === container) {
      container.removeChild(canvas);
    }
  }

  if (reducedMotion) {
    renderFrame({ deltaSeconds: 0, elapsedSeconds: 0, timestamp: 0 });
    return {
      dispose() {
        sizeObserver?.disconnect();
        disposeResources();
      },
    };
  }

  const frameLoop = createVisualFrameLoop({
    renderFrame,
    target: container,
    targetVisibilityOptions: { rootMargin: '100px' },
  });
  frameLoop.start();

  return {
    dispose() {
      frameLoop.dispose();
      sizeObserver?.disconnect();
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('pointerup', endDrag);
      canvas.removeEventListener('pointercancel', endDrag);
      window.removeEventListener('blur', endDrag);
      disposeResources();
    },
  };
}
