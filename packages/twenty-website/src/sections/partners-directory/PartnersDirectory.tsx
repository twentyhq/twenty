'use client';

import { msg, plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { type ReactNode, useMemo } from 'react';

import { type FilterCriteria } from '@/partners-marketplace/filter-criteria';
import { filterPartners } from '@/partners-marketplace/filter-partners';
import { MARKETPLACE_COPY } from '@/partners-marketplace/marketplace-copy';
import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { PARTNER_SCOPE_LABELS } from '@/partners-marketplace/partner-scope-labels';
import { PARTNER_SCOPES } from '@/partners-marketplace/partner-scopes';
import { SERVED_GEO_LABELS } from '@/partners-marketplace/served-geo-labels';
import { SERVED_GEOS } from '@/partners-marketplace/served-geos';
import { SPOKEN_LANGUAGE_LABELS } from '@/partners-marketplace/spoken-language-labels';
import { SPOKEN_LANGUAGES } from '@/partners-marketplace/spoken-languages';
import { PARTNER_DIRECTORY_ANCHOR_ID } from '@/platform/routing/partner-directory-anchor-id';
import { mediaUp, radius, semanticColor, spacing } from '@/tokens';
import {
  Body,
  Eyebrow,
  FilterBar,
  FilterEmptyState,
  type FilterFacet,
  Heading,
  SectionIntro,
  SectionShell,
  SectionStack,
  useUrlFilters,
} from '@/ui';

import { PartnerCard } from './PartnerCard';

const Header = styled.div`
  max-width: 640px;
`;

// Three cards side by side from md, with the /apps cards' spacing.
const Grid = styled.div`
  display: grid;
  gap: ${spacing(3)};
  grid-template-columns: minmax(0, 1fr);

  /* Fixed tracks: a short row keeps its cards at the row's width. */
  ${mediaUp('sm')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${mediaUp('md')} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

// The URL params the production directory already used, and the values each
// one accepts.
const PARTNER_FILTER_VALUES = {
  regions: SERVED_GEOS,
  languages: SPOKEN_LANGUAGES,
  categories: PARTNER_SCOPES,
};

// A facet lists only the values some partner has, in the vocabulary's order.
const presentValues = <Value extends string>(
  vocabulary: readonly Value[],
  partners: readonly MarketplacePartner[],
  read: (partner: MarketplacePartner) => readonly Value[],
): Value[] => {
  const present = new Set(partners.flatMap(read));
  return vocabulary.filter((value) => present.has(value));
};

// The filters open the list: they sit closer to the intro than the section's
// 80px, at SectionStack's own mobile step, so a small button does not float
// in the gap. Doubled class: wins over SectionStack's child margin.
const Listing = styled.div`
  && {
    margin-top: ${spacing(10)};
  }
`;

// The production directory's spacing between the filters and the results.
const Results = styled.div`
  margin-top: ${spacing(6)};
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

type PartnersDirectoryProps = {
  matchCta: ReactNode;
  partners: readonly MarketplacePartner[];
};

export function PartnersDirectory({
  matchCta,
  partners,
}: PartnersDirectoryProps) {
  const { i18n } = useLingui();
  const { clearAll, hasAny, selected, toggle } = useUrlFilters(
    PARTNER_FILTER_VALUES,
  );

  const criteria: FilterCriteria = selected;
  const visiblePartners = useMemo(
    () => filterPartners(partners, criteria),
    [partners, criteria],
  );

  const facets: FilterFacet[] = [
    {
      key: 'regions',
      label: i18n._(msg`Regions`),
      options: presentValues(SERVED_GEOS, partners, (p) => p.region).map(
        (value) => ({ label: i18n._(SERVED_GEO_LABELS[value]), value }),
      ),
      selected: criteria.regions,
    },
    {
      key: 'languages',
      label: i18n._(msg`Languages`),
      options: presentValues(
        SPOKEN_LANGUAGES,
        partners,
        (p) => p.languagesSpoken,
      ).map((value) => ({
        label: i18n._(SPOKEN_LANGUAGE_LABELS[value]),
        value,
      })),
      selected: criteria.languages,
    },
    {
      key: 'categories',
      label: i18n._(MARKETPLACE_COPY.partnerScopeHeading),
      options: presentValues(
        PARTNER_SCOPES,
        partners,
        (p) => p.partnerScope,
      ).map((value) => ({ label: i18n._(PARTNER_SCOPE_LABELS[value]), value })),
      selected: criteria.categories,
    },
  ];

  const total = partners.length;
  const resultCount = hasAny
    ? i18n._(msg`${visiblePartners.length} of ${total} partners`)
    : i18n._(msg`${plural(total, { one: '# partner', other: '# partners' })}`);

  return (
    <SectionShell rhythm="section" scheme="light">
      <SectionStack>
        <Header id={PARTNER_DIRECTORY_ANCHOR_ID} tabIndex={-1}>
          <SectionIntro>
            <Eyebrow>{i18n._(msg`Directory`)}</Eyebrow>
            <Heading as="h2" size="lg" weight="light">
              {i18n._(msg`Browse the *certified partners*`)}
            </Heading>
            <Body muted size="md">
              {i18n._(
                msg`Read a profile and book a call with the partner yourself.`,
              )}
            </Body>
          </SectionIntro>
        </Header>
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
        ) : (
          <Listing>
            <FilterBar
              ariaLabel={i18n._(msg`Filter partners`)}
              facets={facets}
              onClearAll={clearAll}
              onToggle={toggle}
              resultCount={resultCount}
            />
            <Results>
              {visiblePartners.length === 0 ? (
                <FilterEmptyState
                  onClearAll={clearAll}
                  title={i18n._(msg`No partners match your filters`)}
                />
              ) : (
                <Grid>
                  {visiblePartners.map((partner) => (
                    <PartnerCard key={partner.slug} partner={partner} />
                  ))}
                </Grid>
              )}
            </Results>
          </Listing>
        )}
      </SectionStack>
    </SectionShell>
  );
}
