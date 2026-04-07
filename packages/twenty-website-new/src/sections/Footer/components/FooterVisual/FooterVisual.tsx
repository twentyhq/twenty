'use client';

import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Framing for the extruded “ZO” hero shot (low angle, centered, room below for links).
const FOOTER_VISUAL_MODEL_FIT_SCALE = 5;
const FOOTER_VISUAL_MODEL_OFFSET_Y = 0.42;
const FOOTER_VISUAL_CAMERA_POSITION: readonly [number, number, number] = [
  0, -1.35, 7.4,
];
const FOOTER_VISUAL_CAMERA_LOOK_AT: readonly [number, number, number] = [
  0, 0.55, 0,
];

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

function createFooterScanlineMaterial(lightDirection: THREE.Vector3) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color('#b0b0b0') },
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

type MeshRestPose = {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  wobblePhase: number;
};

function applyFooterScanlineMaterials(
  modelRoot: THREE.Object3D,
  lightDirection: THREE.Vector3,
) {
  modelRoot.traverse((sceneObject) => {
    if (!(sceneObject instanceof THREE.Mesh)) {
      return;
    }

    sceneObject.material = createFooterScanlineMaterial(lightDirection);

    const mesh = sceneObject;
    const rest: MeshRestPose = {
      position: mesh.position.clone(),
      quaternion: mesh.quaternion.clone(),
      wobblePhase: mesh.position.y * 4.2 + mesh.position.x * 1.7,
    };
    mesh.userData.footerVisualRest = rest;
  });
}

const FooterVisualCanvasMount = styled.div`
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

export type FooterVisualProps = {
  src: string;
  title: string;
};

export function FooterVisual({ src, title }: FooterVisualProps) {
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
    const lightDirectionWorld = new THREE.Vector3(2, 10, 5).normalize();

    const scene = new THREE.Scene();
    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(
      FOOTER_VISUAL_CAMERA_POSITION[0],
      FOOTER_VISUAL_CAMERA_POSITION[1],
      FOOTER_VISUAL_CAMERA_POSITION[2],
    );
    camera.lookAt(
      new THREE.Vector3(
        FOOTER_VISUAL_CAMERA_LOOK_AT[0],
        FOOTER_VISUAL_CAMERA_LOOK_AT[1],
        FOOTER_VISUAL_CAMERA_LOOK_AT[2],
      ),
    );

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const canvas = renderer.domElement;
    canvas.style.cursor = 'pointer';
    canvas.style.display = 'block';
    canvas.style.height = '100%';
    canvas.style.touchAction = 'none';
    canvas.style.width = '100%';
    container.appendChild(canvas);

    const pivot = new THREE.Group();
    scene.add(pivot);

    const clock = new THREE.Clock();

    const loader = new GLTFLoader();
    loader.load(
      src,
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
        const scale = FOOTER_VISUAL_MODEL_FIT_SCALE / maxAxis;

        modelRoot.position.sub(center);
        modelRoot.scale.setScalar(scale);
        modelRoot.position.y += FOOTER_VISUAL_MODEL_OFFSET_Y;

        applyFooterScanlineMaterials(modelRoot, lightDirectionWorld);
        pivot.add(modelRoot);

        const renderFrame = () => {
          if (cancelled) {
            return;
          }

          animationFrameId = window.requestAnimationFrame(renderFrame);
          const delta = Math.min(clock.getDelta(), 0.1);

          const rotationDamp = 6.8;
          const influence = pointer.inside ? 1 : 0.38;
          targetRotation.y = pointer.x * 0.78 * influence;
          targetRotation.x = pointer.y * 0.62 * influence;

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
            THREE.MathUtils.damp(pivot.scale.x, 1 + hoverLift * 0.12, 7, delta),
          );

          const mx = pointer.x * (pointer.inside ? 1 : 0.32);
          const my = pointer.y * (pointer.inside ? 1 : 0.32);

          modelRoot.traverse((sceneObject) => {
            if (!(sceneObject instanceof THREE.Mesh)) {
              return;
            }

            const rest = sceneObject.userData.footerVisualRest as
              | MeshRestPose
              | undefined;
            if (!rest) {
              return;
            }

            const phase = rest.wobblePhase;
            const wobble = pointer.inside ? 1 : 0.36;
            sceneObject.position.x =
              rest.position.x + mx * 0.22 * Math.sin(phase * 1.8);
            sceneObject.position.z =
              rest.position.z + my * 0.19 * Math.cos(phase * 1.4);
            sceneObject.position.y =
              rest.position.y + (mx + my) * 0.055 * Math.sin(phase * 2.5);

            const twist = (mx * 0.34 + my * 0.24) * wobble * Math.sin(phase);
            sceneObject.quaternion.copy(rest.quaternion);
            sceneObject.rotateY(twist);
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
  }, [src]);

  return (
    <FooterVisualCanvasMount
      aria-label={title}
      ref={mountReference}
      role="img"
    />
  );
}
