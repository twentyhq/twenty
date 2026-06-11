import * as THREE from 'three';

import {
  createVisualFrameLoop,
  type VisualFrame,
} from '../engine/create-visual-frame-loop';
import { createVisualRenderer } from '../three-runtime/create-visual-renderer';
import { BLUR_PASS_SHADERS } from './blur-pass-shaders';
import { createRenderTarget } from './create-render-target';
import { HALFTONE_CONSTANTS } from './halftone-constants';
import { createVirtualSize } from './virtual-size';
import { HALFTONE_PASS_SHADER } from './halftone-pass-shader';
import { IMAGE_PASS_SHADER } from './image-pass-shader';

// (The band composite never samples a glow buffer: image sessions run a
// single image pass straight into the composite — no blur chain.)

export type ImageSession = {
  dispose: () => void;
};

export type ImageSessionSettings = {
  // Camera-distance metaphor kept from the model path: zoom is
  // REFERENCE / previewDistance.
  previewDistance: number;
  imageFit: 'contain' | 'cover' | 'width';
  // 'width' fit letterboxes against this edge (0 bottom, 0.5 center, 1 top).
  verticalAnchor?: number;
  // Dash response inverts: dark areas grow dashes (the hero bridge).
  applyToDarkAreas?: boolean;
  contrast: number;
  halftone: {
    scale: number;
    power: number;
    width: number;
    // Floors the band radius so dark regions keep a base dash presence.
    minimumTone: number;
    dashColor: number;
    hoverDashColor: number;
  };
  hover: {
    halftoneEnabled: boolean;
    halftonePowerShift: number;
    halftoneRadius: number;
    halftoneWidthShift: number;
    lightEnabled: boolean;
    lightIntensity: number;
    lightRadius: number;
    // Fades the hover light toward the top/bottom canvas edges (0 = off).
    lightVerticalFade?: number;
    fadeIn: number;
    fadeOut: number;
  };
  // Re-evaluated every frame so the framing follows the live viewport
  // (the hero re-tunes zoom/offsets across its authored breakpoints).
  responsiveFrame?: () => {
    previewDistance: number;
    verticalAnchor: number;
    verticalOffsetPx: number;
    horizontalOffsetPx: number;
  };
  // Pointer events whose target sits inside this selector read as outside
  // (the hero's copy block opts out of the hover light).
  pointerExcludeSelector?: string;
  // Backdrops behind pointer-events-none layers track the WINDOW (the old
  // hero's binding); coordinates still resolve against the pointer root.
  pointerScope?: 'root' | 'window';
  pointer: {
    follow: number;
    velocityDamping: number;
  };
  wave: {
    enabled: boolean;
    amount: number;
    speed: number;
  };
};

type CreateImageSessionOptions = {
  container: HTMLElement;
  image: HTMLImageElement;
  settings: ImageSessionSettings;
  // Pointer interaction can track a wider ancestor (the stepper's whole
  // visual area) so hover responds before the cursor reaches the canvas.
  pointerRootSelector?: string;
  reducedMotion?: boolean;
  onFirstFrame?: () => void;
};

const REFERENCE_PREVIEW_DISTANCE = HALFTONE_CONSTANTS.referencePreviewDistance;
const MIN_FOOTPRINT_SCALE = HALFTONE_CONSTANTS.minFootprintScale;

// Image footprint: dash density holds the authored relationship to the
// image's fitted rect at the reference zoom.
function getContainedImageRect({
  imageFit,
  imageWidth,
  imageHeight,
  viewportWidth,
  viewportHeight,
  zoom,
}: {
  imageFit: 'contain' | 'cover' | 'width';
  imageWidth: number;
  imageHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  zoom: number;
}) {
  if (
    imageWidth <= 0 ||
    imageHeight <= 0 ||
    viewportWidth <= 0 ||
    viewportHeight <= 0
  ) {
    return null;
  }

  const imageAspect = imageWidth / imageHeight;
  const viewAspect = viewportWidth / viewportHeight;

  let fittedWidth = viewportWidth;
  let fittedHeight = viewportHeight;

  if (imageAspect > viewAspect) {
    if (imageFit === 'cover' || imageFit === 'width') {
      fittedWidth = viewportHeight * imageAspect;
    } else {
      fittedHeight = viewportWidth / imageAspect;
    }
  } else {
    if (imageFit === 'cover' || imageFit === 'width') {
      fittedHeight = viewportWidth / imageAspect;
    } else {
      fittedWidth = viewportHeight * imageAspect;
    }
  }

  const scaledWidth = fittedWidth * zoom;
  const scaledHeight = fittedHeight * zoom;
  const minX = Math.max((viewportWidth - scaledWidth) * 0.5, 0);
  const minY = Math.max((viewportHeight - scaledHeight) * 0.5, 0);
  const maxX = Math.min(
    (viewportWidth - scaledWidth) * 0.5 + scaledWidth,
    viewportWidth,
  );
  const maxY = Math.min(
    (viewportHeight - scaledHeight) * 0.5 + scaledHeight,
    viewportHeight,
  );
  if (maxX <= minX || maxY <= minY) {
    return null;
  }
  return { width: maxX - minX, height: maxY - minY };
}

