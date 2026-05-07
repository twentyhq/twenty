import { notFound } from 'next/navigation';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { HeadingPart } from '@/design-system/components';
import { getPublishedArticles } from '@/lib/articles';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { createMessageDescriptorRenderer } from '@/lib/i18n/create-message-descriptor-renderer';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/lib/i18n/get-route-i18n';
import { resolveLocaleParam } from '@/lib/i18n';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { Pages } from '@/lib/pages';
import { buildArticleListJsonLd, buildRouteMetadata, JsonLd } from '@/lib/seo';
import { Articles } from '@/sections/Articles/components';
import { Hero } from '@/sections/Hero/components';
import { Menu } from '@/sections/Menu/components';
import { MENU_DATA } from '@/sections/Menu/data';
import { TrustedBy } from '@/sections/TrustedBy/components';
import { TRUSTED_BY_DATA } from '@/sections/TrustedBy/data';
import { css } from '@linaria/core';

export const generateMetadata = buildRouteMetadata('articles');

const ARTICLES_HERO_BODY = {
  text: 'Ideas from the team building Twenty on open source CRM, GTM systems, and building software that lasts.',
};

const ARTICLES_TOP_BACKGROUND_COLOR = '#F4F4F4';

const pageRevealClassName = css`
  @keyframes articlesPageReveal {
    from {
      opacity: 0;
      transform: translate3d(0, 20px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  background-color: ${ARTICLES_TOP_BACKGROUND_COLOR};

  & > * {
    animation: articlesPageReveal 720ms cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: 80ms;
  }

  @media (prefers-reduced-motion: reduce) {
    & > * {
      animation: none;
    }
  }
`;

type ArticlesPageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function ArticlesPage({ params }: ArticlesPageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocaleParam(rawLocale);

  if (locale !== SOURCE_LOCALE) {
    notFound();
  }

  const [i18n, stats] = await Promise.all([
    getRouteI18n(params),
    fetchCommunityStats(),
  ]);
  const renderText = createMessageDescriptorRenderer(i18n);
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);
  const posts = getPublishedArticles();

  return (
    <>
      {posts.length > 0 ? (
        <JsonLd data={buildArticleListJsonLd(posts)} />
      ) : null}
      <Menu.Root
        backgroundColor={ARTICLES_TOP_BACKGROUND_COLOR}
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
        <Hero.Root backgroundColor={ARTICLES_TOP_BACKGROUND_COLOR}>
          <Hero.Heading page={Pages.Articles}>
            <HeadingPart fontFamily="serif">Ideas on</HeadingPart>
            <br />
            <HeadingPart fontFamily="serif">open-source</HeadingPart>{' '}
            <HeadingPart fontFamily="sans">CRM</HeadingPart>
          </Hero.Heading>
          <Hero.Body body={ARTICLES_HERO_BODY} page={Pages.Articles} />
        </Hero.Root>
        <TrustedBy.Root
          cardBackgroundColor={ARTICLES_TOP_BACKGROUND_COLOR}
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

      <Articles.Index posts={posts} />
    </>
  );
}
