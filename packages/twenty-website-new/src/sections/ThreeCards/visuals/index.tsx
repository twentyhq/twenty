import type { ComponentType } from 'react';
import type { ThreeCardsIllustrationId } from '@/sections/ThreeCards/types/three-cards-illustration-id';
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
