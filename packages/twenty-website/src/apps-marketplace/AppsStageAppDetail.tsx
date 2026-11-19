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
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, Button, ExternalLink, Heading, SectionShell } from '@/ui';

import { AppReadme } from './AppReadme';
import { AppsStageAppRelated } from './AppsStageAppRelated';
import { AppsStageAppStage } from './AppsStageAppStage';
import { AppsStageCraftClosing } from './AppsStageCraftClosing';
import { APPS_STAGE_BETA_APP_NAMES } from './apps-stage-beta-apps';
import { APPS_STAGE_CRAFT_COLUMN } from './apps-stage-craft-column';
import { getAppsStagePastel } from './apps-stage-pastels';
import { buildAppInstallUrl } from './build-app-install-url';
import {
  type MarketplaceAppAdditionKind,
  type MarketplaceAppAdditions,
} from './fetch-marketplace-app-additions';
import {
  type MarketplaceApp,
  type MarketplaceAppDetail,
} from './marketplace-app';

// PROTOTYPE (?direction=e): an app's own page in the "craft" direction. The
// scene and facts after Profound's integration pages, then what the app adds
// to a workspace (read from the public API), its overview, related apps.
const Frame = styled.div`
  border-inline: 1px solid ${semanticColor.line};
  padding: ${spacing(10)} ${spacing(4)};
  ${APPS_STAGE_CRAFT_COLUMN}

  & > * + * {
    margin-top: ${spacing(8)};
  }

  ${mediaUp('md')} {
    padding: ${spacing(16)} ${spacing(12)};
  }

  &[data-divided] {
    border-bottom: 1px solid ${semanticColor.line};
  }
`;

// Below the fold, blocks rise in as they scroll into view; browsers without
// scroll timelines simply show them.
const Reveal = styled.div`
  @supports (animation-timeline: view()) {
    animation: apps-stage-app-reveal linear both;
    animation-range: entry 0% entry 60%;
    animation-timeline: view();
  }

  @keyframes apps-stage-app-reveal {
    from {
      opacity: 0;
      transform: translateY(16px);
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

const Head = styled.div`
  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const TitleRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
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

const Lede = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4.25)};
  line-height: 1.55;
  max-width: 640px;
`;

const Card = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: grid;
  overflow: hidden;

  ${mediaUp('md')} {
    grid-template-columns: minmax(0, 1fr) 320px;
  }
`;

const Facts = styled.div`
  border-top: 1px solid ${semanticColor.line};
  display: flex;
  flex-direction: column;
  gap: ${spacing(8)};
  justify-content: space-between;
  padding: ${spacing(6)};

  ${mediaUp('md')} {
    border-left: 1px solid ${semanticColor.line};
    border-top: none;
  }
`;

const FactList = styled.dl`
  & > * + * {
    margin-top: ${spacing(5)};
  }
`;

const Fact = styled.div`
  & > * + * {
    margin-top: ${spacing(1.5)};
  }
`;

const FactLabel = styled.dt`
  color: ${semanticColor.inkSubtle};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.75)};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const FactValue = styled.dd`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.75)};
  line-height: 20px;
`;

const FactLink = styled(ExternalLink)`
  align-items: center;
  color: ${semanticColor.ink};
  display: inline-flex;
  gap: ${spacing(1)};
  text-decoration: underline;
  text-decoration-color: ${semanticColor.lineStrong};
  text-underline-offset: 3px;

  &:hover {
    text-decoration-color: ${semanticColor.ink};
  }

  & > svg {
    height: 12px;
    width: 12px;
  }
`;

const SectionHead = styled.div`
  align-items: end;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(4)};
  justify-content: space-between;

  & > div > * + * {
    margin-top: ${spacing(2)};
  }
`;

const Additions = styled.div`
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

const Addition = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  padding: ${spacing(6)};

  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

const AdditionHead = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${spacing(3)};
`;

const AdditionCount = styled.span`
  color: ${color('neutral')};
  font-family: ${fontFamily('serif')};
  font-size: ${fontSize(10)};
  font-variant-numeric: tabular-nums;
  font-weight: ${FONT_WEIGHT.light};
  letter-spacing: -0.02em;
  line-height: 1;
`;

const AdditionKind = styled(MonoLabel)`
  color: ${semanticColor.inkMuted};
