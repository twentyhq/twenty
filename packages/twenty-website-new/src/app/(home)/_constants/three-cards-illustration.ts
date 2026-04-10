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
    text: 'Compose your CRM and interal apps with a single exesibility toolkit.',
  },
  illustrationCards: [
    {
      heading: { text: 'Production grade quality', fontFamily: 'sans' },
      body: {
        text: "What stood out with Twenty wasn't just flexibility it was the quality. The system feels stable, polished, and ready for real teams with real stakes.",
      },
      benefits: undefined,
      attribution: {
        role: { text: 'Head of Engineering' },
        company: { text: 'Mid-Market Fintech' },
      },
      illustration: 'diamond',
    },
    {
      heading: { text: 'AI for rapid iterations', fontFamily: 'sans' },
      body: {
        text: 'Twenty removes friction from iteration and lets us adapt our CRM as the business changes.',
      },
      benefits: undefined,
      attribution: {
        role: { text: 'Head of Engineering' },
        company: { text: 'Mid-Market Fintech' },
      },
      illustration: 'flash',
    },
    {
      heading: { text: 'Control without drag', fontFamily: 'sans' },
      body: {
        text: "It's a modern, open-source alternative to Salesforce/Hubspot that lets you manage your customer relationships in a secure + privacy-first way.",
      },
      benefits: undefined,
      attribution: {
        role: { text: 'Head of Engineering' },
        company: { text: 'Mid-Market Fintech' },
      },
      illustration: 'lock',
    },
  ],
};
