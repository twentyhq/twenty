import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AppsStageAppStory } from '@/apps-marketplace/AppsStageAppStory';
import { ArrowLeft, ArrowUpRight } from '@/icons';
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
import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import {
  color,
  containerColumnDeclarations,
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
import {
  Button,
  ExternalLink,
  FloatingDock,
  Heading,
  SectionShell,
  Signoff,
} from '@/ui';
import { cssVariableStyle } from '@/ui/css-variable-style';

import { PartnersStageCraftCell } from './PartnersStageCraftCell';
import { PARTNERS_STAGE_REGION_ACCENT } from './partners-stage-region-accent';
import { PARTNERS_STAGE_REGION_CENTER } from './partners-stage-region-center.data';
import { PartnersStageMark } from './PartnersStageMark';
import { PartnersStageRegionCover } from './PartnersStageRegionCover';
import { PartnersStageReturnToDirectory } from './PartnersStageReturnToDirectory';
import { resolvePartnerCoordinates } from './resolve-partner-coordinates';
import { worldRegionOfCell } from './world-region-of-cell';

const Frame = styled.div`
  padding-block: ${spacing(10)} ${spacing(16)};
  ${containerColumnDeclarations()}

  & > * + * {
    margin-top: ${spacing(10)};
  }

  & > * {
    margin-inline: auto;
    max-width: 1064px;
  }

  ${mediaUp('md')} {
    padding-block: ${spacing(14)} ${spacing(24)};
  }
`;

const Rise = styled.div`
  animation: partners-stage-detail-rise ${DURATION.xl} ${EASING.standard}
    backwards;
  animation-delay: var(--partners-stage-delay, 0ms);

  @keyframes partners-stage-detail-rise {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const BackLink = styled(LocalizedLink)`
  align-items: center;
  color: ${semanticColor.inkMuted};
  display: inline-flex;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  gap: ${spacing(2)};
  letter-spacing: 0.08em;
  text-decoration: none;
  text-transform: uppercase;
  transition: color ${DURATION.xxs} ${EASING.gentle};

  & > svg {
    height: 14px;
    transition: transform ${DURATION.xs} ${EASING.standard};
    width: 14px;
  }

  &:hover {
    color: ${semanticColor.ink};
  }

  &:hover > svg {
    transform: translateX(-3px);
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 4px;
  }

  ${REDUCED_MOTION} {
    transition: none;

    & > svg {
      transition: none;
    }
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

const Meta = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.75)};
  line-height: 22px;
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

const Body = styled.div`
  display: grid;
  gap: ${spacing(12)};

  ${mediaUp('md')} {
    align-items: start;
    gap: ${spacing(16)};
    grid-template-columns: minmax(0, 680px) 320px;
    justify-content: space-between;
  }
`;

const Main = styled.div`
  min-width: 0;

  & > * + * {
    margin-top: ${spacing(14)};
  }
`;

const Block = styled.div`
  max-width: 680px;

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const BlockTitle = styled.h2`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(6)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: -0.012em;
  line-height: 32px;
`;

const PlainList = styled.ul`
  color: ${color('white-80')};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.75)};
  line-height: 24px;
  list-style: none;
  padding: 0;

  & > li + li {
    border-top: 1px solid ${semanticColor.line};
  }

  & > li {
    padding-block: ${spacing(3)};
  }
`;

const ItemTitle = styled.p`
  color: ${semanticColor.ink};
  font-weight: ${FONT_WEIGHT.medium};
`;

const ItemText = styled.p`
  color: ${semanticColor.inkMuted};
  font-size: ${fontSize(3.5)};
  line-height: 22px;
`;

const Skills = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  line-height: 22px;
`;

const Side = styled.aside`
  animation: partners-stage-detail-rise ${DURATION.xl} ${EASING.standard} 180ms
    backwards;

  & > * + * {
    border-top: 1px solid ${semanticColor.line};
    margin-top: ${spacing(6)};
    padding-top: ${spacing(6)};
  }

  ${mediaUp('md')} {
    position: sticky;
    top: ${MENU_HEIGHT_PX + 32}px;
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

// The card's dotted map, framed small: where the partner is based.
const MapFrame = styled.div`
  aspect-ratio: 16 / 10;
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  overflow: hidden;
  position: relative;
