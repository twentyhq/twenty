import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import { SITE_URLS } from '@/platform/site-urls';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';
import {
  Body,
  Button,
  EngagementBand,
  ExternalLink,
  Heading,
  SectionShell,
} from '@/ui';

import { AppLogo } from './AppLogo';
import { AppReadme } from './AppReadme';
import { AppsDarkStage } from './AppsDarkStage';
import { AppsGrid } from './AppsGrid';
import { buildAppInstallUrl } from './build-app-install-url';
import {
  type MarketplaceAppAdditionKind,
  type MarketplaceAppAdditions,
} from './fetch-marketplace-app-additions';
import {
  type MarketplaceApp,
  type MarketplaceAppDetail,
} from './marketplace-app';

// PROTOTYPE of direction B on the site (?direction=b, &shape=notched).
// Not for a PR as is: the notched frame below is a new, width-stable take on
// sections/three-cards/CardShape, which only holds its drawing near 443x494.

const NOTCH_HEIGHT_PX = 24;
const NOTCH_SLOPE_WIDTH_PX = 66.276;
const NOTCH_FILL_PATH =
  'M0 0c.932 0 1.856.163 2.731.48l60.814 22.09c.875.318 1.8.48 2.731.48V24H0Z';
const NOTCH_STROKE_PATH =
  'M0 .5c.874 0 1.74.152 2.561.45l60.813 22.09c.931.338 1.912.51 2.902.51';

const DetailInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(8)};
  margin-inline: auto;
  max-width: 1040px;
  width: 100%;

  &[data-wide] {
    max-width: 1240px;
  }
`;

// Linear's structure: content on the left, a flat sticky column on the right
// with the action and the facts, ruled by hairlines. No card, no shape.
const SplitGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(10)};

  ${mediaUp('md')} {
    column-gap: ${spacing(16)};
    display: grid;
    grid-template-columns: minmax(0, 1fr) 18rem;
  }
`;

const SideColumn = styled.aside`
  display: flex;
  flex-direction: column;
  gap: ${spacing(6)};

  ${mediaUp('md')} {
    align-self: flex-start;
    grid-column: 2;
    grid-row: 1;
    position: sticky;
    top: ${spacing(24)};
  }
`;

const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(10)};
  min-width: 0;

  ${mediaUp('md')} {
    grid-column: 1;
    grid-row: 1;
  }
`;

const SideRule = styled.hr`
  background-color: ${semanticColor.line};
  border: 0;
  height: 1px;
  width: 100%;
`;

const BackLink = styled(LocalizedLink)`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  text-decoration: none;
  transition: color 150ms ease;

  &:hover {
    color: ${semanticColor.ink};
  }
`;

const HeaderRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(5)};

  ${mediaUp('md')} {
    align-items: center;
    flex-direction: row;
    gap: ${spacing(6)};
  }
`;

const HeaderIdentity = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${spacing(5)};
  min-width: 0;
`;

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(1.5)};
  min-width: 0;
`;

const HeaderAction = styled.div`
  display: flex;
  flex-shrink: 0;

  & > * {
    flex: 1;
  }
`;

const SquareCard = styled.div`
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  gap: ${spacing(6)};
  padding: ${spacing(5)};

  ${mediaUp('md')} {
    padding: ${spacing(8)};
  }
`;

const NotchedCard = styled.div`
  display: flex;
  flex-direction: column;
`;

const NotchCap = styled.div`
  display: flex;
  height: ${NOTCH_HEIGHT_PX}px;

  svg {
    display: block;
    flex-shrink: 0;
  }
`;

const NotchTab = styled.div`
  background-color: ${color('white')};
  border-left: 1px solid ${color('black-20')};
  border-top: 1px solid ${color('black-20')};
  border-top-left-radius: ${radius(1)};
  flex: 0 1 62%;
  min-width: ${spacing(10)};
`;

const NotchGap = styled.div`
  border-bottom: 1px solid ${color('black-20')};
  flex: 1 0 ${spacing(6)};
  margin-right: ${radius(1)};
`;

