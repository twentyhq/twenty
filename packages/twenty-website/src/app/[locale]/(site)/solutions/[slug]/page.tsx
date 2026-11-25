import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  getRelatedIndustryPages,
  INDUSTRY_PAGES,
  INDUSTRY_PAGES_BY_SLUG,
  resolveIndustryPage,
} from '@/industries';
import { getCommunityStats } from '@/platform/community';
import { getRouteI18n } from '@/platform/i18n/get-route-i18n';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { resolveLocaleParam } from '@/platform/i18n/resolve-locale-param';
import { buildBreadcrumbListJsonLd, JsonLd } from '@/platform/seo';
import { IndustryPage } from '@/sections/industry-page';
import { Menu } from '@/sections/menu';

type IndustryRouteParams = { locale: string; slug: string };

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return INDUSTRY_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<IndustryRouteParams>;
}): Promise<Metadata> {
  await getRouteI18n(params);
  const i18n = getServerI18n();
  const definition = INDUSTRY_PAGES_BY_SLUG.get((await params).slug);
  if (!definition) {
    return {};
  }

  return {
    title: i18n._(definition.meta.title),
    description: i18n._(definition.meta.description),
    // Drafts are reachable for review but stay out of search until approved.
    robots:
      definition.status === 'draft'
        ? { index: false, follow: false }
        : undefined,
  };
}

export default async function IndustryRoutePage({
  params,
}: {
  params: Promise<IndustryRouteParams>;
}) {
  const [, communityStats] = await Promise.all([
    getRouteI18n(params),
    getCommunityStats(),
  ]);
  const i18n = getServerI18n();
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocaleParam(rawLocale);
  const definition = INDUSTRY_PAGES_BY_SLUG.get(slug);
  if (!definition) {
    notFound();
  }

  const page = resolveIndustryPage(definition, INDUSTRY_PAGES_BY_SLUG);
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    ...(page.parent
      ? [
          {
            name: i18n._(page.parent.name),
            path: `/solutions/${page.parent.slug}`,
          },
        ]
      : []),
    { name: i18n._(page.name), path: `/solutions/${page.slug}` },
  ];

  return (
    <>
      <JsonLd data={buildBreadcrumbListJsonLd(breadcrumbs, locale)} />
      <Menu communityStats={communityStats} scheme="dark" />
      <main>
        <IndustryPage
          page={page}
          relatedPages={getRelatedIndustryPages(definition, INDUSTRY_PAGES)}
        />
      </main>
    </>
  );
}
