import type { CaseStudyData } from './types';

export const BEAGLE_CASE_STUDY: CaseStudyData = {
  slug: 'beagle',
  meta: {
    title: 'Beagle shortened their sales cycle by 30% — Twenty',
    description:
      'How Beagle launched a custom onboarding pipeline and shortened their sales cycle by 30% with Twenty.',
  },
  hero: {
    readingTime: '4 min',
    title: [
      { text: 'A custom pipeline for ', fontFamily: 'serif' },
      { text: 'faster onboarding', fontFamily: 'sans' },
    ],
    author: 'Alice Martin',
    clientIcon: 'beagle',
    heroImageSrc: '/images/case-studies/beagle-hero.jpg',
  },
  sections: [
    {
      type: 'text',
      eyebrow: 'The challenge',
      heading: [
        { text: 'Onboarding was a ', fontFamily: 'serif' },
        { text: 'black box', fontFamily: 'sans' },
      ],
      paragraphs: [
        'Beagle\'s sales team was closing deals, but the handoff to onboarding was where momentum died. New customers were dropped into a generic process that had no visibility back into what was promised during the sale.',
        'CSMs had to re-discover customer needs from scratch. Time-to-value stretched out, and early churn was creeping up. The CRM tracked the deal — but not what happened after it closed.',
        'They needed an end-to-end view from first touch to full activation, all in one system that both sales and CS could own.',
      ],
    },
    {
      type: 'visual',
      src: '/images/case-studies/beagle-pipeline.jpg',
      alt: 'Beagle onboarding pipeline in Twenty CRM with custom stages and automated handoff.',
    },
    {
      type: 'text',
      heading: [
        { text: 'Designing a seamless ', fontFamily: 'serif' },
        { text: 'sales-to-CS handoff', fontFamily: 'sans' },
      ],
      paragraphs: [
        'Beagle built a custom pipeline in Twenty that extended past the "Closed Won" stage into structured onboarding milestones: kickoff, integration, training, and go-live. Each stage had its own checklist and SLA.',
        'Custom fields captured implementation requirements during the sales cycle, so CSMs inherited full context without a single re-discovery call. Automated notifications triggered when a deal transitioned from sales to onboarding.',
      ],
      callout:
        'CSMs reported saving 3-4 hours per new customer by eliminating redundant discovery calls.',
    },
    {
      type: 'visual',
      src: '/images/case-studies/beagle-handoff.jpg',
      alt: 'Automated handoff workflow between sales and customer success in Twenty.',
    },
    {
      type: 'text',
      eyebrow: 'The results',
      heading: [
        { text: '30% shorter ', fontFamily: 'serif' },
        { text: 'sales cycles', fontFamily: 'sans' },
      ],
      paragraphs: [
        'With a unified pipeline from prospect to activated customer, Beagle reduced their overall sales cycle by 30%. The improvement came from both sides — faster deal progression and dramatically shorter onboarding.',
        'Early churn dropped by 22% in the first quarter after launch. Customers felt the difference: faster setup, fewer redundant meetings, and a team that already understood their needs.',
        'Beagle proved that the best CRM is not one that stops at the signature — it is one that sees the full customer journey.',
      ],
    },
  ],
  testimonial: {
    eyebrow: 'What they say',
    quote:
      'We stopped losing customers in the handoff. Twenty gave us one pipeline from first call to go-live — and our churn numbers show it.',
    author: {
      name: 'James Chen',
      handle: '@james_chen',
      date: 'January 8, 2025',
      avatarSrc: '/images/case-studies/avatars/james-chen.jpg',
    },
  },
  tableOfContents: [
    'The challenge',
    'Designing a seamless sales-to-CS handoff',
    'The results',
  ],
  catalogCard: {
    summary:
      'Beagle launched a custom onboarding pipeline and shortened their sales cycle by 30%.',
    date: 'Jan 8, 2025',
  },
};
