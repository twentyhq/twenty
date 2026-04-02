'use client';

import { Bounds, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo } from 'react';
import { Box3, Group, Vector3 } from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { LazyGlbCanvasRoot } from './LazyGlbCanvasRoot';

type LazyGlbIllustrationProps = {
  src: string;
  title?: string;
};

function StaticGlbModel({ src }: { src: string }) {
  const gltf = useGLTF(src);

  const model = useMemo(() => {
    const sceneClone = clone(gltf.scene) as Group;
    const bounds = new Box3().setFromObject(sceneClone);
    const center = bounds.getCenter(new Vector3());
    const size = bounds.getSize(new Vector3());
    const maxAxis = Math.max(size.x, size.y, size.z, 1);
    const scale = 2.4 / maxAxis;

    sceneClone.position.sub(center);
    sceneClone.scale.setScalar(scale);

    return sceneClone;
  }, [gltf.scene]);

  return <primitive object={model} dispose={null} />;
}

export function LazyGlbIllustration({ src, title }: LazyGlbIllustrationProps) {
  return (
    <LazyGlbCanvasRoot aria-label={title} role={title ? 'img' : undefined}>
      <Canvas
        dpr={[1, 1.25]}
        frameloop="demand"
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'low-power',
        }}
        camera={{ fov: 30, far: 100, near: 0.1, position: [0, 0, 6] }}
        onCreated={({ gl, scene }) => {
          scene.background = null;
          gl.setClearColor(0x000000, 0);
        }}
        style={{ height: '100%', width: '100%' }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight intensity={1.2} position={[5, 6, 8]} />
        <directionalLight intensity={0.6} position={[-4, -2, 6]} />
        <Suspense fallback={null}>
          <Bounds clip fit margin={1.2} observe>
            <StaticGlbModel src={src} />
          </Bounds>
        </Suspense>
      </Canvas>
    </LazyGlbCanvasRoot>
  );
}
