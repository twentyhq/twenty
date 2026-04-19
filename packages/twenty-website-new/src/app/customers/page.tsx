import { FAQ_DATA, MENU_DATA, TRUSTED_BY_DATA } from '@/app/_constants';
import { TalkToUsButton } from '@/app/components/ContactCalModal';
import { CASE_STUDY_CATALOG_ENTRIES } from '@/app/customers/_constants';
import { Eyebrow, LinkButton } from '@/design-system/components';
import { Pages } from '@/enums/pages';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { CaseStudyCatalog } from '@/sections/CaseStudyCatalog/components';
import { Faq } from '@/sections/Faq/components';
import { Hero } from '@/sections/Hero/components';
import { Menu } from '@/sections/Menu/components';
import { Signoff } from '@/sections/Signoff/components';
import { TrustedBy } from '@/sections/TrustedBy/components';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customers | Twenty',
  description:
    'Meet the teams running their business on Twenty. Real customer stories on how they shaped the CRM to fit their workflow.',
  alternates: { canonical: '/customers' },
  openGraph: {
    title: 'Customers | Twenty',
    description:
      'Meet the teams running their business on Twenty. Real customer stories on how they shaped the CRM to fit their workflow.',
    url: '/customers',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Customers | Twenty',
    description:
      'Meet the teams running their business on Twenty. Real customer stories on how they shaped the CRM to fit their workflow.',
  },
};

const HERO_HEADING = [
  { text: 'See how teams ', fontFamily: 'serif' as const },
  { text: 'build ', fontFamily: 'serif' as const, newLine: true },
  { text: 'on Twenty', fontFamily: 'sans' as const },
];

const HERO_BODY = {
  text: 'Real stories from real teams about how they shaped Twenty to fit their workflow and accelerated their growth.',
};

const SIGNOFF_HEADING = [
  { text: 'Ready to build\n', fontFamily: 'serif' as const },
  { text: 'your own story?', fontFamily: 'sans' as const },
];

const SIGNOFF_BODY = {
  text: 'Join the teams that chose to own their CRM.\nStart building with Twenty today.',
};

const CUSTOMERS_TOP_BACKGROUND_COLOR = '#F4F4F4';

const pageRevealClassName = css`
  @keyframes customersPageReveal {
    from {
      opacity: 0;
      transform: translate3d(0, 20px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  background-color: ${CUSTOMERS_TOP_BACKGROUND_COLOR};

  & > * {
    animation: customersPageReveal 720ms cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: 80ms;
  }

  @media (prefers-reduced-motion: reduce) {
    & > * {
      animation: none;
    }
  }
`;

export default async function CaseStudiesCatalogPage() {
  const stats = await fetchCommunityStats();
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <>
      <Menu.Root
        backgroundColor={CUSTOMERS_TOP_BACKGROUND_COLOR}
        scheme="primary"
        navItems={MENU_DATA.navItems}
        socialLinks={menuSocialLinks}
      >
        <Menu.Logo scheme="primary" />
        <Menu.Nav scheme="primary" navItems={MENU_DATA.navItems} />
        <Menu.Social scheme="primary" socialLinks={menuSocialLinks} />
        <Menu.Cta scheme="primary" />
      </Menu.Root>

      <div className={pageRevealClassName}>
        <Hero.Root backgroundColor={CUSTOMERS_TOP_BACKGROUND_COLOR}>
          <Hero.Heading page={Pages.CaseStudies} segments={HERO_HEADING} />
          <Hero.Body body={HERO_BODY} page={Pages.CaseStudies} />
        </Hero.Root>
        <TrustedBy.Root
          cardBackgroundColor={CUSTOMERS_TOP_BACKGROUND_COLOR}
          compactBottom
        >
          <TrustedBy.Separator separator={TRUSTED_BY_DATA.separator} />
          <TrustedBy.Logos logos={TRUSTED_BY_DATA.logos} />
          <TrustedBy.ClientCount
            label={TRUSTED_BY_DATA.clientCountLabel.text}
          />
        </TrustedBy.Root>
      </div>

      <CaseStudyCatalog.Grid compactTop entries={CASE_STUDY_CATALOG_ENTRIES} />

      <Signoff.Root
        backgroundColor={theme.colors.primary.background[100]}
        color={theme.colors.primary.text[100]}
        page={Pages.Partners}
      >
        <Signoff.Heading page={Pages.Partners} segments={SIGNOFF_HEADING} />
        <Signoff.Body body={SIGNOFF_BODY} page={Pages.Partners} />
        <Signoff.Cta>
          <LinkButton
            color="secondary"
            href="https://app.twenty.com/welcome"
            label="Get started"
            type="anchor"
            variant="contained"
          />
          <TalkToUsButton
            color="secondary"
            label="Talk to us"
            variant="outlined"
          />
        </Signoff.Cta>
      </Signoff.Root>

      <Faq.Root illustration={FAQ_DATA.illustration}>
        <Faq.Intro>
          <Eyebrow colorScheme="secondary" heading={FAQ_DATA.eyebrow.heading} />
          <Faq.Heading segments={FAQ_DATA.heading} />
          <Faq.Cta>
            <LinkButton
              color="primary"
              href="https://app.twenty.com/welcome"
              label="Get started"
              type="anchor"
              variant="contained"
            />
            <TalkToUsButton
              color="primary"
              label="Talk to us"
              variant="outlined"
            />
          </Faq.Cta>
        </Faq.Intro>
        <Faq.Items questions={FAQ_DATA.questions} />
      </Faq.Root>
    </>
  );
}
