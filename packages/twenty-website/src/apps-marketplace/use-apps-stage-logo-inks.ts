'use client';

import { useEffect, useState } from 'react';

import {
  type AppsStageLogoInk,
  readAppsStageLogoInk,
} from './apps-stage-logo-ink';
import { type MarketplaceApp } from './marketplace-app';

// . Keyed by slug; empty until every logo is read, so
// the logos reveal together rather than one by one.
export const useAppsStageLogoInks = (
  apps: readonly MarketplaceApp[],
): Record<string, AppsStageLogoInk> => {
  const [inks, setInks] = useState<Record<string, AppsStageLogoInk>>({});

  useEffect(() => {
    let isCurrent = true;

    void Promise.all(
      apps.map(async (app) => {
        const ink: AppsStageLogoInk =
          app.logoUrl === undefined || app.logoUrl.length === 0
            ? { kind: 'glyph', tint: '' }
            : await readAppsStageLogoInk(app.logoUrl);

        return [app.slug, ink] as const;
      }),
    ).then((entries) => {
      if (isCurrent) {
        setInks(Object.fromEntries(entries));
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [apps]);

  return inks;
};
