import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';

import { partnerBaseRegion } from './partner-base-region';
import { PLACE_POINT_FEATURED_SCALE, placePointClassName } from './place-point';
import { projectOnGlobeCard } from './project-on-globe-card';
import { REGION_CARD_VIEW } from './region-card-view.data';
import { resolvePartnerCoordinates } from './resolve-partner-coordinates';

// The cover still's own frame (976 × 320).
const COVER_ASPECT = 976 / 320;

// The still's frame, centred and covering its box as
// the image does: a narrower box loses the map's sides, a wider one (the
// profile's full-bleed band) its top and bottom, and the point follows.
const MapFrame = styled.div`
  aspect-ratio: ${COVER_ASPECT};
  left: 50%;
  min-height: 100%;
  min-width: 100%;
  pointer-events: none;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
`;

// The cover's place point, as the profile's globe shows its partner:
// featured, a quarter larger, its ring pulsing.
const Point = styled.span`
  position: absolute;
  transform: translate(-50%, -50%) scale(${PLACE_POINT_FEATURED_SCALE});
`;

type RegionMapPointProps = {
  partner: MarketplacePartner;
};

// Where the partner is based, on its region's cover: a still of the profile's
// globe in the region's card view (region-card-view.data.ts, rendered to
// public/images/partners/regions/<region>-cover.webp, 976 × 320), the point
// projected the same way. Only a
// known city or country gets a point: a region's centre is not a place.
export function RegionMapPoint({ partner }: RegionMapPointProps) {
  const coordinates = resolvePartnerCoordinates(
    partner.city ?? '',
    partner.country ?? '',
  );
  if (!isDefined(coordinates)) {
    return null;
  }

  const view = REGION_CARD_VIEW[partnerBaseRegion(partner)];
  const projected = projectOnGlobeCard(
    coordinates,
    view.center,
    view.zoom,
    COVER_ASPECT,
  );
  if (
    !isDefined(projected) ||
    projected.left < 0 ||
    projected.left > 100 ||
    projected.top < 0 ||
    projected.top > 100
  ) {
    return null;
  }
  const { left, top } = projected;

  return (
    <MapFrame>
      <Point
        className={placePointClassName}
        data-featured=""
        style={{ left: `${left}%`, top: `${top}%` }}
      />
    </MapFrame>
  );
}
