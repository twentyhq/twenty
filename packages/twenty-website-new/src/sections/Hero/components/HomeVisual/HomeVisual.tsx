'use client';

import dynamic from 'next/dynamic';
import { getSharedCompanyLogoUrlFromDomainName } from '@/lib/shared-asset-paths';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import {
  IconBarcode,
  IconBook,
  IconBox,
  IconBrandLinkedin,
  IconBuildingFactory2,
  IconBuildingSkyscraper,
  IconCalendarClock,
  IconCalendarEvent,
  IconCalendarPlus,
  IconCheck,
  IconCheckbox,
  IconChevronDown,
  IconCopy,
  IconCreativeCommonsSa,
  IconDotsVertical,
  IconFlag,
  IconFolder,
  IconHome2,
  IconLayoutDashboard,
  IconLayoutKanban,
  IconLayoutSidebarLeftCollapse,
  IconLink,
  IconList,
  IconMap2,
  IconMapPin,
  IconMessageCircle,
  IconMessageCirclePlus,
  IconMoneybag,
  IconNotes,
  IconPencil,
  IconChevronUp,
  IconHeart,
  IconPlanet,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlus,
  IconProgress,
  IconRefresh,
  IconRepeat,
  IconRocket,
  IconRuler,
  IconSearch,
  IconSettings,
  IconSettingsAutomation,
  IconTarget,
  IconTargetArrow,
  IconUser,
  IconUserCircle,
  IconUsers,
  IconVersions,
  IconWeight,
  IconX,
} from '@tabler/icons-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
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
import { DraggableAppWindow } from './DraggableAppWindow/DraggableAppWindow';
import { DraggableTerminal } from './DraggableTerminal/DraggableTerminal';
import { OBJECT_PINNED_ACTIONS } from './objectPinnedActions';
import {
  COMPANIES_ITEM_ID,
  COMPANIES_ITEM_LABEL,
  CRM_OBJECT_SEQUENCE,
} from './rocketObject';
import { WindowOrderProvider } from './WindowOrder/WindowOrderProvider';

const APP_FONT = VISUAL_TOKENS.font.family;
const DEFAULT_TABLE_WIDTH = 1700;
const APPLE_WORKSPACE_LOGO_SRC = '/images/home/hero/apple-rainbow-logo.svg';
const TABLE_CELL_HORIZONTAL_PADDING = 8;
const HOVER_ACTION_EDGE_INSET = 4;
const COMPLETED_CREATED_OBJECT_IDS = CRM_OBJECT_SEQUENCE.map(({ id }) => id);
const COMPLETED_REVEALED_OBJECT_IDS = [
  ...COMPLETED_CREATED_OBJECT_IDS,
  COMPANIES_ITEM_ID,
];
const COMPLETED_ACTIVE_OBJECT_LABEL =
  CRM_OBJECT_SEQUENCE.at(-1)?.label ?? COMPANIES_ITEM_LABEL;

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

// RGB tuples for each tone's accent color. Used by the object-appearance
// animation to tint the highlight/ring to match the newly-created object's
// sidebar icon (e.g. Rocket = violet, Launch = orange, Payload = teal).
const hexToRgbTuple = (hex: string): string => {
  const clean = hex.replace('#', '');
  const expanded =
    clean.length === 3
      ? clean
          .split('')
          .map((char) => char + char)
          .join('')
      : clean;
  const value = parseInt(expanded, 16);
  return `${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}`;
};

const SIDEBAR_TONE_RGB: Record<string, string> = Object.fromEntries(
  Object.entries(SIDEBAR_TONES).map(([tone, palette]) => [
    tone,
    hexToRgbTuple(palette.color),
  ]),
);

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
const NAVBAR_ACTION_TABLER_STROKE = 2;
const ROW_HOVER_ACTION_DISABLED_COLUMNS = new Set([
  'createdBy',
  'accountOwner',
]);

