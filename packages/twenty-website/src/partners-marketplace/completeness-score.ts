import { type RankedMarketplacePartner } from './marketplace-partner';

const MIN_DESCRIPTION_LENGTH = 120;
const MAX_COUNTED_CASE_STUDIES = 3;
// An approved case study has to outweigh picture + calendar + rate combined,
// otherwise three quick form fields beat evidence of delivered client work.
const POINTS_PER_CASE_STUDY = 4;
const POINTS_PER_CASE_STUDY_COVER = 1;

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

  if (partner.description.trim().length >= MIN_DESCRIPTION_LENGTH) score += 2;
  if (partner.serviceCount >= 1) score += 2;
  if (partner.profilePictureUrl) score += 1;
  if (partner.calendarLink) score += 1;
  if (partner.hourlyRateUsd !== null || partner.projectBudgetMinUsd !== null) {
    score += 1;
  }
  if (partner.partnerScope.length >= 1) score += 1;

  return score;
};
