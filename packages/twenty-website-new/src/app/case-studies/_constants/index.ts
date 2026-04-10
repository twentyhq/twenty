import { BEAGLE_CASE_STUDY } from './beagle';
import { EVERGREEN_CASE_STUDY } from './evergreen';
import { REALYTICS_CASE_STUDY } from './realytics';

export type { CaseStudyData, CaseStudyContentBlock } from './types';

export const ALL_CASE_STUDIES = [
  REALYTICS_CASE_STUDY,
  BEAGLE_CASE_STUDY,
  EVERGREEN_CASE_STUDY,
] as const;
