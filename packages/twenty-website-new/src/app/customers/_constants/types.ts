import type { HeadingType } from '@/design-system/components/Heading/types/Heading';

export type CaseStudyTextBlock = {
  type: 'text';
  eyebrow?: string;
  heading: HeadingType[];
  paragraphs: string[];
  callout?: string;
};

export type CaseStudyVisualBlock = {
  type: 'visual';
  src: string;
  alt: string;
};

export type CaseStudyContentBlock = CaseStudyTextBlock | CaseStudyVisualBlock;

export type CaseStudyKpi = {
  value: string;
  label: string;
};

export type CaseStudyQuote = {
  text: string;
  author: string;
  role: string;
};

export type CaseStudyData = {
  meta: { title: string; description: string };
  hero: {
    readingTime: string;
    title: HeadingType[];
    author: string;
    authorAvatarSrc?: string;
    clientIcon: string;
    heroImageSrc: string;
    industry?: string;
    authorRole?: string;
    kpis?: CaseStudyKpi[];
    quote?: CaseStudyQuote;
  };
  sections: CaseStudyContentBlock[];
  tableOfContents: string[];
  catalogCard: {
    summary: string;
    date: string;
    coverImageSrc?: string;
  };
};

export type CaseStudyCatalogEntry = {
  href: string;
  industry: string;
  kpis: CaseStudyKpi[];
  authorRole: string;
  quote?: CaseStudyQuote;
  hero: CaseStudyData['hero'];
  catalogCard: CaseStudyData['catalogCard'];
};
