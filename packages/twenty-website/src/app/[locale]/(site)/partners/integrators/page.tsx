import { msg } from '@lingui/core/macro';
import { PartnerApplicationModalRoot } from '@/partner-application';
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
import { CaseStudyPromo } from '@/sections/case-study-promo';
import { BecomePartnerFaq } from '@/sections/faq';
import { Menu } from '@/sections/menu';
import { PartnerHero } from '@/sections/partner-hero';
import { PartnerLevels, ProgramSwitchStrip } from '@/sections/partner-programs';
import { PartnerSignoff } from '@/sections/partner-signoff';
import { PartnerTestimonials } from '@/sections/testimonials';
import { TrustedBy } from '@/sections/trusted-by';

export const generateMetadata = buildRouteMetadata('partnersIntegrators');

export default async function BecomePartnerPage({
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
    <PartnerApplicationModalRoot>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Partners', path: '/partners' },
            { name: 'Integrators', path: '/partners/integrators' },
          ],
          locale,
        )}
      />
      <Menu communityStats={communityStats} />
      <main>
        <PartnerHero />
        <PartnerLevels />
        <PartnerTestimonials />
        {/* TrustedBy + CaseStudyPromo form one continuous frame: the promo
            `connectsUp` into the band, so this adjacency is load-bearing —
            don't separate or reorder them. */}
        <TrustedBy />
        <CaseStudyPromo />
        <PartnerSignoff />
        <ProgramSwitchStrip
          heading={msg`You create content, *not implementations?*`}
          body={msg`Creators, communities and tech partners earn 20% on every team they bring to Twenty.`}
          label={msg`See the creator program`}
          href="/partners/creators"
        />
        <BecomePartnerFaq />
      </main>
    </PartnerApplicationModalRoot>
  );
}
