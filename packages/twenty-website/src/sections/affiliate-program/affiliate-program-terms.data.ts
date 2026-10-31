import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export type AffiliateProgramTerm = {
  value: MessageDescriptor;
  label: MessageDescriptor;
};

export const AFFILIATE_PROGRAM_TERMS: readonly AffiliateProgramTerm[] = [
  {
    value: msg`20%`,
    label: msg`of seat revenue on Cloud Organization and Enterprise`,
  },
  {
    value: msg`12 months`,
    label: msg`per customer, from their first payment`,
  },
  {
    value: msg`60 days`,
    label: msg`of credit after each click on your link`,
  },
  {
    value: msg`Monthly`,
    label: msg`Payouts from $50, after a 30-day hold`,
  },
];
