import { msg } from '@lingui/core/macro';
import { FAQ_DATA } from '@/sections/Faq/data';
import { MENU_DATA } from '@/sections/Menu/data';
import { TRUSTED_BY_DATA } from '@/sections/TrustedBy/data';
import { TalkToUsButton } from '@/lib/contact-cal';
import { CASE_STUDY_CATALOG_ENTRIES } from '@/lib/customers';
import { Eyebrow, HeadingPart, LinkButton } from '@/design-system/components';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { createMessageDescriptorRenderer } from '@/lib/i18n/create-message-descriptor-renderer';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/lib/i18n/get-route-i18n';
import { Pages } from '@/lib/pages';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { CaseStudyCatalog } from '@/sections/CaseStudyCatalog/components';
import { Faq } from '@/sections/Faq/components';
import { Hero } from '@/sections/Hero/components';
import { Menu } from '@/sections/Menu/components';
import { Signoff } from '@/sections/Signoff/components';
import { TrustedBy } from '@/sections/TrustedBy/components';
import { theme } from '@/theme';
import { buildRouteMetadata } from '@/lib/seo';
import { css } from '@linaria/core';

export const generateMetadata = buildRouteMetadata('customers');

const HERO_BODY = {
  text: msg`Real stories from real teams about how they shaped Twenty to fit their workflow and accelerated their growth.`,
};

const SIGNOFF_BODY = {
  text: msg`Join the teams that chose to own their CRM.\nStart building with Twenty today.`,
};

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
  const renderText = createMessageDescriptorRenderer(i18n);
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
        <Hero.Root backgroundColor={CUSTOMERS_TOP_BACKGROUND_COLOR}>
          <Hero.Heading page={Pages.CaseStudies}>
            <HeadingPart fontFamily="serif">
              {renderText(msg`See how teams`)}
            </HeadingPart>
            <br />
            <HeadingPart fontFamily="serif">
              {renderText(msg`build`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {renderText(msg`on Twenty`)}
            </HeadingPart>
          </Hero.Heading>
          <Hero.Body
            body={HERO_BODY}
            page={Pages.CaseStudies}
            renderText={renderText}
          />
        </Hero.Root>
        <TrustedBy.Root
          cardBackgroundColor={CUSTOMERS_TOP_BACKGROUND_COLOR}
          compactBottom
        >
          <TrustedBy.Separator
            renderText={renderText}
            separator={TRUSTED_BY_DATA.separator}
          />
          <TrustedBy.Logos logos={TRUSTED_BY_DATA.logos} />
          <TrustedBy.ClientCount
            label={TRUSTED_BY_DATA.clientCountLabel.text}
            renderText={renderText}
          />
        </TrustedBy.Root>
      </div>

      <CaseStudyCatalog.Grid
        compactTop
        entries={CASE_STUDY_CATALOG_ENTRIES}
        renderText={renderText}
      />

      <Signoff.Root
        backgroundColor={theme.colors.primary.background[100]}
        color={theme.colors.primary.text[100]}
        page={Pages.Partners}
      >
        <Signoff.Heading page={Pages.Partners}>
          <HeadingPart fontFamily="serif">
            {renderText(msg`Ready to build`)}
          </HeadingPart>
          <br />
          <HeadingPart fontFamily="sans">
            {renderText(msg`your own story?`)}
          </HeadingPart>
        </Signoff.Heading>
        <Signoff.Body
          body={SIGNOFF_BODY}
          page={Pages.Partners}
          renderText={renderText}
        />
        <Signoff.Cta>
          <LinkButton
            color="secondary"
            href="https://app.twenty.com/welcome"
            label={renderText(msg`Get started`)}
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
          <Eyebrow
            colorScheme="secondary"
            heading={FAQ_DATA.eyebrow.heading}
            renderText={renderText}
          />
          <Faq.Heading>
            <HeadingPart fontFamily="serif">
              {renderText(msg`Stop fighting custom.`)}
            </HeadingPart>
            <br />
            <HeadingPart fontFamily="sans">
              {renderText(msg`Start building, with Twenty`)}
            </HeadingPart>
          </Faq.Heading>
          <Faq.Cta>
            <LinkButton
              color="primary"
              href="https://app.twenty.com/welcome"
              label={renderText(msg`Get started`)}
              variant="contained"
            />
            <TalkToUsButton
              color="primary"
              label={msg`Talk to us`}
              variant="outlined"
            />
          </Faq.Cta>
        </Faq.Intro>
        <Faq.Items questions={FAQ_DATA.questions} />
      </Faq.Root>
    </>
  );
}
