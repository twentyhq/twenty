import { msg } from '@lingui/core/macro';

import { PartnerEngagementBand } from '@/partners-marketplace/PartnerEngagementBand';
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
import { CaseStudyCatalogGrid } from '@/sections/case-study-catalog';
import { CustomersCatalogSignoff } from '@/sections/customers-catalog-signoff';
import { CustomersHero } from '@/sections/customers-hero';
import { Faq } from '@/sections/faq';
import { Menu } from '@/sections/menu';
import { TrustedBy } from '@/sections/trusted-by';

export const generateMetadata = buildRouteMetadata('customers');

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
        <TrustedBy scheme="muted" />
        <CaseStudyCatalogGrid />
        <PartnerEngagementBand
          heading={msg`Need a hand implementing Twenty?`}
          body={msg`Browse certified partners who migrate, customise, host, and support Twenty across regions and languages.`}
          ctaLabel={msg`Find a partner`}
          ctaHref="/partners/list?ref=customers-index"
        />
        <CustomersCatalogSignoff />
        <Faq />
      </main>
    </>
  );
}
