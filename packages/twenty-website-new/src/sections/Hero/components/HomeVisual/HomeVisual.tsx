'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import {
  IconBook,
  IconBox,
  IconBrandApple,
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
  IconLayoutSidebarLeftCollapse,
  IconLink,
  IconList,
  IconMap2,
  IconMessageCircle,
  IconMessageCirclePlus,
  IconMoneybag,
  IconNotes,
  IconPencil,
  IconPlayerPlay,
  IconPlus,
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
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import type {
  HeroCellEntity,
  HeroCellPerson,
  HeroCellRelation,
  HeroCellValue,
  HeroColumnDef,
  HeroRowDef,
  HeroSidebarEntry,
  HeroSidebarFolder,
  HeroSidebarIcon,
  HeroSidebarItem,
  HeroVisualType,
} from '../../types/HeroHomeData';
import { Chip, ChipVariant } from './homeVisualChip';
import { VISUAL_TOKENS } from './homeVisualTokens';

const APP_FONT = VISUAL_TOKENS.font.family;
const DEFAULT_TABLE_WIDTH = 1700;

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
  amber: { background: '#fff4d6', border: '#ffd49b', color: '#9a6700' },
  blue: { background: '#d9e2fc', border: '#c6d4f9', color: '#3557c6' },
  gray: { background: '#ebebeb', border: '#d6d6d6', color: '#666666' },
  green: { background: '#ccebd7', border: '#bbe4c9', color: '#153226' },
  orange: { background: '#ffdcc3', border: '#ffcca7', color: '#582d1d' },
  pink: { background: '#ffe1e7', border: '#ffc8d6', color: '#a51853' },
  purple: { background: '#e0e7ff', border: '#c7d2fe', color: '#4f46e5' },
  teal: { background: '#c7ebe5', border: '#b3e3dc', color: '#10302b' },
  violet: { background: '#ebe5ff', border: '#d8cbff', color: '#5b3fd1' },
  red: { background: '#fee2e2', border: '#fecaca', color: '#b91c1c' },
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
  max-width: 980px;
  transform-origin: center top;
  transition: transform 0.18s ease;
  width: 100%;
`;

const Frame = styled.div`
  aspect-ratio: 1280 / 832;
  background-color: ${COLORS.background};
  background-image: radial-gradient(
      circle at top center,
      rgba(0, 0, 0, 0.035),
      rgba(0, 0, 0, 0) 55%
    ),
    ${VISUAL_TOKENS.background.noisy};
  background-position:
    center top,
    center;
  background-repeat: no-repeat, repeat;
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  box-shadow: ${COLORS.shadow};
  overflow: hidden;
  position: relative;
`;

const AppLayout = styled.div`
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  height: 100%;
  position: relative;
  z-index: 1;

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-template-columns: 220px minmax(0, 1fr);
  }
`;

const SidebarPanel = styled.aside`
  background: transparent;
  border-right: 1px solid rgba(0, 0, 0, 0.04);
  display: grid;
  gap: 12px;
  grid-template-rows: auto auto minmax(0, 1fr);
  padding: 12px 8px;
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
  background: #111111;
  border-radius: 2px;
  color: #ffffff;
  display: flex;
  font-family: ${APP_FONT};
  font-size: 11px;
  font-weight: ${theme.font.weight.medium};
  height: 16px;
  justify-content: center;
  width: 16px;
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
`;

const SegmentedRail = styled.div`
  background: rgba(252, 252, 252, 0.8);
  border: 1px solid ${COLORS.border};
  border-radius: 40px;
  display: grid;
  gap: 2px;
  grid-auto-flow: column;
  padding: 3px;
`;

const Segment = styled.div<{ $selected?: boolean }>`
  align-items: center;
  background: ${({ $selected }) =>
    $selected ? 'rgba(0, 0, 0, 0.04)' : 'transparent'};
  border-radius: 16px;
  display: flex;
  height: 22px;
  justify-content: center;
  width: 22px;
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
  display: grid;
  gap: 12px;
  min-height: 0;
  overflow: hidden;
`;

const SidebarSection = styled.div`
  display: grid;
  gap: 2px;
`;

const SidebarSectionLabel = styled.span`
  color: ${COLORS.textLight};
  display: none;
  font-family: ${APP_FONT};
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  padding: 0 4px 4px;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: block;
  }
