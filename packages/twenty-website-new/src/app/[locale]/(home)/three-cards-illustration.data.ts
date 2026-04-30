import type { ThreeCardsIllustrationDataType } from '@/sections/ThreeCards/types';

export const THREE_CARDS_ILLUSTRATION_DATA: ThreeCardsIllustrationDataType = {
  eyebrow: {
    heading: { text: 'Stop settling for trade-offs.', fontFamily: 'sans' },
  },
  heading: [
    { text: 'Assemble, iterate and adapt a robust CRM,', fontFamily: 'serif' },
    { text: " that's quick to flex", fontFamily: 'sans' },
  ],
  body: {
    text: 'Compose your CRM and internal apps with a single extensibility toolkit.',
  },
  illustrationCards: [
    {
      heading: { text: 'Production grade quality', fontFamily: 'sans' },
      body: {
        text: 'W3villa used Twenty as a production-grade framework for the data model, permissions, authentication, and workflow engine they would otherwise have rebuilt themselves.',
      },
      benefits: undefined,
      attribution: {
        role: { text: 'VP of Engineering' },
        company: { text: 'W3villa Technologies' },
      },
      illustration: 'diamond',
      caseStudySlug: 'w3villa',
    },
    {
      heading: { text: 'AI for rapid iterations', fontFamily: 'sans' },
      body: {
        text: 'Alternative Partners used agentic AI to compress what would typically be weeks of Salesforce migration work into something a single person could oversee.',
      },
      benefits: undefined,
      attribution: {
        role: { text: 'Principal and Founder' },
        company: { text: 'Alternative Partners' },
      },
      illustration: 'flash',
      caseStudySlug: 'alternative-partners',
    },
    {
      heading: { text: 'Control without drag', fontFamily: 'sans' },
      body: {
        text: 'AC&T moved to a self-hosted Twenty instance with no vendor risk, no forced migration, and CRM costs reduced by more than 90%.',
      },
      benefits: undefined,
      attribution: {
        role: { text: 'CRM Engineer' },
        company: { text: 'AC&T Education Migration' },
      },
      illustration: 'lock',
      caseStudySlug: 'act-education',
    },
  ],
};
