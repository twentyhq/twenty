import { MENU_DATA } from '@/app/_constants';
import {
  EDITORIAL_ONE,
  EDITORIAL_TWO,
  HERO_DATA,
  MARQUEE_DATA,
  QUOTE_DATA,
} from '@/app/why-twenty/_constants';
import { Pages } from '@/enums/pages';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { OverflowProbe } from '@/lib/debug/overflow-probe';
import { Editorial } from '@/sections/Editorial/components';
import { Hero } from '@/sections/Hero/components';
import { Marquee } from '@/sections/Marquee/components';
import { Menu } from '@/sections/Menu/components';
import { Quote } from '@/sections/Quote/components';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import type { Metadata } from 'next';

const editorialOneIntroClass = css`
  margin-bottom: ${theme.spacing(4)};
  --editorial-heading-max-width: 760px;
  --editorial-intro-max-width: 760px;

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-bottom: ${theme.spacing(8)};
  }
`;

export const metadata: Metadata = {
  title: 'Why Twenty | Twenty',
  description:
    'Most packaged software makes companies more similar. Learn why the future of CRM is built, not bought.',
};

export default async function WhyTwentyPage() {
  const stats = await fetchCommunityStats();
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <>
      <OverflowProbe />
      <Menu.Root
        backgroundColor={theme.colors.secondary.background[100]}
        scheme="secondary"
        navItems={MENU_DATA.navItems}
        socialLinks={menuSocialLinks}
      >
        <Menu.Logo scheme="secondary" />
        <Menu.Nav scheme="secondary" navItems={MENU_DATA.navItems} />
        <Menu.Social scheme="secondary" socialLinks={menuSocialLinks} />
        <Menu.Cta scheme="secondary" />
      </Menu.Root>

      <Hero.Root
        backgroundColor={theme.colors.secondary.background[100]}
        colorScheme="secondary"
      >
        <Hero.Heading
          page={Pages.WhyTwenty}
          segments={HERO_DATA.heading}
          size="xl"
        />
        <Hero.Body body={HERO_DATA.body} page={Pages.WhyTwenty} />
        <Hero.WhyTwentyVisual />
      </Hero.Root>

      <Editorial.Root
        backgroundColor={theme.colors.secondary.background[100]}
        color={theme.colors.secondary.text[100]}
        mutedColor={theme.colors.secondary.text[60]}
      >
        <Editorial.Intro className={editorialOneIntroClass}>
          <Editorial.Eyebrow
            colorScheme="secondary"
            eyebrow={EDITORIAL_ONE.eyebrow!}
          />
          <Editorial.Heading segments={EDITORIAL_ONE.heading!} />
        </Editorial.Intro>
        <Editorial.Body body={EDITORIAL_ONE.body} layout="two-column" />
      </Editorial.Root>

      <Quote.Root backgroundColor={theme.colors.secondary.background[100]}>
        <Quote.Visual illustration={QUOTE_DATA.illustration} />
        <Quote.Heading segments={QUOTE_DATA.heading} />
      </Quote.Root>

      <Editorial.Root
        backgroundColor={theme.colors.secondary.background[100]}
        color={theme.colors.secondary.text[100]}
        mutedColor={theme.colors.secondary.text[60]}
      >
        <Editorial.Body body={EDITORIAL_TWO.body} layout="centered" />
      </Editorial.Root>

      <Marquee.Root
        backgroundColor={theme.colors.secondary.background[100]}
        color={theme.colors.secondary.text[100]}
        heading={MARQUEE_DATA.heading}
      />
    </>
  );
}
