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
import { Pages } from '@/lib/pages';
import { renderMessageDescriptor } from '@/lib/i18n/render-message-descriptor';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
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

export default async function ProductPage() {
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
            {renderMessageDescriptor(msg`A CRM for teams`)}
          </HeadingPart>
          <br />
          <HeadingPart fontFamily="serif">
            {renderMessageDescriptor(msg`that`)}
          </HeadingPart>{' '}
          <HeadingPart fontFamily="sans">
            {renderMessageDescriptor(msg`moves fast`)}
          </HeadingPart>
        </Hero.Heading>
        <Hero.Body body={{ text: HERO_COPY.body }} page={Pages.Product} />
        <Hero.Cta>
          <LinkButton
            color="secondary"
            href="https://app.twenty.com/welcome"
            label={renderMessageDescriptor(msg`Get started`)}
            type="anchor"
            variant="contained"
          />
        </Hero.Cta>
        <Hero.ProductVisual />
      </Hero.Root>

      <TrustedBy.Root>
        <TrustedBy.Separator separator={TRUSTED_BY_DATA.separator} />
        <TrustedBy.Logos logos={TRUSTED_BY_DATA.logos} />
        <TrustedBy.ClientCount label={TRUSTED_BY_DATA.clientCountLabel.text} />
      </TrustedBy.Root>

      <Feature.Root backgroundColor={theme.colors.primary.background[100]}>
        <Feature.Intro align="center" page={Pages.Product}>
          <Eyebrow
            colorScheme="primary"
            heading={FEATURE_DATA.eyebrow.heading}
            renderText={renderMessageDescriptor}
          />
          <Heading size="lg" weight="light">
            <HeadingPart fontFamily="serif">
              {renderMessageDescriptor(msg`Everything you need,`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {renderMessageDescriptor(msg`out of the box`)}
            </HeadingPart>
          </Heading>
        </Feature.Intro>
        <Feature.Tiles mask={FEATURE_DATA.mask} tiles={FEATURE_DATA.tiles} />
      </Feature.Root>

      <ThreeCards.Root backgroundColor={theme.colors.primary.background[100]}>
        <ThreeCards.Intro page={Pages.Product} align="left">
          <Eyebrow
            colorScheme="primary"
            heading={THREE_CARDS_ILLUSTRATION_DATA.eyebrow.heading}
            renderText={renderMessageDescriptor}
          />
          <Heading size="lg" weight="light">
            <HeadingPart fontFamily="serif">
              {renderMessageDescriptor(msg`A modern CRM with`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {renderMessageDescriptor(msg`an intuitive interface`)}
            </HeadingPart>
          </Heading>
          <Body
            body={THREE_CARDS_ILLUSTRATION_DATA.body}
            renderText={renderMessageDescriptor}
            size="sm"
          />
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
          {renderMessageDescriptor(msg`Go the extra mile`)}
        </HeadingPart>{' '}
        <HeadingPart fontFamily="sans">
          {renderMessageDescriptor(msg`with no-code`)}
        </HeadingPart>
      </ProductStepper.Flow>

      <Signoff.Root
        backgroundColor={theme.colors.secondary.background[5]}
        color={theme.colors.primary.text[100]}
        page={Pages.Product}
      >
        <Signoff.Heading page={Pages.Product}>
          <HeadingPart fontFamily="serif">
            {renderMessageDescriptor(msg`Ready to grow`)}
          </HeadingPart>
          <br />
          <HeadingPart fontFamily="serif">
            {renderMessageDescriptor(msg`with`)}
          </HeadingPart>{' '}
          <HeadingPart fontFamily="sans">
            {renderMessageDescriptor(msg`Twenty?`)}
          </HeadingPart>
        </Signoff.Heading>
        <Signoff.Body body={{ text: SIGNOFF_COPY.body }} page={Pages.Product} />
        <Signoff.Cta>
          <LinkButton
            color="secondary"
            href="https://app.twenty.com/welcome"
            label={renderMessageDescriptor(msg`Get started`)}
            type="anchor"
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
            renderText={renderMessageDescriptor}
          />
          <Faq.Heading>
            <HeadingPart fontFamily="serif">
              {renderMessageDescriptor(msg`Stop fighting custom.`)}
            </HeadingPart>
            <br />
            <HeadingPart fontFamily="sans">
              {renderMessageDescriptor(msg`Start building, with Twenty`)}
            </HeadingPart>
          </Faq.Heading>
          <Faq.Cta>
            <LinkButton
              color="primary"
              href="https://app.twenty.com/welcome"
              label={renderMessageDescriptor(msg`Get started`)}
              type="anchor"
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
