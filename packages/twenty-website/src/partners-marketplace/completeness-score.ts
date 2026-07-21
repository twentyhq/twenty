import { type MarketplacePartner } from './marketplace-partner';

export const completenessScore = (p: MarketplacePartner): number => {
  let s = 0;
  if (p.description.trim().length >= 120) s += 2;
  if (p.profilePictureUrl) s += 1;
  if (p.services.length >= 1) s += 2;
  if (p.portfolio.length >= 1) s += 2;
  if (p.clients.length >= 1) s += 1;
  if (p.calendarLink) s += 1;
  if (p.hourlyRateUsd != null || p.projectBudgetMinUsd != null) s += 1;
  if (p.partnerScope.length >= 1) s += 1;
  return s;
};
