import { STATIC_WEBSITE_ROUTES } from './static-website-routes';
import { type WebsiteRoute } from './website-route';

// Dynamic route families (articles, customer stories) concatenate here as
// they migrate.
export const WEBSITE_ROUTE_LIST: readonly WebsiteRoute[] = [
  ...STATIC_WEBSITE_ROUTES,
];
