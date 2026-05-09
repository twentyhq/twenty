import { normalizeExportComponentName } from '@/lib/halftone/export-names';
import {
  HALFTONE_FOOTPRINT_RUNTIME_SOURCE,
  VIRTUAL_RENDER_HEIGHT,
} from '@/lib/halftone/footprint';
import type {
  HalftoneExportPose,
  HalftoneGeometrySpec,
  HalftoneStudioSettings,
} from '@/lib/halftone/state';

import {
  blurFragmentShader,
  createImportedGeometryRuntimeSource,
  GEOMETRY_RUNTIME_SOURCE,
  getExportedShapeLoader,
  GLASS_MATERIAL_RUNTIME_SOURCE,
  halftoneFragmentShader,
  imagePassthroughFragmentShader,
  passThroughVertexShader,
} from './exporter-shaders';
import {
  normalizeExportPose,
  normalizePreviewDistance,
} from './exporter-parsing';
import {
  DEFAULT_REACT_EXPORT_SETTINGS,
  type ExportedShapeDescriptor,
  type ReactExportOptions,
  type ReactExportSettings,
} from './exporter-types';

export type {
  ExportedShapeDescriptor,
  ParsedExportedPreset,
  ReactExportOptions,
  ReactExportSettings,
} from './exporter-types';
export { DEFAULT_REACT_EXPORT_SETTINGS } from './exporter-types';
export {
  deriveExportComponentName,
  parseExportedPreset,
} from './exporter-parsing';

function toIllustrationRegistryKey(componentName: string) {
  return componentName.charAt(0).toLowerCase() + componentName.slice(1);
}

function toPublicAssetDestination(assetUrl: string) {
  return assetUrl.startsWith('/') ? `public${assetUrl}` : assetUrl;
}

function normalizeReactExportSettings(
  exportSettings?: Partial<ReactExportSettings>,
): ReactExportSettings {
  return {
    ...DEFAULT_REACT_EXPORT_SETTINGS,
    ...exportSettings,
  };
}

function getReactImportBlock(
  exportSettings: ReactExportSettings,
  isImageMode: boolean,
  shape: ExportedShapeDescriptor,
) {
  const imports = new Set<string>();

  imports.add("import { useEffect, useRef, type CSSProperties } from 'react';");
  imports.add("import * as THREE from 'three';");

  if (exportSettings.includeStyledMount) {
    imports.add("import { styled } from '@linaria/react';");
  }

  if (!isImageMode) {
    imports.add(
      "import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';",
    );
  }

  const loader = getExportedShapeLoader(shape);

  if (shape.kind === 'imported' && loader === 'fbx') {
    imports.add(
      "import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';",
    );
  }

  if (shape.kind === 'imported' && loader === 'glb') {
    imports.add(
      "import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';",
    );
    imports.add(
      "import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';",
    );
  }

  return Array.from(imports).join('\n');
}

function getStandaloneThreeImports(
  isImageMode: boolean,
  shape: ExportedShapeDescriptor,
) {
  if (isImageMode) {
    return `import * as THREE from 'three';`;
  }

  const imports = [
    `import * as THREE from 'three';`,
    `import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';`,
  ];

  const loader = getExportedShapeLoader(shape);

  if (shape.kind === 'imported' && loader === 'fbx') {
    imports.push(
      `import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';`,
    );
  }

  if (shape.kind === 'imported' && loader === 'glb') {
    imports.push(
      `import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';`,
      `import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';`,
    );
  }

  return imports.join('\n      ');
}

function getTwentyReactHeaderComment(
  componentName: string,
  registryKey: string,
  assetUrl?: string,
) {
  const lines = [
    `// Suggested component destination: src/illustrations/${componentName}.tsx`,
  ];

  if (assetUrl) {
    lines.push(
      `// Suggested public asset destination: ${toPublicAssetDestination(assetUrl)}`,
    );
  }

  lines.push(
    `// illustrations-registry.tsx: import { ${componentName} } from './${componentName}';`,
    `// illustrations-registry.tsx: ${registryKey}: ${componentName},`,
  );

  return `${lines.join('\n')}\n`;
}

function createShapeDescriptor(
  shape: HalftoneGeometrySpec | undefined,
  settings: HalftoneStudioSettings,
  importedFile?: File,
  modelFilenameOverride?: string,
): ExportedShapeDescriptor {
  if (!shape) {
    return {
      filename: null,
      key: settings.shapeKey,
      kind: 'builtin',
      label: settings.shapeKey,
      loader: null,
    };
  }

  const effectiveImportedFilename =
    modelFilenameOverride ?? importedFile?.name ?? shape.filename ?? null;

  return {
    filename:
      shape.kind === 'imported'
        ? effectiveImportedFilename
        : (shape.filename ?? null),
    key: shape.key,
    kind: shape.kind,
    label:
      shape.kind === 'imported'
        ? (effectiveImportedFilename ?? shape.label)
        : shape.label,
    loader: shape.loader ?? null,
  };
}

