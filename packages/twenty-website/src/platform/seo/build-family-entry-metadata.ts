import { type Metadata } from 'next';
import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

import {
  type WebsiteRouteFamily,
  type WebsiteRouteFamilyEntry,
} from '@/platform/routing/website-route';

import { buildPageMetadata } from './build-page-metadata';

// Dynamic family pages (articles, releases) derive their SEO surface from
// the family registry plus the enumerated entry — the same single-source
// rule as static routes.
export const buildFamilyEntryMetadata = (
  family: WebsiteRouteFamily,
  entry: WebsiteRouteFamilyEntry,
  locale: AppLocale,
): Metadata =>
  buildPageMetadata({
    description: entry.description,
    indexed: family.indexed,
    locale,
    locales: family.localeMode === 'source' ? [SOURCE_LOCALE] : undefined,
    ogImagePath: entry.ogImagePath,
    path: `${family.basePath}/${entry.slug}`,
    title: entry.title,
  });
