import { theme } from '@/theme';
import type { CaseStudyCatalogEntry } from './types';

const PLACEHOLDER_HERO = '/images/shared/people/avatars/katherine-adams.jpg';

export const CASE_STUDY_HALFTONE_PALETTE: readonly {
  dashColor: string;
  hoverDashColor: string;
}[] = [
  {
    dashColor: theme.colors.accent.blue[100],
    hoverDashColor: theme.colors.accent.blue[70],
  },
  {
    dashColor: theme.colors.accent.pink[100],
    hoverDashColor: theme.colors.accent.pink[70],
  },
  {
    dashColor: theme.colors.accent.yellow[100],
    hoverDashColor: theme.colors.accent.yellow[70],
  },
  {
    dashColor: theme.colors.accent.green[100],
    hoverDashColor: theme.colors.accent.green[70],
  },
];

export function getCaseStudyPalette(href: string) {
  const index = CASE_STUDY_CATALOG_ENTRIES.findIndex(
    (entry) => entry.href === href,
  );
  const safeIndex = index >= 0 ? index : 0;
  return CASE_STUDY_HALFTONE_PALETTE[
    safeIndex % CASE_STUDY_HALFTONE_PALETTE.length
  ];
}

export const CASE_STUDY_CATALOG_ENTRIES: CaseStudyCatalogEntry[] = [
  {
    href: '/customers/9dots',
    industry: 'Real Estate',
    authorRole: 'Founder, Nine Dots Ventures',
    kpis: [
      { value: '150 hrs', label: 'Saved / month' },
      { value: '2,000+', label: 'Daily messages' },
      { value: 'Q1 2026', label: 'Record quarter' },
    ],
    quote: {
      text: 'Twenty lets us build a CRM around the business and not the business around the CRM.',
      author: 'Mike Babiy',
      role: 'Founder, Nine Dots Ventures',
    },
    hero: {
      readingTime: '9 min',
      title: [
        { text: 'A real estate agency on WhatsApp ', fontFamily: 'serif' },
        { text: 'built a CRM around it', fontFamily: 'sans' },
      ],
      author: 'Mike Babiy & Azmat Parveen',
      authorAvatarSrc: '/images/partner/testimonials/mike-babiy.png',
      clientIcon: 'nine-dots',
      heroImageSrc: PLACEHOLDER_HERO,
    },
    catalogCard: {
      summary:
        "Nine Dots put Twenty at the center of Homeseller's stack with APIs, automation, and AI on top of WhatsApp-heavy operations.",
      date: 'Jul 2025',
      coverImageSrc:
        'https://images.unsplash.com/photo-1733244766159-f58f4184fd38?w=1600&q=80',
    },
  },
  {
    href: '/customers/alternative-partners',
    industry: 'Consulting',
    authorRole: 'Principal and Founder, Alternative Partners',
    kpis: [
      { value: 'AI-assisted', label: 'Salesforce migration' },
      { value: 'Self-hosted', label: 'Full ownership' },
    ],
    hero: {
      readingTime: '7 min',
      title: [
        { text: 'From Salesforce to ', fontFamily: 'serif' },
        { text: 'self-hosted Twenty', fontFamily: 'sans' },
      ],
      author: 'Benjamin Reynolds',
      authorAvatarSrc: '/images/partner/testimonials/benjamin-reynolds.webp',
      clientIcon: 'alternative-partners',
      heroImageSrc: PLACEHOLDER_HERO,
    },
    catalogCard: {
      summary:
        'Alternative Partners replaced Salesforce with self-hosted Twenty, using agentic AI to compress migration work.',
      date: '2025',
      coverImageSrc:
        'https://images.unsplash.com/photo-1702047149248-a6049168d2a8?w=1600&q=80',
    },
  },
  {
    href: '/customers/netzero',
    industry: 'Agribusiness',
    authorRole: 'Co-founder, NetZero',
    kpis: [
      { value: '3 product lines', label: 'On a single CRM' },
      { value: 'No-code', label: 'Customizations' },
    ],
    hero: {
      readingTime: '8 min',
      title: [
        { text: 'A CRM that ', fontFamily: 'serif' },
        { text: 'grows with you', fontFamily: 'sans' },
      ],
      author: 'Olivier Reinaud',
      authorAvatarSrc: '/images/partner/testimonials/olivier-reinaud.jpg',
      clientIcon: 'netzero',
      heroImageSrc: PLACEHOLDER_HERO,
    },
    catalogCard: {
      summary:
        'NetZero uses Twenty as a modular CRM across product lines and countries, with a roadmap into AI-assisted workflows.',
      date: '2025',
      coverImageSrc:
        'https://images.unsplash.com/photo-1510524474345-1c4bac68d1d0?w=1600&q=80',
    },
  },
  {
    href: '/customers/act-education',
    industry: 'Education',
    authorRole: 'CRM Engineer, AC&T Education Migration',
    kpis: [{ value: '90%+', label: 'Lower CRM cost' }],
    hero: {
      readingTime: '7 min',
      title: [
        { text: 'A CRM they ', fontFamily: 'serif' },
        { text: 'actually own', fontFamily: 'sans' },
      ],
      author: 'Joseph Chiang',
      authorAvatarSrc: '/images/partner/testimonials/joseph-chiang.jpg',
      clientIcon: 'act-education',
      heroImageSrc: PLACEHOLDER_HERO,
    },
    catalogCard: {
      summary:
        'AC&T and Flycoder moved from a dead vendor export to self-hosted Twenty, with over 90% lower CRM cost and full control.',
      date: '2025',
      coverImageSrc:
        'https://images.unsplash.com/photo-1687600154329-150952c73169?w=1600&q=80',
    },
  },
  {
    href: '/customers/w3villa',
    industry: 'EdTech',
    authorRole: 'VP of Engineering, W3villa Technologies',
    kpis: [{ value: 'Zero', label: 'Manual work at core' }],
    hero: {
      readingTime: '8 min',
      title: [
        { text: 'When your CRM ', fontFamily: 'serif' },
        { text: 'is the product', fontFamily: 'sans' },
      ],
      author: 'Amrendra Pratap Singh',
      authorAvatarSrc: '/images/partner/testimonials/amrendra-singh.webp',
      clientIcon: 'w3villa',
      heroImageSrc: PLACEHOLDER_HERO,
    },
    catalogCard: {
      summary:
        'W3villa shipped W3Grads on Twenty for AI interviews, scoring, and institution-scale workflows without rebuilding CRM plumbing.',
      date: '2025',
      coverImageSrc:
        'https://images.unsplash.com/photo-1756830231350-3b501f63c5c1?w=1600&q=80',
    },
  },
  {
    href: '/customers/elevate-consulting',
    industry: 'Management Consulting',
    authorRole: 'Director of Digital and Information, Elevate Consulting',
    kpis: [
      { value: '1 click', label: 'Proposal automation' },
      { value: '4 tools', label: 'Connected via API' },
      { value: 'API-first', label: 'Tool integration' },
    ],
    quote: {
      text: 'It is just such a nicer experience than dealing with a Salesforce or a HubSpot. My mission has been to get every tool API-accessible, so everything talks to each other.',
      author: 'Justin Beadle',
      role: 'Director of Digital and Information, Elevate Consulting',
    },
    hero: {
      readingTime: '8 min',
      title: [
        { text: 'Twenty as the API backbone ', fontFamily: 'serif' },
        { text: 'of a go-to-market stack', fontFamily: 'sans' },
      ],
      author: 'Justin Beadle',
      clientIcon: 'elevate-consulting',
      heroImageSrc: PLACEHOLDER_HERO,
    },
    catalogCard: {
      summary:
        'Elevate Consulting uses Twenty as the API backbone connecting billing, Teams, resourcing, and a custom front end around client and opportunity data.',
      date: 'Jun 2025',
      coverImageSrc:
        'https://images.unsplash.com/photo-1758873269035-aae0e1fd3422?w=1600&q=80',
    },
  },
];
