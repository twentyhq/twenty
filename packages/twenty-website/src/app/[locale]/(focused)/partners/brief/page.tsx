import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { buildRouteMetadata } from '@/platform/seo';

import { ClientBriefPageContent } from './ClientBriefPageContent';

export const generateMetadata = buildRouteMetadata('partnersBrief');

export default async function ClientBriefPage({
  params,
}: {
  params: Promise<LocaleRouteParams>;
}) {
  await getRouteI18n(params);

  return <ClientBriefPageContent />;
}
