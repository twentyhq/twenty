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
import {
  AffiliateApply,
  AffiliateAudiences,
  AffiliateHero,
  AffiliateIntegratorStrip,
  AffiliateProgramTerms,
} from '@/sections/affiliate-program';
import { AffiliateProgramFaq } from '@/sections/faq';
import { Menu } from '@/sections/menu';

export const generateMetadata = buildRouteMetadata('affiliatePartners');

export default async function AffiliateProgramPage({
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
            { name: 'Affiliate program', path: '/affiliate-partners' },
          ],
          locale,
        )}
      />
      <Menu communityStats={communityStats} />
      <main>
        <AffiliateHero />
        <AffiliateProgramTerms />
        <AffiliateAudiences />
        <AffiliateIntegratorStrip />
        <AffiliateProgramFaq />
        <AffiliateApply />
      </main>
    </>
  );
}
