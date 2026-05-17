import type { MessageDescriptor } from '@lingui/core';
import type { ReactNode } from 'react';

export type CaseStudyTextBlock = {
  type: 'text';
  eyebrow?: MessageDescriptor;
  heading: ReactNode;
  paragraphs: MessageDescriptor[];
  callout?: string;
};

export type CaseStudyVisualBlock = {
  type: 'visual';
  src: string;
  alt: string;
};

export type CaseStudyContentBlock = CaseStudyTextBlock | CaseStudyVisualBlock;

export type CaseStudyKpi = {
  value: MessageDescriptor;
  label: MessageDescriptor;
};

export type CaseStudyQuote = {
  text: MessageDescriptor;
  author: string;
  role: MessageDescriptor;
};

export type CaseStudyData = {
  meta: { title: MessageDescriptor; description: MessageDescriptor };
  hero: {
    readingTime: string;
    title: ReactNode;
    author: string;
    authorAvatarSrc?: string;
    clientIcon: string;
    heroImageSrc: string;
    industry?: MessageDescriptor;
    authorRole?: MessageDescriptor;
    kpis?: CaseStudyKpi[];
    quote?: CaseStudyQuote;
  };
  sections: CaseStudyContentBlock[];
  tableOfContents: MessageDescriptor[];
  catalogCard: {
    summary: MessageDescriptor;
    date: MessageDescriptor;
    coverImageSrc?: string;
  };
};

export type CaseStudyCatalogEntry = {
  href: string;
  industry: MessageDescriptor;
  kpis: CaseStudyKpi[];
  authorRole: MessageDescriptor;
  quote?: CaseStudyQuote;
  hero: {
    readingTime: string;
    title: MessageDescriptor;
    author: string;
    authorAvatarSrc?: string;
    clientIcon: string;
    heroImageSrc: string;
  };
  catalogCard: CaseStudyData['catalogCard'];
};
