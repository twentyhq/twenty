'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { IconChevronDown } from '@tabler/icons-react';

import type { HeroSidebarItem } from '@/sections/Hero/types';
import { getSidebarIconToneRgb } from '../Shared/utils/get-sidebar-icon-tone-rgb';
import { renderHomeVisualIcon } from '../Shared/components/HomeVisualIcon';
import {
  APP_FONT,
  COLORS,
  TABLER_STROKE,
} from '../Shared/utils/home-visual-theme';
import { VISUAL_TOKENS } from '../Shared/utils/home-visual-tokens';

const SidebarItemRow = styled.div<{
  $active?: boolean;
  $depth?: number;
  $interactive?: boolean;
  $withBranch?: boolean;
  $highlighted?: boolean;
  $highlightRgb?: string;
}>`
  --hero-highlight-rgb: ${({ $highlightRgb }) => $highlightRgb ?? '237, 95, 0'};
  align-items: center;
  background: ${({ $active }) =>
    $active ? VISUAL_TOKENS.background.transparent.medium : 'transparent'};
  border-radius: 4px;
  display: grid;
  gap: 0;
  grid-template-columns: auto;
  justify-content: center;
  height: 28px;
  padding: 0;
  position: relative;
  text-decoration: none;
  transition: background-color 0.14s ease;
  animation: ${({ $highlighted }) =>
    $highlighted
      ? 'heroObjectAppearRow 1800ms cubic-bezier(0.34, 1.56, 0.64, 1) both'
      : 'none'};
  transform-origin: left center;

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-template-columns: ${({ $withBranch }) =>
      $withBranch ? '9px minmax(0, 1fr) auto' : 'minmax(0, 1fr) auto'};
    justify-content: stretch;
    padding: 0 2px 0 ${({ $depth = 0 }) => `${$depth === 0 ? 4 : 11}px`};
  }

  &:hover {
    background: ${({ $active, $interactive }) =>
      $active || $interactive
        ? VISUAL_TOKENS.background.transparent.medium
        : 'transparent'};
  }

  @keyframes heroObjectAppearRow {
    0% {
      background: rgba(var(--hero-highlight-rgb, 237, 95, 0), 0);
      box-shadow:
        0 0 0 0 rgba(var(--hero-highlight-rgb, 237, 95, 0), 0),
        0 0 0 0 rgba(var(--hero-highlight-rgb, 237, 95, 0), 0);
      opacity: 0;
      transform: translateX(-32px) translateY(-6px) scale(0.6);
    }
    16% {
      background: rgba(var(--hero-highlight-rgb, 237, 95, 0), 0.55);
      box-shadow:
        0 0 0 6px rgba(var(--hero-highlight-rgb, 237, 95, 0), 0.4),
        0 12px 28px -6px rgba(var(--hero-highlight-rgb, 237, 95, 0), 0.55);
      opacity: 1;
      transform: translateX(0) translateY(0) scale(1.18);
    }
    32% {
      background: rgba(var(--hero-highlight-rgb, 237, 95, 0), 0.42);
      box-shadow:
        0 0 0 12px rgba(var(--hero-highlight-rgb, 237, 95, 0), 0.24),
        0 10px 22px -6px rgba(var(--hero-highlight-rgb, 237, 95, 0), 0.38);
      transform: translateX(0) scale(0.97);
    }
    50% {
      background: rgba(var(--hero-highlight-rgb, 237, 95, 0), 0.28);
      box-shadow:
        0 0 0 18px rgba(var(--hero-highlight-rgb, 237, 95, 0), 0.12),
        0 6px 16px -6px rgba(var(--hero-highlight-rgb, 237, 95, 0), 0.22);
      transform: translateX(0) scale(1.02);
    }
    72% {
      background: rgba(var(--hero-highlight-rgb, 237, 95, 0), 0.16);
      box-shadow:
        0 0 0 22px rgba(var(--hero-highlight-rgb, 237, 95, 0), 0),
        0 0 0 0 rgba(var(--hero-highlight-rgb, 237, 95, 0), 0);
      transform: translateX(0) scale(1);
    }
    100% {
      background: ${VISUAL_TOKENS.background.transparent.medium};
      box-shadow:
        0 0 0 0 rgba(var(--hero-highlight-rgb, 237, 95, 0), 0),
        0 0 0 0 rgba(var(--hero-highlight-rgb, 237, 95, 0), 0);
      transform: translateX(0) scale(1);
    }
  }
`;

const SidebarItemRowLink = styled.a<{
  $active?: boolean;
  $depth?: number;
  $interactive?: boolean;
  $withBranch?: boolean;
}>`
  align-items: center;
  background: ${({ $active }) =>
    $active ? VISUAL_TOKENS.background.transparent.medium : 'transparent'};
  border-radius: 4px;
  display: grid;
  gap: 0;
  grid-template-columns: auto;
  justify-content: center;
  height: 28px;
  padding: 0;
  position: relative;
  text-decoration: none;
  transition: background-color 0.14s ease;

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-template-columns: ${({ $withBranch }) =>
      $withBranch ? '9px minmax(0, 1fr) auto' : 'minmax(0, 1fr) auto'};
    justify-content: stretch;
    padding: 0 2px 0 ${({ $depth = 0 }) => `${$depth === 0 ? 4 : 11}px`};
  }

  &:hover {
    background: ${({ $active, $interactive }) =>
      $active || $interactive
        ? VISUAL_TOKENS.background.transparent.medium
        : 'transparent'};
  }
`;

const SidebarItemText = styled.div`
  display: none;
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: center;
    display: flex;
    gap: 2px;
  }
`;