function getModelMimeType(
  file: File,
  loader: HalftoneGeometrySpec['loader'] | null,
) {
  if (file.type) {
    return file.type;
  }

  if (loader === 'glb' || file.name.toLowerCase().endsWith('.glb')) {
    return 'model/gltf-binary';
  }

  if (loader === 'fbx' || file.name.toLowerCase().endsWith('.fbx')) {
    return 'application/octet-stream';
  }

  return 'application/octet-stream';
}

async function fileToDataUrl(
  file: File,
  loader: HalftoneGeometrySpec['loader'] | null,
) {
  const buffer = await file.arrayBuffer();
  const blob = new Blob([buffer], {
    type: getModelMimeType(file, loader),
  });

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(reader.error ?? new Error(`Unable to read ${file.name}.`));
    };
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error(`Unable to encode ${file.name}.`));
        return;
      }

      resolve(reader.result);
    };

    reader.readAsDataURL(blob);
  });
}

function serializeRuntimeSource(
  settings: HalftoneStudioSettings,
  shape: ExportedShapeDescriptor,
  initialPose: HalftoneExportPose,
  previewDistance: number | undefined,
) {
  const isImageMode = settings.sourceMode === 'image';
  const normalizedPreviewDistance = normalizePreviewDistance(previewDistance);

  return `
const settings = ${JSON.stringify(settings, null, 2)};
const shape = ${JSON.stringify(shape, null, 2)};
const initialPose = ${JSON.stringify(initialPose, null, 2)};
const previewDistance = ${JSON.stringify(normalizedPreviewDistance)};
const VIRTUAL_RENDER_HEIGHT = ${VIRTUAL_RENDER_HEIGHT};
const passThroughVertexShader = ${JSON.stringify(passThroughVertexShader)};
const blurFragmentShader = ${JSON.stringify(blurFragmentShader)};
const halftoneFragmentShader = ${JSON.stringify(halftoneFragmentShader)};
${isImageMode ? `const imagePassthroughFragmentShader = ${JSON.stringify(imagePassthroughFragmentShader)};` : ''}

${HALFTONE_FOOTPRINT_RUNTIME_SOURCE}

${isImageMode ? '' : GEOMETRY_RUNTIME_SOURCE}

${isImageMode ? '' : createImportedGeometryRuntimeSource(shape)}

${isImageMode ? '' : GLASS_MATERIAL_RUNTIME_SOURCE}

function createRenderTarget(width, height) {
  return new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  });
}

function createInteractionState() {
  return {
    autoElapsed: initialPose.autoElapsed,
    activePointerId: null,
    dragging: false,
    hoverStrength: 0,
    mouseX: 0.5,
    mouseY: 0.5,
    pointerInside: false,
    pointerVelocityX: 0,
    pointerVelocityY: 0,
    pointerX: 0,
    pointerY: 0,
    rotateElapsed: initialPose.rotateElapsed,
    rotationX: initialPose.rotationX,
    rotationVelocityX: 0,
    rotationY: initialPose.rotationY,
    rotationVelocityY: 0,
    rotationZ: initialPose.rotationZ,
    rotationVelocityZ: 0,
    smoothedMouseX: 0.5,
    smoothedMouseY: 0.5,
    targetRotationX: initialPose.targetRotationX,
    targetRotationY: initialPose.targetRotationY,
    velocityX: 0,
    velocityY: 0,
  };
}

${
  isImageMode
    ? ''
    : `
function setPrimaryLightPosition(light, angleDegrees, height) {
  const lightAngle = (angleDegrees * Math.PI) / 180;
  light.position.set(Math.cos(lightAngle) * 5, height, Math.sin(lightAngle) * 5);
}

function applySpringStep(current, target, velocity, strength, damping) {
  const nextVelocity = (velocity + (target - current) * strength) * damping;
  const nextValue = current + nextVelocity;

  return {
    value: nextValue,
    velocity: nextVelocity,
  };
}

function resetInteractionState(interactionState) {
  interactionState.dragging = false;
  interactionState.mouseX = 0.5;
  interactionState.mouseY = 0.5;
  interactionState.targetRotationX = 0;
  interactionState.targetRotationY = 0;
  interactionState.velocityX = 0;
  interactionState.velocityY = 0;
  interactionState.rotationVelocityX = 0;
  interactionState.rotationVelocityY = 0;
  interactionState.rotationVelocityZ = 0;
  interactionState.autoElapsed = 0;
}

async function createGeometry(modelUrl) {
  if (shape.kind === 'imported') {
    if (!modelUrl) {
      throw new Error('No model URL was provided for ' + shape.label + '.');
    }

    return loadImportedGeometryFromUrl(modelUrl, shape.label);
  }

  return createBuiltinGeometry(shape.key);
}
`
}
`;
}

