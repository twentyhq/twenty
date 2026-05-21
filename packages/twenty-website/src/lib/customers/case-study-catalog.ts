import { msg } from '@lingui/core/macro';
import type { CaseStudyCatalogEntry } from '@/lib/customers/types';
import { theme } from '@/theme';

const CASE_STUDY_IMAGE_BASE = '/images/customers/case-studies';

export const CASE_STUDY_HERO_IMAGES = {
  nineDots: `${CASE_STUDY_IMAGE_BASE}/nine-dots.webp`,
  alternativePartners: `${CASE_STUDY_IMAGE_BASE}/alternative-partners.webp`,
  netzero: `${CASE_STUDY_IMAGE_BASE}/netzero.webp`,
  actEducation: `${CASE_STUDY_IMAGE_BASE}/act-education.webp`,
  w3villa: `${CASE_STUDY_IMAGE_BASE}/w3villa.webp`,
  elevateConsulting: `${CASE_STUDY_IMAGE_BASE}/elevate-consulting.webp`,
} as const;

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
    industry: msg`Real Estate`,
    authorRole: msg`Founder, Nine Dots Ventures`,
    kpis: [
      { value: msg`150 hrs`, label: msg`Saved / month` },
      { value: msg`2,000+`, label: msg`Daily messages` },
      { value: msg`Q1 2026`, label: msg`Record quarter` },
    ],
    quote: {
      text: msg`Twenty lets us build a CRM around the business and not the business around the CRM.`,
      author: 'Mike Babiy',
      role: msg`Founder, Nine Dots Ventures`,
    },
    hero: {
      readingTime: '9 min',
      title: msg`A real estate agency on WhatsApp built a CRM around it`,
      author: 'Mike Babiy & Azmat Parveen',
      authorAvatarSrc: '/images/partner/testimonials/mike-babiy.webp',
      clientIcon: 'nine-dots',
      heroImageSrc: CASE_STUDY_HERO_IMAGES.nineDots,
    },
    catalogCard: {
      summary: msg`Nine Dots put Twenty at the center of Homeseller's stack with APIs, automation, and AI on top of WhatsApp-heavy operations.`,
      date: msg`Jul 2025`,
      coverImageSrc: CASE_STUDY_HERO_IMAGES.nineDots,
    },
  },
  {
    href: '/customers/alternative-partners',
    industry: msg`Consulting`,
    authorRole: msg`Principal and Founder, Alternative Partners`,
    kpis: [
      { value: msg`AI-assisted`, label: msg`Salesforce migration` },
      { value: msg`Self-hosted`, label: msg`Full ownership` },
    ],
    hero: {
      readingTime: '7 min',
      title: msg`From Salesforce to self-hosted Twenty`,
      author: 'Benjamin Reynolds',
      authorAvatarSrc: '/images/partner/testimonials/benjamin-reynolds.webp',
      clientIcon: 'alternative-partners',
      heroImageSrc: CASE_STUDY_HERO_IMAGES.alternativePartners,
    },
    catalogCard: {
      summary: msg`Alternative Partners replaced Salesforce with self-hosted Twenty, using agentic AI to compress migration work.`,
      date: msg`2025`,
      coverImageSrc: CASE_STUDY_HERO_IMAGES.alternativePartners,
    },
  },
  {
    href: '/customers/netzero',
    industry: msg`Agribusiness`,
    authorRole: msg`Co-founder, NetZero`,
    kpis: [
      { value: msg`3 product lines`, label: msg`On a single CRM` },
      { value: msg`No-code`, label: msg`Customizations` },
    ],
    hero: {
      readingTime: '8 min',
      title: msg`A CRM that grows with you`,
      author: 'Olivier Reinaud',
      authorAvatarSrc: '/images/partner/testimonials/olivier-reinaud.webp',
      clientIcon: 'netzero',
      heroImageSrc: CASE_STUDY_HERO_IMAGES.netzero,
    },
    catalogCard: {
      summary: msg`NetZero uses Twenty as a modular CRM across product lines and countries, with a roadmap into AI-assisted workflows.`,
      date: msg`2025`,
      coverImageSrc: CASE_STUDY_HERO_IMAGES.netzero,
    },
  },
  {
    href: '/customers/act-education',
    industry: msg`Education`,
    authorRole: msg`CRM Engineer, AC&T Education Migration`,
    kpis: [{ value: msg`90%+`, label: msg`Lower CRM cost` }],
    hero: {
      readingTime: '7 min',
      title: msg`A CRM they actually own`,
      author: 'Joseph Chiang',
      authorAvatarSrc: '/images/partner/testimonials/joseph-chiang.webp',
      clientIcon: 'act-education',
      heroImageSrc: CASE_STUDY_HERO_IMAGES.actEducation,
    },
    catalogCard: {
      summary: msg`AC&T and Flycoder moved from a dead vendor export to self-hosted Twenty, with over 90% lower CRM cost and full control.`,
      date: msg`2025`,
      coverImageSrc: CASE_STUDY_HERO_IMAGES.actEducation,
    },
  },
  {
    href: '/customers/w3villa',
    industry: msg`EdTech`,
    authorRole: msg`VP of Engineering, W3villa Technologies`,
    kpis: [{ value: msg`Zero`, label: msg`Manual work at core` }],
    hero: {
      readingTime: '8 min',
      title: msg`When your CRM is the product`,
      author: 'Amrendra Pratap Singh',
      authorAvatarSrc: '/images/partner/testimonials/amrendra-singh.webp',
      clientIcon: 'w3villa',
      heroImageSrc: CASE_STUDY_HERO_IMAGES.w3villa,
    },
    catalogCard: {
      summary: msg`W3villa shipped W3Grads on Twenty for AI interviews, scoring, and institution-scale workflows without rebuilding CRM plumbing.`,
      date: msg`2025`,
      coverImageSrc: CASE_STUDY_HERO_IMAGES.w3villa,
    },
  },
  {
    href: '/customers/elevate-consulting',
    industry: msg`Management Consulting`,
    authorRole: msg`Director of Digital and Information, Elevate Consulting`,
    kpis: [
      { value: msg`1 click`, label: msg`Proposal automation` },
      { value: msg`4 tools`, label: msg`Connected via API` },
      { value: msg`API-first`, label: msg`Tool integration` },
    ],
    quote: {
      text: msg`It is just such a nicer experience than dealing with a Salesforce or a HubSpot. My mission has been to get every tool API-accessible, so everything talks to each other.`,
      author: 'Justin Beadle',
      role: msg`Director of Digital and Information, Elevate Consulting`,
    },
    hero: {
      readingTime: '8 min',
      title: msg`Twenty as the API backbone of a go-to-market stack`,
      author: 'Justin Beadle',
      clientIcon: 'elevate-consulting',
      heroImageSrc: CASE_STUDY_HERO_IMAGES.elevateConsulting,
    },
    catalogCard: {
      summary: msg`Elevate Consulting uses Twenty as the API backbone connecting billing, Teams, resourcing, and a custom front end around client and opportunity data.`,
      date: msg`Jun 2025`,
      coverImageSrc: CASE_STUDY_HERO_IMAGES.elevateConsulting,
    },
  },
];
