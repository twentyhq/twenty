'use client';

import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import NextImage from 'next/image';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const HERO_BACKGROUND_SRC = '/images/why-twenty/hero/background.png';
const HERO_GLB_URL = '/illustrations/why-twenty/hero/hero.glb';

const VisualContainer = styled.div`
  border-radius: ${theme.radius(1)};
  height: 462px;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const BackgroundLayer = styled.div`
  inset: 0;
  position: absolute;
  z-index: 0;
`;

const backgroundImageClassName = css`
  object-fit: cover;
  object-position: center;
`;

const GlbMount = styled.div`
  display: block;
  height: 100%;
  inset: 0;
  min-width: 0;
  position: absolute;
  width: 100%;
  z-index: 1;
`;

const partyStripVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const partyStripFragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  void main() {
    // 1. Crisp world-space horizontal slices
    // Keeps stripes perfectly level even when the object tilts, creating a scanning hologram effect.
    float stripeScale = 50.0;
    float posMap = vWorldPosition.y * stripeScale;

    float stripeId = floor(posMap);
    float stripePos = fract(posMap);

    // Very thin, sharp lines
    float lineThickness = 0.25;
    float aa = 0.05;
    float stripAlpha = smoothstep(lineThickness + aa, lineThickness, stripePos);

    if (stripAlpha < 0.01) {
      discard;
    }

    // 2. Alternating party-light flicker
    float isEven = mod(stripeId, 2.0);
    float isOdd = 1.0 - isEven;

    // Organic wave pulsing
    float wave1 = sin(uTime * 3.0 + stripeId * 0.05);
    float wave2 = cos(uTime * 3.0 - stripeId * 0.05);

    // Stripes alternate their pulse rhythm
    float glow = isEven * (0.5 + 0.5 * wave1) + isOdd * (0.5 + 0.5 * wave2);

    // Occasional spark/strobe flash
    float strobeNoise = hash(stripeId * 12.9898 + floor(uTime * 3.0));
    float strobe = step(0.95, strobeNoise); // 5% chance to flash bright

    // Base brightness composition
    float brightness = 0.15 + glow * 0.5 + strobe * 0.8;
    brightness = clamp(brightness, 0.0, 1.0);

    // 3. Fresnel (rim light) to emphasize 3D form and edges
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = 1.0 - max(dot(normalize(vNormal), viewDir), 0.0);
    fresnel = pow(fresnel, 2.5);

    // 4. Final output
    float finalAlpha = stripAlpha * brightness + (stripAlpha * fresnel * 0.5);
    finalAlpha = clamp(finalAlpha, 0.0, 1.0);

    // Pure white color modulated strictly by alpha
    gl_FragColor = vec4(vec3(1.0), finalAlpha);
  }
`;

function disposeObjectSubtree(root: THREE.Object3D) {
  root.traverse((sceneObject) => {
    if (!(sceneObject instanceof THREE.Mesh)) {
      return;
    }
    sceneObject.geometry?.dispose();
    const material = sceneObject.material;
    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose());
    } else {
      material?.dispose();
    }
  });
}

function applyPremiumStripMaterials(
  modelRoot: THREE.Object3D,
  timeUniform: { value: number },
) {
  modelRoot.traverse((sceneObject) => {
    if (!(sceneObject instanceof THREE.Mesh)) {
      return;
    }
    sceneObject.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: timeUniform,
      },
      vertexShader: partyStripVertexShader,
      fragmentShader: partyStripFragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
  });
}

export function WhyTwentyVisual() {
  const glbMountReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = glbMountReference.current;
    if (!container) return;

    let cancelled = false;
    let animationFrameId = 0;

    const scene = new THREE.Scene();
    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.height = '100%';
    canvas.style.width = '100%';
    canvas.style.cursor = 'crosshair';
    container.appendChild(canvas);

    const clock = new THREE.Clock();
    const timeUniform = { value: 0 };

    const pivot = new THREE.Group();
    scene.add(pivot);

    let targetRotationX = 0;
    let targetRotationY = 0;

    const loader = new GLTFLoader();
    loader.load(HERO_GLB_URL, (gltf) => {
      if (cancelled) {
        disposeObjectSubtree(gltf.scene);
        return;
      }

      const modelRoot = gltf.scene;
      const bounds = new THREE.Box3().setFromObject(modelRoot);
      const center = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());
      const maxAxis = Math.max(size.x, size.y, size.z, 0.001);

      const scale = 1.65 / maxAxis;

      modelRoot.position.sub(center);
      modelRoot.scale.setScalar(scale);

      modelRoot.rotation.set(0, 0, -0.25);

      applyPremiumStripMaterials(modelRoot, timeUniform);

      pivot.add(modelRoot);

      pivot.position.x = 0.25;

      const renderFrame = () => {
        if (cancelled) return;

        animationFrameId = window.requestAnimationFrame(renderFrame);
        const time = clock.getElapsedTime();
        timeUniform.value = time;

        // Elegant, breathing float animation
        pivot.position.y = Math.sin(time * 1.5) * 0.06;

        // Fluid, luxurious mouse interaction (damped)
        pivot.rotation.x += (targetRotationX - pivot.rotation.x) * 0.05;
        pivot.rotation.y += (targetRotationY - pivot.rotation.y) * 0.05;

        renderer.render(scene, camera);
      };

      renderFrame();
    });

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      // Subtle tilt ranges
      targetRotationY = x * 0.35;
      targetRotationX = y * 0.25;
    };

    const handlePointerLeave = () => {
      targetRotationX = 0;
      targetRotationY = 0;
    };

    const handleResize = () => {
      if (!container || cancelled) return;
      const nextWidth = container.clientWidth;
      const nextHeight = container.clientHeight;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      window.cancelAnimationFrame(animationFrameId);
      disposeObjectSubtree(scene);
      renderer.dispose();
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  return (
    <VisualContainer>
      <BackgroundLayer>
        <NextImage
          alt="Why Twenty hero background"
          className={backgroundImageClassName}
          fill
          priority
          sizes="100vw"
          src={HERO_BACKGROUND_SRC}
        />
      </BackgroundLayer>
      <GlbMount ref={glbMountReference} />
    </VisualContainer>
  );
}