function createMountScript() {
  return `
async function mountHalftoneCanvas(options) {
  const {
    container,
    modelUrl,
    onError,
  } = options;

  const getWidth = () => Math.max(container.clientWidth, 1);
  const getHeight = () => Math.max(container.clientHeight, 1);
  const getVirtualHeight = () => Math.max(VIRTUAL_RENDER_HEIGHT, getHeight());
  const getVirtualWidth = () =>
    Math.max(
      Math.round(getVirtualHeight() * (getWidth() / Math.max(getHeight(), 1))),
      1,
    );

  let geometry;

  try {
    geometry = await createGeometry(modelUrl);
  } catch (error) {
    onError?.(error);
    return () => {};
  }

  // boundary-allow-next-line:no-raw-webgl-renderer -- emitted into the standalone HTML export; runs in the user's downloaded file with no access to lib/visual-runtime
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(getVirtualWidth(), getVirtualHeight(), false);

  const canvas = renderer.domElement;
  canvas.style.cursor = settings.animation.followDragEnabled ? 'grab' : 'default';
  canvas.style.display = 'block';
  canvas.style.height = '100%';
  canvas.style.touchAction = 'none';
  canvas.style.width = '100%';
  container.appendChild(canvas);

  const materialAssets = await createHalftoneMaterialAssets(renderer);

  const scene3d = new THREE.Scene();
  scene3d.background = null;

  const baseCameraDistance = previewDistance;
  const camera = new THREE.PerspectiveCamera(45, getWidth() / getHeight(), 0.1, 100);
  camera.position.z = baseCameraDistance;

  const primaryLight = new THREE.DirectionalLight(0xffffff, settings.lighting.intensity);
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

  const material = createHalftoneMaterial();
  applyHalftoneMaterialSettings(material, settings.material, materialAssets);

  const mesh = new THREE.Mesh(geometry, material);
  scene3d.add(mesh);

  const sceneTarget = createRenderTarget(getVirtualWidth(), getVirtualHeight());
  const blurTargetA = createRenderTarget(getVirtualWidth(), getVirtualHeight());
  const blurTargetB = createRenderTarget(getVirtualWidth(), getVirtualHeight());
  const fullScreenGeometry = new THREE.PlaneGeometry(2, 2);
  const orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const blurHorizontalMaterial = new THREE.ShaderMaterial({
    uniforms: {
      tInput: { value: null },
      dir: { value: new THREE.Vector2(1, 0) },
      res: { value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()) },
    },
    vertexShader: passThroughVertexShader,
    fragmentShader: blurFragmentShader,
  });

  const blurVerticalMaterial = new THREE.ShaderMaterial({
    uniforms: {
      tInput: { value: null },
      dir: { value: new THREE.Vector2(0, 1) },
      res: { value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()) },
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
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      logicalResolution: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      tile: { value: settings.halftone.scale },
      s_3: { value: settings.halftone.power },
      s_4: { value: settings.halftone.width },
      applyToDarkAreas: {
        value: settings.halftone.toneTarget === 'dark' ? 1 : 0,
      },
      dashColor: { value: new THREE.Color(settings.halftone.dashColor) },
      hoverDashColor: {
        value: new THREE.Color(settings.halftone.hoverDashColor),
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
  blurVerticalScene.add(new THREE.Mesh(fullScreenGeometry, blurVerticalMaterial));

  const postScene = new THREE.Scene();
  postScene.add(new THREE.Mesh(fullScreenGeometry, halftoneMaterial));

  const updateViewportUniforms = (
    logicalWidth,
    logicalHeight,
    effectWidth,
    effectHeight,
  ) => {
    blurHorizontalMaterial.uniforms.res.value.set(effectWidth, effectHeight);
    blurVerticalMaterial.uniforms.res.value.set(effectWidth, effectHeight);
    halftoneMaterial.uniforms.effectResolution.value.set(
      effectWidth,
      effectHeight,
    );
    halftoneMaterial.uniforms.logicalResolution.value.set(
      logicalWidth,
      logicalHeight,
    );
  };

  const getHalftoneScale = (viewportWidth, viewportHeight, lookAtTarget) => {
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
      lookAtTarget,
      meshMatrixWorld: mesh.matrixWorld,
      viewportHeight,
      viewportWidth,
    });
  };

  const interaction = createInteractionState();
  const autoRotateEnabled = settings.animation.autoRotateEnabled;
  const followHoverEnabled = settings.animation.followHoverEnabled;
  const followDragEnabled = settings.animation.followDragEnabled;
  const rotateEnabled = settings.animation.rotateEnabled;

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
    updateViewportUniforms(
      virtualWidth,
      virtualHeight,
      virtualWidth,
      virtualHeight,
    );
  };

  const resizeObserver = new ResizeObserver(syncSize);
  resizeObserver.observe(container);

  const updatePointerPosition = (event) => {
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

  const handlePointerDown = (event) => {
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

  const handlePointerMove = (event) => {
    updatePointerPosition(event);
  };

  const handleWindowPointerMove = (event) => {
    updatePointerPosition(event);

    if (!interaction.dragging || !followDragEnabled) {
      return;
    }

    const deltaX = (event.clientX - interaction.pointerX) * settings.animation.dragSens;
    const deltaY = (event.clientY - interaction.pointerY) * settings.animation.dragSens;
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

    const springImpulse = Math.max(settings.animation.springStrength * 10, 1.2);
    interaction.rotationVelocityX += interaction.velocityX * springImpulse;
    interaction.rotationVelocityY += interaction.velocityY * springImpulse;
    interaction.rotationVelocityZ += interaction.velocityY * springImpulse * 0.12;
    interaction.targetRotationX = 0;
    interaction.targetRotationY = 0;
    interaction.velocityX = 0;
    interaction.velocityY = 0;
  };

  const handlePointerCancel = () => {
    interaction.dragging = false;
    interaction.velocityX = 0;
    interaction.velocityY = 0;
    canvas.style.cursor = followDragEnabled ? 'grab' : 'default';
    handlePointerLeave();
  };

  const handleWindowBlur = () => {
    handlePointerUp();
    handlePointerLeave();
  };

  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerleave', handlePointerLeave);
  canvas.addEventListener('pointercancel', handlePointerCancel);
  window.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('pointermove', handleWindowPointerMove);
  window.addEventListener('blur', handleWindowBlur);
  canvas.addEventListener('pointerdown', handlePointerDown);

  const clock = new THREE.Timer();
  clock.connect(document);
  let animationFrameId = 0;

  const renderFrame = (timestamp) => {
    animationFrameId = window.requestAnimationFrame(renderFrame);
    clock.update(timestamp);

    const delta = 1 / 60;
    const elapsedTime = initialPose.timeElapsed + clock.getElapsed();
    halftoneMaterial.uniforms.time.value = elapsedTime;

    let baseRotationX = initialPose.rotationX;
    let baseRotationY = initialPose.rotationY;
    let baseRotationZ = initialPose.rotationZ;
    let meshOffsetY = 0;
    let meshScale = 1;
    let lightAngle = settings.lighting.angleDegrees;
    let lightHeight = settings.lighting.height;

    if (autoRotateEnabled) {
      interaction.autoElapsed += delta;
      baseRotationY += interaction.autoElapsed * settings.animation.autoSpeed;
      baseRotationX += Math.sin(interaction.autoElapsed * 0.2) * settings.animation.autoWobble;
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
        ? Math.sin(interaction.rotateElapsed * settings.animation.rotateSpeed) * Math.PI
        : interaction.rotateElapsed * settings.animation.rotateSpeed;

      if (settings.animation.rotatePreset === 'axis') {
        const axisDirection =
          settings.animation.rotateAxis.startsWith('-') ? -1 : 1;
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

    if (settings.animation.cameraParallaxEnabled) {
      const cameraRange = settings.animation.cameraParallaxAmount;
      const cameraEase = settings.animation.cameraParallaxEase;
      const centeredX = (interaction.mouseX - 0.5) * 2;
      const centeredY = (0.5 - interaction.mouseY) * 2;
      const orbitYaw = centeredX * cameraRange;
      const orbitPitch = centeredY * cameraRange * 0.7;
      const horizontalRadius = Math.cos(orbitPitch) * baseCameraDistance;
      const targetCameraX = Math.sin(orbitYaw) * horizontalRadius;
      const targetCameraY =
        Math.sin(orbitPitch) * baseCameraDistance * 0.85;
      const targetCameraZ = Math.cos(orbitYaw) * horizontalRadius;

      camera.position.x += (targetCameraX - camera.position.x) * cameraEase;
      camera.position.y += (targetCameraY - camera.position.y) * cameraEase;
      camera.position.z += (targetCameraZ - camera.position.z) * cameraEase;
    } else {
      camera.position.x += (0 - camera.position.x) * 0.12;
      camera.position.y += (0 - camera.position.y) * 0.12;
      camera.position.z += (baseCameraDistance - camera.position.z) * 0.12;
    }

    const lookAtTarget = new THREE.Vector3(0, meshOffsetY * 0.2, 0);

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
    clock.dispose();
    resizeObserver.disconnect();
    canvas.removeEventListener('pointermove', handlePointerMove);
    canvas.removeEventListener('pointerleave', handlePointerLeave);
    window.removeEventListener('pointerup', handlePointerUp);
    window.removeEventListener('pointermove', handleWindowPointerMove);
    canvas.removeEventListener('pointercancel', handlePointerCancel);
    window.removeEventListener('blur', handleWindowBlur);
    canvas.removeEventListener('pointerdown', handlePointerDown);
    blurHorizontalMaterial.dispose();
    blurVerticalMaterial.dispose();
    halftoneMaterial.dispose();
    fullScreenGeometry.dispose();
    material.dispose();
    sceneTarget.dispose();
    blurTargetA.dispose();
    blurTargetB.dispose();
    disposeHalftoneMaterialAssets(materialAssets);
    renderer.dispose();

    if (canvas.parentNode === container) {
      container.removeChild(canvas);
    }
  };
}
`;
}