`;

const SidebarItemRow = styled.div<{
  $active?: boolean;
  $depth?: number;
}>`
  align-items: center;
  background: ${({ $active }) =>
    $active ? 'rgba(0, 0, 0, 0.04)' : 'transparent'};
  border-radius: 4px;
  display: grid;
  gap: 8px;
  grid-template-columns: auto minmax(0, 1fr) auto;
  height: 28px;
  padding: 0 2px 0 ${({ $depth = 0 }) => `${$depth === 0 ? 4 : 24}px`};
  position: relative;
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

const SidebarItemLabel = styled.span`
  color: ${COLORS.textSecondary};
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

const SidebarChevron = styled.div`
  color: ${COLORS.textTertiary};
  display: none;

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
  left: 15px;
  position: absolute;
  top: 0;
  width: 1px;
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
  display: grid;
  gap: 12px;
  grid-template-rows: 32px minmax(0, 1fr);
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

const AccentIconSurface = styled.div`
  align-items: center;
  background: ${COLORS.accentSurface};
  border: 1px solid ${COLORS.accentBorder};
  border-radius: 4px;
  color: ${COLORS.accent};
  display: flex;
  height: 16px;
  justify-content: center;
  width: 16px;
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

const NavbarDecorativeChip = styled.div`
  align-items: center;
  background: transparent;
  border: 1px solid ${VISUAL_TOKENS.background.transparent.medium};
  border-radius: ${VISUAL_TOKENS.border.radius.sm};
  color: ${VISUAL_TOKENS.font.color.secondary};
  display: inline-flex;
  font-family: ${APP_FONT};
  font-size: ${VISUAL_TOKENS.font.size.md};
  font-weight: ${VISUAL_TOKENS.font.weight.medium};
  gap: ${VISUAL_TOKENS.spacing[1]};
  height: 24px;
  padding: 0 ${VISUAL_TOKENS.spacing[2]};
  white-space: nowrap;
`;

const NavbarDecorativeIconWrap = styled.span`
  align-items: center;
  color: currentColor;
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
`;

const IndexSurface = styled.div`
  background: ${COLORS.background};
  border-radius: 8px;
  display: grid;
  grid-template-rows: 40px minmax(0, 1fr);
  min-width: 0;
  overflow: hidden;
`;

const ViewbarBar = styled.div`
  align-items: center;
  background: ${COLORS.background};
  border-bottom: 1px solid ${COLORS.borderLight};
  display: flex;
  justify-content: space-between;
  padding: 8px 8px 8px 12px;
`;

const ViewSwitcher = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  height: 24px;
  min-width: 0;
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
  gap: 2px;
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
  min-height: 0;
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
  min-height: 0;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TableCanvas = styled.div<{ $width: number }>`
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
  padding: 0 8px;
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
  font-size: 9px;
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

const HoverActions = styled.div<{ $visible: boolean }>`
  align-items: center;
  background: ${COLORS.backgroundSecondary};
  border: 1px solid ${COLORS.border};
  border-radius: 4px;
  box-shadow: ${VISUAL_TOKENS.boxShadow.light};
  display: flex;
  gap: 2px;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  padding: 2px;
  pointer-events: none;
  position: absolute;
  right: 4px;
  top: 4px;
  transform: translateX(${({ $visible }) => ($visible ? '0' : '4px')});
  transition:
    opacity 0.14s ease,
    transform 0.14s ease;
`;

