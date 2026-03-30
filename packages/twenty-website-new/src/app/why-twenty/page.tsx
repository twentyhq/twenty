import { MENU_DATA } from '@/app/(home)/constants/menu';
import { HERO_DATA } from '@/app/why-twenty/constants/hero';
import { Pages } from '@/enums/pages';
import { Hero } from '@/sections/Hero/components';
import { Menu } from '@/sections/Menu/components';
import { theme } from '@/theme';

export default function WhyTwentyPage() {
  return (
    <>
      <Menu.Root
        backgroundColor={theme.colors.secondary.background[100]}
        scheme="secondary"
        navItems={MENU_DATA.navItems}
        socialLinks={MENU_DATA.socialLinks}
      >
        <Menu.Logo scheme="secondary" />
        <Menu.Nav scheme="secondary" navItems={MENU_DATA.navItems} />
        <Menu.Social scheme="secondary" socialLinks={MENU_DATA.socialLinks} />
        <Menu.Cta scheme="secondary" />
      </Menu.Root>

      <Hero.Root backgroundColor={theme.colors.secondary.background[100]}>
        <Hero.Heading
          page={Pages.WhyTwenty}
          segments={HERO_DATA.heading}
          size="xl"
        />
        <Hero.Body page={Pages.WhyTwenty} body={HERO_DATA.body} />
        <Hero.WhyTwentyVisual
          image={HERO_DATA.image}
          illustration={HERO_DATA.illustration}
        />
      </Hero.Root>
    </>
  );
}
