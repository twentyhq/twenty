'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import {
  IconBrandLinkedin,
  IconBrandApple,
  IconBook,
  IconBox,
  IconBuildingSkyscraper,
  IconBuildingFactory2,
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
  IconPencil,
  IconPlayerPlay,
  IconPlus,
  IconSearch,
  IconSettings,
  IconSettingsAutomation,
  IconTarget,
  IconTargetArrow,
  IconNotes,
  IconUser,
  IconUserCircle,
  IconUsers,
  IconVersions,
  IconX,
} from '@tabler/icons-react';
import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import {
  HOME_VISUAL_ACTIONS,
  HOME_VISUAL_BREADCRUMB_LABEL,
  HOME_VISUAL_COLUMNS,
  HOME_VISUAL_FAVORITES,
  HOME_VISUAL_OTHER,
  HOME_VISUAL_ROWS,
  HOME_VISUAL_TABLE_TOTAL_WIDTH,
  HOME_VISUAL_VIEW_COUNT,
  HOME_VISUAL_VIEW_LABEL,
  HOME_VISUAL_WORKSPACE,
  HOME_VISUAL_WORKSPACE_NAME,
  type HomeVisualBrand,
  type HomeVisualColumnKey,
  type HomeVisualPersonToken,
  type HomeVisualRow,
  type HomeVisualSidebarIcon,
  type HomeVisualSidebarItem,
} from './homeVisualMockData';
import { Chip, ChipVariant } from './homeVisualChip';
import { HomeVisualButton } from './homeVisualButton';
import { themeCssVariables } from '../../../../../../twenty-ui/src/theme-constants/themeCssVariables';

const APP_FONT = themeCssVariables.font.family;

const COLORS = {
  accent: themeCssVariables.accent.accent9,
  accentBorder: themeCssVariables.border.color.blue,
  accentSurface: themeCssVariables.accent.primary,
  accentSurfaceSoft: themeCssVariables.background.transparent.blue,
  background: themeCssVariables.background.primary,
  backgroundSecondary: themeCssVariables.background.secondary,
  border: themeCssVariables.border.color.medium,
  borderLight: themeCssVariables.border.color.light,
  borderStrong: themeCssVariables.border.color.strong,
  shadow: '0 14px 34px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)',
  text: themeCssVariables.font.color.primary,
  textSecondary: themeCssVariables.font.color.secondary,
  textTertiary: themeCssVariables.font.color.tertiary,
  textLight: themeCssVariables.font.color.light,
  whiteOverlay: themeCssVariables.background.transparent.primary,
};

const SIDEBAR_TONES = {
  amber: { background: '#fff4d6', border: '#ffd49b', color: '#9a6700' },
  blue: { background: '#d9e2fc', border: '#c6d4f9', color: '#3557c6' },
  gray: { background: '#ebebeb', border: '#d6d6d6', color: '#666666' },
  green: { background: '#ccebd7', border: '#bbe4c9', color: '#153226' },
  orange: { background: '#ffdcc3', border: '#ffcca7', color: '#582d1d' },
  pink: { background: '#ffe1e7', border: '#ffc8d6', color: '#a51853' },
  purple: { background: '#e0e7ff', border: '#c7d2fe', color: '#4f46e5' },
  teal: { background: '#c7ebe5', border: '#b3e3dc', color: '#10302b' },
  violet: { background: '#ebe5ff', border: '#d8cbff', color: '#5b3fd1' },
} as const;

const PERSON_TONES = {
  amber: { background: '#f6e6d7', color: '#7a4f2a' },
  blue: { background: '#dbeafe', color: '#1d4ed8' },
  gray: { background: '#e5e7eb', color: '#4b5563' },
  green: { background: '#dcfce7', color: '#15803d' },
  pink: { background: '#ffe4e6', color: '#be123c' },
  purple: { background: '#ede9fe', color: '#6d28d9' },
  red: { background: '#fee2e2', color: '#b91c1c' },
  teal: { background: '#ccfbf1', color: '#0f766e' },
} as const;

const COLUMN_WIDTH = HOME_VISUAL_COLUMNS.reduce(
  (sum, column) => sum + column.width,
  0,
);

const FILLER_WIDTH = Math.max(HOME_VISUAL_TABLE_TOTAL_WIDTH - COLUMN_WIDTH, 0);
const TABLER_STROKE = 1.6;
const NAVIGATION_TABLER_STROKE = 2;

