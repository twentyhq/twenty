import { msg } from '@lingui/core/macro';

import { type FaqQuestion } from './faq.data';

export const AFFILIATE_PROGRAM_FAQ_QUESTIONS: readonly FaqQuestion[] = [
  {
    question: msg`Which plans count?`,
    answer: msg`Organization and Enterprise plans on Twenty Cloud. Self-hosted Organization is coming soon. Pro plans and AI credits are not included.`,
  },
  {
    question: msg`How long does my link work?`,
    answer: msg`60 days after the click. If the visitor starts a Cloud Organization or Enterprise plan within that time, the commission is yours. If they later click another partner's link, that partner gets the credit.`,
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