const SidebarItemLabel = styled.span<{ $active?: boolean }>`
  color: ${({ $active }) => ($active ? COLORS.text : COLORS.textSecondary)};
  display: none;
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.medium};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: block;
  }
`;

const SidebarItemMeta = styled.span`
  color: ${COLORS.textLight};
  display: none;
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.medium};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: block;
  }
`;

const SidebarChevron = styled.div<{ $expanded?: boolean }>`
  color: ${COLORS.textTertiary};
  display: none;
  transform: rotate(${({ $expanded }) => ($expanded ? '0deg' : '-90deg')});
  transition: transform 0.16s ease;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: flex;
  }
`;

const SidebarChildStack = styled.div`
  display: grid;
  gap: 2px;
  position: relative;
`;

const BranchLine = styled.div`
  background: ${COLORS.borderStrong};
  bottom: 14px;
  left: 11px;
  position: absolute;
  top: 0;
  width: 1px;
`;

const SidebarBranchCell = styled.div<{ $isLastChild?: boolean }>`
  align-self: stretch;
  position: relative;
  width: 9px;

  &::before {
    background: ${COLORS.borderStrong};
    content: '';
    inset: 0 88.89% 0 0;
    opacity: ${({ $isLastChild }) => ($isLastChild ? 0 : 1)};
    position: absolute;
  }

  &::after {
    border-bottom: 1px solid ${COLORS.borderStrong};
    border-left: 1px solid ${COLORS.borderStrong};
    border-radius: 0 0 0 4px;
    content: '';
    inset: 0 0 45.83% 0;
    position: absolute;
  }
`;

const SidebarRowMain = styled.div<{ $withBranch?: boolean }>`
  align-items: center;
  display: flex;
  gap: 8px;
  min-width: 0;
  padding-left: ${({ $withBranch }) => ($withBranch ? '4px' : '0')};
`;

type ChevronDownMiniProps = {
  color?: string;
  size?: number;
};

function ChevronDownMini({
  color = COLORS.textTertiary,
  size = 14,
}: ChevronDownMiniProps) {
  return (
    <IconChevronDown
      aria-hidden
      color={color}
      size={size}
      stroke={TABLER_STROKE}
    />
  );
}

type HomeVisualSidebarItemProps = {
  collapsible?: boolean;
  expanded?: boolean;
  depth?: number;
  highlightedItemId?: string;
  interactive?: boolean;
  isLastChild?: boolean;
  item: HeroSidebarItem;
  onSelect?: (label: string) => void;
  onToggleExpanded?: () => void;
  selectedLabel?: string;
};

export function HomeVisualSidebarItem({
  collapsible = false,
  expanded = false,
  depth = 0,
  highlightedItemId,
  interactive = true,
  isLastChild = false,
  item,
  onSelect,
  onToggleExpanded,
  selectedLabel,
}: HomeVisualSidebarItemProps) {
  const showBranch = depth > 0;
  const rowSelectable = interactive && item.href === undefined && !collapsible;
  const rowInteractive =
    rowSelectable || item.href !== undefined || (interactive && collapsible);
  const rowActive =
    rowSelectable &&
    selectedLabel !== undefined &&
    item.label === selectedLabel;
  const rowHighlighted = highlightedItemId === item.id;
  const childItems = item.children ?? [];
  const highlightRgb = getSidebarIconToneRgb(item.icon);
  const rowContent = (
    <>
      {showBranch ? <SidebarBranchCell $isLastChild={isLastChild} /> : null}
      <SidebarRowMain $withBranch={showBranch}>
        {renderHomeVisualIcon(item.icon, rowHighlighted)}
        <SidebarItemText>
          <SidebarItemLabel $active={rowActive}>{item.label}</SidebarItemLabel>
          {item.meta ? <SidebarItemMeta>· {item.meta}</SidebarItemMeta> : null}
        </SidebarItemText>
      </SidebarRowMain>
      {item.showChevron || (item.children && item.children.length > 0) ? (
        <SidebarChevron $expanded={!collapsible || expanded}>
          <ChevronDownMini color={COLORS.textTertiary} size={12} />
        </SidebarChevron>
      ) : null}
    </>
  );

  return (
    <>
      {item.href ? (
        <SidebarItemRowLink
          $active={rowActive}
          $depth={depth}
          $interactive={rowInteractive}
          $withBranch={showBranch}
          href={item.href}
          rel="noreferrer"
          style={{ cursor: rowInteractive ? 'pointer' : 'default' }}
          target="_blank"
        >
          {rowContent}
        </SidebarItemRowLink>
      ) : (
        <SidebarItemRow
          $active={rowActive}
          $depth={depth}
          $highlightRgb={rowHighlighted ? highlightRgb : undefined}
          $highlighted={rowHighlighted}
          $interactive={rowInteractive}
          $withBranch={showBranch}
          onClick={
            collapsible
              ? onToggleExpanded
              : rowSelectable
                ? () => onSelect?.(item.label)
                : undefined
          }
          style={{ cursor: rowInteractive ? 'pointer' : 'default' }}
        >
          {rowContent}
        </SidebarItemRow>
      )}
      {childItems.length > 0 && (!collapsible || expanded) ? (
        <SidebarChildStack>
          <BranchLine />
          {childItems.map((child, index) => (
            <HomeVisualSidebarItem
              key={child.id}
              depth={depth + 1}
              highlightedItemId={highlightedItemId}
              isLastChild={index === childItems.length - 1}
              interactive={interactive}
              item={child}
              onSelect={onSelect}
              selectedLabel={selectedLabel}
            />
          ))}
        </SidebarChildStack>
      ) : null}
    </>
  );
}
