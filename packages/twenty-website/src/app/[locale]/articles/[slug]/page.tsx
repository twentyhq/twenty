import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { getPublishedArticle, getPublishedArticles } from '@/lib/articles';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { type LocaleRouteParams } from '@/lib/i18n/utils/get-route-i18n';
import { localeToUrlSegment } from '@/lib/i18n/utils/website-locale-segments';
import { resolveLocaleParam } from '@/lib/i18n';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { buildArticleJsonLd, buildPageMetadata, JsonLd } from '@/lib/seo';
import { Articles } from '@/sections/Articles';
import { Menu, MENU_DATA } from '@/sections/Menu';
import { theme } from '@/theme';

type ArticleSlugParams = LocaleRouteParams & { slug: string };

type ArticlePageProps = {
  params: Promise<ArticleSlugParams>;
};

export const dynamicParams = false;

export function generateStaticParams(): ArticleSlugParams[] {
  return getPublishedArticles().map((post) => ({
    locale: localeToUrlSegment(SOURCE_LOCALE),
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocaleParam(rawLocale);
  const post = getPublishedArticle(slug);

  if (locale !== SOURCE_LOCALE || !post) {
    return { robots: { index: false, follow: false } };
  }

  return buildPageMetadata({
    locale,
    path: `/articles/${post.slug}`,
    title: {
      id: `${post.title} | Twenty Articles`,
      message: `${post.title} | Twenty Articles`,
    },
    description: { id: post.description, message: post.description },
    locales: [SOURCE_LOCALE],
    type: 'article',
    extend: { authors: [{ name: post.author }] },
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocaleParam(rawLocale);
  const post = getPublishedArticle(slug);

  if (locale !== SOURCE_LOCALE || !post) {
    notFound();
  }

  const stats = await fetchCommunityStats();
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <>
      <JsonLd data={buildArticleJsonLd(post)} />
      <Menu.Root
        backgroundColor={theme.colors.primary.background[100]}
        scheme="primary"
        navItems={MENU_DATA.navItems}
        socialLinks={menuSocialLinks}
      >
        <Menu.Logo scheme="primary" />
        <Menu.Nav scheme="primary" navItems={MENU_DATA.navItems} />
        <Menu.Social scheme="primary" socialLinks={menuSocialLinks} />
        <Menu.Cta scheme="primary" />
      </Menu.Root>
      <Articles.Article post={post} />
    </>
  );
}
