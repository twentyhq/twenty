import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import NextImage from 'next/image';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AppStory } from '@/apps-marketplace/AppStory';
import { ArrowUpRight } from '@/icons';
import { collectPartnerLinks } from '@/partners-marketplace/collect-partner-links';
import { formatUsdRate } from '@/partners-marketplace/format-usd-rate';
import { isSafeHttpUrl } from '@/partners-marketplace/is-safe-http-url';
import { MARKETPLACE_COPY } from '@/partners-marketplace/marketplace-copy';
import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { PARTNER_SCOPE_LABELS } from '@/partners-marketplace/partner-scope-labels';
import { SERVED_GEO_LABELS } from '@/partners-marketplace/served-geo-labels';
import { SPOKEN_LANGUAGE_LABELS } from '@/partners-marketplace/spoken-language-labels';
import { titleCaseFallback } from '@/partners-marketplace/title-case-fallback';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  color,
  DURATION,
  EASING,
  fontFamily,
  mediaUp,
  MENU_HEIGHT_PX,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import {
  Body,
  Button,
  ExternalLink,
  Field,
  Heading,
  SectionShell,
  SectionStack,
  Signoff,
} from '@/ui';

import { PartnerCard } from './PartnerCard';
import { PartnerMark } from './PartnerMark';
import { partnerBaseRegion } from './partner-base-region';
import { RegionMapPoint } from './RegionMapPoint';

// The partner's region: the same still as its directory card
// (public/images/partners/regions), dashes in the region's accent on black like
// the customer story covers, with the partner's place on it.
const MapBand = styled.div`
  background-color: ${color('black')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  height: 200px;
  overflow: hidden;
  position: relative;

  ${mediaUp('md')} {
    aspect-ratio: 2400 / 787;
    height: auto;
  }
`;

const Header = styled.div`
  align-items: start;
  display: grid;
  gap: ${spacing(5)};
  grid-template-columns: auto minmax(0, 1fr);

  ${mediaUp('md')} {
    align-items: center;
    gap: ${spacing(6)};
  }
`;

const HeaderText = styled.div`
  min-width: 0;

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

// Below md the side column comes after the content, so the header keeps the action.
const HeaderAction = styled.div`
  grid-column: 1 / -1;

  ${mediaUp('md')} {
    display: none;
  }
`;

const SideAction = styled.div`
  display: none;

  ${mediaUp('md')} {
    display: block;
  }
`;

const Columns = styled.div`
  display: grid;
  gap: ${spacing(12)};

  ${mediaUp('md')} {
    align-items: start;
    gap: ${spacing(16)};
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  }
`;

const Main = styled.div`
  min-width: 0;

  & > * + * {
    margin-top: ${spacing(14)};
  }
`;

const Block = styled.div`
  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const Rows = styled.ul`
  list-style: none;
  padding: 0;

  & > li + li {
    border-top: 1px solid ${semanticColor.line};
  }

  & > li {
    padding-block: ${spacing(3)};
  }
`;

const Side = styled.aside`
  & > * + * {
    border-top: 1px solid ${semanticColor.line};
    margin-top: ${spacing(6)};
    padding-top: ${spacing(6)};
  }

  ${mediaUp('md')} {
    position: sticky;
    top: calc(${MENU_HEIGHT_PX}px + ${spacing(8)});
  }
`;

const SideGroup = styled.div`
  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const SideLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(2)};
`;

