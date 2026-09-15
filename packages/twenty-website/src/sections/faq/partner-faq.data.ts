import { msg } from '@lingui/core/macro';

import { type FaqQuestion } from './faq.data';

export const PARTNER_FAQ_QUESTIONS: readonly FaqQuestion[] = [
  {
    question: msg`How does matching work?`,
    answer: msg`Share a short brief on your project, timeline, and budget. We hand-pick certified partners who fit and introduce you within 48 hours.`,
  },
  {
    question: msg`What do partners charge?`,
    answer: msg`Rates vary by partner and scope. Each partner profile lists their published rates, and you can compare before booking a call.`,
  },
  {
    question: msg`How are partners vetted?`,
    answer: msg`Every partner is certified by Twenty and reviewed on delivered projects, technical depth, and customer feedback before joining the directory.`,
  },
  {
    question: msg`Can a partner run my migration?`,
    answer: msg`Yes. Migration partners move your data out of Salesforce, HubSpot, or spreadsheets, and can own the full cutover for you.`,
  },
  {
    question: msg`Do partners support self-hosting?`,
    answer: msg`Yes. Some partners specialise in deploying, upgrading, and operating self-hosted Twenty instances on your own infrastructure.`,
  },
  {
    question: msg`How do I become a partner?`,
    answer: msg`Agencies and freelancers apply through the Twenty partner program page, which lists the requirements and carries the application form.`,
  },
];
