import { styled } from '@linaria/react';
import NextImage from 'next/image';
import { isDefined } from 'twenty-shared/utils';

import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { cssVariableStyle } from '@/ui/css-variable-style';

import { partnerBaseRegion } from './partner-base-region';
import { PLACE_POINT_FEATURED_SCALE, placePointClassName } from './place-point';
import { projectOnGlobeCard } from './project-on-globe-card';
import { REGION_CARD_VIEW } from './region-card-view.data';
import { resolvePartnerCoordinates } from './resolve-partner-coordinates';

// The cover still's own frame (1952 × 640, twice the card's size so a zoomed
// cover stays sharp).
const COVER_ASPECT = 1952 / 640;
// How far a card closes in on its partner's place.
const PLACE_ZOOM = 1.9;

// The still's frame, centred and covering its box as an object-fit: cover
// image would: a narrower box loses the map's sides, a wider one its top and
// bottom. With a known place, the frame is drawn in around it, the place at
// the centre; whatever runs past the still is the cover's own black.
const MapFrame = styled.div`
  aspect-ratio: ${COVER_ASPECT};
  left: 50%;
  min-height: 100%;
  min-width: 100%;
  pointer-events: none;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);

  &[data-zoomed] {
    transform: translate(-50%, -50%)
      translate(calc(50% - var(--place-left)), calc(50% - var(--place-top)))
      scale(${PLACE_ZOOM});
    transform-origin: var(--place-left) var(--place-top);
  }
`;

// The place point, as the profile's globe shows its partner: featured, a
// quarter larger, its ring pulsing; kept at its size inside a zoomed frame.
const Point = styled.span`
  left: var(--place-left);
  position: absolute;
  top: var(--place-top);
  transform: translate(-50%, -50%)
    scale(${PLACE_POINT_FEATURED_SCALE / PLACE_ZOOM});
`;

type RegionMapPointProps = {
  partner: MarketplacePartner;
};

// Where the partner is based: a still of the profile's globe in its region's
// card view (region-card-view.data.ts, rendered to
// public/images/partners/regions/<region>-card.webp, 1952 × 640), drawn in on
// the partner's place with the place at the centre. Only a known city or
// country gets a point and the zoom: a region's centre is not a place, so
// the card then shows the whole region.
export function RegionMapPoint({ partner }: RegionMapPointProps) {
  const region = partnerBaseRegion(partner);
  const view = REGION_CARD_VIEW[region];
  const coordinates = resolvePartnerCoordinates(
    partner.city ?? '',
    partner.country ?? '',
  );
  const projected = isDefined(coordinates)
    ? projectOnGlobeCard(coordinates, view.center, view.zoom, COVER_ASPECT)
    : null;
  const place =
    isDefined(projected) &&
    projected.left >= 0 &&
    projected.left <= 100 &&
    projected.top >= 0 &&
    projected.top <= 100
      ? projected
      : null;

  return (
    <MapFrame
      data-zoomed={isDefined(place) ? '' : undefined}
      style={
        isDefined(place)
          ? cssVariableStyle({
              // rounded: the server and the browser disagree in the last
              // digits of the projection
              '--place-left': `${place.left.toFixed(2)}%`,
              '--place-top': `${place.top.toFixed(2)}%`,
            })
          : undefined
      }
    >
      {/* unoptimized, as the site's other halftone stills: re-encoding
          blurs the dots */}
      <NextImage
        alt=""
        fill
        src={`/images/partners/regions/${region.toLowerCase()}-card.webp`}
        unoptimized
      />
      {isDefined(place) && (
        <Point className={placePointClassName} data-featured="" />
      )}
    </MapFrame>
  );
}