function createImageMountScript() {
  return `
async function mountHalftoneCanvas(options) {
  const {
    container,
    imageUrl,
    onError,
  } = options;

  const getWidth = () => Math.max(container.clientWidth, 1);
  const getHeight = () => Math.max(container.clientHeight, 1);
  const getVirtualHeight = () => Math.max(VIRTUAL_RENDER_HEIGHT, getHeight());
  const getVirtualWidth = () =>
    Math.max(
      Math.round(getVirtualHeight() * (getWidth() / Math.max(getHeight(), 1))),
      1,
    );

  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });

  // boundary-allow-next-line:no-raw-webgl-renderer -- emitted into the standalone HTML export; runs in the user's downloaded file with no access to lib/visual-runtime
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(getVirtualWidth(), getVirtualHeight(), false);

  const canvas = renderer.domElement;
  canvas.style.cursor = 'default';
  canvas.style.display = 'block';
  canvas.style.height = '100%';
  canvas.style.touchAction = 'none';
  canvas.style.width = '100%';
  container.appendChild(canvas);

  const imageTexture = new THREE.Texture(image);
  imageTexture.colorSpace = THREE.SRGBColorSpace;
  imageTexture.needsUpdate = true;

  const sceneTarget = createRenderTarget(getVirtualWidth(), getVirtualHeight());
  const blurTargetA = createRenderTarget(getVirtualWidth(), getVirtualHeight());
  const blurTargetB = createRenderTarget(getVirtualWidth(), getVirtualHeight());
  const fullScreenGeometry = new THREE.PlaneGeometry(2, 2);
  const orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const imageMaterial = new THREE.ShaderMaterial({
    uniforms: {
      tImage: { value: imageTexture },
      imageSize: { value: new THREE.Vector2(image.width, image.height) },
      viewportSize: { value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()) },
      zoom: { value: getImagePreviewZoom(previewDistance) },
      contrast: { value: settings.halftone.imageContrast },
    },
    vertexShader: passThroughVertexShader,
    fragmentShader: imagePassthroughFragmentShader,
  });

  const imageScene = new THREE.Scene();
  imageScene.add(new THREE.Mesh(fullScreenGeometry, imageMaterial));

  const blurHorizontalMaterial = new THREE.ShaderMaterial({
    uniforms: {
      tInput: { value: null },
      dir: { value: new THREE.Vector2(1, 0) },
      res: { value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()) },
    },
    vertexShader: passThroughVertexShader,
    fragmentShader: blurFragmentShader,
  });

  const blurVerticalMaterial = new THREE.ShaderMaterial({
    uniforms: {
      tInput: { value: null },
      dir: { value: new THREE.Vector2(0, 1) },
      res: { value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()) },
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
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      logicalResolution: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      tile: { value: settings.halftone.scale },
      s_3: { value: settings.halftone.power },
      s_4: { value: settings.halftone.width },
      applyToDarkAreas: {
        value: settings.halftone.toneTarget === 'dark' ? 1 : 0,
      },
      dashColor: { value: new THREE.Color(settings.halftone.dashColor) },
      hoverDashColor: {
        value: new THREE.Color(settings.halftone.hoverDashColor),
      },
      time: { value: 0 },
      waveAmount: { value: 0 },
      waveSpeed: { value: settings.animation.waveSpeed },
      footprintScale: { value: 1.0 },
      interactionUv: { value: new THREE.Vector2(0.5, 0.5) },
      interactionVelocity: { value: new THREE.Vector2(0, 0) },
      dragOffset: { value: new THREE.Vector2(0, 0) },
      hoverHalftoneActive: { value: 0 },
      hoverHalftonePowerShift: { value: 0 },
      hoverHalftoneRadius: { value: settings.animation.hoverHalftoneRadius },
      hoverHalftoneWidthShift: { value: 0 },
      hoverLightStrength: { value: 0 },
      hoverLightRadius: { value: settings.animation.hoverLightRadius },
      hoverFlowStrength: { value: 0 },
      hoverFlowRadius: { value: 0.18 },
      dragFlowStrength: { value: 0 },
      cropToBounds: { value: 1 },
    },
    vertexShader: passThroughVertexShader,
    fragmentShader: halftoneFragmentShader,
  });

  const blurHorizontalScene = new THREE.Scene();
  blurHorizontalScene.add(new THREE.Mesh(fullScreenGeometry, blurHorizontalMaterial));

  const blurVerticalScene = new THREE.Scene();
  blurVerticalScene.add(new THREE.Mesh(fullScreenGeometry, blurVerticalMaterial));

  const postScene = new THREE.Scene();
  postScene.add(new THREE.Mesh(fullScreenGeometry, halftoneMaterial));

  const updateViewportUniforms = (
    logicalWidth,
    logicalHeight,
    effectWidth,
    effectHeight,
  ) => {
    blurHorizontalMaterial.uniforms.res.value.set(effectWidth, effectHeight);
    blurVerticalMaterial.uniforms.res.value.set(effectWidth, effectHeight);
    halftoneMaterial.uniforms.effectResolution.value.set(
      effectWidth,
      effectHeight,
    );
    halftoneMaterial.uniforms.logicalResolution.value.set(
      logicalWidth,
      logicalHeight,
    );
    imageMaterial.uniforms.viewportSize.value.set(logicalWidth, logicalHeight);
  };

  const getHalftoneScale = () =>
    getImageFootprintScale({
      imageHeight: image.height,
      imageWidth: image.width,
      previewDistance,
      viewportHeight: getVirtualHeight(),
      viewportWidth: getVirtualWidth(),
    });

  const interaction = createInteractionState();
  const imagePointerFollow = 0.38;
  const imagePointerVelocityDamping = 0.82;
  const imageHoverFadeIn = 18;
  const imageHoverFadeOut = 7;

  const syncSize = () => {
    const virtualWidth = getVirtualWidth();
    const virtualHeight = getVirtualHeight();

    renderer.setSize(virtualWidth, virtualHeight, false);
    sceneTarget.setSize(virtualWidth, virtualHeight);
    blurTargetA.setSize(virtualWidth, virtualHeight);
    blurTargetB.setSize(virtualWidth, virtualHeight);
    updateViewportUniforms(
      virtualWidth,
      virtualHeight,
      virtualWidth,
      virtualHeight,
    );
  };

  const resizeObserver = new ResizeObserver(syncSize);
  resizeObserver.observe(container);

  const updatePointerPosition = (event, options = {}) => {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(rect.width, 1);
    const height = Math.max(rect.height, 1);

    const nextMouseX = THREE.MathUtils.clamp(
      (event.clientX - rect.left) / width, 0, 1,
    );
    const nextMouseY = THREE.MathUtils.clamp(
      (event.clientY - rect.top) / height, 0, 1,
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

    if (options.resetVelocity) {
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

  const releasePointerCapture = (pointerId) => {
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

  const handlePointerDown = (event) => {
    updatePointerPosition(event, { resetVelocity: true });
    interaction.pointerX = event.clientX;
    interaction.pointerY = event.clientY;
  };

  const handlePointerMove = (event) => {
    const resetVelocity = !interaction.pointerInside && !interaction.dragging;
    updatePointerPosition(
      event,
      resetVelocity ? { resetVelocity: true } : undefined,
    );
  };

  const handlePointerLeave = () => {
    if (interaction.dragging) {
      return;
    }

    interaction.pointerInside = false;
    interaction.pointerVelocityX = 0;
    interaction.pointerVelocityY = 0;
  };

  const handlePointerUp = (event) => {
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
  };

  const handlePointerCancel = () => {
    releasePointerCapture(interaction.activePointerId);
    interaction.activePointerId = null;
    interaction.dragging = false;
    interaction.pointerInside = false;
    interaction.pointerVelocityX = 0;
    interaction.pointerVelocityY = 0;
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
  let animationFrameId = 0;

  const renderFrame = (timestamp) => {
    animationFrameId = window.requestAnimationFrame(renderFrame);
    clock.update(timestamp);

    const deltaSeconds = clock.getDelta();
    const elapsedTime = clock.getElapsed();
    halftoneMaterial.uniforms.time.value = elapsedTime;
    const hoverEasing =
      1 -
      Math.exp(
        -deltaSeconds *
          (interaction.pointerInside ? imageHoverFadeIn : imageHoverFadeOut),
      );
    interaction.hoverStrength +=
      ((interaction.pointerInside ? 1 : 0) - interaction.hoverStrength) *
      hoverEasing;

    interaction.smoothedMouseX +=
      (interaction.mouseX - interaction.smoothedMouseX) * imagePointerFollow;
    interaction.smoothedMouseY +=
      (interaction.mouseY - interaction.smoothedMouseY) * imagePointerFollow;
    interaction.pointerVelocityX *= imagePointerVelocityDamping;
    interaction.pointerVelocityY *= imagePointerVelocityDamping;

    halftoneMaterial.uniforms.interactionUv.value.set(
      interaction.smoothedMouseX,
      1 - interaction.smoothedMouseY,
    );
    halftoneMaterial.uniforms.interactionVelocity.value.set(
      interaction.pointerVelocityX * getVirtualWidth(),
      -interaction.pointerVelocityY * getVirtualHeight(),
    );
    halftoneMaterial.uniforms.dragOffset.value.set(0, 0);
    halftoneMaterial.uniforms.hoverHalftoneActive.value =
      settings.animation.hoverHalftoneEnabled ? interaction.hoverStrength : 0;
    halftoneMaterial.uniforms.hoverHalftonePowerShift.value =
      settings.animation.hoverHalftoneEnabled
        ? settings.animation.hoverHalftonePowerShift
        : 0;
    halftoneMaterial.uniforms.hoverHalftoneRadius.value =
      settings.animation.hoverHalftoneRadius;
    halftoneMaterial.uniforms.hoverHalftoneWidthShift.value =
      settings.animation.hoverHalftoneEnabled
        ? settings.animation.hoverHalftoneWidthShift
        : 0;
    halftoneMaterial.uniforms.hoverLightStrength.value =
      settings.animation.hoverLightEnabled
        ? settings.animation.hoverLightIntensity * interaction.hoverStrength
        : 0;
    halftoneMaterial.uniforms.hoverLightRadius.value =
      settings.animation.hoverLightRadius;
    halftoneMaterial.uniforms.hoverFlowStrength.value = 0;
    halftoneMaterial.uniforms.hoverFlowRadius.value = 0.18;
    halftoneMaterial.uniforms.dragFlowStrength.value = 0;
    imageMaterial.uniforms.zoom.value = getImagePreviewZoom(previewDistance);
    halftoneMaterial.uniforms.footprintScale.value = getHalftoneScale();

    renderer.setRenderTarget(sceneTarget);
    renderer.render(imageScene, orthographicCamera);

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
    clock.dispose();
    resizeObserver.disconnect();
    canvas.removeEventListener('pointermove', handlePointerMove);
    canvas.removeEventListener('pointerleave', handlePointerLeave);
    canvas.removeEventListener('pointerup', handlePointerUp);
    canvas.removeEventListener('pointercancel', handlePointerCancel);
    window.removeEventListener('blur', handleWindowBlur);
    canvas.removeEventListener('pointerdown', handlePointerDown);
    blurHorizontalMaterial.dispose();
    blurVerticalMaterial.dispose();
    halftoneMaterial.dispose();
    imageMaterial.dispose();
    imageTexture.dispose();
    fullScreenGeometry.dispose();
    sceneTarget.dispose();
    blurTargetA.dispose();
    blurTargetB.dispose();
    renderer.dispose();

    if (canvas.parentNode === container) {
      container.removeChild(canvas);
    }
  };
}
`;
}

