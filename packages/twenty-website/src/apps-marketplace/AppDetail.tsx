import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { ArrowUpRight } from '@/icons';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { SITE_URLS } from '@/platform/site-urls';
import {
  color,
  DURATION,
  EASING,
  fontFamily,
  HERO_COMPOSITION,
  mediaUp,
  MENU_HEIGHT_PX,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import {
  Button,
  ExternalLink,
  Body,
  Heading,
  SectionShell,
  SectionStack,
  Signoff,
} from '@/ui';

import { AppCards } from './AppCards';
import { AppDefaultCover } from './AppDefaultCover';
import { AppIcon } from './AppIcon';
import { AppStory } from './AppStory';
import { BETA_APP_NAMES } from './beta-app-names';
import { buildAppInstallUrl } from './build-app-install-url';
import { stripLeadingMarkdownTitle } from './strip-leading-markdown-title';
import {
  type MarketplaceApp,
  type MarketplaceAppDetail,
} from './marketplace-app';

const ICON_SIZE_PX = 72;

// The partner profile's band.
const Cover = styled.div`
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

const CoverImage = styled.img`
  height: 100%;
  inset: 0;
  object-fit: cover;
  object-position: center top;
  position: absolute;
  width: 100%;
`;

// Under the cover, its icon half on the band as on the app cards, flush
// with the page's left edge like everything below; the name
// and tagline, then Install level with the tagline on wide screens.
const Header = styled.div`
  && {
    margin-top: calc(-1 * ${ICON_SIZE_PX / 2}px);
  }

  display: grid;
  gap: ${spacing(6)};

  ${mediaUp('md')} {
    align-items: end;
    grid-template-columns: minmax(0, 1fr) auto;
  }
`;

const HeaderText = styled.div`
  max-width: ${HERO_COMPOSITION.bodyMeasurePx}px;
  min-width: 0;

  & > * + * {
    margin-top: ${spacing(2)};
  }

  & > :first-child {
    margin-bottom: ${spacing(4)};
    position: relative;
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

// One value list per field, at the value's size: what install adds reads
// like the rest of the column (label, then values).
const ValueList = styled.ul`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  ${typeRampDeclarations('bodySm')}
  list-style: none;
  padding: 0;

  & > li {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & > li + li {
    margin-top: ${spacing(1.5)};
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

// Label above its value, as a role sits under a name in Testimonials: the
// label is muted small text so the value carries the weight.
const SideFieldStack = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(1.5)};
  }
`;

const SideField = ({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) => (
  <SideFieldStack>
    <Body as="span" muted size="xs">
      {label}
    </Body>
    {children}
  </SideFieldStack>
);

const SideGroup = styled.div`
  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const SideLink = styled(ExternalLink)`
  align-items: center;
  align-self: flex-start;
  color: ${semanticColor.inkMuted};
  display: inline-flex;
  font-family: ${fontFamily('sans')};
  ${typeRampDeclarations('bodySm')}
  gap: ${spacing(1.5)};
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
  gap: ${spacing(1.5)};
`;

const SHOWN_NAMES = 3;
// Developer names (slack-home-opened) are counted, never shown.
const isReadableLabel = (label: string) => !/^[a-z0-9_-]+$/.test(label);

const RELATED_COUNT = 3;

const Related = styled.div`
  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const leadSentence = (text: string) =>
  text.trim().split(/(?<=[.!?])\s/)[0] ?? '';

const firstSentence = (text: string) => leadSentence(text).toLowerCase();

// The tagline already sits under the name: a README opening on the same
// sentence would say it twice.
const dropRepeatedLede = (markdown: string, tagline: string) => {
  const body = stripLeadingMarkdownTitle(markdown).trimStart();
  const [lede, ...rest] = body.split(/\n\s*\n/);

  return isDefined(lede) &&
    rest.length > 0 &&
    firstSentence(lede.replace(/\*/g, '')) === firstSentence(tagline)
    ? rest.join('\n\n')
    : markdown;
};

const counted = (count: number, one: string, many: string) =>
  count === 0 ? [] : [count === 1 ? one : many];

type AppDetailProps = {
  app: MarketplaceAppDetail;
  apps: readonly MarketplaceApp[];
  locale: string;
};

export function AppDetail({ app, apps, locale }: AppDetailProps) {
  const i18n = getServerI18n();
  const { content } = app;
  const isBeta = BETA_APP_NAMES.includes(app.name.trim().toLowerCase());
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
        <AppStory
          markdown={dropRepeatedLede(app.aboutDescription, app.tagline)}
        />
      ) : (
        <Body muted size="sm">
          {app.tagline}
        </Body>
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
      <SectionShell rhythm="section" scheme="light">
        <SectionStack>
          <Cover>
            {isDefined(cover) ? (
              <CoverImage
                alt={i18n._(msg`${app.name} screenshot`)}
                src={cover}
              />
            ) : (
              <AppDefaultCover app={app} tilePx={72} />
            )}
          </Cover>

          <Header>
            <HeaderText>
              <AppIcon app={app} sizePx={ICON_SIZE_PX} />
              <Heading as="h1" size="md" weight="light" wrap="normal">
                {app.name}
              </Heading>
              {/* The tagline's first sentence: the whole one runs to 260
                  characters, and the overview says the rest. */}
              <Body muted size="sm">
                {leadSentence(app.tagline)}
              </Body>
              {isBeta && (
                <Body muted size="xs">
                  {i18n._(msg`Beta`)}
                </Body>
              )}
            </HeaderText>
            <div>
              <Button
                href={buildAppInstallUrl(app.universalIdentifier)}
                label={i18n._(msg`Install app`)}
                variant="filled"
              />
            </div>
          </Header>

          <Columns>
            <Main>{overview}</Main>

            <Side>
              <SideGroup>
                <SideField label={i18n._(msg`Developer`)}>
                  <Body size="sm">{app.author}</Body>
                </SideField>
                {isDefined(installs) && (
                  <SideField label={i18n._(msg`Installed by`)}>
                    <Body size="sm">{i18n._(msg`${installs} workspaces`)}</Body>
                  </SideField>
                )}
              </SideGroup>

              {addsSections.length > 0 && (
                <SideGroup>
                  {addsSections.map((section) => {
                    const lines = [...new Set(section.lines)];

                    return (
                      <SideField key={section.id} label={section.title}>
                        <ValueList>
                          {lines.slice(0, SHOWN_NAMES).map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                          {lines.length > SHOWN_NAMES && (
                            <li>
                              {i18n._(msg`+${lines.length - SHOWN_NAMES} more`)}
                            </li>
                          )}
                        </ValueList>
                      </SideField>
                    );
                  })}
                </SideGroup>
              )}

              {[
                app.websiteUrl,
                app.termsUrl,
                app.issueReportUrl,
                app.emailSupport,
              ].some(isDefined) && (
                <SideField label={i18n._(msg`Resources`)}>
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
                </SideField>
              )}
            </Side>
          </Columns>

          {related.length > 0 && (
            <Related>
              <Heading as="h2" size="sm" weight="light">
                {i18n._(msg`You might also like`)}
              </Heading>
              <AppCards apps={related} />
            </Related>
          )}
        </SectionStack>
      </SectionShell>

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
