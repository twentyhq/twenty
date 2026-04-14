'use client';

import { HalftoneCanvas } from '@/app/halftone/_components/HalftoneCanvas';
import { loadImportedGeometryFromUrl } from '@/app/halftone/_lib/geometry-registry';
import type {
  HalftoneExportPose,
  HalftoneStudioSettings,
} from '@/app/halftone/_lib/state';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useEffect, useState } from 'react';
import * as THREE from 'three';

const GLB_URL = '/illustrations/partner/testimonials/quote.glb';
const PARTNER_QUOTE_LABEL = 'partner quote';
const PREVIEW_DISTANCE = 6;
const deg = THREE.MathUtils.degToRad;

const PARTNER_QUOTE_SETTINGS: HalftoneStudioSettings = {
  sourceMode: 'shape',
  shapeKey: 'partnerTestimonialsQuote',
  lighting: {
    intensity: 1.5,
    fillIntensity: 0.15,
    ambientIntensity: 0.08,
    angleDegrees: 45,
    height: 2,
  },
  material: {
    surface: 'solid',
    color: '#d4d0c8',
    roughness: 0.42,
    metalness: 0.16,
    thickness: 150,
    refraction: 2,
    environmentPower: 5,
  },
  halftone: {
    enabled: true,
    scale: 24.72,
    power: -0.07,
    width: 0.46,
    imageContrast: 1,
    dashColor: '#4A38F5',
    hoverDashColor: '#4A38F5',
  },
  background: {
    transparent: true,
    color: 'transparent',
  },
  animation: {
    autoRotateEnabled: false,
    breatheEnabled: true,
    cameraParallaxEnabled: false,
    followHoverEnabled: true,
    followDragEnabled: false,
    floatEnabled: false,
    hoverHalftoneEnabled: false,
    hoverLightEnabled: false,
    dragFlowEnabled: false,
    lightSweepEnabled: false,
    rotateEnabled: false,
    autoSpeed: 0.2,
    autoWobble: 0.3,
    breatheAmount: 0.02,
    breatheSpeed: 0.2,
    cameraParallaxAmount: 0.3,
    cameraParallaxEase: 0.08,
    driftAmount: 8,
    hoverRange: 8,
    hoverEase: 0.02,
    hoverReturn: true,
    dragSens: 0.008,
    dragFriction: 0.08,
    dragMomentum: true,
    rotateAxis: '-y',
    rotatePreset: 'axis',
    rotateSpeed: 0.2,
    rotatePingPong: false,
    floatAmplitude: 0.16,
    floatSpeed: 0.8,
    lightSweepHeightRange: 0.25,
    lightSweepRange: 5,
    lightSweepSpeed: 0.55,
    springDamping: 0.72,
    springReturnEnabled: true,
    springStrength: 0.06,
    hoverHalftonePowerShift: 0.42,
    hoverHalftoneRadius: 0.2,
    hoverHalftoneWidthShift: -0.18,
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

const PARTNER_QUOTE_INITIAL_POSE: HalftoneExportPose = {
  autoElapsed: 126.7357000006041,
  rotateElapsed: 10.021299999999943,
  rotationX: deg(-80),
  rotationY: deg(10),
  rotationZ: deg(350),
  targetRotationX: 0,
  targetRotationY: 0,
  timeElapsed: 289.53700000066755,
};

const noopFirstInteraction = () => {};
const noopPoseChange = (_pose: HalftoneExportPose) => {};

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

const VisualPlaceholder = styled.div`
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

export function Partner() {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    let cancelled = false;
    let loadedGeometry: THREE.BufferGeometry | null = null;

    void loadImportedGeometryFromUrl('glb', GLB_URL, PARTNER_QUOTE_LABEL).then(
      (nextGeometry) => {
        if (cancelled) {
          nextGeometry.dispose();
          return;
        }

        loadedGeometry = nextGeometry;
        setGeometry(nextGeometry);
      },
      (error) => {
        console.error(error);
      },
    );

    return () => {
      cancelled = true;
      loadedGeometry?.dispose();
    };
  }, []);

  return (
    <VisualFrame>
      {geometry ? (
        <HalftoneCanvas
          geometry={geometry}
          imageElement={null}
          initialPose={PARTNER_QUOTE_INITIAL_POSE}
          onFirstInteraction={noopFirstInteraction}
          onPoseChange={noopPoseChange}
          previewDistance={PREVIEW_DISTANCE}
          settings={PARTNER_QUOTE_SETTINGS}
        />
      ) : (
        <VisualPlaceholder aria-hidden />
      )}
    </VisualFrame>
  );
}
