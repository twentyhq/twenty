'use client';

import type { ComponentType } from 'react';
import { FaqBackground } from './Faq/Background';
import { FooterBackground } from './Footer/Background';
import { Money } from './Helped/Money';
import { Spaceship } from './Helped/Spaceship';
import { Target } from './Helped/Target';
import { Product } from './Hero/Product';
import { WhyTwenty } from './Hero/WhyTwenty';
import { Organization } from './Plans/Organization';
import { Pro } from './Plans/Pro';
import { Quotes } from './Quote/Quotes';
import { Hourglass } from './Testimonials/Hourglass';
import { Partner } from './Testimonials/Partner';
import { Connect } from './ThreeCards/Connect';
import { Diamond } from './ThreeCards/Diamond';
import { Eye } from './ThreeCards/Eye';
import { Flash } from './ThreeCards/Flash';
import { Grow } from './ThreeCards/Grow';
import { Lock } from './ThreeCards/Lock';
import { Programming } from './ThreeCards/Programming';
import { SingleScreen } from './ThreeCards/SingleScreen';
import { Speed } from './ThreeCards/Speed';
import { Logo as WhyTwentyStepperLogo } from './WhyTwentyStepper/Logo';

export const THREE_CARDS_ILLUSTRATIONS = {
  diamond: Diamond,
  eye: Eye,
  flash: Flash,
  lock: Lock,
  connect: Connect,
  grow: Grow,
  programming: Programming,
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
  planPro: Pro,
  planOrganization: Organization,
  money: Money,
  spaceship: Spaceship,
  target: Target,
} as const satisfies Record<string, ComponentType>;

export type IllustrationId = keyof typeof ILLUSTRATIONS;
