'use client';

import { styled } from '@linaria/react';
import { useMemo } from 'react';

import { color, radius, semanticColor } from '@/tokens';

import { type MarketplaceApp } from './marketplace-app';
import { useAppsStageLogoInks } from './use-apps-stage-logo-inks';

// An app's icon at any size, notched like the site's
// cards. A logo that ships its own square fills the tile; any other sits on a
// light tile, so no logo ends up as a tile inside a tile.
const Tile = styled.div`
  align-items: center;
  background-color: ${color('charcoal')};
  border-radius: ${radius(2)};
  box-shadow: inset 0 0 0 1px ${semanticColor.line};
  clip-path: polygon(0 0, 100% 0, 100% 82%, 82% 100%, 0 100%);
  display: flex;
  flex-shrink: 0;
  height: var(--apps-stage-icon-size);
  justify-content: center;
  overflow: hidden;
  width: var(--apps-stage-icon-size);

  &[data-kind='glyph'] {
    background-color: ${color('neutral')};
  }
`;

const Logo = styled.img`
  height: 58%;
  object-fit: contain;
  width: 58%;

  [data-kind='plate'] > & {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  [data-kind='unknown'] > & {
    opacity: 0;
  }
`;

type AppsStageAppIconProps = {
  app: MarketplaceApp;
  sizePx: number;
};

export function AppsStageAppIcon({ app, sizePx }: AppsStageAppIconProps) {
  // A stable list: a fresh array each render would re-run the read forever.
  const apps = useMemo(() => [app], [app]);
  const inks = useAppsStageLogoInks(apps);

  return (
    <Tile
      aria-hidden
      data-kind={inks[app.slug]?.kind ?? 'unknown'}
      style={{ ['--apps-stage-icon-size' as string]: `${sizePx}px` }}
    >
      {app.logoUrl !== undefined && <Logo alt="" src={app.logoUrl} />}
    </Tile>
  );
}
