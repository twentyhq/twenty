import type { CaseStudyData } from './types';

const PLACEHOLDER_HERO = '/images/home/hero/avatars/katherine-adams.jpg';

export const ELEVATE_CONSULTING_CASE_STUDY: CaseStudyData = {
  slug: 'elevate-consulting',
  meta: {
    title: 'Elevate Consulting — Control without drag',
    description:
      'Placeholder: how Elevate Consulting uses Twenty for control without drag (copy TBD).',
  },
  hero: {
    readingTime: '5 min',
    title: [
      { text: 'Control ', fontFamily: 'serif' },
      { text: 'without drag', fontFamily: 'sans' },
    ],
    author: 'Twenty Team',
    clientIcon: 'evergreen',
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
        'This case study page is stub content for Elevate Consulting. Replace with final copy, imagery, and structure when ready.',
        'The home ThreeCards “Control without drag” card links here.',
      ],
    },
    {
      type: 'visual',
      src: PLACEHOLDER_HERO,
      alt: 'Placeholder visual for Elevate Consulting case study.',
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
      'Placeholder testimonial for Elevate Consulting — replace with approved quote.',
    author: {
      name: 'Placeholder Name',
      handle: 'Principal at Elevate Consulting',
      date: 'March 1, 2026',
      avatarSrc: PLACEHOLDER_HERO,
    },
  },
  tableOfContents: ['Overview', 'Next steps'],
  catalogCard: {
    summary:
      'Placeholder: Elevate Consulting and operational control with Twenty (summary TBD).',
    date: 'Mar 1, 2026',
  },
};
