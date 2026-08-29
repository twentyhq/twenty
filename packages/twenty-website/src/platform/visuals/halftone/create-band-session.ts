import { Camera, Geometry, Mesh, Vec2, Vec3 } from 'ogl';

import {
  createVisualFrameLoop,
  type VisualFrame,
} from '../engine/create-visual-frame-loop';
import { createDfgLutTexture } from '../gl-runtime/create-dfg-lut-texture';
import { createFullscreenPass } from '../gl-runtime/create-fullscreen-pass';
import { createRenderTarget } from '../gl-runtime/create-render-target';
import { createVisualRenderer } from '../gl-runtime/create-visual-renderer';
import { disposeRenderTarget } from '../gl-runtime/dispose-render-target';
import { linearColorFromHex } from '../gl-runtime/linear-color-from-hex';
import { loadEnvironmentTexture } from '../gl-runtime/load-environment-texture';
import { loadGlassEnvironment } from '../gl-runtime/load-glass-environment';
import { type ModelGeometryData } from '../gl-runtime/load-model-geometry';
import { BLUR_PASS_SHADERS } from './blur-pass-shaders';
import { createModelMaterialProgram } from './create-model-material-program';
import { HALFTONE_CONSTANTS } from './halftone-constants';
import { createVirtualSize } from './virtual-size';
import {
  halftoneInteraction,
  type HalftoneInitialPose,
} from './halftone-interaction-state';
import { HALFTONE_PASS_SHADER } from './halftone-pass-shader';
import { type HalftoneSceneSettings } from './halftone-settings';

export type BandSession = {
  dispose: () => void;
};

type CreateBandSessionOptions = {
  container: HTMLElement;
  geometry: ModelGeometryData;
  settings: HalftoneSceneSettings;
  initialPose?: HalftoneInitialPose & { timeElapsed?: number };
  reducedMotion?: boolean;
  onFirstFrame?: () => void;
};

