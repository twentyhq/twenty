'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { IconLayoutGrid, IconList } from '@tabler/icons-react';
import {
  type MouseEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { filterPartners } from '@/partners-marketplace/filter-partners';
import { MARKETPLACE_COPY } from '@/partners-marketplace/marketplace-copy';
import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { PARTNER_SCOPE_LABELS } from '@/partners-marketplace/partner-scope-labels';
import {
  PARTNER_SCOPES,
  type PartnerScope,
} from '@/partners-marketplace/partner-scopes';
import { SERVED_GEO_LABELS } from '@/partners-marketplace/served-geo-labels';
import { SPOKEN_LANGUAGE_LABELS } from '@/partners-marketplace/spoken-language-labels';
import {
  SPOKEN_LANGUAGES,
  type SpokenLanguage,
} from '@/partners-marketplace/spoken-languages';
import {
  SERVED_GEOS,
  type ServedGeo,
} from '@/partners-marketplace/served-geos';
import { PARTNER_DIRECTORY_ANCHOR_ID } from '@/platform/routing/partner-directory-anchor-id';
import {
  color,
  DURATION,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  MENU_HEIGHT_PX,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, Button, Heading, SectionShell } from '@/ui';

import { CONTAINER_COLUMN } from '@/ui/container-column';
import { PartnersStageCraftCell } from './PartnersStageCraftCell';
import { PartnersStageCraftRow } from './PartnersStageCraftRow';
import {
  PartnersStageCraftFilter,
  type PartnersStageCraftFilterOption,
} from './PartnersStageCraftFilter';
import { resolvePartnerCoordinates } from './resolve-partner-coordinates';
import { usePartnersStageFilterState } from './use-partners-stage-filter-state';
import { usePartnersStageView } from './use-partners-stage-view';
import { PARTNERS_STAGE_RETURN } from './partners-stage-return';
import { worldRegionOfCell } from './world-region-of-cell';

// The directory. The site's filters and a Cards /
// List switch in a bar that sticks under the menu, then the partners grouped
// by base region, as cards or as rows.
const Frame = styled.div`
  ${CONTAINER_COLUMN}
`;

// scroll-margin clears the fixed menu on the hero's anchor jump.
const Header = styled.div`
  max-width: 640px;
  padding: ${spacing(12)} 0 ${spacing(8)};

  & > * + * {
    margin-top: ${spacing(3)};
  }

  ${mediaUp('md')} {
    padding: ${spacing(20)} 0 ${spacing(10)};
  }
`;

// Sticks under the menu from tablet up, so the filters stay in reach down the
// whole list; on a phone it would take a third of the screen.
const FilterBar = styled.div`
  background-color: ${semanticColor.surface};
  padding: ${spacing(3)} 0;
  z-index: 2;

  & > * + * {
    margin-top: ${spacing(3)};
  }

  ${mediaUp('md')} {
    padding: ${spacing(4)} 0;
    position: sticky;
    top: ${MENU_HEIGHT_PX}px;
  }
`;

const FilterRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)};
`;

const FilterEnd = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing(4)};
  margin-left: auto;
`;

const ResultCount = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
  line-height: ${fontSize(4)};
`;

const Main = styled.div`
  padding: ${spacing(10)} 0 ${spacing(12)};

  ${mediaUp('md')} {
    padding: ${spacing(14)} 0 ${spacing(20)};
  }
`;

// Switching view crossfades the list in.
const Regions = styled.div`
  animation: partners-stage-view-in ${DURATION.md} ${EASING.standard};

  & > * + * {
    margin-top: ${spacing(16)};
  }

  @keyframes partners-stage-view-in {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }

  /* Back from a partner's page: the list is where it was, nothing replays. */
  &[data-returning],
  &[data-returning] * {
    animation: none;
  }
`;

const Region = styled.div`
  & > * + * {
    margin-top: ${spacing(6)};
  }
`;

const RegionHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing(2.5)};
`;

const RegionTitle = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4.5)};
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 24px;
`;

const RegionCount = styled.span`
  color: ${semanticColor.inkSubtle};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  line-height: 16px;
