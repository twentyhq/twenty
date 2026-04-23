import type { ComponentType } from 'react';
import type { ThreeCardsIllustrationId } from '@/sections/ThreeCards/types/ThreeCardsIllustrationCard';
import { Eye } from './Eye';
import { PartnerThreeCard } from './PartnerThreeCard';
import { SingleScreen } from './SingleScreen';
import { Speed } from './Speed';

const DiamondVisual = () => (
  <PartnerThreeCard modelUrl="/illustrations/home/three-cards/diamond.glb" />
);
const FlashVisual = () => (
  <PartnerThreeCard modelUrl="/illustrations/home/three-cards/flash.glb" />
);
const LockVisual = () => (
  <PartnerThreeCard modelUrl="/illustrations/home/three-cards/lock.glb" />
);
const ConnectVisual = () => (
  <PartnerThreeCard modelUrl="/illustrations/partner/three-cards/connect.glb" />
);
const GrowVisual = () => (
  <PartnerThreeCard modelUrl="/illustrations/partner/three-cards/grow.glb" />
);
const ProgrammingVisual = () => (
  <PartnerThreeCard modelUrl="/illustrations/partner/three-cards/programming.glb" />
);

/**
 * Local visual map for the ThreeCards section. Each card's data
 * references a visual by string id; this map resolves the id to the
 * React component to render. Co-located with the section that owns
 * them so unrelated routes are not forced to bundle these scenes.
 */
export const THREE_CARDS_VISUALS = {
  connect: ConnectVisual,
  diamond: DiamondVisual,
  eye: Eye,
  flash: FlashVisual,
  grow: GrowVisual,
  lock: LockVisual,
  programming: ProgrammingVisual,
  singleScreen: SingleScreen,
  speed: Speed,
} as const satisfies Record<ThreeCardsIllustrationId, ComponentType>;
