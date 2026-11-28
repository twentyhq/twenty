import { type Metadata } from 'next';
import { Suspense } from 'react';

import { type LocaleRouteParams } from '@/platform/i18n/get-route-i18n';
import COMPONENT_DOCS from '@/platform/design-system/component-docs.json';
import { ComponentEmbed } from '@/platform/design-system/ComponentEmbed';
import { toComponentSlug } from '@/platform/design-system/component-slug';

type EmbedParams = LocaleRouteParams & { slug: string };

export const generateStaticParams = () =>
  COMPONENT_DOCS.components.map((component) => ({
    slug: toComponentSlug(component.name),
  }));

export const metadata: Metadata = {
  title: 'Embed · Design system',
  robots: { index: false, follow: false },
};

export default async function EmbedPage({
  params,
}: {
  params: Promise<EmbedParams>;
}) {
  const { slug } = await params;
  return (
    <Suspense>
      <ComponentEmbed slug={slug} />
    </Suspense>
  );
}