const REFERENCE_PREVIEW_DISTANCE = HALFTONE_CONSTANTS.referencePreviewDistance;
const MIN_FOOTPRINT_SCALE = HALFTONE_CONSTANTS.minFootprintScale;

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function getPrimaryLightPosition(angleDegrees: number, height: number) {
  const angle = (angleDegrees * Math.PI) / 180;
  return new Vec3(Math.cos(angle) * 5, height, Math.sin(angle) * 5);
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

function getBoundsCorners(bounds: { min: number[]; max: number[] }) {
  const { min, max } = bounds;
  return [
    new Vec3(min[0], min[1], min[2]),
    new Vec3(min[0], min[1], max[2]),
    new Vec3(min[0], max[1], min[2]),
    new Vec3(min[0], max[1], max[2]),
    new Vec3(max[0], min[1], min[2]),
    new Vec3(max[0], min[1], max[2]),
    new Vec3(max[0], max[1], min[2]),
    new Vec3(max[0], max[1], max[2]),
  ];
}

function projectBoundsToViewport({
  camera,
  bounds,
  meshWorldMatrix,
  viewportWidth,
  viewportHeight,
}: {
  camera: Camera;
  bounds: { min: number[]; max: number[] };
  meshWorldMatrix: Mesh['worldMatrix'];
  viewportWidth: number;
  viewportHeight: number;
}): ViewportRect | null {
  if (viewportWidth <= 0 || viewportHeight <= 0) {
    return null;
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let hasProjectedCorner = false;

  for (const corner of getBoundsCorners(bounds)) {
    corner.applyMatrix4(meshWorldMatrix);
    corner.applyMatrix4(camera.projectionViewMatrix);
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

// The band-variant model scene: transmission material (solid or glass),
// breathe/float/rotate-preset/spring/parallax animation, per-frame mesh
// footprint, band dash composite. Ported from the old HalftoneCanvas shape
// mode.
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
  const isGlass = settings.material.surface === 'glass';

  const { getWidth, getHeight, getVirtualWidth, getVirtualHeight } =
    createVirtualSize(container);

  const renderer = createVisualRenderer({ antialias: false, alpha: true });
  if (renderer === null) {
    return null;
  }

  const { gl, canvas } = renderer;
  renderer.setSize(getVirtualWidth(), getVirtualHeight());

  canvas.style.cursor = reducedMotion ? 'default' : 'grab';
  canvas.style.display = 'block';
  canvas.style.height = '100%';
  canvas.style.touchAction = 'none';
  canvas.style.width = '100%';
  container.appendChild(canvas);

  // Glass reflects and refracts the same authored backdrop; solid keeps the
  // baked room the rows sessions use.
  const glassEnvironment = isGlass ? await loadGlassEnvironment(gl) : null;
  const environment = glassEnvironment ?? (await loadEnvironmentTexture(gl));
  const dfgLut = createDfgLutTexture(gl);

  const camera = new Camera(gl, {
    fov: 45,
    aspect: getWidth() / getHeight(),
    near: 0.1,
    far: 100,
  });
  camera.position.z = settings.previewDistance;

  const primaryLightDirection = new Vec3();
  const fillLightDirection = new Vec3();
  const fillLightPosition = new Vec3(-3, -1, 1);

  const materialProgram = createModelMaterialProgram({
    gl,
    material: settings.material,
    lighting: settings.lighting,
    environmentTexture: environment.texture,
    environmentMaxLod: environment.mipCount - 1,
    refractionEnvironmentTexture: glassEnvironment?.texture,
    dfgLut,
    primaryLightDirection,
    fillLightDirection,
  });

  const meshGeometry = new Geometry(gl, {
    position: { size: 3, data: geometry.positions },
    normal: { size: 3, data: geometry.normals },
    index: { data: geometry.indices },
  });

  const mesh = new Mesh(gl, {
    geometry: meshGeometry,
    program: materialProgram,
  });
  // ogl's Euler defaults to YXZ, three's Object3D.rotation to XYZ. Every
  // authored pose in these configs was baked against XYZ, so leaving the
  // default tilts the model.
  mesh.rotation.order = 'XYZ';

  const sceneTarget = createRenderTarget(
    gl,
    getVirtualWidth(),
    getVirtualHeight(),
  );

  const halftonePass = createFullscreenPass({
    gl,
    transparent: true,
    vertex: BLUR_PASS_SHADERS.vertex,
    fragment: HALFTONE_PASS_SHADER.fragment,
    uniforms: {
      tScene: { value: sceneTarget.texture },
      // Never sampled by the band composite — bound only so the sampler
      // slot is valid.
      tGlow: { value: sceneTarget.texture },
      effectResolution: {
        value: new Vec2(getVirtualWidth(), getVirtualHeight()),
      },
      logicalResolution: {
        value: new Vec2(getVirtualWidth(), getVirtualHeight()),
      },
      tile: { value: halftoneSettings.scale },
      s_3: { value: halftoneSettings.power },
      s_4: { value: halftoneSettings.width },
      applyToDarkAreas: {
        value: halftoneSettings.toneTarget === 'dark' ? 1 : 0,
      },
      dashColor: { value: linearColorFromHex(halftoneSettings.dashColor) },
      hoverDashColor: {
        value: linearColorFromHex(halftoneSettings.hoverDashColor),
      },
      time: { value: 0 },
      waveAmount: { value: 0 },
      waveSpeed: { value: 1 },
      footprintScale: { value: 1.0 },
      interactionUv: { value: new Vec2(0.5, 0.5) },
      interactionVelocity: { value: new Vec2(0, 0) },
      dragOffset: { value: new Vec2(0, 0) },
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
      minimumTone: { value: 0 },
      contrast: { value: 1 },
      hoverLightVerticalFade: { value: 0 },
    },
  });

  const interaction = halftoneInteraction.create(initialPose);

  const syncSize = () => {
    const virtualWidth = getVirtualWidth();
    const virtualHeight = getVirtualHeight();

    renderer.setSize(virtualWidth, virtualHeight);
    camera.perspective({ aspect: getWidth() / getHeight() });
    sceneTarget.setSize(virtualWidth, virtualHeight);
    halftonePass.uniforms.effectResolution.value.set(
      virtualWidth,
      virtualHeight,
    );
    halftonePass.uniforms.logicalResolution.value.set(
      virtualWidth,
      virtualHeight,
    );
  };

  const referenceCamera = new Camera(gl, {
    fov: 45,
    aspect: getWidth() / getHeight(),
    near: 0.1,
    far: 100,
  });

  const getMeshHalftoneScale = (lookAtTarget: Vec3) => {
    mesh.updateMatrixWorld();
    camera.updateMatrixWorld();

    const currentRect = projectBoundsToViewport({
      camera,
      bounds: geometry.bounds,
      meshWorldMatrix: mesh.worldMatrix,
      viewportWidth: getVirtualWidth(),
      viewportHeight: getVirtualHeight(),
    });

    const offset = new Vec3().copy(camera.position).sub(lookAtTarget);
    if (offset.squaredLen() > 0) {
      offset.normalize().multiply(REFERENCE_PREVIEW_DISTANCE);
    } else {
      offset.set(0, 0, REFERENCE_PREVIEW_DISTANCE);
    }
    referenceCamera.perspective({ aspect: getWidth() / getHeight() });
    referenceCamera.position.copy(lookAtTarget).add(offset);
    referenceCamera.lookAt(lookAtTarget);
    referenceCamera.updateMatrixWorld();

    const referenceRect = projectBoundsToViewport({
      camera: referenceCamera,
      bounds: geometry.bounds,
      meshWorldMatrix: mesh.worldMatrix,
      viewportWidth: getVirtualWidth(),
      viewportHeight: getVirtualHeight(),
    });

    const currentArea = getRectArea(currentRect);
    const referenceArea = getRectArea(referenceRect);
    if (currentArea <= 0 || referenceArea <= 0) {
      return 1;
    }
    return Math.max(
      Math.sqrt(currentArea / referenceArea),
      MIN_FOOTPRINT_SCALE,
    );
  };

  // Pointer handlers are canvas-scoped (the old shape mode's binding), so
  // overlapping cards never fight over one drag.
  const updatePointerPosition = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    interaction.mouseX = clamp01(
      (event.clientX - rect.left) / Math.max(rect.width, 1),
    );
    interaction.mouseY = clamp01(
      (event.clientY - rect.top) / Math.max(rect.height, 1),
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
  const lookAtTarget = new Vec3();

  const renderFrame = ({ deltaSeconds, elapsedSeconds }: VisualFrame) => {
    const elapsedTime = (initialPose?.timeElapsed ?? 0) + elapsedSeconds;

    halftonePass.uniforms.time.value = elapsedTime;
    halftonePass.uniforms.waveAmount.value = animation.waveEnabled
      ? animation.waveAmount
      : 0;
    halftonePass.uniforms.waveSpeed.value = animation.waveSpeed;

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
    mesh.scale.set(meshScale, meshScale, meshScale);

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

    lookAtTarget.set(0, meshOffsetY * 0.2, 0);
    camera.lookAt(lookAtTarget);
    camera.updateMatrixWorld();

    const primaryLightPosition = getPrimaryLightPosition(
      lightAngle,
      lightHeight,
    );
    primaryLightDirection
      .copy(primaryLightPosition)
      .normalize()
      .transformDirection(camera.viewMatrix);
    fillLightDirection
      .copy(fillLightPosition)
      .normalize()
      .transformDirection(camera.viewMatrix);

    halftonePass.uniforms.footprintScale.value =
      getMeshHalftoneScale(lookAtTarget);

    if (!halftoneSettings.enabled) {
      renderer.render({ scene: mesh, camera, target: null });
      return;
    }

    renderer.render({ scene: mesh, camera, target: sceneTarget });
    renderer.render({ scene: halftonePass.mesh, target: null });

    if (!firstFrameNotified) {
      firstFrameNotified = true;
      onFirstFrame?.();
    }
  };

  const sizeObserver =
    typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(syncSize);
  sizeObserver?.observe(container);

  function disposeResources() {
    halftonePass.dispose();
    materialProgram.remove();
    meshGeometry.remove();
    disposeRenderTarget(gl, sceneTarget);
    gl.deleteTexture(environment.texture.texture);
    gl.deleteTexture(dfgLut.texture);
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
