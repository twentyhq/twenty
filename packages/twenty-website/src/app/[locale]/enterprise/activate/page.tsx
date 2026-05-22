import { msg } from '@lingui/core/macro';
import { EnterpriseActivateClient } from '@/app/[locale]/enterprise/activate/EnterpriseActivateClient';
import {
  Body,
  Container,
  Eyebrow,
  HeadingPart,
} from '@/design-system/components';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/lib/i18n/utils/get-route-i18n';
import { Pages } from '@/lib/pages';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { Hero } from '@/sections/Hero';
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
      <Menu.Root
        backgroundColor="#F3F3F3"
        scheme="primary"
        navItems={MENU_DATA.navItems}
        socialLinks={menuSocialLinks}
      >
        <Menu.Logo scheme="primary" />
        <Menu.Nav scheme="primary" navItems={MENU_DATA.navItems} />
        <Menu.Social scheme="primary" socialLinks={menuSocialLinks} />
        <Menu.Cta scheme="primary" />
      </Menu.Root>

      <Hero.Root scheme="muted">
        <Eyebrow>
          <HeadingPart fontFamily="sans">
            {i18n._(msg`Self-hosting`)}
          </HeadingPart>
        </Eyebrow>
        <Hero.Heading page={Pages.Pricing}>
          <HeadingPart fontFamily="serif">
            {i18n._(msg`Enterprise`)}
          </HeadingPart>{' '}
          <HeadingPart fontFamily="sans">{i18n._(msg`activation`)}</HeadingPart>
        </Hero.Heading>
        <Hero.Body page={Pages.Pricing}>
          {i18n._(
            msg`Your checkout is complete. Follow the steps below to copy your license key into your Twenty instance.`,
          )}
        </Hero.Body>
      </Hero.Root>

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