const NotchBody = styled.div`
  background-color: ${color('white')};
  border: 1px solid ${color('black-20')};
  border-radius: 0 ${radius(1)} ${radius(1)} ${radius(1)};
  border-top: 0;
  display: flex;
  flex-direction: column;
  gap: ${spacing(5)};
  padding: ${spacing(2)} ${spacing(5)} ${spacing(5)};

  ${mediaUp('md')} {
    gap: ${spacing(6)};
    padding: ${spacing(3)} ${spacing(8)} ${spacing(8)};
  }
`;

const DottedRule = styled.div`
  border-top: 1px dotted ${semanticColor.divider};
  height: 0;
  width: 100%;
`;

const MetaRow = styled.dl`
  display: grid;
  gap: ${spacing(5)} ${spacing(8)};
  grid-template-columns: repeat(2, minmax(0, 1fr));

  ${mediaUp('md')} {
    display: flex;
    gap: ${spacing(12)};

    &[data-stacked] {
      flex-direction: column;
      gap: ${spacing(5)};
    }
  }
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(1)};
`;

const MetaLabel = styled.dt`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.75)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const MetaValue = styled.dd`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
`;

const Screenshot = styled.img`
  aspect-ratio: 16 / 10;
  background-color: ${semanticColor.surface};
  border-radius: ${radius(2)};
  display: block;
  height: auto;
  object-fit: cover;
  width: 100%;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${spacing(4)};
`;

const AdditionsTable = styled.div`
  display: flex;
  flex-direction: column;
