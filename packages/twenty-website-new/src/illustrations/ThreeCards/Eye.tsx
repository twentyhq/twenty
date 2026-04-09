'use client';

import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const GLB_URL = '/illustrations/product/three-cards/eye.glb';

const halftoneVertexShader = /* glsl */ `
  varying vec3 vWorldNormal;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const halftoneFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uLightDir;
  uniform vec2 uResolution;
  uniform float uNumRows;

  varying vec3 vWorldNormal;

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 lightDir = normalize(uLightDir);
    float ndotl = max(dot(normal, lightDir), 0.0);
    float lum = mix(0.35, 1.0, ndotl);

    float rowH = uResolution.y / uNumRows;
    float rowFrac = gl_FragCoord.y / rowH - floor(gl_FragCoord.y / rowH);
    float dy = abs(rowFrac - 0.5);

    float cellW = rowH * 2.2;
    float cellFrac = (gl_FragCoord.x - floor(gl_FragCoord.x / cellW) * cellW) / cellW;

    float fill = pow(lum, 0.45) * 0.95;

    float dynamicBarHalf = mix(0.15, 0.34, smoothstep(0.05, 0.8, lum));

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

    if (inDash < 0.01) {
      discard;
    }

    gl_FragColor = vec4(uColor, inDash);
  }
`;

function createHalftoneDashMaterial(
  lightDirection: THREE.Vector3,
  resolution: THREE.Vector2,
) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color('#1e5bff') },
      uLightDir: { value: lightDirection.clone() },
      uResolution: { value: resolution.clone() },
      uNumRows: { value: 65 },
    },
    vertexShader: halftoneVertexShader,
    fragmentShader: halftoneFragmentShader,
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

function applyHalftoneDashMaterials(
  modelRoot: THREE.Object3D,
  lightDirection: THREE.Vector3,
  resolution: THREE.Vector2,
) {
  modelRoot.traverse((sceneObject) => {
    if (!(sceneObject instanceof THREE.Mesh)) {
      return;
    }

    sceneObject.material = createHalftoneDashMaterial(
      lightDirection,
      resolution,
    );

    const mesh = sceneObject;
    const rest: MeshRestPose = {
      position: mesh.position.clone(),
      quaternion: mesh.quaternion.clone(),
      wobblePhase: mesh.position.y * 4.2 + mesh.position.x * 1.7,
    };
    mesh.userData.eyeMeshRest = rest;
  });
}

const StyledVisualMount = styled.div`
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

export function Eye() {
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

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(1);
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
        const scale = 2.75 / maxAxis;

        modelRoot.position.sub(center);
        modelRoot.scale.setScalar(scale);

        const canvasResolution = new THREE.Vector2(
          renderer.domElement.width,
          renderer.domElement.height,
        );
        applyHalftoneDashMaterials(
          modelRoot,
          lightDirectionWorld,
          canvasResolution,
        );
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

            const rest = sceneObject.userData.eyeMeshRest as
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
      if (nextWidth < 1 || nextHeight < 1) {
        return;
      }

      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);

      const rw = renderer.domElement.width;
      const rh = renderer.domElement.height;
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
