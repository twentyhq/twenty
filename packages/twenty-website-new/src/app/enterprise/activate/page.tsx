import { MENU_DATA } from '@/app/_constants';
import { EnterpriseActivateClient } from '@/app/enterprise/activate/EnterpriseActivateClient';
import { Body, Container, Eyebrow } from '@/design-system/components';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import { Pages } from '@/enums/pages';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { Hero } from '@/sections/Hero/components';
import { Menu } from '@/sections/Menu/components';
import { theme } from '@/theme';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { styled } from '@linaria/react';

export const metadata: Metadata = {
  title: 'Enterprise activation | Twenty',
  description:
    'Complete activation for your Twenty self-hosted enterprise license.',
};

const ENTERPRISE_ACTIVATE_HEADING: HeadingType[] = [
  { text: 'Enterprise ', fontFamily: 'serif' },
  { text: 'activation', fontFamily: 'sans' },
];

const ENTERPRISE_ACTIVATE_BODY = {
  text: 'Your checkout is complete. Follow the steps below to copy your license key into your Twenty instance.',
};

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

function EnterpriseActivateFallback() {
  return (
    <Body
      body={{ text: 'Loading activation…' }}
      size="sm"
      variant="body-paragraph"
    />
  );
}

export default async function EnterpriseActivatePage() {
  const stats = await fetchCommunityStats();
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

      <Hero.Root
        backgroundColor={theme.colors.secondary.background[5]}
        colorScheme="primary"
      >
        <Eyebrow
          colorScheme="primary"
          heading={{ text: 'Self-hosting', fontFamily: 'sans' }}
        />
        <Hero.Heading
          page={Pages.Pricing}
          segments={ENTERPRISE_ACTIVATE_HEADING}
        />
        <Hero.Body body={ENTERPRISE_ACTIVATE_BODY} page={Pages.Pricing} />
      </Hero.Root>

      <ActivatePageContent>
        <Container>
          <ActivateContentInner>
            <Suspense fallback={<EnterpriseActivateFallback />}>
              <EnterpriseActivateClient />
            </Suspense>
          </ActivateContentInner>
        </Container>
      </ActivatePageContent>
    </>
  );
}
