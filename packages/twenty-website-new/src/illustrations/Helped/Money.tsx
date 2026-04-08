'use client';

import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const GLB_URL = '/illustrations/home/helped/money.glb';

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
  uniform vec3 uCameraPosition;
  uniform vec3 uColor;
  uniform vec3 uLightDir;
  uniform float uStripeScale;

  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 lightDir = normalize(uLightDir);
    vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
    float ndotl = max(dot(normal, lightDir), 0.05);
    float ndotv = abs(dot(normal, viewDir));

    float y = vWorldPosition.y * uStripeScale;
    float cell = fract(y);

    // Narrow colored bands so most of each stripe period reads as background.
    float shadowWeight = mix(1.0, 0.62, ndotl);
    float lineWidth = 0.26 * shadowWeight;
    float edge = 0.024;
    float band = 1.0 - smoothstep(lineWidth, lineWidth + edge, cell);

    float highlight = pow(ndotl, 1.25);
    float dash = fract(vWorldPosition.x * 18.0 + vWorldPosition.z * 5.0);
    float dashMask = mix(
      1.0,
      smoothstep(0.18, 0.48, dash) * (1.0 - smoothstep(0.58, 0.86, dash)),
      highlight * 0.4
    );
    band *= dashMask;

    float speckle = fract(
      sin(dot(vWorldPosition.xz, vec2(127.1, 311.7))) * 43758.5453
    );
    band *= mix(1.0, 0.62 + 0.38 * step(0.42, speckle), highlight * 0.42);

    // Silhouettes and shadowed sides fall back to transparent (card shows through).
    float viewFacing = pow(clamp(ndotv, 0.04, 1.0), 0.52);
    float lightFacing = pow(clamp(ndotl, 0.1, 1.0), 0.88);
    float alpha = band * viewFacing * lightFacing;

    // Brighten RGB vs flat uColor; alpha above still drives edge transparency.
    float lightTint = mix(0.72, 1.58, pow(ndotl, 0.82));
    float viewTint = mix(0.88, 1.14, viewFacing);
    const float colorGain = 1.22;
    vec3 lit = uColor * lightTint * viewTint * colorGain;

    if (alpha < 0.02) {
      discard;
    }

    gl_FragColor = vec4(lit, alpha);
  }
`;

function createScanlineMaterial(
  lightDirection: THREE.Vector3,
  stripeColor: string,
) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uCameraPosition: { value: new THREE.Vector3() },
      uColor: { value: new THREE.Color(stripeColor) },
      uLightDir: { value: lightDirection.clone() },
      uStripeScale: { value: 23.0 },
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

type MeshRestPose = {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  wobblePhase: number;
};

function applyScanlineMaterials(
  modelRoot: THREE.Object3D,
  lightDirection: THREE.Vector3,
  stripeColor: string,
) {
  modelRoot.traverse((sceneObject) => {
    if (!(sceneObject instanceof THREE.Mesh)) {
      return;
    }

    sceneObject.material = createScanlineMaterial(lightDirection, stripeColor);

    const mesh = sceneObject;
    const rest: MeshRestPose = {
      position: mesh.position.clone(),
      quaternion: mesh.quaternion.clone(),
      wobblePhase: mesh.position.y * 4.2 + mesh.position.x * 1.7,
    };
    mesh.userData.helpedMoneyMeshRest = rest;
  });
}

const StyledVisualMount = styled.div`
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

