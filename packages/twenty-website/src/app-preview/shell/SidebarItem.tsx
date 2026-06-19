'use client';

import { styled } from '@linaria/react';

import { APP_PREVIEW_MOTION } from '@/tokens/app-preview/app-preview-motion';
import { THEME_LIGHT } from 'twenty-ui/theme';
import { previewFontSize } from '@/app-preview/preview-font-size';
import { APP_PREVIEW_CHROME } from '@/app-preview/app-preview-chrome';
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { renderPreviewIcon } from '../primitives/PreviewIcon';
import { type SidebarItemDef } from '../types';

const ItemRow = styled.button<{
  $active?: boolean;
  $depth?: number;
  $highlighted?: boolean;
  $highlightRgb?: string;
}>`
  --highlight-rgb: ${({ $highlightRgb }) => $highlightRgb ?? '237, 95, 0'};
  --highlight-rest-background: ${THEME_LIGHT.background.transparent.light};
  appearance: none;
  border: 0;
  text-align: left;
  align-items: center;
  animation: ${({ $highlighted }) =>
    $highlighted
      ? `sidebarItemAppear 1800ms ${APP_PREVIEW_MOTION.revealPulseEase} both`
      : 'none'};
  background: ${({ $active }) =>
    $active ? THEME_LIGHT.background.transparent.light : 'transparent'};
  border-radius: ${THEME_LIGHT.border.radius.sm};
  cursor: pointer;
  display: flex;
  height: ${APP_PREVIEW_CHROME.navigationItemHeightPx}px;
  justify-content: flex-start;
  padding-left: ${({ $depth = 0 }) => ($depth === 0 ? '4px' : '11px')};
  padding-right: 2px;
  position: relative;
  transition: background-color 0.14s ease;
  width: 100%;

  &:hover {
    background: ${THEME_LIGHT.background.transparent.light};
  }

  @keyframes sidebarItemAppear {
    ${APP_PREVIEW_MOTION.revealPulseFrames}
  }
`;

// Folder children carry the connector guides.
const BranchCell = styled.div<{ $isLastChild?: boolean }>`
  align-self: stretch;
  flex: 0 0 9px;
  position: relative;

  &::before {
    background: ${THEME_LIGHT.border.color.strong};
    content: '';
    inset: 0 8px 0 0;
    opacity: ${({ $isLastChild }) => ($isLastChild ? 0 : 1)};
    position: absolute;
  }

  &::after {
    border-bottom: 1px solid ${THEME_LIGHT.border.color.strong};
    border-left: 1px solid ${THEME_LIGHT.border.color.strong};
    border-radius: 0 0 0 ${THEME_LIGHT.border.radius.sm};
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
    $active
      ? THEME_LIGHT.font.color.primary
      : THEME_LIGHT.font.color.secondary};
  font-family: ${THEME_LIGHT.font.family};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ItemMeta = styled.span`
  color: ${THEME_LIGHT.font.color.light};
  font-family: ${THEME_LIGHT.font.family};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export function SidebarItem({
  active = false,
  depth = 0,
  highlighted = false,
  isLastChild = false,
  item,
  onSelect,
}: {
  active?: boolean;
  depth?: number;
  highlighted?: boolean;
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
  const highlightRgb =
    item.icon.kind === 'tabler'
      ? APP_PREVIEW_TONES.sidebarToneRgb(item.icon.tone)
      : undefined;

  return (
    <ItemRow
      $active={active}
      $depth={depth}
      $highlighted={highlighted}
      $highlightRgb={highlighted ? highlightRgb : undefined}
      data-nav-item=""
      onClick={handleClick}
      type="button"
    >
      {depth > 0 ? <BranchCell $isLastChild={isLastChild} /> : null}
      <RowMain $withBranch={depth > 0}>
        {renderPreviewIcon(item.icon, highlighted)}
        <ItemText>
          <ItemLabel $active={active}>{item.label}</ItemLabel>
          {item.meta ? <ItemMeta>· {item.meta}</ItemMeta> : null}
        </ItemText>
      </RowMain>
    </ItemRow>
  );
}
