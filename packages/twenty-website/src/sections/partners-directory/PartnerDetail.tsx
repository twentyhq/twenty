import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import {
  type Icon,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
  IconClock,
  IconLanguage,
  IconReceipt,
  IconWorld,
  IconWorldWww,
} from '@tabler/icons-react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AppStory } from '@/apps-marketplace/AppStory';
import { ArrowUpRight } from '@/icons';
import { collectPartnerLinks } from '@/partners-marketplace/collect-partner-links';
import { formatUsdRate } from '@/partners-marketplace/format-usd-rate';
import { isSafeHttpUrl } from '@/partners-marketplace/is-safe-http-url';
import { MARKETPLACE_COPY } from '@/partners-marketplace/marketplace-copy';
import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { type ServedGeo } from '@/partners-marketplace/served-geos';
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
  HERO_COMPOSITION,
  mediaUp,
  MENU_HEIGHT_PX,
  type PaletteToken,
  radius,
  REDUCED_MOTION,
  RHYTHM,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import {
  Body,
  Button,
  ExternalLink,
  Heading,
  SectionShell,
  SectionStack,
  Signoff,
} from '@/ui';
import { BackLink } from '@/ui/BackLink';

import { PartnerCard } from './PartnerCard';
import { PartnerMark } from './PartnerMark';
import { partnerBaseRegion } from './partner-base-region';
import { PartnersGlobe } from './PartnersGlobe';
import { resolvePartnerCoordinates } from './resolve-partner-coordinates';

const MARK_SIZE_PX = 72;

// Each region's colour, as on its directory card still
// (public/images/partners/regions).
const REGION_ACCENT: Record<ServedGeo, PaletteToken> = {
  AFRICA: 'yellow',
  APAC: 'pink',
  EUROPE: 'blue',
  LATAM: 'yellow',
  MENA: 'green',
  US: 'pink',
};

// The partners hero's globe, edge to edge on black as the band's full-bleed
// background, in the region's colour and turned to the partner's city. The
// band is a dark surface, so the menu turns dark over it, as on Product.
const MapFill = styled.div`
  background-color: ${color('black')};
  inset: 0;
  overflow: hidden;
  position: absolute;
`;

// Gives the band its height and holds the mark on its lower edge, as on the
// app page.
const BandRoom = styled.div`
  height: ${spacing(50)};
  position: relative;

  ${mediaUp('md')} {
    height: ${spacing(100)};
  }
`;

// On the band's lower edge at the content's left edge, half over the map. A white ring, the
// mark's own radius, keeps a dark logo apart from the dark map.
const BandMark = styled.div`
  border-radius: ${radius(1.5)};
  box-shadow: 0 0 0 ${spacing(1)} ${color('white')};
  display: flex;
  bottom: 0;
  left: 0;
  position: absolute;
  transform: translateY(50%);
`;

// Under the band, the title sits a fixed step below the mark at every width:
// the section's own top padding minus the mark's half that hangs into it.
const Header = styled.div`
  margin-top: calc(
    ${MARK_SIZE_PX / 2}px + ${spacing(6)} - ${spacing(RHYTHM.section.top.base)}
  );
  max-width: ${HERO_COMPOSITION.bodyMeasurePx}px;

  ${mediaUp('md')} {
    margin-top: calc(
      ${MARK_SIZE_PX / 2}px + ${spacing(6)} - ${spacing(RHYTHM.section.top.md)}
    );
  }

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

// Below md the side column comes after the content, so the header keeps the
// call; from md it heads the side column.
const HeaderAction = styled.div`
  && {
    margin-top: ${spacing(6)};
  }

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
    margin-top: ${spacing(16)};
  }
`;

const Block = styled.div`
  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

// A part of the profile, set like the app page's story: a small sans title,
// then its content, at the story's reading width.
const Part = styled.div`
  max-width: ${HERO_COMPOSITION.bodyMeasurePx}px;

  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

// Items apart by space alone, no rules between them: the app story's steps,
// 8px between list items, 16px between items that carry a title and a line.
const Rows = styled.ul`
  list-style: none;
  padding: 0;

  & > li + li {
    margin-top: ${spacing(4)};
  }

  &[data-dense] > li + li {
    margin-top: ${spacing(2)};
  }
`;

// Groups apart by space alone, no rules between them.
const Side = styled.aside`
  & > * + * {
    margin-top: ${spacing(8)};
  }

  ${mediaUp('md')} {
    position: sticky;
    top: calc(${MENU_HEIGHT_PX}px + ${spacing(8)});
  }
`;

// A fact told by its icon, as the case studies' reading time: the icon
// stands for the label, which stays for screen readers.
const FactRow = styled.div`
  column-gap: ${spacing(3)};
  display: grid;
  grid-template-columns: ${spacing(4)} minmax(0, 1fr);

  /* centred on the text's first line (bodySm) */
  & > svg {
    color: ${color('blue')};
    margin-top: ${spacing(1)};
  }
