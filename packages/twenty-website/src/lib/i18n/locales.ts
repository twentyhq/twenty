import type { MessageDescriptor } from '@lingui/core';
import { notFound } from 'next/navigation';
import {
  APP_LOCALES,
  SOURCE_LOCALE,
  type AppLocale,
} from 'twenty-shared/translations';

// Pure, catalog-free, isomorphic locale helpers. Safe to import from both
// server and client code (it never pulls in the compiled message catalogs).

// ---------------------------------------------------------------------------
// Source of truth
// ---------------------------------------------------------------------------
// Website localization is rolled out separately from the app (its own Crowdin
// project), expanding toward the full twenty-shared locale set over time. This
// list is THE source: URL segments, generateStaticParams, next.config
// rewrites, hreflang, and the sitemap all derive from it. To add a locale:
// append it here (+ a URL-segment override below if it needs one) and run
// lingui:compile — messages.ts then fails the build until its catalog exists.
export const WEBSITE_LOCALE_LIST = [
  SOURCE_LOCALE,
  APP_LOCALES['fr-FR'],
  APP_LOCALES['es-ES'],
] as const satisfies readonly AppLocale[];

const WEBSITE_LOCALE_SET: ReadonlySet<AppLocale> = new Set(WEBSITE_LOCALE_LIST);

export const isWebsiteLocale = (locale: AppLocale): boolean =>
  WEBSITE_LOCALE_SET.has(locale);

// ---------------------------------------------------------------------------
// URL segment mapping (locale code <-> path prefix)
// ---------------------------------------------------------------------------
// The source locale is served unprefixed; regional codes get a short segment.
const URL_SEGMENT_OVERRIDES: Partial<Record<AppLocale, string>> = {
  'fr-FR': 'fr',
  'es-ES': 'es',
};

export const localeToUrlSegment = (locale: AppLocale): string =>
  URL_SEGMENT_OVERRIDES[locale] ?? locale;

export const LOCALE_BY_URL_SEGMENT: ReadonlyMap<string, AppLocale> = new Map(
  WEBSITE_LOCALE_LIST.map((locale) => [localeToUrlSegment(locale), locale]),
);

// Resolves a route's `[locale]` URL segment to an AppLocale, or 404s. The only
// sanctioned way to turn a raw route param into a locale.
export const resolveLocaleParam = (raw: string): AppLocale => {
  const locale = LOCALE_BY_URL_SEGMENT.get(raw);
  if (locale === undefined) notFound();
  return locale;
};

// ---------------------------------------------------------------------------
// Href (de)localization — used by client navigation components
// ---------------------------------------------------------------------------
const findFirstSegmentEnd = (path: string): number => {
  for (let i = 1; i < path.length; i += 1) {
    const ch = path[i];
    if (ch === '/' || ch === '?' || ch === '#') return i;
  }
  return path.length;
};

const buildTailFromSegmentEnd = (path: string, segmentEnd: number): string => {
  const tail = path.slice(segmentEnd);
  if (tail.length === 0) return '/';
  if (tail.startsWith('?') || tail.startsWith('#')) return `/${tail}`;
  return tail;
};

const isLocalePrefixSegment = (segment: string): boolean =>
  LOCALE_BY_URL_SEGMENT.has(segment);

export const localizeHref = (locale: AppLocale, href: string): string => {
  if (!href.startsWith('/') || href.startsWith('//')) return href;

  const segmentEnd = findFirstSegmentEnd(href);
  const firstSegment = href.slice(1, segmentEnd);

  const unprefixed = isLocalePrefixSegment(firstSegment)
    ? buildTailFromSegmentEnd(href, segmentEnd)
    : href;

  if (locale === SOURCE_LOCALE || !isWebsiteLocale(locale)) {
    return unprefixed;
  }

  const segment = localeToUrlSegment(locale);
  return unprefixed === '/' ? `/${segment}` : `/${segment}${unprefixed}`;
};

export const stripLocale = (pathname: string): string => {
  if (!pathname.startsWith('/')) return pathname;

  const segmentEnd = findFirstSegmentEnd(pathname);
  const firstSegment = pathname.slice(1, segmentEnd);
  if (!isLocalePrefixSegment(firstSegment)) return pathname;

  return buildTailFromSegmentEnd(pathname, segmentEnd);
};

// ---------------------------------------------------------------------------
// Display names (for the locale switcher)
// ---------------------------------------------------------------------------
const languageCode = (locale: AppLocale): string => locale.split('-')[0];

const capitalizeFirstChar = (value: string): string =>
  value.length === 0
    ? value
    : value.charAt(0).toLocaleUpperCase() + value.slice(1);

export const getNativeLocaleName = (locale: AppLocale): string => {
  const display = new Intl.DisplayNames([locale], { type: 'language' });
  const name = display.of(languageCode(locale)) ?? locale;
  return capitalizeFirstChar(name);
};

export const getEnglishLocaleName = (locale: AppLocale): string => {
  const display = new Intl.DisplayNames(['en'], { type: 'language' });
  return display.of(languageCode(locale)) ?? locale;
};

// ---------------------------------------------------------------------------
// Lingui MessageDescriptor helper
// ---------------------------------------------------------------------------
export const getMessageDescriptorSource = (
  descriptor: MessageDescriptor,
): string => descriptor.message ?? descriptor.id;
