import { type RankedMarketplacePartner } from './marketplace-partner';

const MIN_DESCRIPTION_LENGTH = 120;
const MAX_COUNTED_CASE_STUDIES = 3;
// An approved case study has to outweigh picture + calendar + rate combined,
// otherwise three quick form fields beat evidence of delivered client work.
const POINTS_PER_CASE_STUDY = 4;
const POINTS_PER_CASE_STUDY_COVER = 1;
const POINTS_FOR_INTRODUCTION = 2;
const POINTS_FOR_SERVICE = 2;
const POINTS_FOR_PROFILE_PICTURE = 1;
const POINTS_FOR_CALENDAR_LINK = 1;
const POINTS_FOR_RATE_OR_BUDGET = 1;
const POINTS_FOR_CATEGORY = 1;

export const completenessScore = (
  partner: RankedMarketplacePartner,
): number => {
  const countedCaseStudies = Math.min(
    partner.approvedCaseStudyCount,
    MAX_COUNTED_CASE_STUDIES,
  );
  const countedCovers = Math.min(
    partner.approvedCaseStudyWithCoverCount,
    countedCaseStudies,
  );

  let score =
    countedCaseStudies * POINTS_PER_CASE_STUDY +
    countedCovers * POINTS_PER_CASE_STUDY_COVER;

  if (partner.description.trim().length >= MIN_DESCRIPTION_LENGTH) {
    score += POINTS_FOR_INTRODUCTION;
  }
  if (partner.serviceCount >= 1) {
    score += POINTS_FOR_SERVICE;
  }
  if (partner.profilePictureUrl) {
    score += POINTS_FOR_PROFILE_PICTURE;
  }
  if (partner.calendarLink) {
    score += POINTS_FOR_CALENDAR_LINK;
  }
  if (partner.hourlyRateUsd !== null || partner.projectBudgetMinUsd !== null) {
    score += POINTS_FOR_RATE_OR_BUDGET;
  }
  if (partner.partnerScope.length >= 1) {
    score += POINTS_FOR_CATEGORY;
  }

  return score;
};
