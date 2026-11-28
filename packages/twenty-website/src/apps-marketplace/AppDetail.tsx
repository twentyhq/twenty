import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import {
  type Icon,
  IconBug,
  IconCode,
  IconDatabase,
  IconDownload,
  IconFileText,
  IconKey,
  IconLayout,
  IconMail,
  IconRobot,
  IconWorldWww,
} from '@tabler/icons-react';
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
  REDUCED_MOTION,
  RHYTHM,
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
import { BackLink } from '@/ui/BackLink';

import { AppCards } from './AppCards';
import { AppIcon } from './AppIcon';
import { AppStory } from './AppStory';
import { leadSentence } from './lead-sentence';
import { buildAppInstallUrl } from './build-app-install-url';
import { stripLeadingMarkdownTitle } from './strip-leading-markdown-title';
import {
  type MarketplaceApp,
  type MarketplaceAppDetail,
} from './marketplace-app';

const ICON_SIZE_PX = 72;

// The backdrop twenty-cli draws under the covers it generates: the band of an
// app that ships no image.
const DEFAULT_COVER_URL = '/images/apps/default-cover.png';

// The cover runs edge to edge as the band's full-bleed background; this box
// only gives it its height and holds the icon on its lower edge.
const CoverRoom = styled.div`
  height: ${spacing(50)};
  position: relative;

  ${mediaUp('md')} {
    height: ${spacing(100)};
  }
`;

const CoverImage = styled.img`
  border-bottom: 1px solid ${semanticColor.line};
  height: 100%;
  inset: 0;
  object-fit: cover;
  object-position: center top;
  position: absolute;
  width: 100%;
`;

// On the band's lower edge at the content's left edge, half over the cover.
const CoverIcon = styled.div`
  bottom: 0;
  left: 0;
  position: absolute;
  transform: translateY(50%);
`;

// Under the band, the title sits a fixed step below the icon at every width:
// the section's own top padding minus the icon's half that hangs into it.
const Header = styled.div`
  margin-top: calc(
    ${ICON_SIZE_PX / 2}px + ${spacing(6)} - ${spacing(RHYTHM.section.top.base)}
  );
  max-width: ${HERO_COMPOSITION.bodyMeasurePx}px;

  ${mediaUp('md')} {
    margin-top: calc(
      ${ICON_SIZE_PX / 2}px + ${spacing(6)} - ${spacing(RHYTHM.section.top.md)}
    );
  }

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

// Below md the side column comes after the content, so the header keeps
// Install; from md it heads the side column.
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
// A fact told by its icon, as the case studies' reading time: the icon
// stands for the label, which stays for screen readers.
const SideFieldRow = styled.div`
  column-gap: ${spacing(3)};
  display: grid;
  grid-template-columns: ${spacing(4)} minmax(0, 1fr);

  /* centred on the text's first line (bodySm) */
  & > svg {
    color: ${color('blue')};
    margin-top: ${spacing(1)};
  }
