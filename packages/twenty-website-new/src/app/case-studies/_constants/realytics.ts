import type { CaseStudyData } from './types';

export const REALYTICS_CASE_STUDY: CaseStudyData = {
  slug: 'realytics',
  meta: {
    title: 'Realytics increased qualified outbound by 40% — Twenty',
    description:
      'How Realytics built lead scoring into their CRM and increased qualified outbound by 40% using Twenty.',
  },
  hero: {
    readingTime: '5 min',
    title: [
      { text: 'Lead scoring that ', fontFamily: 'serif' },
      { text: 'drives real pipeline', fontFamily: 'sans' },
    ],
    author: 'Thomas des Francs',
    clientIcon: 'realytics',
    heroImageSrc: '/images/case-studies/realytics-hero.jpg',
  },
  sections: [
    {
      type: 'text',
      eyebrow: 'The challenge',
      heading: [
        { text: 'Outbound was high-volume, ', fontFamily: 'serif' },
        { text: 'but low-quality', fontFamily: 'sans' },
      ],
      paragraphs: [
        'Realytics had built a strong inbound engine, but their outbound pipeline was lagging behind. Sales reps were spending hours sifting through unqualified leads, sending generic outreach to contacts who were never going to convert.',
        'The core problem was not effort — it was signal. Without a scoring model embedded directly into their CRM, reps had no way to distinguish a warm prospect from a cold one. Every lead looked the same in the system.',
        'They needed a CRM that could be shaped to their specific qualification criteria — not a rigid tool that forced them into someone else\'s workflow.',
      ],
    },
    {
      type: 'visual',
      src: '/images/case-studies/realytics-scoring.jpg',
      alt: 'Lead scoring dashboard in Twenty CRM showing qualification criteria and pipeline stages.',
    },
    {
      type: 'text',
      heading: [
        { text: 'Building a custom ', fontFamily: 'serif' },
        { text: 'lead scoring engine', fontFamily: 'sans' },
      ],
      paragraphs: [
        'Using Twenty\'s flexible data model, Realytics defined custom fields for engagement signals — website visits, content downloads, event attendance, and firmographic fit. Each signal was assigned a weighted score that updated automatically.',
        'The scoring logic lived directly inside the CRM. No external spreadsheets, no bolted-on tools. When a lead crossed a threshold, it was surfaced to the right rep at the right time.',
      ],
      callout:
        'The scoring model reduced time-to-qualify by 60%, letting reps focus exclusively on high-intent prospects.',
    },
    {
      type: 'visual',
      src: '/images/case-studies/realytics-pipeline.jpg',
      alt: 'Realytics pipeline view showing scored and prioritized leads.',
    },
    {
      type: 'text',
      eyebrow: 'The results',
      heading: [
        { text: '40% more ', fontFamily: 'serif' },
        { text: 'qualified outbound', fontFamily: 'sans' },
      ],
      paragraphs: [
        'Within three months of deploying their custom scoring model, Realytics saw a 40% increase in qualified outbound pipeline. Reps were sending fewer emails, but each one was landing with the right person at the right time.',
        'The sales team reported higher confidence in their pipeline and shorter deal cycles. Marketing gained clearer feedback on which channels were producing the highest-quality leads.',
        'By owning their CRM data and logic, Realytics turned their outbound motion from a numbers game into a precision instrument.',
      ],
    },
  ],
  testimonial: {
    eyebrow: 'What they say',
    quote:
      'Twenty let us build the exact scoring model we needed — no compromises. Our reps finally trust the pipeline because they helped define what "qualified" means.',
    author: {
      name: 'Marie Laurent',
      handle: '@marie_laurent',
      date: 'March 12, 2025',
      avatarSrc: '/images/case-studies/avatars/marie-laurent.jpg',
    },
  },
  tableOfContents: [
    'The challenge',
    'Building a custom lead scoring engine',
    'The results',
  ],
  catalogCard: {
    summary:
      'Realytics built lead scoring into their CRM and increased qualified outbound by 40%.',
    date: 'Mar 12, 2025',
  },
};
