import { msg } from '@lingui/core/macro';

import { type FaqQuestion } from './faq.data';

export const BECOME_PARTNER_FAQ_QUESTIONS: readonly FaqQuestion[] = [
  {
    question: msg`How do I apply?`,
    answer: msg`Click Become a partner and complete the short application: who you are, what you cover, and one real Twenty project with proof. We review every application against real, shipped work — acceptance is selective.`,
  },
  {
    question: msg`What are the requirements?`,
    answer: msg`At least one shipped Twenty implementation — customer or internal — with a link that shows the work. Solo freelancers and agencies both qualify.`,
  },
  {
    question: msg`What do I get as a partner?`,
    answer: msg`Certification, plus a directory profile your clients can verify. The best partners also receive client briefs matched to their scope.`,
  },
  {
    question: msg`How do client briefs reach me?`,
    answer: msg`Buyers submit a project brief with scope, timeline, and budget. We hand-pick the certified partners who fit and make the introduction within 48 hours.`,
  },
  {
    question: msg`Does it cost anything?`,
    answer: msg`No. Applying and being listed are free. You set your own rates and keep what you bill.`,
  },
  {
    question: msg`What does certification involve?`,
    answer: msg`We review your delivered projects, technical depth, and customer feedback before you join the directory. Certified partners carry the badge on their profile.`,
  },
];
