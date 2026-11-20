import { msg } from '@lingui/core/macro';
import { Suspense } from 'react';

import { ClientBriefModalRoot, GetMatchedButton } from '@/client-brief';
import {
  BecomePartnerButton,
  PartnerApplicationModalRoot,
} from '@/partner-application';
import { MarketplaceBriefPrompt } from '@/partners-marketplace/MarketplaceBriefPrompt';
import { getMarketplacePartners } from '@/partners-marketplace/marketplace-partners-source';
import { MarketplaceListSkeleton } from '@/partners-marketplace/MarketplaceListSkeleton';
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
import { PartnerLeadHero } from '@/sections/partner-hero';
import { BrowseDirectoryButton } from '@/sections/partner-hero/BrowseDirectoryButton';
import {
  PartnerBecomeStrip,
  PartnerDirectory,
  PartnerDirectoryPanel,
  PartnerServicesExplainer,
} from '@/sections/partner-lead';
// PROTOTYPE direction D, the partners stage (?direction=d).
import {
  PartnersStageAnchor,
  PartnersStageApplyDock,
  PartnersStageAtlas,
  PartnersStageClosing,
  PartnersStageCraftClosing,
  PartnersStageCraftDirectory,
  PartnersStageCraftMapHero,
  PartnersStageCraftServices,
  type PartnersStageAtlasPartner,
  PartnersStageDirectory,
  PartnersStageDirectoryPanel,
  PartnersStageDirectorySkeleton,
  PartnersStageHero,
  PartnersStageServices,
  PartnersStageWorldMap,
  PROTOTYPE_SAMPLE_PARTNERS,
  resolvePartnerPlace,
} from '@/sections/partners-stage';
import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { titleCaseFallback } from '@/partners-marketplace/title-case-fallback';

export const generateMetadata = buildRouteMetadata('partners');

export const dynamic = 'force-dynamic';

// Kept out of the page-level await: the rest of the page must not wait on a
// call only the directory needs, and awaiting it there also resolves it before
// the boundary renders, leaving MarketplaceListSkeleton dead.
async function PartnerDirectoryZone() {
  const partners = await getMarketplacePartners();

  return <PartnerDirectoryPanel partners={partners} />;
}

// PROTOTYPE
// Without the partners API (local runs) the stage shows the directory as
// published on twenty.com; ?partners=none forces the empty state.
const loadStagePartners = async (
  partnersParam: string | undefined,
): Promise<readonly MarketplacePartner[]> => {
  if (partnersParam === 'none') {
    return [];
  }
  const partners = await getMarketplacePartners();

  return partners.length === 0 && process.env.NODE_ENV !== 'production'
    ? PROTOTYPE_SAMPLE_PARTNERS
    : partners;
};

type StageZoneProps = {
  partnersPromise: Promise<readonly MarketplacePartner[]>;
};

// PROTOTYPE
async function StageAtlasZone({ partnersPromise }: StageZoneProps) {
  const partners = await partnersPromise;
  const atlasPartners: PartnersStageAtlasPartner[] = partners.map(
    (partner) => ({
      slug: partner.slug,
      name: partner.name,
      locationLine: [
        partner.city,
        partner.country ? titleCaseFallback(partner.country) : '',
      ]
        .filter(Boolean)
        .join(', '),
      markUrl: partner.profilePictureUrl,
      place: resolvePartnerPlace(partner.city, partner.country),
    }),
  );

  return (
    <PartnersStageAtlas
      map={<PartnersStageWorldMap />}
      partners={atlasPartners}
    />
  );
}

// PROTOTYPE
async function StageDirectoryZone({ partnersPromise }: StageZoneProps) {
  const partners = await partnersPromise;

  return (
    <PartnersStageDirectoryPanel
      matchCta={
        <PartnersStageAnchor data-partners-stage-anchor="">
          <GetMatchedButton label={msg`Get matched`} variant="filled" />
        </PartnersStageAnchor>
      }
      partners={partners}
    />
  );
}

// PROTOTYPE
async function StageDockZone({ partnersPromise }: StageZoneProps) {
  const partners = await partnersPromise;

  return <PartnersStageApplyDock partnerCount={partners.length} />;
}

