'use client';

import dynamic from 'next/dynamic';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import {
  IconBook,
  IconBrandLinkedin,
  IconBuildingFactory2,
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconCheck,
  IconCheckbox,
  IconChevronDown,
  IconCopy,
  IconCreativeCommonsSa,
  IconDotsVertical,
  IconFolder,
  IconHome2,
  IconLayoutDashboard,
  IconLayoutKanban,
  IconLayoutSidebarLeftCollapse,
  IconLink,
  IconList,
  IconMap2,
  IconMessageCircle,
  IconMessageCirclePlus,
  IconMoneybag,
  IconNotes,
  IconPencil,
  IconChevronUp,
  IconHeart,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlus,
  IconRepeat,
  IconSearch,
  IconSettings,
  IconSettingsAutomation,
  IconTarget,
  IconTargetArrow,
  IconUser,
  IconUserCircle,
  IconUsers,
  IconVersions,
  IconX,
} from '@tabler/icons-react';
import {
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import type {
  HeroDashboardPageDefinition,
  HeroCellEntity,
  HeroKanbanPageDefinition,
  HeroCellPerson,
  HeroCellRelation,
  HeroCellText,
  HeroCellValue,
  HeroNavbarActionType,
  HeroPageDefinition,
  HeroPageType,
  HeroSidebarEntry,
  HeroSidebarFolder,
  HeroSidebarIcon,
  HeroSidebarItem,
  HeroTablePageDefinition,
  HeroWorkflowPageDefinition,
  HeroVisualType,
} from '../../types/HeroHomeData';
import { Chip, ChipVariant } from './homeVisualChip';
import { VISUAL_TOKENS } from './homeVisualTokens';
import { normalizeHeroPage, type HeroPageDefaults } from './normalizeHeroPage';
import { KanbanPage } from './KanbanPage';
import { PagePreviewLoader } from './PagePreviewLoader';
import { TablePage } from './TablePage';

const APP_FONT = VISUAL_TOKENS.font.family;
const DEFAULT_TABLE_WIDTH = 1700;
const APPLE_WORKSPACE_LOGO_SRC = '/images/home/hero/apple-rainbow-logo.svg';
const TABLE_CELL_HORIZONTAL_PADDING = 8;
const HOVER_ACTION_EDGE_INSET = 4;

const COLORS = {
  accent: VISUAL_TOKENS.accent.accent9,
  accentBorder: VISUAL_TOKENS.border.color.blue,
  accentSurface: VISUAL_TOKENS.accent.primary,
  accentSurfaceSoft: VISUAL_TOKENS.background.transparent.blue,
  background: VISUAL_TOKENS.background.primary,
  backgroundSecondary: VISUAL_TOKENS.background.secondary,
  border: VISUAL_TOKENS.border.color.medium,
  borderLight: VISUAL_TOKENS.border.color.light,
  borderStrong: VISUAL_TOKENS.border.color.strong,
  shadow: '0 14px 34px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)',
  text: VISUAL_TOKENS.font.color.primary,
  textSecondary: VISUAL_TOKENS.font.color.secondary,
  textTertiary: VISUAL_TOKENS.font.color.tertiary,
  textLight: VISUAL_TOKENS.font.color.light,
};

const SIDEBAR_TONES: Record<
  string,
  { background: string; border: string; color: string }
> = {
  amber: { background: '#FEF2A4', border: '#FEF2A4', color: '#35290F' },
  blue: { background: '#d9e2fc', border: '#c6d4f9', color: '#3A5CCC' },
  gray: { background: '#ebebeb', border: '#d6d6d6', color: '#838383' },
  green: { background: '#ccebd7', border: '#bbe4c9', color: '#153226' },
  orange: { background: '#ffdcc3', border: '#ffcca7', color: '#ED5F00' },
  pink: { background: '#ffe1e7', border: '#ffc8d6', color: '#a51853' },
  purple: { background: '#e0e7ff', border: '#c7d2fe', color: '#4f46e5' },
  teal: { background: '#c7ebe5', border: '#afdfd7', color: '#0E9888' },
  violet: { background: '#ebe5ff', border: '#d8cbff', color: '#5b3fd1' },
  red: { background: '#fdd8d8', border: '#f9c6c6', color: '#DC3D43' },
};

const PERSON_TONES: Record<string, { background: string; color: string }> = {
  amber: { background: '#f6e6d7', color: '#7a4f2a' },
  blue: { background: '#dbeafe', color: '#1d4ed8' },
  gray: { background: '#e5e7eb', color: '#4b5563' },
  green: { background: '#dcfce7', color: '#15803d' },
  pink: { background: '#ffe4e6', color: '#be123c' },
  purple: { background: '#ede9fe', color: '#6d28d9' },
  red: { background: '#fee2e2', color: '#b91c1c' },
  teal: { background: '#ccfbf1', color: '#0f766e' },
};

const TABLER_STROKE = 1.6;
const NAVIGATION_TABLER_STROKE = 2;
const ROW_HOVER_ACTION_DISABLED_COLUMNS = new Set([
  'createdBy',
  'accountOwner',
]);

const NAVBAR_ACTION_ICON_MAP: Record<string, typeof IconPlus> = {
  chevronDown: IconChevronDown,
  chevronUp: IconChevronUp,
  dotsVertical: IconDotsVertical,
  heart: IconHeart,
  playerPause: IconPlayerPause,
  plus: IconPlus,
  repeat: IconRepeat,
};

const SalesDashboardPage = dynamic(
  () =>
    import('./SalesDashboardPage').then((mod) => ({
      default: mod.SalesDashboardPage,
    })),
  {
    loading: () => (
      <PagePreviewLoader ariaLabel="Loading sales dashboard preview" />
    ),
    ssr: false,
  },
);

const WorkflowPage = dynamic(
  () =>
    import('./WorkflowPage').then((mod) => ({
      default: mod.WorkflowPage,
    })),
  {
    loading: () => <PagePreviewLoader ariaLabel="Loading workflow preview" />,
    ssr: false,
  },
);

const PAGE_RENDERERS = {
  table: (page: HeroTablePageDefinition) => <TablePage page={page} />,
  kanban: (page: HeroKanbanPageDefinition) => <KanbanPage page={page} />,
  dashboard: (page: HeroDashboardPageDefinition) => (
    <DashboardViewport
      aria-label={`Interactive preview of the ${page.header.title.toLowerCase()}`}
    >
      <SalesDashboardPage page={page} />
    </DashboardViewport>
  ),
  workflow: (page: HeroWorkflowPageDefinition) => <WorkflowPage page={page} />,
} satisfies {
  [K in HeroPageType]: (
    page: Extract<HeroPageDefinition, { type: K }>,
  ) => ReactNode;
};

// -- Styled Components --

const StyledHomeVisual = styled.div`
  isolation: isolate;
  margin-top: ${theme.spacing(5)};
  position: relative;
  text-align: left;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-top: ${theme.spacing(11)};
  }
`;

const ShellScene = styled.div`
  margin: 0 auto;
  transform-origin: center top;
  transition: transform 0.18s ease;
  width: 100%;
`;

const Frame = styled.div`
  aspect-ratio: 1280 / 832;
  background-color: ${COLORS.background};
  background-image: ${VISUAL_TOKENS.background.noisy};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  box-shadow: ${COLORS.shadow};
  max-height: 740px;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const AppLayout = styled.div`
  display: flex;
  height: 100%;
  min-height: 0;
  position: relative;
  z-index: 1;
`;

const SidebarPanel = styled.aside`
  background: transparent;
  display: grid;
  flex: 0 0 72px;
  gap: 12px;
  grid-template-rows: auto auto minmax(0, 1fr);
  min-height: 0;
  padding: 12px 8px;
  width: 72px;

  @media (min-width: ${theme.breakpoints.md}px) {
    flex-basis: 220px;
    width: 220px;
  }
`;

const SidebarTopBar = styled.div`
  align-items: center;
  display: grid;
  gap: 8px;
  grid-template-columns: minmax(0, 1fr) auto;
  min-height: 32px;
`;

const WorkspaceMenu = styled.div`
  align-items: center;
  display: grid;
  gap: 8px;
  grid-template-columns: auto 1fr auto;
  min-width: 0;
  padding: 6px 4px;
`;

const WorkspaceIcon = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  height: 16px;
  justify-content: center;
  width: 14px;
`;

const WorkspaceIconImage = styled.img`
  display: block;
  height: 100%;
  width: 100%;
`;

const WorkspaceLabel = styled.span`
  color: ${COLORS.text};
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

const SidebarTopActions = styled.div`
  align-items: center;
  display: grid;
  gap: 2px;
  grid-auto-flow: column;
`;

const SidebarIconButton = styled.div`
  align-items: center;
  border-radius: 4px;
  display: flex;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

const SidebarControls = styled.div`
  align-items: center;
  display: grid;
  gap: 8px;
  grid-template-columns: auto 1fr;
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: flex;
    gap: 12px;
    justify-content: space-between;
  }
`;

const SegmentedRail = styled.div`
  background: #fcfcfccc;
  border: 1px solid ${COLORS.border};
  border-radius: 40px;
  display: grid;
  gap: 2px;
  grid-auto-flow: column;
  padding: 3px;
`;

const Segment = styled.div<{ $selected?: boolean }>`
  align-items: center;
  background: ${({ $selected }) => ($selected ? '#0000000a' : 'transparent')};
  border-radius: 16px;
  display: flex;
  height: 22px;
  justify-content: center;
  width: 22px;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding: 0 8px;
    width: 32px;
  }
`;

const NewChat = styled.div`
  align-items: center;
  background: ${COLORS.backgroundSecondary};
  border: 1px solid ${COLORS.border};
  border-radius: 40px;
  color: ${COLORS.textSecondary};
  display: flex;
  gap: 4px;
  height: 28px;
  justify-content: center;
  min-width: 0;
  padding: 3px;
  width: 28px;

  @media (min-width: ${theme.breakpoints.md}px) {
    width: 103px;
  }
`;

const NewChatLabel = styled.span`
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

const SidebarScroll = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 0;
  overflow: hidden;
`;

const SidebarSection = styled.div`
  display: grid;
  gap: 2px;
  padding-bottom: 8px;
`;

const SidebarSectionLabel = styled.span<{ $workspace?: boolean }>`
  color: ${COLORS.textLight};
  display: none;
  font-family: ${APP_FONT};
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  padding: ${({ $workspace }) => ($workspace ? '4px 4px 8px' : '0 4px 4px')};

  @media (min-width: ${theme.breakpoints.md}px) {
    display: block;
  }
`;

const SidebarItemRow = styled.div<{
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
  grid-template-columns: ${({ $withBranch }) =>
    $withBranch ? '9px minmax(0, 1fr) auto' : 'minmax(0, 1fr) auto'};
  height: 28px;
  padding: 0 2px 0 ${({ $depth = 0 }) => `${$depth === 0 ? 4 : 11}px`};
  position: relative;
  text-decoration: none;
  transition: background-color 0.14s ease;

  &:hover {
    background: ${({ $active, $interactive }) =>
      $active || $interactive
        ? VISUAL_TOKENS.background.transparent.medium
        : 'transparent'};
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
  grid-template-columns: ${({ $withBranch }) =>
    $withBranch ? '9px minmax(0, 1fr) auto' : 'minmax(0, 1fr) auto'};
  height: 28px;
  padding: 0 2px 0 ${({ $depth = 0 }) => `${$depth === 0 ? 4 : 11}px`};
  position: relative;
  text-decoration: none;
  transition: background-color 0.14s ease;

  &:hover {
    background: ${({ $active, $interactive }) =>
      $active || $interactive
        ? VISUAL_TOKENS.background.transparent.medium
        : 'transparent'};
  }
`;

const SidebarIconSurface = styled.div<{
  $background: string;
  $border: string;
  $color: string;
}>`
  align-items: center;
  background: ${({ $background }) => $background};
  border: 1px solid ${({ $border }) => $border};
  border-radius: 4px;
  color: ${({ $color }) => $color};
  display: flex;
  flex: 0 0 auto;
  height: 16px;
  justify-content: center;
  position: relative;
  width: 16px;
`;

const SidebarItemText = styled.div`
  align-items: center;
  display: flex;
  gap: 2px;
  min-width: 0;
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

const SidebarAvatar = styled.div<{
  $background: string;
  $color: string;
  $shape?: 'circle' | 'square';
}>`
  align-items: center;
  background: ${({ $background }) => $background};
  border-radius: ${({ $shape }) => ($shape === 'square' ? '4px' : '999px')};
  color: ${({ $color }) => $color};
  display: flex;
  flex: 0 0 auto;
  font-family: ${APP_FONT};
  font-size: 10px;
  font-weight: ${theme.font.weight.medium};
  height: 16px;
  justify-content: center;
  line-height: 1;
  width: 16px;
`;

const RightPane = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  min-width: 0;
  padding: 12px 8px 12px 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-right: 12px;
  }
`;

const NavbarBar = styled.div`
  align-items: center;
  background: transparent;
  display: flex;
  flex: 0 0 32px;
  height: 32px;
  justify-content: space-between;
  min-width: 0;
`;

const Breadcrumb = styled.div`
  align-items: center;
  display: flex;
  gap: 2px;
  min-width: 0;
`;

const BreadcrumbTag = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  height: 20px;
  min-width: 0;
  padding: 0 2px;
`;

const CrumbLabel = styled.span`
  color: ${COLORS.text};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.medium};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const NavbarActions = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  pointer-events: none;
`;

const DesktopOnlyNavbarAction = styled.div`
  display: none;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: block;
  }
`;

const NAVBAR_ACTION_BORDER = 'rgba(0, 0, 0, 0.08)';

const NavbarActionButton = styled.div<{ $iconOnly?: boolean }>`
  align-items: center;
  background: transparent;
  border: 1px solid ${NAVBAR_ACTION_BORDER};
  border-radius: ${VISUAL_TOKENS.border.radius.sm};
  display: inline-flex;
  font-family: ${APP_FONT};
  font-size: ${VISUAL_TOKENS.font.size.md};
  font-weight: ${VISUAL_TOKENS.font.weight.medium};
  gap: ${VISUAL_TOKENS.spacing[1]};
  height: 24px;
  justify-content: center;
  min-width: ${({ $iconOnly }) => ($iconOnly ? '24px' : 'auto')};
  padding: ${({ $iconOnly }) =>
    $iconOnly ? '0' : `0 ${VISUAL_TOKENS.spacing[2]}`};
  white-space: nowrap;
`;

const NavbarActionIconWrap = styled.span<{ $color?: string }>`
  align-items: center;
  color: ${({ $color }) => $color ?? VISUAL_TOKENS.font.color.secondary};
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
`;

const NavbarActionLabel = styled.span<{ $color?: string }>`
  color: ${({ $color }) => $color ?? VISUAL_TOKENS.font.color.secondary};
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: 1.4;
  white-space: nowrap;
`;

const NavbarActionSeparator = styled.div`
  background: ${VISUAL_TOKENS.background.transparent.medium};
  border-radius: 56px;
  height: 100%;
  width: 1px;
`;

const IndexSurface = styled.div`
  background: ${COLORS.background};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
`;

const ViewbarBar = styled.div`
  align-items: center;
  background: ${COLORS.background};
  border-bottom: 1px solid ${COLORS.borderLight};
  display: flex;
  justify-content: space-between;
  min-width: 0;
  padding: 8px 8px 8px 12px;
  width: 100%;
`;

const ViewSwitcher = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  gap: 4px;
  height: 24px;
  min-width: 0;
  overflow: hidden;
  padding: 0 4px;
`;

const ViewName = styled.span`
  color: ${COLORS.textSecondary};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.medium};
  line-height: 1.4;
  white-space: nowrap;
`;

const ViewCount = styled.span`
  color: ${COLORS.textLight};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.medium};
  line-height: 1.4;
  white-space: nowrap;
