import { completenessScore } from './completeness-score';
import { isGhost } from './is-ghost-partner';
import { type MarketplacePartner } from './marketplace-partner';

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
