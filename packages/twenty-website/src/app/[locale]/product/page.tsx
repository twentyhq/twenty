import { ILLUSTRATION_CARDS } from '@/app/[locale]/product/three-cards.data';
import { Eyebrow, Heading, HeadingPart } from '@/design-system/components';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { getRouteI18n, type LocaleRouteParams } from '@/lib/i18n/server';
import { Pages } from '@/lib/pages';
import {
  buildBreadcrumbListJsonLd,
  buildRouteMetadata,
  JsonLd,
} from '@/lib/seo';
import { ProductDemo } from '@/app/[locale]/product/_components/ProductDemo';
import { ProductFeature } from '@/app/[locale]/product/_components/feature';
import { Faq } from '@/sections/Faq';
import { ProductHero } from '@/app/[locale]/product/_components/ProductHero';
import { Menu, MENU_DATA } from '@/sections/Menu';
import { ProductStepperSection } from '@/app/[locale]/product/_components/product-stepper';
import { ThreeCards } from '@/sections/ThreeCards';
import { TrustedBy } from '@/sections/TrustedBy';
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
      <Menu
        backgroundColor={theme.colors.primary.background[100]}
        socialLinks={menuSocialLinks}
      />

      <ProductHero />

      <TrustedBy />

      <ProductFeature />

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

      <ProductStepperSection />

      <ProductDemo />

      <Faq />
    </>
  );
}