`;

// The /apps cards' row: three side by side, 32px under the heading.
const Related = styled.div`
  padding-top: ${spacing(10)};

  & > * + * {
    margin-top: ${spacing(8)};
  }
`;

const RelatedGrid = styled.div`
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

const RELATED_COUNT = 3;

const SideGroup = styled.div`
  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const SideLabel = styled.p`
  color: ${semanticColor.inkSubtle};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.75)};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Fact = styled.div`
  & > * + * {
    margin-top: ${spacing(1.5)};
  }
`;

const FactValue = styled.p`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  line-height: 20px;
`;

const SideLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(2)};
`;

// Quiet links, as on the app page: muted, with the brand's thin arrow.
const SideLink = styled(ExternalLink)`
  align-items: center;
  align-self: flex-start;
  color: ${semanticColor.inkMuted};
  display: inline-flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  gap: ${spacing(1.5)};
  line-height: 20px;
  overflow-wrap: anywhere;
  text-decoration: none;
  transition: color ${DURATION.xxs} ${EASING.gentle};

  & > svg {
    color: ${semanticColor.inkSubtle};
    flex-shrink: 0;
    transition:
      color ${DURATION.xxs} ${EASING.gentle},
      transform ${DURATION.xs} ${EASING.standard};
  }

  &:hover {
    color: ${semanticColor.ink};
  }

  &:hover > svg {
    color: ${semanticColor.ink};
    transform: translate(2px, -2px);
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 2px;
  }

  ${REDUCED_MOTION} {
    transition: none;

    & > svg {
      transition: none;
    }
  }
