import type { CaseStudyData } from './types';

const PLACEHOLDER_HERO = '/images/home/hero/avatars/katherine-adams.jpg';

export const NINE_DOTS_CASE_STUDY: CaseStudyData = {
  slug: '9dots',
  meta: {
    title: '9Dots — Production-grade CRM with Twenty',
    description:
      'Placeholder: how 9Dots uses Twenty for production-grade quality (copy TBD).',
  },
  hero: {
    readingTime: '5 min',
    title: [
      { text: 'Production-grade ', fontFamily: 'serif' },
      { text: 'quality at scale', fontFamily: 'sans' },
    ],
    author: 'Twenty Team',
    clientIcon: 'zapier',
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
        'This case study page is stub content for 9Dots. Replace with final copy, imagery, and structure when ready.',
        'The home ThreeCards “Production grade quality” card links here.',
      ],
    },
    {
      type: 'visual',
      src: PLACEHOLDER_HERO,
      alt: 'Placeholder visual for 9Dots case study.',
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
      'Placeholder testimonial for 9Dots — replace with approved quote.',
    author: {
      name: 'Placeholder Name',
      handle: 'VP Engineering at 9Dots',
      date: 'March 1, 2026',
      avatarSrc: PLACEHOLDER_HERO,
    },
  },
  tableOfContents: ['Overview', 'Next steps'],
  catalogCard: {
    summary:
      'Placeholder: 9Dots and production-grade quality with Twenty (summary TBD).',
    date: 'Mar 1, 2026',
  },
};
