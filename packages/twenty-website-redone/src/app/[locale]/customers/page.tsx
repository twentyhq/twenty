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
import { CustomersHero } from '@/sections/customers-hero';
import { Menu } from '@/sections/menu';
import { TrustedBy } from '@/sections/trusted-by';

export const generateMetadata = buildRouteMetadata('customers');

// Hero only for now; the case-study catalog lands below it as its port arrives.
export default async function CustomersPage({
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
            { name: 'Customers', path: '/customers' },
          ],
          locale,
        )}
      />
      <Menu communityStats={communityStats} scheme="muted" />
      <main>
        <CustomersHero />
        <TrustedBy />
      </main>
    </>
  );
}
