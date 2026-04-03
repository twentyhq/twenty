import {
  CONTRIBUTORS_HERO_BODY,
  CONTRIBUTORS_HERO_HEADING,
} from '@/app/contributors/constants/hero';
import { LinkButton } from '@/design-system/components';
import { Pages } from '@/enums/pages';
import { getMenuData } from '@/lib/community/get-menu-data';
import { fetchPublicRepoContributors } from '@/lib/github/fetch-public-repo-contributors';
import { Contributors } from '@/sections/Contributors/components';
import { Hero } from '@/sections/Hero/components';
import { Menu } from '@/sections/Menu/components';
import { theme } from '@/theme';
import { ScrollReveal } from '@/motion/ScrollReveal';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contributors — Twenty',
  description:
    'Meet the people who ship Twenty forward on the open source GitHub repository.',
};

export default async function ContributorsPage() {
  const [{ contributors, loadFailed }, menuData] = await Promise.all([
    fetchPublicRepoContributors(),
    getMenuData(),
  ]);

  return (
    <>
      <Menu.Root
        backgroundColor={theme.colors.primary.background[100]}
        scheme="primary"
        navItems={menuData.navItems}
        socialLinks={menuData.socialLinks}
      >
        <Menu.Logo scheme="primary" />
        <Menu.Nav scheme="primary" navItems={menuData.navItems} />
        <Menu.Social scheme="primary" socialLinks={menuData.socialLinks} />
        <Menu.Cta scheme="primary" />
      </Menu.Root>

      <ScrollReveal>
        <Hero.Root backgroundColor={theme.colors.primary.background[100]}>
          <Hero.Heading
            page={Pages.Contributors}
            segments={CONTRIBUTORS_HERO_HEADING}
            size="lg"
            weight="light"
          />
          <Hero.Body
            page={Pages.Contributors}
            body={CONTRIBUTORS_HERO_BODY}
            size="sm"
          />
          <Hero.Cta>
            <LinkButton
              color="secondary"
              href="https://github.com/twentyhq/twenty"
              label="View on GitHub"
              type="anchor"
              variant="outlined"
            />
          </Hero.Cta>
        </Hero.Root>
      </ScrollReveal>

      <ScrollReveal>
        <Contributors.Root>
          <Contributors.Grid
            contributors={contributors}
            loadFailed={loadFailed}
          />
        </Contributors.Root>
      </ScrollReveal>
    </>
  );
}
