import { WEBSITE_ROUTE_LIST } from './website-route-list';

export const getRobotsDisallowedRoutePaths = (): readonly string[] =>
  WEBSITE_ROUTE_LIST.filter((route) => route.robotsDisallow === true).map(
    (route) => route.path,
  );
