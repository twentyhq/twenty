import { getCommunityStats } from '@/platform/community';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { resolveLocaleParam } from '@/platform/i18n/resolve-locale-param';
import { MenuStyleProvider } from '@/platform/menu-style';
import {
  buildBreadcrumbListJsonLd,
  buildRouteMetadata,
  JsonLd,
} from '@/platform/seo';
import { Faq } from '@/sections/faq';
import { Menu } from '@/sections/menu';
import { ProductDemo } from '@/sections/product-demo';
import { ProductFeature } from '@/sections/product-feature';
import { ProductHero } from '@/sections/product-hero';
import { ProductStepper } from '@/sections/product-stepper';
import { ProductThreeCards } from '@/sections/three-cards';
import { TrustedBy } from '@/sections/trusted-by';

export const generateMetadata = buildRouteMetadata('product');

export default async function ProductPage({
  params,
}: {
  params: Promise<LocaleRouteParams>;
}) {
  const [, communityStats] = await Promise.all([
    getRouteI18n(params),
    getCommunityStats(),
  ]);
  const locale = resolveLocaleParam((await params).locale);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Product', path: '/product' },
          ],
          locale,
        )}
      />
      <MenuStyleProvider>
        <Menu communityStats={communityStats} />
        <main>
          <ProductHero />
          <TrustedBy />
          <ProductFeature />
          <ProductThreeCards />
          <ProductStepper />
          <ProductDemo />
          <Faq />
        </main>
      </MenuStyleProvider>
    </>
  );
}
