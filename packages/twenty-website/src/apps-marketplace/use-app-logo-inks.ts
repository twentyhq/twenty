'use client';

import { useEffect, useState } from 'react';

import { type AppLogoInk, readAppLogoInk } from './app-logo-ink';
import { type MarketplaceApp } from './marketplace-app';

// Empty until every logo is read, so the logos reveal together.
export const useAppLogoInks = (
  apps: readonly MarketplaceApp[],
): Record<string, AppLogoInk> => {
  const [inks, setInks] = useState<Record<string, AppLogoInk>>({});

  useEffect(() => {
    let isCurrent = true;

    void Promise.all(
      apps.map(async (app) => {
        const ink: AppLogoInk =
          app.logoUrl === undefined || app.logoUrl.length === 0
            ? { kind: 'glyph', tint: '' }
            : await readAppLogoInk(app.logoUrl);

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
