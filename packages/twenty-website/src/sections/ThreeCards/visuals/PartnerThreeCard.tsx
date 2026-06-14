'use client';

import {
  createFallbackGeometry,
  HalftoneCanvas,
  loadImportedGeometryFromUrl,
  normalizeHalftoneStudioSettings,
  type HalftoneAnimationSettings,
  type HalftoneExportPose,
  type HalftoneStudioSettings,
  type ImportedGeometryNormalizationOptions,
} from '@/lib/halftone';
import { useAsyncGeometry } from '@/lib/visual-runtime/hooks/use-async-geometry';
import { type CSSProperties, useCallback } from 'react';
import type * as THREE from 'three';

const PARTNER_THREE_CARD_PREVIEW_DISTANCE = 4.5;

const DIAMOND_MODEL_URL = '/illustrations/home/three-cards/diamond.glb';

const BASE_PARTNER_THREE_CARD_SETTINGS = normalizeHalftoneStudioSettings({
  sourceMode: 'shape',
  shapeKey: 'userUpload_1776089370856',
  lighting: {
    intensity: 1.5,
    fillIntensity: 0.48,
    ambientIntensity: 0.3,
    angleDegrees: 53,
    height: 2,
  },
  material: {
    surface: 'solid',
    color: '#d4d0c8',
    roughness: 0.42,
    metalness: 0.15,
    thickness: 150,
    refraction: 2,
    environmentPower: 5,
  },
  halftone: {
    enabled: true,
    scale: 14,
    power: 0.4,
    toneTarget: 'light',
    width: 0.5,
    imageContrast: 1,
    dashColor: '#4A38F5',
    hoverDashColor: '#4A38F5',
  },
  background: {
    transparent: true,
    color: '#000000',
  },
  animation: {
    autoRotateEnabled: true,
    breatheEnabled: false,
    cameraParallaxEnabled: false,
    followHoverEnabled: false,
    followDragEnabled: true,
    floatEnabled: false,
    hoverHalftoneEnabled: false,
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
    hoverRange: 25,
    hoverEase: 0.19,
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
    lightSweepHeightRange: 0.5,
    lightSweepRange: 28,
    lightSweepSpeed: 0.7,
    springDamping: 0.6,
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
});

const BASE_PARTNER_THREE_CARD_INITIAL_POSE: HalftoneExportPose = {
  autoElapsed: 11.523399999928483,
  rotateElapsed: 0,
  rotationX: -4.020043134225878e-15,
  rotationY: 1.1339840023154435,
  rotationZ: 0,
  targetRotationX: 0,
  targetRotationY: 0,
  timeElapsed: 11.523399999928476,
};

type PartnerThreeCardModelOverrides = {
  geometryOptions?: ImportedGeometryNormalizationOptions;
  initialPose?: Partial<HalftoneExportPose>;
};

const getPartnerThreeCardModelOverrides = (
  modelUrl: string,
): PartnerThreeCardModelOverrides => {
  if (modelUrl !== DIAMOND_MODEL_URL) {
    return {};
  }

  return {
    geometryOptions: {
      postRotateZ: 1,
      useLegacyNormalization: true,
    },
    initialPose: {
      autoElapsed: 0,
      rotateElapsed: 0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      targetRotationX: 0,
      targetRotationY: 0,
      timeElapsed: 0,
    },
  };
};

const buildPartnerThreeCardSettings = (
  animationOverrides?: Partial<HalftoneAnimationSettings>,
): HalftoneStudioSettings => ({
  ...BASE_PARTNER_THREE_CARD_SETTINGS,
  animation: {
    ...BASE_PARTNER_THREE_CARD_SETTINGS.animation,
    ...animationOverrides,
  },
});

const buildPartnerThreeCardInitialPose = ({
  initialRotationX,
  initialRotationY,
  initialRotationZ,
  modelUrl,
}: {
  initialRotationX?: number;
  initialRotationY?: number;
  initialRotationZ?: number;
  modelUrl: string;
}): HalftoneExportPose => {
  const modelOverrides = getPartnerThreeCardModelOverrides(modelUrl);
  const initialPose = {
    ...BASE_PARTNER_THREE_CARD_INITIAL_POSE,
    ...modelOverrides.initialPose,
  };

  return {
    ...initialPose,
    rotationX:
      initialRotationX ??
      modelOverrides.initialPose?.rotationX ??
      BASE_PARTNER_THREE_CARD_INITIAL_POSE.rotationX,
    rotationY:
      initialRotationY ??
      modelOverrides.initialPose?.rotationY ??
      BASE_PARTNER_THREE_CARD_INITIAL_POSE.rotationY,
    rotationZ:
      initialRotationZ ??
      modelOverrides.initialPose?.rotationZ ??
      BASE_PARTNER_THREE_CARD_INITIAL_POSE.rotationZ,
  };
};

const getPartnerThreeCardGeometryOptions = (
  modelUrl: string,
): ImportedGeometryNormalizationOptions | undefined =>
  getPartnerThreeCardModelOverrides(modelUrl).geometryOptions;

type PartnerThreeCardProps = {
  animationOverrides?: Partial<HalftoneAnimationSettings>;
  initialRotationX?: number;
  initialRotationY?: number;
  initialRotationZ?: number;
  meshScaleMultiplier?: number;
  modelUrl: string;
  style?: CSSProperties;
};

const noopFirstInteraction = () => {};
const noopPoseChange = (_pose: HalftoneExportPose) => {};

const loadPartnerThreeCardGeometry = async ({
  meshScaleMultiplier,
  modelUrl,
}: {
  meshScaleMultiplier: number;
  modelUrl: string;
}) => {
  let geometry: THREE.BufferGeometry;

  try {
    geometry = await loadImportedGeometryFromUrl(
      'glb',
      modelUrl,
      modelUrl.split('/').pop() ?? 'three-card illustration',
      getPartnerThreeCardGeometryOptions(modelUrl),
    );
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('PartnerThreeCard geometry failed to load:', error);
    }

    geometry = createFallbackGeometry();
  }

  if (meshScaleMultiplier !== 1) {
    geometry.scale(
      meshScaleMultiplier,
      meshScaleMultiplier,
      meshScaleMultiplier,
    );
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
  }

  return geometry;
};

export function PartnerThreeCard({
  animationOverrides,
  initialRotationX,
  initialRotationY,
  initialRotationZ,
  meshScaleMultiplier = 1,
  modelUrl,
  style,
}: PartnerThreeCardProps) {
  const loadGeometry = useCallback(
    () => loadPartnerThreeCardGeometry({ meshScaleMultiplier, modelUrl }),
    [meshScaleMultiplier, modelUrl],
  );
  const geometry = useAsyncGeometry(loadGeometry, [loadGeometry]);

  return (
    <div
      style={{
        background: 'transparent',
        height: '100%',
        width: '100%',
        ...style,
      }}
    >
      {geometry ? (
        <HalftoneCanvas
          geometry={geometry}
          imageElement={null}
          initialPose={buildPartnerThreeCardInitialPose({
            initialRotationX,
            initialRotationY,
            initialRotationZ,
            modelUrl,
          })}
          onFirstInteraction={noopFirstInteraction}
          onPoseChange={noopPoseChange}
          previewDistance={PARTNER_THREE_CARD_PREVIEW_DISTANCE}
          settings={buildPartnerThreeCardSettings(animationOverrides)}
        />
      ) : null}
    </div>
  );
}
