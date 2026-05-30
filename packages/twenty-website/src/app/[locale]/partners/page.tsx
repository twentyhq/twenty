import { msg } from '@lingui/core/macro';
import { Faq } from '@/sections/Faq';
import { TrustedBy } from '@/sections/TrustedBy';
import { CASE_STUDY_CATALOG_ENTRIES } from '@/lib/customers';
import { PARTNER_TESTIMONIALS } from '@/app/[locale]/partners/testimonials.data';
import { PartnerHero } from '@/app/[locale]/partners/components/PartnerHero';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { getRouteI18n, type LocaleRouteParams } from '@/lib/i18n/server';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { CaseStudyCatalog } from '@/sections/CaseStudyCatalog';
import { Menu, MENU_DATA } from '@/sections/Menu';
import { PartnerSignoff } from '@/app/[locale]/partners/components/PartnerSignoff';
import { Testimonials } from '@/sections/Testimonials';
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
  const [i18n, stats] = await Promise.all([
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
        <CaseStudyCatalog.Promo
          compactTop
          entries={CASE_STUDY_CATALOG_ENTRIES}
        />
      </PromoSpacing>

      <PartnerThreeCards />

      <Testimonials.Root
        scheme="muted"
        shapeFillColor={theme.colors.secondary.background[100]}
      >
        <Testimonials.PartnerCarousel
          eyebrow={i18n._(msg`Join our growing partner ecosystem`)}
          testimonials={PARTNER_TESTIMONIALS}
        >
          <Testimonials.PartnerVisual />
        </Testimonials.PartnerCarousel>
      </Testimonials.Root>

      <PartnerSignoff />

      <Faq />
    </>
  );
}
