import { NextResponse, type NextRequest } from 'next/server';
import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

import {
  APP_LOCALE_BY_RAW,
  KNOWN_PUBLIC_APP_LOCALE_BY_RAW,
} from '@/lib/i18n/app-locale-set';
import { LOCALE_COOKIE_NAME, detectLocale } from '@/lib/i18n/detect-locale';

const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const setLocaleCookie = (response: NextResponse, locale: AppLocale) => {
  response.cookies.set({
    name: LOCALE_COOKIE_NAME,
    value: locale,
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: 'lax',
  });
};

export const proxy = (request: NextRequest) => {
  const { pathname, search } = request.nextUrl;

  const firstSlash = pathname.indexOf('/', 1);
  const firstSegment =
    firstSlash === -1 ? pathname.slice(1) : pathname.slice(1, firstSlash);
  const localeFromPath = APP_LOCALE_BY_RAW.get(firstSegment);
  const knownLocaleFromPath = KNOWN_PUBLIC_APP_LOCALE_BY_RAW.get(firstSegment);

  if (localeFromPath === SOURCE_LOCALE) {
    const canonicalPath = firstSlash === -1 ? '/' : pathname.slice(firstSlash);
    const target = request.nextUrl.clone();
    target.pathname = canonicalPath;
    target.search = search;
    return NextResponse.redirect(target, 301);
  }

  if (localeFromPath !== undefined) {
    const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
    if (cookieLocale === localeFromPath) {
      return NextResponse.next();
    }
    const response = NextResponse.next();
    setLocaleCookie(response, localeFromPath);
    return response;
  }

  if (knownLocaleFromPath !== undefined) {
    const canonicalPath = firstSlash === -1 ? '/' : pathname.slice(firstSlash);
    const target = request.nextUrl.clone();
    target.pathname = canonicalPath;
    target.search = search;
    return NextResponse.redirect(target, 308);
  }

  const detected = detectLocale({
    cookieValue: request.cookies.get(LOCALE_COOKIE_NAME)?.value,
    acceptLanguageHeader: request.headers.get('accept-language') ?? undefined,
  });

  if (detected === SOURCE_LOCALE) {
    const target = request.nextUrl.clone();
    target.pathname = `/${SOURCE_LOCALE}${pathname === '/' ? '' : pathname}`;
    const response = NextResponse.rewrite(target);
    const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
    if (cookieLocale !== SOURCE_LOCALE) {
      setLocaleCookie(response, SOURCE_LOCALE);
    }
    return response;
  }

  const target = request.nextUrl.clone();
  target.pathname = `/${detected}${pathname === '/' ? '' : pathname}`;
  target.search = search;
  return NextResponse.redirect(target, 308);
};

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|illustrations|lottie|fonts|.*\\..*).*)',
  ],
};