`;

const TinyDot = styled.div`
  background: ${COLORS.borderStrong};
  border-radius: 999px;
  height: 2px;
  width: 2px;
`;

const ViewActions = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  gap: 2px;
  margin-left: auto;
  position: relative;
  z-index: 1;
`;

const ViewAction = styled.span`
  align-items: center;
  border-radius: 4px;
  color: ${COLORS.textSecondary};
  display: flex;
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.regular};
  height: 24px;
  line-height: 1.4;
  padding: 4px 8px;
  white-space: nowrap;
`;

const TableShell = styled.div`
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  width: 100%;
`;

const DashboardViewport = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  overflow: auto;
  scrollbar-width: none;
  width: 100%;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const GripRail = styled.div`
  background: ${COLORS.background};
  display: grid;
  flex: 0 0 12px;
  grid-auto-rows: 32px;
  width: 12px;
`;

const GripCell = styled.div`
  background: ${COLORS.background};
  border-bottom: 1px solid ${COLORS.borderLight};
`;

const TableViewport = styled.div<{ $dragging: boolean }>`
  cursor: ${({ $dragging }) => ($dragging ? 'grabbing' : 'grab')};
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
  width: 100%;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TableCanvas = styled.div<{ $width: number }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100%;
  min-width: ${({ $width }) => `${$width}px`};
  width: ${({ $width }) => `${$width}px`};
`;

