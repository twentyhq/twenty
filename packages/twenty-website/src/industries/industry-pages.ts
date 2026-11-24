import { type IndustryPageDefinition } from './industry-page-types';
import { COMMERCIAL_REAL_ESTATE_INDUSTRY_PAGE } from './pages/commercial-real-estate.industry-page';
import { REAL_ESTATE_INDUSTRY_PAGE } from './pages/real-estate.industry-page';

export const INDUSTRY_PAGES: readonly IndustryPageDefinition[] = [
  REAL_ESTATE_INDUSTRY_PAGE,
  COMMERCIAL_REAL_ESTATE_INDUSTRY_PAGE,
];
