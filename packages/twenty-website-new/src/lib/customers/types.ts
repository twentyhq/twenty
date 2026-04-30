import type { HeadingType } from '@/design-system/components/Heading';
import type { LocalizableText } from '@/lib/i18n/localizable-text';

export type CaseStudyTextBlock = {
  type: 'text';
  eyebrow?: LocalizableText;
  heading: HeadingType[];
  paragraphs: LocalizableText[];
  callout?: string;
};

export type CaseStudyVisualBlock = {
  type: 'visual';
  src: string;
  alt: string;
};

export type CaseStudyContentBlock = CaseStudyTextBlock | CaseStudyVisualBlock;

export type CaseStudyKpi = {
  value: LocalizableText;
  label: LocalizableText;
};

export type CaseStudyQuote = {
  text: LocalizableText;
  author: string;
  role: LocalizableText;
};

export type CaseStudyData = {
  meta: { title: LocalizableText; description: LocalizableText };
  hero: {
    readingTime: string;
    title: HeadingType[];
    author: string;
    authorAvatarSrc?: string;
    clientIcon: string;
    heroImageSrc: string;
    industry?: LocalizableText;
    authorRole?: LocalizableText;
    kpis?: CaseStudyKpi[];
    quote?: CaseStudyQuote;
  };
  sections: CaseStudyContentBlock[];
  tableOfContents: string[];
  catalogCard: {
    summary: LocalizableText;
    date: LocalizableText;
    coverImageSrc?: string;
  };
};

export type CaseStudyCatalogEntry = {
  href: string;
  industry: LocalizableText;
  kpis: CaseStudyKpi[];
  authorRole: LocalizableText;
  quote?: CaseStudyQuote;
  hero: CaseStudyData['hero'];
  catalogCard: CaseStudyData['catalogCard'];
};
