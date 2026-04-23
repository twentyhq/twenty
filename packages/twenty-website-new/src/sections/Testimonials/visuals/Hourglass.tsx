'use client';

import { styled } from '@linaria/react';
import { useEffect, useState } from 'react';
import type * as THREE from 'three';
import { loadImportedGeometryFromUrl } from '@/lib/halftone';
import { HourglassCanvas } from './HourglassCanvas';

/**
 * Settings, pose, and rendering for the Testimonials hourglass.
 *
 * The bespoke `HourglassCanvas` is intentionally retained — its halftone
 * fragment shader is meaningfully different from `@/lib/halftone`'s
 * `HalftoneCanvas` (row-based dash bars with a pre-blur glow halo and
 * shadow-grouping pass, vs. the dot-grid pattern used by Helped /
 * marketing visuals). See the file header on `HourglassCanvas.tsx` for
 * the design contract.
 *
 * Geometry loading uses the shared `loadImportedGeometryFromUrl` from
 * `@/lib/halftone` — no need for a duplicate FBX/GLTF/DRACO loader stack
 * here.
 */

const GLB_URL = '/illustrations/home/testimonials/hourglass.glb';
const HOURGLASS_PREVIEW_DISTANCE = 4;

const HOURGLASS_SETTINGS = {
  lighting: {
    intensity: 3.4,
    fillIntensity: 1.5,
    ambientIntensity: 0.06,
    angleDegrees: 260,
    height: 0.8,
  },
  material: {
    roughness: 0.59,
    metalness: 0.02,
  },
  halftone: {
    enabled: true,
    numRows: 150,
    contrast: 1.2,
    power: 1.1,
    shading: 3,
    baseInk: 0.19,
    maxBar: 0.35,
    rowMerge: 0.08,
    cellRatio: 2.2,
    cutoff: 0.02,
    highlightOpen: 0.04,
    shadowGrouping: 0.18,
    shadowCrush: 0.14,
    dashColor: '#4A38F5',
  },
  background: {
    color: 'transparent',
  },
  animation: {
    autoRotateEnabled: true,
    followHoverEnabled: false,
    followDragEnabled: true,
    rotateEnabled: false,
    autoSpeed: 0.1,
    autoWobble: 0.05,
    hoverRange: 25,
    hoverEase: 0.08,
    hoverReturn: true,
    dragSens: 0.003,
    dragFriction: 0.02,
    dragMomentum: true,
    rotateAxis: 'y' as const,
    rotatePreset: 'axis' as const,
    rotateSpeed: 1,
    rotatePingPong: false,
    waveEnabled: false,
    waveSpeed: 1,
    waveAmount: 2,
  },
};

const HOURGLASS_INITIAL_POSE = {
  autoElapsed: 51.68333333333168,
  rotateElapsed: 0,
  rotationX: 3.5421542652497933,
  rotationY: 10.105974316283143,
  rotationZ: 0,
  targetRotationX: 3.575782604433917,
  targetRotationY: 5.019307649616612,
  timeElapsed: 411.9648000000736,
};

/**
 * Fills the slot reserved by the parent (TestimonialsVisualFrame in
 * MountedTestimonialsVisuals.tsx) so that the canvas — and the empty
 * loading state before geometry resolves — both occupy the exact same
 * footprint, eliminating any layout shift between them.
 */
const HourglassFill = styled.div`
  height: 100%;
  position: relative;
  width: 100%;
`;

export function Hourglass() {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    let cancelled = false;
    let loadedGeometry: THREE.BufferGeometry | null = null;

    void loadImportedGeometryFromUrl('glb', GLB_URL, 'hourglass.glb')
      .then((nextGeometry) => {
        if (cancelled) {
          nextGeometry.dispose();
          return;
        }

        loadedGeometry = nextGeometry;
        setGeometry(nextGeometry);
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      cancelled = true;

      if (loadedGeometry) {
        loadedGeometry.dispose();
      }
    };
  }, []);

  return (
    <HourglassFill>
      {geometry ? (
        <HourglassCanvas
          geometry={geometry}
          initialPose={HOURGLASS_INITIAL_POSE}
          previewDistance={HOURGLASS_PREVIEW_DISTANCE}
          settings={HOURGLASS_SETTINGS}
        />
      ) : null}
    </HourglassFill>
  );
}
