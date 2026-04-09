'use client';

import {
  VIRTUAL_RENDER_HEIGHT,
  blurFragmentShader,
  halftoneFragmentShader,
  imagePassthroughFragmentShader,
  passThroughVertexShader,
} from '@/app/halftone/_lib/rendering';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const IMAGE_SRC = '/images/home/problem/arthur-roblet.png';

const IMAGE_ZOOM = 1;
const NUM_ROWS = 45;
const CONTRAST = 1.3;
const POWER = 1.1;
const SHADING = 1.6;
const BASE_INK = 0.16;
const MAX_BAR = 0.24;
const CELL_RATIO = 2.2;
const CUTOFF = 0.02;
const DASH_COLOR = '#4A38F5';

const HOVER_EASE = 0.08;
const DRAG_SENS = 0.008;
const DRAG_FRICTION = 0.08;
const HOVER_WARP_STRENGTH = 3;
const HOVER_WARP_RADIUS = 0.15;
const DRAG_WARP_STRENGTH = 5;
const FOLLOW_HOVER_ENABLED = true;
const FOLLOW_DRAG_ENABLED = false;

type InteractionState = {
  dragging: boolean;
  mouseX: number;
  mouseY: number;
  pointerX: number;
  pointerY: number;
  rotationX: number;
  rotationY: number;
  targetRotationX: number;
  targetRotationY: number;
  velocityX: number;
  velocityY: number;
};

function createRenderTarget(width: number, height: number) {
  return new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  });
}

function createInteractionState(): InteractionState {
  return {
    dragging: false,
    mouseX: 0.5,
    mouseY: 0.5,
    pointerX: 0,
    pointerY: 0,
    rotationX: 0,
    rotationY: 0,
    targetRotationX: 0,
    targetRotationY: 0,
    velocityX: 0,
    velocityY: 0,
  };
}

async function loadImage(imageUrl: string) {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error(`Failed to load image: ${imageUrl}`));
    image.src = imageUrl;
  });
}

async function mountHalftoneCanvas(
  container: HTMLDivElement,
  imageUrl: string,
) {
  const getWidth = () => Math.max(container.clientWidth, 1);
  const getHeight = () => Math.max(container.clientHeight, 1);
  const getVirtualHeight = () => Math.max(VIRTUAL_RENDER_HEIGHT, getHeight());
  const getVirtualWidth = () =>
    Math.max(
      Math.round(getVirtualHeight() * (getWidth() / Math.max(getHeight(), 1))),
      1,
    );

  const image = await loadImage(imageUrl);

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
      viewportSize: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      zoom: { value: IMAGE_ZOOM },
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
      resolution: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      numRows: { value: NUM_ROWS },
      glowStr: { value: 0 },
      contrast: { value: CONTRAST },
      power: { value: POWER },
      shading: { value: SHADING },
      baseInk: { value: BASE_INK },
      maxBar: { value: MAX_BAR },
      cellRatio: { value: CELL_RATIO },
      cutoff: { value: CUTOFF },
      dashColor: { value: new THREE.Color(DASH_COLOR) },
      time: { value: 0 },
      waveAmount: { value: 0 },
      waveSpeed: { value: 1 },
      distanceScale: { value: 1 },
      mouseUv: { value: new THREE.Vector2(-1, -1) },
      warpStrength: { value: 0 },
      warpRadius: { value: HOVER_WARP_RADIUS },
      cropToBounds: { value: 1 },
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
    const virtualWidth = getVirtualWidth();
    const virtualHeight = getVirtualHeight();

    renderer.setSize(virtualWidth, virtualHeight, false);
    sceneTarget.setSize(virtualWidth, virtualHeight);
    blurTargetA.setSize(virtualWidth, virtualHeight);
    blurTargetB.setSize(virtualWidth, virtualHeight);
    blurHorizontalMaterial.uniforms.res.value.set(virtualWidth, virtualHeight);
    blurVerticalMaterial.uniforms.res.value.set(virtualWidth, virtualHeight);
    halftoneMaterial.uniforms.resolution.value.set(virtualWidth, virtualHeight);
    imageMaterial.uniforms.viewportSize.value.set(virtualWidth, virtualHeight);
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
  };

  const handlePointerMove = (event: PointerEvent) => {
    updatePointerPosition(event);
  };

  const handleWindowPointerMove = (event: PointerEvent) => {
    updatePointerPosition(event);

    if (!interaction.dragging || !FOLLOW_DRAG_ENABLED) {
      return;
    }

    const deltaX = (event.clientX - interaction.pointerX) * DRAG_SENS;
    const deltaY = (event.clientY - interaction.pointerY) * DRAG_SENS;
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
  };

  const handleWindowBlur = () => {
    handlePointerUp();
    handlePointerLeave();
  };

  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerleave', handlePointerLeave);
  window.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('pointermove', handleWindowPointerMove);
  window.addEventListener('blur', handleWindowBlur);
  canvas.addEventListener('pointerdown', handlePointerDown);

  const clock = new THREE.Clock();
  let animationFrameId = 0;

  const renderFrame = () => {
    animationFrameId = window.requestAnimationFrame(renderFrame);

    halftoneMaterial.uniforms.time.value = clock.getElapsedTime();

    let warpActive = false;
    let currentWarpStrength = 0;

    if (FOLLOW_HOVER_ENABLED && !interaction.dragging) {
      warpActive = true;
      currentWarpStrength = HOVER_WARP_STRENGTH;
    }

    if (FOLLOW_DRAG_ENABLED && interaction.dragging) {
      warpActive = true;
      currentWarpStrength = DRAG_WARP_STRENGTH;
    }

    if (FOLLOW_DRAG_ENABLED && !interaction.dragging) {
      interaction.targetRotationX *= 1 - DRAG_FRICTION;
      interaction.targetRotationY *= 1 - DRAG_FRICTION;
      const dragRemaining =
        Math.abs(interaction.targetRotationX) +
        Math.abs(interaction.targetRotationY);

      if (dragRemaining > 0.001) {
        warpActive = true;
        currentWarpStrength =
          DRAG_WARP_STRENGTH * Math.min(dragRemaining * 20, 1);
      }
    }

    interaction.rotationX +=
      (interaction.mouseX - interaction.rotationX) * HOVER_EASE;
    interaction.rotationY +=
      (interaction.mouseY - interaction.rotationY) * HOVER_EASE;

    if (warpActive) {
      halftoneMaterial.uniforms.mouseUv.value.set(
        interaction.rotationX,
        interaction.rotationY,
      );
      halftoneMaterial.uniforms.warpStrength.value = currentWarpStrength;
    } else {
      halftoneMaterial.uniforms.warpStrength.value = 0;
    }

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
    resizeObserver.disconnect();
    canvas.removeEventListener('pointermove', handlePointerMove);
    canvas.removeEventListener('pointerleave', handlePointerLeave);
    window.removeEventListener('pointerup', handlePointerUp);
    window.removeEventListener('pointermove', handleWindowPointerMove);
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

export default function LolOverlay() {
  const mountReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountReference.current;

    if (!container) {
      return;
    }

    const unmountPromise = mountHalftoneCanvas(container, IMAGE_SRC).catch(
      (error) => {
        console.error(error);

        return undefined;
      },
    );

    return () => {
      void unmountPromise.then((dispose) => dispose?.());
    };
  }, []);

  return (
    <div
      ref={mountReference}
      style={{
        background: 'transparent',
        height: '100%',
        width: '100%',
      }}
    />
  );
}
