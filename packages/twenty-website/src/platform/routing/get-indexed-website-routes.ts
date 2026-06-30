import { WEBSITE_ROUTE_LIST } from './website-route-list';
import { type WebsiteRoute } from './website-route';

export const getIndexedWebsiteRoutes = (): readonly WebsiteRoute[] =>
  WEBSITE_ROUTE_LIST.filter((route) => route.indexed);
