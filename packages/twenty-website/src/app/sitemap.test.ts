import { msg } from '@lingui/core/macro';

import { getIndexedWebsiteRoutes } from '@/platform/routing';
import {
  type WebsiteRoute,
  type WebsiteRouteFamily,
} from '@/platform/routing/website-route';
import { WEBSITE_ROUTE_FAMILY_LIST } from '@/platform/routing/website-route-family-list';

import sitemap from './sitemap';

jest.mock('@/platform/routing', () => ({ getIndexedWebsiteRoutes: jest.fn() }));
jest.mock('@/platform/routing/website-route-family-list', () => ({
  WEBSITE_ROUTE_FAMILY_LIST: [],
}));

const HOME_ROUTE: WebsiteRoute = {
  id: 'home',
  path: '/',
  changeFrequency: 'weekly',
  priority: 1,
  indexed: true,
  localeMode: 'source',
  title: msg`Home`,
  description: msg`Home`,
};

const okFamily: WebsiteRouteFamily = {
  id: 'customerStories',
  basePath: '/customers',
  changeFrequency: 'monthly',
  priority: 0.6,
  indexed: true,
  localeMode: 'source',
  enumerateEntries: async () => [
    { slug: 'acme', title: 'Acme', description: 'Acme story' },
  ],
};

const throwingFamily: WebsiteRouteFamily = {
  id: 'partnerProfiles',
  basePath: '/partners/profile',
  changeFrequency: 'weekly',
  priority: 0.5,
  indexed: true,
  localeMode: 'source',
  enumerateEntries: async () => {
    throw new Error('boom');
  },
};

const familyList = WEBSITE_ROUTE_FAMILY_LIST as WebsiteRouteFamily[];
const mockedIndexedRoutes = getIndexedWebsiteRoutes as jest.MockedFunction<
  typeof getIndexedWebsiteRoutes
>;

describe('sitemap', () => {
  beforeEach(() => {
    familyList.length = 0;
    mockedIndexedRoutes.mockReturnValue([HOME_ROUTE]);
  });

  afterEach(() => jest.clearAllMocks());

  it('isolates a throwing family so it cannot sink the sitemap', async () => {
    const errorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    familyList.push(throwingFamily, okFamily);

    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls).toContain('https://twenty.com');
    expect(urls).toContain('https://twenty.com/customers/acme');
    expect(urls.some((url) => url.includes('/partners/profile'))).toBe(false);
    expect(errorSpy).toHaveBeenCalledWith(
      '[sitemap] route family "partnerProfiles" failed:',
      expect.any(Error),
    );

    errorSpy.mockRestore();
  });
});
