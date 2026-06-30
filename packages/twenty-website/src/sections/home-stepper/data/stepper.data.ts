import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export type StepperStep = {
  body: MessageDescriptor;
  heading: MessageDescriptor;
};

export const STEPPER_STEPS: readonly StepperStep[] = [
  {
    heading: msg`Begin with production-grade *building blocks*`,
    body: msg`Compose your CRM and internal apps with a single extensibility toolkit. Data model, layout, and automation.`,
  },
  {
    heading: msg`Continue iteration *without friction*`,
    body: msg`Enjoy unlimited customization using the AI coding tools you already love. Adapt your CRM to fit the way your business grows and wins.`,
  },
  {
    heading: msg`Stay in control with our *open-source software*`,
    body: msg`Don't get locked into someone else's ecosystem. Twenty's developer experience looks like normal software, with local setup, real data, live testing, and no proprietary tooling.`,
  },
];
