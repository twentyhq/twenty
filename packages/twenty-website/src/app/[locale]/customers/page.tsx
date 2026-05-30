import { Faq } from '@/sections/Faq';
import { TrustedBy } from '@/sections/TrustedBy';
import { CASE_STUDY_CATALOG_ENTRIES } from '@/lib/customers';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { getRouteI18n, type LocaleRouteParams } from '@/lib/i18n/server';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { CaseStudyCatalogGrid } from '@/sections/CaseStudyCatalog';
import { CustomersCatalogHero } from '@/app/[locale]/customers/_components/CustomersCatalogHero';
import { Menu, MENU_DATA } from '@/sections/Menu';
import { CustomersCatalogSignoff } from '@/app/[locale]/customers/_components/CustomersCatalogSignoff';
import { buildRouteMetadata } from '@/lib/seo';
import { css } from '@linaria/core';

export const generateMetadata = buildRouteMetadata('customers');

const CUSTOMERS_TOP_BACKGROUND_COLOR = '#F4F4F4';

const pageRevealClassName = css`
  @keyframes customersPageReveal {
    from {
      opacity: 0;
      transform: translate3d(0, 20px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  background-color: ${CUSTOMERS_TOP_BACKGROUND_COLOR};

  & > * {
    animation: customersPageReveal 720ms cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: 80ms;
  }

  @media (prefers-reduced-motion: reduce) {
    & > * {
      animation: none;
    }
  }
`;

type CaseStudiesCatalogPageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function CaseStudiesCatalogPage({
  params,
}: CaseStudiesCatalogPageProps) {
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
        backgroundColor={CUSTOMERS_TOP_BACKGROUND_COLOR}
        socialLinks={menuSocialLinks}
      />

      <div className={pageRevealClassName}>
        <CustomersCatalogHero />
        <TrustedBy
          cardBackgroundColor={CUSTOMERS_TOP_BACKGROUND_COLOR}
          compactBottom
        />
      </div>

      <CaseStudyCatalogGrid compactTop entries={CASE_STUDY_CATALOG_ENTRIES} />

      <CustomersCatalogSignoff />

      <Faq />
    </>
  );
}