`;

const AdditionsRow = styled.div`
  align-items: baseline;
  border-bottom: 1px dotted ${semanticColor.divider};
  column-gap: ${spacing(6)};
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: ${spacing(3.5)} 0;
  row-gap: ${spacing(1)};

  &[data-head] {
    border-bottom: 1px solid ${semanticColor.line};
    padding-top: 0;
  }

  & > [data-cell='includes'] {
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    display: -webkit-box;
    grid-column: 1 / -1;
    grid-row: 2;
    overflow: hidden;
  }

  &[data-head] > [data-cell='includes'] {
    display: none;
  }

  ${mediaUp('md')} {
    grid-template-columns: 12rem minmax(0, 1fr) 4rem;

    & > [data-cell='includes'],
    &[data-head] > [data-cell='includes'] {
      display: block;
      grid-column: auto;
      grid-row: auto;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  & > [data-cell='count'] {
    font-variant-numeric: tabular-nums;
    text-align: right;
  }
`;

const LinksRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)} ${spacing(6)};

  aside & {
    flex-direction: column;
    gap: ${spacing(3)};
  }
`;

const FootLink = styled(ExternalLink)`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  text-decoration: underline;
`;

const ADDITION_LABELS: Record<
  MarketplaceAppAdditionKind,
  ReturnType<typeof msg>
> = {
  objects: msg`Objects`,
  fields: msg`Fields`,
  frontComponents: msg`Widgets`,
  logicFunctions: msg`Logic functions`,
  agents: msg`Agents`,
  skills: msg`Skills`,
  workflows: msg`Workflows`,
  views: msg`Views`,
};

// Same rule as the product prototype (getApplicationReadmeParts in
// twenty-front): the readme opens with a title, then a one-line pitch.
const getReadmeParts = (markdown?: string) => {
  const body = (markdown ?? '').trim().replace(/^#\s[^\n]*\n+/, '');
  const pitchEnd = body.search(/\n\s*\n/);

  if (pitchEnd === -1 || body.startsWith('#')) {
    return { pitch: undefined, overview: body };
  }

  return {
    pitch: body
      .slice(0, pitchEnd)
      .replace(/(\*\*|__)/g, '')
      .trim(),
    overview: body.slice(pitchEnd).trim(),
  };
};

type AppDetailDirectionBProps = {
  app: MarketplaceAppDetail;
  additions: MarketplaceAppAdditions;
  relatedApps: readonly MarketplaceApp[];
  shape: 'square' | 'notched';
  tone: 'light' | 'dark';
};

export function AppDetailDirectionB({
  app,
  additions,
  relatedApps,
  shape,
  tone,
}: AppDetailDirectionBProps) {
  const isDark = tone === 'dark';
  const i18n = getServerI18n();
  const installUrl = buildAppInstallUrl(app.universalIdentifier);
  const readmeParts = getReadmeParts(app.aboutDescription);

  const header = (
    <HeaderRow>
      <HeaderIdentity>
        <AppLogo
          name={app.name}
          logoUrl={app.logoUrl}
          size={64}
          loading="eager"
        />
        <HeaderText>
          <Heading as="h1" size="sm" weight="regular">
            {app.name}
          </Heading>
          <Body muted size="sm">
            {readmeParts.pitch ?? app.tagline}
          </Body>
        </HeaderText>
      </HeaderIdentity>
      {!isDark && (
        <HeaderAction>
          <Button
            href={installUrl}
            label={i18n._(msg`Install`)}
            variant="filled"
          />
        </HeaderAction>
      )}
    </HeaderRow>
  );

  const meta = (
    <MetaRow data-stacked={isDark ? '' : undefined}>
      <MetaItem>
        <MetaLabel>{i18n._(msg`Built by`)}</MetaLabel>
        <MetaValue>{app.author}</MetaValue>
      </MetaItem>
      {app.category.length > 0 && (
        <MetaItem>
          <MetaLabel>{i18n._(msg`Category`)}</MetaLabel>
          <MetaValue>{app.category}</MetaValue>
        </MetaItem>
      )}
      {isDefined(app.latestAvailableVersion) && (
        <MetaItem>
          <MetaLabel>{i18n._(msg`Version`)}</MetaLabel>
          <MetaValue>{app.latestAvailableVersion}</MetaValue>
        </MetaItem>
      )}
      {isDefined(additions.installCount) && additions.installCount > 0 && (
        <MetaItem>
          <MetaLabel>{i18n._(msg`Installs`)}</MetaLabel>
          <MetaValue>{additions.installCount}</MetaValue>
        </MetaItem>
      )}
    </MetaRow>
  );

  const gallery = app.screenshots.map((screenshot) => (
    <Screenshot
      key={screenshot}
      src={screenshot}
      alt={i18n._(msg`${app.name} screenshot`)}
      loading="lazy"
    />
  ));

  const overview = readmeParts.overview.length > 0 && (
    <Section>
      <Heading as="h2" size="xs" weight="regular">
        {i18n._(msg`Overview`)}
      </Heading>
      <AppReadme markdown={readmeParts.overview} />
    </Section>
  );

  const card: ReactNode = isDark ? (
    <>
      {gallery}
      {overview}
    </>
  ) : shape === 'notched' ? (
    <NotchedCard>
      <NotchCap aria-hidden>
        <NotchTab />
        <svg
          fill="none"
          height={NOTCH_HEIGHT_PX}
          viewBox={`0 0 ${NOTCH_SLOPE_WIDTH_PX} ${NOTCH_HEIGHT_PX}`}
          width={NOTCH_SLOPE_WIDTH_PX}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={NOTCH_FILL_PATH} fill={color('white')} />
          <path d={NOTCH_STROKE_PATH} stroke={color('black-20')} />
        </svg>
        <NotchGap />
      </NotchCap>
      <NotchBody>
        {!isDark && (
          <>
            {header}
            <DottedRule aria-hidden />
            {meta}
            <DottedRule aria-hidden />
          </>
        )}
        {gallery}
        {overview}
      </NotchBody>
    </NotchedCard>
  ) : (
    <>
      {!isDark && header}
      <SquareCard>
        {!isDark && meta}
        {gallery}
        {overview}
      </SquareCard>
    </>
  );

  const additionsSection = additions.additions.length > 0 && (
    <Section>
      <Heading as="h2" size="xs" weight="regular">
        {i18n._(msg`What ${app.name} adds`)}
      </Heading>
      <AdditionsTable role="table">
        <AdditionsRow data-head role="row">
          <Body as="span" muted size="xs">
            {i18n._(msg`Name`)}
          </Body>
          <span data-cell="includes">
            <Body as="span" muted size="xs">
              {i18n._(msg`Includes`)}
            </Body>
          </span>
          <span data-cell="count">
            <Body as="span" muted size="xs">
              {i18n._(msg`Count`)}
            </Body>
          </span>
        </AdditionsRow>
        {additions.additions.map((addition) => (
          <AdditionsRow key={addition.kind} role="row">
            <Body as="span" size="sm" weight="medium">
              {i18n._(ADDITION_LABELS[addition.kind])}
            </Body>
            <span data-cell="includes">
              <Body as="span" muted size="sm">
                {addition.labels.join(', ')}
              </Body>
            </span>
            <span data-cell="count">
              <Body as="span" size="sm">
                {addition.count}
              </Body>
            </span>
          </AdditionsRow>
        ))}
      </AdditionsTable>
    </Section>
  );

  const linksRow = (
    <LinksRow>
      {isDefined(app.websiteUrl) && (
        <FootLink href={app.websiteUrl}>{i18n._(msg`Website`)}</FootLink>
      )}
      {isDefined(additions.emailSupport) && (
        <FootLink href={`mailto:${additions.emailSupport}`}>
          {i18n._(msg`Support`)}
        </FootLink>
      )}
      {isDefined(additions.issueReportUrl) && (
        <FootLink href={additions.issueReportUrl}>
          {i18n._(msg`Report an issue`)}
        </FootLink>
      )}
      {isDefined(additions.termsUrl) && (
        <FootLink href={additions.termsUrl}>{i18n._(msg`Terms`)}</FootLink>
      )}
    </LinksRow>
  );

  const darkHero = (
    <AppsDarkStage>
      <DetailInner data-wide>
        <BackLink href="/apps">{i18n._(msg`← Twenty apps`)}</BackLink>
        {header}
      </DetailInner>
    </AppsDarkStage>
  );

  if (isDark) {
    return (
      <>
        {darkHero}
        <SectionShell rhythm="section" scheme="light">
          <DetailInner data-wide>
            <SplitGrid>
              <SideColumn>
                <Button
                  href={installUrl}
                  label={i18n._(msg`Install`)}
                  variant="filled"
                />
                <SideRule aria-hidden />
                {meta}
                <SideRule aria-hidden />
                {linksRow}
              </SideColumn>
              <MainColumn>
                {card}
                {additionsSection}
              </MainColumn>
            </SplitGrid>
          </DetailInner>
        </SectionShell>
        {relatedApps.length > 0 && (
          <SectionShell rhythm="section" scheme="muted">
            <DetailInner data-wide>
              <Heading as="h2" size="xs" weight="regular">
                {i18n._(msg`More in ${app.category}`)}
              </Heading>
              <AppsGrid apps={relatedApps} />
            </DetailInner>
          </SectionShell>
        )}
        <EngagementBand
          heading={i18n._(msg`Build your own app`)}
          body={i18n._(
            msg`Add objects, logic and interface to Twenty, then publish it for every workspace.`,
          )}
          actions={
            <Button
              href={SITE_URLS.docsDevelopers}
              label={i18n._(msg`Read the docs`)}
              variant="filled"
            />
          }
        />
      </>
    );
  }

  return (
    <>
      {isDark && darkHero}
      <SectionShell rhythm={isDark ? 'section' : 'hero'} scheme="light">
        <DetailInner>
          {!isDark && (
            <BackLink href="/apps">{i18n._(msg`← Twenty apps`)}</BackLink>
          )}
          {card}

          {additionsSection}
          {linksRow}
        </DetailInner>
      </SectionShell>

      {relatedApps.length > 0 && (
        <SectionShell rhythm="section" scheme="muted">
          <DetailInner>
            <Heading as="h2" size="xs" weight="regular">
              {i18n._(msg`More in ${app.category}`)}
            </Heading>
            <AppsGrid apps={relatedApps} />
          </DetailInner>
        </SectionShell>
      )}

      <EngagementBand
        heading={i18n._(msg`Build your own app`)}
        body={i18n._(
          msg`Add objects, logic and interface to Twenty, then publish it for every workspace.`,
        )}
        actions={
          <Button
            href={SITE_URLS.docsDevelopers}
            label={i18n._(msg`Read the docs`)}
            variant="filled"
          />
        }
      />
    </>
  );
}
