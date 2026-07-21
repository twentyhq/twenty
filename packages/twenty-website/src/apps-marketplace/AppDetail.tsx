import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, Button, ExternalLink, Heading, SectionShell } from '@/ui';

import { AppLogo } from './AppLogo';
import { buildAppInstallUrl } from './build-app-install-url';
import { type MarketplaceAppDetail } from './marketplace-app';

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

const CategoryEyebrow = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.08em;
  line-height: ${fontSize(4)};
  text-transform: uppercase;
`;

const HeroActions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(4)};
  margin-top: ${spacing(2)};
`;

const VettedBadge = styled.span`
  align-items: center;
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(4)};
  color: ${semanticColor.inkMuted};
  display: inline-flex;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2)};
  font-weight: ${FONT_WEIGHT.medium};
  gap: ${spacing(2)};
  letter-spacing: 0.06em;
  padding: ${spacing(1)} ${spacing(3)};
  text-transform: uppercase;
`;

const ContentGrid = styled.div`
  display: grid;
  gap: ${spacing(8)};
  grid-template-columns: 1fr;

  ${mediaUp('lg')} {
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  }
`;

const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(6)};
  min-width: 0;
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
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  gap: ${spacing(4)};
  padding: ${spacing(6)};
`;

const DetailRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(1)};
`;

const DetailLabel = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2)};
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
};

export function AppDetail({ app }: AppDetailProps) {
  const i18n = getServerI18n();
  const installUrl = buildAppInstallUrl(app.universalIdentifier);

  return (
    <>
      <SectionShell rhythm="hero" scheme="light">
        <HeroRow>
          <AppLogo
            name={app.name}
            logoUrl={app.logoUrl}
            size={96}
            loading="eager"
          />
          <HeroText>
            {app.category.length > 0 && (
              <CategoryEyebrow>{app.category}</CategoryEyebrow>
            )}
            <Heading as="h1" size="lg" weight="light">
              {app.name}
            </Heading>
            <Body muted size="md">
              {app.tagline}
            </Body>
            <HeroActions>
              <Button
                href={installUrl}
                label={i18n._(msg`Install`)}
                variant="filled"
              />
              <VettedBadge>{i18n._(msg`Vetted by Twenty`)}</VettedBadge>
            </HeroActions>
          </HeroText>
        </HeroRow>
      </SectionShell>

      <SectionShell rhythm="section" scheme="light">
        <ContentGrid>
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
          </MainColumn>

          <Sidebar>
            <Button
              href={installUrl}
              label={i18n._(msg`Install on Twenty`)}
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
            {app.sourcePackage !== undefined && (
              <DetailRow>
                <DetailLabel>{i18n._(msg`Package`)}</DetailLabel>
                <DetailValue>{app.sourcePackage}</DetailValue>
              </DetailRow>
            )}
            {app.websiteUrl !== undefined && (
              <DetailRow>
                <DetailLabel>{i18n._(msg`Website`)}</DetailLabel>
                <DetailLink href={app.websiteUrl}>{app.websiteUrl}</DetailLink>
              </DetailRow>
            )}
          </Sidebar>
        </ContentGrid>
      </SectionShell>
    </>
  );
}
