'use client';

import { Bounds, useGLTF, Float, PresentationControls, Environment } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { LazyGlbCanvasRoot } from './LazyGlbCanvasRoot';

type LazyGlbIllustrationProps = {
  src: string;
  title?: string;
};

// Removed premium material overrides

function InteractiveGlbModel({ src }: { src: string }) {
  const gltf = useGLTF(src);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState(new THREE.Vector2(0, 0));

  const model = useMemo(() => {
    const sceneClone = clone(gltf.scene) as THREE.Group;
    
    sceneClone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    const bounds = new THREE.Box3().setFromObject(sceneClone);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const maxAxis = Math.max(size.x, size.y, size.z, 1);
    
    // Optimize scale to fill the frame harmoniously (original scale was 2.4/maxAxis)
    const scale = 2.4 / maxAxis;

    sceneClone.position.sub(center);
    sceneClone.scale.setScalar(scale);

    return sceneClone;
  }, [gltf.scene]);

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
      // Smooth buttery parallax on mouse move
      const amp = hovered ? 1.5 : 0.8;
      const targetRotationX = (-mousePos.y * Math.PI * amp) / 10;
      const targetRotationY = (mousePos.x * Math.PI * amp) / 10;

      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        targetRotationX,
        4,
        delta
      );

      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        targetRotationY,
        4,
        delta
      );
      
      // Floating z-rotation
      groupRef.current.rotation.z = THREE.MathUtils.damp(
        groupRef.current.rotation.z,
        Math.sin(state.clock.elapsedTime * 0.5) * 0.05,
        2,
        delta
      );

      // Distinct pop/breath when hovering
      const targetScale = hovered ? 1.15 : 1;
      groupRef.current.scale.setScalar(
        THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 6, delta)
      );
    }
  });

  return (
    <group 
      ref={groupRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      <primitive object={model} dispose={null} />
    </group>
  );
}

export function LazyGlbIllustration({ src, title }: LazyGlbIllustrationProps) {
  return (
    <LazyGlbCanvasRoot aria-label={title} role={title ? 'img' : undefined}>
      <Canvas
        dpr={[1, 2]}
        frameloop="always"
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1
        }}
        camera={{ fov: 30, far: 100, near: 0.1, position: [0, 0, 7] }}
        onCreated={({ gl, scene }) => {
          scene.background = null;
          gl.setClearColor(0x000000, 0);
        }}
        style={{ height: '100%', width: '100%', cursor: 'pointer', touchAction: 'none' }}
      >
        <ambientLight intensity={0.8} />
        
        {/* Apple-style dramatic studio lighting */}
        <directionalLight intensity={2.5} position={[5, 8, 10]} castShadow />
        <directionalLight intensity={1.0} position={[-5, -4, 5]} color="#f0f0ff" />
        <spotLight 
          position={[0, 5, -5]} 
          intensity={3} 
          color="#ffffff" 
          penumbra={1} 
          distance={20}
        />
        
        <Environment preset="studio" environmentIntensity={0.8} />
        
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