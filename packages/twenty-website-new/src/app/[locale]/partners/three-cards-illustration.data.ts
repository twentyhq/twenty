import { msg } from '@lingui/core/macro';
import type { ThreeCardsIllustrationDataType } from '@/sections/ThreeCards/types';

export const THREE_CARDS_ILLUSTRATION_DATA: ThreeCardsIllustrationDataType = {
  eyebrow: {
    heading: {
      text: msg`Which partner program is right for you?`,
      fontFamily: 'sans',
    },
  },
  illustrationCards: [
    {
      heading: { text: msg`Technology Partners`, fontFamily: 'sans' },
      body: {
        text: msg`Build integrations that connect Twenty with the tools your customers already use. Help us expand the Twenty ecosystem.`,
      },
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
      heading: { text: msg`Content & Community Partners`, fontFamily: 'sans' },
      body: {
        text: msg`Share Twenty with your audience and help shape the future of the #1 open source CRM. We're looking for creators, educators, and community builders who want to showcase great software.`,
      },
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
      heading: { text: msg`Solutions Partners`, fontFamily: 'sans' },
      body: {
        text: msg`Help customers implement, customize, and succeed with Twenty. Combine sales and services to grow your business.`,
      },
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
  ],
};
