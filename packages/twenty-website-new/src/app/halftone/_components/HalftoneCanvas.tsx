'use client';

import {
  createEnvironmentTexture,
} from '@/app/halftone/_lib/model-loaders';
import {
  VIRTUAL_RENDER_HEIGHT,
  blurFragmentShader,
  halftoneFragmentShader,
  passThroughVertexShader,
} from '@/app/halftone/_lib/rendering';
import type { HalftoneStudioSettings } from '@/app/halftone/_lib/types';
import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const CanvasMount = styled.div`
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

type HalftoneCanvasProps = {
  geometry: THREE.BufferGeometry | null;
  settings: HalftoneStudioSettings;
  onFirstInteraction: () => void;
};

type SceneResources = {
  ambientLight: THREE.AmbientLight;
  blurHorizontalMaterial: THREE.ShaderMaterial;
  blurHorizontalScene: THREE.Scene;
  blurTargetA: THREE.WebGLRenderTarget;
  blurTargetB: THREE.WebGLRenderTarget;
  blurVerticalMaterial: THREE.ShaderMaterial;
  blurVerticalScene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  canvas: HTMLCanvasElement;
  environmentTexture: THREE.Texture;
  fillLight: THREE.DirectionalLight;
  fullScreenGeometry: THREE.PlaneGeometry;
  halftoneMaterial: THREE.ShaderMaterial;
  material: THREE.MeshPhysicalMaterial;
  mesh: THREE.Mesh;
  orthographicCamera: THREE.OrthographicCamera;
  postScene: THREE.Scene;
  primaryLight: THREE.DirectionalLight;
  renderer: THREE.WebGLRenderer;
  scene3d: THREE.Scene;
  sceneTarget: THREE.WebGLRenderTarget;
};

type InteractionState = {
  autoElapsed: number;
  dragging: boolean;
  mouseX: number;
  mouseY: number;
  pointerX: number;
  pointerY: number;
  rotateElapsed: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
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
    autoElapsed: 0,
    dragging: false,
    mouseX: 0.5,
    mouseY: 0.5,
    pointerX: 0,
    pointerY: 0,
    rotateElapsed: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    targetRotationX: 0,
    targetRotationY: 0,
    velocityX: 0,
    velocityY: 0,
  };
}

function updateLighting(resources: SceneResources, settings: HalftoneStudioSettings) {
  const lightAngle = (settings.lighting.angleDegrees * Math.PI) / 180;

  resources.primaryLight.intensity = settings.lighting.intensity;
  resources.primaryLight.position.set(
    Math.cos(lightAngle) * 5,
    settings.lighting.height,
    Math.sin(lightAngle) * 5,
  );
  resources.fillLight.intensity = settings.lighting.fillIntensity;
  resources.ambientLight.intensity = settings.lighting.ambientIntensity;
}

function updateMaterial(resources: SceneResources, settings: HalftoneStudioSettings) {
  resources.material.roughness = settings.material.roughness;
  resources.material.metalness = settings.material.metalness;
  resources.material.needsUpdate = true;
}

function updateHalftone(
  resources: SceneResources,
  settings: HalftoneStudioSettings,
) {
  resources.halftoneMaterial.uniforms.numRows.value =
    settings.halftone.numRows;
  resources.halftoneMaterial.uniforms.contrast.value =
    settings.halftone.contrast;
  resources.halftoneMaterial.uniforms.power.value = settings.halftone.power;
  resources.halftoneMaterial.uniforms.shading.value =
    settings.halftone.shading;
  resources.halftoneMaterial.uniforms.baseInk.value = settings.halftone.baseInk;
  resources.halftoneMaterial.uniforms.maxBar.value = settings.halftone.maxBar;
  resources.halftoneMaterial.uniforms.cellRatio.value =
    settings.halftone.cellRatio;
  resources.halftoneMaterial.uniforms.cutoff.value = settings.halftone.cutoff;
  (
    resources.halftoneMaterial.uniforms.dashColor.value as THREE.Color
  ).set(settings.halftone.dashColor);
}

function syncResources(resources: SceneResources, settings: HalftoneStudioSettings) {
  updateLighting(resources, settings);
  updateMaterial(resources, settings);
  updateHalftone(resources, settings);
}

function resetInteractionState(
  interactionState: InteractionState,
  mode: HalftoneStudioSettings['animation']['mode'],
) {
  interactionState.dragging = false;
  interactionState.targetRotationX = 0;
  interactionState.targetRotationY = 0;
  interactionState.velocityX = 0;
  interactionState.velocityY = 0;

  if (mode === 'autoRotate') {
    interactionState.autoElapsed = 0;
  }
}

export function HalftoneCanvas({
  geometry,
  settings,
  onFirstInteraction,
}: HalftoneCanvasProps) {
  const mountReference = useRef<HTMLDivElement>(null);
  const resourcesReference = useRef<SceneResources | null>(null);
  const settingsReference = useRef(settings);
  const interactionReference = useRef<InteractionState>(createInteractionState());
  const animationReference = useRef(settings.animation);
  const didInteractReference = useRef(false);

  useEffect(() => {
    settingsReference.current = settings;

    const resources = resourcesReference.current;

    if (!resources) {
      animationReference.current = settings.animation;
      return;
    }

    if (animationReference.current.mode !== settings.animation.mode) {
      resetInteractionState(interactionReference.current, settings.animation.mode);
    }

    if (
      !animationReference.current.rotateEnabled &&
      settings.animation.rotateEnabled
    ) {
      interactionReference.current.rotateElapsed = 0;
    }

    animationReference.current = settings.animation;
    syncResources(resources, settings);
  }, [settings]);

  useEffect(() => {
    const resources = resourcesReference.current;

    if (!resources || !geometry) {
      return;
    }

    resources.mesh.geometry = geometry;
  }, [geometry]);

  useEffect(() => {
    const container = mountReference.current;

    if (!container || !geometry) {
      return;
    }

    let animationFrameId = 0;
    let cancelled = false;

    const getWidth = () => Math.max(container.clientWidth, 1);
    const getHeight = () => Math.max(container.clientHeight, 1);
    const getVirtualHeight = () => Math.max(VIRTUAL_RENDER_HEIGHT, getHeight());
    const getVirtualWidth = () =>
      Math.max(
        Math.round(getVirtualHeight() * (getWidth() / Math.max(getHeight(), 1))),
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

    const camera = new THREE.PerspectiveCamera(45, getWidth() / getHeight(), 0.1, 100);
    camera.position.z = 4;

    const primaryLight = new THREE.DirectionalLight(0xffffff, 1.5);
    scene3d.add(primaryLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.15);
    fillLight.position.set(-3, -1, 1);
    scene3d.add(fillLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.08);
    scene3d.add(ambientLight);

    const material = new THREE.MeshPhysicalMaterial({
      color: 0xd4d0c8,
      roughness: 0.42,
      metalness: 0.16,
      envMap: environmentTexture,
      envMapIntensity: 0.25,
      clearcoat: 0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.5,
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
        numRows: { value: settings.halftone.numRows },
        glowStr: { value: 0 },
        contrast: { value: settings.halftone.contrast },
        power: { value: settings.halftone.power },
        shading: { value: settings.halftone.shading },
        baseInk: { value: settings.halftone.baseInk },
        maxBar: { value: settings.halftone.maxBar },
        cellRatio: { value: settings.halftone.cellRatio },
        cutoff: { value: settings.halftone.cutoff },
        dashColor: { value: new THREE.Color(settings.halftone.dashColor) },
        time: { value: 0 },
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

    const resources: SceneResources = {
      ambientLight,
      blurHorizontalMaterial,
      blurHorizontalScene,
      blurTargetA,
      blurTargetB,
      blurVerticalMaterial,
      blurVerticalScene,
      camera,
      canvas,
      environmentTexture,
      fillLight,
      fullScreenGeometry,
      halftoneMaterial,
      material,
      mesh,
      orthographicCamera,
      postScene,
      primaryLight,
      renderer,
      scene3d,
      sceneTarget,
    };

    resourcesReference.current = resources;
    syncResources(resources, settingsReference.current);

    const syncSize = () => {
      if (cancelled) {
        return;
      }

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

    const handlePointerDown = (event: PointerEvent) => {
      const interaction = interactionReference.current;
      interaction.dragging = true;
      interaction.pointerX = event.clientX;
      interaction.pointerY = event.clientY;
      interaction.velocityX = 0;
      interaction.velocityY = 0;
      canvas.style.cursor = 'grabbing';

      if (!didInteractReference.current) {
        didInteractReference.current = true;
        onFirstInteraction();
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const interaction = interactionReference.current;
      interaction.mouseX = event.clientX / window.innerWidth;
      interaction.mouseY = event.clientY / window.innerHeight;

      const animation = settingsReference.current.animation;

      if (
        !interaction.dragging ||
        (animation.mode !== 'followDrag' && animation.mode !== 'autoRotate')
      ) {
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

    const handlePointerUp = () => {
      interactionReference.current.dragging = false;
      canvas.style.cursor = 'grab';
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerdown', handlePointerDown);

    const clock = new THREE.Clock();

    const renderFrame = () => {
      if (cancelled) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(renderFrame);

      const interaction = interactionReference.current;
      const activeSettings = settingsReference.current;
      const delta = 1 / 60;
      const elapsedTime = clock.getElapsedTime();

      halftoneMaterial.uniforms.time.value = elapsedTime;

      let baseRotationX = 0;
      let baseRotationY = 0;
      let baseRotationZ = 0;

      if (activeSettings.animation.mode === 'autoRotate') {
        if (!interaction.dragging) {
          interaction.autoElapsed += delta;
          interaction.targetRotationX += interaction.velocityX;
          interaction.targetRotationY += interaction.velocityY;
          interaction.velocityX *= 0.92;
          interaction.velocityY *= 0.92;
        }

        baseRotationY += interaction.autoElapsed * activeSettings.animation.autoSpeed;
        baseRotationX +=
          Math.sin(interaction.autoElapsed * 0.2) *
          activeSettings.animation.autoWobble;
      }

      if (activeSettings.animation.rotateEnabled) {
        interaction.rotateElapsed += delta;
        const rotateAngle = activeSettings.animation.rotatePingPong
          ? Math.sin(
              interaction.rotateElapsed * activeSettings.animation.rotateSpeed,
            ) * Math.PI
          : interaction.rotateElapsed * activeSettings.animation.rotateSpeed;

        if (
          activeSettings.animation.rotateAxis === 'x' ||
          activeSettings.animation.rotateAxis === 'xy'
        ) {
          baseRotationX += rotateAngle;
        }

        if (
          activeSettings.animation.rotateAxis === 'y' ||
          activeSettings.animation.rotateAxis === 'xy'
        ) {
          baseRotationY += rotateAngle;
        }

        if (activeSettings.animation.rotateAxis === 'z') {
          baseRotationZ = rotateAngle;
        }
      }

      let targetX = baseRotationX;
      let targetY = baseRotationY;
      let easing = 0.12;

      if (activeSettings.animation.mode === 'followHover') {
        const rangeRadians =
          (activeSettings.animation.hoverRange * Math.PI) / 180;

        if (
          activeSettings.animation.hoverReturn ||
          interaction.mouseX !== 0.5 ||
          interaction.mouseY !== 0.5
        ) {
          interaction.targetRotationX = (interaction.mouseY - 0.5) * rangeRadians;
          interaction.targetRotationY = (interaction.mouseX - 0.5) * rangeRadians;
        }

        targetX = baseRotationX + interaction.targetRotationX;
        targetY = baseRotationY + interaction.targetRotationY;
        easing = activeSettings.animation.hoverEase;
      } else if (activeSettings.animation.mode === 'followDrag') {
        if (!interaction.dragging && activeSettings.animation.dragMomentum) {
          interaction.targetRotationX += interaction.velocityX;
          interaction.targetRotationY += interaction.velocityY;
          interaction.velocityX *= 1 - activeSettings.animation.dragFriction;
          interaction.velocityY *= 1 - activeSettings.animation.dragFriction;
        }

        targetX = baseRotationX + interaction.targetRotationX;
        targetY = baseRotationY + interaction.targetRotationY;
        easing = activeSettings.animation.dragFriction;
      } else if (activeSettings.animation.mode === 'autoRotate') {
        targetX = baseRotationX + interaction.targetRotationX;
        targetY = baseRotationY + interaction.targetRotationY;

        if (interaction.dragging) {
          targetX = interaction.targetRotationX;
          targetY = interaction.targetRotationY;
        }

        easing = 0.08;
      }

      interaction.rotationX += (targetX - interaction.rotationX) * easing;
      interaction.rotationY += (targetY - interaction.rotationY) * easing;
      interaction.rotationZ +=
        (baseRotationZ - interaction.rotationZ) *
        (activeSettings.animation.rotatePingPong ? 0.18 : 0.12);

      mesh.rotation.set(
        interaction.rotationX,
        interaction.rotationY,
        interaction.rotationZ,
      );

      if (!activeSettings.halftone.enabled) {
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
      cancelled = true;
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.cancelAnimationFrame(animationFrameId);

      blurHorizontalMaterial.dispose();
      blurVerticalMaterial.dispose();
      halftoneMaterial.dispose();
      fullScreenGeometry.dispose();
      material.dispose();
      sceneTarget.dispose();
      blurTargetA.dispose();
      blurTargetB.dispose();
      environmentTexture.dispose();
      renderer.dispose();
      resourcesReference.current = null;

      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, [onFirstInteraction]);

  return <CanvasMount aria-hidden ref={mountReference} />;
}
