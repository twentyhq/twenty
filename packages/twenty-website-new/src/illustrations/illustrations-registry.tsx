'use client';

import type { IllustrationProps } from '@/illustrations/types';
import type { ComponentType } from 'react';
import { FaqBackground } from './Faq/Background';
import { FooterBackground } from './Footer/Background';
import { Product } from './Hero/Product';
import { WhyTwenty } from './Hero/WhyTwenty';
import { Money } from './Helped/Money';
import { Spaceship } from './Helped/Spaceship';
import { Target } from './Helped/Target';
import { Organization } from './Plans/Organization';
import { Pro } from './Plans/Pro';
import { Quotes } from './Quote/Quotes';
import { Diamond } from './ThreeCards/Diamond';
import { Eye } from './ThreeCards/Eye';
import { Flash } from './ThreeCards/Flash';
import { Lock } from './ThreeCards/Lock';
import { PartnerCommunity } from './ThreeCards/PartnerCommunity';
import { PartnerSolutions } from './ThreeCards/PartnerSolutions';
import { PartnerTechnology } from './ThreeCards/PartnerTechnology';
import { SingleScreen } from './ThreeCards/SingleScreen';
import { Speed } from './ThreeCards/Speed';
import { Hourglass } from './Testimonials/Hourglass';
import { Partner } from './Testimonials/Partner';
import { Logo as WhyTwentyStepperLogo } from './WhyTwentyStepper/Logo';

export const THREE_CARDS_ILLUSTRATIONS = {
  diamond: Diamond,
  eye: Eye,
  flash: Flash,
  lock: Lock,
  partnerCommunity: PartnerCommunity,
  partnerSolutions: PartnerSolutions,
  partnerTechnology: PartnerTechnology,
  singleScreen: SingleScreen,
  speed: Speed,
} as const satisfies Record<string, ComponentType<IllustrationProps>>;

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
  planPro: Pro,
  planOrganization: Organization,
  helpedMoney: Money,
  helpedSpaceship: Spaceship,
  helpedTarget: Target,
} as const satisfies Record<string, ComponentType<IllustrationProps>>;

export type IllustrationId = keyof typeof ILLUSTRATIONS;
