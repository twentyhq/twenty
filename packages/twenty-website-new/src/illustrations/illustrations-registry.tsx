'use client';

import type { ComponentType } from 'react';
import { FaqBackground } from './Faq/Background';
import { FooterBackground } from './Footer/Background';
import { Money } from './Helped/Money';
import { Spaceship } from './Helped/Spaceship';
import { Target } from './Helped/Target';
import { Product } from './Hero/Product';
import { WhyTwenty } from './Hero/WhyTwenty';
import { Quotes } from './Quote/Quotes';
import { Hourglass } from './Testimonials/Hourglass';
import { Partner } from './Testimonials/Partner';
import { Eye } from './ThreeCards/Eye';
import { PartnerThreeCard } from './ThreeCards/PartnerThreeCard';
import { SingleScreen } from './ThreeCards/SingleScreen';
import { Speed } from './ThreeCards/Speed';
import { Logo as WhyTwentyStepperLogo } from './WhyTwentyStepper/Logo';

const DiamondIllustration = () => (
  <PartnerThreeCard modelUrl="/illustrations/home/three-cards/diamond.glb" />
);

const FlashIllustration = () => (
  <PartnerThreeCard modelUrl="/illustrations/home/three-cards/flash.glb" />
);

const LockIllustration = () => (
  <PartnerThreeCard modelUrl="/illustrations/home/three-cards/lock.glb" />
);

const ConnectIllustration = () => (
  <PartnerThreeCard modelUrl="/illustrations/partner/three-cards/connect.glb" />
);

const GrowIllustration = () => (
  <PartnerThreeCard modelUrl="/illustrations/partner/three-cards/grow.glb" />
);

const ProgrammingIllustration = () => (
  <PartnerThreeCard
    modelUrl="/illustrations/partner/three-cards/programming.glb"
  />
);

export const THREE_CARDS_ILLUSTRATIONS = {
  diamond: DiamondIllustration,
  eye: Eye,
  flash: FlashIllustration,
  lock: LockIllustration,
  connect: ConnectIllustration,
  grow: GrowIllustration,
  programming: ProgrammingIllustration,
  singleScreen: SingleScreen,
  speed: Speed,
} as const satisfies Record<string, ComponentType>;

export type ThreeCardsIllustrationId = keyof typeof THREE_CARDS_ILLUSTRATIONS;

export const ILLUSTRATIONS = {
  ...THREE_CARDS_ILLUSTRATIONS,
  faqBackground: FaqBackground,
  footerBackground: FooterBackground,
  quoteQuotes: Quotes,
  whyTwentyStepperLogo: WhyTwentyStepperLogo,
  heroProduct: Product,
  heroWhyTwenty: WhyTwenty,
  testimonialsPartner: Partner,
  testimonialsHourglass: Hourglass,
  money: Money,
  spaceship: Spaceship,
  target: Target,
} as const satisfies Record<string, ComponentType>;

export type IllustrationId = keyof typeof ILLUSTRATIONS;
