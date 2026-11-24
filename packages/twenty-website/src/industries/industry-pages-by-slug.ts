import { type IndustryPageDefinition } from './industry-page-types';
import { INDUSTRY_PAGES } from './industry-pages';

export const INDUSTRY_PAGES_BY_SLUG: ReadonlyMap<
  string,
  IndustryPageDefinition
> = new Map(INDUSTRY_PAGES.map((page) => [page.slug, page]));
