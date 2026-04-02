import { MENU_DATA } from '@/app/(home)/constants/menu';
import { EDITORIAL_FOUR } from '@/app/why-twenty/constants/editorial-four';
import { EDITORIAL_ONE } from '@/app/why-twenty/constants/editorial-one';
import { EDITORIAL_THREE } from '@/app/why-twenty/constants/editorial-three';
import { EDITORIAL_TWO } from '@/app/why-twenty/constants/editorial-two';
import { HERO_DATA } from '@/app/why-twenty/constants/hero';
import { MARQUEE_DATA } from '@/app/why-twenty/constants/marquee';
import { QUOTE_DATA } from '@/app/why-twenty/constants/quote';
import { SIGNOFF_DATA } from '@/app/why-twenty/constants/signoff';
import { STATEMENT_ONE } from '@/app/why-twenty/constants/statement-one';
import { STATEMENT_TWO } from '@/app/why-twenty/constants/statement-two';
import { STEPPER_DATA } from '@/app/why-twenty/constants/stepper';
import { LinkButton } from '@/design-system/components';
import { Pages } from '@/enums/pages';
import { Editorial } from '@/sections/Editorial/components';
import { Hero } from '@/sections/Hero/components';
import { Marquee } from '@/sections/Marquee/components';
import { Menu } from '@/sections/Menu/components';
import { Quote } from '@/sections/Quote/components';
import { Signoff } from '@/sections/Signoff/components';
import { Statement } from '@/sections/Statement/components';
import { WhyTwentyStepper } from '@/sections/WhyTwentyStepper/components';
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
        backgroundColor={theme.colors.primary.background[100]}
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
