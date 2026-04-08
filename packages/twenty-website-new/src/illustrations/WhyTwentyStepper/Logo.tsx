'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const GLB_URL = '/illustrations/why-twenty/stepper/logo.glb';

const VisualColumn = styled.div`
  min-width: 0;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 672px;
    position: sticky;
    top: ${theme.spacing(10)};
  }
`;

const VisualContainer = styled.div`
  background-color: transparent;
  border-radius: ${theme.radius(1)};
  height: min(705px, 70vw);
  min-height: ${theme.spacing(80)};
  overflow: hidden;
  position: relative;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: 705px;
    max-width: 672px;
  }
`;

const GlbMount = styled.div`
  display: block;
  height: 100%;
  inset: 0;
  min-width: 0;
  position: absolute;
  width: 100%;
`;

const retroVertexShader = /* glsl */ `
  varying vec3 vLocalPosition;
  varying vec3 vWorldPosition;

  void main() {
    vLocalPosition = position;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const retroFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec2 uDigitCenterXY;
  uniform vec2 uDigitRadiusXY;
  uniform float uDigitZMin;
  uniform float uStripeScale;

  varying vec3 vLocalPosition;
  varying vec3 vWorldPosition;

  void main() {
    vec2 delta =
      (vLocalPosition.xy - uDigitCenterXY) / max(uDigitRadiusXY, vec2(0.0001));
    float inDigitXY = 1.0 - smoothstep(0.88, 1.42, length(delta));
    float inDigitZ = smoothstep(uDigitZMin - 2.5, uDigitZMin + 1.2, vLocalPosition.z);

    float digitMask = clamp(inDigitXY * mix(0.55, 1.0, inDigitZ), 0.0, 1.0);

    if (digitMask > 0.62) {
      discard;
    }

    // Left-to-right gradient based on world X
    float xGrad = smoothstep(-1.2, 1.2, vWorldPosition.x);

    // Horizontal stripes based on world Y
    float y = vWorldPosition.y * uStripeScale;
    float cell = fract(y);

    float lineWidth = mix(0.85, 0.0, xGrad);
    float edge = 0.04;
    float band = 1.0 - smoothstep(lineWidth, lineWidth + edge, cell);

    // Dash effect increases from left to right
    float dashPhase = vWorldPosition.x * 25.0 + vWorldPosition.y * 12.0;
    float dash = fract(dashPhase);

    float dashStrength = smoothstep(0.1, 0.9, xGrad);

    float dashMask = mix(
      1.0,
      smoothstep(0.1, 0.3, dash) * (1.0 - smoothstep(0.4, 0.9, dash)),
      dashStrength
    );

    // Add speckle noise for the retro feel
    float speckle = fract(sin(dot(vWorldPosition.xy, vec2(12.9898, 78.233))) * 43758.5453);
    float speckleMask = mix(1.0, step(0.3, speckle), dashStrength * 0.8);

    band *= dashMask * speckleMask;

    if (band < 0.05) {
      discard;
    }

    gl_FragColor = vec4(uColor, 1.0);
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

function createRetroScreenStripeMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color('#000000') },
      uDigitCenterXY: { value: new THREE.Vector2(0, 0) },
      uDigitRadiusXY: { value: new THREE.Vector2(1, 1) },
      uDigitZMin: { value: 0 },
      uStripeScale: { value: 22.0 },
    },
    vertexShader: retroVertexShader,
    fragmentShader: retroFragmentShader,
    transparent: true,
    depthWrite: true,
    depthTest: true,
    side: THREE.DoubleSide,
  });
}

function applyRetroScreenStripeMaterials(modelRoot: THREE.Object3D) {
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

    const material = createRetroScreenStripeMaterial();
    material.uniforms.uDigitCenterXY.value.set(centerX, centerY);
    material.uniforms.uDigitRadiusXY.value.set(
      Math.max(sizeX * 0.135, 0.01),
      Math.max(sizeY * 0.105, 0.01),
    );
    material.uniforms.uDigitZMin.value = box.max.z - sizeZ * 0.14;

    sceneObject.material = material;
  });
}

export function Logo() {
  const glbMountReference = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = glbMountReference.current;
    if (!container) {
      return;
    }

    let cancelled = false;
    let animationFrameId = 0;

    let modelHalfX = 0.55;
    let modelHalfY = 0.55;

    const scene = new THREE.Scene();
    const width = container.clientWidth;
    const height = container.clientHeight;
    const aspect = width / Math.max(height, 1);

    const camera = new THREE.OrthographicCamera(
      -aspect,
      aspect,
      1,
      -1,
      0.1,
      100,
    );
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    const updateOrthoFrustum = () => {
      const w = container.clientWidth;
      const h = Math.max(container.clientHeight, 1);
      const asp = w / h;
      const halfH = Math.max(modelHalfY, modelHalfX / asp);
      const halfW = halfH * asp;
      camera.left = -halfW;
      camera.right = halfW;
      camera.top = halfH;
      camera.bottom = -halfH;
      camera.updateProjectionMatrix();
    };

    updateOrthoFrustum();

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const canvas = renderer.domElement;
    canvas.style.cursor = 'crosshair';
    canvas.style.display = 'block';
    canvas.style.height = '100%';
    canvas.style.width = '100%';
    container.appendChild(canvas);

    const clock = new THREE.Clock();

    const pivot = new THREE.Group();
    scene.add(pivot);

    let targetRotationX = 0;
    let targetRotationY = 0;

    const syncResolutionUniforms = () => {
      const rw = canvas.width;
      const rh = canvas.height;
      pivot.traverse((sceneObject) => {
        if (
          sceneObject instanceof THREE.Mesh &&
          sceneObject.material instanceof THREE.ShaderMaterial &&
          sceneObject.material.uniforms.uResolution
        ) {
          sceneObject.material.uniforms.uResolution.value.set(rw, rh);
        }
      });
    };

    syncResolutionUniforms();

    const loader = new GLTFLoader();
    loader.load(GLB_URL, (gltf) => {
      if (cancelled) {
        disposeObjectSubtree(gltf.scene);
        return;
      }

      const modelRoot = gltf.scene;
      const bounds = new THREE.Box3().setFromObject(modelRoot);
      const center = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());
      const maxAxis = Math.max(size.x, size.y, size.z, 0.001);

      const scale = 2.72 / maxAxis;

      modelRoot.position.sub(center);
      modelRoot.scale.setScalar(scale);
      modelRoot.rotation.set(0, -0.2, -0.2);

      applyRetroScreenStripeMaterials(modelRoot);

      pivot.add(modelRoot);

      const fitBox = new THREE.Box3().setFromObject(pivot);
      const fitSize = new THREE.Vector3();
      fitBox.getSize(fitSize);
      const fitPad = 1.1;
      modelHalfX = (fitSize.x * fitPad) / 2;
      modelHalfY = (fitSize.y * fitPad) / 2;

      updateOrthoFrustum();
      syncResolutionUniforms();

      const renderFrame = () => {
        if (cancelled) {
          return;
        }

        animationFrameId = window.requestAnimationFrame(renderFrame);
        const time = clock.getElapsedTime();

        pivot.position.y = Math.sin(time * 1.2) * 0.025;

        pivot.rotation.x += (targetRotationX - pivot.rotation.x) * 0.06;
        pivot.rotation.y += (targetRotationY - pivot.rotation.y) * 0.06;

        renderer.render(scene, camera);
      };

      renderFrame();
    });

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

      targetRotationY = x * 0.1;
      targetRotationX = y * 0.08;
    };

    const handlePointerLeave = () => {
      targetRotationX = 0;
      targetRotationY = 0;
    };

    const handleResize = () => {
      if (!container || cancelled) {
        return;
      }
      const nextWidth = container.clientWidth;
      const nextHeight = container.clientHeight;
      renderer.setSize(nextWidth, nextHeight);
      updateOrthoFrustum();
      syncResolutionUniforms();
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
    <VisualColumn>
      <VisualContainer>
        <GlbMount aria-hidden ref={glbMountReference} />
      </VisualContainer>
    </VisualColumn>
  );
}
