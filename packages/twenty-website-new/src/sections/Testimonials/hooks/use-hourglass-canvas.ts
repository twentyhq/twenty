'use client';

import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useEffect, type RefObject } from 'react';
import * as THREE from 'three';
import { observeElementSize } from '@/lib/dom/observe-element-size';
import {
  createVisualRenderLoop,
  tryCreateSiteWebGlRenderer,
  type VisualRenderLoop,
  type VisualRenderLoopFrame,
} from '@/lib/visual-runtime';

import type { HourglassPose } from '../types/hourglass-pose';
import type { HourglassSettings } from '../types/hourglass-settings';

export type { HourglassPose, HourglassSettings };

const VIRTUAL_RENDER_HEIGHT = 768;
const REFERENCE_PREVIEW_DISTANCE = 4;

const passThroughVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const blurFragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D tInput;
  uniform vec2 dir;
  uniform vec2 res;

  varying vec2 vUv;

  void main() {
    vec4 sum = vec4(0.0);
    vec2 px = dir / res;

    float w[5];
    w[0] = 0.227027;
    w[1] = 0.1945946;
    w[2] = 0.1216216;
    w[3] = 0.054054;
    w[4] = 0.016216;

    sum += texture2D(tInput, vUv) * w[0];

    for (int i = 1; i < 5; i++) {
      float fi = float(i) * 3.0;
      sum += texture2D(tInput, vUv + px * fi) * w[i];
      sum += texture2D(tInput, vUv - px * fi) * w[i];
    }

    gl_FragColor = sum;
  }
