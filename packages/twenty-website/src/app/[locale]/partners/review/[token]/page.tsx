import { getRouteI18n, type LocaleRouteParams } from '@/lib/i18n/server';
import { type Metadata } from 'next';
import {
  BriefReviewPageContent,
  type ReviewData,
} from './BriefReviewPageContent';

// Token-gated, no SEO value — keep it out of the index. (No static-website-routes
// entry needed: App Router serves the file directly; registration only feeds the
// sitemap/metadata, which we don't want for this page.)
export const metadata: Metadata = { robots: { index: false, follow: false } };

type ReviewPageProps = {
  params: Promise<LocaleRouteParams & { token: string }>;
};

async function fetchReview(token: string): Promise<ReviewData> {
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
}

export default async function BriefReviewPage({ params }: ReviewPageProps) {
  await getRouteI18n(params);
  const { token } = await params;
  const data = await fetchReview(token);
  return <BriefReviewPageContent token={token} data={data} />;
}
