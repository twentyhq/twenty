import { NextRequest } from 'next/server';

import { proxy } from '@/proxy';

const SITE_ORIGIN = 'https://example.test';

type Cookies = Record<string, string>;
type Headers = Record<string, string>;

const buildRequest = (
  pathname: string,
  { cookies = {}, headers = {} }: { cookies?: Cookies; headers?: Headers } = {},
): NextRequest => {
  const url = new URL(pathname, SITE_ORIGIN);
  const cookieHeader = Object.entries(cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
  const allHeaders = new Headers(headers);
  if (cookieHeader.length > 0) {
    allHeaders.set('cookie', cookieHeader);
  }
  return new NextRequest(url, { headers: allHeaders });
};

const getSetCookie = (response: Response): string | null =>
  response.headers.get('set-cookie');

describe('proxy: locale routing', () => {
  describe('canonicalisation of explicit prefixes', () => {
    it('301s /en/foo to /foo so the source locale never appears in URLs', () => {
      const response = proxy(buildRequest('/en/pricing'));

      expect(response.status).toBe(301);
      expect(response.headers.get('location')).toBe(`${SITE_ORIGIN}/pricing`);
    });

    it('301s the bare /en root to /', () => {
      const response = proxy(buildRequest('/en'));

      expect(response.status).toBe(301);
      expect(response.headers.get('location')).toBe(`${SITE_ORIGIN}/`);
    });

    it('preserves the query string on /en canonicalisation', () => {
      const response = proxy(buildRequest('/en/pricing?utm_source=newsletter'));

      expect(response.status).toBe(301);
      expect(response.headers.get('location')).toBe(
        `${SITE_ORIGIN}/pricing?utm_source=newsletter`,
      );
    });

    it('308s an unsupported but recognised locale prefix down to the canonical path', () => {
      const response = proxy(buildRequest('/de-DE/pricing'));

      expect(response.status).toBe(308);
      expect(response.headers.get('location')).toBe(`${SITE_ORIGIN}/pricing`);
    });

    it('308s the legacy fr-FR URL form to bare path (the public segment is /fr now)', () => {
      const response = proxy(buildRequest('/fr-FR/pricing'));

      expect(response.status).toBe(308);
      expect(response.headers.get('location')).toBe(`${SITE_ORIGIN}/pricing`);
    });
  });

  describe('canonical published-locale segments render directly', () => {
    it('renders /fr/foo without any redirect or rewrite', () => {
      const response = proxy(buildRequest('/fr/pricing'));

      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
      expect(response.headers.get('x-middleware-rewrite')).toBeNull();
    });

    it('does not write a NEXT_LOCALE cookie on locale-prefixed visits', () => {
      const response = proxy(buildRequest('/fr/pricing'));

      expect(getSetCookie(response)).toBeNull();
    });
  });

  describe('bare URLs always render the source locale', () => {
    it('rewrites /pricing to the internal /en/pricing for anonymous visitors', () => {
      const response = proxy(buildRequest('/pricing'));

      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-rewrite')).toBe(
        `${SITE_ORIGIN}/en/pricing`,
      );
    });

    it('ignores Accept-Language entirely — French browsers still see English at /pricing', () => {
      const response = proxy(
        buildRequest('/pricing', {
          headers: { 'accept-language': 'fr-FR,fr;q=0.9' },
        }),
      );

      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-rewrite')).toBe(
        `${SITE_ORIGIN}/en/pricing`,
      );
      expect(response.headers.get('location')).toBeNull();
    });

    it('ignores stored NEXT_LOCALE cookie — bare URLs are never cookie-redirected', () => {
      const response = proxy(
        buildRequest('/pricing', { cookies: { NEXT_LOCALE: 'fr-FR' } }),
      );

      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-rewrite')).toBe(
        `${SITE_ORIGIN}/en/pricing`,
      );
      expect(response.headers.get('location')).toBeNull();
    });

    it('rewrites the bare root / to the internal /en path', () => {
      const response = proxy(buildRequest('/'));

      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-rewrite')).toBe(
        `${SITE_ORIGIN}/en`,
      );
    });

    it('preserves query strings when rewriting bare URLs', () => {
      const response = proxy(buildRequest('/pricing?utm_source=newsletter'));

      expect(response.headers.get('x-middleware-rewrite')).toBe(
        `${SITE_ORIGIN}/en/pricing?utm_source=newsletter`,
      );
    });
  });
});
