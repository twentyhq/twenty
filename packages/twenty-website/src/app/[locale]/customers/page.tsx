import { msg } from '@lingui/core/macro';
import { Faq } from '@/sections/Faq';
import { TrustedBy } from '@/sections/TrustedBy';
import { CASE_STUDY_CATALOG_ENTRIES } from '@/lib/customers';
import { HeadingPart } from '@/design-system/components';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { getRouteI18n, type LocaleRouteParams } from '@/lib/i18n/server';
import { Pages } from '@/lib/pages';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { CaseStudyCatalog } from '@/sections/CaseStudyCatalog';
import { Hero } from '@/sections/Hero';
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
  const [i18n, stats] = await Promise.all([
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
        <Hero.Root scheme="muted">
          <Hero.Heading page={Pages.CaseStudies}>
            <HeadingPart fontFamily="serif">
              {i18n._(msg`See how teams`)}
            </HeadingPart>
            <br />
            <HeadingPart fontFamily="serif">
              {i18n._(msg`build`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`on Twenty`)}
            </HeadingPart>
          </Hero.Heading>
          <Hero.Body page={Pages.CaseStudies}>
            {i18n._(
              msg`Real stories from real teams about how they shaped Twenty to fit their workflow and accelerated their growth.`,
            )}
          </Hero.Body>
        </Hero.Root>
        <TrustedBy
          cardBackgroundColor={CUSTOMERS_TOP_BACKGROUND_COLOR}
          compactBottom
        />
      </div>

      <CaseStudyCatalog.Grid compactTop entries={CASE_STUDY_CATALOG_ENTRIES} />

      <CustomersCatalogSignoff />

      <Faq />
    </>
  );
}