const HeaderRow = styled.div`
  display: flex;
`;

const DataRow = styled.div`
  display: flex;
`;

const FooterRow = styled.div`
  display: flex;
`;

const TableCell = styled.div<{
  $align?: 'left' | 'right';
  $header?: boolean;
  $hovered?: boolean;
  $sticky?: boolean;
  $width: number;
}>`
  align-items: center;
  background: ${({ $header, $hovered }) => {
    if ($header) {
      return COLORS.background;
    }

    return $hovered ? COLORS.backgroundSecondary : COLORS.background;
  }};
  border-bottom: 1px solid ${COLORS.borderLight};
  border-right: 1px solid ${COLORS.borderLight};
  box-sizing: border-box;
  display: flex;
  flex: 0 0 ${({ $width }) => `${$width}px`};
  height: 32px;
  justify-content: ${({ $align }) =>
    $align === 'right' ? 'flex-end' : 'flex-start'};
  left: ${({ $sticky }) => ($sticky ? '0' : 'auto')};
  min-width: ${({ $width }) => `${$width}px`};
  padding: 0 ${TABLE_CELL_HORIZONTAL_PADDING}px;
  position: ${({ $sticky }) => ($sticky ? 'sticky' : 'relative')};
  z-index: ${({ $header, $sticky }) => {
    if ($sticky && $header) {
      return 6;
    }

    if ($sticky) {
      return 4;
    }

    return 1;
  }};
`;

const EmptyFillCell = styled.div<{
  $footer?: boolean;
  $header?: boolean;
  $hovered?: boolean;
  $width: number;
}>`
  background: ${({ $header, $hovered, $footer }) => {
    if ($header || $footer) {
      return COLORS.background;
    }

    return $hovered ? COLORS.backgroundSecondary : COLORS.background;
  }};
  border-bottom: 1px solid ${COLORS.borderLight};
  flex: 0 0 ${({ $width }) => `${$width}px`};
  min-width: ${({ $width }) => `${$width}px`};
`;

const HeaderCellContent = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

const HeaderLabel = styled.span`
  color: ${COLORS.textTertiary};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.medium};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EdgePlus = styled.div`
  margin-left: auto;
