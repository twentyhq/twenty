import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { getRouteI18n, type LocaleRouteParams } from '@/lib/i18n/server';
import {
  buildBreadcrumbListJsonLd,
  buildRouteMetadata,
  JsonLd,
} from '@/lib/seo';
import { ProductDemo } from '@/app/[locale]/product/_components/ProductDemo';
import { ProductFeature } from '@/app/[locale]/product/_components/feature';
import { Faq } from '@/sections/Faq';
import { ProductHero } from '@/app/[locale]/product/_components/ProductHero';
import { ProductHeroMenuSync } from '@/sections/Hero/components/ProductVisual/product-hero-menu-sync';
import { MENU_DATA } from '@/sections/Menu';
import { ProductStepperSection } from '@/app/[locale]/product/_components/product-stepper';
import { ProductThreeCards } from '@/app/[locale]/product/_components/ProductThreeCards';
import { TrustedBy } from '@/sections/TrustedBy';
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
      <ProductHeroMenuSync socialLinks={menuSocialLinks}>
        <ProductHero />
      </ProductHeroMenuSync>

      <TrustedBy />

      <ProductFeature />

      <ProductThreeCards />

      <ProductStepperSection />

      <ProductDemo />

      <Faq />
    </>
  );
}
