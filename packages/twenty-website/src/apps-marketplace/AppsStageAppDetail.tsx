import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { ArrowLeft, ArrowUpRight } from '@/icons';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import { SITE_URLS } from '@/platform/site-urls';
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

import { AppsStageAppCards } from './AppsStageAppCards';
import { AppsStageAppIcon } from './AppsStageAppIcon';
import { AppsStageAppStory } from './AppsStageAppStory';
import { APPS_STAGE_BETA_APP_NAMES } from './apps-stage-beta-apps';
import { getAppsStagePastel } from './apps-stage-pastels';
import { buildAppInstallUrl } from './build-app-install-url';
import {
  type MarketplaceApp,
  type MarketplaceAppDetail,
} from './marketplace-app';

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

// From md, a 320px band keeps the app's name above the fold.
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

// Below md the side column comes after the content, so the header keeps Install.
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

// Grouped like the product's app page, so the site shows what install adds.
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

type RiseStyle = CSSProperties & { '--apps-stage-delay': string };
type PastelStyle = CSSProperties & { '--apps-stage-pastel': string };

const riseDelay = (delayMs: number): RiseStyle => ({
  '--apps-stage-delay': `${delayMs}ms`,
});

const SHOWN_NAMES = 3;
// Developer names (slack-home-opened) are counted, never shown.
const isReadableLabel = (label: string) => !/^[a-z0-9_-]+$/.test(label);

const RELATED_COUNT = 3;

const Related = styled.div`
  padding-top: ${spacing(8)};

  & > * + * {
    margin-top: ${spacing(8)};
  }
`;

const counted = (count: number, one: string, many: string) =>
  count === 0 ? [] : [count === 1 ? one : many];

type AppsStageAppDetailProps = {
  app: MarketplaceAppDetail;
  apps: readonly MarketplaceApp[];
  locale: string;
};

export function AppsStageAppDetail({
  app,
  apps,
  locale,
}: AppsStageAppDetailProps) {
  const i18n = getServerI18n();
  const { content } = app;
  const sortedCategories = [
    ...new Set(apps.map((candidate) => candidate.category)),
  ].toSorted((left, right) => left.localeCompare(right));
  const pastel = getAppsStagePastel(app.category, sortedCategories);
  const pastelStyle: PastelStyle = { '--apps-stage-pastel': pastel };
  const isBeta = APPS_STAGE_BETA_APP_NAMES.includes(
    app.name.trim().toLowerCase(),
  );
  const others = apps.filter((candidate) => candidate.slug !== app.slug);
  const related = [
    ...others.filter((candidate) => candidate.category === app.category),
    ...others.filter((candidate) => candidate.category !== app.category),
  ].slice(0, RELATED_COUNT);
  const installs = isDefined(app.installCount)
    ? new Intl.NumberFormat(locale).format(app.installCount)
    : undefined;

  const overview = (
    <>
      {isDefined(app.aboutDescription) ? (
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
            <BackLink href="/apps">
              <ArrowLeft />
              {i18n._(msg`All apps`)}
            </BackLink>
          </Rise>

          {isDefined(cover) && (
            <Rise style={riseDelay(30)}>
              <Cover>
                <CoverImage
                  alt={i18n._(msg`${app.name} screenshot`)}
                  src={cover}
                />
              </Cover>
            </Rise>
          )}

          <Rise style={riseDelay(60)}>
            <Header>
              <AppsStageAppIcon app={app} sizePx={72} />
              <HeaderText>
                <Heading as="h1" size="md" weight="light">
                  {app.name}
                </Heading>
                <Tagline>{app.tagline}</Tagline>
                <Meta>
                  <span>{app.author}</span>
                  {isDefined(installs) && (
                    <span>{i18n._(msg`${installs} installs`)}</span>
                  )}
                  {app.category.length > 0 && (
                    <span>
                      <CategoryLabel style={pastelStyle}>
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
              <HeaderAction data-dock-anchor="">
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
              <Rise style={riseDelay(220)}>{overview}</Rise>
            </Main>

            <Side>
              <SideGroup>
                <Fact>
                  <SideLabel>{i18n._(msg`Developer`)}</SideLabel>
                  <FactValue>{app.author}</FactValue>
                </Fact>
                {isDefined(app.latestAvailableVersion) && (
                  <Fact>
                    <SideLabel>{i18n._(msg`Version`)}</SideLabel>
                    <FactValue>{app.latestAvailableVersion}</FactValue>
                  </Fact>
                )}
                {isDefined(installs) && (
                  <Fact>
                    <SideLabel>{i18n._(msg`Installed by`)}</SideLabel>
                    <FactValue>{i18n._(msg`${installs} workspaces`)}</FactValue>
                  </Fact>
                )}
                {isDefined(app.sourcePackage) && (
                  <Fact>
                    <SideLabel>{i18n._(msg`Package`)}</SideLabel>
                    <PackageName>{app.sourcePackage}</PackageName>
                  </Fact>
                )}
                <SideAction data-dock-anchor="">
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
                    {addsSections.map((section) => {
                      const lines = [...new Set(section.lines)];

                      return (
                        <AddsSection key={section.id}>
                          <AddsTitle>{section.title}</AddsTitle>
                          <AddsList>
                            {lines.slice(0, SHOWN_NAMES).map((line) => (
                              <li key={line}>{line}</li>
                            ))}
                            {lines.length > SHOWN_NAMES && (
                              <li>
                                {i18n._(
                                  msg`+${lines.length - SHOWN_NAMES} more`,
                                )}
                              </li>
                            )}
                          </AddsList>
                        </AddsSection>
                      );
                    })}
                  </AddsSections>
                </SideGroup>
              )}

              {[
                app.websiteUrl,
                app.termsUrl,
                app.issueReportUrl,
                app.emailSupport,
              ].some(isDefined) && (
                <SideGroup>
                  <SideLabel>{i18n._(msg`Resources`)}</SideLabel>
                  <SideLinks>
                    {isDefined(app.websiteUrl) && (
                      <SideLink href={app.websiteUrl}>
                        {i18n._(msg`Website`)}
                        <ArrowUpRight />
                      </SideLink>
                    )}
                    {isDefined(app.termsUrl) && (
                      <SideLink href={app.termsUrl}>
                        {i18n._(msg`Terms`)}
                        <ArrowUpRight />
                      </SideLink>
                    )}
                    {isDefined(app.issueReportUrl) && (
                      <SideLink href={app.issueReportUrl}>
                        {i18n._(msg`Report an issue`)}
                        <ArrowUpRight />
                      </SideLink>
                    )}
                    {isDefined(app.emailSupport) && (
                      <SideLink href={`mailto:${app.emailSupport}`}>
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

      <FloatingDock
        action={
          <Button
            href={buildAppInstallUrl(app.universalIdentifier)}
            label={i18n._(msg`Install app`)}
            variant="filled"
          />
        }
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
