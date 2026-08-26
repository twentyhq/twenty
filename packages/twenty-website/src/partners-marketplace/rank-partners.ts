import { completenessScore } from './completeness-score';
import { isGhost } from './is-ghost-partner';
import { type RankedMarketplacePartner } from './marketplace-partner';

const PARTNER_TIER_WEIGHT = {
  ADVANCED: 3,
  INTERMEDIATE: 2,
  NEW: 1,
} as const;

const partnerTierWeight = (partner: RankedMarketplacePartner): number =>
  partner.partnerTier === null ? 0 : PARTNER_TIER_WEIGHT[partner.partnerTier];

export const rankPartners = (
  partners: readonly RankedMarketplacePartner[],
): RankedMarketplacePartner[] =>
  partners
    .filter((partner) => !isGhost(partner))
    .slice()
    .sort(
      (left, right) =>
        completenessScore(right) - completenessScore(left) ||
        partnerTierWeight(right) - partnerTierWeight(left) ||
        left.rotationKey.localeCompare(right.rotationKey),
    );
