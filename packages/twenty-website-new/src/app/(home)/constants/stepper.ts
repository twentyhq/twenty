import type { HeroStepperDataType } from '@/sections/HeroStepper/types';

export const STEPPER_DATA: HeroStepperDataType = {
  steps: [
    {
      heading: [
        {
          text: 'Begin with production-grade',
          fontFamily: 'serif',
        },
        {
          text: ' building blocks',
          fontFamily: 'sans',
        },
      ],
      body: {
        text: 'Compose your CRM and internal apps with a single extensibility toolkit. Data model, layout, and automation.',
      },
      images: [
        {
          src: '/images/home/stepper/step-one-one.png',
          alt: 'Twenty modules for logic, data model, and layout',
        },
        {
          src: '/images/home/stepper/step-one-two.png',
          alt: 'Twenty data model and layout building blocks',
        },
        {
          src: '/images/home/stepper/step-one-three.png',
          alt: 'Twenty automation and extensibility toolkit',
        },
      ],
    },
    {
      heading: [
        {
          text: 'Continue iteration',
          fontFamily: 'serif',
        },
        {
          text: ' without friction',
          fontFamily: 'sans',
        },
      ],
      body: {
        text: 'Enjoy unlimited customization using the AI coding tools you already love. Adapt your CRM to fit the way your business grows and wins.',
      },
      images: [
        {
          src: '/images/home/stepper/step-two-one.png',
          alt: 'Twenty CRM adapted with familiar development tools',
        },
        {
          src: '/images/home/stepper/step-two-two.png',
          alt: 'Customizing Twenty with AI-assisted coding workflows',
        },
        {
          src: '/images/home/stepper/step-two-three.png',
          alt: 'Iterating on Twenty as your business grows',
        },
        {
          src: '/images/home/stepper/step-two-four.png',
          alt: 'Twenty workspace tailored to your team',
        },
      ],
    },
    {
      heading: [
        {
          text: 'Stay in control with our',
          fontFamily: 'serif',
        },
        {
          text: ' open-source software',
          fontFamily: 'sans',
        },
      ],
      body: {
        text: "Don't get locked into someone else's ecosystem. Twenty's developer experience looks like normal software, with local setup, real data, live testing, and no proprietary tooling.",
      },
      images: [
        {
          src: '/images/home/stepper/step-three-one.png',
          alt: 'Twenty open-source CRM in a normal local development setup',
        },
        {
          src: '/images/home/stepper/step-three-two.png',
          alt: 'Twenty developer experience with real data and live testing',
        },
        {
          src: '/images/home/stepper/step-three-three.png',
          alt: 'Twenty without proprietary vendor lock-in',
        },
        {
          src: '/images/home/stepper/step-three-four.png',
          alt: 'Twenty as transparent, self-hosted software',
        },
      ],
    },
  ],
};
