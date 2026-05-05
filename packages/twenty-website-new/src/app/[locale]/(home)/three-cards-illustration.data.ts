import { msg } from '@lingui/core/macro';
import type { ThreeCardsIllustrationDataType } from '@/sections/ThreeCards/types';

export const THREE_CARDS_ILLUSTRATION_DATA: ThreeCardsIllustrationDataType = {
  eyebrow: {
    heading: { text: msg`Stop settling for trade-offs.`, fontFamily: 'sans' },
  },
  body: {
    text: msg`Compose your CRM and internal apps with a single extensibility toolkit.`,
  },
  illustrationCards: [
    {
      heading: { text: msg`Production grade quality`, fontFamily: 'sans' },
      body: {
        text: msg`W3villa used Twenty as a production-grade framework for the data model, permissions, authentication, and workflow engine they would otherwise have rebuilt themselves.`,
      },
      benefits: undefined,
      attribution: {
        role: { text: msg`VP of Engineering` },
        company: { text: msg`W3villa Technologies` },
      },
      illustration: 'diamond',
      caseStudySlug: 'w3villa',
    },
    {
      heading: { text: msg`AI for rapid iterations`, fontFamily: 'sans' },
      body: {
        text: msg`Alternative Partners used agentic AI to compress what would typically be weeks of Salesforce migration work into something a single person could oversee.`,
      },
      benefits: undefined,
      attribution: {
        role: { text: msg`Principal and Founder` },
        company: { text: msg`Alternative Partners` },
      },
      illustration: 'flash',
      caseStudySlug: 'alternative-partners',
    },
    {
      heading: { text: msg`Control without drag`, fontFamily: 'sans' },
      body: {
        text: msg`AC&T moved to a self-hosted Twenty instance with no vendor risk, no forced migration, and CRM costs reduced by more than 90%.`,
      },
      benefits: undefined,
      attribution: {
        role: { text: msg`CRM Engineer` },
        company: { text: msg`AC&T Education Migration` },
      },
      illustration: 'lock',
      caseStudySlug: 'act-education',
    },
  ],
};
