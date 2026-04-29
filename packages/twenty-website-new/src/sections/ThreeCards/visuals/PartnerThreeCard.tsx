'use client';

import {
  createFallbackGeometry,
  HalftoneCanvas,
  loadImportedGeometryFromUrl,
  type HalftoneAnimationSettings,
  type HalftoneExportPose,
} from '@/lib/halftone';
import { type CSSProperties, useEffect, useState } from 'react';
import type * as THREE from 'three';

import {
  buildPartnerThreeCardInitialPose,
  buildPartnerThreeCardSettings,
  getPartnerThreeCardGeometryOptions,
  PARTNER_THREE_CARD_PREVIEW_DISTANCE,
} from './partner-three-card-config';

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
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    let cancelled = false;
    let loadedGeometry: THREE.BufferGeometry | null = null;

    setGeometry(null);

    void loadPartnerThreeCardGeometry({ meshScaleMultiplier, modelUrl }).then(
      (nextGeometry) => {
        if (cancelled) {
          nextGeometry.dispose();
          return;
        }

        loadedGeometry = nextGeometry;
        setGeometry(nextGeometry);
      },
    );

    return () => {
      cancelled = true;
      loadedGeometry?.dispose();
    };
  }, [meshScaleMultiplier, modelUrl]);

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

export default PartnerThreeCard;
