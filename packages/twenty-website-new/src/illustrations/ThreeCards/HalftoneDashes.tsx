'use client';

import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

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
  uniform float cellRatio;
  uniform float cutoff;
  uniform vec3 dashColor;
  uniform float time;

  varying vec2 vUv;

  void main() {
    float rowH = resolution.y / numRows;
    float row = floor(gl_FragCoord.y / rowH);
    float rowFrac = gl_FragCoord.y / rowH - row;
    float rowV = (row + 0.5) * rowH / resolution.y;
    float dy = abs(rowFrac - 0.5);

    float cellW = rowH * cellRatio;
    float cellIdx = floor(gl_FragCoord.x / cellW);
    float cellFrac = (gl_FragCoord.x - cellIdx * cellW) / cellW;
    float cellU = (cellIdx + 0.5) * cellW / resolution.x;

    vec2 sampleUv = vec2(
      clamp(cellU, 0.0, 1.0),
      clamp(rowV, 0.0, 1.0)
    );

    vec4 s = texture2D(tScene, sampleUv);
    vec4 gCell = texture2D(tGlow, sampleUv);

    float mask = smoothstep(0.02, 0.08, s.a);
    float lum = dot(s.rgb, vec3(0.299, 0.587, 0.114));
    float avgLum = dot(gCell.rgb, vec3(0.299, 0.587, 0.114));
    float detail = lum - avgLum;

    float litLum = lum + max(detail, 0.0) * shading
      - max(-detail, 0.0) * shading * 0.55;
    litLum = clamp((litLum - cutoff) / max(1.0 - cutoff, 0.001), 0.0, 1.0);
    litLum = pow(litLum, contrast);

    float ink = mix(baseInk, 1.0, 1.0 - litLum);
    float fill = pow(ink, 1.05) * power;
    fill = clamp(fill, 0.0, 1.0) * mask;

    float dynamicBarHalf = mix(0.08, maxBar, smoothstep(0.03, 0.85, ink));
    float dx2 = abs(cellFrac - 0.5);
    float halfFill = fill * 0.5;
    float bodyHalfW = max(halfFill - dynamicBarHalf * (rowH / cellW), 0.0);
    float capR = dynamicBarHalf * rowH;

    float inDash = 0.0;
    if (dx2 <= bodyHalfW) {
      float edgeDist = dynamicBarHalf - dy;
      inDash = smoothstep(-0.03, 0.03, edgeDist);
    } else {
      float cdx = (dx2 - bodyHalfW) * cellW;
      float cdy = dy * rowH;
      float d = sqrt(cdx * cdx + cdy * cdy);
      inDash = 1.0 - smoothstep(capR - 1.5, capR + 1.5, d);
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

const StyledVisualMount = styled.div`
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

const VIRTUAL_RENDER_HEIGHT = 768;

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

export function HalftoneDashes() {
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
      Math.max(Math.round(getVirtualHeight() * (getWidth() / getHeight())), 1);

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(1);
    renderer.setSize(getVirtualWidth(), getVirtualHeight(), false);
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    canvas.style.cursor = 'grab';
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

    const camera = new THREE.PerspectiveCamera(45, getWidth() / getHeight(), 0.1, 100);
    camera.position.z = 4;

    const primaryLight = new THREE.DirectionalLight(0xffffff, 1.5);
    primaryLight.position.set(4, 3, 2);
    scene3d.add(primaryLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.15);
    fillLight.position.set(-3, -1, 1);
    scene3d.add(fillLight);

    scene3d.add(new THREE.AmbientLight(0xffffff, 0.08));

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

    const geometry = new THREE.TorusKnotGeometry(1, 0.35, 200, 32);
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
        numRows: { value: 45 },
        glowStr: { value: 0 },
        contrast: { value: 1.3 },
        power: { value: 1.1 },
        shading: { value: 1.6 },
        baseInk: { value: 0.16 },
        maxBar: { value: 0.24 },
        cellRatio: { value: 2.2 },
        cutoff: { value: 0.02 },
        dashColor: { value: new THREE.Color(0x4a38f5) },
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
    blurVerticalScene.add(
      new THREE.Mesh(fullScreenGeometry, blurVerticalMaterial),
    );

    const postScene = new THREE.Scene();
    postScene.add(new THREE.Mesh(fullScreenGeometry, halftoneMaterial));

    let dragging = false;
    let pointerX = 0;
    let pointerY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let rotationX = 0;
    let rotationY = 0;
    let rotationZ = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let autoElapsed = 0;
    const clock = new THREE.Clock();

    const handlePointerDown = (event: PointerEvent) => {
      dragging = true;
      pointerX = event.clientX;
      pointerY = event.clientY;
      velocityX = 0;
      velocityY = 0;
      canvas.style.cursor = 'grabbing';
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragging) {
        return;
      }

      const deltaX = (event.clientX - pointerX) * 0.008;
      const deltaY = (event.clientY - pointerY) * 0.008;

      velocityX = deltaY;
      velocityY = deltaX;
      targetRotationY += deltaX;
      targetRotationX += deltaY;
      pointerX = event.clientX;
      pointerY = event.clientY;
    };

    const handlePointerUp = () => {
      dragging = false;
      canvas.style.cursor = 'grab';
    };

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
      halftoneMaterial.uniforms.resolution.value.set(
        virtualWidth,
        virtualHeight,
      );
    };

    const resizeObserver = new ResizeObserver(syncSize);
    resizeObserver.observe(container);

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerdown', handlePointerDown);

    const renderFrame = () => {
      if (cancelled) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(renderFrame);

      const elapsedTime = clock.getElapsedTime();
      const delta = 1 / 60;
      halftoneMaterial.uniforms.time.value = elapsedTime;

      let baseRotationX = 0;
      let baseRotationY = 0;

      if (!dragging) {
        autoElapsed += delta;
      }

      baseRotationY += autoElapsed * 0.3;
      baseRotationX += Math.sin(autoElapsed * 0.2) * 0.3;

      if (!dragging) {
        targetRotationX += velocityX;
        targetRotationY += velocityY;
        velocityX *= 0.92;
        velocityY *= 0.92;
      }

      let nextTargetX = baseRotationX + targetRotationX;
      let nextTargetY = baseRotationY + targetRotationY;
      let easing = 0.08;

      if (dragging) {
        nextTargetX = targetRotationX;
        nextTargetY = targetRotationY;
      }

      rotationX += (nextTargetX - rotationX) * easing;
      rotationY += (nextTargetY - rotationY) * easing;
      rotationZ += (0 - rotationZ) * 0.12;

      mesh.rotation.set(rotationX, rotationY, rotationZ);

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

      geometry.dispose();
      disposeMaterial(material);
      fullScreenGeometry.dispose();
      blurHorizontalMaterial.dispose();
      blurVerticalMaterial.dispose();
      halftoneMaterial.dispose();
      sceneTarget.dispose();
      blurTargetA.dispose();
      blurTargetB.dispose();
      environmentTexture.dispose();
      renderer.dispose();

      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  return <StyledVisualMount aria-hidden ref={mountReference} />;
}
