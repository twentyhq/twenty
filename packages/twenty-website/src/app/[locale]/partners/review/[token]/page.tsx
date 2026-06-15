import { getRouteI18n, type LocaleRouteParams } from '@/lib/i18n/server';
import { type Metadata } from 'next';
import { cache } from 'react';
import {
  BriefReviewPageContent,
  type ReviewData,
} from './BriefReviewPageContent';

type ReviewPageProps = {
  params: Promise<LocaleRouteParams & { token: string }>;
};

// cache() dedupes the fetch across generateMetadata + the page render in one
// request (fetch itself isn't memoized under cache: 'no-store').
const getReview = cache(async (token: string): Promise<ReviewData> => {
  const base = process.env.BRIEF_REVIEW_BASE_URL?.trim().replace(/\/+$/, '');
  if (!base) return { ok: false, reason: 'NOT_CONFIGURED' };
  try {
    const res = await fetch(`${base}?token=${encodeURIComponent(token)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return { ok: false, reason: 'UPSTREAM' };
    return (await res.json()) as ReviewData;
  } catch {
    return { ok: false, reason: 'UPSTREAM' };
  }
});

// Token-gated, no SEO value, so keep it out of the index. Title carries the
// brief name so the browser tab is identifiable when several reviews are open.
export async function generateMetadata({
  params,
}: ReviewPageProps): Promise<Metadata> {
  const { token } = await params;
  const data = await getReview(token);
  const title =
    data.ok && data.brief.name
      ? `${data.brief.name} · Partner review`
      : 'Partner review · Twenty';
  return { title, robots: { index: false, follow: false } };
}

export default async function BriefReviewPage({ params }: ReviewPageProps) {
  await getRouteI18n(params);
  const { locale, token } = await params;
  const data = await getReview(token);
  return <BriefReviewPageContent token={token} locale={locale} data={data} />;
}
