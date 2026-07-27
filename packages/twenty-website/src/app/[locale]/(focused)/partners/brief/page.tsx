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
  const [, resolvedSearchParams] = await Promise.all([
    getRouteI18n(params),
    searchParams,
  ]);

  return (
    <ClientBriefPageContent
      partnerSlug={normalizePartnerSlug(resolvedSearchParams.partner)}
    />
  );
}
