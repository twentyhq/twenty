'use client';

import { msg, plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { useMemo } from 'react';

import { filterPartners } from '@/partners-marketplace/filter-partners';
import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { SERVED_GEOS } from '@/partners-marketplace/served-geos';
import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import { PARTNER_DIRECTORY_ANCHOR_ID } from '@/platform/routing/partner-directory-anchor-id';
import {
  color,
  DURATION,
  EASING,
  fontFamily,
  fontSize,
  mediaUp,
  MENU_HEIGHT_PX,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, Heading, SectionShell } from '@/ui';

import { buildWorldMapRegionPaths } from './build-world-map-region-paths';
import { PARTNERS_STAGE_CRAFT_COLUMN } from './partners-stage-craft-column';
import { WORLD_LAND_GRID } from './world-land-grid.data';
import { PartnersStageMark } from './PartnersStageMark';
import { resolvePartnerPlace } from './resolve-partner-place';
import { usePartnersStageFilterState } from './use-partners-stage-filter-state';

// PROTOTYPE (?direction=e): the /apps "Featured" block, with our world map
// where /apps shows the app's halftone logo. It answers the directory's
// filters below (same URL state): regions served light up, cities glow.
const Frame = styled.div`
  border-bottom: 1px solid ${semanticColor.line};
  border-inline: 1px solid ${semanticColor.line};
  padding: ${spacing(12)} ${spacing(4)};
  scroll-margin-top: ${MENU_HEIGHT_PX}px;
  ${PARTNERS_STAGE_CRAFT_COLUMN}

  & > * + * {
    margin-top: ${spacing(8)};
  }

  ${mediaUp('md')} {
    padding: ${spacing(20)} ${spacing(24)};
  }
`;

const Header = styled.div`
  max-width: 560px;

  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

// The map is the panel's picture, full width; who is in the selection reads
// along its foot.
const Panel = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PanelText = styled.div`
  border-top: 1px solid ${semanticColor.line};
  display: flex;
  flex-direction: column;
  gap: ${spacing(5)};
  padding: ${spacing(6)};

  ${mediaUp('md')} {
    align-items: center;
    flex-direction: row;
    gap: ${spacing(10)};
    justify-content: space-between;
    padding: ${spacing(6)} ${spacing(9)};
  }
`;

const Count = styled.p`
  color: ${semanticColor.ink};
  flex-shrink: 0;
  max-width: 260px;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  letter-spacing: 0.08em;
  line-height: 18px;
  text-transform: uppercase;
`;

// Rekeyed on every selection, so the marks cascade in again.
const Marks = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(1.5)};
  list-style: none;

  ${mediaUp('md')} {
    justify-content: flex-end;
  }
`;

const MarkItem = styled.li`
  animation: partners-stage-craft-mark-in ${DURATION.md} ${EASING.standard}
    calc(var(--partners-stage-mark-index) * 25ms) backwards;

  @keyframes partners-stage-craft-mark-in {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const MarkLink = styled(LocalizedLink)`
  border-radius: ${radius(1.5)};
  display: block;
  line-height: 0;
  transition: transform ${DURATION.md} ${EASING.spring};

  &:hover {
    transform: translateY(-3px);
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 2px;
  }

  ${REDUCED_MOTION} {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;

const MapBox = styled.div`
  padding: ${spacing(6)} ${spacing(4)};

  ${mediaUp('md')} {
    padding: ${spacing(12)} ${spacing(14)};
  }
`;

const MapCanvas = styled.div`
  position: relative;
  width: 100%;
`;

const MapSvg = styled.svg`
  display: block;
  height: auto;
  width: 100%;
`;

// Regions served by the selection light up; with nothing selected, every
// region sits at the same mid tone.
const RegionDashes = styled.path`
  fill: none;
  stroke: ${color('white-20')};
  stroke-width: 0.7;
  transition: stroke ${DURATION.md} ${EASING.gentle};

  &[data-state='dim'] {
    stroke: ${color('white-10')};
  }

  &[data-state='lit'] {
    stroke: ${color('green')};
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const REGION_PATHS = buildWorldMapRegionPaths();
const MAP_HEIGHT = WORLD_LAND_GRID.rows.length * WORLD_LAND_GRID.degreesPerCell;

const CityDot = styled.span`
  background-color: ${color('white-40')};
  border-radius: 50%;
  height: 4px;
  position: absolute;
  transform: translate(-50%, -50%);
  transition:
    background-color ${DURATION.md} ${EASING.gentle},
    box-shadow ${DURATION.md} ${EASING.gentle};
  width: 4px;

  &[data-lit] {
    background-color: ${color('white')};
    box-shadow:
      0 0 0 2px ${color('green')},
      0 0 14px 4px ${color('green')};
  }

  ${mediaUp('md')} {
    height: 7px;
    width: 7px;
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

type PartnersStageCraftAtlasProps = {
  partners: readonly MarketplacePartner[];
};

export function PartnersStageCraftAtlas({
  partners,
}: PartnersStageCraftAtlasProps) {
  const { i18n } = useLingui();
  const { criteria } = usePartnersStageFilterState();

  // The panel shows what the directory's filters select.
  const inRegion = useMemo(
    () => filterPartners(partners, criteria),
    [partners, criteria],
  );
  const litSlugs = new Set(inRegion.map((partner) => partner.slug));
  const places = useMemo(
    () =>
      partners.map((partner) => ({
        slug: partner.slug,
        place: resolvePartnerPlace(partner.city, partner.country),
      })),
    [partners],
  );
  const selectionKey = [...criteria.regions, ...criteria.languages].join('|');

  return (
    <SectionShell flushInline rhythm="flush" scheme="dark">
      <Frame id={PARTNER_DIRECTORY_ANCHOR_ID} tabIndex={-1}>
        <Header>
          <Heading as="h2" size="md" weight="light">
            {i18n._(msg`Browse the *certified partners*`)}
          </Heading>
          <Body muted size="md">
            {i18n._(
              msg`Filter by region, language, and specialty, then read a profile and book a call with the partner yourself.`,
            )}
          </Body>
        </Header>
        <Panel>
          <MapBox aria-hidden>
            <MapCanvas>
              <MapSvg viewBox={`0 0 360 ${MAP_HEIGHT}`}>
                <RegionDashes
                  d={REGION_PATHS.unassigned}
                  data-state={criteria.regions.size === 0 ? 'rest' : 'dim'}
                />
                {SERVED_GEOS.map((geo) => (
                  <RegionDashes
                    d={REGION_PATHS.regions[geo]}
                    data-state={
                      criteria.regions.size === 0
                        ? 'rest'
                        : criteria.regions.has(geo)
                          ? 'lit'
                          : 'dim'
                    }
                    key={geo}
                  />
                ))}
              </MapSvg>
              {places.map(({ slug, place }) =>
                place === null ? null : (
                  <CityDot
                    data-lit={litSlugs.has(slug) ? '' : undefined}
                    key={slug}
                    style={{
                      left: `${place.leftPercent}%`,
                      top: `${place.topPercent}%`,
                    }}
                  />
                ),
              )}
            </MapCanvas>
          </MapBox>
          <PanelText>
            <Count aria-live="polite">
              {inRegion.length === 0
                ? i18n._(msg`No partners to show right now`)
                : i18n._(
                    msg`${plural(inRegion.length, {
                      one: '# certified partner ready to take on your project',
                      other:
                        '# certified partners ready to take on your project',
                    })}`,
                  )}
            </Count>
            <Marks key={selectionKey}>
              {inRegion.map((partner, index) => (
                <MarkItem
                  key={partner.slug}
                  style={{
                    ['--partners-stage-mark-index' as string]: index,
                  }}
                >
                  <MarkLink
                    aria-label={partner.name}
                    href={`/partners/profile/${partner.slug}`}
                    title={partner.name}
                  >
                    <PartnersStageMark
                      markUrl={partner.profilePictureUrl}
                      name={partner.name}
                      sizePx={36}
                      tone="dark"
                    />
                  </MarkLink>
                </MarkItem>
              ))}
            </Marks>
          </PanelText>
        </Panel>
      </Frame>
    </SectionShell>
  );
}