export function getExportedModelFile(
  shape: HalftoneGeometrySpec | undefined,
  importedFile: File | undefined,
) {
  if (!shape || shape.kind !== 'imported' || !importedFile) {
    return null;
  }

  return importedFile;
}

export function generateReactComponent(
  settings: HalftoneStudioSettings,
  selectedShape: HalftoneGeometrySpec | undefined,
  componentName = 'HalftoneDashes',
  options: ReactExportOptions = {},
) {
  const isImageMode = settings.sourceMode === 'image';
  const exportSettings = normalizeReactExportSettings(options.exportSettings);
  const shape = createShapeDescriptor(
    selectedShape,
    settings,
    options.importedFile,
    options.modelFilenameOverride,
  );
  const pose = normalizeExportPose(options.initialPose);
  const normalizedComponentName = normalizeExportComponentName(componentName);
  const background = options.background ?? 'transparent';
  const assetUrl =
    exportSettings.includePublicAssetUrl && options.assetUrl
      ? options.assetUrl
      : null;
  const defaultModelFilename =
    options.modelFilenameOverride ?? shape.filename ?? 'model.glb';
  const defaultImageFilename = options.imageFilename ?? 'image.png';
  const defaultModelUrl = assetUrl ?? `./${defaultModelFilename}`;
  const defaultImageUrl = assetUrl ?? `./${defaultImageFilename}`;
  const importBlock = getReactImportBlock(exportSettings, isImageMode, shape);
  const headerComment = exportSettings.includeRegistryComment
    ? getTwentyReactHeaderComment(
        normalizedComponentName,
        toIllustrationRegistryKey(normalizedComponentName),
        isImageMode || shape.kind === 'imported'
          ? (assetUrl ?? undefined)
          : undefined,
      )
    : '';
  const mountScript = isImageMode
    ? createImageMountScript()
    : createMountScript();
  const serializedRuntime = serializeRuntimeSource(
    settings,
    shape,
    pose,
    options.previewDistance,
  );
  const generatedBanner = exportSettings.includeTsNoCheck
    ? `/**
 * @generated halftone-studio
 * This file is autogenerated by the in-app halftone studio
 * (src/app/halftone). Do NOT hand-edit — regenerate the export
 * from the studio if the visual or runtime behaviour needs to change.
 *
 * Type checking is disabled at the file level because the serialized
 * Three.js runtime below contains thousands of lines of legacy
 * implicitly-typed code that the generator does not annotate. See
 * src/app/halftone/_lib/exporters.ts for the generator source.
 */
// @ts-nocheck`
    : null;
  const directiveLines = [
    generatedBanner,
    exportSettings.includeUseClientDirective ? "'use client';" : null,
  ]
    .filter((line): line is string => line !== null)
    .join('\n');
  const mountStyleBlock = exportSettings.includeStyledMount
    ? `const StyledVisualMount = styled.div\`
  background: ${background};
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
\`;
`
    : '';
  const assetPropName = isImageMode
    ? 'imageUrl'
    : shape.kind === 'imported'
      ? 'modelUrl'
      : null;
  const assetPropDefaultValue =
    assetPropName === 'imageUrl'
      ? defaultImageUrl
      : assetPropName === 'modelUrl'
        ? defaultModelUrl
        : null;
  const propsTypeBlock = assetPropName
    ? `type ${normalizedComponentName}Props = {\n  ${assetPropName}?: string;\n  style?: CSSProperties;\n};`
    : `type ${normalizedComponentName}Props = {\n  style?: CSSProperties;\n};`;
  const propsSignature = assetPropName
    ? `{\n  ${assetPropName} = ${JSON.stringify(assetPropDefaultValue)},\n  style,\n}: ${normalizedComponentName}Props`
    : `{\n  style,\n}: ${normalizedComponentName}Props`;
  const mountOptionsBlock = assetPropName
    ? `const unmount = mountHalftoneCanvas({\n      container,\n      ${assetPropName},\n      onError: (error) => {\n        console.error(error);\n      },\n    });`
    : `const unmount = mountHalftoneCanvas({\n      container,\n      onError: (error) => {\n        console.error(error);\n      },\n    });`;
  const effectDependencies = assetPropName ? `[${assetPropName}]` : '[]';
  const returnBlock = exportSettings.includeStyledMount
    ? `return <StyledVisualMount aria-hidden ref={mountReference} style={style} />;`
    : `return (
    <div
      ref={mountReference}
      style={{
        background: ${JSON.stringify(background)},
        height: '100%',
        width: '100%',
        ...style,
      }}
    />
  );`;
  const componentFunctionBlock = exportSettings.includeNamedAndDefaultExport
    ? `export function ${normalizedComponentName}(${propsSignature}) {
  const mountReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountReference.current;

    if (!container) {
      return;
    }

    ${mountOptionsBlock}

    return () => {
      void Promise.resolve(unmount).then((dispose) => dispose?.());
    };
  }, ${effectDependencies});

  ${returnBlock}
}

export default ${normalizedComponentName};`
    : `export default function ${normalizedComponentName}(${propsSignature}) {
  const mountReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountReference.current;

    if (!container) {
      return;
    }

    ${mountOptionsBlock}

    return () => {
      void Promise.resolve(unmount).then((dispose) => dispose?.());
    };
  }, ${effectDependencies});

  ${returnBlock}
}`;

  return `${directiveLines ? `${directiveLines}\n\n` : ''}${importBlock}

${headerComment}${serializedRuntime}

${mountScript}

${mountStyleBlock ? `${mountStyleBlock}\n` : ''}${propsTypeBlock}

${componentFunctionBlock}
`;
}

