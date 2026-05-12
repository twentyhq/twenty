'use client';

import { useAsyncGeometry } from '@/lib/visual-runtime/hooks/use-async-geometry';
import { styled } from '@linaria/react';
import { useCallback } from 'react';
import { loadImportedGeometryFromUrl } from '@/lib/halftone';
import { HourglassCanvas } from './HourglassCanvas';

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

const HourglassFill = styled.div`
  height: 100%;
  position: relative;
  width: 100%;
`;

export function Hourglass() {
  const loadGeometry = useCallback(
    () => loadImportedGeometryFromUrl('glb', GLB_URL, 'hourglass.glb'),
    [],
  );
  const geometry = useAsyncGeometry(loadGeometry, [loadGeometry]);

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