`;

const CheckboxContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 24px;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

const CheckboxBox = styled.div<{ $checked?: boolean }>`
  align-items: center;
  background: ${({ $checked }) =>
    $checked ? COLORS.accentSurfaceSoft : 'transparent'};
  border: 1px solid
    ${({ $checked }) => ($checked ? COLORS.accentBorder : COLORS.borderStrong)};
  border-radius: 3px;
  display: flex;
  flex: 0 0 auto;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

const EntityCellLayout = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  height: 100%;
  min-width: 0;
  position: relative;
  width: 100%;
`;

const CellHoverAnchor = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  min-width: 0;
  position: relative;
  width: 100%;
`;

const CellChip = styled(Chip)`
  max-width: 100%;
  min-width: 0;
`;

const InlineText = styled.span`
  color: ${COLORS.text};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.regular};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MutedText = styled.span`
  color: ${COLORS.textTertiary};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.regular};
  line-height: 1.4;
  white-space: nowrap;
`;

const RightAlignedText = styled(InlineText)`
  text-align: right;
  width: 100%;
`;

const PersonAvatarCircle = styled.div<{
  $background: string;
  $color: string;
  $square?: boolean;
}>`
  align-items: center;
  background: ${({ $background }) => $background};
  border-radius: ${({ $square }) => ($square ? '4px' : '999px')};
  color: ${({ $color }) => $color};
  display: flex;
  flex: 0 0 auto;
  font-family: ${APP_FONT};
  font-size: 10px;
  font-weight: ${theme.font.weight.medium};
  height: 14px;
  justify-content: center;
  overflow: hidden;
  width: 14px;
`;

const AvatarImage = styled.img`
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const BooleanRow = styled.div`
  align-items: center;
  display: inline-flex;
  gap: 4px;
`;

const HoverActions = styled.div<{ $rightInset?: number; $visible: boolean }>`
  align-items: center;
  background: ${VISUAL_TOKENS.background.transparent.primary};
  border: 1px solid ${VISUAL_TOKENS.background.transparent.light};
  border-radius: 4px;
  bottom: 4px;
  box-sizing: border-box;
  box-shadow: ${VISUAL_TOKENS.boxShadow.light};
  display: flex;
  gap: 0;
  justify-content: center;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  padding: 0 4px;
  pointer-events: none;
  position: absolute;
  right: ${({
    $rightInset = HOVER_ACTION_EDGE_INSET - TABLE_CELL_HORIZONTAL_PADDING,
  }) => `${$rightInset}px`};
  top: 4px;
  transform: translateX(${({ $visible }) => ($visible ? '0' : '4px')});
  transition:
    opacity 0.14s ease,
    transform 0.14s ease;
  width: 24px;
`;

const MiniAction = styled.div`
  align-items: center;
  border-radius: 2px;
  color: ${COLORS.textSecondary};
  display: flex;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const FooterFirstContent = styled.div`
  align-items: center;
  display: inline-flex;
  gap: 4px;
  padding-left: 28px;
`;

const HeaderFillContent = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  padding: 0 8px;
`;

const TagChip = styled.div`
  align-items: center;
  background: ${VISUAL_TOKENS.background.transparent.light};
  border-radius: 4px;
  color: ${COLORS.textSecondary};
  display: inline-flex;
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.regular};
  height: 20px;
  line-height: 1.4;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 0 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MultiChipStack = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  min-width: 0;
  overflow: hidden;
  width: 100%;
`;

const FaviconImage = styled.img`
  display: block;
  height: 100%;
  object-fit: contain;
  width: 100%;
`;

// -- Icon helpers --

const TABLER_ICON_MAP: Record<string, typeof IconBuildingSkyscraper> = {
  book: IconBook,
  buildingSkyscraper: IconBuildingSkyscraper,
  checkbox: IconCheckbox,
  folder: IconFolder,
  layoutDashboard: IconLayoutDashboard,
  notes: IconNotes,
  playerPlay: IconPlayerPlay,
  settings: IconSettings,
  settingsAutomation: IconSettingsAutomation,
  targetArrow: IconTargetArrow,
  user: IconUser,
  versions: IconVersions,
};

const HEADER_ICON_MAP: Record<string, typeof IconBuildingSkyscraper> = {
  added: IconCalendarEvent,
  accountOwner: IconUserCircle,
  address: IconMap2,
  arr: IconMoneybag,
  createdBy: IconCreativeCommonsSa,
  employees: IconUsers,
  icp: IconTarget,
  industry: IconBuildingFactory2,
  linkedin: IconBrandLinkedin,
  mainContact: IconUser,
  opportunities: IconTargetArrow,
  url: IconLink,
};

// -- Utility functions --

const failedAvatarUrls = new Set<string>();
const failedFaviconUrls = new Set<string>();

