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
    intensity: 3,
    fillIntensity: 0,
    ambientIntensity: 0,
    angleDegrees: 47,
    height: 1.4,
  },
  material: {
    surface: 'glass',
    color: '#7d7d7d',
    roughness: 0.26,
    metalness: 0.15,
    thickness: 15.58,
    refraction: 3,
    environmentPower: 5,
  },
  halftone: {
    enabled: true,
    scale: 16.64,
    power: -1.24,
    width: 0.5,
    imageContrast: 1,
    dashColor: '#89FC9A',
    hoverDashColor: '#89FC9A',
  },
  animation: {
    autoRotateEnabled: false,
    breatheEnabled: true,
    cameraParallaxEnabled: false,
    followHoverEnabled: false,
    followDragEnabled: true,
    floatEnabled: false,
    hoverLightEnabled: false,
    dragFlowEnabled: false,
    lightSweepEnabled: false,
    rotateEnabled: false,
    autoSpeed: 0.15,
    autoWobble: 0.3,
    breatheAmount: 0.015,
    breatheSpeed: 0.25,
    cameraParallaxAmount: 0.3,
    cameraParallaxEase: 0.08,
    driftAmount: 8,
    hoverRange: 25,
    hoverEase: 0.08,
    hoverReturn: true,
    dragSens: 0.008,
    dragFriction: 0.08,
    dragMomentum: true,
    rotateAxis: 'y',
    rotatePreset: 'axis',
    rotateSpeed: 0.1,
    rotatePingPong: false,
    floatAmplitude: 0.16,
    floatSpeed: 0.8,
    lightSweepHeightRange: 0,
    lightSweepRange: 28,
    lightSweepSpeed: 0.25,
    springDamping: 0.5,
    springReturnEnabled: true,
    springStrength: 0.1,
    hoverHalftoneEnabled: false,
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
      renderer="studio"
      settings={SPACESHIP_SETTINGS}
    />
  );
}
