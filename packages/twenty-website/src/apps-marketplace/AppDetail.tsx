import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
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
import { AppsGrid } from './AppsGrid';
import { buildAppInstallUrl } from './build-app-install-url';
import {
  type MarketplaceApp,
  type MarketplaceAppDetail,
} from './marketplace-app';

const HeroRow = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${spacing(6)};

  ${mediaUp('md')} {
    align-items: center;
    flex-direction: row;
    gap: ${spacing(8)};
  }
`;

const HeroText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(3)};
  min-width: 0;
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

const DetailInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(10)};
  margin-inline: auto;
  max-width: 1240px;
  width: 100%;
`;

const ContentGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(10)};

  ${mediaUp('md')} {
    column-gap: ${spacing(9)};
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(18.5rem, 21rem);
  }

  ${mediaUp('lg')} {
    column-gap: ${spacing(10)};
  }
`;

const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(6)};
  min-width: 0;

  ${mediaUp('md')} {
    grid-column: 1;
    grid-row: 1;
  }
`;

const ScreenshotList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(5)};
`;

const Screenshot = styled.img`
  aspect-ratio: 16 / 10;
  background-color: ${semanticColor.surface};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: block;
  height: auto;
  object-fit: cover;
  width: 100%;
`;

const Sidebar = styled.aside`
  align-self: flex-start;
  background-color: ${color('black-5')};
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  gap: ${spacing(4)};
  padding: ${spacing(6)};
  width: 100%;

  ${mediaUp('md')} {
    grid-column: 2;
    grid-row: 1;
    padding: ${spacing(7.5)};
    position: sticky;
    top: ${spacing(20)};
  }
`;

const DetailRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(1)};
`;

const DetailLabel = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.75)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const DetailValue = styled.span`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  word-break: break-word;
`;

const DetailLink = styled(ExternalLink)`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  text-decoration: underline;
  word-break: break-word;
`;

const Divider = styled.hr`
  background-color: ${semanticColor.line};
  border: 0;
  height: 1px;
  width: 100%;
`;

type AppDetailProps = {
  app: MarketplaceAppDetail;
  relatedApps: readonly MarketplaceApp[];
};

export function AppDetail({ app, relatedApps }: AppDetailProps) {
  const i18n = getServerI18n();
  const installUrl = buildAppInstallUrl(app.universalIdentifier);

  return (
    <>
      <SectionShell rhythm="hero" scheme="light">
        <DetailInner>
          <BackLink href="/apps">{i18n._(msg`← Twenty apps`)}</BackLink>
          <HeroRow>
            <AppLogo
              name={app.name}
              logoUrl={app.logoUrl}
              size={96}
              loading="eager"
            />
            <HeroText>
              <Heading as="h1" size="lg" weight="light">
                {app.name}
              </Heading>
              <Body muted size="md">
                {app.tagline}
              </Body>
            </HeroText>
          </HeroRow>

          <ContentGrid>
            <Sidebar>
              <Button
                href={installUrl}
                label={i18n._(msg`Install`)}
                variant="filled"
              />
              <Divider aria-hidden="true" />
              <DetailRow>
                <DetailLabel>{i18n._(msg`Developer`)}</DetailLabel>
                <DetailValue>{app.author}</DetailValue>
              </DetailRow>
              {app.category.length > 0 && (
                <DetailRow>
                  <DetailLabel>{i18n._(msg`Category`)}</DetailLabel>
                  <DetailValue>{app.category}</DetailValue>
                </DetailRow>
              )}
              {isDefined(app.latestAvailableVersion) && (
                <DetailRow>
                  <DetailLabel>{i18n._(msg`Version`)}</DetailLabel>
                  <DetailValue>{app.latestAvailableVersion}</DetailValue>
                </DetailRow>
              )}
              {app.websiteUrl !== undefined && (
                <DetailRow>
                  <DetailLabel>{i18n._(msg`Source`)}</DetailLabel>
                  <DetailLink href={app.websiteUrl}>GitHub</DetailLink>
                </DetailRow>
              )}
            </Sidebar>

            <MainColumn>
              {app.screenshots.length > 0 && (
                <ScreenshotList>
                  {app.screenshots.map((screenshot) => (
                    <Screenshot
                      key={screenshot}
                      src={screenshot}
                      alt={i18n._(msg`${app.name} screenshot`)}
                      loading="lazy"
                    />
                  ))}
                </ScreenshotList>
              )}
              {isDefined(app.aboutDescription) && (
                <AppReadme markdown={app.aboutDescription} />
              )}
            </MainColumn>
          </ContentGrid>
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
