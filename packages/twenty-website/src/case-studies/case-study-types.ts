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

// The card-facing shape of a customer story; the /customers/<slug> detail page
// pairs it with the CaseStudyStory keyed by the same slug.
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
