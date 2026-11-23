import { msg } from '@lingui/core/macro';

import { ClientBriefModalRoot, GetMatchedButton } from '@/client-brief';
import { TalkToUsButton } from '@/contact-cal';
import { getCommunityStats } from '@/platform/community';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { resolveLocaleParam } from '@/platform/i18n/resolve-locale-param';
import {
  buildBreadcrumbListJsonLd,
  buildRouteMetadata,
  JsonLd,
} from '@/platform/seo';
import { PartnerFaq } from '@/sections/faq';
import { Menu } from '@/sections/menu';
import { BrowseDirectoryButton } from '@/sections/partner-hero/BrowseDirectoryButton';
import {
  loadDirectoryPartners,
  PartnersClosing,
  PartnersDirectory,
  PartnersHero,
  PartnersServices,
} from '@/sections/partners-directory';

export const generateMetadata = buildRouteMetadata('partners');

export const dynamic = 'force-dynamic';

export default async function PartnersPage({
  params,
}: {
  params: Promise<LocaleRouteParams>;
}) {
  const [, communityStats, partners] = await Promise.all([
    getRouteI18n(params),
    getCommunityStats(),
    loadDirectoryPartners(),
  ]);
  const locale = resolveLocaleParam((await params).locale);

  return (
    <ClientBriefModalRoot>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Partners', path: '/partners' },
          ],
          locale,
        )}
      />
      <Menu communityStats={communityStats} scheme="dark" />
      <main>
        <PartnersHero
          actions={
            <>
              <BrowseDirectoryButton />
              <GetMatchedButton label={msg`Get matched`} variant="outlined" />
            </>
          }
        />
        <PartnersServices />
        <PartnersDirectory
          matchCta={
            <GetMatchedButton label={msg`Get matched`} variant="filled" />
          }
          partners={partners}
        />
        <PartnersClosing
          action={<GetMatchedButton label={msg`Submit a brief`} />}
        />
        <PartnerFaq
          actions={
            <>
              <GetMatchedButton label={msg`Get matched`} />
              <TalkToUsButton label={msg`Talk to us`} variant="outlined" />
            </>
          }
        />
      </main>
    </ClientBriefModalRoot>
  );
}
