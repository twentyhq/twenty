import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import COMPONENT_DOCS from '@/platform/design-system/component-docs.json';
import { ComponentPage } from '@/platform/design-system/ComponentPage';
import { toComponentSlug } from '@/platform/design-system/component-slug';

type DesignSystemComponentParams = LocaleRouteParams & { slug: string };

const nameOf = (slug: string) =>
  COMPONENT_DOCS.components.find(
    (component) => toComponentSlug(component.name) === slug,
  )?.name;

export const generateStaticParams = () =>
  COMPONENT_DOCS.components.map((component) => ({
    slug: toComponentSlug(component.name),
  }));

export const generateMetadata = async ({
  params,
}: {
  params: Promise<DesignSystemComponentParams>;
}): Promise<Metadata> => ({
  title: `${nameOf((await params).slug) ?? 'Component'} · Design system`,
  robots: { index: false, follow: false },
});

export default async function DesignSystemComponentRoute({
  params,
}: {
  params: Promise<DesignSystemComponentParams>;
}) {
  await getRouteI18n(params);
  const { slug } = await params;
  if (nameOf(slug) === undefined) notFound();

  return <ComponentPage slug={slug} />;
}