`;

const AdditionItems = styled.ul`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  line-height: 22px;
  list-style: none;
  padding: 0;

  & > li {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const More = styled.li`
  color: ${semanticColor.inkSubtle};
`;

const Overview = styled.div`
  display: grid;
  gap: ${spacing(10)};

  ${mediaUp('md')} {
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  }
`;

const Gallery = styled.div`
  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

const Screenshot = styled.img`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: block;
  height: auto;
  width: 100%;
`;

const ReadmeColumn = styled.div`
  min-width: 0;
`;

const ADDITION_KIND_LABELS: Record<
  MarketplaceAppAdditionKind,
  ReturnType<typeof msg>
> = {
  objects: msg`Objects`,
  fields: msg`Fields`,
  agents: msg`AI agents`,
  skills: msg`Skills`,
  workflows: msg`Workflows`,
  views: msg`Views`,
  logicFunctions: msg`Functions`,
  frontComponents: msg`Interface`,
};

const SHOWN_LABELS = 3;
const RELATED_COUNT = 2;

type AppsStageAppDetailProps = {
  additions: MarketplaceAppAdditions;
  app: MarketplaceAppDetail;
  apps: readonly MarketplaceApp[];
  locale: string;
};

export function AppsStageAppDetail({
  additions,
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

  return (
    <>
      <SectionShell flushInline rhythm="flush" scheme="dark">
        <Frame data-divided="">
          <Head>
            <BackLink href="/apps?direction=e">
              <ArrowLeft />
              {i18n._(msg`All apps`)}
            </BackLink>
            <TitleRow>
              <Heading as="h1" size="lg" weight="light">
                {app.name}
              </Heading>
              {isBeta && <BetaLabel>{i18n._(msg`Beta`)}</BetaLabel>}
            </TitleRow>
            <Lede>{app.tagline}</Lede>
          </Head>
          <Card>
            <AppsStageAppStage app={app} pastel={pastel} />
            <Facts>
              <FactList>
                <Fact>
                  <FactLabel>{i18n._(msg`Developer`)}</FactLabel>
                  <FactValue>{app.author}</FactValue>
                </Fact>
                {app.category.length > 0 && (
                  <Fact>
                    <FactLabel>{i18n._(msg`Category`)}</FactLabel>
                    <FactValue>
                      <CategoryLabel
                        style={{ ['--apps-stage-pastel' as string]: pastel }}
                      >
                        {app.category}
                      </CategoryLabel>
                    </FactValue>
                  </Fact>
                )}
                {installs !== undefined && (
                  <Fact>
                    <FactLabel>{i18n._(msg`Installed by`)}</FactLabel>
                    <FactValue>{i18n._(msg`${installs} workspaces`)}</FactValue>
                  </Fact>
                )}
                {app.latestAvailableVersion !== undefined && (
                  <Fact>
                    <FactLabel>{i18n._(msg`Version`)}</FactLabel>
                    <FactValue>{app.latestAvailableVersion}</FactValue>
                  </Fact>
                )}
                {app.websiteUrl !== undefined && (
                  <Fact>
                    <FactLabel>{i18n._(msg`Source`)}</FactLabel>
                    <FactValue>
                      <FactLink href={app.websiteUrl}>
                        GitHub
                        <ArrowUpRight />
                      </FactLink>
                    </FactValue>
                  </Fact>
                )}
              </FactList>
              <div>
                <Button
                  href={buildAppInstallUrl(app.universalIdentifier)}
                  label={i18n._(msg`Install`)}
                  variant="filled"
                />
              </div>
            </Facts>
          </Card>
        </Frame>
      </SectionShell>

      {additions.additions.length > 0 && (
        <SectionShell flushInline rhythm="flush" scheme="dark">
          <Frame data-divided="">
            <Reveal>
              <SectionHead>
                <div>
                  <Heading as="h2" size="sm" weight="light">
                    {i18n._(msg`What it adds to Twenty`)}
                  </Heading>
                  <Body muted size="sm">
                    {i18n._(
                      msg`Everything below lands in your workspace when you install ${app.name}.`,
                    )}
                  </Body>
                </div>
              </SectionHead>
            </Reveal>
            <Additions>
              {additions.additions.map((addition) => (
                <Reveal key={addition.kind}>
                  <Addition>
                    <AdditionHead>
                      <AdditionCount>{addition.count}</AdditionCount>
                      <AdditionKind>
                        {i18n._(ADDITION_KIND_LABELS[addition.kind])}
                      </AdditionKind>
                    </AdditionHead>
                    <AdditionItems>
                      {addition.labels.slice(0, SHOWN_LABELS).map((label) => (
                        <li key={label}>{label}</li>
                      ))}
                      {addition.labels.length > SHOWN_LABELS && (
                        <More>
                          {i18n._(
                            msg`+${addition.labels.length - SHOWN_LABELS} more`,
                          )}
                        </More>
                      )}
                    </AdditionItems>
                  </Addition>
                </Reveal>
              ))}
            </Additions>
          </Frame>
        </SectionShell>
      )}

      {(app.screenshots.length > 0 || app.aboutDescription !== undefined) && (
        <SectionShell flushInline rhythm="flush" scheme="dark">
          <Frame data-divided="">
            <Reveal>
              <Overview>
                <Heading as="h2" size="sm" weight="light">
                  {i18n._(msg`Overview`)}
                </Heading>
                <ReadmeColumn>
                  {app.screenshots.length > 0 && (
                    <Gallery>
                      {app.screenshots.map((screenshot) => (
                        <Screenshot
                          alt={i18n._(msg`${app.name} screenshot`)}
                          key={screenshot}
                          loading="lazy"
                          src={screenshot}
                        />
                      ))}
                    </Gallery>
                  )}
                  {app.aboutDescription !== undefined && (
                    <AppReadme markdown={app.aboutDescription} />
                  )}
                </ReadmeColumn>
              </Overview>
            </Reveal>
          </Frame>
        </SectionShell>
      )}

      {related.length > 0 && (
        <SectionShell flushInline rhythm="flush" scheme="dark">
          <Frame>
            <Reveal>
              <SectionHead>
                <Heading as="h2" size="sm" weight="light">
                  {i18n._(msg`You might also like`)}
                </Heading>
                <BackLink href="/apps?direction=e">
                  {i18n._(msg`All apps`)}
                </BackLink>
              </SectionHead>
            </Reveal>
            <Reveal>
              <AppsStageAppRelated
                apps={related}
                sortedCategories={sortedCategories}
              />
            </Reveal>
          </Frame>
        </SectionShell>
      )}

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
