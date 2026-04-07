import { MENU_DATA } from '@/app/_constants';
import {
  EDITORIAL_FOUR,
  EDITORIAL_ONE,
  EDITORIAL_THREE,
  EDITORIAL_TWO,
  HERO_DATA,
  MARQUEE_DATA,
  QUOTE_DATA,
  SIGNOFF_DATA,
  STATEMENT_ONE,
  STATEMENT_TWO,
  STEPPER_DATA,
} from '@/app/why-twenty/_constants';
import { LinkButton } from '@/design-system/components';
import { Pages } from '@/enums/pages';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { Editorial } from '@/sections/Editorial/components';
import { Hero } from '@/sections/Hero/components';
import { Marquee } from '@/sections/Marquee/components';
import { Menu } from '@/sections/Menu/components';
import { Quote } from '@/sections/Quote/components';
import { Signoff } from '@/sections/Signoff/components';
import { Statement } from '@/sections/Statement/components';
import { WhyTwentyStepper } from '@/sections/WhyTwentyStepper/components';
import { theme } from '@/theme';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Why Twenty — Twenty',
  description:
    'Most packaged software makes companies more similar. Learn why the future of CRM is built, not bought.',
};

export default async function WhyTwentyPage() {
  const stats = await fetchCommunityStats();
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <>
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

      <Hero.Root backgroundColor={theme.colors.secondary.background[100]}>
        <Hero.Heading
          page={Pages.WhyTwenty}
          segments={HERO_DATA.heading}
          size="xl"
        />
        <Hero.Body page={Pages.WhyTwenty} body={HERO_DATA.body} />
        <Hero.WhyTwentyVisual />
      </Hero.Root>

      <Editorial.Root
        backgroundColor={theme.colors.secondary.background[100]}
        color={theme.colors.secondary.text[100]}
        mutedColor={theme.colors.secondary.text[60]}
      >
        <Editorial.Intro>
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

      <Editorial.Root
        backgroundColor={theme.colors.secondary.background[100]}
        color={theme.colors.secondary.text[100]}
        mutedColor={theme.colors.secondary.text[60]}
      >
        <Editorial.Intro>
          <Editorial.Eyebrow
            colorScheme="secondary"
            eyebrow={EDITORIAL_THREE.eyebrow!}
          />
          <Editorial.Heading segments={EDITORIAL_THREE.heading!} />
        </Editorial.Intro>
        <Editorial.Body body={EDITORIAL_THREE.body} layout="indented" />
      </Editorial.Root>

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

      <Editorial.Root
        backgroundColor={theme.colors.primary.background[100]}
        color={theme.colors.primary.text[100]}
        mutedColor={theme.colors.primary.text[60]}
      >
        <Editorial.Intro>
          <Editorial.Eyebrow
            colorScheme="primary"
            eyebrow={EDITORIAL_FOUR.eyebrow!}
          />
          <Editorial.Heading segments={EDITORIAL_FOUR.heading!} />
        </Editorial.Intro>
        <Editorial.Body body={EDITORIAL_FOUR.body} layout="two-column" />
      </Editorial.Root>

      <WhyTwentyStepper.Flow
        body={STEPPER_DATA.body}
        heading={STEPPER_DATA.heading}
        illustration={STEPPER_DATA.illustration}
      />

      <Signoff.Root
        backgroundColor={theme.colors.primary.text[10]}
        color={theme.colors.secondary.text[100]}
        variant="shaped"
        shapeFillColor={theme.colors.secondary.background[100]}
      >
        <Signoff.Heading segments={SIGNOFF_DATA.heading} />
        <Signoff.Body body={SIGNOFF_DATA.body} />
        <Signoff.Cta>
          <LinkButton
            color="primary"
            href="https://app.twenty.com/welcome"
            label="Get started"
            type="anchor"
            variant="contained"
          />
        </Signoff.Cta>
      </Signoff.Root>
    </>
  );
}
