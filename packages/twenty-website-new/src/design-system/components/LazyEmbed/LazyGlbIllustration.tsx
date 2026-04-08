'use client';

import { Bounds, useGLTF, Float, PresentationControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef, useState, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { LazyGlbCanvasRoot } from './LazyGlbCanvasRoot';

type LazyGlbIllustrationProps = {
  src: string;
  title?: string;
};

function InteractiveGlbModel({ src }: { src: string }) {
  const gltf = useGLTF(src);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const model = useMemo(() => {
    const sceneClone = clone(gltf.scene) as THREE.Group;

    const bounds = new THREE.Box3().setFromObject(sceneClone);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const maxAxis = Math.max(size.x, size.y, size.z, 1);
    const scale = 2.4 / maxAxis;

    sceneClone.position.sub(center);
    sceneClone.scale.setScalar(scale);

    return sceneClone;
  }, [gltf.scene]);

  useEffect(() => {
    return () => {
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
    };
  }, [model]);

  const handlePointerOver = useCallback(() => {
    setHovered(true);
  }, []);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const amp = hovered ? 1.5 : 0.8;
    const targetRotationX = (-state.pointer.y * Math.PI * amp) / 10;
    const targetRotationY = (state.pointer.x * Math.PI * amp) / 10;

    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      targetRotationX,
      4,
      delta,
    );

    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetRotationY,
      4,
      delta,
    );

    groupRef.current.rotation.z = THREE.MathUtils.damp(
      groupRef.current.rotation.z,
      Math.sin(state.clock.elapsedTime * 0.5) * 0.05,
      2,
      delta,
    );

    const targetScale = hovered ? 1.15 : 1;
    groupRef.current.scale.setScalar(
      THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 6, delta),
    );
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <primitive object={model} dispose={null} />
    </group>
  );
}

export function LazyGlbIllustration({ src, title }: LazyGlbIllustrationProps) {
  return (
    <LazyGlbCanvasRoot aria-label={title} role={title ? 'img' : undefined}>
      <Canvas
        dpr={[1, 1.5]}
        frameloop="demand"
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'low-power',
        }}
        camera={{ fov: 30, far: 100, near: 0.1, position: [0, 0, 7] }}
        onCreated={({ gl, scene }) => {
          scene.background = null;
          gl.setClearColor(0x000000, 0);
        }}
        style={{ height: '100%', width: '100%', cursor: 'pointer' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight intensity={2.5} position={[5, 8, 10]} />
        <directionalLight intensity={1.0} position={[-5, -4, 5]} color="#f0f0ff" />
        <Suspense fallback={null}>
          <Float speed={2.5} rotationIntensity={0.25} floatIntensity={0.7}>
            <PresentationControls
              global
              rotation={[0.1, 0.1, 0]}
              polar={[-0.2, 0.2]}
              azimuth={[-0.5, 0.5]}
              snap={true}
            >
              <Bounds clip fit margin={1.2} observe>
                <InteractiveGlbModel src={src} />
              </Bounds>
            </PresentationControls>
          </Float>
        </Suspense>
      </Canvas>
    </LazyGlbCanvasRoot>
  );
}