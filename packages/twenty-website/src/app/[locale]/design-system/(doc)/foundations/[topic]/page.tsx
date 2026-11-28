import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { FoundationPage } from '@/platform/design-system/FoundationPage';
import { FOUNDATION_TOPICS } from '@/platform/design-system/foundation-topics';

type FoundationParams = LocaleRouteParams & { topic: string };

const labelOf = (topic: string) =>
  FOUNDATION_TOPICS.find((entry) => entry.slug === topic)?.label;

export const generateStaticParams = () =>
  FOUNDATION_TOPICS.map((entry) => ({ topic: entry.slug }));

export const generateMetadata = async ({
  params,
}: {
  params: Promise<FoundationParams>;
}): Promise<Metadata> => ({
  title: `${labelOf((await params).topic) ?? 'Foundations'} · Design system`,
  robots: { index: false, follow: false },
});

export default async function DesignSystemFoundationRoute({
  params,
}: {
  params: Promise<FoundationParams>;
}) {
  await getRouteI18n(params);
  const { topic } = await params;
  if (labelOf(topic) === undefined) notFound();

  return <FoundationPage topic={topic} />;
}
