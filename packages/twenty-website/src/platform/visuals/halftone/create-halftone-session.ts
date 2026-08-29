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
import { type ModelGeometryData } from '../gl-runtime/load-model-geometry';
import { BLUR_PASS_SHADERS } from './blur-pass-shaders';
import { createBlurPipeline } from './blur-pipeline';
import { HALFTONE_CONSTANTS } from './halftone-constants';
import { createVirtualSize } from './virtual-size';
import {
  halftoneInteraction,
  type HalftoneInitialPose,
} from './halftone-interaction-state';
import { HALFTONE_ROW_SHADER } from './halftone-row-shader';
import { type HalftoneSceneSettings } from './halftone-settings';
import { createModelMaterialProgram } from './create-model-material-program';

export type HalftoneSession = {
  dispose: () => void;
};

type CreateHalftoneSessionOptions = {
  container: HTMLElement;
  geometry: ModelGeometryData;
  settings: HalftoneSceneSettings;
  initialPose?: HalftoneInitialPose & { timeElapsed?: number };
  // True renders exactly one settled frame: no loop, no pointer physics.
  reducedMotion?: boolean;
  onFirstFrame?: () => void;
};

const POINTER_EASING_DEFAULT = HALFTONE_CONSTANTS.pointerEasingDefault;
const POINTER_EASING_AUTOROTATE_DRAG =
  HALFTONE_CONSTANTS.pointerEasingAutorotateDrag;
const AUTOROTATE_VELOCITY_DECAY = HALFTONE_CONSTANTS.autorotateVelocityDecay;

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function getPrimaryLightPosition(angleDegrees: number, height: number) {
  const angle = (angleDegrees * Math.PI) / 180;
  return new Vec3(Math.cos(angle) * 5, height, Math.sin(angle) * 5);
}

