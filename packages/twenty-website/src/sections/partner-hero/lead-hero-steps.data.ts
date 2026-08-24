import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export type LeadHeroStep = {
  number: string;
  title: MessageDescriptor;
};

export const LEAD_HERO_STEPS: readonly LeadHeroStep[] = [
  { number: '01', title: msg`Tell us what you need` },
  { number: '02', title: msg`Get matched` },
  { number: '03', title: msg`Book an intro call` },
];
