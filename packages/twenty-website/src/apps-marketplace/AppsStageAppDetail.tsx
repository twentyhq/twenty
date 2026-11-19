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
import { Button, ExternalLink, Heading, SectionShell } from '@/ui';

import { AppsStageAppIcon } from './AppsStageAppIcon';
import { AppsStageApplyDock } from './AppsStageApplyDock';
import { AppsStageAppStory } from './AppsStageAppStory';
import { AppsStageCraftClosing } from './AppsStageCraftClosing';
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
  border-inline: 1px solid ${semanticColor.line};
  padding: ${spacing(10)} ${spacing(4)} ${spacing(16)};
  ${APPS_STAGE_CRAFT_COLUMN}

  & > * + * {
    margin-top: ${spacing(10)};
  }

  ${mediaUp('md')} {
    padding: ${spacing(14)} ${spacing(12)} ${spacing(24)};
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
const CoverImage = styled.img`
  display: block;
  height: auto;
  width: 100%;
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
    grid-template-columns: minmax(0, 1fr) 260px;
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
const AddsSections = styled.div`
  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const AddsSection = styled.div`
  & > * + * {
    margin-top: ${spacing(1.5)};
  }
`;

const AddsTitle = styled.p`
  align-items: center;
  color: ${semanticColor.ink};
  display: flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  font-weight: ${FONT_WEIGHT.medium};
  gap: ${spacing(2)};
  line-height: 20px;

  &::before {
    background-color: var(--apps-stage-section-color);
    border-radius: ${radius(0.5)};
    content: '';
    flex-shrink: 0;
    height: 6px;
    width: 6px;
  }
`;

const AddsList = styled.ul`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.25)};
  line-height: 20px;
  list-style: none;
  padding: 0 0 0 ${spacing(3.5)};

  & > li {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

const RelatedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(1)};
  margin-inline: calc(${spacing(2)} * -1);
`;

// The site's hover, as on the catalogue cells: a fill slides in from the left.
const RelatedItem = styled(LocalizedLink)`
  align-items: center;
  border-radius: ${radius(2)};
  color: inherit;
  display: grid;
  gap: ${spacing(3)};
  grid-template-columns: auto minmax(0, 1fr);
  isolation: isolate;
  overflow: hidden;
  padding: ${spacing(2)};
  position: relative;
  text-decoration: none;

  &::before {
    background-color: ${color('white-5')};
    content: '';
    inset: 0;
    position: absolute;
    transform: translateX(-101%);
    transition: transform ${DURATION.md} ${EASING.standard};
    z-index: -1;
  }

  &:is(:hover, :focus-visible)::before {
    transform: translateX(0);
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: -1px;
  }

  ${REDUCED_MOTION} {
    &::before {
      transition: none;
    }
  }
`;

const RelatedText = styled.span`
  min-width: 0;
`;

const RelatedName = styled.span`
  color: ${semanticColor.ink};
  display: block;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 18px;
`;

const RelatedTagline = styled.span`
  color: ${semanticColor.inkMuted};
  display: block;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
  line-height: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SHOWN_NAMES = 3;
// Developer names (slack-home-opened) are counted, never shown.
const isReadableLabel = (label: string) => !/^[a-z0-9_-]+$/.test(label);

// The product's section colours, taken from the brief's pastel set.
const SECTION_COLORS = {
  data: 'oklch(78.4% 0.09 232.9)',
  interface: 'oklch(77.4% 0.115 293.7)',
  automation: 'oklch(79% 0.146 322.8)',
  access: 'oklch(77.8% 0.121 2.5)',
} as const;

const RELATED_COUNT = 3;

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
                      <AddsSection
                        key={section.id}
                        style={{
                          ['--apps-stage-section-color' as string]:
                            SECTION_COLORS[
                              section.id as keyof typeof SECTION_COLORS
                            ],
                        }}
                      >
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

              {related.length > 0 && (
                <SideGroup>
                  <SideLabel>{i18n._(msg`People also like`)}</SideLabel>
                  <RelatedList>
                    {related.map((relatedApp) => (
                      <RelatedItem
                        href={`/apps/${relatedApp.slug}?direction=e`}
                        key={relatedApp.slug}
                      >
                        <AppsStageAppIcon app={relatedApp} sizePx={36} />
                        <RelatedText>
                          <RelatedName>{relatedApp.name}</RelatedName>
                          <RelatedTagline>{relatedApp.tagline}</RelatedTagline>
                        </RelatedText>
                      </RelatedItem>
                    ))}
                  </RelatedList>
                </SideGroup>
              )}
            </Side>
          </Body>
        </Frame>
      </SectionShell>

      <AppsStageApplyDock
        action={{
          href: buildAppInstallUrl(app.universalIdentifier),
          label: i18n._(msg`Install app`),
        }}
        label={app.name}
      />

      <AppsStageCraftClosing
        actions={
          <Button
            href={SITE_URLS.docsDevelopers}
            label={i18n._(msg`Read the docs`)}
            variant="filled"
          />
        }
        body={i18n._(
          msg`Add objects, logic and interface to Twenty, then publish it for every workspace.`,
        )}
        heading={i18n._(msg`Build your own *app*`)}
      />
    </>
  );
}
