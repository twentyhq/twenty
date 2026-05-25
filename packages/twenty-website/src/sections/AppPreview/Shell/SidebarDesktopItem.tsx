'use client';

import { styled } from '@linaria/react';

import type { SidebarItemDef } from '../types';
import { renderPreviewIcon } from '../Shared/components/PreviewIcon';
import { APP_FONT, COLORS } from '../Shared/utils/app-preview-theme';
import { getSidebarIconToneRgb } from '../Shared/utils/get-sidebar-icon-tone-rgb';

const SIDEBAR_ACTIVE_BACKGROUND = 'rgba(0, 0, 0, 0.04)';

const DesktopItemButton = styled.button<{
  $active?: boolean;
  $depth?: number;
  $highlightRgb?: string;
  $highlighted?: boolean;
}>`
  --highlight-rgb: ${({ $highlightRgb }) => $highlightRgb ?? '237, 95, 0'};
  align-items: center;
  animation: ${({ $highlighted }) =>
    $highlighted
      ? 'sidebarDesktopItemAppear 1800ms cubic-bezier(0.34, 1.56, 0.64, 1) both'
      : 'none'};
  appearance: none;
  background: ${({ $active }) =>
    $active ? SIDEBAR_ACTIVE_BACKGROUND : 'transparent'};
  border: 0;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  height: 28px;
  justify-content: flex-start;
  padding-bottom: 0;
  padding-left: ${({ $depth = 0 }) => `${$depth === 0 ? 4 : 11}px`};
  padding-right: 2px;
  padding-top: 0;
  position: relative;
  text-align: left;
  transition: background-color 0.14s ease;
  width: 100%;

  &:hover {
    background: ${SIDEBAR_ACTIVE_BACKGROUND};
  }

  @keyframes sidebarDesktopItemAppear {
    0% {
      background: rgba(var(--highlight-rgb, 237, 95, 0), 0);
      box-shadow:
        0 0 0 0 rgba(var(--highlight-rgb, 237, 95, 0), 0),
        0 0 0 0 rgba(var(--highlight-rgb, 237, 95, 0), 0);
      opacity: 0;
      transform: translateX(-32px) translateY(-6px) scale(0.6);
    }
    16% {
      background: rgba(var(--highlight-rgb, 237, 95, 0), 0.55);
      box-shadow:
        0 0 0 6px rgba(var(--highlight-rgb, 237, 95, 0), 0.4),
        0 12px 28px -6px rgba(var(--highlight-rgb, 237, 95, 0), 0.55);
      opacity: 1;
      transform: translateX(0) translateY(0) scale(1.18);
    }
    32% {
      background: rgba(var(--highlight-rgb, 237, 95, 0), 0.42);
      box-shadow:
        0 0 0 12px rgba(var(--highlight-rgb, 237, 95, 0), 0.24),
        0 10px 22px -6px rgba(var(--highlight-rgb, 237, 95, 0), 0.38);
      transform: translateX(0) scale(0.97);
    }
    50% {
      background: rgba(var(--highlight-rgb, 237, 95, 0), 0.28);
      box-shadow:
        0 0 0 18px rgba(var(--highlight-rgb, 237, 95, 0), 0.12),
        0 6px 16px -6px rgba(var(--highlight-rgb, 237, 95, 0), 0.22);
      transform: translateX(0) scale(1.02);
    }
    72% {
      background: rgba(var(--highlight-rgb, 237, 95, 0), 0.16);
      box-shadow:
        0 0 0 22px rgba(var(--highlight-rgb, 237, 95, 0), 0),
        0 0 0 0 rgba(var(--highlight-rgb, 237, 95, 0), 0);
      transform: translateX(0) scale(1);
    }
    100% {
      background: ${SIDEBAR_ACTIVE_BACKGROUND};
      box-shadow:
        0 0 0 0 rgba(var(--highlight-rgb, 237, 95, 0), 0),
        0 0 0 0 rgba(var(--highlight-rgb, 237, 95, 0), 0);
      transform: translateX(0) scale(1);
    }
  }
`;

