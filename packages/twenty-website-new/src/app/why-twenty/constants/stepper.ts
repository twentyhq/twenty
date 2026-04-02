import type { WhyTwentyStepperDataType } from '@/sections/WhyTwentyStepper/types';

export const STEPPER_DATA: WhyTwentyStepperDataType = {
  heading: { text: 'Our vision', fontFamily: 'serif' },
  body: [
    {
      text: 'We believe every serious company will need a malleable system of record for customers. Not a collection of disconnected tools.',
    },
    {
      text: 'Not a frozen monolith that only specialists can change. A living system that can evolve as fast as strategy evolves, while remaining trustworthy enough for humans, agents, and regulators to rely on.',
    },
    {
      text: 'Because in the AI age, the winners will not be the companies with the most dashboards. They will be the companies whose systems turn information into decisions, and decisions into action, faster than everyone else.',
    },
  ],
  illustration: {
    src: 'https://app.endlesstools.io/embed/ddc485f9-cc8e-422b-a076-5430eb84e21a',
    title: 'Endless Tools Editor',
  },
};
