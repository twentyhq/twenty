import { msg } from '@lingui/core/macro';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  CASE_STUDY_CATALOG,
  CASE_STUDY_STORIES,
  getCaseStudyAccent,
} from '@/case-studies';
import { getCommunityStats } from '@/platform/community';
import { getRouteI18n } from '@/platform/i18n/get-route-i18n';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { resolveLocaleParam } from '@/platform/i18n/resolve-locale-param';
import { buildBreadcrumbListJsonLd, JsonLd } from '@/platform/seo';
import {
  CaseStudyArticleNav,
  CaseStudyBody,
  CaseStudyHero,
  CaseStudyHighlights,
  CustomersCaseStudySignoff,
} from '@/sections/case-study-detail';
import { Menu } from '@/sections/menu';

type CaseStudyParams = { locale: string; slug: string };

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return CASE_STUDY_CATALOG.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<CaseStudyParams>;
}): Promise<Metadata> {
  await getRouteI18n(params);
  const i18n = getServerI18n();
  const { slug } = await params;
  const story = CASE_STUDY_STORIES[slug];
  if (!story) {
    return { title: i18n._(msg`Customer story not found — Twenty`) };
  }
  return {
    title: i18n._(story.meta.title),
    description: i18n._(story.meta.description),
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<CaseStudyParams>;
}) {
  const [, communityStats] = await Promise.all([
    getRouteI18n(params),
    getCommunityStats(),
  ]);
  const i18n = getServerI18n();
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocaleParam(rawLocale);
  const index = CASE_STUDY_CATALOG.findIndex((entry) => entry.slug === slug);
  const entry = CASE_STUDY_CATALOG[index];
  const story = CASE_STUDY_STORIES[slug];
  if (!entry || !story) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Customers', path: '/customers' },
            { name: i18n._(entry.title), path: `/customers/${slug}` },
          ],
          locale,
        )}
      />
      <Menu communityStats={communityStats} scheme="dark" />
      <main>
        <CaseStudyHero
          accent={getCaseStudyAccent(index)}
          entry={entry}
          story={story}
        />
        <CaseStudyHighlights industry={entry.industry} kpis={entry.kpis} />
        <CaseStudyBody story={story} />
        <CaseStudyArticleNav items={story.tableOfContents} />
        <CustomersCaseStudySignoff />
      </main>
    </>
  );
}
