import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { ArrowLeft, ArrowUpRight } from '@/icons';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import { SITE_URLS } from '@/platform/site-urls';
import {
  color,
  DURATION,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  MENU_HEIGHT_PX,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';
import { Button, ExternalLink, Heading, SectionShell, Signoff } from '@/ui';

import { AppsStageAppCards } from './AppsStageAppCards';
import { AppsStageAppIcon } from './AppsStageAppIcon';
import { AppsStageApplyDock } from './AppsStageApplyDock';
import { AppsStageAppStory } from './AppsStageAppStory';
import { type AppsStageAppContent } from './apps-stage-app-content';
import { APPS_STAGE_BETA_APP_NAMES } from './apps-stage-beta-apps';
import { APPS_STAGE_CRAFT_COLUMN } from './apps-stage-craft-column';
import { getAppsStagePastel } from './apps-stage-pastels';
import { buildAppInstallUrl } from './build-app-install-url';
import { type MarketplaceAppAdditions } from './fetch-marketplace-app-additions';
import {
  type MarketplaceApp,
  type MarketplaceAppDetail,
} from './marketplace-app';

// PROTOTYPE (?direction=e): an app's own page. Laid out like Raycast's
// extension pages (compact header, tabs, a side column of facts), with
// Profound's scene of Twenty and the app joined as the first media tile.
const Frame = styled.div`
  padding-block: ${spacing(10)} ${spacing(16)};
  ${APPS_STAGE_CRAFT_COLUMN}

  & > * + * {
    margin-top: ${spacing(10)};
  }

  /* A detail page reads narrow: everything holds to 1064px (680 text + 64
     gap + 320 side), centred in the site column. */
  & > * {
    margin-inline: auto;
    max-width: 1064px;
  }

  ${mediaUp('md')} {
    padding-block: ${spacing(14)} ${spacing(24)};
  }
`;

const Rise = styled.div`
  animation: apps-stage-app-rise ${DURATION.xl} ${EASING.standard} backwards;
  animation-delay: var(--apps-stage-delay, 0ms);

  @keyframes apps-stage-app-rise {
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

const Cover = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  overflow: hidden;
`;

// The screenshot whole, at its own ratio: gallery images are made as covers.
// At its own ratio on small screens; a 320px band from md so the app's name
// and line stay above the fold.
const CoverImage = styled.img`
  display: block;
  height: auto;
  width: 100%;

  ${mediaUp('md')} {
    height: 320px;
    object-fit: cover;
    object-position: center;
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
    grid-template-columns: auto minmax(0, 1fr);
  }
`;

const HeaderText = styled.div`
  min-width: 0;

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const Tagline = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.75)};
  line-height: 22px;
  max-width: 640px;
`;

const Meta = styled.div`
  align-items: center;
  color: ${semanticColor.inkMuted};
  display: flex;
  flex-wrap: wrap;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.25)};
  gap: ${spacing(2)} ${spacing(5)};
  padding-top: ${spacing(1)};
`;

const MonoLabel = styled.span`
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.5)};
  letter-spacing: 0.08em;
  line-height: 12px;
  text-transform: uppercase;
`;

const BetaLabel = styled(MonoLabel)`
  border: 1px solid color-mix(in srgb, ${color('yellow')} 32%, transparent);
  border-radius: ${radius(1)};
  color: ${color('yellow')};
  padding: 3px ${spacing(1.5)};
`;

const CategoryLabel = styled(MonoLabel)`
  background-color: color-mix(
    in srgb,
    var(--apps-stage-pastel) 12%,
    transparent
  );
  border-radius: ${radius(1)};
  color: var(--apps-stage-pastel);
  padding: 4px ${spacing(1.5)};
`;

// Install lives in the side column; below md that column comes after the
// content, so the header keeps its own copy there.
const HeaderAction = styled.div`
  grid-column: 1 / -1;

  ${mediaUp('md')} {
    display: none;
  }
`;

const SideAction = styled.div`
  display: none;
  padding-top: ${spacing(2)};

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
  }
`;

const Main = styled.div`
  min-width: 0;

  & > * + * {
    margin-top: ${spacing(10)};
  }
`;

// What the app adds, in the side column, grouped by the product's own sections
// (Data, Interface, Automation and AI, Access) so the site says what the app
// page will show after install. Names when they read; counts otherwise.
// Sections stand apart (20px); a title holds its list close (4px); lines
// keep a 2px breath. The group's own label sits 16px above, like Facts.
const AddsSections = styled.div`
  & > * + * {
    margin-top: ${spacing(5)};
  }
`;

const AddsSection = styled.div`
  & > * + * {
    margin-top: ${spacing(1)};
  }
`;

const AddsTitle = styled.p`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 20px;
`;

const AddsList = styled.ul`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.25)};
  line-height: 20px;
  list-style: none;
  padding: 0;

  & > li {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & > li + li {
    margin-top: ${spacing(0.5)};
  }
`;

const Side = styled.aside`
  animation: apps-stage-app-rise ${DURATION.xl} ${EASING.standard} 180ms
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

const PackageName = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  line-height: 20px;
  overflow-wrap: anywhere;
`;

// Quiet links: muted text and the brand's thin arrow at its own 8px; they
// come up to full ink on hover.
const SideLink = styled(ExternalLink)`
  align-items: center;
  align-self: flex-start;
  color: ${semanticColor.inkMuted};
  display: inline-flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  gap: ${spacing(1.5)};
  line-height: 20px;
  text-decoration: none;
  transition: color ${DURATION.xxs} ${EASING.gentle};

  & > svg {
    color: ${semanticColor.inkSubtle};
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

const SideLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(2)};
`;

const SHOWN_NAMES = 3;
// Developer names (slack-home-opened) are counted, never shown.
const isReadableLabel = (label: string) => !/^[a-z0-9_-]+$/.test(label);

const RELATED_COUNT = 3;

// Related apps close the page as the same card row as /apps' featured apps.
const Related = styled.div`
  padding-top: ${spacing(8)};

  & > * + * {
    margin-top: ${spacing(8)};
  }
`;

const counted = (count: number, one: string, many: string) =>
  count === 0 ? [] : [count === 1 ? one : many];

type AppsStageAppDetailProps = {
  additions: MarketplaceAppAdditions;
  content: AppsStageAppContent;
  app: MarketplaceAppDetail;
  apps: readonly MarketplaceApp[];
  locale: string;
};

export function AppsStageAppDetail({
  additions,
  content,
  app,
  apps,
  locale,
}: AppsStageAppDetailProps) {
  const i18n = getServerI18n();
  const sortedCategories = [
    ...new Set(apps.map((candidate) => candidate.category)),
  ].toSorted((left, right) => left.localeCompare(right));
  const pastel = getAppsStagePastel(app.category, sortedCategories);
  const isBeta = APPS_STAGE_BETA_APP_NAMES.includes(
    app.name.trim().toLowerCase(),
  );
  const others = apps.filter((candidate) => candidate.slug !== app.slug);
  const related = [
    ...others.filter((candidate) => candidate.category === app.category),
    ...others.filter((candidate) => candidate.category !== app.category),
  ].slice(0, RELATED_COUNT);
  const installs =
    additions.installCount === undefined
      ? undefined
      : new Intl.NumberFormat(locale).format(additions.installCount);

  const overview = (
    <>
      {app.aboutDescription !== undefined ? (
        <AppsStageAppStory markdown={app.aboutDescription} pastel={pastel} />
      ) : (
        <Tagline>{app.tagline}</Tagline>
      )}
    </>
  );

  const cover = app.screenshots[0];
  const names = (labels: readonly string[] = []) =>
    labels.filter(isReadableLabel);
  const fieldCount = content.fields?.length ?? 0;
  const functionCount = content.logicFunctions?.length ?? 0;
  const addsSections = [
    {
      id: 'data',
      title: i18n._(msg`Data`),
      lines: [
        ...names(content.objects),
        ...counted(
          fieldCount,
          i18n._(msg`1 field`),
          i18n._(msg`${fieldCount} fields`),
        ),
      ],
    },
    {
      id: 'interface',
      title: i18n._(msg`Interface`),
      lines: [
        ...new Set(
          names([...(content.views ?? []), ...(content.frontComponents ?? [])]),
        ),
      ],
    },
    {
      id: 'automation',
      title: i18n._(msg`Automation and AI`),
      lines: [
        ...names(content.agents),
        ...names(content.skills),
        ...names(content.workflows),
        ...counted(
          functionCount,
          i18n._(msg`1 function`),
          i18n._(msg`${functionCount} functions`),
        ),
      ],
    },
    {
      id: 'access',
      title: i18n._(msg`Access`),
      lines: [
        ...(content.connectionProviders ?? []).map((provider) =>
          i18n._(msg`Connects to ${provider}`),
        ),
        ...(content.roles ?? []),
      ],
    },
  ].filter((section) => section.lines.length > 0);

  return (
    <>
      <SectionShell flushInline rhythm="flush" scheme="dark">
        <Frame>
          <Rise>
            <BackLink href="/apps?direction=e">
              <ArrowLeft />
              {i18n._(msg`All apps`)}
            </BackLink>
          </Rise>

          {cover !== undefined && (
            <Rise style={{ ['--apps-stage-delay' as string]: '30ms' }}>
              <Cover>
                <CoverImage
                  alt={i18n._(msg`${app.name} screenshot`)}
                  src={cover}
                />
              </Cover>
            </Rise>
          )}

          <Rise style={{ ['--apps-stage-delay' as string]: '60ms' }}>
            <Header>
              <AppsStageAppIcon app={app} sizePx={72} />
              <HeaderText>
                <Heading as="h1" size="md" weight="light">
                  {app.name}
                </Heading>
                <Tagline>{app.tagline}</Tagline>
                <Meta>
                  <span>{app.author}</span>
                  {installs !== undefined && (
                    <span>{i18n._(msg`${installs} installs`)}</span>
                  )}
                  {app.category.length > 0 && (
                    <span>
                      <CategoryLabel
                        style={{ ['--apps-stage-pastel' as string]: pastel }}
                      >
                        {app.category}
                      </CategoryLabel>
                    </span>
                  )}
                  {isBeta && (
                    <span>
                      <BetaLabel>{i18n._(msg`Beta`)}</BetaLabel>
                    </span>
                  )}
                </Meta>
              </HeaderText>
              <HeaderAction data-apps-stage-primary="">
                <Button
                  href={buildAppInstallUrl(app.universalIdentifier)}
                  label={i18n._(msg`Install app`)}
                  variant="filled"
                />
              </HeaderAction>
            </Header>
          </Rise>

          <Body>
            <Main>
              <Rise
                style={{ ['--apps-stage-delay' as string]: '140ms' }}
              ></Rise>
              <Rise style={{ ['--apps-stage-delay' as string]: '220ms' }}>
                {overview}
              </Rise>
            </Main>

            <Side>
              <SideGroup>
                <Fact>
                  <SideLabel>{i18n._(msg`Developer`)}</SideLabel>
                  <FactValue>{app.author}</FactValue>
                </Fact>
                {app.latestAvailableVersion !== undefined && (
                  <Fact>
                    <SideLabel>{i18n._(msg`Version`)}</SideLabel>
                    <FactValue>{app.latestAvailableVersion}</FactValue>
                  </Fact>
                )}
                {installs !== undefined && (
                  <Fact>
                    <SideLabel>{i18n._(msg`Installed by`)}</SideLabel>
                    <FactValue>{i18n._(msg`${installs} workspaces`)}</FactValue>
                  </Fact>
                )}
                {app.sourcePackage !== undefined && (
                  <Fact>
                    <SideLabel>{i18n._(msg`Package`)}</SideLabel>
                    <PackageName>{app.sourcePackage}</PackageName>
                  </Fact>
                )}
                <SideAction data-apps-stage-primary="">
                  <Button
                    href={buildAppInstallUrl(app.universalIdentifier)}
                    label={i18n._(msg`Install app`)}
                    variant="filled"
                  />
                </SideAction>
              </SideGroup>

              {addsSections.length > 0 && (
                <SideGroup>
                  <SideLabel>{i18n._(msg`What ${app.name} adds`)}</SideLabel>
                  <AddsSections>
                    {addsSections.map((section) => (
                      <AddsSection key={section.id}>
                        <AddsTitle>{section.title}</AddsTitle>
                        <AddsList>
                          {section.lines.slice(0, SHOWN_NAMES).map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                          {section.lines.length > SHOWN_NAMES && (
                            <li>
                              {i18n._(
                                msg`+${section.lines.length - SHOWN_NAMES} more`,
                              )}
                            </li>
                          )}
                        </AddsList>
                      </AddsSection>
                    ))}
                  </AddsSections>
                </SideGroup>
              )}

              {(app.websiteUrl !== undefined ||
                additions.termsUrl !== undefined ||
                additions.issueReportUrl !== undefined ||
                additions.emailSupport !== undefined) && (
                <SideGroup>
                  <SideLabel>{i18n._(msg`Resources`)}</SideLabel>
                  <SideLinks>
                    {app.websiteUrl !== undefined && (
                      <SideLink href={app.websiteUrl}>
                        {i18n._(msg`Website`)}
                        <ArrowUpRight />
                      </SideLink>
                    )}
                    {additions.termsUrl !== undefined && (
                      <SideLink href={additions.termsUrl}>
                        {i18n._(msg`Terms`)}
                        <ArrowUpRight />
                      </SideLink>
                    )}
                    {additions.issueReportUrl !== undefined && (
                      <SideLink href={additions.issueReportUrl}>
                        {i18n._(msg`Report an issue`)}
                        <ArrowUpRight />
                      </SideLink>
                    )}
                    {additions.emailSupport !== undefined && (
                      <SideLink href={`mailto:${additions.emailSupport}`}>
                        {i18n._(msg`Email support`)}
                        <ArrowUpRight />
                      </SideLink>
                    )}
                  </SideLinks>
                </SideGroup>
              )}
            </Side>
          </Body>

          {related.length > 0 && (
            <Related>
              <Heading as="h2" size="sm" weight="light">
                {i18n._(msg`You might also like`)}
              </Heading>
              <AppsStageAppCards apps={related} />
            </Related>
          )}
        </Frame>
      </SectionShell>

      <AppsStageApplyDock
        action={{
          href: buildAppInstallUrl(app.universalIdentifier),
          label: i18n._(msg`Install app`),
        }}
        label={app.name}
      />

      <Signoff
        body={i18n._(
          msg`Add objects, logic and interface to Twenty, then publish it for every workspace.`,
        )}
        heading={i18n._(msg`Build your own *app*`)}
        scheme="dark"
      >
        <Button
          href={SITE_URLS.docsDevelopers}
          label={i18n._(msg`Read the docs`)}
          variant="filled"
        />
      </Signoff>
    </>
  );
}
