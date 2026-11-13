import { msg } from '@lingui/core/macro';
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
  AffiliateProgramTerms,
} from '@/sections/affiliate-program';
import { ProgramSwitchStrip } from '@/sections/partner-programs';
import { AffiliateProgramFaq } from '@/sections/faq';
import { Menu } from '@/sections/menu';

export const generateMetadata = buildRouteMetadata('partnersCreators');

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
            { name: 'Partners', path: '/partners' },
            { name: 'Creators', path: '/partners/creators' },
          ],
          locale,
        )}
      />
      <Menu communityStats={communityStats} />
      <main>
        <AffiliateHero />
        <AffiliateProgramTerms />
        <AffiliateAudiences />
        <ProgramSwitchStrip
          heading={msg`You implement Twenty *for clients?*`}
          body={msg`Integrators earn 20% on the clients they bring, and Lead Integrators also get client briefs.`}
          label={msg`See the integrator program`}
          href="/partners/integrators"
        />
        <AffiliateProgramFaq />
        <AffiliateApply />
      </main>
    </>
  );
}
