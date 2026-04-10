'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const GLB_URL = '/illustrations/common/faq/faq.glb';

// World spin axis (x, y, z). Camera on +Z: (0,0,1) = spinner in the view plane.
// Try (0,1,0) or (1,0,0) if motion or framing looks wrong.
const scanlineVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const scanlineFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uLightDir;
  uniform float uStripeScale;

  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 lightDir = normalize(uLightDir);
    float ndotl = max(dot(normal, lightDir), 0.06);

    float y = vWorldPosition.y * uStripeScale;
    float cell = fract(y);

    float shadowWeight = mix(1.0, 0.5, ndotl);
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

    vec3 lit = uColor * mix(0.72, 1.18, ndotl);
    gl_FragColor = vec4(lit, band);
  }
`;

function createScanlineMaterial(lightDirection: THREE.Vector3) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color('#1e5bff') },
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

function applyScanlineMaterials(
  modelRoot: THREE.Object3D,
  lightDirection: THREE.Vector3,
) {
  modelRoot.traverse((sceneObject) => {
    if (!(sceneObject instanceof THREE.Mesh)) {
      return;
    }

    sceneObject.material = createScanlineMaterial(lightDirection);
  });
}

const FaqVisualShell = styled.div`
  bottom: 0;
  display: block;
  left: auto;
  opacity: 0.45;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  right: -5%;
  top: 0;
  transform: translateY(-11%);
  width: min(70vw, 750px);

  @media (min-width: ${theme.breakpoints.md}px) {
    right: -10%;
    transform: translateY(-12%);
    width: min(60vw, 900px);
  }
`;

const FaqVisualCanvasMount = styled.div`
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

export function FaqBackground() {
  const mountReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountReference.current;
    if (!container) {
      return;
    }

    let cancelled = false;
    let animationFrameId = 0;

    const lightDirectionWorld = new THREE.Vector3(4, 8, 6).normalize();

    const scene = new THREE.Scene();
    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.05);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.height = '100%';
    canvas.style.width = '100%';
    container.appendChild(canvas);

    const wheel = new THREE.Group();
    scene.add(wheel);

    const spinAxisWorld = new THREE.Vector3(0, 0, 1).normalize();

    const clock = new THREE.Clock();

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      'https://www.gstatic.com/draco/versioned/decoders/1.5.6/',
    );

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      GLB_URL,
      (gltf) => {
        if (cancelled) {
          disposeObjectSubtree(gltf.scene);
          return;
        }

        const modelRoot = gltf.scene;
        const bounds = new THREE.Box3().setFromObject(modelRoot);
        const center = bounds.getCenter(new THREE.Vector3());
        const size = bounds.getSize(new THREE.Vector3());
        const maxAxis = Math.max(size.x, size.y, size.z, 0.001);
        const scale = 4 / maxAxis;

        modelRoot.position.sub(center);
        modelRoot.scale.setScalar(scale);

        applyScanlineMaterials(modelRoot, lightDirectionWorld);
        wheel.add(modelRoot);
        wheel.position.y = 0.52;

        const renderFrame = () => {
          if (cancelled) {
            return;
          }

          animationFrameId = window.requestAnimationFrame(renderFrame);
          const delta = Math.min(clock.getDelta(), 0.1);
          wheel.rotateOnWorldAxis(spinAxisWorld, -delta * 0.5);
          renderer.render(scene, camera);
        };

        renderFrame();
      },
      undefined,
      undefined,
    );

    const handleResize = () => {
      if (!mountReference.current || cancelled) {
        return;
      }

      const nextWidth = mountReference.current.clientWidth;
      const nextHeight = mountReference.current.clientHeight;
      if (nextWidth < 1 || nextHeight < 1) {
        return;
      }
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', handleResize);
      window.cancelAnimationFrame(animationFrameId);
      disposeObjectSubtree(scene);
      renderer.dispose();
      dracoLoader.dispose();

      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  return (
    <FaqVisualShell>
      <FaqVisualCanvasMount aria-hidden ref={mountReference} />
    </FaqVisualShell>
  );
}
