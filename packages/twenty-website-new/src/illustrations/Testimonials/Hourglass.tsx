'use client';

import { HalftoneCanvas } from '@/app/halftone/_components/HalftoneCanvas';
import { loadImportedGeometry } from '@/app/halftone/_lib/model-loaders';
import type {
  HalftoneExportPose,
  HalftoneStudioSettings,
} from '@/app/halftone/_lib/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useEffect, useState } from 'react';
import * as THREE from 'three';

const GLB_URL = '/illustrations/home/testimonials/hourglass.glb';
const HOURGLASS_PREVIEW_DISTANCE = 4;

const HOURGLASS_SETTINGS: HalftoneStudioSettings = {
  sourceMode: 'shape',
  shapeKey: 'hourglass',
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
    transparent: true,
    color: 'transparent',
  },
  animation: {
    autoRotateEnabled: true,
    breatheEnabled: false,
    cameraParallaxEnabled: false,
    followHoverEnabled: false,
    followDragEnabled: true,
    floatEnabled: false,
    hoverLightEnabled: false,
    dragFlowEnabled: false,
    lightSweepEnabled: false,
    rotateEnabled: false,
    autoSpeed: 0.1,
    autoWobble: 0.05,
    breatheAmount: 0.04,
    breatheSpeed: 0.8,
    cameraParallaxAmount: 0.3,
    cameraParallaxEase: 0.08,
    driftAmount: 8,
    hoverRange: 25,
    hoverEase: 0.08,
    hoverReturn: true,
    dragSens: 0.003,
    dragFriction: 0.02,
    dragMomentum: true,
    rotateAxis: 'y',
    rotatePreset: 'axis',
    rotateSpeed: 1,
    rotatePingPong: false,
    floatAmplitude: 0.16,
    floatSpeed: 0.8,
    lightSweepHeightRange: 0.7,
    lightSweepRange: 29,
    lightSweepSpeed: 0.2,
    springDamping: 0.72,
    springReturnEnabled: false,
    springStrength: 0.18,
    hoverLightIntensity: 0.8,
    hoverLightRadius: 0.2,
    dragFlowDecay: 0.08,
    dragFlowRadius: 0.24,
    dragFlowStrength: 1.8,
    hoverWarpStrength: 3,
    hoverWarpRadius: 0.15,
    dragWarpStrength: 5,
    waveEnabled: false,
    waveSpeed: 1,
    waveAmount: 2,
  },
};

const HOURGLASS_INITIAL_POSE: HalftoneExportPose = {
  autoElapsed: 51.68333333333168,
  rotateElapsed: 0,
  rotationX: 3.5421542652497933,
  rotationY: 10.105974316283143,
  rotationZ: 0,
  targetRotationX: 3.575782604433917,
  targetRotationY: 5.019307649616612,
  timeElapsed: 411.9648000000736,
};

const NO_OP = () => {};

const VisualFrame = styled.div`
  background-color: transparent;
  border-radius: ${theme.radius(1)};
  height: 279px;
  overflow: hidden;
  position: relative;
  width: 198px;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: 476px;
    width: 336px;
  }
`;

export function Hourglass() {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    let cancelled = false;
    let loadedGeometry: THREE.BufferGeometry | null = null;

    void fetch(GLB_URL)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Could not load the hourglass model.');
        }

        const blob = await response.blob();

        return new File([blob], 'hourglass.glb', {
          type: blob.type || 'model/gltf-binary',
        });
      })
      .then((file) => loadImportedGeometry('glb', file, 'hourglass.glb'))
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
    <VisualFrame>
      {geometry ? (
        <HalftoneCanvas
          geometry={geometry}
          imageElement={null}
          initialPose={HOURGLASS_INITIAL_POSE}
          onFirstInteraction={NO_OP}
          onPoseChange={NO_OP}
          previewDistance={HOURGLASS_PREVIEW_DISTANCE}
          settings={HOURGLASS_SETTINGS}
        />
      ) : null}
    </VisualFrame>
  );
}
