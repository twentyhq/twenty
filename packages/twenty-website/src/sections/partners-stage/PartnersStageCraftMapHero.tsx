'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { type ReactNode, useMemo } from 'react';

import { filterPartners } from '@/partners-marketplace/filter-partners';
import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import {
  color,
  DURATION,
  EASING,
  fontFamily,
  fontSize,
  mediaUp,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';
import { Heading, SectionShell, GuideCrosshair } from '@/ui';

import { CONTAINER_COLUMN } from '@/ui/container-column';
import { PartnersStageGlobe } from './PartnersStageGlobe';
import { resolvePartnerCoordinates } from './resolve-partner-coordinates';
import { usePartnersStageFilterState } from './use-partners-stage-filter-state';

// The cover is our world map turned into a globe,
// under the /apps centred copy. It answers the directory's filters (same URL
// state): the regions served light up, the partners' cities glow.

// How far apart partners sharing a city sit on the globe.
const SHARED_CITY_SPREAD_DEGREES = 1.6;

const Column = styled.div`
  padding: ${spacing(16)} 0 ${spacing(10)};
  ${CONTAINER_COLUMN}

  & > * + * {
    margin-top: ${spacing(12)};
  }

  ${mediaUp('md')} {
    padding: ${spacing(28)} 0 ${spacing(14)};

    & > * + * {
      margin-top: ${spacing(16)};
    }
  }
`;

const Copy = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  text-align: center;

  & > * + * {
    margin-top: ${spacing(6)};
  }
`;

const Rise = styled.div`
  animation: partners-stage-map-hero-rise ${DURATION.xl} ${EASING.standard}
    calc(var(--partners-stage-rise-order, 0) * 80ms) both;

  @keyframes partners-stage-map-hero-rise {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const Label = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  letter-spacing: 0.08em;
  line-height: 16px;
  text-transform: uppercase;
`;

const Title = styled.div`
  color: ${color('neutral')};
  max-width: 820px;
`;

const Lede = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  line-height: 1.55;
  max-width: 500px;

  ${mediaUp('md')} {
    font-size: ${fontSize(4.5)};
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
  justify-content: center;
`;

type PartnersStageCraftMapHeroProps = {
  actions: ReactNode;
  partners: readonly MarketplacePartner[];
};

export function PartnersStageCraftMapHero({
  actions,
  partners,
}: PartnersStageCraftMapHeroProps) {
  const { i18n } = useLingui();
  const { criteria } = usePartnersStageFilterState();
  const selected = useMemo(
    () => filterPartners(partners, criteria),
    [partners, criteria],
  );
  const cities = useMemo(() => {
    const litSlugs = new Set(selected.map((partner) => partner.slug));
    const hasFilter = selected.length !== partners.length;
    const placed = partners.flatMap((partner) => {
      const coordinates = resolvePartnerCoordinates(
        partner.city,
        partner.country,
        partner.region,
      );
      return coordinates === null
        ? []
        : [
            {
              slug: partner.slug,
              coordinates,
              isLit: !hasFilter || litSlugs.has(partner.slug),
            },
          ];
    });
    // Partners in the same city share a point: spread them on a small ring
    // so every one of them shows.
    const sharing = new Map<string, number>();
    for (const city of placed) {
      const key = city.coordinates.join(',');
      sharing.set(key, (sharing.get(key) ?? 0) + 1);
    }
    const seen = new Map<string, number>();
    return placed.map((city) => {
      const key = city.coordinates.join(',');
      const count = sharing.get(key) ?? 1;
      if (count === 1) {
        return city;
      }
      const rank = seen.get(key) ?? 0;
      seen.set(key, rank + 1);
      const angle = (rank / count) * Math.PI * 2;
      const coordinates: readonly [number, number] = [
        city.coordinates[0] + SHARED_CITY_SPREAD_DEGREES * Math.cos(angle),
        city.coordinates[1] + SHARED_CITY_SPREAD_DEGREES * Math.sin(angle),
      ];
      return { slug: city.slug, isLit: city.isLit, coordinates };
    });
  }, [partners, selected]);

  return (
    <SectionShell
      background={
        <>
          {/* The hero closes on a hairline with the + under the globe. */}
          <GuideCrosshair
            crossX="50%"
            crossY="calc(100% - 1px)"
            verticalLines={false}
          />
        </>
      }
      flushInline
      fullBleedBackground
      rhythm="flush"
      scheme="dark"
    >
      <Column>
        <Copy>
          <Rise>
            <Label>{i18n._(msg`Certified partners`)}</Label>
          </Rise>
          <Rise style={{ ['--partners-stage-rise-order' as string]: 1 }}>
            <Title>
              <Heading as="h1" size="xl" weight="light">
                {i18n._(msg`Hire the people who *build on Twenty*`)}
              </Heading>
            </Title>
          </Rise>
          <Rise style={{ ['--partners-stage-rise-order' as string]: 2 }}>
            <Lede>
              {i18n._(
                msg`Certified partners who set up your CRM to match how your company works, from the migration to the custom apps.`,
              )}
            </Lede>
          </Rise>
          <Rise style={{ ['--partners-stage-rise-order' as string]: 3 }}>
            <Actions>{actions}</Actions>
          </Rise>
        </Copy>
        <PartnersStageGlobe cities={cities} litRegions={criteria.regions} />
      </Column>
    </SectionShell>
  );
}
