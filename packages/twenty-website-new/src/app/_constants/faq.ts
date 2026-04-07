import type { FaqDataType } from '@/sections/Faq/types';

export const FAQ_DATA: FaqDataType = {
  illustration: {
    src: '/illustrations/common/faq/faq.glb',
    title: 'FAQ illustration',
  },
  eyebrow: {
    heading: {
      text: 'Any Questions?',
      fontFamily: 'sans',
    },
  },
  heading: [
    {
      text: 'Stop fighting custom.\n',
      fontFamily: 'serif',
    },
    {
      text: ' Start building, with Twenty',
      fontFamily: 'sans',
    },
  ],
  questions: [
    {
      question: {
        text: 'How long does it take to get started?',
        fontFamily: 'sans',
      },
      answer: {
        text: 'You can seamlessly deploy Twenty CRM to your production within hours. For highly bespoke on-premise implementations and massive scale data structures, our guided integration typically takes less than two weeks.',
      },
    },
    {
      question: {
        text: 'Can I migrate from Salesforce or HubSpot?',
        fontFamily: 'sans',
      },
      answer: {
        text: 'Yes. We provide migration tools and support to help you move your data from Salesforce, HubSpot, and other CRMs into Twenty.',
      },
    },
    {
      question: {
        text: 'Do I need a developer to customize Twenty?',
        fontFamily: 'sans',
      },
      answer: {
        text: 'Twenty is designed to be customizable without code. For advanced customizations, our API and documentation support developer-led extensions.',
      },
    },
    {
      question: {
        text: 'Is my data secure?',
        fontFamily: 'sans',
      },
      answer: {
        text: 'We take security seriously. Your data is encrypted at rest and in transit, and you can self-host to keep full control.',
      },
    },
    {
      question: {
        text: 'How does AI usage pricing work?',
        fontFamily: 'sans',
      },
      answer: {
        text: 'AI features are billed based on usage. See our pricing page for details and current rates.',
      },
    },
  ],
};
