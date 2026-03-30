import { MENU_DATA } from '@/app/(home)/constants/menu';
import { HERO_DATA } from '@/app/why-twenty/constants/hero';
import { QUOTE_DATA } from '@/app/why-twenty/constants/quote';
import { STATEMENT_ONE } from '@/app/why-twenty/constants/statement-one';
import { STATEMENT_TWO } from '@/app/why-twenty/constants/statement-two';
import { Pages } from '@/enums/pages';
import { Hero } from '@/sections/Hero/components';
import { Menu } from '@/sections/Menu/components';
import { Quote } from '@/sections/Quote/components';
import { Statement } from '@/sections/Statement/components';
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

      <Quote.Root backgroundColor={theme.colors.secondary.background[100]}>
        <Quote.Visual illustration={QUOTE_DATA.illustration} />
        <Quote.Heading segments={QUOTE_DATA.heading} />
      </Quote.Root>

      <Statement.Root
        backgroundColor={theme.colors.secondary.background[100]}
        color={theme.colors.secondary.text[100]}
      >
        <Statement.Heading segments={STATEMENT_ONE.heading} />
      </Statement.Root>

      <Statement.Root
        backgroundColor={theme.colors.primary.background[100]}
        color={theme.colors.primary.text[100]}
      >
        <Statement.Heading segments={STATEMENT_TWO.heading} />
      </Statement.Root>
    </>
  );
}
