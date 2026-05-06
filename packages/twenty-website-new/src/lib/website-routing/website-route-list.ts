import { BLOG_POST_ROUTES } from './blog-post-routes';
import { CUSTOMER_STORY_ROUTES } from './customer-story-routes';
import { STATIC_WEBSITE_ROUTES } from './static-website-routes';
import type { WebsiteRoute } from './types';

export const WEBSITE_ROUTE_LIST: readonly WebsiteRoute[] = [
  ...STATIC_WEBSITE_ROUTES,
  ...CUSTOMER_STORY_ROUTES,
  ...BLOG_POST_ROUTES,
];
