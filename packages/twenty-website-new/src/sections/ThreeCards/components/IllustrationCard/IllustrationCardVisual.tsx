'use client';

import type { IllustrationGlbTreatmentType } from '@/design-system/components/Illustration/types/Illustration';
import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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
  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float noise21(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 4; i++) {
      value += amplitude * noise21(p);
      p = p * 2.03 + vec2(17.1, 11.7);
      amplitude *= 0.5;
    }

    return value;
  }

  float animatedLightField(vec3 position, float time) {
    vec2 uv = vec2(
      position.x * 1.65 + position.z * 0.35,
      position.y * 1.95 - position.z * 0.55
    );
    float t = time * 0.9;

    float sweep = 0.5 + 0.5 * sin(uv.y * 6.8 - uv.x * 2.1 + t * 2.4);
    float arc = 0.5 + 0.5 * sin(
      length(vec2(position.x * 1.4 + 0.2, position.y * 1.1 - 0.1)) * 8.0 -
        t * 2.1
    );
    float cells = fbm(uv * 2.2 + vec2(t * 0.45, -t * 0.38));
    float pockets = smoothstep(
      0.4,
      0.78,
      fbm(uv * 3.7 - vec2(t * 0.3, t * 0.72))
    );

    return smoothstep(0.18, 0.92, sweep * 0.33 + arc * 0.27 + cells * 0.2 + pockets * 0.2);
  }

  float sdRoundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + vec2(r);
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  vec3 frostedGlassColor(
    vec3 position,
    vec3 normal,
    float ndotl,
    vec3 glassColor,
    vec3 glassHighlightColor
  ) {
    vec2 glassUv = vec2(
      position.x * 8.2 + position.z * 2.4,
      position.y * 10.6 - position.z * 1.6
    );
    float grain = fbm(glassUv * 0.85);
    float ripples = 0.5 + 0.5 * sin(glassUv.y * 3.5 + glassUv.x * 1.25 + grain * 4.4);
    float shards = fbm(glassUv * 1.9 + vec2(9.4, -7.1));

    vec3 viewDir = normalize(cameraPosition - position);
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.5);

    vec3 glassBase = mix(
      glassColor,
      glassHighlightColor,
      0.24 + ripples * 0.28 + shards * 0.18
    );
    glassBase *= mix(0.86, 1.06, ndotl);
    glassBase += vec3(0.018, 0.018, 0.022) * grain;
    glassBase = mix(
      glassBase,
      glassHighlightColor,
      fresnel * (0.34 + shards * 0.22)
    );

    return glassBase;
  }

  float patternedTileMask(vec2 position, float scaleX, float scaleY) {
    vec2 uv = vec2(position.x * scaleX, position.y * scaleY);
    float row = floor(uv.y);
    uv.x += 0.5 * mod(row, 2.0);

    vec2 cell = fract(uv) - 0.5;

    float pill = 1.0 - smoothstep(
      0.012,
      0.04,
      sdRoundedBox(cell, vec2(0.30, 0.13), 0.13)
    );

    vec2 connectorCell = cell - vec2(0.48, 0.0);
    float connector = 1.0 - smoothstep(
      0.82,
      1.03,
      abs(connectorCell.x) / 0.13 + abs(connectorCell.y) / 0.15
    );

    return max(pill, connector * 0.92);
  }

  uniform vec3 uColor;
  uniform vec3 uGlassColor;
  uniform vec3 uGlassHighlightColor;
  uniform vec3 uLightDir;
  uniform float uStripeScale;
  uniform float uStripeWidth;
  uniform float uStripeEdge;
  uniform float uDashScaleX;
  uniform float uDashScaleZ;
  uniform float uDashStart;
  uniform float uDashMidStart;
  uniform float uDashMidEnd;
  uniform float uDashEnd;
  uniform float uBandOpacity;
  uniform float uPatternAsBase;
  uniform float uPatternScaleX;
  uniform float uPatternScaleY;
  uniform float uTime;

  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 lightDir = normalize(uLightDir);
    float ndotl = max(dot(normal, lightDir), 0.06);

    float y = vWorldPosition.y * uStripeScale;
    float cell = fract(y);

    float shadowWeight = mix(1.0, 0.5, ndotl);
    float lineWidth = uStripeWidth * shadowWeight;
    float edge = uStripeEdge;
    float stripeBand = 1.0 - smoothstep(lineWidth, lineWidth + edge, cell);

    float highlight = pow(ndotl, 1.35);
    float dash = fract(
      vWorldPosition.x * uDashScaleX + vWorldPosition.z * uDashScaleZ
    );
    float dashMask = mix(
      1.0,
      smoothstep(uDashStart, uDashMidStart, dash) *
        (1.0 - smoothstep(uDashMidEnd, uDashEnd, dash)),
      highlight
    );
    stripeBand *= dashMask;

    float speckle = fract(
      sin(dot(vWorldPosition.xz, vec2(127.1, 311.7))) * 43758.5453
    );
    stripeBand *= mix(1.0, 0.55 + 0.45 * step(0.4, speckle), highlight * 0.85);

    vec2 patternUv = vec2(vWorldPosition.x, vWorldPosition.y);
    float patternBand = patternedTileMask(
      patternUv,
      uPatternScaleX,
      uPatternScaleY
    );

    float alpha = mix(stripeBand, 1.0, uPatternAsBase);

    if (alpha < 0.015) {
      discard;
    }

    float lightField = smoothstep(
      0.34,
      0.86,
      animatedLightField(vWorldPosition, uTime)
    );
    float shadowField = smoothstep(0.18, 0.78, 1.0 - lightField);
    float patternLift = mix(0.48, 1.72, lightField);
    float glassLift = mix(0.84, 1.18, lightField);
    float glow = pow(lightField, 1.8);

    vec3 stripeLit = uColor * mix(0.72, 1.18, ndotl);
    vec3 patternLit = uColor * mix(0.82, 1.14, ndotl) * patternLift;
    patternLit += uColor * glow * 0.28;
    vec3 glassLit = frostedGlassColor(
      vWorldPosition,
      normal,
      ndotl,
      uGlassColor,
      uGlassHighlightColor
    );
    glassLit *= glassLift;
    glassLit *= 1.0 - shadowField * 0.12;
    glassLit = mix(glassLit, mix(uColor, uGlassHighlightColor, 0.18), glow * 0.1);
    vec3 stackedDashLit = mix(glassLit, patternLit, patternBand);

    vec3 lit = mix(stripeLit, stackedDashLit, uPatternAsBase);

    gl_FragColor = vec4(lit, alpha);
  }
