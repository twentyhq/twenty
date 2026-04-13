'use client';

import {
  HelpedHalftoneModel,
  type HelpedHalftonePose,
  type HelpedHalftoneSettings,
} from '@/illustrations/Helped/HelpedHalftoneModel';

const GLB_URL = '/illustrations/home/helped/spaceship.glb';
const SPACESHIP_PREVIEW_DISTANCE = 3.5;

const SPACESHIP_SETTINGS: HelpedHalftoneSettings = {
  lighting: {
    intensity: 1,
    fillIntensity: 0,
    ambientIntensity: 0,
    angleDegrees: 103,
    height: -3.6,
  },
  material: {
    roughness: 0.32,
    metalness: 0.98,
  },
  halftone: {
    enabled: true,
    scale: 14.97,
    power: -0.25,
    width: 1.4,
    dashColor: '#89FC9A',
  },
  animation: {
    autoRotateEnabled: false,
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
    autoWobble: 0,
    breatheAmount: 0.04,
    breatheSpeed: 0.8,
    cameraParallaxAmount: 0.3,
    cameraParallaxEase: 0.08,
    driftAmount: 8,
    hoverRange: 24,
    hoverEase: 0.16,
    hoverReturn: true,
    dragSens: 0.008,
    dragFriction: 0.08,
    dragMomentum: true,
    rotateAxis: '-xy',
    rotatePreset: 'axis',
    rotateSpeed: 0.1,
    rotatePingPong: false,
    floatAmplitude: 0.16,
    floatSpeed: 0.8,
    lightSweepHeightRange: 0.5,
    lightSweepRange: 28,
    lightSweepSpeed: 0.2,
    springDamping: 0.4,
    springReturnEnabled: true,
    springStrength: 0.06,
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

const SPACESHIP_INITIAL_POSE: HelpedHalftonePose = {
  autoElapsed: 0.05,
  rotateElapsed: 0,
  rotationX: 6.34639162689903e-205,
  rotationY: 4.230976261030774e-203,
  rotationZ: 0,
  targetRotationX: 0,
  targetRotationY: 0,
  timeElapsed: 99.20160000002399,
};

export function Spaceship() {
  return (
    <HelpedHalftoneModel
      initialPose={SPACESHIP_INITIAL_POSE}
      label="spaceship.glb"
      modelUrl={GLB_URL}
      previewDistance={SPACESHIP_PREVIEW_DISTANCE}
      settings={SPACESHIP_SETTINGS}
    />
  );
}
