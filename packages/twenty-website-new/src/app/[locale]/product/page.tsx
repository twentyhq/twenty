import { msg } from '@lingui/core/macro';
import { FAQ_DATA } from '@/sections/Faq/data';
import { MENU_DATA } from '@/sections/Menu/data';
import { TRUSTED_BY_DATA } from '@/sections/TrustedBy/data';
import { TalkToUsButton } from '@/lib/contact-cal';
import { FEATURE_DATA } from '@/app/[locale]/product/feature.data';
import { HERO_COPY } from '@/app/[locale]/product/hero.data';
import { SIGNOFF_COPY } from '@/app/[locale]/product/signoff.data';
import { STEPPER_DATA } from '@/app/[locale]/product/stepper.data';
import { THREE_CARDS_ILLUSTRATION_DATA } from '@/app/[locale]/product/three-cards.data';
import {
  Body,
  Eyebrow,
  Heading,
  HeadingPart,
  LinkButton,
} from '@/design-system/components';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { createMessageDescriptorRenderer } from '@/lib/i18n/create-message-descriptor-renderer';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/lib/i18n/get-route-i18n';
import { Pages } from '@/lib/pages';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { Faq } from '@/sections/Faq/components';
import { Feature } from '@/sections/Feature/components';
import { Hero } from '@/sections/Hero/components';
import { Menu } from '@/sections/Menu/components';
import { ProductStepper } from '@/sections/ProductStepper/components';
import { Signoff } from '@/sections/Signoff/components';
import { ThreeCards } from '@/sections/ThreeCards/components';
import { TrustedBy } from '@/sections/TrustedBy/components';
import { theme } from '@/theme';
import { buildRouteMetadata } from '@/lib/seo';

export const generateMetadata = buildRouteMetadata('product');

type ProductPageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function ProductPage({ params }: ProductPageProps) {
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
        href="/illustrations/product/hero/hero.glb"
        rel="preload"
      />
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

      <Hero.Root backgroundColor={theme.colors.primary.background[100]}>
        <Hero.Heading page={Pages.Product}>
          <HeadingPart fontFamily="serif">
            {renderText(msg`A CRM for teams`)}
          </HeadingPart>
          <br />
          <HeadingPart fontFamily="serif">
            {renderText(msg`that`)}
          </HeadingPart>{' '}
          <HeadingPart fontFamily="sans">
            {renderText(msg`moves fast`)}
          </HeadingPart>
        </Hero.Heading>
        <Hero.Body
          body={{ text: HERO_COPY.body }}
          page={Pages.Product}
          renderText={renderText}
        />
        <Hero.Cta>
          <LinkButton
            color="secondary"
            href="https://app.twenty.com/welcome"
            label={renderText(msg`Get started`)}
            variant="contained"
          />
        </Hero.Cta>
        <Hero.ProductVisual />
      </Hero.Root>

      <TrustedBy.Root>
        <TrustedBy.Separator
          renderText={renderText}
          separator={TRUSTED_BY_DATA.separator}
        />
        <TrustedBy.Logos logos={TRUSTED_BY_DATA.logos} />
        <TrustedBy.ClientCount
          label={TRUSTED_BY_DATA.clientCountLabel.text}
          renderText={renderText}
        />
      </TrustedBy.Root>

      <Feature.Root backgroundColor={theme.colors.primary.background[100]}>
        <Feature.Intro align="center" page={Pages.Product}>
          <Eyebrow
            colorScheme="primary"
            heading={FEATURE_DATA.eyebrow.heading}
            renderText={renderText}
          />
          <Heading size="lg" weight="light">
            <HeadingPart fontFamily="serif">
              {renderText(msg`Everything you need,`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {renderText(msg`out of the box`)}
            </HeadingPart>
          </Heading>
        </Feature.Intro>
        <Feature.Tiles
          mask={FEATURE_DATA.mask}
          renderText={renderText}
          tiles={FEATURE_DATA.tiles}
        />
      </Feature.Root>

      <ThreeCards.Root backgroundColor={theme.colors.primary.background[100]}>
        <ThreeCards.Intro page={Pages.Product} align="left">
          <Eyebrow
            colorScheme="primary"
            heading={THREE_CARDS_ILLUSTRATION_DATA.eyebrow.heading}
            renderText={renderText}
          />
          <Heading size="lg" weight="light">
            <HeadingPart fontFamily="serif">
              {renderText(msg`A modern CRM with`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {renderText(msg`an intuitive interface`)}
            </HeadingPart>
          </Heading>
          {THREE_CARDS_ILLUSTRATION_DATA.body && (
            <Body
              body={THREE_CARDS_ILLUSTRATION_DATA.body}
              renderText={renderText}
              size="sm"
            />
          )}
        </ThreeCards.Intro>
        <ThreeCards.IllustrationCards
          illustrationCards={THREE_CARDS_ILLUSTRATION_DATA.illustrationCards}
        />
      </ThreeCards.Root>

      <ProductStepper.Flow
        body={STEPPER_DATA.body}
        eyebrow={STEPPER_DATA.eyebrow}
        steps={STEPPER_DATA.steps}
      >
        <HeadingPart fontFamily="serif">
          {renderText(msg`Go the extra mile`)}
        </HeadingPart>{' '}
        <HeadingPart fontFamily="sans">
          {renderText(msg`with no-code`)}
        </HeadingPart>
      </ProductStepper.Flow>

      <Signoff.Root
        backgroundColor={theme.colors.secondary.background[5]}
        color={theme.colors.primary.text[100]}
        page={Pages.Product}
      >
        <Signoff.Heading page={Pages.Product}>
          <HeadingPart fontFamily="serif">
            {renderText(msg`Ready to grow`)}
          </HeadingPart>
          <br />
          <HeadingPart fontFamily="serif">
            {renderText(msg`with`)}
          </HeadingPart>{' '}
          <HeadingPart fontFamily="sans">
            {renderText(msg`Twenty?`)}
          </HeadingPart>
        </Signoff.Heading>
        <Signoff.Body
          body={{ text: SIGNOFF_COPY.body }}
          page={Pages.Product}
          renderText={renderText}
        />
        <Signoff.Cta>
          <LinkButton
            color="secondary"
            href="https://app.twenty.com/welcome"
            label={renderText(msg`Get started`)}
            variant="contained"
          />
          <TalkToUsButton
            color="secondary"
            label={msg`Talk to us`}
            variant="outlined"
          />
        </Signoff.Cta>
      </Signoff.Root>

      <Faq.Root>
        <Faq.Intro>
          <Eyebrow
            colorScheme="secondary"
            heading={FAQ_DATA.eyebrow.heading}
            renderText={renderText}
          />
          <Faq.Heading>
            <HeadingPart fontFamily="serif">
              {renderText(msg`Stop fighting custom.`)}
            </HeadingPart>
            <br />
            <HeadingPart fontFamily="sans">
              {renderText(msg`Start building, with Twenty`)}
            </HeadingPart>
          </Faq.Heading>
          <Faq.Cta>
            <LinkButton
              color="primary"
              href="https://app.twenty.com/welcome"
              label={renderText(msg`Get started`)}
              variant="contained"
            />
            <TalkToUsButton
              color="primary"
              label={msg`Talk to us`}
              variant="outlined"
            />
          </Faq.Cta>
        </Faq.Intro>
        <Faq.Items questions={FAQ_DATA.questions} />
      </Faq.Root>
    </>
  );
}
