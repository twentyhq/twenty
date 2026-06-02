import { msg } from '@lingui/core/macro';
import { EnterpriseActivateClient } from '@/app/[locale]/enterprise/activate/EnterpriseActivateClient';
import { Body, Container } from '@/design-system/components';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { getRouteI18n, type LocaleRouteParams } from '@/lib/i18n/server';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { EnterpriseActivateHero } from '@/app/[locale]/enterprise/activate/_components/EnterpriseActivateHero';
import { Menu, MENU_DATA } from '@/sections/Menu';
import { theme } from '@/theme';
import { buildRouteMetadata } from '@/lib/seo';
import { Suspense } from 'react';
import { styled } from '@linaria/react';

export const generateMetadata = buildRouteMetadata('enterpriseActivate');

const ActivatePageContent = styled.section`
  background-color: ${theme.colors.primary.background[100]};
  flex: 1;
  padding-bottom: ${theme.spacing(20)};
  padding-top: ${theme.spacing(8)};
  width: 100%;
`;

const ActivateContentInner = styled.div`
  margin-left: auto;
  margin-right: auto;
  max-width: 640px;
  width: 100%;
`;

type EnterpriseActivateFallbackProps = {
  loadingLabel: string;
};

function EnterpriseActivateFallback({
  loadingLabel,
}: EnterpriseActivateFallbackProps) {
  return (
    <Body size="sm" variant="body-paragraph">
      {loadingLabel}
    </Body>
  );
}

type EnterpriseActivatePageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function EnterpriseActivatePage({
  params,
}: EnterpriseActivatePageProps) {
  const [i18n, stats] = await Promise.all([
    getRouteI18n(params),
    fetchCommunityStats(),
  ]);
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <>
      <Menu backgroundColor="#F3F3F3" socialLinks={menuSocialLinks} />

      <EnterpriseActivateHero />

      <ActivatePageContent>
        <Container>
          <ActivateContentInner>
            <Suspense
              fallback={
                <EnterpriseActivateFallback
                  loadingLabel={i18n._(msg`Loading activation…`)}
                />
              }
            >
              <EnterpriseActivateClient />
            </Suspense>
          </ActivateContentInner>
        </Container>
      </ActivatePageContent>
    </>
  );
}
