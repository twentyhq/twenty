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
import { Faq } from '@/sections/faq';
import { Menu } from '@/sections/menu';
import { PartnerHero } from '@/sections/partner-hero';
import { PartnerSignoff } from '@/sections/partner-signoff';
import { PartnerTestimonials } from '@/sections/testimonials';
import { TrustedBy } from '@/sections/trusted-by';

export const generateMetadata = buildRouteMetadata('partners');

// Sections land in old-site order as their ports arrive.
export default async function PartnerPage({
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
          ],
          locale,
        )}
      />
      <Menu communityStats={communityStats} />
      <main>
        <PartnerHero />
        {/* TrustedBy + CaseStudyPromo form one continuous frame: the promo
            `connectsUp` into the band, so this adjacency is load-bearing —
            don't separate or reorder them. */}
        <TrustedBy />
        <CaseStudyPromo />
        <PartnerTestimonials />
        <PartnerSignoff />
        <Faq />
      </main>
    </>
  );
}
