import type { CaseStudyData } from './types';

const PLACEHOLDER_HERO = '/images/home/hero/avatars/katherine-adams.jpg';

export const ALTERNATIVE_PARTNERS_CASE_STUDY: CaseStudyData = {
  slug: 'alternative-partners',
  meta: {
    title: 'Alternative Partners — AI for rapid iterations',
    description:
      'Placeholder: how Alternative Partners uses Twenty for rapid iteration (copy TBD).',
  },
  hero: {
    readingTime: '5 min',
    title: [
      { text: 'AI for ', fontFamily: 'serif' },
      { text: 'rapid iterations', fontFamily: 'sans' },
    ],
    author: 'Twenty Team',
    clientIcon: 'flexport',
    heroImageSrc: PLACEHOLDER_HERO,
  },
  sections: [
    {
      type: 'text',
      eyebrow: 'Overview',
      heading: [
        { text: 'Placeholder ', fontFamily: 'serif' },
        { text: 'section', fontFamily: 'sans' },
      ],
      paragraphs: [
        'This case study page is stub content for Alternative Partners. Replace with final copy, imagery, and structure when ready.',
        'The home ThreeCards “AI for rapid iterations” card links here.',
      ],
    },
    {
      type: 'visual',
      src: PLACEHOLDER_HERO,
      alt: 'Placeholder visual for Alternative Partners case study.',
    },
    {
      type: 'text',
      eyebrow: 'Next steps',
      heading: [
        { text: 'Details ', fontFamily: 'serif' },
        { text: 'coming soon', fontFamily: 'sans' },
      ],
      paragraphs: [
        'Add real metrics, quotes, and visuals in follow-up edits.',
      ],
    },
  ],
  testimonial: {
    eyebrow: 'What they say',
    quote:
      'Placeholder testimonial for Alternative Partners — replace with approved quote.',
    author: {
      name: 'Placeholder Name',
      handle: 'Head of Operations at Alternative Partners',
      date: 'March 1, 2026',
      avatarSrc: PLACEHOLDER_HERO,
    },
  },
  tableOfContents: ['Overview', 'Next steps'],
  catalogCard: {
    summary:
      'Placeholder: Alternative Partners and AI-driven iteration with Twenty (summary TBD).',
    date: 'Mar 1, 2026',
  },
};
