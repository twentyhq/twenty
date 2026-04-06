import { MENU_DATA } from '@/app/_constants';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import {
  OSS_FRIENDS_HERO_BODY,
  OSS_FRIENDS_HERO_HEADING,
} from '@/app/oss-friends/_constants/hero';
import { Pages } from '@/enums/pages';
import { fetchOssFriends } from '@/lib/oss-friends/fetch-oss-friends';
import { ScrollReveal } from '@/motion/ScrollReveal';
import { Hero } from '@/sections/Hero/components';
import { Menu } from '@/sections/Menu/components';
import { OssFriends } from '@/sections/OssFriends/components';
import { theme } from '@/theme';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OSS friends — Twenty',
  description:
    'At Twenty, we are proud to be part of a global open-source movement. Here are some of our fellow open source friends.',
};

export default async function OssFriendsPage() {
  const [{ friends, loadFailed }, stats] = await Promise.all([
    fetchOssFriends(),
    fetchCommunityStats(),
  ]);
  const menuSocialLinks = mergeSocialLinkLabels(
    MENU_DATA.socialLinks,
    stats,
  );

  return (
    <>
      <Menu.Root
        backgroundColor={theme.colors.primary.background[100]}
        scheme="primary"
        navItems={MENU_DATA.navItems}
        socialLinks={menuSocialLinks}
      >
        <Menu.Logo scheme="primary" />
        <Menu.Nav scheme="primary" navItems={MENU_DATA.navItems} />
        <Menu.Social scheme="primary" socialLinks={menuSocialLinks} />
        <Menu.Cta scheme="primary" />
      </Menu.Root>

      <ScrollReveal>
        <Hero.Root backgroundColor={theme.colors.primary.background[100]}>
          <Hero.Heading
            page={Pages.OssFriends}
            segments={OSS_FRIENDS_HERO_HEADING}
            size="lg"
            weight="light"
          />
          <Hero.Body
            page={Pages.OssFriends}
            body={OSS_FRIENDS_HERO_BODY}
            size="sm"
          />
        </Hero.Root>
      </ScrollReveal>

      <ScrollReveal>
        <OssFriends.Root>
          <OssFriends.Grid friends={friends} loadFailed={loadFailed} />
        </OssFriends.Root>
      </ScrollReveal>
    </>
  );
}
