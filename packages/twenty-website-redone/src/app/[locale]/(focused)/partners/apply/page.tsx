import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { buildRouteMetadata } from '@/platform/seo';

import { PartnerApplicationPageContent } from './PartnerApplicationPageContent';

export const generateMetadata = buildRouteMetadata('partnersApply');

// A focused full-page form (no menu/footer chrome), mirroring the old apply
// page. noindex via the route registry record.
export default async function PartnerApplyPage({
  params,
}: {
  params: Promise<LocaleRouteParams>;
}) {
  await getRouteI18n(params);

  return <PartnerApplicationPageContent />;
}
