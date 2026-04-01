'use client';

import { Center, Environment, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import type { ComponentPropsWithoutRef } from 'react';
import { Suspense } from 'react';
import { FooterBackgroundCanvasRoot } from './FooterBackgroundCanvasRoot';

const FOOTER_GLB_PATH = '/illustrations/footer.glb';

function FooterGlbModel() {
  const gltf = useGLTF(FOOTER_GLB_PATH);

  return (
    <primitive
      object={gltf.scene}
      scale={3}
    />
  );
}

useGLTF.preload(FOOTER_GLB_PATH);

type FooterBackgroundCanvasProps = ComponentPropsWithoutRef<'div'>;

export function FooterBackgroundCanvas(props: FooterBackgroundCanvasProps) {
  return (
    <FooterBackgroundCanvasRoot {...props}>
      <Canvas
        dpr={[1, 2]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        camera={{ position: [0, 0, 6], near: 0.1, far: 100 }}
        onCreated={({ gl, scene }) => {
          scene.background = null;
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 8]} intensity={1.5} />
        <Suspense fallback={null}>
          <Environment preset="city" />
          <Center>
            <FooterGlbModel />
          </Center>
          <OrbitControls 
            autoRotate 
            autoRotateSpeed={1} 
            enableZoom={false} 
            enablePan={false} 
            enableRotate={false} 
          />
        </Suspense>
      </Canvas>
    </FooterBackgroundCanvasRoot>
  );
}
