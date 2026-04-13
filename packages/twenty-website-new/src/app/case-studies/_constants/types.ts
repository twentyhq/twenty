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

export type CaseStudyData = {
  meta: { title: string; description: string };
  hero: {
    readingTime: string;
    title: HeadingType[];
    author: string;
    clientIcon: string;
    heroImageSrc: string;
  };
  sections: CaseStudyContentBlock[];
  tableOfContents: string[];
  catalogCard: {
    summary: string;
    date: string;
  };
};

export type CaseStudyCatalogEntry = {
  href: string;
  hero: CaseStudyData['hero'];
  catalogCard: CaseStudyData['catalogCard'];
};
