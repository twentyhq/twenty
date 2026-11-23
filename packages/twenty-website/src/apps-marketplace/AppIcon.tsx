'use client';

import { styled } from '@linaria/react';
import { type CSSProperties, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { color, radius, semanticColor } from '@/tokens';

import { type MarketplaceApp } from './marketplace-app';
import { useAppLogoInks } from './use-app-logo-inks';

// A logo that ships its own square fills the tile, so no tile sits in a tile.
const Tile = styled.div`
  align-items: center;
  background-color: ${semanticColor.surface};
  border-radius: ${radius(2)};
  box-shadow: inset 0 0 0 1px ${semanticColor.line};
  clip-path: polygon(0 0, 100% 0, 100% 82%, 82% 100%, 0 100%);
  display: flex;
  flex-shrink: 0;
  height: var(--apps-icon-size);
  justify-content: center;
  overflow: hidden;
  width: var(--apps-icon-size);

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

type TileStyle = CSSProperties & { '--apps-icon-size': string };

type AppIconProps = {
  app: MarketplaceApp;
  sizePx: number;
};

export function AppIcon({ app, sizePx }: AppIconProps) {
  // A stable list: a fresh array each render would re-run the read forever.
  const apps = useMemo(() => [app], [app]);
  const inks = useAppLogoInks(apps);
  const style: TileStyle = { '--apps-icon-size': `${sizePx}px` };

  return (
    <Tile
      aria-hidden
      data-kind={inks[app.slug]?.kind ?? 'unknown'}
      style={style}
    >
      {isDefined(app.logoUrl) && <Logo alt="" src={app.logoUrl} />}
    </Tile>
  );
}