// Quiet links, as on the app page: muted, with the brand's thin arrow.
const SideLink = styled(ExternalLink)`
  ${typeRampDeclarations('bodySm')}
  align-items: center;
  align-self: flex-start;
  color: ${semanticColor.inkMuted};
  display: inline-flex;
  font-family: ${fontFamily('sans')};
  gap: ${spacing(1.5)};
  overflow-wrap: anywhere;
  text-decoration: none;
  transition: color ${DURATION.xxs} ${EASING.gentle};

  & > svg {
    color: ${semanticColor.inkSubtle};
    flex-shrink: 0;
  }

  &:hover,
  &:hover > svg {
    color: ${semanticColor.ink};
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 2px;
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const RelatedGrid = styled.div`
  display: grid;
  gap: ${spacing(3)};
  grid-template-columns: minmax(0, 1fr);

  ${mediaUp('sm')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${mediaUp('md')} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const RELATED_COUNT = 3;

type PartnerDetailProps = {
  matchCta: ReactNode;
  // The directory, for a row of partners based in the same region.
  partners: readonly MarketplacePartner[];
  partner: MarketplacePartner;
};

export function PartnerDetail({
  matchCta,
  partners,
  partner,
}: PartnerDetailProps) {
  const i18n = getServerI18n();
  const baseRegion = partnerBaseRegion(partner);
  const place = [
    partner.city,
    partner.country ? titleCaseFallback(partner.country) : '',
  ]
    .filter(Boolean)
    .join(', ');
  const regions = partner.region
    .map((served) => i18n._(SERVED_GEO_LABELS[served]))
    .join(', ');
  const languages = partner.languagesSpoken
    .map((language) =>
      language in SPOKEN_LANGUAGE_LABELS
        ? i18n._(SPOKEN_LANGUAGE_LABELS[language])
        : titleCaseFallback(language),
    )
    .join(', ');
  const hourly = formatUsdRate(partner.hourlyRateUsd);
  const minimum = formatUsdRate(partner.projectBudgetMinUsd);
  const links = collectPartnerLinks(partner.links);
  const scopes = partner.partnerScope.map((scope) =>
    scope in PARTNER_SCOPE_LABELS
      ? i18n._(PARTNER_SCOPE_LABELS[scope])
      : titleCaseFallback(scope),
  );
  const skills = [
    ...new Map(
      partner.skills.map((skill) => [skill.trim().toLowerCase(), skill.trim()]),
    ).values(),
  ];
  const others = partners.filter(
    (candidate) => candidate.slug !== partner.slug,
  );
  // Same base region first, then whoever serves it.
  const related = [
    ...others.filter(
      (candidate) => partnerBaseRegion(candidate) === baseRegion,
    ),
    ...others.filter(
      (candidate) =>
        partnerBaseRegion(candidate) !== baseRegion &&
        candidate.region.includes(baseRegion),
    ),
  ].slice(0, RELATED_COUNT);
  const hasCall = isSafeHttpUrl(partner.calendarLink);
  // One primary per screen: the partner's own call when they have one.
  const primary = hasCall ? (
    <Button
      href={partner.calendarLink}
      label={i18n._(msg`Book intro call`)}
      variant="filled"
    />
  ) : (
    matchCta
  );

  return (
    <>
      <SectionShell rhythm="section" scheme="light">
        <SectionStack>
          <MapBand aria-hidden>
            <NextImage
              alt=""
              fill
              priority
              sizes="(max-width: 921px) 100vw, 1440px"
              src={`/images/partners/regions/${baseRegion.toLowerCase()}.webp`}
              style={{ objectFit: 'cover' }}
            />
            <RegionMapPoint partner={partner} />
          </MapBand>
          <Header>
            <PartnerMark
              markUrl={partner.profilePictureUrl}
              name={partner.name}
              sizePx={72}
            />
            <HeaderText>
              <Heading as="h1" size="md" weight="light" wrap="normal">
                {partner.name}
              </Heading>
              {place.length > 0 && (
                <Body muted size="sm">
                  {place}
                </Body>
              )}
            </HeaderText>
            <HeaderAction>{primary}</HeaderAction>
          </Header>
          <Columns>
            <Main>
              <AppStory markdown={partner.description} />
              {(scopes.length > 0 || skills.length > 0) && (
                <Block>
                  <Heading as="h2" size="sm" weight="light">
                    {i18n._(MARKETPLACE_COPY.partnerScopeHeading)}
                  </Heading>
                  {scopes.length > 0 && (
                    <Rows>
                      {scopes.map((scope) => (
                        <li key={scope}>
                          <Body size="sm">{scope}</Body>
                        </li>
                      ))}
                    </Rows>
                  )}
                  {skills.length > 0 && (
                    <Field label={i18n._(msg`Technical skills`)}>
                      <Body muted size="sm">
                        {skills.join(', ')}
                      </Body>
                    </Field>
                  )}
                </Block>
              )}
              {partner.services.length > 0 && (
                <Block>
                  <Heading as="h2" size="sm" weight="light">
                    {i18n._(msg`Services`)}
                  </Heading>
                  <Rows>
                    {partner.services.map((service) => (
                      <li key={service.title}>
                        <Body size="sm" weight="medium">
                          {service.title}
                        </Body>
                        <Body muted size="sm">
                          {service.description}
                        </Body>
                      </li>
                    ))}
                  </Rows>
                </Block>
              )}
              {partner.portfolio.length > 0 && (
                <Block>
                  <Heading as="h2" size="sm" weight="light">
                    {i18n._(msg`Case studies`)}
                  </Heading>
                  <Rows>
                    {partner.portfolio.map((caseStudy) => (
                      <li key={`${caseStudy.client}-${caseStudy.title}`}>
                        <Body muted size="xs">
                          {caseStudy.client}
                        </Body>
                        <Body size="sm" weight="medium">
                          {caseStudy.title}
                        </Body>
                      </li>
                    ))}
                  </Rows>
                </Block>
              )}
            </Main>
            <Side aria-label={i18n._(msg`Partner facts and contact`)}>
              <SideGroup>
                {place.length > 0 && (
                  <Field label={i18n._(msg`Based in`)}>
                    <Body size="sm">{place}</Body>
                  </Field>
                )}
                {regions.length > 0 && (
                  <Field label={i18n._(msg`Regions served`)}>
                    <Body size="sm">{regions}</Body>
                  </Field>
                )}
                {languages.length > 0 && (
                  <Field label={i18n._(msg`Languages`)}>
                    <Body size="sm">{languages}</Body>
                  </Field>
                )}
                <SideAction>{primary}</SideAction>
              </SideGroup>
              {(isDefined(hourly) ||
                (isDefined(minimum) && minimum !== '$0')) && (
                <SideGroup>
                  {isDefined(hourly) && (
                    <Field label={i18n._(msg`Hourly`)}>
                      <Body size="sm">{i18n._(msg`${hourly}/hr`)}</Body>
                    </Field>
                  )}
                  {isDefined(minimum) && minimum !== '$0' && (
                    <Field label={i18n._(msg`Project minimum`)}>
                      <Body size="sm">{minimum}</Body>
                    </Field>
                  )}
                </SideGroup>
              )}
              {links.length > 0 && (
                <Field label={i18n._(msg`Reach out`)}>
                  <SideLinks>
                    {links.map((link) => (
                      <SideLink href={link.href} key={link.href}>
                        {link.label}
                        <ArrowUpRight />
                      </SideLink>
                    ))}
                  </SideLinks>
                </Field>
              )}
            </Side>
          </Columns>
          {related.length > 0 && (
            <Block>
              <Heading as="h2" size="sm" weight="light">
                {i18n._(
                  msg`More partners in ${i18n._(SERVED_GEO_LABELS[baseRegion])}`,
                )}
              </Heading>
              <RelatedGrid>
                {related.map((candidate) => (
                  <PartnerCard key={candidate.slug} partner={candidate} />
                ))}
              </RelatedGrid>
            </Block>
          )}
        </SectionStack>
      </SectionShell>
      <Signoff
        body={i18n._(
          msg`Tell us what you need and we'll match you with a certified Twenty partner.`,
        )}
        heading={i18n._(msg`Didn't find the *right partner*?`)}
        scheme="dark"
      >
        {matchCta}
      </Signoff>
    </>
  );
}
