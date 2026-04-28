import { MENU_DATA } from '@/sections/Menu/data';
import { EDITORIAL_FOUR } from '@/app/[locale]/why-twenty/editorial-four.data';
import { EDITORIAL_ONE } from '@/app/[locale]/why-twenty/editorial-one.data';
import { EDITORIAL_THREE } from '@/app/[locale]/why-twenty/editorial-three.data';
import { HERO_DATA } from '@/app/[locale]/why-twenty/hero.data';
import { MARQUEE_DATA } from '@/app/[locale]/why-twenty/marquee.data';
import { SIGNOFF_DATA } from '@/app/[locale]/why-twenty/signoff.data';
import { LinkButton } from '@/design-system/components';
import { Pages } from '@/lib/pages';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { Editorial } from '@/sections/Editorial/components';
import { Hero } from '@/sections/Hero/components';
import { Marquee } from '@/sections/Marquee/components';
import { Menu } from '@/sections/Menu/components';
import { Signoff } from '@/sections/Signoff/components';
import { theme } from '@/theme';
import { buildRouteMetadata } from '@/lib/seo';
import { css } from '@linaria/core';

const editorialOneIntroClass = css`
  margin-bottom: ${theme.spacing(4)};
  --editorial-heading-max-width: 760px;
  --editorial-intro-max-width: 760px;

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-bottom: ${theme.spacing(8)};
  }
`;

const editorialRightIntroClass = css`
  margin-bottom: ${theme.spacing(4)};
  --editorial-heading-max-width: 760px;
  --editorial-intro-max-width: 760px;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: flex-end;
    margin-bottom: ${theme.spacing(8)};
    margin-left: auto;
    margin-right: 0;
    text-align: right;
    width: auto;
  }
`;

const crosshairLineColor = theme.colors.secondary.border[10];

const sectionCrosshairLeft = {
  crossX: '120px',
  crossY: '0px',
  lineColor: crosshairLineColor,
};

const sectionCrosshairRight = {
  crossX: 'calc(100% - 120px)',
  crossY: '0px',
  lineColor: crosshairLineColor,
};

export const generateMetadata = buildRouteMetadata('whyTwenty');

export default async function WhyTwentyPage() {
  const stats = await fetchCommunityStats();
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <>
      {/*
       * Above-the-fold hero scene. Preload kicks off the GLB fetch in
       * parallel with the JS chunk download, so the model is already in
       * the browser cache by the time Three.js asks for it.
       */}
      <link
        as="fetch"
        href="/illustrations/why-twenty/hero/hero.glb"
        rel="preload"
      />
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
        crosshair={sectionCrosshairRight}
      >
        <Editorial.Intro className={editorialOneIntroClass}>
          <Editorial.Eyebrow
            colorScheme="secondary"
            eyebrow={EDITORIAL_ONE.eyebrow!}
          />
          <Editorial.Heading segments={EDITORIAL_ONE.heading!} />
        </Editorial.Intro>
        <Editorial.Body
          body={EDITORIAL_ONE.body}
          color={theme.colors.secondary.text[60]}
          layout="two-column-left"
        />
      </Editorial.Root>

      {/*
      <Editorial.Root
        backgroundColor={theme.colors.secondary.background[100]}
        color={theme.colors.secondary.text[100]}
      >
        <Editorial.Body
          body={EDITORIAL_TWO.body}
          color={theme.colors.secondary.text[60]}
          layout="centered"
        />
      </Editorial.Root>
      */}

      <Editorial.Root
        backgroundColor={theme.colors.secondary.background[100]}
        color={theme.colors.secondary.text[100]}
        crosshair={sectionCrosshairLeft}
      >
        <Editorial.Intro className={editorialRightIntroClass}>
          <Editorial.Eyebrow
            colorScheme="secondary"
            eyebrow={EDITORIAL_FOUR.eyebrow!}
          />
          <Editorial.Heading segments={EDITORIAL_FOUR.heading!} />
        </Editorial.Intro>
        <Editorial.Body
          body={EDITORIAL_FOUR.body}
          color={theme.colors.secondary.text[60]}
          layout="two-column-right"
        />
      </Editorial.Root>

      <Editorial.Root
        backgroundColor={theme.colors.secondary.background[100]}
        color={theme.colors.secondary.text[100]}
        crosshair={sectionCrosshairRight}
      >
        <Editorial.Intro className={editorialOneIntroClass}>
          <Editorial.Eyebrow
            colorScheme="secondary"
            eyebrow={EDITORIAL_THREE.eyebrow!}
          />
          <Editorial.Heading segments={EDITORIAL_THREE.heading!} />
        </Editorial.Intro>
        <Editorial.Body
          body={EDITORIAL_THREE.body}
          color={theme.colors.secondary.text[60]}
          layout="two-column-left"
        />
      </Editorial.Root>

      <Marquee.Root
        backgroundColor={theme.colors.secondary.background[100]}
        color={theme.colors.secondary.text[100]}
      >
        <Marquee.Heading segments={MARQUEE_DATA.heading} />
      </Marquee.Root>

      <Signoff.Root
        backgroundColor={theme.colors.secondary.background[100]}
        color={theme.colors.secondary.text[100]}
        page={Pages.WhyTwenty}
      >
        <Signoff.Heading
          page={Pages.WhyTwenty}
          segments={SIGNOFF_DATA.heading}
        />
        <Signoff.Body body={SIGNOFF_DATA.body} page={Pages.WhyTwenty} />
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
