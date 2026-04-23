'use client';

import { PartnerThreeCard } from './PartnerThreeCard';

const MODEL_URL = '/illustrations/product/three-cards/speed.glb';
const SPEED_MESH_SCALE_MULTIPLIER = 0.731;

export function Speed() {
  return (
    <PartnerThreeCard
      meshScaleMultiplier={SPEED_MESH_SCALE_MULTIPLIER}
      modelUrl={MODEL_URL}
    />
  );
}