export async function generateStandaloneHtml(
  settings: HalftoneStudioSettings,
  selectedShape: HalftoneGeometrySpec | undefined,
  componentName = 'HalftoneDashes',
  options: ReactExportOptions = {},
) {
  const isImageMode = settings.sourceMode === 'image';
  const shape = createShapeDescriptor(
    selectedShape,
    settings,
    options.importedFile,
    options.modelFilenameOverride,
  );
  const pose = normalizeExportPose(options.initialPose);
  const normalizedComponentName = normalizeExportComponentName(componentName);
  const defaultImageUrl = options.imageFilename ?? 'image.png';
  const embeddedImportedModelUrl =
    !isImageMode && shape.kind === 'imported' && options.importedFile
      ? await fileToDataUrl(options.importedFile, shape.loader)
      : null;
  const defaultModelUrl =
    embeddedImportedModelUrl ??
    options.modelFilenameOverride ??
    shape.filename ??
    'model.glb';
  const background = options.background ?? 'transparent';

  const threeImports = getStandaloneThreeImports(isImageMode, shape);

  const mountScript = isImageMode
    ? createImageMountScript()
    : createMountScript();

  const mountCall = isImageMode
    ? `mountHalftoneCanvas({
        container,
        imageUrl: ${JSON.stringify(`./${defaultImageUrl}`)},
        onError: (error) => {
          console.error(error);
        },
      });`
    : `mountHalftoneCanvas({
        container,
        modelUrl: ${JSON.stringify(`./${defaultModelUrl}`)},
        onError: (error) => {
          console.error(error);
        },
      });`;

  const captionText = isImageMode
    ? `Place <code>${defaultImageUrl}</code> next to this HTML file.`
    : `Standalone export of the current halftone scene.
        ${
          shape.kind === 'imported'
            ? embeddedImportedModelUrl
              ? 'The uploaded model is embedded directly in this HTML file.'
              : `Place <code>${defaultModelUrl}</code> next to this HTML file to keep the current uploaded shape.`
            : ''
        }`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${normalizedComponentName}</title>
    <link rel="icon" href="data:," />
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      html,
      body {
        height: 100%;
      }

      body {
        background: ${background};
        color: rgba(255, 255, 255, 0.72);
        font-family: system-ui, sans-serif;
        overflow: hidden;
      }

      #app {
        height: 100%;
        width: 100%;
      }

      #canvas-root {
        height: 100%;
        width: 100%;
      }

      .caption {
        background: rgba(18, 18, 22, 0.72);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        bottom: 20px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 12px;
        left: 20px;
        line-height: 1.5;
        max-width: min(320px, calc(100vw - 40px));
        padding: 12px 14px;
        position: fixed;
      }

      .caption code {
        color: #9d90fa;
        font-family: ui-monospace, monospace;
      }
    </style>
  </head>
  <body>
    <div id="app">
      <div id="canvas-root"></div>
      <div class="caption">
        ${captionText}
      </div>
    </div>

    <script type="importmap">
      {
        "imports": {
          "three": "https://unpkg.com/three@0.183.2/build/three.module.js",
          "three/addons/": "https://unpkg.com/three@0.183.2/examples/jsm/"
        }
      }
    </script>
    <script type="module">
      ${threeImports}

      ${serializeRuntimeSource(settings, shape, pose, options.previewDistance)}

      ${mountScript}

      const container = document.getElementById('canvas-root');

      ${mountCall}
    </script>
  </body>
</html>`;
}