// The complete rows-variant halftone scene: standard-material mesh, double
// gaussian blur chain, row composite — ported from the authored hourglass
// pipeline.
export async function createHalftoneSession({
  container,
  geometry,
  settings,
  initialPose,
  reducedMotion = false,
  onFirstFrame,
}: CreateHalftoneSessionOptions): Promise<HalftoneSession | null> {
  if (settings.halftone.variant !== 'rows') {
    throw new Error('createHalftoneSession: only the rows variant is ported.');
  }
  const halftoneSettings = settings.halftone;

  const { getWidth, getHeight, getVirtualWidth, getVirtualHeight } =
    createVirtualSize(container);

  const wantsPointer =
    settings.animation.followDragEnabled ||
    settings.animation.autoRotateEnabled;

  const renderer = createVisualRenderer({ antialias: false, alpha: true });
  if (renderer === null) {
    return null;
  }

  const { gl, canvas } = renderer;
  renderer.setSize(getVirtualWidth(), getVirtualHeight());

  canvas.style.cursor = !reducedMotion && wantsPointer ? 'grab' : 'default';
  canvas.style.display = 'block';
  canvas.style.height = '100%';
  canvas.style.touchAction = 'none';
  canvas.style.width = '100%';
  container.appendChild(canvas);

  const environment = await loadEnvironmentTexture(gl);
  const dfgLut = createDfgLutTexture(gl);

  const camera = new Camera(gl, {
    fov: 45,
    aspect: getWidth() / getHeight(),
    near: 0.1,
    far: 100,
  });
  camera.position.z = settings.previewDistance;
  camera.lookAt(new Vec3(0, settings.modelOffsetY * 0.2, 0));

  const primaryLightPosition = getPrimaryLightPosition(
    settings.lighting.angleDegrees,
    settings.lighting.height,
  );
  const fillLightPosition = new Vec3(-3, -1, 1);
  const primaryLightDirection = new Vec3();
  const fillLightDirection = new Vec3();

  const materialProgram = createModelMaterialProgram({
    gl,
    material: settings.material,
    lighting: settings.lighting,
    environmentTexture: environment.texture,
    environmentMaxLod: environment.mipCount - 1,
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
  mesh.position.y = settings.modelOffsetY;

  const sceneTarget = createRenderTarget(
    gl,
    getVirtualWidth(),
    getVirtualHeight(),
  );
  const blurPipeline = createBlurPipeline(
    gl,
    getVirtualWidth(),
    getVirtualHeight(),
  );

  const halftonePass = createFullscreenPass({
    gl,
    transparent: true,
    vertex: BLUR_PASS_SHADERS.vertex,
    fragment: HALFTONE_ROW_SHADER.fragment,
    uniforms: {
      baseInk: { value: halftoneSettings.baseInk },
      cellRatio: { value: halftoneSettings.cellRatio },
      contrast: { value: halftoneSettings.contrast },
      cutoff: { value: halftoneSettings.cutoff },
      dashColor: { value: linearColorFromHex(halftoneSettings.dashColor) },
      distanceScale: {
        value:
          settings.previewDistance /
          HALFTONE_CONSTANTS.referencePreviewDistance,
      },
      glowStr: { value: halftoneSettings.glowStrength },
      highlightOpen: { value: halftoneSettings.highlightOpen },
      maxBar: { value: halftoneSettings.maxBar },
      numRows: { value: halftoneSettings.numRows },
      power: { value: halftoneSettings.power },
      resolution: {
        value: new Vec2(getVirtualWidth(), getVirtualHeight()),
      },
      rowMerge: { value: halftoneSettings.rowMerge },
      shading: { value: halftoneSettings.shading },
      shadowCrush: { value: halftoneSettings.shadowCrush },
      shadowGrouping: { value: halftoneSettings.shadowGrouping },
      tGlow: { value: blurPipeline.getGlowTexture() },
      tScene: { value: sceneTarget.texture },
      time: { value: 0 },
      waveAmount: {
        value: settings.animation.waveEnabled
          ? settings.animation.waveAmount
          : 0,
      },
      waveSpeed: { value: settings.animation.waveSpeed },
    },
  });

  const interaction = halftoneInteraction.create(initialPose);

  const syncSize = () => {
    const width = getWidth();
    const height = getHeight();
    const virtualWidth = getVirtualWidth();
    const virtualHeight = getVirtualHeight();

    renderer.setSize(virtualWidth, virtualHeight);
    camera.perspective({ aspect: width / height });
    sceneTarget.setSize(virtualWidth, virtualHeight);
    blurPipeline.setSize(virtualWidth, virtualHeight);
    halftonePass.uniforms.resolution.value.set(virtualWidth, virtualHeight);
  };

  const sizeObserver =
    typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(syncSize);
  sizeObserver?.observe(container);

  const updatePointerPosition = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    interaction.mouseX = clamp01(
      (event.clientX - rect.left) / Math.max(rect.width, 1),
    );
    interaction.mouseY = clamp01(
      (event.clientY - rect.top) / Math.max(rect.height, 1),
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

  // three resolved directional light directions into view space before the
  // shader saw them; the material is written against that same convention.
  const syncLightDirections = () => {
    camera.updateMatrixWorld();
    primaryLightDirection
      .copy(primaryLightPosition)
      .normalize()
      .transformDirection(camera.viewMatrix);
    fillLightDirection
      .copy(fillLightPosition)
      .normalize()
      .transformDirection(camera.viewMatrix);
  };

  const renderFrame = ({ deltaSeconds, elapsedSeconds }: VisualFrame) => {
    const elapsedTime = (initialPose?.timeElapsed ?? 0) + elapsedSeconds;
    halftonePass.uniforms.time.value = elapsedTime;

    let baseRotationX = 0;
    let baseRotationY = 0;
    let baseRotationZ = 0;
    let meshScale = 1;

    if (settings.animation.breatheEnabled) {
      meshScale *=
        1 +
        Math.sin(elapsedTime * settings.animation.breatheSpeed) *
          settings.animation.breatheAmount;
    }

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
      !settings.animation.autoRotateEnabled &&
      !settings.animation.followHoverEnabled &&
      !settings.animation.followDragEnabled &&
      !settings.animation.rotateEnabled
    ) {
      // No animation mode: hold the baked target pose (the footer model).
      targetX = interaction.targetRotationX;
      targetY = interaction.targetRotationY;
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
    mesh.scale.set(meshScale, meshScale, meshScale);

    syncLightDirections();

    if (!halftoneSettings.enabled) {
      renderer.render({ scene: mesh, camera, target: null });
      return;
    }

    renderer.render({ scene: mesh, camera, target: sceneTarget });

    // Two full blur rounds: the glow buffer feeds both cell averaging and
    // the halo term, and the authored look depends on the wider spread.
    blurPipeline.render(renderer, sceneTarget.texture);

    renderer.render({ scene: halftonePass.mesh, target: null });

    if (!firstFrameNotified) {
      firstFrameNotified = true;
      onFirstFrame?.();
    }
  };

  function disposeResources() {
    blurPipeline.dispose();
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
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      disposeResources();
    },
  };
}