function getInitials(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function sanitizeURL(link: string | null | undefined) {
  return link
    ? link.replace(/(https?:\/\/)|(www\.)/g, '').replace(/\/$/, '')
    : '';
}

function getLogoUrlFromDomainName(domainName?: string): string | undefined {
  const sanitizedDomain = sanitizeURL(domainName);

  return sanitizedDomain
    ? `https://twenty-icons.com/${sanitizedDomain}`
    : undefined;
}

function isFolder(entry: HeroSidebarEntry): entry is HeroSidebarFolder {
  return 'items' in entry;
}

function hasRenderablePage(
  item: HeroSidebarItem,
  pageDefaults: HeroPageDefaults,
): boolean {
  return normalizeHeroPage(item, pageDefaults) !== null;
}

function findActiveItem(
  entries: HeroSidebarEntry[],
  activeLabel: string,
  pageDefaults: HeroPageDefaults,
): HeroSidebarItem | undefined {
  for (const entry of entries) {
    if (isFolder(entry)) {
      for (const child of entry.items) {
        if (child.label === activeLabel) {
          return child;
        }
      }

      continue;
    }

    if (entry.children) {
      for (const child of entry.children) {
        if (child.label === activeLabel) {
          return child;
        }
      }
    }

    if (entry.label === activeLabel) {
      if (
        !hasRenderablePage(entry, pageDefaults) &&
        entry.children &&
        entry.children.length > 0
      ) {
        const firstChildWithRenderablePage = entry.children.find((child) =>
          hasRenderablePage(child, pageDefaults),
        );

        if (firstChildWithRenderablePage) {
          return firstChildWithRenderablePage;
        }
      }

      return entry;
    }
  }

  return undefined;
}

function findContainingFolderId(
  entries: HeroSidebarEntry[],
  label: string,
): string | undefined {
  for (const entry of entries) {
    if (!isFolder(entry)) {
      continue;
    }

    if (
      entry.items.some(
        (item) =>
          item.label === label ||
          item.children?.some((child) => child.label === label) === true,
      )
    ) {
      return entry.id;
    }
  }

  return undefined;
}

function renderPageDefinition(
  page: HeroPageDefinition,
  onNavigateToLabel?: (label: string) => void,
) {
  switch (page.type) {
    case 'table':
      return <TablePage page={page} onNavigateToLabel={onNavigateToLabel} />;
    case 'kanban':
      return PAGE_RENDERERS.kanban(page);
    case 'dashboard':
      return PAGE_RENDERERS.dashboard(page);
    case 'workflow':
      return PAGE_RENDERERS.workflow(page);
  }
}

function getNavbarActionToneColor(
  tone: HeroNavbarActionType['labelTone'],
): string {
  if (tone === 'primary') {
    return VISUAL_TOKENS.font.color.primary;
  }

  if (tone === 'tertiary') {
    return VISUAL_TOKENS.font.color.light;
  }

  return VISUAL_TOKENS.font.color.secondary;
}

function renderNavbarAction(
  action: HeroNavbarActionType,
  index: number,
): ReactNode {
  const ActionIcon = NAVBAR_ACTION_ICON_MAP[action.icon];
  const isIconOnly =
    action.variant === 'icon' || (!action.label && !action.trailingLabel);
  const labelColor = getNavbarActionToneColor(action.labelTone);

  const button = (
    <NavbarActionButton
      key={`${action.icon}-${index}-${action.label ?? action.trailingLabel ?? ''}`}
      $iconOnly={isIconOnly}
    >
      {ActionIcon ? (
        <NavbarActionIconWrap>
          <ActionIcon
            aria-hidden
            size={VISUAL_TOKENS.icon.size.sm}
            stroke={VISUAL_TOKENS.icon.stroke.sm}
          />
        </NavbarActionIconWrap>
      ) : null}
      {action.label ? (
        <NavbarActionLabel $color={labelColor}>
          {action.label}
        </NavbarActionLabel>
      ) : null}
      {action.trailingLabel ? (
        <>
          <NavbarActionSeparator />
          <NavbarActionLabel $color={VISUAL_TOKENS.font.color.light}>
            {action.trailingLabel}
          </NavbarActionLabel>
        </>
      ) : null}
    </NavbarActionButton>
  );

  if (action.desktopOnly) {
    return (
      <DesktopOnlyNavbarAction key={`desktop-${index}`}>
        {button}
      </DesktopOnlyNavbarAction>
    );
  }

  return button;
}

// -- Small icon wrappers --

type MiniIconProps = {
  color?: string;
  size?: number;
  stroke?: number;
};

function ChevronDownMini({
  color = COLORS.textTertiary,
  size = 14,
}: MiniIconProps) {
  return (
    <IconChevronDown
      aria-hidden
      color={color}
      size={size}
      stroke={TABLER_STROKE}
    />
  );
}

function SearchMini({ color = COLORS.textTertiary, size = 16 }: MiniIconProps) {
  return (
    <IconSearch aria-hidden color={color} size={size} stroke={TABLER_STROKE} />
  );
}

function CollapseSidebarMini({
  color = COLORS.textTertiary,
  size = 16,
}: MiniIconProps) {
  return (
    <IconLayoutSidebarLeftCollapse
      aria-hidden
      color={color}
      size={size}
      stroke={TABLER_STROKE}
    />
  );
}

function HomeMini({ color = COLORS.textSecondary, size = 16 }: MiniIconProps) {
  return (
    <IconHome2 aria-hidden color={color} size={size} stroke={TABLER_STROKE} />
  );
}

function CommentMini({
  color = COLORS.textTertiary,
  size = 16,
}: MiniIconProps) {
  return (
    <IconMessageCircle
      aria-hidden
      color={color}
      size={size}
      stroke={TABLER_STROKE}
    />
  );
}

function MessageCirclePlusMini({
  color = COLORS.textSecondary,
  size = 16,
}: MiniIconProps) {
  return (
    <IconMessageCirclePlus
      aria-hidden
      color={color}
      size={size}
      stroke={TABLER_STROKE}
    />
  );
}

function LinkMini({ color = COLORS.textTertiary, size = 16 }: MiniIconProps) {
  return (
    <IconLink aria-hidden color={color} size={size} stroke={TABLER_STROKE} />
  );
}

function ListMini({ color = COLORS.textSecondary, size = 16 }: MiniIconProps) {
  return (
    <IconList aria-hidden color={color} size={size} stroke={TABLER_STROKE} />
  );
}

function KanbanMini({
  color = COLORS.textSecondary,
  size = 16,
}: MiniIconProps) {
  return (
    <IconLayoutKanban
      aria-hidden
      color={color}
      size={size}
      stroke={TABLER_STROKE}
    />
  );
}

function PlusMini({ color = COLORS.textSecondary, size = 14 }: MiniIconProps) {
  return (
    <IconPlus aria-hidden color={color} size={size} stroke={TABLER_STROKE} />
  );
}

function CheckMini({ color = COLORS.text, size = 12 }: MiniIconProps) {
  return (
    <IconCheck aria-hidden color={color} size={size} stroke={TABLER_STROKE} />
  );
}

function CloseMini({ color = COLORS.text, size = 12 }: MiniIconProps) {
  return <IconX aria-hidden color={color} size={size} stroke={TABLER_STROKE} />;
}

function PencilMini({
  color = COLORS.textSecondary,
  size = 14,
}: MiniIconProps) {
  return (
    <IconPencil aria-hidden color={color} size={size} stroke={TABLER_STROKE} />
  );
}

function CopyMini({ color = COLORS.textSecondary, size = 14 }: MiniIconProps) {
  return (
    <IconCopy aria-hidden color={color} size={size} stroke={TABLER_STROKE} />
  );
}

// -- Favicon logo component --

function FaviconLogo({
  src,
  domain,
  label,
  size = 14,
}: {
  src?: string;
  domain?: string;
  label?: string;
  size?: number;
}) {
  const faviconUrl = src ?? getLogoUrlFromDomainName(domain);
  const [localFailedUrl, setLocalFailedUrl] = useState<string | null>(null);
  const showFavicon =
    faviconUrl !== undefined &&
    !failedFaviconUrls.has(faviconUrl) &&
    localFailedUrl !== faviconUrl;

  const baseStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    overflow: 'hidden',
    fontFamily: APP_FONT,
    fontSize: size <= 14 ? '8px' : '9px',
    fontWeight: 600,
    lineHeight: 1,
  } as const;

  if (showFavicon) {
    return (
      <div style={baseStyle}>
        <FaviconImage
          src={faviconUrl}
          alt={label ? `${label} logo` : ''}
          onError={() => {
            failedFaviconUrls.add(faviconUrl);
            setLocalFailedUrl(faviconUrl);
          }}
        />
      </div>
    );
  }

  const initials = label ? getInitials(label) : '?';

  return (
    <div style={{ ...baseStyle, background: '#ebebeb', color: '#666666' }}>
      {initials.slice(0, 1)}
    </div>
  );
}