const NAVBAR_ACTION_ICON_MAP: Record<string, typeof IconPlus> = {
  box: IconBox,
  calendarClock: IconCalendarClock,
  calendarEvent: IconCalendarEvent,
  calendarPlus: IconCalendarPlus,
  chevronDown: IconChevronDown,
  chevronUp: IconChevronUp,
  dotsVertical: IconDotsVertical,
  flag: IconFlag,
  heart: IconHeart,
  playerPause: IconPlayerPause,
  plus: IconPlus,
  repeat: IconRepeat,
  rocket: IconRocket,
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
  aspect-ratio: 1 / 1;
  margin: 0 auto;
  max-height: 740px;
  position: relative;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    aspect-ratio: 1280 / 832;
  }
`;

const AppLayout = styled.div`
  display: flex;
  flex: 1 1 auto;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  min-height: 0;
  position: relative;
  width: 100%;
  z-index: 1;
`;

const SidebarPanel = styled.aside`
  background: transparent;
  display: grid;
  flex: 0 0 48px;
  gap: 8px;
  grid-template-rows: auto auto minmax(0, 1fr);
  min-height: 0;
  padding: 8px 4px;
  width: 48px;

  @media (min-width: ${theme.breakpoints.md}px) {
    flex-basis: 220px;
    gap: 12px;
    padding: 12px 8px;
    width: 220px;
  }
`;

const SidebarTopBar = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-height: 32px;

  @media (min-width: ${theme.breakpoints.md}px) {
    gap: 8px;
    grid-template-columns: minmax(0, 1fr) auto;
  }
`;

const WorkspaceMenu = styled.div`
  align-items: center;
  display: grid;
  gap: 4px;
  grid-auto-flow: column;
  grid-template-columns: auto;
  justify-content: center;
  min-width: 0;
  padding: 6px 4px;

  > svg:last-child {
    display: none;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    gap: 8px;
    grid-auto-flow: row;
    grid-template-columns: auto 1fr auto;
    justify-content: stretch;

    > svg:last-child {
      display: block;
    }
  }
`;

const WorkspaceIcon = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const WorkspaceIconImage = styled.img`
  display: block;
  height: 100%;
  object-fit: contain;
  object-position: center;
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
  display: none;
  gap: 2px;
  grid-auto-flow: column;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: grid;
  }
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
  grid-auto-flow: column;
  grid-template-columns: auto;
  justify-content: center;
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: flex;
    gap: 12px;
    grid-auto-flow: row;
    justify-content: space-between;
  }
`;

