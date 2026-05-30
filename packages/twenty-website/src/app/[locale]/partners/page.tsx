import { Faq } from '@/sections/Faq';
import { TrustedBy } from '@/sections/TrustedBy';
import { CASE_STUDY_CATALOG_ENTRIES } from '@/lib/customers';
import { PartnerHero } from '@/app/[locale]/partners/components/PartnerHero';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { getRouteI18n, type LocaleRouteParams } from '@/lib/i18n/server';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { CaseStudyCatalogPromo } from '@/sections/CaseStudyCatalog';
import { Menu, MENU_DATA } from '@/sections/Menu';
import { PartnerSignoff } from '@/app/[locale]/partners/components/PartnerSignoff';
import { PartnerTestimonials } from '@/app/[locale]/partners/components/PartnerTestimonials';
import { PartnerThreeCards } from '@/app/[locale]/partners/components/PartnerThreeCards';
import { theme } from '@/theme';
import { buildRouteMetadata } from '@/lib/seo';
import { styled } from '@linaria/react';

const PromoSpacing = styled.div`
  margin-bottom: ${theme.spacing(8)};

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-bottom: ${theme.spacing(12)};
  }
`;

export const generateMetadata = buildRouteMetadata('partners');

type PartnerPageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function PartnerPage({ params }: PartnerPageProps) {
  // getRouteI18n sets the request-scoped i18n context the page's components
  // read; the page renders no copy of its own, so the instance is unused here.
  const [, stats] = await Promise.all([
    getRouteI18n(params),
    fetchCommunityStats(),
  ]);
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <>
      <Menu
        backgroundColor={theme.colors.primary.background[100]}
        socialLinks={menuSocialLinks}
      />

      <PartnerHero />

      <TrustedBy
        backgroundColor={theme.colors.primary.background[100]}
        compactBottom
      />

      <PromoSpacing>
        <CaseStudyCatalogPromo
          compactTop
          entries={CASE_STUDY_CATALOG_ENTRIES}
        />
      </PromoSpacing>

      <PartnerThreeCards />

      <PartnerTestimonials />

      <PartnerSignoff />

      <Faq />
    </>
  );
}