// -- Sidebar icon rendering --

function PersonAvatarContent({ token }: { token: HeroCellPerson }) {
  const [localFailedUrl, setLocalFailedUrl] = useState<string | null>(null);
  const showAvatar =
    token.avatarUrl !== undefined &&
    !failedAvatarUrls.has(token.avatarUrl) &&
    localFailedUrl !== token.avatarUrl;

  if (showAvatar) {
    return (
      <AvatarImage
        alt=""
        src={token.avatarUrl}
        onError={() => {
          if (token.avatarUrl) {
            failedAvatarUrls.add(token.avatarUrl);
            setLocalFailedUrl(token.avatarUrl);
          }
        }}
      />
    );
  }

  return token.shortLabel ?? getInitials(token.name);
}

function renderSidebarIcon(icon: HeroSidebarIcon): ReactNode {
  if (icon.kind === 'brand') {
    return (
      <SidebarIconSurface
        $background="transparent"
        $border="transparent"
        $color={COLORS.textSecondary}
      >
        <FaviconLogo
          domain={
            icon.domain ??
            (icon.brand === 'claude'
              ? 'claude.ai'
              : icon.brand === 'stripe'
                ? 'stripe.com'
                : undefined)
          }
          label={icon.brand}
          size={icon.imageSrc ? 14 : 16}
          src={icon.imageSrc}
        />
        {icon.overlay === 'link' ? (
          <div
            style={{
              alignItems: 'center',
              background: '#f1f1f1',
              borderRadius: '2px',
              bottom: '-1px',
              display: 'flex',
              height: '7px',
              justifyContent: 'center',
              position: 'absolute',
              right: '-1px',
              width: '7px',
            }}
          >
            <LinkMini color="#666666" size={7} />
          </div>
        ) : null}
      </SidebarIconSurface>
    );
  }

  if (icon.kind === 'avatar') {
    const tone = SIDEBAR_TONES[icon.tone] ?? SIDEBAR_TONES.gray;

    return (
      <SidebarAvatar
        $background={tone.background}
        $color={icon.color ?? tone.color}
        $shape={icon.shape}
      >
        <span
          style={{
            fontFamily: APP_FONT,
            fontSize: '10px',
            fontWeight: 500,
          }}
        >
          {icon.label}
        </span>
      </SidebarAvatar>
    );
  }

  const tone = SIDEBAR_TONES[icon.tone] ?? SIDEBAR_TONES.gray;
  const TablerIcon = TABLER_ICON_MAP[icon.name];

  return (
    <SidebarIconSurface
      $background={tone.background}
      $border={tone.border}
      $color={tone.color}
    >
      {TablerIcon ? (
        <TablerIcon
          aria-hidden
          color={tone.color}
          size={14}
          stroke={NAVIGATION_TABLER_STROKE}
        />
      ) : null}
      {icon.overlay === 'link' ? (
        <div
          style={{
            alignItems: 'center',
            background: '#f1f1f1',
            borderRadius: '2px',
            bottom: '-1px',
            display: 'flex',
            height: '7px',
            justifyContent: 'center',
            position: 'absolute',
            right: '-1px',
            width: '7px',
          }}
        >
          <LinkMini color="#666666" size={7} />
        </div>
      ) : null}
    </SidebarIconSurface>
  );
}

// -- Sidebar item component --