// PROTOTYPE
function PartnersStageMain({ partnersPromise }: StageZoneProps) {
  return (
    <main>
      <PartnersStageHero
        actions={
          <>
            <PartnersStageAnchor data-partners-stage-anchor="">
              <BrowseDirectoryButton />
            </PartnersStageAnchor>
            <PartnersStageAnchor data-partners-stage-anchor="">
              <GetMatchedButton label={msg`Get matched`} variant="outlined" />
            </PartnersStageAnchor>
          </>
        }
        atlas={
          <Suspense
            fallback={
              <PartnersStageAtlas
                map={<PartnersStageWorldMap />}
                partners={[]}
              />
            }
          >
            <StageAtlasZone partnersPromise={partnersPromise} />
          </Suspense>
        }
      />
      <PartnersStageDirectory>
        <Suspense fallback={<PartnersStageDirectorySkeleton />}>
          <StageDirectoryZone partnersPromise={partnersPromise} />
        </Suspense>
      </PartnersStageDirectory>
      <PartnersStageServices />
      <PartnerFaq />
      <PartnerBecomeStrip />
      <PartnersStageClosing
        cta={
          <PartnersStageAnchor data-partners-stage-anchor="">
            <GetMatchedButton label={msg`Submit a brief`} />
          </PartnersStageAnchor>
        }
      />
      <Suspense fallback={null}>
        <StageDockZone partnersPromise={partnersPromise} />
      </Suspense>
    </main>
  );
}

// PROTOTYPE direction E: the /apps direction e structure, with the partners'
// marks on the cover ring and the world map in the featured block.
async function PartnersStageCraftMain({ partnersPromise }: StageZoneProps) {
  const partners = await partnersPromise;
  return (
    <main>
      <PartnersStageCraftMapHero
        actions={
          <>
            <BrowseDirectoryButton />
            <GetMatchedButton label={msg`Get matched`} variant="outlined" />
          </>
        }
        partners={partners}
      />
      <PartnersStageCraftDirectory
        matchCta={
          <GetMatchedButton label={msg`Get matched`} variant="filled" />
        }
        partners={partners}
      />
      <PartnersStageCraftServices />
      <PartnersStageCraftClosing
        action={<GetMatchedButton label={msg`Submit a brief`} />}
        offerAction={
          <BecomePartnerButton
            label={msg`Apply as an integrator`}
            variant="outlined"
          />
        }
      />
    </main>
  );
}

export default async function PartnersPage({
  params,
  searchParams,
}: {
  params: Promise<LocaleRouteParams>;
  searchParams: Promise<{ direction?: string; partners?: string }>;
}) {
  const { direction = 'e', partners: partnersParam } = await searchParams;
  const isDirectionD = direction === 'd';
  const isDirectionE = direction === 'e';
  const [, communityStats] = await Promise.all([
    getRouteI18n(params),
    getCommunityStats(),
  ]);
  const locale = resolveLocaleParam((await params).locale);

  return (
    <PartnerApplicationModalRoot>
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
        <Menu
          communityStats={communityStats}
          scheme={isDirectionD || isDirectionE ? 'dark' : 'light'}
        />
        {isDirectionE ? (
          <Suspense fallback={null}>
            <PartnersStageCraftMain
              partnersPromise={loadStagePartners(partnersParam)}
            />
          </Suspense>
        ) : isDirectionD ? (
          <PartnersStageMain
            partnersPromise={loadStagePartners(partnersParam)}
          />
        ) : (
          <main>
            <PartnerLeadHero />
            <PartnerDirectory>
              <Suspense fallback={<MarketplaceListSkeleton />}>
                <PartnerDirectoryZone />
              </Suspense>
            </PartnerDirectory>
            <PartnerServicesExplainer />
            <MarketplaceBriefPrompt
              cta={<GetMatchedButton label={msg`Submit a brief`} />}
            />
            <PartnerFaq />
            <PartnerBecomeStrip />
          </main>
        )}
      </ClientBriefModalRoot>
    </PartnerApplicationModalRoot>
  );
}