function getImageFootprintScale({
  imageFit,
  imageWidth,
  imageHeight,
  viewportWidth,
  viewportHeight,
  previewDistance,
}: {
  imageFit: 'contain' | 'cover';
  imageWidth: number;
  imageHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  previewDistance: number;
}) {
  const zoom = REFERENCE_PREVIEW_DISTANCE / Math.max(previewDistance, 0.001);
  const currentRect = getContainedImageRect({
    imageFit,
    imageWidth,
    imageHeight,
    viewportWidth,
    viewportHeight,
    zoom,
  });
  const referenceRect = getContainedImageRect({
    imageFit,
    imageWidth,
    imageHeight,
    viewportWidth,
    viewportHeight,
    zoom: 1,
  });
  const currentArea = currentRect ? currentRect.width * currentRect.height : 0;
  const referenceArea = referenceRect
    ? referenceRect.width * referenceRect.height
    : 0;
  if (currentArea <= 0 || referenceArea <= 0) {
    return 1;
  }
  return Math.max(Math.sqrt(currentArea / referenceArea), MIN_FOOTPRINT_SCALE);
}

// The image-backdrop scene: image pass -> blur chain -> band composite,
// with pointer-follow hover light/flow. One rig replaces the old site's
// four ~700-line per-backdrop hooks.
export function createImageSession({
  container,
  image,
  settings,
  pointerRootSelector,
  reducedMotion = false,
  onFirstFrame,
}: CreateImageSessionOptions): ImageSession | null {
  const { getVirtualWidth, getVirtualHeight } = createVirtualSize(container);

  const renderer = createVisualRenderer({ antialias: false, alpha: true });
  if (renderer === null) {
    return null;
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(getVirtualWidth(), getVirtualHeight(), false);

  const canvas = renderer.domElement;
  canvas.style.display = 'block';
  canvas.style.height = '100%';
  canvas.style.width = '100%';
  container.appendChild(canvas);

  const imageTexture = new THREE.Texture(image);
  imageTexture.wrapS = THREE.ClampToEdgeWrapping;
  imageTexture.wrapT = THREE.ClampToEdgeWrapping;
  imageTexture.generateMipmaps = false;
  imageTexture.minFilter = THREE.LinearFilter;
  imageTexture.magFilter = THREE.LinearFilter;
  imageTexture.colorSpace = THREE.SRGBColorSpace;
  imageTexture.needsUpdate = true;

  const zoom =
    REFERENCE_PREVIEW_DISTANCE / Math.max(settings.previewDistance, 0.001);

  const sceneTarget = createRenderTarget(getVirtualWidth(), getVirtualHeight());
  const fullScreenGeometry = new THREE.PlaneGeometry(2, 2);
  const orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const imageMaterial = new THREE.ShaderMaterial({
    uniforms: {
      tImage: { value: imageTexture },
      imageSize: {
        value: new THREE.Vector2(image.naturalWidth, image.naturalHeight),
      },
      viewportSize: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      zoom: { value: zoom },
      contrast: { value: settings.contrast },
      imageFit: {
        value:
          settings.imageFit === 'width'
            ? 2
            : settings.imageFit === 'cover'
              ? 1
              : 0,
      },
      verticalAnchor: { value: settings.verticalAnchor ?? 0.5 },
      verticalPixelOffset: { value: 0 },
      horizontalPixelOffset: { value: 0 },
    },
    vertexShader: BLUR_PASS_SHADERS.vertex,
    fragmentShader: IMAGE_PASS_SHADER.fragment,
  });

  const halftoneMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      tScene: { value: sceneTarget.texture },
      tGlow: { value: sceneTarget.texture },
      effectResolution: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      logicalResolution: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      tile: { value: settings.halftone.scale },
      s_3: { value: settings.halftone.power },
      s_4: { value: settings.halftone.width },
      applyToDarkAreas: { value: settings.applyToDarkAreas ? 1 : 0 },
      hoverLightVerticalFade: {
        value: settings.hover.lightVerticalFade ?? 0,
      },
      minimumTone: { value: settings.halftone.minimumTone },
      dashColor: { value: new THREE.Color(settings.halftone.dashColor) },
      hoverDashColor: {
        value: new THREE.Color(settings.halftone.hoverDashColor),
      },
      time: { value: 0 },
      waveAmount: { value: settings.wave.enabled ? settings.wave.amount : 0 },
      waveSpeed: { value: settings.wave.speed },
      footprintScale: { value: 1 },
      interactionUv: { value: new THREE.Vector2(0.5, 0.5) },
      interactionVelocity: { value: new THREE.Vector2(0, 0) },
      dragOffset: { value: new THREE.Vector2(0, 0) },
      hoverHalftoneActive: { value: 0 },
      hoverHalftonePowerShift: { value: 0 },
      hoverHalftoneRadius: { value: settings.hover.halftoneRadius },
      hoverHalftoneWidthShift: { value: 0 },
      hoverLightStrength: { value: 0 },
      hoverLightRadius: { value: settings.hover.lightRadius },
      hoverFlowStrength: { value: 0 },
      hoverFlowRadius: { value: 0.18 },
      dragFlowStrength: { value: 0 },
      cropToBounds: { value: 1 },
    },
    vertexShader: BLUR_PASS_SHADERS.vertex,
    fragmentShader: HALFTONE_PASS_SHADER.fragment,
  });

  const imageScene = new THREE.Scene();
  imageScene.add(new THREE.Mesh(fullScreenGeometry, imageMaterial));
  const postScene = new THREE.Scene();
  postScene.add(new THREE.Mesh(fullScreenGeometry, halftoneMaterial));

  // Pointer state for the hover light: normalized position smoothed by the
  // follow factor; strength fades with the authored exp easing.
  const pointer = {
    inside: false,
    mouseX: 0.5,
    mouseY: 0.5,
    smoothedX: 0.5,
    smoothedY: 0.5,
    velocityX: 0,
    velocityY: 0,
    hoverStrength: 0,
  };

  const syncFootprint = () => {
    // The old pipeline computes the footprint from the CONTAIN rect even
    // when the shader cover-crops — dash density follows the contained
    // image, not the crop (read from the full monolith mount).
    halftoneMaterial.uniforms.footprintScale.value = getImageFootprintScale({
      imageFit: 'contain',
      imageWidth: image.naturalWidth,
      imageHeight: image.naturalHeight,
      viewportWidth: getVirtualWidth(),
      viewportHeight: getVirtualHeight(),
      previewDistance: settings.previewDistance,
    });
  };

  const syncSize = () => {
    const virtualWidth = getVirtualWidth();
    const virtualHeight = getVirtualHeight();
    renderer.setSize(virtualWidth, virtualHeight, false);
    sceneTarget.setSize(virtualWidth, virtualHeight);
    imageMaterial.uniforms.viewportSize.value.set(virtualWidth, virtualHeight);
    halftoneMaterial.uniforms.effectResolution.value.set(
      virtualWidth,
      virtualHeight,
    );
    halftoneMaterial.uniforms.logicalResolution.value.set(
      virtualWidth,
      virtualHeight,
    );
    syncFootprint();
  };
  syncFootprint();

  const pointerRoot: HTMLElement =
    (pointerRootSelector
      ? (container.closest(pointerRootSelector) as HTMLElement | null)
      : null) ?? (container as HTMLElement);

  const handlePointerMove = (event: PointerEvent) => {
    if (
      settings.pointerExcludeSelector &&
      event.target instanceof Element &&
      event.target.closest(settings.pointerExcludeSelector)
    ) {
      pointer.inside = false;
      return;
    }
    const rect = pointerRoot.getBoundingClientRect();
    const enteredJustNow = !pointer.inside;
    const nextMouseX = THREE.MathUtils.clamp(
      (event.clientX - rect.left) / Math.max(rect.width, 1),
      0,
      1,
    );
    const nextMouseY = THREE.MathUtils.clamp(
      (event.clientY - rect.top) / Math.max(rect.height, 1),
      0,
      1,
    );
    const deltaX = nextMouseX - pointer.mouseX;
    const deltaY = nextMouseY - pointer.mouseY;
    pointer.mouseX = nextMouseX;
    pointer.mouseY = nextMouseY;
    pointer.inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (enteredJustNow) {
      // Re-entry must not inherit the exit velocity (ported behavior).
      pointer.velocityX = 0;
      pointer.velocityY = 0;
      pointer.smoothedX = nextMouseX;
      pointer.smoothedY = nextMouseY;
      return;
    }
    pointer.velocityX = deltaX;
    pointer.velocityY = deltaY;
  };

  const handlePointerLeave = () => {
    pointer.inside = false;
    pointer.velocityX = 0;
    pointer.velocityY = 0;
  };

  const pointerEventTarget: GlobalEventHandlers =
    settings.pointerScope === 'window' ? window : pointerRoot;
  if (!reducedMotion) {
    pointerEventTarget.addEventListener('pointermove', handlePointerMove);
    pointerEventTarget.addEventListener('pointerleave', handlePointerLeave);
  }

  let firstFrameNotified = false;

  const renderFrame = ({ deltaSeconds, elapsedSeconds }: VisualFrame) => {
    halftoneMaterial.uniforms.time.value = elapsedSeconds;

    const hoverEasing =
      1 -
      Math.exp(
        -deltaSeconds *
          (pointer.inside ? settings.hover.fadeIn : settings.hover.fadeOut),
      );
    pointer.hoverStrength +=
      ((pointer.inside ? 1 : 0) - pointer.hoverStrength) * hoverEasing;
    pointer.smoothedX +=
      (pointer.mouseX - pointer.smoothedX) * settings.pointer.follow;
    pointer.smoothedY +=
      (pointer.mouseY - pointer.smoothedY) * settings.pointer.follow;
    pointer.velocityX *= settings.pointer.velocityDamping;
    pointer.velocityY *= settings.pointer.velocityDamping;

    const virtualWidth = getVirtualWidth();
    const virtualHeight = getVirtualHeight();
    halftoneMaterial.uniforms.interactionUv.value.set(
      pointer.smoothedX,
      1 - pointer.smoothedY,
    );
    halftoneMaterial.uniforms.interactionVelocity.value.set(
      pointer.velocityX * virtualWidth,
      -pointer.velocityY * virtualHeight,
    );
    halftoneMaterial.uniforms.hoverHalftoneActive.value = settings.hover
      .halftoneEnabled
      ? pointer.hoverStrength
      : 0;
    halftoneMaterial.uniforms.hoverHalftonePowerShift.value = settings.hover
      .halftoneEnabled
      ? settings.hover.halftonePowerShift
      : 0;
    halftoneMaterial.uniforms.hoverHalftoneWidthShift.value = settings.hover
      .halftoneEnabled
      ? settings.hover.halftoneWidthShift
      : 0;
    halftoneMaterial.uniforms.hoverLightStrength.value = settings.hover
      .lightEnabled
      ? settings.hover.lightIntensity * pointer.hoverStrength
      : 0;

    if (settings.responsiveFrame) {
      const frame = settings.responsiveFrame();
      imageMaterial.uniforms.zoom.value =
        REFERENCE_PREVIEW_DISTANCE / Math.max(frame.previewDistance, 0.001);
      imageMaterial.uniforms.verticalAnchor.value = frame.verticalAnchor;
      imageMaterial.uniforms.verticalPixelOffset.value = frame.verticalOffsetPx;
      imageMaterial.uniforms.horizontalPixelOffset.value =
        frame.horizontalOffsetPx;
      halftoneMaterial.uniforms.footprintScale.value = getImageFootprintScale({
        imageFit: 'contain',
        imageHeight: image.naturalHeight,
        imageWidth: image.naturalWidth,
        previewDistance: frame.previewDistance,
        viewportHeight: getVirtualHeight(),
        viewportWidth: getVirtualWidth(),
      });
    }

    renderer.setRenderTarget(sceneTarget);
    renderer.render(imageScene, orthographicCamera);

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
    imageMaterial.dispose();
    halftoneMaterial.dispose();
    fullScreenGeometry.dispose();
    imageTexture.dispose();
    sceneTarget.dispose();
    renderer?.dispose();
    if (canvas.parentNode === container) {
      container.removeChild(canvas);
    }
  }

  if (reducedMotion) {
    renderFrame({ deltaSeconds: 0, elapsedSeconds: 0, timestamp: 0 });
    const stillObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            syncSize();
            renderFrame({ deltaSeconds: 0, elapsedSeconds: 0, timestamp: 0 });
          });
    stillObserver?.observe(container);
    sizeObserver?.disconnect();
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
      pointerEventTarget.removeEventListener('pointermove', handlePointerMove);
      pointerEventTarget.removeEventListener(
        'pointerleave',
        handlePointerLeave,
      );
      disposeResources();
    },
  };
}
