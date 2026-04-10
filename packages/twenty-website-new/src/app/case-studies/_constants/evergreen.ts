import type { CaseStudyData } from './types';

export const EVERGREEN_CASE_STUDY: CaseStudyData = {
  slug: 'evergreen',
  meta: {
    title: 'Evergreen boosted expansion revenue by 25% — Twenty',
    description:
      'How Evergreen unified sales and CS workflows to boost expansion revenue by 25% using Twenty.',
  },
  hero: {
    readingTime: '6 min',
    title: [
      { text: 'Unified workflows for ', fontFamily: 'serif' },
      { text: 'expansion revenue', fontFamily: 'sans' },
    ],
    author: 'Sarah Kim',
    clientIcon: 'evergreen',
    heroImageSrc: '/images/case-studies/evergreen-hero.jpg',
  },
  sections: [
    {
      type: 'text',
      eyebrow: 'The challenge',
      heading: [
        { text: 'Sales and CS were ', fontFamily: 'serif' },
        { text: 'flying blind', fontFamily: 'sans' },
      ],
      paragraphs: [
        'Evergreen\'s sales and customer success teams were operating in parallel universes. Sales tracked prospects in one system; CS managed renewals in spreadsheets. Neither team had visibility into the other\'s pipeline.',
        'Expansion opportunities were slipping through the cracks. A CS rep might identify an upsell signal, but it would take days to route it to the right sales rep — if it got routed at all.',
        'Leadership knew the revenue was there. They just needed one system where both teams could see the full picture and act on it together.',
      ],
    },
    {
      type: 'visual',
      src: '/images/case-studies/evergreen-unified.jpg',
      alt: 'Unified sales and CS dashboard in Twenty showing cross-team pipeline visibility.',
    },
    {
      type: 'text',
      heading: [
        { text: 'One CRM for the ', fontFamily: 'serif' },
        { text: 'entire revenue team', fontFamily: 'sans' },
      ],
      paragraphs: [
        'Evergreen consolidated their sales and CS workflows into Twenty. Custom views gave each team their own perspective, while shared fields — health score, product usage, renewal date — created a common language between them.',
        'When a CS rep updated a customer\'s health score or flagged an expansion signal, it appeared instantly in the sales team\'s pipeline. No handoff emails, no Slack pings, no lag.',
      ],
      callout:
        'The shared data model eliminated the 48-hour average delay between CS identifying an opportunity and sales acting on it.',
    },
    {
      type: 'text',
      heading: [
        { text: 'CRM becomes an ', fontFamily: 'serif' },
        { text: 'execution system', fontFamily: 'sans' },
      ],
      paragraphs: [
        'For years, CRM was treated like a ledger — a place to log what happened. Evergreen flipped that. By embedding both retention and expansion logic into their CRM, the system became where work begins.',
        'When a customer\'s usage pattern changed, the CRM surfaced the right action to the right person. Renewals were forecasted accurately. Upsell conversations started with data, not guesswork.',
      ],
    },
    {
      type: 'visual',
      src: '/images/case-studies/evergreen-expansion.jpg',
      alt: 'Expansion revenue tracking view showing upsell pipeline alongside renewals.',
    },
    {
      type: 'text',
      eyebrow: 'The results',
      heading: [
        { text: '25% growth in ', fontFamily: 'serif' },
        { text: 'expansion revenue', fontFamily: 'sans' },
      ],
      paragraphs: [
        'In six months, Evergreen grew their expansion revenue by 25%. The improvement came from two sources: faster identification of upsell opportunities and higher conversion rates on those opportunities.',
        'Net revenue retention climbed from 108% to 119%. The sales and CS teams, once siloed, now operated as a single revenue engine with shared goals and shared data.',
        'By owning their CRM and unifying their workflows, Evergreen proved that the best growth strategy is not acquiring new logos — it is maximizing the value of the customers you already have.',
      ],
    },
  ],
  testimonial: {
    eyebrow: 'What they say',
    quote:
      'Twenty gave us a single source of truth for the entire customer lifecycle. Our expansion revenue growth speaks for itself — 25% in six months.',
    author: {
      name: 'David Park',
      handle: '@david_park',
      date: 'February 20, 2025',
      avatarSrc: '/images/case-studies/avatars/david-park.jpg',
    },
  },
  tableOfContents: [
    'The challenge',
    'One CRM for the entire revenue team',
    'CRM becomes an execution system',
    'The results',
  ],
  catalogCard: {
    summary:
      'Evergreen unified sales and CS workflows, boosting expansion revenue by 25%.',
    date: 'Feb 20, 2025',
  },
};
