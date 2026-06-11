import { styled } from '@linaria/react';

import { APP_PREVIEW_THEME } from '@/tokens/app-preview/app-preview-theme';

import { renderPreviewIcon } from '../primitives/preview-icon';
import { PREVIEW_COLORS } from '../preview-colors';
import { type SidebarItemDef } from '../types';

const theme = APP_PREVIEW_THEME;

const ItemRow = styled.div<{ $active?: boolean }>`
  align-items: center;
  background: ${({ $active }) =>
    $active ? theme.background.transparent.light : 'transparent'};
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  height: ${theme.chrome.navigationItemHeightPx}px;
  justify-content: flex-start;
  padding-left: 4px;
  padding-right: 2px;
  position: relative;
  transition: background-color 0.14s ease;
  width: 100%;

  &:hover {
    background: ${theme.background.transparent.light};
  }
`;

const RowMain = styled.div`
  align-items: center;
  column-gap: 8px;
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
`;

const ItemText = styled.div`
  align-items: center;
  column-gap: 2px;
  display: flex;
  min-width: 0;
`;

const ItemLabel = styled.span<{ $active?: boolean }>`
  color: ${({ $active }) =>
    $active ? PREVIEW_COLORS.text : PREVIEW_COLORS.textSecondary};
  font-family: ${theme.font.family};
  font-size: ${theme.font.sizePx.md}px;
  font-weight: ${theme.font.weight.medium};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ItemMeta = styled.span`
  color: ${PREVIEW_COLORS.textLight};
  font-family: ${theme.font.family};
  font-size: ${theme.font.sizePx.md}px;
  font-weight: ${theme.font.weight.medium};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export function SidebarItem({
  active = false,
  item,
}: {
  active?: boolean;
  item: SidebarItemDef;
}) {
  return (
    <ItemRow $active={active} data-nav-item="">
      <RowMain>
        {renderPreviewIcon(item.icon)}
        <ItemText>
          <ItemLabel $active={active}>{item.label}</ItemLabel>
          {item.meta ? <ItemMeta>· {item.meta}</ItemMeta> : null}
        </ItemText>
      </RowMain>
    </ItemRow>
  );
}