const MiniAction = styled.div`
  align-items: center;
  border-radius: 2px;
  color: ${COLORS.textSecondary};
  display: flex;
  height: 20px;
  justify-content: center;
  width: 20px;
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
  box: IconBox,
  buildingSkyscraper: IconBuildingSkyscraper,
  checkbox: IconCheckbox,
  folder: IconFolder,
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

function findActiveItem(
  entries: HeroSidebarEntry[],
  activeLabel: string,
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
      const entryHasTable =
        (entry.columns?.length ?? 0) > 0 || (entry.rows?.length ?? 0) > 0;

      if (!entryHasTable && entry.children && entry.children.length > 0) {
        const firstChildWithTable = entry.children.find(
          (child) =>
            (child.columns?.length ?? 0) > 0 || (child.rows?.length ?? 0) > 0,
        );

        if (firstChildWithTable) {
          return firstChildWithTable;
        }
      }

      return entry;
    }
  }

  return undefined;
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
  domain,
  label,
  size = 14,
}: {
  domain?: string;
  label?: string;
  size?: number;
}) {
  const faviconUrl = getLogoUrlFromDomainName(domain);
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
            icon.brand === 'claude'
              ? 'claude.ai'
              : icon.brand === 'stripe'
                ? 'stripe.com'
                : undefined
          }
          label={icon.brand}
          size={16}
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
        $color={tone.color}
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
  depth = 0,
  interactive = true,
  item,
  onSelect,
  selectedLabel,
}: {
  depth?: number;
  interactive?: boolean;
  item: HeroSidebarItem;
  onSelect?: (label: string) => void;
  selectedLabel?: string;
}) {
  const rowActive =
    interactive && selectedLabel !== undefined && item.label === selectedLabel;

  return (
    <>
      <SidebarItemRow
        $active={rowActive}
        $depth={depth}
        onClick={interactive ? () => onSelect?.(item.label) : undefined}
        style={{ cursor: interactive ? 'pointer' : 'default' }}
      >
        {renderSidebarIcon(item.icon)}
        <SidebarItemText>
          <SidebarItemLabel>{item.label}</SidebarItemLabel>
          {item.meta ? <SidebarItemMeta>· {item.meta}</SidebarItemMeta> : null}
        </SidebarItemText>
        {item.showChevron || (item.children && item.children.length > 0) ? (
          <SidebarChevron>
            <ChevronDownMini color={COLORS.textTertiary} size={12} />
          </SidebarChevron>
        ) : null}
      </SidebarItemRow>
      {item.children && item.children.length > 0 ? (
        <SidebarChildStack>
          <BranchLine />
          {item.children.map((child) => (
            <SidebarItemComponent
              key={child.id}
              depth={depth + 1}
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
    <div style={{ minWidth: 0, position: 'relative', width: '100%' }}>
      <CellChip
        clickable={false}
        label={token.name}
        leftComponent={
          <PersonAvatarCircle
            $background={tone.background}
            $color={tone.color}
            $square={square}
          >
            {token.avatarUrl ? (
              <AvatarImage alt="" src={token.avatarUrl} />
            ) : (
              (token.shortLabel ?? getInitials(token.name))
            )}
          </PersonAvatarCircle>
        }
      />
      <HoverActions $visible={hovered}>
        {withCopyAction ? (
          <MiniAction aria-hidden="true">
            <CopyMini />
          </MiniAction>
        ) : null}
        <MiniAction aria-hidden="true">
          <PencilMini />
        </MiniAction>
      </HoverActions>
    </div>
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
    <div style={{ minWidth: 0, position: 'relative', width: '100%' }}>
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
        <MiniAction aria-hidden="true">
          <PencilMini />
        </MiniAction>
      </HoverActions>
    </div>
  );
}

function renderCellValue(
  cell: HeroCellValue,
  hovered: boolean,
  isFirstColumn: boolean,
): ReactNode {
  switch (cell.type) {
    case 'text':
      return <InlineText>{cell.value}</InlineText>;
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
          <HoverActions $visible={hovered}>
            <MiniAction aria-hidden="true">
              <PencilMini />
            </MiniAction>
          </HoverActions>
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
      return <PersonTokenCell hovered={hovered} token={cell} />;
    case 'entity':
      return (
        <EntityCellComponent
          cell={cell}
          hovered={hovered}
          isFirstColumn={isFirstColumn}
        />
      );
    case 'relation':
      return <RelationCellComponent cell={cell} hovered={hovered} />;
  }
}

// -- Main component --

export function HomeVisual({ visual }: { visual: HeroVisualType }) {
  const shellRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startScrollLeft: 0,
    startX: 0,
  });

  const defaultActiveLabel =
    visual.workspaceNav.find((entry) => !isFolder(entry) && entry.active)
      ?.label ??
    visual.workspaceNav[0]?.label ??
    '';

  const [activeLabel, setActiveLabel] = useState(defaultActiveLabel);
  const [dragging, setDragging] = useState(false);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const activeItem = useMemo(
    () => findActiveItem(visual.workspaceNav, activeLabel),
    [activeLabel, visual.workspaceNav],
  );

  const columns: HeroColumnDef[] = activeItem?.columns ?? [];
  const rows: HeroRowDef[] = activeItem?.rows ?? [];
  const viewLabel = activeItem?.viewLabel ?? activeLabel;
  const viewCount = activeItem?.viewCount ?? rows.length;
  const totalTableWidth = visual.tableWidth ?? DEFAULT_TABLE_WIDTH;
  const actions = visual.actions ?? [];

  const columnWidth = columns.reduce((sum, column) => sum + column.width, 0);
  const fillerWidth = Math.max(totalTableWidth - columnWidth, 0);

  const handleShellPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || dragging || !shellRef.current) {
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

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      event.pointerType !== 'mouse' ||
      event.button !== 0 ||
      !viewportRef.current
    ) {
      return;
    }

    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startScrollLeft: viewportRef.current.scrollLeft,
      startX: event.clientX,
    };

    viewportRef.current.setPointerCapture(event.pointerId);
    setDragging(true);
    event.preventDefault();
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || !viewportRef.current) {
      return;
    }

    viewportRef.current.scrollLeft =
      dragRef.current.startScrollLeft -
      (event.clientX - dragRef.current.startX);
  };

  const endDragging = () => {
    dragRef.current.active = false;
    dragRef.current.pointerId = -1;
    setDragging(false);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!viewportRef.current || dragRef.current.pointerId !== event.pointerId) {
      return;
    }

    viewportRef.current.releasePointerCapture(event.pointerId);
    endDragging();
  };

  useEffect(() => {
    const node = viewportRef.current;

    if (!node) {
      return;
    }

    const onWheel: EventListener = (event) => {
      if (!(event instanceof WheelEvent)) {
        return;
      }

      if (
        node.scrollWidth <= node.clientWidth ||
        Math.abs(event.deltaY) <= Math.abs(event.deltaX)
      ) {
        return;
      }

      node.scrollLeft += event.deltaY;
      event.preventDefault();
    };

    node.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      node.removeEventListener('wheel', onWheel);
    };
  }, []);

  const renderSidebarEntry = (entry: HeroSidebarEntry) => {
    if (isFolder(entry)) {
      return (
        <SidebarItemComponent
          key={entry.id}
          item={{
            id: entry.id,
            label: entry.label,
            icon: entry.icon,
            showChevron: entry.showChevron,
            children: entry.items,
          }}
          onSelect={setActiveLabel}
          selectedLabel={activeLabel}
        />
      );
    }

    return (
      <SidebarItemComponent
        key={entry.id}
        item={entry}
        onSelect={setActiveLabel}
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
                    <IconBrandApple
                      aria-hidden
                      color="#ffffff"
                      size={11}
                      stroke={2}
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
                        interactive={false}
                        item={item}
                      />
                    ))}
                  </SidebarSection>
                ) : null}
                <SidebarSection>
                  <SidebarSectionLabel>Workspace</SidebarSectionLabel>
                  {visual.workspaceNav.map(renderSidebarEntry)}
                </SidebarSection>
              </SidebarScroll>
            </SidebarPanel>

            <RightPane>
              <NavbarBar>
                <Breadcrumb>
                  <BreadcrumbTag>
                    <AccentIconSurface>
                      <IconBuildingSkyscraper
                        aria-hidden
                        color={COLORS.accent}
                        size={14}
                      />
                    </AccentIconSurface>
                    <CrumbLabel>{activeLabel}</CrumbLabel>
                  </BreadcrumbTag>
                </Breadcrumb>

                <NavbarActions aria-hidden>
                  <DesktopOnlyNavbarAction>
                    <NavbarDecorativeChip>
                      <NavbarDecorativeIconWrap>
                        <IconPlus
                          aria-hidden
                          size={VISUAL_TOKENS.icon.size.sm}
                          stroke={VISUAL_TOKENS.icon.stroke.sm}
                        />
                      </NavbarDecorativeIconWrap>
                      New Record
                    </NavbarDecorativeChip>
                  </DesktopOnlyNavbarAction>
                  <NavbarDecorativeChip>
                    <NavbarDecorativeIconWrap>
                      <IconDotsVertical
                        aria-hidden
                        size={VISUAL_TOKENS.icon.size.sm}
                        stroke={VISUAL_TOKENS.icon.stroke.sm}
                      />
                    </NavbarDecorativeIconWrap>
                  </NavbarDecorativeChip>
                </NavbarActions>
              </NavbarBar>

              <IndexSurface>
                <ViewbarBar>
                  <ViewSwitcher aria-hidden="true">
                    <ListMini />
                    <ViewName>{viewLabel}</ViewName>
                    <TinyDot />
                    <ViewCount>{viewCount}</ViewCount>
                    <ChevronDownMini color={COLORS.textLight} />
                  </ViewSwitcher>
                  <ViewActions>
                    {actions.map((action) => (
                      <ViewAction key={action}>{action}</ViewAction>
                    ))}
                  </ViewActions>
                </ViewbarBar>

                <TableShell>
                  <GripRail aria-hidden="true">
                    <GripCell />
                    {rows.map((row) => (
                      <GripCell key={`grip-${row.id}`} />
                    ))}
                    <GripCell />
                  </GripRail>

                  <TableViewport
                    ref={viewportRef}
                    $dragging={dragging}
                    aria-label={`Interactive preview of the ${activeLabel} table`}
                    onPointerCancel={endDragging}
                    onPointerDown={handlePointerDown}
                    onPointerLeave={endDragging}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                  >
                    <TableCanvas $width={totalTableWidth}>
                      <HeaderRow>
                        {columns.map((column) => (
                          <TableCell
                            key={column.id}
                            $align={column.align}
                            $header
                            $sticky={column.isFirstColumn}
                            $width={column.width}
                          >
                            <HeaderCellContent>
                              {column.isFirstColumn ? (
                                <>
                                  <CheckboxContainer>
                                    <CheckboxBox />
                                  </CheckboxContainer>
                                  {renderHeaderIcon(column.id)}
                                  <HeaderLabel>{column.label}</HeaderLabel>
                                  <EdgePlus aria-hidden="true">
                                    <PlusMini
                                      color={COLORS.textTertiary}
                                      size={12}
                                    />
                                  </EdgePlus>
                                </>
                              ) : (
                                <>
                                  {renderHeaderIcon(column.id)}
                                  <HeaderLabel>{column.label}</HeaderLabel>
                                </>
                              )}
                            </HeaderCellContent>
                          </TableCell>
                        ))}
                        <EmptyFillCell $header $width={fillerWidth}>
                          {fillerWidth > 0 ? (
                            <HeaderFillContent>
                              <PlusMini color={COLORS.textTertiary} size={16} />
                            </HeaderFillContent>
                          ) : null}
                        </EmptyFillCell>
                      </HeaderRow>

                      {rows.map((row) => {
                        const hovered = hoveredRowId === row.id;

                        return (
                          <DataRow
                            key={row.id}
                            onMouseEnter={() => setHoveredRowId(row.id)}
                            onMouseLeave={() =>
                              setHoveredRowId((current) =>
                                current === row.id ? null : current,
                              )
                            }
                          >
                            {columns.map((column) => {
                              const cell = row.cells[column.id];

                              return (
                                <TableCell
                                  key={`${row.id}-${column.id}`}
                                  $align={column.align}
                                  $hovered={hovered}
                                  $sticky={column.isFirstColumn}
                                  $width={column.width}
                                >
                                  {cell
                                    ? renderCellValue(
                                        cell,
                                        hovered,
                                        !!column.isFirstColumn,
                                      )
                                    : null}
                                </TableCell>
                              );
                            })}
                            <EmptyFillCell
                              $hovered={hovered}
                              $width={fillerWidth}
                            />
                          </DataRow>
                        );
                      })}

                      <FooterRow>
                        {columns.length > 0 ? (
                          <TableCell
                            $sticky={columns[0].isFirstColumn}
                            $width={columns[0].width}
                          >
                            <FooterFirstContent>
                              <MutedText>Calculate</MutedText>
                              <ChevronDownMini
                                color={COLORS.textTertiary}
                                size={14}
                              />
                            </FooterFirstContent>
                          </TableCell>
                        ) : null}
                        {columns.slice(1).map((column) => (
                          <TableCell
                            key={`footer-${column.id}`}
                            $align={column.align}
                            $width={column.width}
                          />
                        ))}
                        <EmptyFillCell $footer $width={fillerWidth} />
                      </FooterRow>
                    </TableCanvas>
                  </TableViewport>
                </TableShell>
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
