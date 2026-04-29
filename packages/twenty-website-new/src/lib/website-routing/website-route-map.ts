import type { WebsiteRoute, WebsiteRouteId } from './types';
import { WEBSITE_ROUTE_LIST } from './website-route-list';

export const WEBSITE_ROUTES: Readonly<
  Partial<Record<WebsiteRouteId, WebsiteRoute>>
> = Object.fromEntries(
  WEBSITE_ROUTE_LIST.map((route) => [route.id, route]),
) as Readonly<Partial<Record<WebsiteRouteId, WebsiteRoute>>>;

export const WEBSITE_ROUTE_BY_ID = WEBSITE_ROUTES;
