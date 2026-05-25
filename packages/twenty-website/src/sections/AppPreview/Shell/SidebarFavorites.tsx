'use client';

import { styled } from '@linaria/react';

import type { SidebarItemDef } from '../types';
import { APP_FONT, COLORS } from '../Shared/utils/app-preview-theme';
import { SidebarDesktopItem } from './SidebarDesktopItem';

const FavoritesSection = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  row-gap: 2px;
`;

const FavoritesLabelRow = styled.div`
  align-items: center;
  display: flex;
  height: 28px;
  padding-left: 4px;
  padding-right: 2px;
`;

const FavoritesLabel = styled.span`
  color: ${COLORS.textLight};
  font-family: ${APP_FONT};
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
`;

type SidebarFavoritesProps = {
  favoritesNav: SidebarItemDef[];
  highlightedItemId?: string;
  onSelectPageItem: (itemId: string) => void;
  selectedItemId: string;
};

export function SidebarFavorites({
  favoritesNav,
  highlightedItemId,
  onSelectPageItem,
  selectedItemId,
}: SidebarFavoritesProps) {
  return (
    <FavoritesSection>
      <FavoritesLabelRow>
        <FavoritesLabel>Favorites</FavoritesLabel>
      </FavoritesLabelRow>
      {favoritesNav.map((item) => (
        <SidebarDesktopItem
          highlightedItemId={highlightedItemId}
          key={item.id}
          item={item}
          onSelect={onSelectPageItem}
          selectedItemId={selectedItemId}
        />
      ))}
    </FavoritesSection>
  );
}