const SegmentedRail = styled.div`
  background: #fcfcfccc;
  border: 1px solid ${COLORS.border};
  border-radius: 40px;
  display: none;
  gap: 2px;
  grid-auto-flow: column;
  padding: 3px;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: grid;
  }
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
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
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
  $highlighted?: boolean;
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

const SidebarIconSurface = styled.div<{
  $background: string;
  $border: string;
  $color: string;
  $pulse?: boolean;
}>`
  align-items: center;
  animation: ${({ $pulse }) =>
    $pulse
      ? 'heroObjectAppearIcon 1400ms cubic-bezier(0.34, 1.7, 0.64, 1) both'
      : 'none'};
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

  @keyframes heroObjectAppearIcon {
    0% {
      transform: scale(0.35) rotate(-18deg);
    }
    30% {
      transform: scale(1.45) rotate(8deg);
    }
    55% {
      transform: scale(0.9) rotate(-4deg);
    }
    80% {
      transform: scale(1.06) rotate(2deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
    }
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
  flex: 1 1 0;
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
  display: grid;
  flex: 0 0 32px;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  height: 32px;
  min-width: 0;
  width: 100%;
`;

const Breadcrumb = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  gap: 2px;
  min-width: 0;
  overflow: hidden;
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
  flex: 0 1 auto;
  gap: 8px;
  justify-self: end;
  max-width: 100%;
  min-width: 0;
  pointer-events: none;
`;

const DesktopOnlyNavbarAction = styled.div`
  display: none;
  flex: 0 1 auto;
  min-width: 0;

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
  flex: 0 1 auto;
  font-family: ${APP_FONT};
  font-size: ${VISUAL_TOKENS.font.size.md};
  font-weight: ${VISUAL_TOKENS.font.weight.medium};
  gap: ${VISUAL_TOKENS.spacing[1]};
  height: 24px;
  justify-content: center;
  min-width: ${({ $iconOnly }) => ($iconOnly ? '24px' : '0')};
  max-width: 100%;
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
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DesktopOnlyNavbarTrailing = styled.div`
  align-items: center;
  display: none;
  gap: ${VISUAL_TOKENS.spacing[1]};
  height: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: inline-flex;
  }
`;

const NavbarActionSeparator = styled.div`
  background: ${VISUAL_TOKENS.background.transparent.medium};
  border-radius: 56px;
  height: 100%;
  width: 1px;
`;

// Pinned action buttons register to the left of the New Record button once
// the chat reveals an object. Tighter padding/gap than the default navbar
// buttons so multiple commands can sit side-by-side. Entrance animation
// cascades left-to-right via --pinned-action-index so buttons feel like
// they're landing one after the other.
const PinnedActionButton = styled(NavbarActionButton)`
  animation: pinnedActionIn 340ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--pinned-action-index, 0) * 90ms);
  display: none;
  gap: 4px;
  padding: 0 6px;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: inline-flex;
  }

  @keyframes pinnedActionIn {
    from {
      opacity: 0;
      transform: translateY(-6px) scale(0.94);
    }
    60% {
      opacity: 1;
      transform: translateY(1px) scale(1.02);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
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
  display: none;
  flex: 0 0 auto;
  gap: 2px;
  margin-left: auto;
  position: relative;
  z-index: 1;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: flex;
  }
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
  calendarEvent: IconCalendarEvent,
  checkbox: IconCheckbox,
  folder: IconFolder,
  layoutDashboard: IconLayoutDashboard,
  mapPin: IconMapPin,
  notes: IconNotes,
  planet: IconPlanet,
  playerPlay: IconPlayerPlay,
  rocket: IconRocket,
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
  heightMeters: IconRuler,
  icp: IconTarget,
  industry: IconBuildingFactory2,
  launchDate: IconCalendarEvent,
  linkedin: IconBrandLinkedin,
  mainContact: IconUser,
  manufacturer: IconBuildingFactory2,
  massKg: IconWeight,
  name: IconRocket,
  opportunities: IconTargetArrow,
  reusable: IconRefresh,
  serialNumber: IconBarcode,
  status: IconProgress,
  targetOrbit: IconPlanet,
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
  const sharedLogoUrl = getSharedCompanyLogoUrlFromDomainName(domainName);

  if (sharedLogoUrl) {
    return sharedLogoUrl;
  }

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
  pageKey?: string,
) {
  switch (page.type) {
    case 'table':
      return (
        <TablePage
          key={pageKey}
          page={page}
          onNavigateToLabel={onNavigateToLabel}
        />
      );
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
            stroke={NAVBAR_ACTION_TABLER_STROKE}
          />
        </NavbarActionIconWrap>
      ) : null}
      {action.label ? (
        <NavbarActionLabel $color={labelColor}>
          {action.label}
        </NavbarActionLabel>
      ) : null}
      {action.trailingLabel ? (
        <DesktopOnlyNavbarTrailing>
          <NavbarActionSeparator />
          <NavbarActionLabel $color={VISUAL_TOKENS.font.color.light}>
            {action.trailingLabel}
          </NavbarActionLabel>
        </DesktopOnlyNavbarTrailing>
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

function renderSidebarIcon(
  icon: HeroSidebarIcon,
  pulse: boolean = false,
): ReactNode {
  if (icon.kind === 'brand') {
    return (
      <SidebarIconSurface
        $background="transparent"
        $border="transparent"
        $color={COLORS.textSecondary}
        $pulse={pulse}
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
      $pulse={pulse}
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
  highlightedItemId,
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
  highlightedItemId?: string;
}) {
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
  // Tint the appearance animation with the item's own tone so Rocket pops
  // violet, Launch pops orange, Payload pops teal, etc.
  const iconTone =
    'tone' in item.icon && typeof item.icon.tone === 'string'
      ? item.icon.tone
      : 'gray';
  const highlightRgb = SIDEBAR_TONE_RGB[iconTone] ?? SIDEBAR_TONE_RGB.gray;
  const highlightStyle = rowHighlighted
    ? ({ '--hero-highlight-rgb': highlightRgb } as React.CSSProperties)
    : undefined;
  const rowContent = (
    <>
      {showBranch ? <SidebarBranchCell $isLastChild={isLastChild} /> : null}
      <SidebarRowMain $withBranch={showBranch}>
        {renderSidebarIcon(item.icon, rowHighlighted)}
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
          style={{
            cursor: rowInteractive ? 'pointer' : 'default',
            ...highlightStyle,
          }}
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
  const defaultActiveLabel =
    visual.favoritesNav?.find((item) => item.active)?.label ??
    visual.workspaceNav.find((entry) => !isFolder(entry) && entry.active)
      ?.label ??
    visual.workspaceNav[0]?.label ??
    '';

  const [activeLabel, setActiveLabel] = useState(defaultActiveLabel);
  const [createdObjectIds, setCreatedObjectIds] = useState<string[]>([]);
  // Objects whose pinned navbar commands have been scaffolded by the chat.
  // Includes Companies (reused from the standard sidebar) and all newly
  // created CRM objects. The navbar looks up its pinned actions here so
  // commands only appear after the assistant announces them.
  const [revealedObjectIds, setRevealedObjectIds] = useState<string[]>([]);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(
    null,
  );
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
  const pageDefaults = useMemo(
    () => ({
      defaultActions: visual.actions ?? [],
      defaultTableWidth: visual.tableWidth ?? DEFAULT_TABLE_WIDTH,
    }),
    [visual.actions, visual.tableWidth],
  );

  // Inject the CRM objects at the top of the workspace sidebar as they are
  // "created" by the AI chat. The callback chain is:
  // AssistantResponse -> ConversationPanel -> DraggableTerminal -> here. Each
  // object streams in one-by-one from the first assistant paragraph; the
  // workspace mirrors that order, with the most recently created object on top
  // and surfaced as the active page.
  const workspaceNav = useMemo<HeroSidebarEntry[]>(() => {
    if (createdObjectIds.length === 0) {
      return visual.workspaceNav;
    }

    // Walk the created list from newest-first so the last object streamed sits
    // on top. Any CRM entry not yet created is simply skipped.
    const prepended = [...createdObjectIds]
      .reverse()
      .map(
        (id) =>
          CRM_OBJECT_SEQUENCE.find((entry) => entry.id === id)?.sidebarItem,
      )
      .filter((item): item is NonNullable<typeof item> => item !== undefined);

    return [...prepended, ...visual.workspaceNav];
  }, [createdObjectIds, visual.workspaceNav]);

  const handleObjectCreated = useCallback((id: string) => {
    setRevealedObjectIds((current) =>
      current.includes(id) ? current : [...current, id],
    );
    // Companies is reused from the standard sidebar — no prepend, just flash
    // the existing item and show its index page.
    if (id === COMPANIES_ITEM_ID) {
      setActiveLabel(COMPANIES_ITEM_LABEL);
      setHighlightedItemId(COMPANIES_ITEM_ID);
      return;
    }
    const entry = CRM_OBJECT_SEQUENCE.find((candidate) => candidate.id === id);
    if (!entry) {
      return;
    }
    setCreatedObjectIds((current) =>
      current.includes(id) ? current : [...current, id],
    );
    setActiveLabel(entry.label);
    setHighlightedItemId(entry.id);
  }, []);

  const handleChatReset = useCallback(() => {
    setCreatedObjectIds([]);
    setRevealedObjectIds([]);
    setHighlightedItemId(null);
    setActiveLabel(defaultActiveLabel);
  }, [defaultActiveLabel]);

  const handleJumpToConversationEnd = useCallback(() => {
    setCreatedObjectIds(COMPLETED_CREATED_OBJECT_IDS);
    setRevealedObjectIds(COMPLETED_REVEALED_OBJECT_IDS);
    setHighlightedItemId(null);
    setActiveLabel(COMPLETED_ACTIVE_OBJECT_LABEL);
  }, []);

  useEffect(() => {
    if (highlightedItemId === null) {
      return undefined;
    }
    const id = window.setTimeout(() => setHighlightedItemId(null), 2000);
    return () => window.clearTimeout(id);
  }, [highlightedItemId]);

  const activeItem = useMemo(
    () =>
      (visual.favoritesNav
        ? findActiveItem(visual.favoritesNav, activeLabel, pageDefaults)
        : undefined) ?? findActiveItem(workspaceNav, activeLabel, pageDefaults),
    [activeLabel, pageDefaults, visual.favoritesNav, workspaceNav],
  );
  const activePage = useMemo(
    () => (activeItem ? normalizeHeroPage(activeItem, pageDefaults) : null),
    [activeItem, pageDefaults],
  );
  const activeHeader = activePage?.header;
  const activeActions = activeHeader?.actions ?? [];
  const navbarActions = activeHeader?.navbarActions;
  // Pinned commands registered by the active object. Surfaced only after the
  // chat has revealed that object, mirroring how a real workspace would only
  // gain header actions after the schema / command-menu-items lands.
  const pinnedActions =
    activeItem && revealedObjectIds.includes(activeItem.id)
      ? OBJECT_PINNED_ACTIONS[activeItem.id]
      : undefined;
  const showPageCount = activeHeader?.count !== undefined;
  const showListIcon = activeHeader?.showListIcon ?? false;
  const showViewBar =
    activePage !== null &&
    activePage !== undefined &&
    activePage.type !== 'dashboard' &&
    activePage.type !== 'workflow';

  const handleSelectLabel = (label: string) => {
    setActiveLabel(label);

    const containingFolderId = findContainingFolderId(workspaceNav, label);

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
          highlightedItemId={highlightedItemId ?? undefined}
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
        highlightedItemId={highlightedItemId ?? undefined}
        key={entry.id}
        item={entry}
        onSelect={handleSelectLabel}
        selectedLabel={activeLabel}
      />
    );
  };

  return (
    <StyledHomeVisual>
      <ShellScene>
        <WindowOrderProvider>
          <DraggableAppWindow>
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
                          highlightedItemId={highlightedItemId ?? undefined}
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
                    {workspaceNav.map(renderSidebarEntry)}
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
                        {pinnedActions?.map((action, index) => (
                          <PinnedActionButton
                            key={`pinned-${activeItem?.id}-${action.label}-${index}`}
                            style={
                              {
                                '--pinned-action-index': index,
                              } as CSSProperties
                            }
                          >
                            <NavbarActionIconWrap>
                              {(() => {
                                const Icon =
                                  NAVBAR_ACTION_ICON_MAP[action.icon] ??
                                  IconPlus;
                                return (
                                  <Icon
                                    aria-hidden
                                    size={VISUAL_TOKENS.icon.size.sm}
                                    stroke={NAVBAR_ACTION_TABLER_STROKE}
                                  />
                                );
                              })()}
                            </NavbarActionIconWrap>
                            <NavbarActionLabel>
                              {action.label}
                            </NavbarActionLabel>
                          </PinnedActionButton>
                        ))}
                        <DesktopOnlyNavbarAction>
                          <NavbarActionButton>
                            <NavbarActionIconWrap>
                              <IconPlus
                                aria-hidden
                                size={VISUAL_TOKENS.icon.size.sm}
                                stroke={NAVBAR_ACTION_TABLER_STROKE}
                              />
                            </NavbarActionIconWrap>
                            <NavbarActionLabel>New</NavbarActionLabel>
                          </NavbarActionButton>
                        </DesktopOnlyNavbarAction>
                        <NavbarActionButton>
                          <NavbarActionIconWrap>
                            <IconDotsVertical
                              aria-hidden
                              size={VISUAL_TOKENS.icon.size.sm}
                              stroke={NAVBAR_ACTION_TABLER_STROKE}
                            />
                          </NavbarActionIconWrap>
                          <DesktopOnlyNavbarTrailing>
                            <NavbarActionSeparator />
                            <NavbarActionLabel
                              $color={VISUAL_TOKENS.font.color.light}
                            >
                              ⌘K
                            </NavbarActionLabel>
                          </DesktopOnlyNavbarTrailing>
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
                    ? renderPageDefinition(
                        activePage,
                        handleSelectLabel,
                        activeItem?.id ?? activeLabel,
                      )
                    : null}
                </IndexSurface>
              </RightPane>
            </AppLayout>
          </DraggableAppWindow>
          <DraggableTerminal
            onObjectCreated={handleObjectCreated}
            onChatReset={handleChatReset}
            onJumpToConversationEnd={handleJumpToConversationEnd}
          />
        </WindowOrderProvider>
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
