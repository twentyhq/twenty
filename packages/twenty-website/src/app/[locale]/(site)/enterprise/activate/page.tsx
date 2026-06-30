import { getCommunityStats } from '@/platform/community';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { buildRouteMetadata } from '@/platform/seo';
import {
  EnterpriseActivateHero,
  EnterpriseActivatePanel,
} from '@/sections/enterprise-activate';
import { Menu } from '@/sections/menu';

export const generateMetadata = buildRouteMetadata('enterpriseActivate');

export default async function EnterpriseActivatePage({
  params,
}: {
  params: Promise<LocaleRouteParams>;
}) {
  const [, communityStats] = await Promise.all([
    getRouteI18n(params),
    getCommunityStats(),
  ]);

  return (
    <>
      <Menu communityStats={communityStats} scheme="muted" />
      <main>
        <EnterpriseActivateHero />
        <EnterpriseActivatePanel />
      </main>
    </>
  );
}
