import { msg } from '@lingui/core/macro';
import type { ThreeCardsIllustrationCardType } from '@/sections/ThreeCards';

export const PARTNER_ILLUSTRATION_CARDS: ThreeCardsIllustrationCardType[] = [
  {
    heading: msg`Technology Partners`,
    body: msg`Build integrations that connect Twenty with the tools your customers already use. Help us expand the Twenty ecosystem.`,
    benefits: [
      { text: msg`Co-marketing opportunities`, icon: 'users' },
      { text: msg`Listing on Twenty integrations page`, icon: 'search' },
      { text: msg`Soon: earn revenue`, icon: 'tag' },
    ],
    action: {
      kind: 'partnerApplication',
      label: msg`Become a Technology Partner`,
      programId: 'technology',
    },
    attribution: undefined,
    illustration: 'programming',
  },
  {
    heading: msg`Content & Community Partners`,
    body: msg`Share Twenty with your audience and help shape the future of the #1 Open Source CRM. We're looking for creators, educators, and community builders who want to showcase great software.`,
    benefits: [
      { text: msg`Revenue share for referred customers`, icon: 'tag' },
      {
        text: msg`Exclusive content collaboration opportunities`,
        icon: 'edit',
      },
      { text: msg`Marketing assets & brand resources`, icon: 'book' },
    ],
    action: {
      kind: 'partnerApplication',
      label: msg`Become a Content Partner`,
      programId: 'content',
    },
    attribution: undefined,
    illustration: 'connect',
  },
  {
    heading: msg`Solutions Partners`,
    body: msg`Help customers implement, customize, and succeed with Twenty. Combine sales and services to grow your business.`,
    benefits: [
      { text: msg`Resale discounts & revenue share`, icon: 'tag' },
      { text: msg`Marketplace listing`, icon: 'search' },
      { text: msg`Dedicated partner support`, icon: 'users' },
    ],
    action: {
      kind: 'partnerApplication',
      label: msg`Become a Solution Partner`,
      programId: 'solutions',
    },
    attribution: undefined,
    illustration: 'grow',
  },
];
