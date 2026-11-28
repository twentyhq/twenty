import { isDefined } from 'twenty-shared/utils';

import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { type ServedGeo } from '@/partners-marketplace/served-geos';

import { resolvePartnerCoordinates } from './resolve-partner-coordinates';
import { worldRegionOfCell } from './world-region-of-cell';

// Where the partner is based, falling back to the first region they serve.
export const partnerBaseRegion = (partner: MarketplacePartner): ServedGeo => {
  const base = resolvePartnerCoordinates(
    partner.city ?? '',
    partner.country ?? '',
    partner.region,
  );

  return (
    (isDefined(base) ? worldRegionOfCell(base[0], base[1]) : null) ??
    partner.region[0] ??
    'EUROPE'
  );
};
