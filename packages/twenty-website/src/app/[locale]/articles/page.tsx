import { notFound } from 'next/navigation';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { getPublishedArticles } from '@/lib/articles';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { resolveLocaleParam } from '@/lib/i18n';
import { getRouteI18n, type LocaleRouteParams } from '@/lib/i18n/server';
import {
  buildArticleListJsonLd,
  buildBreadcrumbListJsonLd,
  buildRouteMetadata,
  JsonLd,
} from '@/lib/seo';
import { ArticlesIndex } from '@/sections/Articles';
import { ArticlesHero } from '@/app/[locale]/articles/_components/ArticlesHero';
import { Menu, MENU_DATA } from '@/sections/Menu';
import { TrustedBy } from '@/sections/TrustedBy';
import { css } from '@linaria/core';

export const generateMetadata = buildRouteMetadata('articles');

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

  // getRouteI18n sets the request-scoped i18n context that TrustedBy/Menu/
  // Articles read; this page's own copy is English-only (SOURCE_LOCALE-gated
  // above), so the returned instance is intentionally unused here.
  const [, stats] = await Promise.all([
    getRouteI18n(params),
    fetchCommunityStats(),
  ]);
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);
  const posts = getPublishedArticles();

  return (
    <>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Articles', path: '/articles' },
          ],
          locale,
        )}
      />
      {posts.length > 0 ? (
        <JsonLd data={buildArticleListJsonLd(posts)} />
      ) : null}
      <Menu
        backgroundColor={ARTICLES_TOP_BACKGROUND_COLOR}
        socialLinks={menuSocialLinks}
      />

      <div className={pageRevealClassName}>
        <ArticlesHero />
        <TrustedBy
          cardBackgroundColor={ARTICLES_TOP_BACKGROUND_COLOR}
          compactBottom
        />
      </div>

      <ArticlesIndex posts={posts} />
    </>
  );
}
