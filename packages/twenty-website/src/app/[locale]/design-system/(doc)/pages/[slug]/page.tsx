import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import COMPONENT_DOCS from '@/platform/design-system/component-docs.json';
import { PageDetailPage } from '@/platform/design-system/PageDetailPage';
import { toPageSlug } from '@/platform/design-system/page-slug';

type DesignSystemPageParams = LocaleRouteParams & { slug: string };

const pageOf = (slug: string) =>
  COMPONENT_DOCS.pages.find((page) => toPageSlug(page.route) === slug);

export const generateStaticParams = () =>
  COMPONENT_DOCS.pages.map((page) => ({ slug: toPageSlug(page.route) }));

export const generateMetadata = async ({
  params,
}: {
  params: Promise<DesignSystemPageParams>;
}): Promise<Metadata> => ({
  title: `${pageOf((await params).slug)?.route ?? 'Page'} · Design system`,
  robots: { index: false, follow: false },
});

export default async function DesignSystemPageRoute({
  params,
}: {
  params: Promise<DesignSystemPageParams>;
}) {
  await getRouteI18n(params);
  const { slug } = await params;
  if (!pageOf(slug)) notFound();
  return <PageDetailPage slug={slug} />;
}
