/**
 * Public surface of the customers domain — types and the case-study
 * catalog data, both consumed by the `/customers` route, the case-study
 * pages themselves, and the `CaseStudyCatalog` section.
 */
export type {
  CaseStudyCatalogEntry,
  CaseStudyContentBlock,
  CaseStudyData,
  CaseStudyKpi,
  CaseStudyQuote,
  CaseStudyTextBlock,
  CaseStudyVisualBlock,
} from './types';

export {
  CASE_STUDY_CATALOG_ENTRIES,
  CASE_STUDY_HALFTONE_PALETTE,
  getCaseStudyPalette,
} from './case-study-catalog';
