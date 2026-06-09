'use client';

import { styled } from '@linaria/react';

import type { SidebarItemDef } from '../types';
import { SidebarRailItem } from './SidebarRailItem';

const FavoritesRail = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  row-gap: 6px;
`;

type SidebarRailFavoritesProps = {
  favoritesNav: SidebarItemDef[];
  highlightedItemId?: string;
  onSelectPageItem: (itemId: string) => void;
  selectedItemId: string;
};

export function SidebarRailFavorites({
  favoritesNav,
  highlightedItemId,
  onSelectPageItem,
  selectedItemId,
}: SidebarRailFavoritesProps) {
  return (
    <FavoritesRail>
      {favoritesNav.map((item) => (
        <SidebarRailItem
          active={selectedItemId === item.id}
          highlighted={highlightedItemId === item.id}
          item={item}
          key={item.id}
          onSelect={onSelectPageItem}
        />
      ))}
    </FavoritesRail>
  );
}
