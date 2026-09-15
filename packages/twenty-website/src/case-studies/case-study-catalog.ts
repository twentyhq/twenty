import { msg } from '@lingui/core/macro';

import { type CaseStudyCatalogEntry } from './case-study-types';

// The customer stories, in catalog order. The grid features the first and last
// as large cards; the rest are the default two-column cards.
export const CASE_STUDY_CATALOG: readonly CaseStudyCatalogEntry[] = [
  {
    slug: '9dots',
    industry: msg`Real Estate`,
    title: msg`A real estate agency on WhatsApp built a CRM around it`,
    summary: msg`Nine Dots put Twenty at the center of Homeseller's stack with APIs, automation, and AI on top of WhatsApp-heavy operations.`,
    date: msg`Jul 2025`,
    readingTime: '9 min',
    author: 'Mike Babiy & Azmat Parveen',
    authorRole: msg`Founder, Nine Dots Ventures`,
    authorAvatarSrc: '/images/customers/case-studies/authors/mike-babiy.webp',
    clientIcon: 'nine-dots',
    coverImageSrc: '/images/customers/case-studies/nine-dots.webp',
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
  },
  {
    slug: 'alternative-partners',
    industry: msg`Consulting`,
    title: msg`From Salesforce to self-hosted Twenty`,
    summary: msg`Alternative Partners replaced Salesforce with self-hosted Twenty, using agentic AI to compress migration work.`,
    date: msg`2025`,
    readingTime: '7 min',
    author: 'Benjamin Reynolds',
    authorRole: msg`Principal and Founder, Alternative Partners`,
    authorAvatarSrc:
      '/images/customers/case-studies/authors/benjamin-reynolds.webp',
    clientIcon: 'alternative-partners',
    coverImageSrc: '/images/customers/case-studies/alternative-partners.webp',
    kpis: [
      { value: msg`AI-assisted`, label: msg`Salesforce migration` },
      { value: msg`Self-hosted`, label: msg`Full ownership` },
    ],
  },
  {
    slug: 'netzero',
    industry: msg`Agribusiness`,
    title: msg`A CRM that grows with you`,
    summary: msg`NetZero uses Twenty as a modular CRM across product lines and countries, with a roadmap into AI-assisted workflows.`,
    date: msg`2025`,
    readingTime: '8 min',
    author: 'Olivier Reinaud',
    authorRole: msg`Co-founder, NetZero`,
    authorAvatarSrc:
      '/images/customers/case-studies/authors/olivier-reinaud.webp',
    clientIcon: 'netzero',
    coverImageSrc: '/images/customers/case-studies/netzero.webp',
    kpis: [
      { value: msg`3 product lines`, label: msg`On a single CRM` },
      { value: msg`No-code`, label: msg`Customizations` },
    ],
  },
  {
    slug: 'act-education',
    industry: msg`Education`,
    title: msg`A CRM they actually own`,
    summary: msg`AC&T and Flycoder moved from a dead vendor export to self-hosted Twenty, with over 90% lower CRM cost and full control.`,
    date: msg`2025`,
    readingTime: '7 min',
    author: 'Joseph Chiang',
    authorRole: msg`CRM Engineer, AC&T Education Migration`,
    authorAvatarSrc:
      '/images/customers/case-studies/authors/joseph-chiang.webp',
    clientIcon: 'act-education',
    coverImageSrc: '/images/customers/case-studies/act-education.webp',
    kpis: [{ value: msg`90%+`, label: msg`Lower CRM cost` }],
  },
  {
    slug: 'w3villa',
    industry: msg`EdTech`,
    title: msg`When your CRM is the product`,
    summary: msg`W3villa shipped W3Grads on Twenty for AI interviews, scoring, and institution-scale workflows without rebuilding CRM plumbing.`,
    date: msg`2025`,
    readingTime: '8 min',
    author: 'Amrendra Pratap Singh',
    authorRole: msg`VP of Engineering, W3villa Technologies`,
    authorAvatarSrc:
      '/images/customers/case-studies/authors/amrendra-singh.webp',
    clientIcon: 'w3villa',
    coverImageSrc: '/images/customers/case-studies/w3villa.webp',
    kpis: [{ value: msg`Zero`, label: msg`Manual work at core` }],
  },
  {
    slug: 'elevate-consulting',
    industry: msg`Management Consulting`,
    title: msg`Twenty as the API backbone of a go-to-market stack`,
    summary: msg`Elevate Consulting uses Twenty as the API backbone connecting billing, Teams, resourcing, and a custom front end around client and opportunity data.`,
    date: msg`Jun 2025`,
    readingTime: '8 min',
    author: 'Justin Beadle',
    authorRole: msg`Director of Digital and Information, Elevate Consulting`,
    clientIcon: 'elevate-consulting',
    coverImageSrc: '/images/customers/case-studies/elevate-consulting.webp',
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
  },
];
