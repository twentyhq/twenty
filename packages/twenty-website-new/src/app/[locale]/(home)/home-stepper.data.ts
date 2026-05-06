import { msg } from '@lingui/core/macro';
import type { HomeStepperDataType } from '@/sections/HomeStepper/types';

export const HOME_STEPPER_DATA: HomeStepperDataType = {
  steps: [
    {
      heading: [
        {
          text: msg`Begin with production-grade`,
          fontFamily: 'serif',
        },
        {
          text: msg`building blocks`,
          fontFamily: 'sans',
        },
      ],
      body: {
        text: msg`Compose your CRM and internal apps with a single extensibility toolkit. Data model, layout, and automation.`,
      },
    },
    {
      heading: [
        {
          text: msg`Continue iteration`,
          fontFamily: 'serif',
        },
        {
          text: msg`without friction`,
          fontFamily: 'sans',
        },
      ],
      body: {
        text: msg`Enjoy unlimited customization using the AI coding tools you already love. Adapt your CRM to fit the way your business grows and wins.`,
      },
    },
    {
      heading: [
        {
          text: msg`Stay in control with our`,
          fontFamily: 'serif',
        },
        {
          text: msg`open-source software`,
          fontFamily: 'sans',
        },
      ],
      body: {
        text: msg`Don't get locked into someone else's ecosystem. Twenty's developer experience looks like normal software, with local setup, real data, live testing, and no proprietary tooling.`,
      },
    },
  ],
};
