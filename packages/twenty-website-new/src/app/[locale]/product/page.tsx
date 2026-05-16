import { APP_PREVIEW_DATA } from '@/app/[locale]/(home)/app-preview.data';
import { AI_HERO_TABS } from '@/app/[locale]/product/ai-hero-tabs.data';
import { FEATURE_TILES } from '@/app/[locale]/product/feature.data';
import { ILLUSTRATION_CARDS } from '@/app/[locale]/product/three-cards.data';
import {
  Eyebrow,
  Heading,
  HeadingPart,
  LinkButton,
} from '@/design-system/components';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/lib/i18n/utils/get-route-i18n';
import { Pages } from '@/lib/pages';
import {
  buildBreadcrumbListJsonLd,
  buildRouteMetadata,
  JsonLd,
} from '@/lib/seo';
import { TalkToUsButton } from '@/sections/ContactCal';
import { Demo } from '@/sections/Demo';
import { Faq, FAQ_QUESTIONS } from '@/sections/Faq';
import { Feature } from '@/sections/Feature';
import { Hero } from '@/sections/Hero';
import { Menu, MENU_DATA } from '@/sections/Menu';
import {
  ProductStepper,
  type ProductStepperStepType,
} from '@/sections/ProductStepper';
import { DataModelVisual } from '@/sections/ProductStepper/visuals/DataModelVisual';
import { LayoutVisual } from '@/sections/ProductStepper/visuals/LayoutVisual';
import { WorkflowVisual } from '@/sections/ProductStepper/visuals/WorkflowVisual';
import { ThreeCards } from '@/sections/ThreeCards';
import { TRUSTED_BY_LOGOS, TrustedBy } from '@/sections/TrustedBy';
import { theme } from '@/theme';
import { msg } from '@lingui/core/macro';
import type { AppLocale } from 'twenty-shared/translations';

export const generateMetadata = buildRouteMetadata('product');

type ProductPageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const [i18n, stats] = await Promise.all([
    getRouteI18n(params),
    fetchCommunityStats(),
  ]);
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  const PRODUCT_STEPS: ProductStepperStepType[] = [
    {
      icon: 'users',
      heading: (
        <HeadingPart fontFamily="sans">{i18n._(msg`Data model`)}</HeadingPart>
      ),
      body: msg`Add objects and fields`,
      visual: DataModelVisual,
    },
    {
      icon: 'check',
      heading: (
        <HeadingPart fontFamily="sans">{i18n._(msg`Automation`)}</HeadingPart>
      ),
      body: msg`Create a workflow`,
      visual: WorkflowVisual,
    },
    {
      icon: 'eye',
      heading: (
        <HeadingPart fontFamily="sans">{i18n._(msg`Layout`)}</HeadingPart>
      ),
      body: msg`Tailor record pages, menus, and views`,
      visual: LayoutVisual,
    },
  ];

  return (
    <>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Product', path: '/product' },
          ],
          i18n.locale as AppLocale,
        )}
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

      <Hero.HeroVisualScroll
        aiBody={i18n._(
          msg`Ask questions, automate tasks, and get insights. All powered by AI that understands your data.`,
        )}
        aiHeading={
          <Heading size="lg" weight="light">
            <HeadingPart fontFamily="serif">
              {i18n._(msg`AI that actually`)}
            </HeadingPart>
            <br />
            <HeadingPart fontFamily="serif">
              {i18n._(msg`helps you`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`work faster`)}
            </HeadingPart>
          </Heading>
        }
        ctaHref="https://app.twenty.com/welcome"
        ctaLabel={i18n._(msg`Get started`)}
        introBody={i18n._(
          msg`Track relationships, manage pipelines, and take action quickly with a CRM that feels intuitive from day one.`,
        )}
        introHeading={
          <Heading size="lg" weight="light">
            <HeadingPart fontFamily="serif">
              {i18n._(msg`A CRM for teams`)}
            </HeadingPart>
            <br />
            <HeadingPart fontFamily="serif">
              {i18n._(msg`that`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`move fast`)}
            </HeadingPart>
          </Heading>
        }
        tabs={AI_HERO_TABS}
        visual={APP_PREVIEW_DATA.visual}
      />

      <TrustedBy.Root
        separator={i18n._(msg`trusted by`)}
        logos={TRUSTED_BY_LOGOS}
        clientCount={i18n._(msg`+10k others`)}
      />

      <Feature.Root scheme="light">
        <Feature.Intro align="center" page={Pages.Product}>
          <Eyebrow>
            <HeadingPart fontFamily="sans">
              {i18n._(msg`Core Features`)}
            </HeadingPart>
          </Eyebrow>
          <Heading size="lg" weight="light">
            <HeadingPart fontFamily="serif">
              {i18n._(msg`Everything you need,`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`out of the box`)}
            </HeadingPart>
          </Heading>
        </Feature.Intro>
        <Feature.Tiles tiles={FEATURE_TILES} />
      </Feature.Root>

      <ThreeCards.Root scheme="light">
        <ThreeCards.Intro page={Pages.Product} align="left">
          <Eyebrow>
            <HeadingPart fontFamily="sans">
              {i18n._(msg`Stop settling for trade-offs.`)}
            </HeadingPart>
          </Eyebrow>
          <Heading size="lg" weight="light">
            <HeadingPart fontFamily="serif">
              {i18n._(msg`A modern CRM with`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`an intuitive interface`)}
            </HeadingPart>
          </Heading>
        </ThreeCards.Intro>
        <ThreeCards.IllustrationCards illustrationCards={ILLUSTRATION_CARDS} />
      </ThreeCards.Root>

      <ProductStepper.Flow
        body={i18n._(
          msg`Need a quick change? Skip the engineering ticket. Customize your workspace in minutes.`,
        )}
        eyebrow={i18n._(msg`Customization`)}
        steps={PRODUCT_STEPS}
      >
        <HeadingPart fontFamily="serif">
          {i18n._(msg`Go the extra mile`)}
        </HeadingPart>{' '}
        <HeadingPart fontFamily="sans">{i18n._(msg`with no-code`)}</HeadingPart>
      </ProductStepper.Flow>

      <Demo.Root>
        <Eyebrow>
          <HeadingPart fontFamily="sans">
            {i18n._(msg`Try it live`)}
          </HeadingPart>
        </Eyebrow>
        <Heading size="lg" weight="light">
          <HeadingPart fontFamily="serif">
            {i18n._(msg`A demo worth a`)}
          </HeadingPart>
          <br />
          <HeadingPart fontFamily="sans">
            {i18n._(msg`thousand words`)}
          </HeadingPart>
        </Heading>
        <Demo.Cta>
          <LinkButton
            color="secondary"
            href="https://app.twenty.com/welcome"
            label={i18n._(msg`Try Twenty Cloud`)}
            variant="contained"
          />
        </Demo.Cta>
        <Demo.Preview visual={APP_PREVIEW_DATA.visual} />
      </Demo.Root>

      <Faq.Root>
        <Faq.Intro>
          <Eyebrow colorScheme="secondary">
            <HeadingPart fontFamily="sans">
              {i18n._(msg`Any Questions?`)}
            </HeadingPart>
          </Eyebrow>
          <Faq.Heading>
            <HeadingPart fontFamily="serif">
              {i18n._(msg`Stop fighting custom.`)}
            </HeadingPart>
            <br />
            <HeadingPart fontFamily="sans">
              {i18n._(msg`Start building, with Twenty`)}
            </HeadingPart>
          </Faq.Heading>
          <Faq.Cta>
            <LinkButton
              color="primary"
              href="https://app.twenty.com/welcome"
              label={i18n._(msg`Get started`)}
              variant="contained"
            />
            <TalkToUsButton
              color="primary"
              label={msg`Talk to us`}
              variant="outlined"
            />
          </Faq.Cta>
        </Faq.Intro>
        <Faq.Items questions={FAQ_QUESTIONS} />
      </Faq.Root>
    </>
  );
}