`;

function createScanlineMaterial(
  lightDirection: THREE.Vector3,
  glbTreatment: IllustrationGlbTreatmentType = 'default',
) {
  const isStackedDashTreatment = glbTreatment === 'stacked-dash';

  return new THREE.ShaderMaterial({
    uniforms: {
      uBandOpacity: { value: isStackedDashTreatment ? 1.0 : 0.0 },
      uColor: { value: new THREE.Color('#1e5bff') },
      uDashEnd: { value: isStackedDashTreatment ? 0.98 : 0.88 },
      uDashMidEnd: { value: isStackedDashTreatment ? 0.82 : 0.55 },
      uDashMidStart: { value: isStackedDashTreatment ? 0.18 : 0.45 },
      uDashScaleX: { value: isStackedDashTreatment ? 10.0 : 20.0 },
      uDashScaleZ: { value: isStackedDashTreatment ? 3.0 : 6.0 },
      uDashStart: { value: isStackedDashTreatment ? 0.02 : 0.15 },
      uGlassColor: {
        value: new THREE.Color(
          isStackedDashTreatment ? '#ffffff' : '#1e5bff',
        ),
      },
      uGlassHighlightColor: {
        value: new THREE.Color(
          isStackedDashTreatment ? '#ffffff' : '#1e5bff',
        ),
      },
      uLightDir: { value: lightDirection.clone() },
      uPatternAsBase: { value: isStackedDashTreatment ? 1.0 : 0.0 },
      uPatternScaleX: { value: isStackedDashTreatment ? 12.4 : 1.0 },
      uPatternScaleY: { value: isStackedDashTreatment ? 10.8 : 1.0 },
      uStripeEdge: { value: isStackedDashTreatment ? 0.02 : 0.035 },
      uStripeScale: { value: isStackedDashTreatment ? 15.0 : 16.0 },
      uStripeWidth: { value: isStackedDashTreatment ? 0.74 : 0.58 },
      uTime: { value: 0 },
    },
    vertexShader: scanlineVertexShader,
    fragmentShader: scanlineFragmentShader,
    transparent: !isStackedDashTreatment,
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
  glbTreatment: IllustrationGlbTreatmentType = 'default',
) {
  modelRoot.traverse((sceneObject) => {
    if (!(sceneObject instanceof THREE.Mesh)) {
      return;
    }

    sceneObject.material = createScanlineMaterial(
      lightDirection,
      glbTreatment,
    );

    const mesh = sceneObject;
    const rest: MeshRestPose = {
      position: mesh.position.clone(),
      quaternion: mesh.quaternion.clone(),
      wobblePhase: mesh.position.y * 4.2 + mesh.position.x * 1.7,
    };
    mesh.userData.illustrationCardVisualRest = rest;
  });
}

const StyledVisualMount = styled.div`
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

export type IllustrationCardVisualProps = {
  glbTreatment?: IllustrationGlbTreatmentType;
  src: string;
  title: string;
};

export function IllustrationCardVisual({
  glbTreatment = 'default',
  src,
  title,
}: IllustrationCardVisualProps) {
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

    const isStackedDashTreatment = glbTreatment === 'stacked-dash';
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isStackedDashTreatment,
    });
    renderer.setPixelRatio(
      isStackedDashTreatment ? 1 : Math.min(window.devicePixelRatio, 2),
    );
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.height = '100%';
    canvas.style.touchAction = 'none';
    canvas.style.width = '100%';
    canvas.style.cursor = 'pointer';
    canvas.style.imageRendering = isStackedDashTreatment ? 'pixelated' : 'auto';
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
        const scale = 2.75 / maxAxis;

        modelRoot.position.sub(center);
        modelRoot.scale.setScalar(scale);

        applyScanlineMaterials(
          modelRoot,
          lightDirectionWorld,
          glbTreatment,
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
          const elapsedTime = clock.elapsedTime;

          modelRoot.traverse((sceneObject) => {
            if (!(sceneObject instanceof THREE.Mesh)) {
              return;
            }

            const rest = sceneObject.userData.illustrationCardVisualRest as
              | MeshRestPose
              | undefined;
            if (!rest) {
              return;
            }

            if (sceneObject.material instanceof THREE.ShaderMaterial) {
              sceneObject.material.uniforms.uTime.value = elapsedTime;
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
  }, [glbTreatment, src]);

  return (
    <StyledVisualMount aria-label={title} ref={mountReference} role="img" />
  );
}
