import { type MessageDescriptor } from '@lingui/core';

import { type ClientLogoKey } from './client-logo-config';

export type CaseStudyKpi = {
  value: MessageDescriptor;
  label: MessageDescriptor;
};

export type CaseStudyQuote = {
  text: MessageDescriptor;
  author: string;
  role: MessageDescriptor;
};

// The card-facing shape of a customer story. The full /customers/<slug> story
// (sections, table of contents) extends this in the detail-page phase; the
// catalog grid needs only these fields.
export type CaseStudyCatalogEntry = {
  slug: string;
  industry: MessageDescriptor;
  title: MessageDescriptor;
  summary: MessageDescriptor;
  date: MessageDescriptor;
  readingTime: string;
  author: string;
  authorRole: MessageDescriptor;
  authorAvatarSrc?: string;
  clientIcon: ClientLogoKey;
  coverImageSrc: string;
  kpis: readonly CaseStudyKpi[];
  quote?: CaseStudyQuote;
};

export type CaseStudyStorySection = {
  eyebrow: MessageDescriptor;
  heading: MessageDescriptor;
  paragraphs: readonly MessageDescriptor[];
  callout?: CaseStudyQuote;
};

export type CaseStudyStory = {
  meta: { title: MessageDescriptor; description: MessageDescriptor };
  heroTitle: MessageDescriptor;
  sections: readonly CaseStudyStorySection[];
  tableOfContents: readonly MessageDescriptor[];
};
