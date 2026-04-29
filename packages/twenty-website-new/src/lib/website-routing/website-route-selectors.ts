import { WEBSITE_ROUTE_LIST } from './website-route-list';
import type { WebsiteRoute } from './types';

export const getIndexedWebsiteRoutes = (): readonly WebsiteRoute[] =>
  WEBSITE_ROUTE_LIST.filter((route) => route.indexed);

export const getRobotsDisallowedRoutePaths = (): readonly string[] =>
  WEBSITE_ROUTE_LIST.filter((route) => route.robotsDisallow).map(
    (route) => route.path,
  );
