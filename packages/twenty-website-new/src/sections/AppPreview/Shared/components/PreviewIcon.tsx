import { styled } from '@linaria/react';
import {
  IconBook,
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconCheckbox,
  IconFolder,
  IconLayoutDashboard,
  IconLink,
  IconMapPin,
  IconNotes,
  IconPlanet,
  IconPlayerPlay,
  IconRocket,
  IconSettings,
  IconSettingsAutomation,
  IconTargetArrow,
  IconUser,
  IconVersions,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';

import type { SidebarIcon } from '../../types';
import { FaviconLogo } from './FaviconLogo';
import {
  APP_FONT,
  COLORS,
  NAVIGATION_TABLER_STROKE,
  TABLER_STROKE,
} from '../utils/app-preview-theme';

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
  red: { background: '#fdd8d8', border: '#f9c6c6', color: '#DC3D43' },
  teal: { background: '#c7ebe5', border: '#afdfd7', color: '#0E9888' },
  violet: { background: '#ebe5ff', border: '#d8cbff', color: '#5b3fd1' },
};

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

const SidebarIconSurface = styled.div<{
  $background: string;
  $border: string;
  $color: string;
  $pulse?: boolean;
}>`
  align-items: center;
  animation: ${({ $pulse }) =>
    $pulse
      ? 'objectAppearIcon 1400ms cubic-bezier(0.34, 1.7, 0.64, 1) both'
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

  @keyframes objectAppearIcon {
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
  font-weight: 500;
  height: 16px;
  justify-content: center;
  line-height: 1;
  width: 16px;
`;

function LinkMini({
  color = COLORS.textTertiary,
  size = 16,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <IconLink aria-hidden color={color} size={size} stroke={TABLER_STROKE} />
  );
}

function LinkOverlay() {
  return (
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
  );
}

export function renderPreviewIcon(
  icon: SidebarIcon,
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
        {icon.overlay === 'link' ? <LinkOverlay /> : null}
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
        {icon.label}
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
      {icon.overlay === 'link' ? <LinkOverlay /> : null}
    </SidebarIconSurface>
  );
}
