import { WEBSITE_ROUTE_LIST } from './website-route-list';
import { type WebsiteRoute, type WebsiteRouteId } from './website-route';

const ROUTES_BY_ID: ReadonlyMap<WebsiteRouteId, WebsiteRoute> = new Map(
  WEBSITE_ROUTE_LIST.map((route) => [route.id, route]),
);

export const getWebsiteRoute = (id: WebsiteRouteId): WebsiteRoute => {
  const route = ROUTES_BY_ID.get(id);
  if (route === undefined) {
    throw new Error(`Unknown website route id: ${id}`);
  }
  return route;
};
