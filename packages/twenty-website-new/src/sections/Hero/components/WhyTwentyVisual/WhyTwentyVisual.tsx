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

// Same scanline shader as ProductVisual / IllustrationCardVisual; white uColor for Why Twenty.
const scanlineVertexShader = /* glsl */ `
  varying vec3 vLocalPosition;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  void main() {
    vLocalPosition = position;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const scanlineFragmentShader = /* glsl */ `
  uniform vec3 uCameraPosition;
  uniform vec3 uColor;
  uniform vec3 uDigitFillColor;
  uniform vec2 uDigitCenterXY;
  uniform vec2 uDigitRadiusXY;
  uniform float uDigitZMin;
  uniform vec3 uLightDir;
  uniform float uStripeScale;

  varying vec3 vLocalPosition;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 lightDir = normalize(uLightDir);
    vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
    float ndotl = max(dot(normal, lightDir), 0.06);
    float ndotv = abs(dot(normal, viewDir));

    vec2 delta =
      (vLocalPosition.xy - uDigitCenterXY) / max(uDigitRadiusXY, vec2(0.0001));
    float inDigitXY = 1.0 - smoothstep(0.88, 1.42, length(delta));
    float inDigitZ = smoothstep(uDigitZMin - 2.5, uDigitZMin + 1.2, vLocalPosition.z);
    float facing = smoothstep(0.08, 0.72, ndotv);
    float digitMask = clamp(inDigitXY * mix(0.55, 1.0, inDigitZ) * facing, 0.0, 1.0);

    if (digitMask > 0.62) {
      gl_FragColor = vec4(uDigitFillColor, 1.0);
      return;
    }

    // Single-mesh GLB: offset stripe phase by normal so cutout "20" walls do not line up with the
    // rear face (reduces moiré / camouflage).
    float stripePhase =
      vWorldPosition.y * uStripeScale +
      (normal.x * 1.15 + normal.z * 0.9 + normal.y * 0.5) * 3.4;
    float cell = fract(stripePhase);

    // Grazing / engraved faces read brighter and keep slightly wider bands.
    float groove = smoothstep(0.1, 0.92, 1.0 - ndotv);

    float shadowWeight = mix(1.0, 0.48, ndotl);
    shadowWeight *= mix(1.0, 0.78, groove * 0.7);

    float lineWidth = 0.58 * shadowWeight;
    float edge = 0.035;
    float band = 1.0 - smoothstep(lineWidth, lineWidth + edge, cell);

    float highlight = pow(ndotl, 1.35);
    float dash = fract(vWorldPosition.x * 20.0 + vWorldPosition.z * 6.0);
    float dashMask = mix(
      1.0,
      smoothstep(0.15, 0.45, dash) * (1.0 - smoothstep(0.55, 0.88, dash)),
      highlight
    );
    band *= dashMask;

    float speckle = fract(
      sin(dot(vWorldPosition.xz, vec2(127.1, 311.7))) * 43758.5453
    );
    band *= mix(1.0, 0.55 + 0.45 * step(0.4, speckle), highlight * 0.85);

    if (band < 0.015) {
      discard;
    }

    vec3 lit = uColor * mix(0.78, 1.22, ndotl);
    lit *= 1.0 + groove * 0.5;
    lit *= 1.0 + smoothstep(0.4, 0.92, 1.0 - ndotv) * 0.22;

    gl_FragColor = vec4(lit, band);
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

function createWhyTwentyScanlineMaterial(lightDirection: THREE.Vector3) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uCameraPosition: { value: new THREE.Vector3() },
      uColor: { value: new THREE.Color('#ffffff') },
      uDigitFillColor: { value: new THREE.Color('#0a0a0c') },
      uDigitCenterXY: { value: new THREE.Vector2(0, 0) },
      uDigitRadiusXY: { value: new THREE.Vector2(1, 1) },
      uDigitZMin: { value: 0 },
      uLightDir: { value: lightDirection.clone() },
      uStripeScale: { value: 16.0 },
    },
    vertexShader: scanlineVertexShader,
    fragmentShader: scanlineFragmentShader,
    transparent: true,
    depthWrite: true,
    depthTest: true,
    side: THREE.DoubleSide,
  });
}

function applyWhyTwentyScanlineMaterials(
  modelRoot: THREE.Object3D,
  lightDirection: THREE.Vector3,
) {
  modelRoot.traverse((sceneObject) => {
    if (!(sceneObject instanceof THREE.Mesh)) {
      return;
    }

    const geometry = sceneObject.geometry;
    if (!geometry.getAttribute('position')) {
      return;
    }

    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (!box) {
      return;
    }

    const centerX = (box.min.x + box.max.x) / 2;
    const centerY = (box.min.y + box.max.y) / 2;
    const sizeX = box.max.x - box.min.x;
    const sizeY = box.max.y - box.min.y;
    const sizeZ = box.max.z - box.min.z;

    const material = createWhyTwentyScanlineMaterial(lightDirection);
    material.uniforms.uDigitCenterXY.value.set(centerX, centerY);
    material.uniforms.uDigitRadiusXY.value.set(
      Math.max(sizeX * 0.135, 0.01),
      Math.max(sizeY * 0.105, 0.01),
    );
    material.uniforms.uDigitZMin.value = box.max.z - sizeZ * 0.14;

    sceneObject.material = material;
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
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.height = '100%';
    canvas.style.width = '100%';
    canvas.style.cursor = 'crosshair';
    container.appendChild(canvas);

    const clock = new THREE.Clock();
    const lightDirectionWorld = new THREE.Vector3(4, 8, 6).normalize();
    const cameraWorldPosition = new THREE.Vector3();

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

      modelRoot.rotation.set(0, -0.2, -0.2);

      applyWhyTwentyScanlineMaterials(modelRoot, lightDirectionWorld);

      pivot.add(modelRoot);

      pivot.position.x = 0.25;

      const renderFrame = () => {
        if (cancelled) return;

        animationFrameId = window.requestAnimationFrame(renderFrame);
        const time = clock.getElapsedTime();

        // Elegant, breathing float animation
        pivot.position.y = Math.sin(time * 1.5) * 0.06;

        // Fluid, luxurious mouse interaction (damped)
        pivot.rotation.x += (targetRotationX - pivot.rotation.x) * 0.05;
        pivot.rotation.y += (targetRotationY - pivot.rotation.y) * 0.05;

        camera.getWorldPosition(cameraWorldPosition);
        modelRoot.traverse((sceneObject) => {
          if (
            sceneObject instanceof THREE.Mesh &&
            sceneObject.material instanceof THREE.ShaderMaterial &&
            sceneObject.material.uniforms.uCameraPosition
          ) {
            sceneObject.material.uniforms.uCameraPosition.value.copy(
              cameraWorldPosition,
            );
          }
        });

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
