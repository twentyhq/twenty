'use client';

import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import type { SidebarItemDef } from '../types';
import { renderPreviewIcon } from '../Shared/components/PreviewIcon';
import { getSidebarIconToneRgb } from '../Shared/utils/get-sidebar-icon-tone-rgb';

const SIDEBAR_ACTIVE_BACKGROUND = 'rgba(0, 0, 0, 0.04)';

const railItemSharedStyles = css`
  align-items: center;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
  padding-bottom: 0;
  padding-right: 0;
  padding-top: 0;
  transition: background-color 0.14s ease;
  width: 100%;

  &:hover {
    background: ${SIDEBAR_ACTIVE_BACKGROUND};
  }
`;

const RailItemButton = styled.button<{
  $active?: boolean;
  $child?: boolean;
  $highlightRgb?: string;
  $highlighted?: boolean;
}>`
  --highlight-rgb: ${({ $highlightRgb }) => $highlightRgb ?? '237, 95, 0'};
  animation: ${({ $highlighted }) =>
    $highlighted
      ? 'sidebarRailItemAppear 1800ms cubic-bezier(0.34, 1.56, 0.64, 1) both'
      : 'none'};
  appearance: none;
  background: ${({ $active }) =>
    $active ? SIDEBAR_ACTIVE_BACKGROUND : 'transparent'};
  border: 0;
  height: ${({ $child }) => ($child ? '32px' : '36px')};
  padding-left: ${({ $child }) => ($child ? '8px' : '0')};

  @keyframes sidebarRailItemAppear {
    0% {
      background: rgba(var(--highlight-rgb, 237, 95, 0), 0);
      box-shadow:
        0 0 0 0 rgba(var(--highlight-rgb, 237, 95, 0), 0),
        0 0 0 0 rgba(var(--highlight-rgb, 237, 95, 0), 0);
      opacity: 0;
      transform: translateY(8px) scale(0.72);
    }
    16% {
      background: rgba(var(--highlight-rgb, 237, 95, 0), 0.55);
      box-shadow:
        0 0 0 6px rgba(var(--highlight-rgb, 237, 95, 0), 0.4),
        0 12px 28px -6px rgba(var(--highlight-rgb, 237, 95, 0), 0.55);
      opacity: 1;
      transform: translateY(0) scale(1.14);
    }
    100% {
      background: ${SIDEBAR_ACTIVE_BACKGROUND};
      box-shadow:
        0 0 0 0 rgba(var(--highlight-rgb, 237, 95, 0), 0),
        0 0 0 0 rgba(var(--highlight-rgb, 237, 95, 0), 0);
      transform: translateY(0) scale(1);
    }
  }
`;

const RailItemLink = styled.a<{ $active?: boolean; $child?: boolean }>`
  background: ${({ $active }) =>
    $active ? SIDEBAR_ACTIVE_BACKGROUND : 'transparent'};
  height: ${({ $child }) => ($child ? '32px' : '36px')};
  padding-left: ${({ $child }) => ($child ? '8px' : '0')};
  text-decoration: none;
`;

type SidebarRailDisplayItem = Pick<
  SidebarItemDef,
  'href' | 'icon' | 'id' | 'label'
>;

type SidebarRailItemProps = {
  active?: boolean;
  child?: boolean;
  highlighted?: boolean;
  item: SidebarRailDisplayItem;
  onSelect?: (itemId: string) => void;
};

export function SidebarRailItem({
  active = false,
  child = false,
  highlighted = false,
  item,
  onSelect,
}: SidebarRailItemProps) {
  const highlightRgb = getSidebarIconToneRgb(item.icon);
  const icon = renderPreviewIcon(item.icon, highlighted);

  if (item.href) {
    return (
      <RailItemLink
        $active={active}
        $child={child}
        aria-label={item.label}
        className={railItemSharedStyles}
        data-rail-item-id={item.id}
        href={item.href}
        rel="noreferrer"
        target="_blank"
        title={item.label}
      >
        {icon}
      </RailItemLink>
    );
  }

  return (
    <RailItemButton
      $active={active}
      $child={child}
      $highlightRgb={highlighted ? highlightRgb : undefined}
      $highlighted={highlighted}
      aria-label={item.label}
      className={railItemSharedStyles}
      data-rail-item-id={item.id}
      onClick={onSelect ? () => onSelect(item.id) : undefined}
      title={item.label}
      type="button"
    >
      {icon}
    </RailItemButton>
  );
}
