import { getCommunityStats } from '@/platform/community';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { resolveLocaleParam } from '@/platform/i18n/resolve-locale-param';
import {
  buildBreadcrumbListJsonLd,
  buildRouteMetadata,
  JsonLd,
} from '@/platform/seo';
import { Faq } from '@/sections/faq';
import { Menu } from '@/sections/menu';
import { TrustedBy } from '@/sections/trusted-by';

export const generateMetadata = buildRouteMetadata('product');

// Sections land in old-site order as their ports arrive: ProductHero (with
// menu sync), ProductFeature, ProductThreeCards, ProductStepper, ProductDemo.
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
      <Menu communityStats={communityStats} />
      <main>
        <TrustedBy />
        <Faq />
      </main>
    </>
  );
}
