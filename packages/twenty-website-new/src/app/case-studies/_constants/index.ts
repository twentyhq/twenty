import { NINE_DOTS_CASE_STUDY } from './nine-dots';
import { ALTERNATIVE_PARTNERS_CASE_STUDY } from './alternative-partners';
import { BEAGLE_CASE_STUDY } from './beagle';
import { ELEVATE_CONSULTING_CASE_STUDY } from './elevate-consulting';
import { EVERGREEN_CASE_STUDY } from './evergreen';
import { REALYTICS_CASE_STUDY } from './realytics';

export type { CaseStudyData, CaseStudyContentBlock } from './types';

export const ALL_CASE_STUDIES = [
  REALYTICS_CASE_STUDY,
  BEAGLE_CASE_STUDY,
  EVERGREEN_CASE_STUDY,
  NINE_DOTS_CASE_STUDY,
  ALTERNATIVE_PARTNERS_CASE_STUDY,
  ELEVATE_CONSULTING_CASE_STUDY,
] as const;
