import { CASE_STUDY_CATALOG_ENTRIES } from '@/lib/customers';

import {
  WEBSITE_ROUTE_LIST,
  WEBSITE_ROUTES,
  getIndexedWebsiteRoutes,
  getRobotsDisallowedRoutePaths,
} from '..';

describe('website route registry', () => {
  it('keeps route ids and paths unique', () => {
    const routeIds = WEBSITE_ROUTE_LIST.map((route) => route.id);
    const routePaths = WEBSITE_ROUTE_LIST.map((route) => route.path);

    expect(new Set(routeIds).size).toBe(routeIds.length);
    expect(new Set(routePaths).size).toBe(routePaths.length);
  });

  it('registers every customer story from the catalog', () => {
    const routePaths = new Set(WEBSITE_ROUTE_LIST.map((route) => route.path));

    for (const entry of CASE_STUDY_CATALOG_ENTRIES) {
      expect(routePaths.has(entry.href)).toBe(true);
      expect(
        WEBSITE_ROUTES[`customer:${entry.href.slice('/customers/'.length)}`],
      ).toMatchObject({
        path: entry.href,
        indexed: true,
      });
    }
  });

  it('excludes private utility routes from indexed routes', () => {
    const indexedPaths = getIndexedWebsiteRoutes().map((route) => route.path);

    expect(indexedPaths).toContain('/');
    expect(indexedPaths).toContain('/product');
    expect(indexedPaths).not.toContain('/halftone');
    expect(indexedPaths).not.toContain('/enterprise/activate');
  });

  it('derives robots disallow paths from routes marked private', () => {
    expect(getRobotsDisallowedRoutePaths()).toEqual([
      '/halftone',
      '/enterprise/activate',
    ]);
  });
});