`;

const halftoneFragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D tScene;
  uniform sampler2D tGlow;
  uniform vec2 resolution;
  uniform float numRows;
  uniform float glowStr;
  uniform float contrast;
  uniform float power;
  uniform float shading;
  uniform float baseInk;
  uniform float maxBar;
  uniform float rowMerge;
  uniform float cellRatio;
  uniform float cutoff;
  uniform float highlightOpen;
  uniform float shadowGrouping;
  uniform float shadowCrush;
  uniform vec3 dashColor;
  uniform float time;
  uniform float waveAmount;
  uniform float waveSpeed;
  uniform float distanceScale;

  varying vec2 vUv;

  void main() {
    float rowH = resolution.y / (numRows * distanceScale);
    float row = floor(gl_FragCoord.y / rowH);
    float rowFrac = gl_FragCoord.y / rowH - row;
    float rowV = (row + 0.5) * rowH / resolution.y;
    float dy = abs(rowFrac - 0.5);

    float waveOffset = waveAmount * sin(time * waveSpeed + row * 0.5) * rowH;
    float effectiveX = gl_FragCoord.x + waveOffset;
    float cellW = rowH * cellRatio;
    float cellIdx = floor(effectiveX / cellW);
    float cellFrac = (effectiveX - cellIdx * cellW) / cellW;
    float cellU = (cellIdx + 0.5) * cellW / resolution.x;

    vec2 sampleUv = vec2(
      clamp(cellU, 0.0, 1.0),
      clamp(rowV, 0.0, 1.0)
    );

    vec4 sceneSample = texture2D(tScene, sampleUv);
    vec4 glowCell = texture2D(tGlow, sampleUv);

    float mask = smoothstep(0.02, 0.08, sceneSample.a);
    float lum = dot(sceneSample.rgb, vec3(0.299, 0.587, 0.114));
    float avgLum = dot(glowCell.rgb, vec3(0.299, 0.587, 0.114));
    float detail = lum - avgLum;

    float litLum = lum + max(detail, 0.0) * shading
      - max(-detail, 0.0) * shading * 0.55;
    litLum = clamp((litLum - cutoff) / max(1.0 - cutoff, 0.001), 0.0, 1.0);
    litLum = pow(litLum, max(contrast, 0.25));

    float darkness = 1.0 - litLum;
    float groupedLum = clamp((avgLum - cutoff) / max(1.0 - cutoff, 0.001), 0.0, 1.0);
    groupedLum = pow(groupedLum, max(contrast * 0.9, 0.25));
    float groupedDarkness = 1.0 - groupedLum;
    darkness = mix(darkness, max(darkness, groupedDarkness), shadowGrouping);
    darkness = clamp(
      (darkness - highlightOpen) / max(1.0 - highlightOpen, 0.001),
      0.0,
      1.0
    );

    float shadowMask = smoothstep(0.42, 0.96, darkness);
    darkness = mix(darkness, mix(darkness, 1.0, shadowMask), shadowCrush);

    float inkBase = baseInk * smoothstep(0.03, 0.24, darkness);
    float ink = mix(inkBase, 1.0, darkness);
    float fill = pow(ink, 1.05) * power;
    fill = clamp(fill, 0.0, 1.0) * mask;

    float dynamicBarHalf = mix(0.08, maxBar, smoothstep(0.03, 0.85, ink));
    float dynamicBarHalfY = min(
      dynamicBarHalf + rowMerge * smoothstep(0.42, 0.98, ink),
      0.78
    );
    float dx2 = abs(cellFrac - 0.5);
    float halfFill = fill * 0.5;
    float bodyHalfW = max(halfFill - dynamicBarHalf * (rowH / cellW), 0.0);
    float capRX = dynamicBarHalf * rowH;
    float capRY = dynamicBarHalfY * rowH;

    float inDash = 0.0;
    if (dx2 <= bodyHalfW) {
      float edgeDist = dynamicBarHalfY - dy;
      inDash = smoothstep(-0.03, 0.03, edgeDist);
    } else {
      float cdx = (dx2 - bodyHalfW) * cellW;
      float cdy = dy * rowH;
      float ellipseDist = sqrt(
        (cdx * cdx) / max(capRX * capRX, 0.0001) +
        (cdy * cdy) / max(capRY * capRY, 0.0001)
      );
      inDash = 1.0 - smoothstep(1.0 - 0.08, 1.0 + 0.08, ellipseDist);
    }

    inDash *= step(0.001, ink) * mask;
    inDash *= 1.0 + 0.03 * sin(time * 0.8 + row * 0.1);

    vec4 glow = texture2D(tGlow, vUv);
    float glowLum = dot(glow.rgb, vec3(0.299, 0.587, 0.114));
    float halo = glowLum * glowStr * 0.25 * (1.0 - inDash);
    float sharp = smoothstep(0.3, 0.5, inDash + halo);
    vec3 color = dashColor * sharp;

    gl_FragColor = vec4(color, sharp);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function createRenderTarget(width: number, height: number) {
  return new THREE.WebGLRenderTarget(width, height, {
    format: THREE.RGBAFormat,
    magFilter: THREE.LinearFilter,
    minFilter: THREE.LinearFilter,
  });
}

function createEnvironmentTexture(renderer: THREE.WebGLRenderer) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const environmentTexture = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0.04,
  ).texture;
  pmremGenerator.dispose();

  return environmentTexture;
}

function setPrimaryLightPosition(
  light: THREE.DirectionalLight,
  angleDegrees: number,
  height: number,
) {
  const angle = (angleDegrees * Math.PI) / 180;
  light.position.set(Math.cos(angle) * 5, height, Math.sin(angle) * 5);
}

function createInteractionState(initialPose?: Partial<HourglassPose>) {
  return {
    autoElapsed: initialPose?.autoElapsed ?? 0,
    dragging: false,
    mouseX: 0.5,
    mouseY: 0.5,
    pointerX: 0,
    pointerY: 0,
    rotateElapsed: initialPose?.rotateElapsed ?? 0,
    rotationX: initialPose?.rotationX ?? 0,
    rotationY: initialPose?.rotationY ?? 0,
    rotationZ: initialPose?.rotationZ ?? 0,
    targetRotationX: initialPose?.targetRotationX ?? 0,
    targetRotationY: initialPose?.targetRotationY ?? 0,
    velocityX: 0,
    velocityY: 0,
  };
}

export function useHourglassCanvas({
  geometry,
  initialPose,
  mountRef,
  previewDistance,
  settings,
}: {
  geometry: THREE.BufferGeometry;
  initialPose?: Partial<HourglassPose>;
  mountRef: RefObject<HTMLDivElement | null>;
  previewDistance: number;
  settings: HourglassSettings;
}) {
  useEffect(() => {
    const container = mountRef.current;

    if (!container) {
      return;
    }

    let renderLoop: VisualRenderLoop | null = null;

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

    const renderer = tryCreateSiteWebGlRenderer({
      antialias: false,
      alpha: true,
      onContextLost: () => {
        renderLoop?.stop();
      },
    });

    if (renderer === null) {
      return;
    }

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
    camera.position.z = previewDistance;

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

    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      settings.lighting.ambientIntensity,
    );
    scene3d.add(ambientLight);

    const material = new THREE.MeshPhysicalMaterial({
      clearcoat: 0,
      clearcoatRoughness: 0.08,
      color: 0xd4d0c8,
      envMap: environmentTexture,
      envMapIntensity: 0.25,
      metalness: settings.material.metalness,
      reflectivity: 0.5,
      roughness: settings.material.roughness,
      transmission: 0,
    });

    const mesh = new THREE.Mesh(geometry, material);
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
        dir: { value: new THREE.Vector2(1, 0) },
        res: {
          value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
        },
        tInput: { value: null },
      },
      vertexShader: passThroughVertexShader,
      fragmentShader: blurFragmentShader,
    });

    const blurVerticalMaterial = new THREE.ShaderMaterial({
      uniforms: {
        dir: { value: new THREE.Vector2(0, 1) },
        res: {
          value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
        },
        tInput: { value: null },
      },
      vertexShader: passThroughVertexShader,
      fragmentShader: blurFragmentShader,
    });

    const halftoneMaterial = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        baseInk: { value: settings.halftone.baseInk },
        cellRatio: { value: settings.halftone.cellRatio },
        contrast: { value: settings.halftone.contrast },
        cutoff: { value: settings.halftone.cutoff },
        dashColor: { value: new THREE.Color(settings.halftone.dashColor) },
        distanceScale: { value: previewDistance / REFERENCE_PREVIEW_DISTANCE },
        glowStr: { value: 0 },
        highlightOpen: { value: settings.halftone.highlightOpen },
        maxBar: { value: settings.halftone.maxBar },
        numRows: { value: settings.halftone.numRows },
        power: { value: settings.halftone.power },
        resolution: {
          value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
        },
        rowMerge: { value: settings.halftone.rowMerge },
        shading: { value: settings.halftone.shading },
        shadowCrush: { value: settings.halftone.shadowCrush },
        shadowGrouping: { value: settings.halftone.shadowGrouping },
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

    const interaction = createInteractionState(initialPose);

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

    const stopObservingSize = observeElementSize(container, syncSize);

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

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerdown', handlePointerDown);

    const renderFrame = (
      _timestamp: DOMHighResTimeStamp,
      { deltaSeconds, elapsedSeconds }: VisualRenderLoopFrame,
    ) => {
      const delta = deltaSeconds;
      const elapsedTime = (initialPose?.timeElapsed ?? 0) + elapsedSeconds;
      halftoneMaterial.uniforms.time.value = elapsedTime;

      let baseRotationX = 0;
      let baseRotationY = 0;
      let baseRotationZ = 0;

      if (settings.animation.autoRotateEnabled) {
        if (!interaction.dragging) {
          interaction.autoElapsed += delta;
          interaction.targetRotationX += interaction.velocityX;
          interaction.targetRotationY += interaction.velocityY;
          interaction.velocityX *= 0.92;
          interaction.velocityY *= 0.92;
        }

        baseRotationY += interaction.autoElapsed * settings.animation.autoSpeed;
        baseRotationX +=
          Math.sin(interaction.autoElapsed * 0.2) *
          settings.animation.autoWobble;
      }

      if (settings.animation.rotateEnabled) {
        interaction.rotateElapsed += delta;
        const rotateProgress = settings.animation.rotatePingPong
          ? Math.sin(
              interaction.rotateElapsed * settings.animation.rotateSpeed,
            ) * Math.PI
          : interaction.rotateElapsed * settings.animation.rotateSpeed;

        if (settings.animation.rotatePreset === 'axis') {
          const axisDirection = settings.animation.rotateAxis.startsWith('-')
            ? -1
            : 1;
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
        }
      }

      let targetX = baseRotationX;
      let targetY = baseRotationY;
      let easing = 0.12;

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

        easing = 0.08;
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

    renderLoop = createVisualRenderLoop({
      renderFrame,
      target: container,
      targetVisibilityOptions: { rootMargin: '100px' },
    });
    renderLoop.start();

    return () => {
      renderLoop?.dispose();
      stopObservingSize();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerdown', handlePointerDown);
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

      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, [geometry, initialPose, mountRef, previewDistance, settings]);
}
