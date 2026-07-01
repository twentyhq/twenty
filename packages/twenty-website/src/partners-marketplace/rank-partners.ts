import { type MarketplacePartner } from './marketplace-partner';

export const completenessScore = (p: MarketplacePartner): number => {
  let s = 0;
  if (p.description.trim().length >= 120) s += 2;
  if (p.profilePictureUrl) s += 1;
  if (p.services.length >= 1) s += 2;
  if (p.portfolio.length >= 1) s += 2;
  if (p.clients.length >= 1) s += 1;
  if (p.calendarLink) s += 1;
  if (
    p.hourlyRateUsd != null ||
    p.projectBudgetMinUsd != null ||
    p.projectBudgetTypicalUsd != null
  )
    s += 1;
  if (p.partnerScope.length >= 1) s += 1;
  return s;
};

export const isGhost = (p: MarketplacePartner): boolean =>
  p.description.trim().length < 40 && !p.profilePictureUrl;

export const rankPartners = (
  partners: readonly MarketplacePartner[],
): MarketplacePartner[] =>
  partners
    .filter((p) => !isGhost(p))
    .slice()
    .sort(
      (a, b) =>
        completenessScore(b) - completenessScore(a) ||
        a.name.localeCompare(b.name),
    );