const DesktopItemLink = styled.a<{ $active?: boolean; $depth?: number }>`
  align-items: center;
  background: ${({ $active }) =>
    $active ? SIDEBAR_ACTIVE_BACKGROUND : 'transparent'};
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  height: 28px;
  justify-content: flex-start;
  padding-bottom: 0;
  padding-left: ${({ $depth = 0 }) => `${$depth === 0 ? 4 : 11}px`};
  padding-right: 2px;
  padding-top: 0;
  position: relative;
  text-decoration: none;
  transition: background-color 0.14s ease;
  width: 100%;

  &:hover {
    background: ${SIDEBAR_ACTIVE_BACKGROUND};
  }
`;

export const DesktopBranchCell = styled.div<{ $isLastChild?: boolean }>`
  align-self: stretch;
  flex: 0 0 9px;
  position: relative;

  &::before {
    background: ${COLORS.borderStrong};
    content: '';
    inset: 0 8px 0 0;
    opacity: ${({ $isLastChild }) => ($isLastChild ? 0 : 1)};
    position: absolute;
  }

  &::after {
    border-bottom: 1px solid ${COLORS.borderStrong};
    border-left: 1px solid ${COLORS.borderStrong};
    border-radius: 0 0 0 4px;
    content: '';
    inset: 0 0 12px 0;
    position: absolute;
  }
`;

const DesktopRowMain = styled.div<{ $withBranch?: boolean }>`
  align-items: center;
  column-gap: 8px;
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  padding-left: ${({ $withBranch }) => ($withBranch ? '4px' : '0')};
`;

const DesktopItemText = styled.div`
  align-items: center;
  column-gap: 2px;
  display: flex;
  min-width: 0;
`;

const DesktopItemLabel = styled.span<{ $active?: boolean }>`
  color: ${({ $active }) => ($active ? COLORS.text : COLORS.textSecondary)};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DesktopItemMeta = styled.span`
  color: ${COLORS.textLight};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type SidebarDesktopItemProps = {
  depth?: number;
  highlightedItemId?: string;
  isLastChild?: boolean;
  item: SidebarItemDef;
  onSelect?: (itemId: string) => void;
  selectedItemId?: string;
};

export function SidebarDesktopItem({
  depth = 0,
  highlightedItemId,
  isLastChild = false,
  item,
  onSelect,
  selectedItemId,
}: SidebarDesktopItemProps) {
  const showBranch = depth > 0;
  const rowActive = selectedItemId !== undefined && item.id === selectedItemId;
  const rowHighlighted = highlightedItemId === item.id;
  const highlightRgb = getSidebarIconToneRgb(item.icon);

  const rowContent = (
    <>
      {showBranch ? <DesktopBranchCell $isLastChild={isLastChild} /> : null}
      <DesktopRowMain $withBranch={showBranch}>
        {renderPreviewIcon(item.icon, rowHighlighted)}
        <DesktopItemText>
          <DesktopItemLabel $active={rowActive}>{item.label}</DesktopItemLabel>
          {item.meta ? <DesktopItemMeta>· {item.meta}</DesktopItemMeta> : null}
        </DesktopItemText>
      </DesktopRowMain>
    </>
  );

  if (item.href) {
    return (
      <DesktopItemLink
        $active={rowActive}
        $depth={depth}
        href={item.href}
        rel="noreferrer"
        target="_blank"
      >
        {rowContent}
      </DesktopItemLink>
    );
  }

  return (
    <DesktopItemButton
      $active={rowActive}
      $depth={depth}
      $highlightRgb={rowHighlighted ? highlightRgb : undefined}
      $highlighted={rowHighlighted}
      onClick={onSelect ? () => onSelect(item.id) : undefined}
      type="button"
    >
      {rowContent}
    </DesktopItemButton>
  );
}

export const DesktopBranchLine = styled.div`
  background: ${COLORS.borderStrong};
  bottom: 14px;
  left: 11px;
  position: absolute;
  top: 0;
  width: 1px;
`;

export const DesktopChildStack = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 2px;
  position: relative;
`;
