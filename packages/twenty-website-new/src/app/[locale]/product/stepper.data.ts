import { msg } from '@lingui/core/macro';
import type { ProductStepperDataType } from '@/sections/ProductStepper/types';

export const STEPPER_DATA: ProductStepperDataType = {
  eyebrow: {
    heading: {
      text: msg`Customization`,
      fontFamily: 'sans',
    },
  },
  body: {
    text: msg`Need a quick change? Skip the engineering ticket. Customize your workspace in minutes.`,
  },
  steps: [
    {
      icon: 'users',
      heading: {
        text: msg`Data model`,
        fontFamily: 'sans',
      },
      body: {
        text: msg`Add objects and fields`,
      },
      image: {
        src: '/images/product/stepper/step-one.webp',
        alt: 'Twenty data model: add objects and fields',
      },
    },
    {
      icon: 'check',
      heading: {
        text: msg`Automation`,
        fontFamily: 'sans',
      },
      body: {
        text: msg`Create a workflow`,
      },
      image: {
        src: '/images/product/stepper/step-two.webp',
        alt: 'Twenty automation: create a workflow',
      },
    },
    {
      icon: 'eye',
      heading: {
        text: msg`Layout`,
        fontFamily: 'sans',
      },
      body: {
        text: msg`Tailor record pages, menus, and views`,
      },
      image: {
        src: '/images/product/stepper/step-three.webp',
        alt: 'Twenty layout: record pages, menus, and views',
      },
    },
  ],
};