const StyledHomeVisual = styled.div`
  isolation: isolate;
  margin-top: ${theme.spacing(5)};
  position: relative;
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
  background-image:
    radial-gradient(
      circle at top center,
      rgba(0, 0, 0, 0.035),
      rgba(0, 0, 0, 0) 55%
    ),
    ${themeCssVariables.background.noisy};
  background-position:
    center top,
    center;
  background-repeat:
    no-repeat,
    repeat;
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

const Sidebar = styled.aside`
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

const Navbar = styled.div`
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

const IndexSurface = styled.div`
  background: ${COLORS.background};
  border-radius: 8px;
  display: grid;
  grid-template-rows: 40px minmax(0, 1fr);
  min-width: 0;
  overflow: hidden;
`;

const Viewbar = styled.div`
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
  color: ${COLORS.textSecondary};
  display: flex;
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.regular};
  height: 24px;
  line-height: 1.4;
  padding: 4px 8px;
  border-radius: 4px;
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

const CompanyCellLayout = styled.div`
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

const PersonAvatar = styled.div<{
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
  backdrop-filter: blur(20px);
  background: ${COLORS.backgroundSecondary};
  border: 1px solid ${COLORS.border};
  border-radius: 4px;
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: flex;
  gap: 2px;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  padding: 2px;
  pointer-events: none;
  position: absolute;
  right: 4px;
  top: 4px;
  transform: translateX(${({ $visible }) => ($visible ? '0' : '4px')});
  transition: opacity 0.14s ease, transform 0.14s ease;
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

const TagChip = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
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

const failedFaviconUrls = new Set<string>();

const BRAND_FAVICON_DOMAINS: Partial<Record<HomeVisualBrand, string>> = {
  accel: 'accel.com',
  airbnb: 'airbnb.com',
  anthropic: 'anthropic.com',
  apple: 'apple.com',
  claude: 'claude.ai',
  figma: 'figma.com',
  'founders-fund': 'foundersfund.com',
  github: 'github.com',
  google: 'google.com',
  linkedin: 'linkedin.com',
  mailchimp: 'mailchimp.com',
  notion: 'notion.com',
  qonto: 'qonto.com',
  sequoia: 'sequoia.com',
  segment: 'segment.com',
  slack: 'slack.com',
  stripe: 'stripe.com',
};

function getInitials(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

type MiniIconProps = {
  color?: string;
  size?: number;
  stroke?: number;
};

function ChevronDownMini({
  color = COLORS.textTertiary,
  size = 14,
}: MiniIconProps) {
  return <IconChevronDown aria-hidden color={color} size={size} stroke={TABLER_STROKE} />;
}

function SearchMini({
  color = COLORS.textTertiary,
  size = 16,
}: MiniIconProps) {
  return <IconSearch aria-hidden color={color} size={size} stroke={TABLER_STROKE} />;
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

function HomeMini({
  color = COLORS.textSecondary,
  size = 16,
}: MiniIconProps) {
  return <IconHome2 aria-hidden color={color} size={size} stroke={TABLER_STROKE} />;
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

function FolderMini({
  color = COLORS.textSecondary,
  size = 14,
  stroke = TABLER_STROKE,
}: MiniIconProps) {
  return <IconFolder aria-hidden color={color} size={size} stroke={stroke} />;
}

function BuildingMini({
  color = COLORS.textSecondary,
  size = 14,
  stroke = TABLER_STROKE,
}: MiniIconProps) {
  return (
    <IconBuildingSkyscraper
      aria-hidden
      color={color}
      size={size}
      stroke={stroke}
    />
  );
}

function UserMini({
  color = COLORS.textSecondary,
  size = 14,
  stroke = TABLER_STROKE,
}: MiniIconProps) {
  return <IconUser aria-hidden color={color} size={size} stroke={stroke} />;
}

function TargetArrowMini({
  color = COLORS.textSecondary,
  size = 14,
  stroke = TABLER_STROKE,
}: MiniIconProps) {
  return (
    <IconTargetArrow aria-hidden color={color} size={size} stroke={stroke} />
  );
}

function CheckboxMini({
  color = COLORS.textSecondary,
  size = 14,
  stroke = TABLER_STROKE,
}: MiniIconProps) {
  return <IconCheckbox aria-hidden color={color} size={size} stroke={stroke} />;
}

function NotesMini({
  color = COLORS.textSecondary,
  size = 14,
  stroke = TABLER_STROKE,
}: MiniIconProps) {
  return <IconNotes aria-hidden color={color} size={size} stroke={stroke} />;
}

function SettingsMini({
  color = COLORS.textSecondary,
  size = 14,
  stroke = TABLER_STROKE,
}: MiniIconProps) {
  return <IconSettings aria-hidden color={color} size={size} stroke={stroke} />;
}

function SettingsAutomationMini({
  color = COLORS.textSecondary,
  size = 14,
  stroke = TABLER_STROKE,
}: MiniIconProps) {
  return (
    <IconSettingsAutomation
      aria-hidden
      color={color}
      size={size}
      stroke={stroke}
    />
  );
}

function VersionsMini({
  color = COLORS.textSecondary,
  size = 14,
  stroke = TABLER_STROKE,
}: MiniIconProps) {
  return <IconVersions aria-hidden color={color} size={size} stroke={stroke} />;
}

function BookMini({
  color = COLORS.textSecondary,
  size = 14,
  stroke = TABLER_STROKE,
}: MiniIconProps) {
  return <IconBook aria-hidden color={color} size={size} stroke={stroke} />;
}

function BoxMini({
  color = COLORS.textSecondary,
  size = 14,
  stroke = TABLER_STROKE,
}: MiniIconProps) {
  return <IconBox aria-hidden color={color} size={size} stroke={stroke} />;
}

function PlayerPlayMini({
  color = COLORS.textSecondary,
  size = 14,
  stroke = TABLER_STROKE,
}: MiniIconProps) {
  return <IconPlayerPlay aria-hidden color={color} size={size} stroke={stroke} />;
}

function ListMini({
  color = COLORS.textSecondary,
  size = 16,
}: MiniIconProps) {
  return <IconList aria-hidden color={color} size={size} stroke={TABLER_STROKE} />;
}

function PlusMini({
  color = COLORS.textSecondary,
  size = 14,
}: MiniIconProps) {
  return <IconPlus aria-hidden color={color} size={size} stroke={TABLER_STROKE} />;
}

function LinkMini({
  color = COLORS.textTertiary,
  size = 16,
}: MiniIconProps) {
  return <IconLink aria-hidden color={color} size={size} stroke={TABLER_STROKE} />;
}

function CreatedByMini({
  color = COLORS.textTertiary,
  size = 16,
}: MiniIconProps) {
  return (
    <IconCreativeCommonsSa
      aria-hidden
      color={color}
      size={size}
      stroke={TABLER_STROKE}
    />
  );
}

function MapMini({
  color = COLORS.textTertiary,
  size = 16,
}: MiniIconProps) {
  return <IconMap2 aria-hidden color={color} size={size} stroke={TABLER_STROKE} />;
}

function UserCircleMini({
  color = COLORS.textTertiary,
  size = 16,
}: MiniIconProps) {
  return (
    <IconUserCircle aria-hidden color={color} size={size} stroke={TABLER_STROKE} />
  );
}

function TargetCircleMini({
  color = COLORS.textTertiary,
  size = 16,
}: MiniIconProps) {
  return <IconTarget aria-hidden color={color} size={size} stroke={TABLER_STROKE} />;
}

function MoneybagMini({
  color = COLORS.textTertiary,
  size = 16,
}: MiniIconProps) {
  return <IconMoneybag aria-hidden color={color} size={size} stroke={TABLER_STROKE} />;
}

function BrandLinkedinMini({
  color = COLORS.textTertiary,
  size = 16,
}: MiniIconProps) {
  return (
    <IconBrandLinkedin aria-hidden color={color} size={size} stroke={TABLER_STROKE} />
  );
}

function BuildingFactoryMini({
  color = COLORS.textTertiary,
  size = 16,
}: MiniIconProps) {
  return (
    <IconBuildingFactory2
      aria-hidden
      color={color}
      size={size}
      stroke={TABLER_STROKE}
    />
  );
}

function UsersMini({
  color = COLORS.textTertiary,
  size = 16,
}: MiniIconProps) {
  return <IconUsers aria-hidden color={color} size={size} stroke={TABLER_STROKE} />;
}

function CalendarEventMini({
  color = COLORS.textTertiary,
  size = 16,
}: MiniIconProps) {
  return (
    <IconCalendarEvent
      aria-hidden
      color={color}
      size={size}
      stroke={TABLER_STROKE}
    />
  );
}

function CheckMini({
  color = COLORS.text,
  size = 12,
}: MiniIconProps) {
  return <IconCheck aria-hidden color={color} size={size} stroke={TABLER_STROKE} />;
}

function CloseMini({
  color = COLORS.text,
  size = 12,
}: MiniIconProps) {
  return <IconX aria-hidden color={color} size={size} stroke={TABLER_STROKE} />;
}

function PencilMini({
  color = COLORS.textSecondary,
  size = 14,
}: MiniIconProps) {
  return <IconPencil aria-hidden color={color} size={size} stroke={TABLER_STROKE} />;
}

function CopyMini({
  color = COLORS.textSecondary,
  size = 14,
}: MiniIconProps) {
  return <IconCopy aria-hidden color={color} size={size} stroke={TABLER_STROKE} />;
}

function getSidebarTone(
  tone: keyof typeof SIDEBAR_TONES,
): (typeof SIDEBAR_TONES)[keyof typeof SIDEBAR_TONES] {
  return SIDEBAR_TONES[tone];
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

function BrandLogo({
  brand,
  domain,
  label,
  size = 14,
}: {
  brand: HomeVisualBrand;
  domain?: string;
  label?: string;
  size?: number;
}) {
  const faviconUrl = getLogoUrlFromDomainName(
    domain ?? BRAND_FAVICON_DOMAINS[brand],
  );
  const [localFailedFaviconUrl, setLocalFailedFaviconUrl] = useState<
    string | null
  >(null);
  const showFavicon =
    faviconUrl !== undefined &&
    !failedFaviconUrls.has(faviconUrl) &&
    localFailedFaviconUrl !== faviconUrl;
  const radius = size <= 14 ? 4 : 4;

  const baseStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: `${radius}px`,
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
            setLocalFailedFaviconUrl(faviconUrl);
          }}
        />
      </div>
    );
  }

  if (brand === 'anthropic') {
    return (
      <div style={{ ...baseStyle, background: '#111111', color: '#ffffff' }}>
        A
      </div>
    );
  }

  if (brand === 'linkedin') {
    return (
      <div style={{ ...baseStyle, background: '#0a66c2', color: '#ffffff' }}>
        in
      </div>
    );
  }

  if (brand === 'slack') {
    return (
      <div
        style={{
          ...baseStyle,
          background: '#3f0f40',
          position: 'relative',
        }}
      >
        <span
          style={{
            position: 'absolute',
            width: '3px',
            height: '8px',
            background: '#36c5f0',
            borderRadius: '2px',
            transform: 'translateX(-2px)',
          }}
        />
        <span
          style={{
            position: 'absolute',
            width: '8px',
            height: '3px',
            background: '#2eb67d',
            borderRadius: '2px',
            transform: 'translateY(-2px)',
          }}
        />
        <span
          style={{
            position: 'absolute',
            width: '3px',
            height: '8px',
            background: '#e01e5a',
            borderRadius: '2px',
            transform: 'translateX(2px)',
          }}
        />
        <span
          style={{
            position: 'absolute',
            width: '8px',
            height: '3px',
            background: '#ecb22e',
            borderRadius: '2px',
            transform: 'translateY(2px)',
          }}
        />
      </div>
    );
  }

  if (brand === 'notion') {
    return (
      <div
        style={{
          ...baseStyle,
          background: '#ffffff',
          border: '1px solid #111111',
          color: '#111111',
        }}
      >
        N
      </div>
    );
  }

  if (brand === 'figma') {
    return (
      <div
        style={{
          ...baseStyle,
          background: '#111111',
          position: 'relative',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '2px',
            left: '3px',
            width: '4px',
            height: '4px',
            background: '#f24e1e',
            borderRadius: '50%',
          }}
        />
        <span
          style={{
            position: 'absolute',
            top: '6px',
            left: '3px',
            width: '4px',
            height: '4px',
            background: '#a259ff',
            borderRadius: '50%',
          }}
        />
        <span
          style={{
            position: 'absolute',
            top: '10px',
            left: '3px',
            width: '4px',
            height: '4px',
            background: '#1abcfe',
            borderRadius: '50%',
          }}
        />
        <span
          style={{
            position: 'absolute',
            top: '2px',
            left: '7px',
            width: '4px',
            height: '4px',
            background: '#ff7262',
            borderRadius: '50%',
          }}
        />
        <span
          style={{
            position: 'absolute',
            top: '6px',
            left: '7px',
            width: '4px',
            height: '4px',
            background: '#0acf83',
            borderRadius: '50%',
          }}
        />
      </div>
    );
  }

  if (brand === 'github') {
    return (
      <div
        style={{
          ...baseStyle,
          background: '#111111',
          borderRadius: '50%',
          color: '#ffffff',
        }}
      >
        G
      </div>
    );
  }

  if (brand === 'airbnb') {
    return (
      <div style={{ ...baseStyle, background: '#ff5a5f', color: '#ffffff' }}>
        A
      </div>
    );
  }

  if (brand === 'stripe') {
    return (
      <div style={{ ...baseStyle, background: '#635bff', color: '#ffffff' }}>
        S
      </div>
    );
  }

  if (brand === 'sequoia') {
    return (
      <div style={{ ...baseStyle, background: '#1a936f', color: '#ffffff' }}>
        S
      </div>
    );
  }

  if (brand === 'segment') {
    return (
      <div
        style={{
          ...baseStyle,
          background: '#e6faf5',
          borderRadius: '50%',
          border: '1px solid #8ad6c2',
          color: '#28a67a',
        }}
      >
        S
      </div>
    );
  }

  if (brand === 'mailchimp') {
    return (
      <div style={{ ...baseStyle, background: '#ffe01b', color: '#111111' }}>
        C
      </div>
    );
  }

  if (brand === 'accel') {
    return (
      <div style={{ ...baseStyle, background: '#5b2fb7', color: '#ffffff' }}>
        A
      </div>
    );
  }

  if (brand === 'founders-fund') {
    return (
      <div
        style={{
          ...baseStyle,
          background:
            'linear-gradient(180deg, #ff6b6b 0%, #ff6b6b 33%, #ffffff 33%, #ffffff 66%, #4ecdc4 66%, #4ecdc4 100%)',
          border: '1px solid #d6d6d6',
        }}
      />
    );
  }

  if (brand === 'google') {
    return (
      <div
        style={{
          ...baseStyle,
          background: '#ffffff',
          borderRadius: '50%',
          border: '1px solid #d6d6d6',
          color: '#4285f4',
          fontSize: size <= 14 ? '9px' : '10px',
        }}
      >
        G
      </div>
    );
  }

  if (brand === 'page-layout') {
    return (
      <div
        style={{
          ...baseStyle,
          background: '#d7f4df',
          border: '1px solid #bfe9cd',
          position: 'relative',
        }}
      >
        <span
          style={{
            position: 'absolute',
            inset: '3px',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gridTemplateRows: 'repeat(2, 1fr)',
            gap: '1px',
          }}
        >
          <span style={{ background: '#4f9f6c', borderRadius: '1px' }} />
          <span style={{ background: '#4f9f6c', borderRadius: '1px' }} />
          <span style={{ background: '#4f9f6c', borderRadius: '1px' }} />
          <span style={{ background: '#4f9f6c', borderRadius: '1px' }} />
        </span>
      </div>
    );
  }

  if (brand === 'claude') {
    return (
      <div
        style={{
          ...baseStyle,
          background: '#f1f1f1',
          borderRadius: '4px',
          color: '#222222',
          fontSize: '9px',
        }}
      >
        AI
      </div>
    );
  }

  if (brand === 'ben-chestnut') {
    return (
      <div
        style={{
          ...baseStyle,
          background: 'linear-gradient(180deg, #f5d6c6, #d8a98a)',
          borderRadius: '50%',
          color: '#6c3b1d',
        }}
      >
        B
      </div>
    );
  }

  return (
    <div style={{ ...baseStyle, background: '#ebebeb', color: '#666666' }}>
      {brand.slice(0, 1).toUpperCase()}
    </div>
  );
}

function renderSidebarIcon(
  icon: HomeVisualSidebarIcon,
): ReactNode {
  if (icon.kind === 'brand') {
    return (
      <SidebarIconSurface
        $background="transparent"
        $border="transparent"
        $color={COLORS.textSecondary}
      >
        <BrandLogo brand={icon.brand} size={16} />
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
    const tone = SIDEBAR_TONES[icon.tone];

    return (
      <SidebarAvatar
        $background={tone.background}
        $color={tone.color}
        $shape={icon.shape}
      >
        <span style={{ fontFamily: APP_FONT, fontSize: '10px', fontWeight: 500 }}>
          {icon.label}
        </span>
      </SidebarAvatar>
    );
  }

  const tone = getSidebarTone(icon.tone);

  return (
    <SidebarIconSurface
      $background={tone.background}
      $border={tone.border}
      $color={tone.color}
    >
      {icon.name === 'folder' ? (
        <FolderMini color={tone.color} stroke={NAVIGATION_TABLER_STROKE} />
      ) : null}
      {icon.name === 'buildingSkyscraper' ? (
        <BuildingMini color={tone.color} stroke={NAVIGATION_TABLER_STROKE} />
      ) : null}
      {icon.name === 'book' ? (
        <BookMini color={tone.color} stroke={NAVIGATION_TABLER_STROKE} />
      ) : null}
      {icon.name === 'box' ? (
        <BoxMini color={tone.color} stroke={NAVIGATION_TABLER_STROKE} />
      ) : null}
      {icon.name === 'checkbox' ? (
        <CheckboxMini color={tone.color} stroke={NAVIGATION_TABLER_STROKE} />
      ) : null}
      {icon.name === 'notes' ? (
        <NotesMini color={tone.color} stroke={NAVIGATION_TABLER_STROKE} />
      ) : null}
      {icon.name === 'playerPlay' ? (
        <PlayerPlayMini color={tone.color} stroke={NAVIGATION_TABLER_STROKE} />
      ) : null}
      {icon.name === 'settings' ? (
        <SettingsMini color={tone.color} stroke={NAVIGATION_TABLER_STROKE} />
      ) : null}
      {icon.name === 'settingsAutomation' ? (
        <SettingsAutomationMini
          color={tone.color}
          stroke={NAVIGATION_TABLER_STROKE}
        />
      ) : null}
      {icon.name === 'targetArrow' ? (
        <TargetArrowMini color={tone.color} stroke={NAVIGATION_TABLER_STROKE} />
      ) : null}
      {icon.name === 'user' ? (
        <UserMini color={tone.color} stroke={NAVIGATION_TABLER_STROKE} />
      ) : null}
      {icon.name === 'versions' ? (
        <VersionsMini color={tone.color} stroke={NAVIGATION_TABLER_STROKE} />
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

function SidebarItem({
  depth = 0,
  item,
}: {
  depth?: number;
  item: HomeVisualSidebarItem;
}) {
  return (
    <>
      <SidebarItemRow $active={item.active} $depth={depth}>
        {renderSidebarIcon(item.icon)}
        <SidebarItemText>
          <SidebarItemLabel>{item.label}</SidebarItemLabel>
          {item.meta ? <SidebarItemMeta>· {item.meta}</SidebarItemMeta> : null}
        </SidebarItemText>
        {item.showChevron || item.children?.length ? (
          <SidebarChevron>
            <ChevronDownMini color={COLORS.textTertiary} size={12} />
          </SidebarChevron>
        ) : null}
      </SidebarItemRow>
      {item.children?.length ? (
        <SidebarChildStack>
          <BranchLine />
          {item.children.map((child) => (
            <SidebarItem key={child.id} item={child} depth={depth + 1} />
          ))}
        </SidebarChildStack>
      ) : null}
    </>
  );
}

function HeaderFieldIcon({ column }: { column: HomeVisualColumnKey }) {
  if (column === 'url') {
    return <LinkMini />;
  }

  if (column === 'createdBy') {
    return <CreatedByMini />;
  }

  if (column === 'address') {
    return <MapMini />;
  }

  if (column === 'accountOwner') {
    return <UserCircleMini />;
  }

  if (column === 'icp') {
    return <TargetCircleMini />;
  }

  if (column === 'arr') {
    return <MoneybagMini />;
  }

  if (column === 'linkedin') {
    return <BrandLinkedinMini />;
  }

  if (column === 'industry') {
    return <BuildingFactoryMini />;
  }

  if (column === 'mainContact') {
    return <UserMini color={COLORS.textTertiary} size={16} />;
  }

  if (column === 'employees') {
    return <UsersMini />;
  }

  if (column === 'opportunities') {
    return <TargetArrowMini color={COLORS.textTertiary} size={16} />;
  }

  return <CalendarEventMini />;
}

function PersonToken({
  token,
  hovered = false,
  withCopyAction = true,
}: {
  token: HomeVisualPersonToken;
  hovered?: boolean;
  withCopyAction?: boolean;
}) {
  const tone = PERSON_TONES[token.tone];
  const square = token.kind === 'api' || token.kind === 'system' || token.kind === 'workflow';

  return (
    <div style={{ minWidth: 0, position: 'relative', width: '100%' }}>
      <CellChip
        clickable={false}
        label={token.label}
        leftComponent={
          <PersonAvatar
            $background={tone.background}
            $color={tone.color}
            $square={square}
          >
            {token.avatarUrl ? (
              <AvatarImage alt="" src={token.avatarUrl} />
            ) : (
              token.shortLabel ?? getInitials(token.label)
            )}
          </PersonAvatar>
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

function CompanyCell({
  hovered,
  row,
}: {
  hovered: boolean;
  row: HomeVisualRow;
}) {
  return (
    <CompanyCellLayout>
      <CheckboxContainer>
        <CheckboxBox />
      </CheckboxContainer>
      <CellChip
        clickable={false}
        label={row.companyLabel}
        leftComponent={
          <BrandLogo brand={row.companyBrand} label={row.companyLabel} />
        }
        variant={ChipVariant.Highlighted}
      />
      <HoverActions $visible={hovered}>
        <MiniAction aria-hidden="true">
          <PencilMini />
        </MiniAction>
      </HoverActions>
    </CompanyCellLayout>
  );
}

function UrlCell({ value }: { value: string }) {
  return <CellChip clickable={false} label={value} variant={ChipVariant.Static} />;
}

function LinkedinCell({
  hovered,
  value,
}: {
  hovered: boolean;
  value: string;
}) {
  return (
    <div style={{ minWidth: 0, position: 'relative', width: '100%' }}>
      <CellChip clickable={false} label={value} variant={ChipVariant.Static} />
      <HoverActions $visible={hovered}>
        <MiniAction aria-hidden="true">
          <PencilMini />
        </MiniAction>
      </HoverActions>
    </div>
  );
}

function IcpCell({ value }: { value: boolean }) {
  return (
    <BooleanRow>
      {value ? <CheckMini size={11} /> : <CloseMini size={11} />}
      <InlineText>{value ? 'True' : 'False'}</InlineText>
    </BooleanRow>
  );
}

function IndustryCell({ value }: { value: string }) {
  return <TagChip>{value}</TagChip>;
}

function OpportunitiesCell({
  hovered,
  tokens,
}: {
  hovered: boolean;
  tokens: HomeVisualPersonToken[];
}) {
  return (
    <div style={{ minWidth: 0, position: 'relative', width: '100%' }}>
      <MultiChipStack>
        {tokens.map((token) => {
          const tone = PERSON_TONES[token.tone];

          return (
            <CellChip
              key={token.label}
              clickable={false}
              label={token.label}
              leftComponent={
                <PersonAvatar
                  $background={tone.background}
                  $color={tone.color}
                >
                  {token.shortLabel ?? getInitials(token.label)}
                </PersonAvatar>
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

function renderCell(
  column: HomeVisualColumnKey,
  row: HomeVisualRow,
  hovered: boolean,
) {
  switch (column) {
    case 'company':
      return <CompanyCell hovered={hovered} row={row} />;
    case 'url':
      return <UrlCell value={row.url} />;
    case 'createdBy':
      return <PersonToken hovered={hovered} token={row.createdBy} />;
    case 'address':
      return <InlineText>{row.address}</InlineText>;
    case 'accountOwner':
      return <PersonToken hovered={hovered} token={row.accountOwner} />;
    case 'icp':
      return <IcpCell value={row.icp} />;
    case 'arr':
      return <RightAlignedText>{row.arr}</RightAlignedText>;
    case 'linkedin':
      return <LinkedinCell hovered={hovered} value={row.linkedin} />;
    case 'industry':
      return <IndustryCell value={row.industry} />;
    case 'mainContact':
      return <PersonToken hovered={hovered} token={row.mainContact} />;
    case 'employees':
      return <RightAlignedText>{row.employees}</RightAlignedText>;
    case 'opportunities':
      return <OpportunitiesCell hovered={hovered} tokens={row.opportunities} />;
    case 'added':
      return <InlineText>{row.added}</InlineText>;
  }
}

export function HomeVisual() {
  const shellRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startScrollLeft: 0,
    startX: 0,
  });

  const [dragging, setDragging] = useState(false);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

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
    if (event.pointerType !== 'mouse' || event.button !== 0 || !viewportRef.current) {
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
      dragRef.current.startScrollLeft - (event.clientX - dragRef.current.startX);
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

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (!viewportRef.current) {
      return;
    }

    if (
      viewportRef.current.scrollWidth <= viewportRef.current.clientWidth ||
      Math.abs(event.deltaY) <= Math.abs(event.deltaX)
    ) {
      return;
    }

    viewportRef.current.scrollLeft += event.deltaY;
    event.preventDefault();
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
            <Sidebar>
              <SidebarTopBar>
                <WorkspaceMenu>
                  <WorkspaceIcon>
                    <IconBrandApple aria-hidden color="#ffffff" size={11} stroke={2} />
                  </WorkspaceIcon>
                  <WorkspaceLabel>{HOME_VISUAL_WORKSPACE_NAME}</WorkspaceLabel>
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
                <SidebarSection>
                  <SidebarSectionLabel>Favorites</SidebarSectionLabel>
                  {HOME_VISUAL_FAVORITES.map((item) => (
                    <SidebarItem key={item.id} item={item} />
                  ))}
                </SidebarSection>

                <SidebarSection>
                  <SidebarSectionLabel>Workspace</SidebarSectionLabel>
                  {HOME_VISUAL_WORKSPACE.map((item) => (
                    <SidebarItem key={item.id} item={item} />
                  ))}
                </SidebarSection>

                <SidebarSection>
                  <SidebarSectionLabel>Other</SidebarSectionLabel>
                  {HOME_VISUAL_OTHER.map((item) => (
                    <SidebarItem key={item.id} item={item} />
                  ))}
                </SidebarSection>
              </SidebarScroll>
            </Sidebar>

            <RightPane>
              <Navbar>
                <Breadcrumb>
                  <BreadcrumbTag>
                    <AccentIconSurface>
                      <BuildingMini color={COLORS.accent} size={14} />
                    </AccentIconSurface>
                    <CrumbLabel>{HOME_VISUAL_BREADCRUMB_LABEL}</CrumbLabel>
                  </BreadcrumbTag>
                </Breadcrumb>

                <NavbarActions aria-hidden="true" inert>
                  <DesktopOnlyNavbarAction>
                    <HomeVisualButton
                      Icon={IconPlus}
                      title="New Record"
                      aria-label="New record"
                    />
                  </DesktopOnlyNavbarAction>
                  <HomeVisualButton
                    Icon={IconDotsVertical}
                    hotkeys={['⌘K']}
                    aria-label="Command menu"
                  />
                </NavbarActions>
              </Navbar>

              <IndexSurface>
                <Viewbar>
                  <ViewSwitcher aria-hidden="true">
                    <ListMini />
                    <ViewName>{HOME_VISUAL_VIEW_LABEL}</ViewName>
                    <TinyDot />
                    <ViewCount>{HOME_VISUAL_VIEW_COUNT}</ViewCount>
                    <ChevronDownMini color={COLORS.textLight} />
                  </ViewSwitcher>
                  <ViewActions>
                    {HOME_VISUAL_ACTIONS.map((action) => (
                      <ViewAction key={action}>{action}</ViewAction>
                    ))}
                  </ViewActions>
                </Viewbar>

                <TableShell>
                  <GripRail aria-hidden="true">
                    <GripCell />
                    {HOME_VISUAL_ROWS.map((row) => (
                      <GripCell key={`grip-${row.id}`} />
                    ))}
                    <GripCell />
                  </GripRail>

                  <TableViewport
                    ref={viewportRef}
                    $dragging={dragging}
                    aria-label="Interactive preview of the Companies table"
                    onPointerCancel={endDragging}
                    onPointerDown={handlePointerDown}
                    onPointerLeave={endDragging}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onWheel={handleWheel}
                  >
                    <TableCanvas $width={HOME_VISUAL_TABLE_TOTAL_WIDTH}>
                      <HeaderRow>
                        {HOME_VISUAL_COLUMNS.map((column) => (
                          <TableCell
                            key={column.key}
                            $align={column.align}
                            $header
                            $sticky={column.key === 'company'}
                            $width={column.width}
                          >
                            <HeaderCellContent>
                              {column.key === 'company' ? (
                                <>
                                  <CheckboxContainer>
                                    <CheckboxBox />
                                  </CheckboxContainer>
                                  <BuildingMini color={COLORS.textTertiary} size={16} />
                                  <HeaderLabel>{column.label}</HeaderLabel>
                                  <EdgePlus aria-hidden="true">
                                    <PlusMini color={COLORS.textTertiary} size={12} />
                                  </EdgePlus>
                                </>
                              ) : (
                                <>
                                  <HeaderFieldIcon column={column.key} />
                                  <HeaderLabel>{column.label}</HeaderLabel>
                                </>
                              )}
                            </HeaderCellContent>
                          </TableCell>
                        ))}
                        <EmptyFillCell $header $width={FILLER_WIDTH}>
                          {FILLER_WIDTH > 0 ? (
                            <HeaderFillContent>
                              <PlusMini color={COLORS.textTertiary} size={16} />
                            </HeaderFillContent>
                          ) : null}
                        </EmptyFillCell>
                      </HeaderRow>

                      {HOME_VISUAL_ROWS.map((row) => {
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
                            {HOME_VISUAL_COLUMNS.map((column) => (
                              <TableCell
                                key={`${row.id}-${column.key}`}
                                $align={column.align}
                                $hovered={hovered}
                                $sticky={column.key === 'company'}
                                $width={column.width}
                              >
                                {renderCell(column.key, row, hovered)}
                              </TableCell>
                            ))}
                            <EmptyFillCell $hovered={hovered} $width={FILLER_WIDTH} />
                          </DataRow>
                        );
                      })}

                      <FooterRow>
                        <TableCell $sticky $width={HOME_VISUAL_COLUMNS[0].width}>
                          <FooterFirstContent>
                            <MutedText>Calculate</MutedText>
                            <ChevronDownMini color={COLORS.textTertiary} size={14} />
                          </FooterFirstContent>
                        </TableCell>
                        {HOME_VISUAL_COLUMNS.slice(1).map((column) => (
                          <TableCell
                            key={`footer-${column.key}`}
                            $align={column.align}
                            $width={column.width}
                          />
                        ))}
                        <EmptyFillCell $footer $width={FILLER_WIDTH} />
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
