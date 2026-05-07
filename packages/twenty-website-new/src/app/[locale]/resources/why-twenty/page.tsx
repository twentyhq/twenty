import { msg } from '@lingui/core/macro';
import { MENU_DATA } from '@/sections/Menu/data';
import { EDITORIAL_FOUR } from '@/app/[locale]/resources/why-twenty/editorial-four.data';
import { EDITORIAL_ONE } from '@/app/[locale]/resources/why-twenty/editorial-one.data';
import { EDITORIAL_THREE } from '@/app/[locale]/resources/why-twenty/editorial-three.data';
import { HERO_COPY } from '@/app/[locale]/resources/why-twenty/hero.data';
import { MARQUEE_DATA } from '@/app/[locale]/resources/why-twenty/marquee.data';
import { SIGNOFF_COPY } from '@/app/[locale]/resources/why-twenty/signoff.data';
import { HeadingPart, LinkButton } from '@/design-system/components';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { createMessageDescriptorRenderer } from '@/lib/i18n/create-message-descriptor-renderer';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/lib/i18n/get-route-i18n';
import { Pages } from '@/lib/pages';
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

type WhyTwentyPageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function WhyTwentyPage({ params }: WhyTwentyPageProps) {
  const [i18n, stats] = await Promise.all([
    getRouteI18n(params),
    fetchCommunityStats(),
  ]);
  const renderText = createMessageDescriptorRenderer(i18n);
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
        <Hero.Heading page={Pages.WhyTwenty} size="xl">
          <HeadingPart fontFamily="serif">
            {renderText(msg`The future of CRM is built,`)}
          </HeadingPart>{' '}
          <HeadingPart fontFamily="sans">
            {renderText(msg`not bought.`)}
          </HeadingPart>
        </Hero.Heading>
        <Hero.Body
          body={{ text: HERO_COPY.body }}
          page={Pages.WhyTwenty}
          renderText={renderText}
        />
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
            renderText={renderText}
          />
          <Editorial.Heading>
            <HeadingPart fontFamily="serif">
              {renderText(msg`CRM was a ledger.`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {renderText(msg`AI turned it into an operating system.`)}
            </HeadingPart>
          </Editorial.Heading>
        </Editorial.Intro>
        <Editorial.Body
          body={EDITORIAL_ONE.body}
          color={theme.colors.secondary.text[60]}
          layout="two-column-left"
          renderText={renderText}
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
          renderText={renderText}
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
            renderText={renderText}
          />
          <Editorial.Heading>
            <HeadingPart fontFamily="serif">
              {renderText(msg`Differentiation now`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {renderText(msg`lives in the code you own.`)}
            </HeadingPart>
          </Editorial.Heading>
        </Editorial.Intro>
        <Editorial.Body
          body={EDITORIAL_FOUR.body}
          color={theme.colors.secondary.text[60]}
          layout="two-column-right"
          renderText={renderText}
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
            renderText={renderText}
          />
          <Editorial.Heading>
            <HeadingPart fontFamily="serif">
              {renderText(msg`Build it in an afternoon.`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {renderText(msg`AI made the gap that small.`)}
            </HeadingPart>
          </Editorial.Heading>
        </Editorial.Intro>
        <Editorial.Body
          body={EDITORIAL_THREE.body}
          color={theme.colors.secondary.text[60]}
          layout="two-column-left"
          renderText={renderText}
        />
      </Editorial.Root>

      <Marquee.Root
        backgroundColor={theme.colors.secondary.background[100]}
        color={theme.colors.secondary.text[100]}
        renderText={renderText}
      >
        <Marquee.Heading segments={MARQUEE_DATA.heading} />
      </Marquee.Root>

      <Signoff.Root
        backgroundColor={theme.colors.secondary.background[100]}
        color={theme.colors.secondary.text[100]}
        page={Pages.WhyTwenty}
      >
        <Signoff.Heading page={Pages.WhyTwenty}>
          <HeadingPart fontFamily="serif">
            {renderText(msg`Build a CRM your competitors`)}
          </HeadingPart>{' '}
          <HeadingPart fontFamily="sans">
            {renderText(msg`can't buy.`)}
          </HeadingPart>
        </Signoff.Heading>
        <Signoff.Body
          body={{ text: SIGNOFF_COPY.body }}
          page={Pages.WhyTwenty}
          renderText={renderText}
        />
        <Signoff.Cta>
          <LinkButton
            color="primary"
            href="https://app.twenty.com/welcome"
            label={renderText(msg`Get started`)}
            variant="contained"
          />
        </Signoff.Cta>
      </Signoff.Root>
    </>
  );
}
