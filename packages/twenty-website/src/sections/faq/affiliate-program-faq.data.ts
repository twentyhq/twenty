import { msg } from '@lingui/core/macro';

import { type FaqQuestion } from './faq.data';

export const AFFILIATE_PROGRAM_FAQ_QUESTIONS: readonly FaqQuestion[] = [
  {
    question: msg`Which plans count?`,
    answer: msg`Organization and Enterprise plans on Twenty Cloud. Pro plans and AI credits are not included.`,
  },
  {
    question: msg`How long does my link work?`,
    answer: msg`30 days after the click. If the visitor creates their workspace within that time and later becomes a paying Cloud Organization or Enterprise customer, the commission is yours. If they click another partner's link before creating their workspace, that partner gets the credit. Once the workspace is created, the credit is final.`,
  },
  {
    question: msg`What if a customer signs up without my link?`,
    answer: msg`If it's their first Twenty workspace and no partner code is set on it yet, they can enter yours on the /settings/partner page of their workspace during their free trial. Within 30 days of the first payment, they can also ask us to add it. Once a code is saved on a workspace, it can't be changed.`,
  },
  {
    question: msg`When do I get paid?`,
    answer: msg`Monthly, once your balance reaches $50. Each commission is released 30 days after the customer pays, to cover refunds. Once paid, it's yours.`,
  },
  {
    question: msg`Can I refer my own company?`,
    answer: msg`No. Self-referrals, your own workspace, and existing Twenty customers don't earn commission.`,
  },
];
