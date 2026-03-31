import type { ProductStepperDataType } from '@/sections/ProductStepper/types';

export const STEPPER_DATA: ProductStepperDataType = {
  eyebrow: {
    heading: {
      text: 'Customization',
      fontFamily: 'sans',
    },
  },
  heading: [
    {
      text: 'Go the extra mile',
      fontFamily: 'serif',
    },
    {
      text: ' with no-code',
      fontFamily: 'sans',
    },
  ],
  body: {
    text: 'Need a quick change? Skip the engineering ticket. Customize your workspace in minutes.',
  },
  steps: [
    {
      icon: 'users',
      heading: {
        text: 'Data model',
        fontFamily: 'sans',
      },
      body: {
        text: 'Add objects and fields',
      },
      image: {
        src: '/images/product/stepper/step-one.png',
        alt: 'Twenty data model: add objects and fields',
      },
    },
    {
      icon: 'check',
      heading: {
        text: 'Automation',
        fontFamily: 'sans',
      },
      body: {
        text: 'Create a workflow',
      },
      image: {
        src: '/images/product/stepper/step-two.png',
        alt: 'Twenty automation: create a workflow',
      },
    },
    {
      icon: 'eye',
      heading: {
        text: 'Layout',
        fontFamily: 'sans',
      },
      body: {
        text: 'Tailor record pages, menus, and views',
      },
      image: {
        src: '/images/product/stepper/step-three.png',
        alt: 'Twenty layout: record pages, menus, and views',
      },
    },
  ],
};
