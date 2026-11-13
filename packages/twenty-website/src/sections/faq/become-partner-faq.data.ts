import { msg } from '@lingui/core/macro';

import { type FaqQuestion } from './faq.data';

export const BECOME_PARTNER_FAQ_QUESTIONS: readonly FaqQuestion[] = [
  {
    question: msg`How do I apply?`,
    answer: msg`Click Apply as an integrator and complete the short application: who you are, the clients you work with, and what you have built with Twenty. We review every application by hand.`,
  },
  {
    question: msg`What do I get as an integrator?`,
    answer: msg`20% of the seat revenue of every client you bring, for 12 months, plus the partner Discord where our team and other partners answer your questions. Partner training is coming soon.`,
  },
  {
    question: msg`What is a Lead Integrator?`,
    answer: msg`An integrator we trust with our own leads, once we have seen their work with clients. Lead Integrators get client briefs and a profile in the partner directory, on top of everything integrators get.`,
  },
  {
    question: msg`How do client briefs reach Lead Integrators?`,
    answer: msg`Companies submit a project brief with scope, timeline, and budget. We pick the Lead Integrators who fit and make the introduction within 48 hours. Clients from these briefs do not earn a commission.`,
  },
  {
    question: msg`Does it cost anything?`,
    answer: msg`No. Applying and joining are free. You set your own rates and keep what you bill.`,
  },
  {
    question: msg`I create content but do not implement Twenty. Is this for me?`,
    answer: msg`The creator program fits you better: creators, communities and tech partners earn 20% on every team they bring.`,
  },
];
