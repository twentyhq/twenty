import { msg } from '@lingui/core/macro';

import { getCommunityStats } from '@/platform/community';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { resolveLocaleParam } from '@/platform/i18n/resolve-locale-param';
import {
  buildBreadcrumbListJsonLd,
  buildRouteMetadata,
  JsonLd,
} from '@/platform/seo';
import { AffiliateProgramTermsDocument, LegalDocument } from '@/sections/legal';
import { Menu } from '@/sections/menu';

export const generateMetadata = buildRouteMetadata('affiliatePartnersTerms');

export default async function AffiliateProgramTermsPage({
  params,
}: {
  params: Promise<LocaleRouteParams>;
}) {
  const [, communityStats] = await Promise.all([
    getRouteI18n(params),
    getCommunityStats(),
  ]);
  const i18n = getServerI18n();
  const locale = resolveLocaleParam((await params).locale);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Affiliate program', path: '/affiliate-partners' },
            {
              name: 'Affiliate Program Terms',
              path: '/affiliate-partners/terms',
            },
          ],
          locale,
        )}
      />
      <Menu communityStats={communityStats} />
      <main>
        <LegalDocument title={i18n._(msg`Affiliate Program Terms`)}>
          <AffiliateProgramTermsDocument />
        </LegalDocument>
      </main>
    </>
  );
}
