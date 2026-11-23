import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { color, spacing } from '@/tokens';

import { partnerBaseRegion } from './partner-base-region';
import { REGION_MAP_WINDOW } from './region-map-window.data';
import { resolvePartnerCoordinates } from './resolve-partner-coordinates';

// The map image's own frame (2400 / 787). The map covers its box, so when
// the box is narrower the image, and the point on it, lose both sides.
const MapFrame = styled.div`
  aspect-ratio: 2400 / 787;
  height: 100%;
  left: 50%;
  pointer-events: none;
  position: absolute;
  top: 0;
  transform: translateX(-50%);
`;

// A white dot, cut out of the region's dashes by a black edge, ringed in
// white: it stays readable whatever the region's accent.
const Point = styled.span`
  background-color: ${color('white')};
  border: 2px solid ${color('black')};
  border-radius: 50%;
  height: ${spacing(4)};
  position: absolute;
  transform: translate(-50%, -50%);
  width: ${spacing(4)};

  &::after {
    border: 1px solid ${color('white')};
    border-radius: 50%;
    content: '';
    inset: calc(-1 * ${spacing(2)});
    position: absolute;
  }
`;

type RegionMapPointProps = {
  partner: MarketplacePartner;
};

// Where the partner is based, on its region's map (the directory card cover
// and the profile band show the same map). Only a known city or country gets a
// point: a region's centre is not a place.
export function RegionMapPoint({ partner }: RegionMapPointProps) {
  const coordinates = resolvePartnerCoordinates(
    partner.city ?? '',
    partner.country ?? '',
  );
  if (!isDefined(coordinates)) {
    return null;
  }

  const [west, east, south, north] =
    REGION_MAP_WINDOW[partnerBaseRegion(partner)];
  const [longitude, latitude] = coordinates;
  const left = ((longitude - west) / (east - west)) * 100;
  const top = ((north - latitude) / (north - south)) * 100;
  if (left < 0 || left > 100 || top < 0 || top > 100) {
    return null;
  }

  return (
    <MapFrame>
      <Point style={{ left: `${left}%`, top: `${top}%` }} />
    </MapFrame>
  );
}
