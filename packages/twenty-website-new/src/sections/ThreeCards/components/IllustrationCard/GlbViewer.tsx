'use client';

import { Center, Environment, useGLTF, Float, PresentationControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

function Model({ url, color }: { url: string; color: string }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState(new THREE.Vector2(0, 0));

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.2,
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

  // Track global mouse position smoothly for parallax even when not hovering directly
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePos(new THREE.Vector2(x, y));
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // 1. Mouse-based parallax rotation (Apple-like smooth follow)
      const amp = hovered ? 1.8 : 1.2;
      const targetRotationX = (-mousePos.y * Math.PI * amp) / 8;
      const targetRotationY = (mousePos.x * Math.PI * amp) / 8;

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

      // Subtle continuous floating rotation on Z axis
      groupRef.current.rotation.z = THREE.MathUtils.damp(
        groupRef.current.rotation.z,
        Math.sin(state.clock.elapsedTime * 0.4) * 0.08,
        2,
        delta,
      );

      // Smooth buttery scaling on hover
      const targetScale = hovered ? 1.15 : 1.0;
      groupRef.current.scale.setScalar(
        THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 6, delta)
      );
    }

    // Remove extensive material modification

  });

  return (
    <group 
      ref={groupRef} 
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }} 
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
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
      style={{ width: '100%', height: '100%', cursor: 'pointer', touchAction: 'none' }}
      dpr={[1, 2]}
      frameloop="always"
      gl={{ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2
      }}
    >
      <ambientLight intensity={0.6} />
      
      {/* Studio Lighting Setup */}
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={2.5} 
        color="#ffffff" 
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
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
      
      {/* Rim light for edge highlights */}
      <spotLight
        position={[0, -5, -10]}
        intensity={3}
        color="#ffffff"
        penumbra={1}
      />
      
      <Environment preset="studio" environmentIntensity={1.2} />
      
      <Suspense fallback={null}>
        <Model url={src} color="#120AF2" />
      </Suspense>
    </Canvas>
  );
}