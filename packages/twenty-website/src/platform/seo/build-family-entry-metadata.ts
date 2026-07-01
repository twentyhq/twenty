import { type Metadata } from 'next';
import {
  DOCUMENTATION_DEFAULT_LANGUAGE,
  type DocumentationSupportedLanguage,
} from 'twenty-shared/constants';

import {
  type WebsiteRouteFamily,
  type WebsiteRouteFamilyEntry,
} from '@/platform/routing/website-route';

import { buildPageMetadata } from './build-page-metadata';

export const buildFamilyEntryMetadata = (
  family: WebsiteRouteFamily,
  entry: WebsiteRouteFamilyEntry,
  locale: DocumentationSupportedLanguage,
): Metadata =>
  buildPageMetadata({
    description: entry.description,
    indexed: family.indexed,
    locale,
    locales:
      family.localeMode === 'source'
        ? [DOCUMENTATION_DEFAULT_LANGUAGE]
        : undefined,
    ogImagePath: entry.ogImagePath,
    path: `${family.basePath}/${entry.slug}`,
    title: entry.title,
  });
