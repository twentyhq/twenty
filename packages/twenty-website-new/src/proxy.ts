import { NextResponse, type NextRequest } from 'next/server';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { KNOWN_PUBLIC_APP_LOCALE_BY_RAW } from '@/lib/i18n/app-locale-set';
import { LOCALE_BY_URL_SEGMENT } from '@/lib/i18n/website-locale-segments';

export const proxy = (request: NextRequest) => {
  const { pathname, search } = request.nextUrl;

  const firstSlash = pathname.indexOf('/', 1);
  const firstSegment =
    firstSlash === -1 ? pathname.slice(1) : pathname.slice(1, firstSlash);
  const tail = firstSlash === -1 ? '/' : pathname.slice(firstSlash);

  const localeFromSegment = LOCALE_BY_URL_SEGMENT.get(firstSegment);

  if (localeFromSegment === SOURCE_LOCALE) {
    const target = request.nextUrl.clone();
    target.pathname = tail;
    target.search = search;
    return NextResponse.redirect(target, 301);
  }

  if (localeFromSegment !== undefined) {
    return NextResponse.next();
  }

  if (KNOWN_PUBLIC_APP_LOCALE_BY_RAW.has(firstSegment)) {
    const target = request.nextUrl.clone();
    target.pathname = tail;
    target.search = search;
    return NextResponse.redirect(target, 308);
  }

  const target = request.nextUrl.clone();
  target.pathname = `/${SOURCE_LOCALE}${pathname === '/' ? '' : pathname}`;
  target.search = search;
  return NextResponse.rewrite(target);
};

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|illustrations|lottie|fonts|.*\\..*).*)',
  ],
};
