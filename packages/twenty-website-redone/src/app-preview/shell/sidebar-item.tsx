'use client';

import { styled } from '@linaria/react';

import { APP_PREVIEW_THEME } from '@/tokens/app-preview/app-preview-theme';

import { renderPreviewIcon } from '../primitives/preview-icon';
import { PREVIEW_COLORS } from '../preview-colors';
import { type SidebarItemDef } from '../types';

const theme = APP_PREVIEW_THEME;

const ItemRow = styled.button<{ $active?: boolean; $depth?: number }>`
  appearance: none;
  border: 0;
  text-align: left;
  align-items: center;
  background: ${({ $active }) =>
    $active ? theme.background.transparent.light : 'transparent'};
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  height: ${theme.chrome.navigationItemHeightPx}px;
  justify-content: flex-start;
  padding-left: ${({ $depth = 0 }) => ($depth === 0 ? '4px' : '11px')};
  padding-right: 2px;
  position: relative;
  transition: background-color 0.14s ease;
  width: 100%;

  &:hover {
    background: ${theme.background.transparent.light};
  }
`;

// Folder children carry the connector guides.
const BranchCell = styled.div<{ $isLastChild?: boolean }>`
  align-self: stretch;
  flex: 0 0 9px;
  position: relative;

  &::before {
    background: ${PREVIEW_COLORS.borderStrong};
    content: '';
    inset: 0 8px 0 0;
    opacity: ${({ $isLastChild }) => ($isLastChild ? 0 : 1)};
    position: absolute;
  }

  &::after {
    border-bottom: 1px solid ${PREVIEW_COLORS.borderStrong};
    border-left: 1px solid ${PREVIEW_COLORS.borderStrong};
    border-radius: 0 0 0 4px;
    content: '';
    inset: 0 0 12px 0;
    position: absolute;
  }
`;

const RowMain = styled.div<{ $withBranch?: boolean }>`
  align-items: center;
  column-gap: 8px;
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  padding-left: ${({ $withBranch }) => ($withBranch ? '4px' : '0')};
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
  depth = 0,
  isLastChild = false,
  item,
  onSelect,
}: {
  active?: boolean;
  depth?: number;
  isLastChild?: boolean;
  item: SidebarItemDef;
  onSelect?: (itemId: string) => void;
}) {
  const handleClick = () => {
    if (item.href) {
      window.open(item.href, '_blank', 'noreferrer');
      return;
    }
    onSelect?.(item.id);
  };
  return (
    <ItemRow
      $active={active}
      $depth={depth}
      data-nav-item=""
      onClick={handleClick}
      type="button"
    >
      {depth > 0 ? <BranchCell $isLastChild={isLastChild} /> : null}
      <RowMain $withBranch={depth > 0}>
        {renderPreviewIcon(item.icon)}
        <ItemText>
          <ItemLabel $active={active}>{item.label}</ItemLabel>
          {item.meta ? <ItemMeta>· {item.meta}</ItemMeta> : null}
        </ItemText>
      </RowMain>
    </ItemRow>
  );
}
