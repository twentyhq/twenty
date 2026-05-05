import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

import { APP_LOCALE_BY_LANGUAGE, APP_LOCALE_BY_RAW } from './app-locale-set';

export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

type AcceptLanguageEntry = { tag: string; quality: number };

const parseAcceptLanguage = (header: string): AcceptLanguageEntry[] =>
  header
    .split(',')
    .flatMap((part): AcceptLanguageEntry[] => {
      const [rawTag, ...params] = part.trim().split(';');
      if (rawTag === undefined || rawTag.length === 0) return [];
      const qParam = params.find((p) => p.trim().startsWith('q='))?.trim();
      const parsedQuality =
        qParam !== undefined ? Number.parseFloat(qParam.slice(2)) : 1;
      return [
        {
          tag: rawTag.trim(),
          quality: Number.isFinite(parsedQuality) ? parsedQuality : 0,
        },
      ];
    })
    .sort((a, b) => b.quality - a.quality);

const matchTag = (tag: string): AppLocale | undefined => {
  const exact = APP_LOCALE_BY_RAW.get(tag);
  if (exact !== undefined) return exact;

  const [languageSubtag] = tag.split('-');
  if (languageSubtag === undefined) return undefined;
  return APP_LOCALE_BY_LANGUAGE.get(languageSubtag.toLowerCase());
};

type DetectLocaleInput = {
  cookieValue?: string;
  acceptLanguageHeader?: string;
};

export const detectLocale = ({
  cookieValue,
  acceptLanguageHeader,
}: DetectLocaleInput): AppLocale => {
  if (cookieValue !== undefined) {
    const fromCookie = APP_LOCALE_BY_RAW.get(cookieValue);
    if (fromCookie !== undefined) return fromCookie;
  }

  if (acceptLanguageHeader !== undefined && acceptLanguageHeader.length > 0) {
    for (const { tag, quality } of parseAcceptLanguage(acceptLanguageHeader)) {
      if (quality <= 0) continue;
      const match = matchTag(tag);
      if (match !== undefined) return match;
    }
  }

  return SOURCE_LOCALE;
};