`;

const SideField = ({
  children,
  icon: FieldIcon,
  label,
}: {
  children: ReactNode;
  icon: Icon;
  label: string;
}) => (
  <SideFieldRow aria-label={label} role="group">
    <FieldIcon aria-hidden size={16} stroke={1.5} />
    {children}
  </SideFieldRow>
);

const SideGroup = styled.div`
  & > * + * {
    margin-top: ${spacing(3)};
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

const SHOWN_NAMES = 3;
// Developer names (slack-home-opened) are counted, never shown.
const isReadableLabel = (label: string) => !/^[a-z0-9_-]+$/.test(label);

const RELATED_COUNT = 3;

const Related = styled.div`
  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const firstSentence = (text: string) => leadSentence(text).toLowerCase();

// The tagline already sits under the name. A README that opens on the same
// sentence, or on its own one-line pitch in bold before its first heading
// ("**Your Granola meeting summaries…, right inside your CRM.**"), would say
// it twice: that opening goes.
const isBoldPitch = (block: string) => /^\*\*[^*\n]+\*\*$/.test(block.trim());

// Markdown reduced to its words: links to their text, no emphasis or code
// marks, lower case.
const plainText = (markdown: string) =>
  markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .trim()
    .toLowerCase();

const dropRepeatedLede = (markdown: string, tagline: string) => {
  const body = stripLeadingMarkdownTitle(markdown).trimStart();
  const [lede, ...rest] = body.split(/\n\s*\n/);

  if (!isDefined(lede) || rest.length === 0) {
    return markdown;
  }

  // the opening starts with the tagline's first sentence, links and
  // emphasis aside ("Structured web search powered by [Exa](…), …")
  const repeatsTagline = plainText(lede).startsWith(
    plainText(firstSentence(tagline)).replace(/[.!?]$/, ''),
  );
  const isPitchBeforeHeading =
    isBoldPitch(lede) && rest[0]?.trimStart().startsWith('#') === true;

  return repeatsTagline || isPitchBeforeHeading ? rest.join('\n\n') : markdown;
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
  const others = apps.filter((candidate) => candidate.slug !== app.slug);
  const related = [
    ...others.filter((candidate) => candidate.category === app.category),
    ...others.filter((candidate) => candidate.category !== app.category),
  ].slice(0, RELATED_COUNT);
  const installs = isDefined(app.installCount)
    ? new Intl.NumberFormat(locale).format(app.installCount)
    : undefined;

  const install = (
    <Button
      href={buildAppInstallUrl(app.universalIdentifier)}
      label={i18n._(msg`Install app`)}
      variant="filled"
    />
  );

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
      icon: IconDatabase,
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
      icon: IconLayout,
      title: i18n._(msg`Interface`),
      lines: [
        ...new Set(
          names([...(content.views ?? []), ...(content.frontComponents ?? [])]),
        ),
      ],
    },
    {
      id: 'automation',
      icon: IconRobot,
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
      icon: IconKey,
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
      <SectionShell
        background={<CoverImage alt="" src={cover ?? DEFAULT_COVER_URL} />}
        fullBleedBackground
        rhythm="flush"
        scheme="light"
      >
        <CoverRoom>
          <CoverIcon>
            <AppIcon app={app} sizePx={ICON_SIZE_PX} />
          </CoverIcon>
        </CoverRoom>
      </SectionShell>
      <SectionShell connectsUp rhythm="section" scheme="light">
        <SectionStack>
          <Header>
            <BackLink href="/apps">{i18n._(msg`All apps`)}</BackLink>
            <Heading as="h1" size="md" weight="light" wrap="normal">
              {app.name}
            </Heading>
            {/* The tagline's first sentence: the whole one runs to 260
                characters, and the overview says the rest. */}
            <Body muted size="sm">
              {leadSentence(app.tagline)}
            </Body>
            <HeaderAction>{install}</HeaderAction>
          </Header>

          <Columns>
            <Main>{overview}</Main>

            <Side>
              <SideAction>{install}</SideAction>
              <SideGroup>
                <SideField icon={IconCode} label={i18n._(msg`Developer`)}>
                  <Body size="sm">{i18n._(msg`By ${app.author}`)}</Body>
                </SideField>
                {isDefined(installs) && (
                  <SideField
                    icon={IconDownload}
                    label={i18n._(msg`Installed by`)}
                  >
                    <Body size="sm">
                      {i18n._(msg`Installed by ${installs} workspaces`)}
                    </Body>
                  </SideField>
                )}
              </SideGroup>

              {addsSections.length > 0 && (
                <SideGroup>
                  {addsSections.map((section) => {
                    const lines = [...new Set(section.lines)];

                    return (
                      <SideField
                        icon={section.icon}
                        key={section.id}
                        label={section.title}
                      >
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
                <SideGroup aria-label={i18n._(msg`Resources`)} role="group">
                  {isDefined(app.websiteUrl) && (
                    <SideField icon={IconWorldWww} label={i18n._(msg`Website`)}>
                      <SideLink href={app.websiteUrl}>
                        {i18n._(msg`Website`)}
                        <ArrowUpRight />
                      </SideLink>
                    </SideField>
                  )}
                  {isDefined(app.termsUrl) && (
                    <SideField icon={IconFileText} label={i18n._(msg`Terms`)}>
                      <SideLink href={app.termsUrl}>
                        {i18n._(msg`Terms`)}
                        <ArrowUpRight />
                      </SideLink>
                    </SideField>
                  )}
                  {isDefined(app.issueReportUrl) && (
                    <SideField
                      icon={IconBug}
                      label={i18n._(msg`Report an issue`)}
                    >
                      <SideLink href={app.issueReportUrl}>
                        {i18n._(msg`Report an issue`)}
                        <ArrowUpRight />
                      </SideLink>
                    </SideField>
                  )}
                  {isDefined(app.emailSupport) && (
                    <SideField
                      icon={IconMail}
                      label={i18n._(msg`Email support`)}
                    >
                      <SideLink href={`mailto:${app.emailSupport}`}>
                        {i18n._(msg`Email support`)}
                        <ArrowUpRight />
                      </SideLink>
                    </SideField>
                  )}
                </SideGroup>
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
