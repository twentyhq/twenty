import { type RankedMarketplacePartner } from './marketplace-partner';

export const completenessScore = (
  partner: RankedMarketplacePartner,
): number => {
  let s = 0;
  if (partner.description.trim().length >= 120) s += 2;
  if (partner.profilePictureUrl) s += 1;
  if (partner.serviceCount >= 1) s += 2;
  s += Math.min(partner.approvedCaseStudyCount, 3) * 2;
  if (partner.calendarLink) s += 1;
  if (partner.hourlyRateUsd !== null || partner.projectBudgetMinUsd !== null) {
    s += 1;
  }
  if (partner.partnerScope.length >= 1) s += 1;
  return s;
};