function SidebarItemComponent({
  collapsible = false,
  expanded = false,
  depth = 0,
  interactive = true,
  isLastChild = false,
  item,
  onToggleExpanded,
  onSelect,
  selectedLabel,
}: {
  collapsible?: boolean;
  expanded?: boolean;
  depth?: number;
  interactive?: boolean;
  isLastChild?: boolean;
  item: HeroSidebarItem;
  onToggleExpanded?: () => void;
  onSelect?: (label: string) => void;
  selectedLabel?: string;
}) {
  const showBranch = depth > 0;
  const rowSelectable = interactive && item.href === undefined && !collapsible;
  const rowInteractive =
    rowSelectable || item.href !== undefined || (interactive && collapsible);
  const rowActive =
    rowSelectable &&
    selectedLabel !== undefined &&
    item.label === selectedLabel;
  const childItems = item.children ?? [];
  const rowContent = (
    <>
      {showBranch ? <SidebarBranchCell $isLastChild={isLastChild} /> : null}
      <SidebarRowMain $withBranch={showBranch}>
        {renderSidebarIcon(item.icon)}
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
            <SidebarItemComponent
              key={child.id}
              depth={depth + 1}
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

// -- Cell rendering components --

function PersonTokenCell({
  token,
  hovered = false,
  withCopyAction = true,
}: {
  token: HeroCellPerson;
  hovered?: boolean;
  withCopyAction?: boolean;
}) {
  const tone = PERSON_TONES[token.tone ?? 'gray'] ?? PERSON_TONES.gray;
  const square =
    token.kind === 'api' ||
    token.kind === 'system' ||
    token.kind === 'workflow';

  return (
    <CellHoverAnchor>
      <CellChip
        clickable={false}
        label={token.name}
        leftComponent={
          <PersonAvatarCircle
            $background={tone.background}
            $color={tone.color}
            $square={square}
          >
            <PersonAvatarContent token={token} />
          </PersonAvatarCircle>
        }
      />
      <HoverActions $visible={hovered}>
        {withCopyAction ? (
          <MiniAction aria-hidden="true">
            <CopyMini />
          </MiniAction>
        ) : null}
      </HoverActions>
    </CellHoverAnchor>
  );
}

function EntityCellComponent({
  cell,
  hovered,
  isFirstColumn,
}: {
  cell: HeroCellEntity;
  hovered: boolean;
  isFirstColumn: boolean;
}) {
  if (isFirstColumn) {
    return (
      <EntityCellLayout>
        <CheckboxContainer>
          <CheckboxBox />
        </CheckboxContainer>
        <CellChip
          clickable={false}
          label={cell.name}
          leftComponent={<FaviconLogo domain={cell.domain} label={cell.name} />}
          variant={ChipVariant.Highlighted}
        />
        <HoverActions $visible={hovered}>
          <MiniAction aria-hidden="true">
            <PencilMini />
          </MiniAction>
        </HoverActions>
      </EntityCellLayout>
    );
  }

  return (
    <CellChip
      clickable={false}
      label={cell.name}
      leftComponent={<FaviconLogo domain={cell.domain} label={cell.name} />}
    />
  );
}

function RelationCellComponent({
  cell,
  hovered,
}: {
  cell: HeroCellRelation;
  hovered: boolean;
}) {
  return (
    <CellHoverAnchor>
      <MultiChipStack>
        {cell.items.map((item) => {
          const tone = PERSON_TONES[item.tone ?? 'gray'] ?? PERSON_TONES.gray;

          return (
            <CellChip
              key={item.name}
              clickable={false}
              label={item.name}
              leftComponent={
                <PersonAvatarCircle
                  $background={tone.background}
                  $color={tone.color}
                >
                  {item.shortLabel ?? getInitials(item.name)}
                </PersonAvatarCircle>
              }
            />
          );
        })}
      </MultiChipStack>
      <HoverActions $visible={hovered}>
        <MiniAction aria-hidden="true">
          <CopyMini />
        </MiniAction>
      </HoverActions>
    </CellHoverAnchor>
  );
}

function TextCellComponent({
  cell,
  isFirstColumn,
}: {
  cell: HeroCellText;
  isFirstColumn: boolean;
}) {
  if (!isFirstColumn || !cell.shortLabel) {
    return <InlineText>{cell.value}</InlineText>;
  }

  const tone = PERSON_TONES[cell.tone ?? 'gray'] ?? PERSON_TONES.gray;

  return (
    <CellChip
      clickable={false}
      label={cell.value}
      leftComponent={
        <PersonAvatarCircle $background={tone.background} $color={tone.color}>
          {cell.shortLabel}
        </PersonAvatarCircle>
      }
    />
  );
}

function renderCellValue(
  cell: HeroCellValue,
  hovered: boolean,
  isFirstColumn: boolean,
  columnId: string,
): ReactNode {
  const showHoverAction = !ROW_HOVER_ACTION_DISABLED_COLUMNS.has(columnId);

  switch (cell.type) {
    case 'text':
      return <TextCellComponent cell={cell} isFirstColumn={isFirstColumn} />;
    case 'number':
      return <RightAlignedText>{cell.value}</RightAlignedText>;
    case 'link':
      return (
        <div style={{ minWidth: 0, position: 'relative', width: '100%' }}>
          <CellChip
            clickable={false}
            label={cell.value}
            variant={ChipVariant.Static}
          />
        </div>
      );
    case 'boolean':
      return (
        <BooleanRow>
          {cell.value ? <CheckMini size={11} /> : <CloseMini size={11} />}
          <InlineText>{cell.value ? 'True' : 'False'}</InlineText>
        </BooleanRow>
      );
    case 'tag':
      return <TagChip>{cell.value}</TagChip>;
    case 'person':
      return (
        <PersonTokenCell hovered={hovered && showHoverAction} token={cell} />
      );
    case 'entity':
      return (
        <EntityCellComponent
          cell={cell}
          hovered={hovered && showHoverAction}
          isFirstColumn={isFirstColumn}
        />
      );
    case 'relation':
      return (
        <RelationCellComponent
          cell={cell}
          hovered={hovered && showHoverAction}
        />
      );
  }
}

// -- Main component --

export function HomeVisual({ visual }: { visual: HeroVisualType }) {
  const shellRef = useRef<HTMLDivElement>(null);

  const defaultActiveLabel =
    visual.favoritesNav?.find((item) => item.active)?.label ??
    visual.workspaceNav.find((entry) => !isFolder(entry) && entry.active)
      ?.label ??
    visual.workspaceNav[0]?.label ??
    '';

  const [activeLabel, setActiveLabel] = useState(defaultActiveLabel);
  const [openFolderIds, setOpenFolderIds] = useState(() => {
    const activeFolderId = findContainingFolderId(
      visual.workspaceNav,
      defaultActiveLabel,
    );

    return visual.workspaceNav.flatMap((entry) => {
      if (!isFolder(entry)) {
        return [];
      }

      if (entry.defaultOpen || entry.id === activeFolderId) {
        return [entry.id];
      }

      return [];
    });
  });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const pageDefaults = useMemo(
    () => ({
      defaultActions: visual.actions ?? [],
      defaultTableWidth: visual.tableWidth ?? DEFAULT_TABLE_WIDTH,
    }),
    [visual.actions, visual.tableWidth],
  );

  const activeItem = useMemo(
    () =>
      (visual.favoritesNav
        ? findActiveItem(visual.favoritesNav, activeLabel, pageDefaults)
        : undefined) ??
      findActiveItem(visual.workspaceNav, activeLabel, pageDefaults),
    [activeLabel, pageDefaults, visual.favoritesNav, visual.workspaceNav],
  );
  const activePage = useMemo(
    () => (activeItem ? normalizeHeroPage(activeItem, pageDefaults) : null),
    [activeItem, pageDefaults],
  );
  const activeHeader = activePage?.header;
  const activeActions = activeHeader?.actions ?? [];
  const navbarActions = activeHeader?.navbarActions;
  const showPageCount = activeHeader?.count !== undefined;
  const showListIcon = activeHeader?.showListIcon ?? false;
  const showViewBar =
    activePage !== null &&
    activePage !== undefined &&
    activePage.type !== 'dashboard' &&
    activePage.type !== 'workflow';

  const handleShellPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || !shellRef.current) {
      return;
    }

    const bounds = shellRef.current.getBoundingClientRect();
    const horizontal = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const vertical = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

    setTilt({
      x: Number((-vertical * 2.2).toFixed(2)),
      y: Number((horizontal * 3.8).toFixed(2)),
    });
  };

  const resetTilt = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleSelectLabel = (label: string) => {
    setActiveLabel(label);

    const containingFolderId = findContainingFolderId(visual.workspaceNav, label);

    if (!containingFolderId) {
      return;
    }

    setOpenFolderIds((current) =>
      current.includes(containingFolderId)
        ? current
        : [...current, containingFolderId],
    );
  };

  const handleToggleFolder = (folderId: string) => {
    setOpenFolderIds((current) =>
      current.includes(folderId)
        ? current.filter((id) => id !== folderId)
        : [...current, folderId],
    );
  };

  const renderSidebarEntry = (entry: HeroSidebarEntry) => {
    if (isFolder(entry)) {
      return (
        <SidebarItemComponent
          collapsible
          expanded={openFolderIds.includes(entry.id)}
          key={entry.id}
          item={{
            id: entry.id,
            label: entry.label,
            icon: entry.icon,
            showChevron: entry.showChevron,
            children: entry.items,
          }}
          onSelect={handleSelectLabel}
          onToggleExpanded={() => handleToggleFolder(entry.id)}
          selectedLabel={activeLabel}
        />
      );
    }

    return (
      <SidebarItemComponent
        key={entry.id}
        item={entry}
        onSelect={handleSelectLabel}
        selectedLabel={activeLabel}
      />
    );
  };

  return (
    <StyledHomeVisual>
      <ShellScene
        ref={shellRef}
        onPointerLeave={resetTilt}
        onPointerMove={handleShellPointerMove}
        style={{
          transform: `perspective(1600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        <Frame>
          <AppLayout>
            <SidebarPanel>
              <SidebarTopBar>
                <WorkspaceMenu>
                  <WorkspaceIcon>
                    <WorkspaceIconImage
                      alt=""
                      aria-hidden="true"
                      src={APPLE_WORKSPACE_LOGO_SRC}
                    />
                  </WorkspaceIcon>
                  <WorkspaceLabel>{visual.workspace.name}</WorkspaceLabel>
                  <ChevronDownMini color={COLORS.textLight} size={12} />
                </WorkspaceMenu>
                <SidebarTopActions>
                  <SidebarIconButton aria-hidden="true">
                    <SearchMini />
                  </SidebarIconButton>
                  <SidebarIconButton aria-hidden="true">
                    <CollapseSidebarMini />
                  </SidebarIconButton>
                </SidebarTopActions>
              </SidebarTopBar>

              <SidebarControls>
                <SegmentedRail aria-hidden="true">
                  <Segment $selected>
                    <HomeMini />
                  </Segment>
                  <Segment>
                    <CommentMini />
                  </Segment>
                </SegmentedRail>
                <NewChat aria-hidden="true">
                  <MessageCirclePlusMini />
                  <NewChatLabel>New chat</NewChatLabel>
                </NewChat>
              </SidebarControls>

              <SidebarScroll>
                {visual.favoritesNav && visual.favoritesNav.length > 0 ? (
                  <SidebarSection>
                    <SidebarSectionLabel>Favorites</SidebarSectionLabel>
                    {visual.favoritesNav.map((item) => (
                      <SidebarItemComponent
                        key={item.id}
                        item={item}
                        onSelect={handleSelectLabel}
                        selectedLabel={activeLabel}
                      />
                    ))}
                  </SidebarSection>
                ) : null}
                <SidebarSection>
                  <SidebarSectionLabel $workspace>
                    Workspace
                  </SidebarSectionLabel>
                  {visual.workspaceNav.map(renderSidebarEntry)}
                </SidebarSection>
              </SidebarScroll>
            </SidebarPanel>

            <RightPane>
              <NavbarBar>
                <Breadcrumb>
                  <BreadcrumbTag>
                    {activeItem ? renderSidebarIcon(activeItem.icon) : null}
                    <CrumbLabel>{activeLabel}</CrumbLabel>
                  </BreadcrumbTag>
                </Breadcrumb>

                <NavbarActions aria-hidden>
                  {navbarActions ? (
                    navbarActions.map(renderNavbarAction)
                  ) : (
                    <>
                      <DesktopOnlyNavbarAction>
                        <NavbarActionButton>
                          <NavbarActionIconWrap>
                            <IconPlus
                              aria-hidden
                              size={VISUAL_TOKENS.icon.size.sm}
                              stroke={VISUAL_TOKENS.icon.stroke.sm}
                            />
                          </NavbarActionIconWrap>
                          <NavbarActionLabel>New Record</NavbarActionLabel>
                        </NavbarActionButton>
                      </DesktopOnlyNavbarAction>
                      <NavbarActionButton>
                        <NavbarActionIconWrap>
                          <IconDotsVertical
                            aria-hidden
                            size={VISUAL_TOKENS.icon.size.sm}
                            stroke={VISUAL_TOKENS.icon.stroke.sm}
                          />
                        </NavbarActionIconWrap>
                        <NavbarActionSeparator />
                        <NavbarActionLabel
                          $color={VISUAL_TOKENS.font.color.light}
                        >
                          ⌘K
                        </NavbarActionLabel>
                      </NavbarActionButton>
                    </>
                  )}
                </NavbarActions>
              </NavbarBar>

              <IndexSurface>
                {showViewBar ? (
                  <ViewbarBar>
                    <ViewSwitcher aria-hidden="true">
                      {showListIcon ? (
                        <>
                          {activePage?.type === 'kanban' ? (
                            <KanbanMini />
                          ) : (
                            <ListMini />
                          )}
                          <ViewName>
                            {activeHeader?.title ?? activeLabel}
                          </ViewName>
                          {showPageCount ? (
                            <>
                              <TinyDot />
                              <ViewCount>{activeHeader?.count}</ViewCount>
                              <ChevronDownMini color={COLORS.textLight} />
                            </>
                          ) : null}
                        </>
                      ) : (
                        <ViewName>
                          {activeHeader?.title ?? activeLabel}
                        </ViewName>
                      )}
                    </ViewSwitcher>
                    {activeActions.length > 0 ? (
                      <ViewActions>
                        {activeActions.map((action) => (
                          <ViewAction key={action}>{action}</ViewAction>
                        ))}
                      </ViewActions>
                    ) : null}
                  </ViewbarBar>
                ) : null}

                {activePage
                  ? renderPageDefinition(activePage, handleSelectLabel)
                  : null}
              </IndexSurface>
            </RightPane>
          </AppLayout>
        </Frame>
      </ShellScene>
    </StyledHomeVisual>
  );
}

function renderHeaderIcon(columnId: string): ReactNode {
  const Icon = HEADER_ICON_MAP[columnId];

  if (Icon) {
    return (
      <Icon
        aria-hidden
        color={COLORS.textTertiary}
        size={16}
        stroke={TABLER_STROKE}
      />
    );
  }

  return (
    <IconCalendarEvent
      aria-hidden
      color={COLORS.textTertiary}
      size={16}
      stroke={TABLER_STROKE}
    />
  );
}