export function Money() {
  const mountReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountReference.current;
    if (!container) {
      return;
    }

    let cancelled = false;
    let animationFrameId = 0;

    const pointer = { x: 0, y: 0, inside: false };
    const targetRotation = { x: 0, y: 0 };
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
    canvas.style.touchAction = 'none';
    canvas.style.width = '100%';
    canvas.style.cursor = 'pointer';
    container.appendChild(canvas);

    const pivot = new THREE.Group();
    scene.add(pivot);

    const cameraWorldPosition = new THREE.Vector3();
    const clock = new THREE.Clock();

    const loader = new GLTFLoader();
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
        const scale = (2.75 * 1.1) / maxAxis;

        modelRoot.position.sub(center);
        modelRoot.scale.setScalar(scale);

        applyScanlineMaterials(modelRoot, lightDirectionWorld, '#E4E58A');
        pivot.add(modelRoot);

        const renderFrame = () => {
          if (cancelled) {
            return;
          }

          animationFrameId = window.requestAnimationFrame(renderFrame);
          const delta = Math.min(clock.getDelta(), 0.1);

          const motion = 1.1;
          const rotationDamp = 6.8;
          const influence = pointer.inside ? 1 : 0.38;
          targetRotation.y = pointer.x * 0.78 * motion * influence;
          targetRotation.x = pointer.y * 0.62 * motion * influence;

          pivot.rotation.y = THREE.MathUtils.damp(
            pivot.rotation.y,
            targetRotation.y,
            rotationDamp,
            delta,
          );
          pivot.rotation.x = THREE.MathUtils.damp(
            pivot.rotation.x,
            targetRotation.x,
            rotationDamp,
            delta,
          );

          const hoverLift = pointer.inside ? 1 : 0;
          pivot.scale.setScalar(
            THREE.MathUtils.damp(
              pivot.scale.x,
              1 + hoverLift * 0.12 * motion,
              7,
              delta,
            ),
          );

          const pointerFollow = pointer.inside ? 1 : 0.32;
          const mx = pointer.x * pointerFollow;
          const my = pointer.y * pointerFollow;
          const wobbleAttenuation = pointer.inside ? 1 : 0.36;

          modelRoot.traverse((sceneObject) => {
            if (!(sceneObject instanceof THREE.Mesh)) {
              return;
            }

            const rest = sceneObject.userData.helpedMoneyMeshRest as
              | MeshRestPose
              | undefined;
            if (!rest) {
              return;
            }

            const phase = rest.wobblePhase;
            sceneObject.position.x =
              rest.position.x + mx * motion * 0.22 * Math.sin(phase * 1.8);
            sceneObject.position.z =
              rest.position.z + my * motion * 0.19 * Math.cos(phase * 1.4);
            sceneObject.position.y =
              rest.position.y +
              (mx + my) * motion * 0.055 * Math.sin(phase * 2.5);

            const twist =
              motion *
              (mx * 0.34 + my * 0.24) *
              wobbleAttenuation *
              Math.sin(phase);
            sceneObject.quaternion.copy(rest.quaternion);
            sceneObject.rotateY(twist);
          });

          camera.getWorldPosition(cameraWorldPosition);
          modelRoot.traverse((sceneObject) => {
            if (!(sceneObject instanceof THREE.Mesh)) {
              return;
            }
            const material = sceneObject.material;
            if (
              material instanceof THREE.ShaderMaterial &&
              material.uniforms.uCameraPosition
            ) {
              material.uniforms.uCameraPosition.value.copy(cameraWorldPosition);
            }
          });

          renderer.render(scene, camera);
        };

        renderFrame();
      },
      undefined,
      undefined,
    );

    const setPointerFromEvent = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const normalizedX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const normalizedY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      pointer.x = THREE.MathUtils.clamp(normalizedX, -1, 1);
      pointer.y = THREE.MathUtils.clamp(normalizedY, -1, 1);
    };

    const handlePointerEnter = () => {
      pointer.inside = true;
    };

    const handlePointerLeave = () => {
      pointer.inside = false;
      pointer.x = 0;
      pointer.y = 0;
    };

    const handlePointerMove = (event: PointerEvent) => {
      setPointerFromEvent(event);
    };

    canvas.addEventListener('pointerenter', handlePointerEnter);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    canvas.addEventListener('pointermove', handlePointerMove);

    const handleResize = () => {
      if (!mountReference.current || cancelled) {
        return;
      }

      const nextWidth = mountReference.current.clientWidth;
      const nextHeight = mountReference.current.clientHeight;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('pointerenter', handlePointerEnter);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('pointermove', handlePointerMove);
      window.cancelAnimationFrame(animationFrameId);
      disposeObjectSubtree(scene);
      renderer.dispose();

      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  return <StyledVisualMount aria-hidden ref={mountReference} />;
}
