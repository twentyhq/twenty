'use client';

import { styled } from '@linaria/react';

import { mediaUp, radius, semanticColor } from '@/tokens';

import { AppsStageCraftCell } from './AppsStageCraftCell';
import { APPS_STAGE_BETA_APP_NAMES } from './apps-stage-beta-apps';
import { getAppsStagePastel } from './apps-stage-pastels';
import { type MarketplaceApp } from './marketplace-app';
import { useAppsStageLogoInks } from './use-apps-stage-logo-inks';

// PROTOTYPE (?direction=e): "You might also like", the catalogue's own cells
// in the same rounded box.
const Grid = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  overflow: hidden;

  & > [data-apps-stage-cell] {
    border-right: none;
  }

  & > [data-apps-stage-cell]:last-child {
    border-bottom: none;
  }

  ${mediaUp('sm')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    & > [data-apps-stage-cell] {
      border-bottom: none;
    }

    & > [data-apps-stage-cell]:first-child:not(:last-child) {
      border-right: 1px solid ${semanticColor.line};
    }

    & > [data-apps-stage-cell]:only-child {
      grid-column: 1 / -1;
    }
  }
`;

type AppsStageAppRelatedProps = {
  apps: readonly MarketplaceApp[];
  sortedCategories: readonly string[];
};

export function AppsStageAppRelated({
  apps,
  sortedCategories,
}: AppsStageAppRelatedProps) {
  const inks = useAppsStageLogoInks(apps);

  return (
    <Grid>
      {apps.map((app, index) => (
        <AppsStageCraftCell
          app={app}
          index={index}
          ink={inks[app.slug]}
          isBeta={APPS_STAGE_BETA_APP_NAMES.includes(
            app.name.trim().toLowerCase(),
          )}
          key={app.slug}
          pastel={getAppsStagePastel(app.category, sortedCategories)}
        />
      ))}
    </Grid>
  );
}