`;

const Fact = ({
  children,
  icon: FactIcon,
  label,
}: {
  children: ReactNode;
  icon: Icon;
  label: string;
}) => (
  <FactRow aria-label={label} role="group">
    <FactIcon aria-hidden size={16} stroke={1.5} />
    {children}
  </FactRow>
);

// Each link's own mark: the site, or the network it points to.
const linkIcon = (href: string): Icon => {
  const host = new URL(href).hostname;
  if (host.endsWith('linkedin.com')) return IconBrandLinkedin;
  if (host.endsWith('github.com')) return IconBrandGithub;
  if (host === 'x.com' || host.endsWith('twitter.com')) return IconBrandX;
  return IconWorldWww;
};

const SideGroup = styled.div`
  & > * + * {
    margin-top: ${spacing(3)};
  }
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
  const coordinates = resolvePartnerCoordinates(
    partner.city ?? '',
    partner.country ?? '',
  );
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
      <SectionShell
        background={
          <MapFill>
            <PartnersGlobe
              accent={REGION_ACCENT[baseRegion]}
              facing={coordinates ?? undefined}
              partners={[partner]}
            />
          </MapFill>
        }
        fullBleedBackground
        rhythm="flush"
        scheme="dark"
      >
        <BandRoom>
          <BandMark>
            <PartnerMark
              markUrl={partner.profilePictureUrl}
              name={partner.name}
              sizePx={MARK_SIZE_PX}
            />
          </BandMark>
        </BandRoom>
      </SectionShell>
      <SectionShell connectsUp rhythm="section" scheme="light">
        <SectionStack>
          <Header>
            <BackLink href="/partners">{i18n._(msg`All partners`)}</BackLink>
            <Heading as="h1" size="md" weight="light" wrap="normal">
              {partner.name}
            </Heading>
            {place.length > 0 && (
              <Body muted size="sm">
                {place}
              </Body>
            )}
            <HeaderAction>{primary}</HeaderAction>
          </Header>
          <Columns>
            <Main>
              <AppStory markdown={partner.description} />
              {scopes.length > 0 && (
                <Part>
                  <Heading as="h2" family="sans" size="xs" weight="medium">
                    {i18n._(MARKETPLACE_COPY.partnerScopeHeading)}
                  </Heading>
                  <Rows data-dense="">
                    {scopes.map((scope) => (
                      <li key={scope}>
                        <Body size="sm">{scope}</Body>
                      </li>
                    ))}
                  </Rows>
                </Part>
              )}
              {partner.services.length > 0 && (
                <Part>
                  <Heading as="h2" family="sans" size="xs" weight="medium">
                    {i18n._(msg`Services`)}
                  </Heading>
                  <Rows>
                    {partner.services.map((service) => (
                      <li key={service.title}>
                        <Body size="sm">{service.title}</Body>
                        <Body muted size="sm">
                          {service.description}
                        </Body>
                      </li>
                    ))}
                  </Rows>
                </Part>
              )}
              {partner.portfolio.length > 0 && (
                <Part>
                  <Heading as="h2" family="sans" size="xs" weight="medium">
                    {i18n._(msg`Case studies`)}
                  </Heading>
                  <Rows>
                    {partner.portfolio.map((caseStudy) => (
                      <li key={`${caseStudy.client}-${caseStudy.title}`}>
                        <Body muted size="xs">
                          {caseStudy.client}
                        </Body>
                        <Body size="sm">{caseStudy.title}</Body>
                      </li>
                    ))}
                  </Rows>
                </Part>
              )}
            </Main>
            <Side aria-label={i18n._(msg`Partner facts and contact`)}>
              <SideAction>{primary}</SideAction>
              <SideGroup>
                {regions.length > 0 && (
                  <Fact icon={IconWorld} label={i18n._(msg`Regions served`)}>
                    <Body size="sm">{regions}</Body>
                  </Fact>
                )}
                {languages.length > 0 && (
                  <Fact icon={IconLanguage} label={i18n._(msg`Languages`)}>
                    <Body size="sm">{languages}</Body>
                  </Fact>
                )}
              </SideGroup>
              {(isDefined(hourly) ||
                (isDefined(minimum) && minimum !== '$0')) && (
                <SideGroup>
                  {isDefined(hourly) && (
                    <Fact icon={IconClock} label={i18n._(msg`Hourly rate`)}>
                      <Body size="sm">{i18n._(msg`${hourly} an hour`)}</Body>
                    </Fact>
                  )}
                  {isDefined(minimum) && minimum !== '$0' && (
                    <Fact
                      icon={IconReceipt}
                      label={i18n._(msg`Project minimum`)}
                    >
                      <Body size="sm">
                        {i18n._(msg`Projects from ${minimum}`)}
                      </Body>
                    </Fact>
                  )}
                </SideGroup>
              )}
              {links.length > 0 && (
                <SideGroup aria-label={i18n._(msg`Reach out`)} role="group">
                  {links.map((link) => (
                    <Fact
                      icon={linkIcon(link.href)}
                      key={link.href}
                      label={link.label}
                    >
                      <SideLink href={link.href}>
                        {link.label}
                        <ArrowUpRight />
                      </SideLink>
                    </Fact>
                  ))}
                </SideGroup>
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
