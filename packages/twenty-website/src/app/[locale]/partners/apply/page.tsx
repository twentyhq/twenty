import { buildRouteMetadata } from '@/lib/seo';
import { getRouteI18n, type LocaleRouteParams } from '@/lib/i18n/server';
import { PartnerApplicationPageContent } from './PartnerApplicationPageContent';

export const generateMetadata = buildRouteMetadata('partnersApply', {
  extend: { robots: { index: false, follow: false } },
});

type ApplyPageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function PartnerApplyPage({ params }: ApplyPageProps) {
  await getRouteI18n(params);

  return <PartnerApplicationPageContent />;
}
