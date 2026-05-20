import { msg } from '@lingui/core/macro';
import { Faq, FAQ_QUESTIONS } from '@/sections/Faq';
import { TRUSTED_BY_LOGOS, TrustedBy } from '@/sections/TrustedBy';
import { TalkToUsButton } from '@/sections/ContactCal';
import { CASE_STUDY_CATALOG_ENTRIES } from '@/lib/customers';
import { Eyebrow, HeadingPart, LinkButton } from '@/design-system/components';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/lib/i18n/utils/get-route-i18n';
import { Pages } from '@/lib/pages';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { CaseStudyCatalog } from '@/sections/CaseStudyCatalog';
import { Hero } from '@/sections/Hero';
import { Menu, MENU_DATA } from '@/sections/Menu';
import { Signoff } from '@/sections/Signoff';
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
      <Menu.Root
        backgroundColor={CUSTOMERS_TOP_BACKGROUND_COLOR}
        scheme="primary"
        navItems={MENU_DATA.navItems}
        socialLinks={menuSocialLinks}
      >
        <Menu.Logo scheme="primary" />
        <Menu.Nav scheme="primary" navItems={MENU_DATA.navItems} />
        <Menu.Social scheme="primary" socialLinks={menuSocialLinks} />
        <Menu.Cta scheme="primary" />
      </Menu.Root>

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
        <TrustedBy.Root
          cardBackgroundColor={CUSTOMERS_TOP_BACKGROUND_COLOR}
          compactBottom
          separator={i18n._(msg`trusted by`)}
          logos={TRUSTED_BY_LOGOS}
          clientCount={i18n._(msg`+10k others`)}
        />
      </div>

      <CaseStudyCatalog.Grid compactTop entries={CASE_STUDY_CATALOG_ENTRIES} />

      <Signoff.Root scheme="light" page={Pages.Partners}>
        <Signoff.Heading page={Pages.Partners}>
          <HeadingPart fontFamily="serif">
            {i18n._(msg`Ready to build`)}
          </HeadingPart>
          <br />
          <HeadingPart fontFamily="sans">
            {i18n._(msg`your own story?`)}
          </HeadingPart>
        </Signoff.Heading>
        <Signoff.Body page={Pages.Partners}>
          {i18n._(
            msg`Join the teams that chose to own their CRM.\nStart building with Twenty today.`,
          )}
        </Signoff.Body>
        <Signoff.Cta>
          <LinkButton
            color="secondary"
            href="https://app.twenty.com/welcome"
            label={i18n._(msg`Get started`)}
            variant="contained"
          />
          <TalkToUsButton
            color="secondary"
            label={msg`Talk to us`}
            variant="outlined"
          />
        </Signoff.Cta>
      </Signoff.Root>

      <Faq.Root>
        <Faq.Intro>
          <Eyebrow colorScheme="secondary">
            <HeadingPart fontFamily="sans">
              {i18n._(msg`Any Questions?`)}
            </HeadingPart>
          </Eyebrow>
          <Faq.Heading>
            <HeadingPart fontFamily="serif">
              {i18n._(msg`Stop fighting custom.`)}
            </HeadingPart>
            <br />
            <HeadingPart fontFamily="sans">
              {i18n._(msg`Start building, with Twenty`)}
            </HeadingPart>
          </Faq.Heading>
          <Faq.Cta>
            <LinkButton
              color="primary"
              href="https://app.twenty.com/welcome"
              label={i18n._(msg`Get started`)}
              variant="contained"
            />
            <TalkToUsButton
              color="primary"
              label={msg`Talk to us`}
              variant="outlined"
            />
          </Faq.Cta>
        </Faq.Intro>
        <Faq.Items questions={FAQ_QUESTIONS} />
      </Faq.Root>
    </>
  );
}
