import { normalizePartnerSlug } from '@/client-brief/normalize-partner-slug';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { buildRouteMetadata } from '@/platform/seo';

import { ClientBriefPageContent } from './ClientBriefPageContent';

export const generateMetadata = buildRouteMetadata('partnersBrief');

export default async function ClientBriefPage({
  params,
  searchParams,
}: {
  params: Promise<LocaleRouteParams>;
  searchParams: Promise<{ partner?: string | string[] }>;
}) {
  await getRouteI18n(params);
  const { partner } = await searchParams;

  return <ClientBriefPageContent partnerSlug={normalizePartnerSlug(partner)} />;
}
