import { msg } from '@lingui/core/macro';
import type { ThreeCardsIllustrationCardType } from '@/sections/ThreeCards';

export const ILLUSTRATION_CARDS: ThreeCardsIllustrationCardType[] = [
  {
    heading: msg`Production grade quality`,
    body: msg`W3villa used Twenty as a production-grade framework for the data model, permissions, authentication, and workflow engine they would otherwise have rebuilt themselves.`,
    benefits: undefined,
    attribution: {
      role: msg`VP of Engineering`,
      company: msg`W3villa Technologies`,
    },
    illustration: 'diamond',
    caseStudySlug: 'w3villa',
  },
  {
    heading: msg`AI for rapid iterations`,
    body: msg`Alternative Partners used agentic AI to compress what would typically be weeks of Salesforce migration work into something a single person could oversee.`,
    benefits: undefined,
    attribution: {
      role: msg`Principal and Founder`,
      company: msg`Alternative Partners`,
    },
    illustration: 'flash',
    caseStudySlug: 'alternative-partners',
  },
  {
    heading: msg`Control without drag`,
    body: msg`AC&T moved to a self-hosted Twenty instance with no vendor risk, no forced migration, and CRM costs reduced by more than 90%.`,
    benefits: undefined,
    attribution: {
      role: msg`CRM Engineer`,
      company: msg`AC&T Education Migration`,
    },
    illustration: 'lock',
    caseStudySlug: 'act-education',
  },
];
