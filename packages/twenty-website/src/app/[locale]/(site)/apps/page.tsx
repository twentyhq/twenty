import {
  AppsMarketplaceClient,
  AppsMarketplaceHeader,
  fetchMarketplaceApps,
} from '@/apps-marketplace';
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
import { msg } from '@lingui/core/macro';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { SITE_URLS } from '@/platform/site-urls';
import { Menu } from '@/sections/menu';
import { Button, EngagementBand, Signoff } from '@/ui';
// PROTOTYPE direction B, dark header (?direction=b).
import { AppsMarketplaceHeaderDark } from '@/apps-marketplace/AppsDarkStage';
import { AppsMarketplaceClientDirectionB } from '@/apps-marketplace/AppsMarketplaceClientDirectionB';
// PROTOTYPE direction D, the logo dock on a dark stage (?direction=d).
import { AppsStageApplyDock } from '@/apps-marketplace/AppsStageApplyDock';
import { AppsStageCatalogue } from '@/apps-marketplace/AppsStageCatalogue';
import { AppsStageClosing } from '@/apps-marketplace/AppsStageClosing';
import { AppsStageHero } from '@/apps-marketplace/AppsStageHero';
// PROTOTYPE direction E, the "craft" direction approved in Paper (?direction=e).
import { AppsStageCraftCatalogue } from '@/apps-marketplace/AppsStageCraftCatalogue';
import { AppsStageCraftHero } from '@/apps-marketplace/AppsStageCraftHero';
import { AppsStageFeatured } from '@/apps-marketplace/AppsStageFeatured';

export const generateMetadata = buildRouteMetadata('apps');

export const dynamic = 'force-dynamic';

export default async function AppsMarketplacePage({
  params,
  searchParams,
}: {
  params: Promise<LocaleRouteParams>;
  searchParams: Promise<{
    direction?: string;
    hero?: string;
    tone?: string;
    view?: string;
  }>;
}) {
  const searchPrototype = await searchParams;
  const prototype = {
    ...searchPrototype,
    direction: searchPrototype.direction ?? 'e',
  };
  const isDirectionB = prototype.direction === 'b';
  const isDirectionD = prototype.direction === 'd';
  const isDirectionE = prototype.direction === 'e';
  const isDarkHeader =
    isDirectionD ||
    isDirectionE ||
    (isDirectionB && prototype.tone !== 'light');
  const [, communityStats, apps] = await Promise.all([
    getRouteI18n(params),
    getCommunityStats(),
    fetchMarketplaceApps().catch((error: unknown) => {
      console.error('[apps-marketplace] live fetch failed:', error);

      return null;
    }),
  ]);
  const locale = resolveLocaleParam((await params).locale);
  const i18n = getServerI18n();

  return (
    <>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Apps', path: '/apps' },
          ],
          locale,
        )}
      />
      <Menu
        communityStats={communityStats}
        scheme={isDarkHeader ? 'dark' : 'light'}
      />
      {isDirectionE ? (
        <main>
          <AppsStageCraftHero
            apps={apps ?? []}
            motion={
              prototype.hero === 'marquee' || prototype.hero === 'orbit'
                ? prototype.hero
                : 'ring'
            }
          />
          <AppsStageFeatured apps={apps ?? []} />
          <AppsStageCraftCatalogue
            apps={apps ?? []}
            isUnavailable={apps === null}
            view={prototype.view === 'list' ? 'list' : 'grid'}
          />
          <Signoff
            heading={i18n._(msg`Build your own *app*`)}
            scheme="dark"
            body={i18n._(
              msg`Add objects, logic and interface to Twenty, then publish it for every workspace.`,
            )}
          >
            <Button
              href={SITE_URLS.docsDevelopers}
              label={i18n._(msg`Read the docs`)}
              variant="filled"
            />
          </Signoff>
        </main>
      ) : (
        <main>
          {isDirectionD ? (
            <AppsStageHero apps={apps ?? []} />
          ) : isDarkHeader ? (
            <AppsMarketplaceHeaderDark />
          ) : (
            <AppsMarketplaceHeader />
          )}
          {isDirectionD ? (
            <AppsStageCatalogue
              apps={apps ?? []}
              isUnavailable={apps === null}
            />
          ) : isDirectionB ? (
            <AppsMarketplaceClientDirectionB
              apps={apps ?? []}
              isUnavailable={apps === null}
            />
          ) : (
            <AppsMarketplaceClient
              apps={apps ?? []}
              isUnavailable={apps === null}
            />
          )}
          {isDirectionD ? (
            <AppsStageClosing
              heading={i18n._(msg`Build your own app`)}
              body={i18n._(
                msg`Add objects, logic and interface to Twenty, then publish it for every workspace.`,
              )}
              actions={
                <Button
                  href={SITE_URLS.docsDevelopers}
                  label={i18n._(msg`Read the docs`)}
                  variant="filled"
                />
              }
            />
          ) : (
            <EngagementBand
              heading={i18n._(msg`Build your own app`)}
              body={i18n._(
                msg`Add objects, logic and interface to Twenty, then publish it for every workspace.`,
              )}
              actions={
                <Button
                  href={SITE_URLS.docsDevelopers}
                  label={i18n._(msg`Read the docs`)}
                  variant="filled"
                />
              }
            />
          )}
          {isDirectionD && <AppsStageApplyDock />}
        </main>
      )}
    </>
  );
}