`;

type PartnersStagePartnerDetailProps = {
  matchCta: ReactNode;
  // The directory, for a row of partners based in the same region.
  partners: readonly MarketplacePartner[];
  partner: MarketplacePartner;
};

export function PartnersStagePartnerDetail({
  matchCta,
  partners,
  partner,
}: PartnersStagePartnerDetailProps) {
  const i18n = getServerI18n();
  const base = resolvePartnerCoordinates(
    partner.city ?? '',
    partner.country ?? '',
    partner.region,
  );
  const baseRegion =
    (isDefined(base) ? worldRegionOfCell(base[0], base[1]) : null) ??
    partner.region[0] ??
    'EUROPE';
  const accent = PARTNERS_STAGE_REGION_ACCENT[baseRegion];
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
  const regionOf = (candidate: MarketplacePartner) => {
    const coordinates = resolvePartnerCoordinates(
      candidate.city ?? '',
      candidate.country ?? '',
      candidate.region,
    );
    return (
      (isDefined(coordinates)
        ? worldRegionOfCell(coordinates[0], coordinates[1])
        : null) ??
      candidate.region[0] ??
      null
    );
  };
  const others = partners.filter(
    (candidate) => candidate.slug !== partner.slug,
  );
  // Same base region first, then whoever serves it.
  const related = [
    ...others.filter((candidate) => regionOf(candidate) === baseRegion),
    ...others.filter(
      (candidate) =>
        regionOf(candidate) !== baseRegion &&
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
      <SectionShell flushInline rhythm="flush" scheme="dark">
        <Frame>
          <Rise>
            <PartnersStageReturnToDirectory>
              <BackLink href="/partners">
                <ArrowLeft />
                {i18n._(msg`All partners`)}
              </BackLink>
            </PartnersStageReturnToDirectory>
          </Rise>
          <Rise style={cssVariableStyle({ '--partners-stage-delay': '60ms' })}>
            <Header>
              <PartnersStageMark
                markUrl={partner.profilePictureUrl}
                name={partner.name}
                sizePx={72}
                tone="dark"
              />
              <HeaderText>
                <Heading as="h1" size="md" weight="light" wrap="normal">
                  {partner.name}
                </Heading>
                {place.length > 0 && <Meta>{place}</Meta>}
              </HeaderText>
              <HeaderAction data-dock-anchor="">{primary}</HeaderAction>
            </Header>
          </Rise>
          <Body>
            <Main>
              <Rise
                style={cssVariableStyle({ '--partners-stage-delay': '140ms' })}
              >
                <AppsStageAppStory
                  markdown={partner.description}
                  pastel={color(accent)}
                />
              </Rise>
              {(scopes.length > 0 || skills.length > 0) && (
                <Block>
                  <BlockTitle>
                    {i18n._(MARKETPLACE_COPY.partnerScopeHeading)}
                  </BlockTitle>
                  {scopes.length > 0 && (
                    <PlainList>
                      {scopes.map((scope) => (
                        <li key={scope}>{scope}</li>
                      ))}
                    </PlainList>
                  )}
                  {skills.length > 0 && (
                    <Fact>
                      <SideLabel>{i18n._(msg`Technical skills`)}</SideLabel>
                      <Skills>{skills.join(', ')}</Skills>
                    </Fact>
                  )}
                </Block>
              )}
              {partner.services.length > 0 && (
                <Block>
                  <BlockTitle>{i18n._(msg`Services`)}</BlockTitle>
                  <PlainList>
                    {partner.services.map((service) => (
                      <li key={service.title}>
                        <ItemTitle>{service.title}</ItemTitle>
                        <ItemText>{service.description}</ItemText>
                      </li>
                    ))}
                  </PlainList>
                </Block>
              )}
              {partner.portfolio.length > 0 && (
                <Block>
                  <BlockTitle>{i18n._(msg`Case studies`)}</BlockTitle>
                  <PlainList>
                    {partner.portfolio.map((caseStudy) => (
                      <li key={`${caseStudy.client}-${caseStudy.title}`}>
                        <SideLabel>{caseStudy.client}</SideLabel>
                        <ItemTitle>{caseStudy.title}</ItemTitle>
                      </li>
                    ))}
                  </PlainList>
                </Block>
              )}
            </Main>
            <Side aria-label={i18n._(msg`Partner facts and contact`)}>
              <SideGroup>
                <MapFrame aria-hidden>
                  <PartnersStageRegionCover
                    accent={accent}
                    center={base ?? PARTNERS_STAGE_REGION_CENTER[baseRegion]}
                    hasBase={isDefined(base)}
                  />
                </MapFrame>
                {place.length > 0 && (
                  <Fact>
                    <SideLabel>{i18n._(msg`Based in`)}</SideLabel>
                    <FactValue>{place}</FactValue>
                  </Fact>
                )}
                {regions.length > 0 && (
                  <Fact>
                    <SideLabel>{i18n._(msg`Regions served`)}</SideLabel>
                    <FactValue>{regions}</FactValue>
                  </Fact>
                )}
                {languages.length > 0 && (
                  <Fact>
                    <SideLabel>{i18n._(msg`Languages`)}</SideLabel>
                    <FactValue>{languages}</FactValue>
                  </Fact>
                )}
                <SideAction data-dock-anchor="">{primary}</SideAction>
              </SideGroup>
              {(isDefined(hourly) ||
                (isDefined(minimum) && minimum !== '$0')) && (
                <SideGroup>
                  {isDefined(hourly) && (
                    <Fact>
                      <SideLabel>{i18n._(msg`Hourly`)}</SideLabel>
                      <FactValue>{i18n._(msg`${hourly}/hr`)}</FactValue>
                    </Fact>
                  )}
                  {isDefined(minimum) && minimum !== '$0' && (
                    <Fact>
                      <SideLabel>{i18n._(msg`Project minimum`)}</SideLabel>
                      <FactValue>{minimum}</FactValue>
                    </Fact>
                  )}
                </SideGroup>
              )}
              {links.length > 0 && (
                <SideGroup>
                  <SideLabel>{i18n._(msg`Reach out`)}</SideLabel>
                  <SideLinks>
                    {links.map((link) => (
                      <SideLink href={link.href} key={link.href}>
                        {link.label}
                        <ArrowUpRight />
                      </SideLink>
                    ))}
                  </SideLinks>
                </SideGroup>
              )}
            </Side>
          </Body>
          {related.length > 0 && (
            <Related>
              <Heading as="h2" size="sm" weight="light">
                {i18n._(
                  msg`More partners in ${i18n._(SERVED_GEO_LABELS[baseRegion])}`,
                )}
              </Heading>
              <RelatedGrid>
                {related.map((candidate, index) => (
                  <PartnersStageCraftCell
                    index={index}
                    key={candidate.slug}
                    partner={candidate}
                    region={regionOf(candidate)}
                  />
                ))}
              </RelatedGrid>
            </Related>
          )}
        </Frame>
      </SectionShell>
      {hasCall && (
        <FloatingDock
          action={
            <Button
              href={partner.calendarLink}
              label={i18n._(msg`Book intro call`)}
              variant="filled"
            />
          }
          label={partner.name}
        />
      )}
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
