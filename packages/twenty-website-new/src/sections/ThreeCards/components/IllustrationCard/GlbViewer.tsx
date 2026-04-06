'use client';

import { Center, useGLTF, Float, PresentationControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef, useState, useCallback, useEffect } from 'react';
import * as THREE from 'three';

function Model({ url, color }: { url: string; color: string }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.15,
        roughness: 0.2,
        metalness: 0.8,
        wireframe: true,
        transparent: true,
        opacity: 0.8,
      }),
    [color],
  );

  const coloredScene = useMemo(() => {
    const clonedScene = scene.clone();
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = material;
      }
    });
    return clonedScene;
  }, [scene, material]);

  useEffect(() => {
    return () => {
      material.dispose();
      coloredScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
        }
      });
    };
  }, [material, coloredScene]);

  const handlePointerOver = useCallback(() => {
    setHovered(true);
  }, []);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const amp = hovered ? 1.8 : 1.2;
    const targetRotationX = (-state.pointer.y * Math.PI * amp) / 8;
    const targetRotationY = (state.pointer.x * Math.PI * amp) / 8;

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
      Math.sin(state.clock.elapsedTime * 0.4) * 0.08,
      2,
      delta,
    );

    const targetScale = hovered ? 1.15 : 1.0;
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
      <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.8}>
        <PresentationControls
          global
          rotation={[0.13, 0.1, 0]}
          polar={[-0.4, 0.2]}
          azimuth={[-1, 0.75]}
          snap={true}
        >
          <Center>
            <primitive object={coloredScene} scale={1.2} />
          </Center>
        </PresentationControls>
      </Float>
    </group>
  );
}

export function GlbViewer({ src }: { src: string }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      style={{ width: '100%', height: '100%', cursor: 'pointer' }}
      dpr={[1, 1.5]}
      frameloop="demand"
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'low-power',
      }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={2.5} color="#ffffff" />
      <directionalLight
        position={[-10, -10, -5]}
        intensity={1.5}
        color="#120AF2"
      />
      <spotLight
        position={[0, 5, 10]}
        intensity={2.5}
        penumbra={0.8}
        color="#ffffff"
        angle={0.6}
      />
      <Suspense fallback={null}>
        <Model url={src} color="#120AF2" />
      </Suspense>
    </Canvas>
  );
}