`;

// Three cards side by side from md, with the /apps cards' spacing.
const Grid = styled.div`
  display: grid;
  gap: ${spacing(3)};
  grid-template-columns: minmax(0, 1fr);

  /* Fixed tracks: a region with one or two partners keeps its cards at the
     row's width, left-aligned; nothing stretches to fill. */
  ${mediaUp('sm')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${mediaUp('md')} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

// Cards / List, two joined buttons in the filter buttons' style. Icons only
// on a phone, with the label kept for assistive tech.
const ViewSwitch = styled.div`
  display: inline-flex;
`;

const ViewButton = styled.button`
  align-items: center;
  background-color: transparent;
  border: 1px solid ${semanticColor.line};
  color: ${color('white-60')};
  cursor: pointer;
  display: inline-flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  gap: ${spacing(1.5)};
  line-height: ${fontSize(4)};
  padding: ${spacing(1.5)} ${spacing(2.5)};
  position: relative;
  transition:
    background-color ${DURATION.xxs} ${EASING.gentle},
    border-color ${DURATION.xxs} ${EASING.gentle},
    color ${DURATION.xxs} ${EASING.gentle};

  &:first-child {
    border-radius: ${radius(1.5)} 0 0 ${radius(1.5)};
  }

  &:last-child {
    border-radius: 0 ${radius(1.5)} ${radius(1.5)} 0;
    margin-left: -1px;
  }

  &:hover {
    color: ${semanticColor.ink};
  }

  &[aria-pressed='true'] {
    background-color: ${color('white-5')};
    border-color: ${color('white-40')};
    color: ${semanticColor.ink};
    z-index: 1;
  }

  &:focus-visible {
    outline: 2px solid ${color('white-40')};
    outline-offset: 2px;
    z-index: 2;
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const ViewLabel = styled.span`
  display: none;

  ${mediaUp('md')} {
    display: inline;
  }
`;

// Rows sit flush with the headings: their padding hangs into the gutter. A
// hairline between rows, none around them.
const RowList = styled.ul`
  list-style: none;
  margin-inline: calc(${spacing(3)} * -1);
  padding: 0;

  & > li + li {
    border-top: 1px solid ${semanticColor.line};
  }
`;

const Offer = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  padding: ${spacing(10)} ${spacing(6)};

  & > * + * {
    margin-top: ${spacing(4)};
  }

  ${mediaUp('md')} {
    padding: ${spacing(14)} ${spacing(12)};
  }
`;

const OfferAction = styled.div`
  padding-top: ${spacing(2)};
`;

const OTHER_REGION = 'OTHER';

type RegionKey = ServedGeo | typeof OTHER_REGION;

const toRegionId = (region: RegionKey) =>
  `partners-region-${region.toLowerCase()}`;

// Where the partner is based; the first region they serve when the base is
// not on the map.
const baseRegionOf = (partner: MarketplacePartner): RegionKey => {
  const coordinates = resolvePartnerCoordinates(
    partner.city ?? '',
    partner.country ?? '',
    partner.region,
  );
  const based =
    coordinates !== null
      ? worldRegionOfCell(coordinates[0], coordinates[1])
      : null;

  return based ?? partner.region[0] ?? OTHER_REGION;
};

type PartnersStageCraftDirectoryProps = {
  matchCta: ReactNode;
  partners: readonly MarketplacePartner[];
};

export function PartnersStageCraftDirectory({
  matchCta,
  partners,
}: PartnersStageCraftDirectoryProps) {
  const { i18n } = useLingui();
  const {
    criteria,
    hasAnyFilter,
    toggleRegion,
    toggleLanguage,
    toggleCategory,
    clearFacet,
    clearAll,
  } = usePartnersStageFilterState();
  const { view, setView } = usePartnersStageView();

  // Opening a partner leaves a mark; finding it on mount means this is the
  // way back, so the list shows as it was instead of playing its entrance.
  const [isReturning, setIsReturning] = useState(() => {
    try {
      return (
        typeof window !== 'undefined' &&
        window.sessionStorage.getItem(PARTNERS_STAGE_RETURN.leftKey) === '1'
      );
    } catch {
      return false;
    }
  });
  const directoryQuery = useRef('');

  // The mark is read once, by the first render; then it is spent.
  useEffect(() => {
    try {
      window.sessionStorage.removeItem(PARTNERS_STAGE_RETURN.leftKey);
    } catch {
      // Storage blocked: the way back is a plain navigation.
    }
  }, []);

  // The directory as last seen, for a way back from a page opened directly.
  // Skipped while the router is already on a partner's page.
  useEffect(() => {
    const { pathname, search } = window.location;
    if (pathname.includes('/partners/profile/')) {
      return;
    }
    const url = `${pathname}${search}`;
    try {
      window.sessionStorage.setItem(PARTNERS_STAGE_RETURN.urlKey, url);
    } catch {
      // Storage blocked: the way back is a plain navigation.
    }
    // A filter or view change after coming back plays the list again.
    if (directoryQuery.current !== '' && directoryQuery.current !== url) {
      setIsReturning(false);
    }
    directoryQuery.current = url;
  }, [view, criteria]);

  const markPartnerOpened = (event: MouseEvent<HTMLDivElement>) => {
    const link = (event.target as HTMLElement).closest('a');
    if (link?.getAttribute('href')?.includes('/partners/profile/')) {
      try {
        window.sessionStorage.setItem(PARTNERS_STAGE_RETURN.leftKey, '1');
      } catch {
        // Storage blocked: the way back is a plain navigation.
      }
    }
  };

  const filtered = useMemo(
    () => filterPartners(partners, criteria),
    [partners, criteria],
  );

  const regions = useMemo(() => {
    const byRegion = new Map<RegionKey, MarketplacePartner[]>();

    for (const partner of filtered) {
      const region = baseRegionOf(partner);
      byRegion.set(region, [...(byRegion.get(region) ?? []), partner]);
    }

    const order: readonly RegionKey[] = [...SERVED_GEOS, OTHER_REGION];

    return order
      .filter((region) => byRegion.has(region))
      .map((region) => [region, byRegion.get(region) ?? []] as const);
  }, [filtered]);

  const labelOf = (region: RegionKey) =>
    region === OTHER_REGION
      ? i18n._(msg`Other`)
      : i18n._(SERVED_GEO_LABELS[region]);

  const countOf = <TValue,>(
    values: (partner: MarketplacePartner) => readonly TValue[],
    value: TValue,
  ) => partners.filter((partner) => values(partner).includes(value)).length;

  const regionOptions: PartnersStageCraftFilterOption[] = SERVED_GEOS.map(
    (geo) => ({
      value: geo,
      label: i18n._(SERVED_GEO_LABELS[geo]),
      count: countOf((partner) => partner.region, geo),
    }),
  );
  // Only languages somebody speaks, most spoken first.
  const languageOptions: PartnersStageCraftFilterOption[] =
    SPOKEN_LANGUAGES.map((language) => ({
      value: language,
      label: i18n._(SPOKEN_LANGUAGE_LABELS[language]),
      count: countOf((partner) => partner.languagesSpoken, language),
    }))
      .filter(
        (option) =>
          option.count > 0 ||
          criteria.languages.has(option.value as SpokenLanguage),
      )
      .toSorted((left, right) => right.count - left.count);
  const scopeOptions: PartnersStageCraftFilterOption[] = PARTNER_SCOPES.map(
    (scope) => ({
      value: scope,
      label: i18n._(PARTNER_SCOPE_LABELS[scope]),
      count: countOf((partner) => partner.partnerScope, scope),
    }),
  );

  const listKey = [
    ...criteria.regions,
    ...criteria.languages,
    ...criteria.categories,
  ].join('|');

  return (
    <SectionShell flushInline rhythm="flush" scheme="dark">
      <Frame>
        <Header id={PARTNER_DIRECTORY_ANCHOR_ID} tabIndex={-1}>
          <Heading as="h2" size="md" weight="light">
            {i18n._(msg`Browse the *certified partners*`)}
          </Heading>
          <Body muted size="md">
            {i18n._(
              msg`Filter by region, language, and specialty, then read a profile and book a call with the partner yourself.`,
            )}
          </Body>
        </Header>
        {partners.length > 0 && (
          <FilterBar aria-label={i18n._(msg`Filter partners`)} role="search">
            <FilterRow>
              <PartnersStageCraftFilter
                label={i18n._(msg`Regions`)}
                onClear={() => clearFacet('regions')}
                onToggle={(value) => toggleRegion(value as ServedGeo)}
                options={regionOptions}
                selected={criteria.regions}
              />
              <PartnersStageCraftFilter
                label={i18n._(msg`Languages`)}
                onClear={() => clearFacet('languages')}
                onToggle={(value) => toggleLanguage(value as SpokenLanguage)}
                options={languageOptions}
                selected={criteria.languages}
              />
              <PartnersStageCraftFilter
                label={i18n._(MARKETPLACE_COPY.partnerScopeHeading)}
                onClear={() => clearFacet('categories')}
                onToggle={(value) => toggleCategory(value as PartnerScope)}
                options={scopeOptions}
                selected={criteria.categories}
              />
              <FilterEnd>
                <ResultCount aria-live="polite">
                  {hasAnyFilter
                    ? i18n._(
                        msg`Showing ${filtered.length} of ${partners.length} partners`,
                      )
                    : i18n._(msg`${partners.length} partners`)}
                </ResultCount>
                <ViewSwitch aria-label={i18n._(msg`View`)} role="group">
                  <ViewButton
                    aria-label={i18n._(msg`Cards`)}
                    aria-pressed={view === 'cards'}
                    onClick={() => setView('cards')}
                    type="button"
                  >
                    <IconLayoutGrid aria-hidden size={14} strokeWidth={2} />
                    <ViewLabel>{i18n._(msg`Cards`)}</ViewLabel>
                  </ViewButton>
                  <ViewButton
                    aria-label={i18n._(msg`List`)}
                    aria-pressed={view === 'list'}
                    onClick={() => setView('list')}
                    type="button"
                  >
                    <IconList aria-hidden size={14} strokeWidth={2} />
                    <ViewLabel>{i18n._(msg`List`)}</ViewLabel>
                  </ViewButton>
                </ViewSwitch>
                {hasAnyFilter && (
                  <Button
                    label={i18n._(msg`Clear filters`)}
                    onClick={clearAll}
                    size="small"
                    variant="outlined"
                  />
                )}
              </FilterEnd>
            </FilterRow>
          </FilterBar>
        )}
        <Main>
          {partners.length === 0 ? (
            <Offer>
              <Heading as="h3" size="sm" weight="light">
                {i18n._(msg`Let us *match* you`)}
              </Heading>
              <Body muted size="md">
                {i18n._(
                  msg`Share your project in a few minutes. We pair you with a certified partner who fits.`,
                )}
              </Body>
              <OfferAction>{matchCta}</OfferAction>
            </Offer>
          ) : regions.length === 0 ? (
            <Offer>
              <Heading as="h3" size="sm" weight="light">
                {i18n._(msg`No partners match your filters`)}
              </Heading>
              <Body muted size="md">
                {i18n._(msg`Try removing some filters or browse all partners.`)}
              </Body>
              <OfferAction>
                <Button
                  label={i18n._(msg`Clear filters`)}
                  onClick={clearAll}
                  size="small"
                  variant="outlined"
                />
              </OfferAction>
            </Offer>
          ) : (
            <Regions
              data-returning={isReturning ? '' : undefined}
              key={`${view}|${listKey}`}
              onClickCapture={markPartnerOpened}
            >
              {regions.map(([region, regionPartners]) => (
                <Region
                  aria-labelledby={`${toRegionId(region)}-title`}
                  data-region={region}
                  id={toRegionId(region)}
                  key={region}
                  role="region"
                >
                  <RegionHeader>
                    <RegionTitle id={`${toRegionId(region)}-title`}>
                      {labelOf(region)}
                    </RegionTitle>
                    <RegionCount>{regionPartners.length}</RegionCount>
                  </RegionHeader>
                  {view === 'list' ? (
                    <RowList>
                      {regionPartners.map((partner, index) => (
                        <li key={partner.slug}>
                          <PartnersStageCraftRow
                            index={index}
                            partner={partner}
                          />
                        </li>
                      ))}
                    </RowList>
                  ) : (
                    <Grid>
                      {regionPartners.map((partner, index) => (
                        <PartnersStageCraftCell
                          index={index}
                          key={partner.slug}
                          partner={partner}
                          region={region === OTHER_REGION ? null : region}
                        />
                      ))}
                    </Grid>
                  )}
                </Region>
              ))}
            </Regions>
          )}
        </Main>
      </Frame>
    </SectionShell>
  );
}
