import { CUSTOMER_STORIES_ROUTE_FAMILY } from '@/case-studies/customer-stories-route-family';
import { PARTNER_PROFILES_ROUTE_FAMILY } from '@/partners-marketplace/partner-profiles-route-family';

import { type WebsiteRouteFamily } from './website-route';

// Dynamic families register here as their content migrates. The sitemap awaits
// every enumerator; failing enumerators degrade to [] rather than crash it.
export const WEBSITE_ROUTE_FAMILY_LIST: readonly WebsiteRouteFamily[] = [
  CUSTOMER_STORIES_ROUTE_FAMILY,
  PARTNER_PROFILES_ROUTE_FAMILY,
];
