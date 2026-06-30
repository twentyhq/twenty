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
import { type ReactNode } from 'react';

import { APP_PREVIEW_MOTION } from '@/tokens/app-preview/app-preview-motion';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { TwentyLogo } from '@/icons';

import { FaviconLogo } from './FaviconLogo';
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';
import { type SidebarIcon } from '../types';

// String keys are the derived standard-object icon names with the Icon
// prefix dropped (the drift check pins the bindings to twenty-server).
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
      ? `objectAppearIcon 1400ms ${APP_PREVIEW_MOTION.revealPopEase} both`
      : 'none'};
  background: ${({ $background }) => $background};
  border: 1px solid ${({ $border }) => $border};
  border-radius: ${THEME_LIGHT.border.radius.sm};
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
  font-family: var(--font-product), sans-serif;
  font-size: 10px;
  font-weight: ${THEME_LIGHT.font.weight.medium};
  height: 16px;
  justify-content: center;
  line-height: 1;
  width: 16px;
`;

const LinkOverlayFrame = styled.div`
  align-items: center;
  background: ${THEME_LIGHT.border.color.light};
  border-radius: ${THEME_LIGHT.border.radius.xs};
  bottom: -1px;
  display: flex;
  height: 7px;
  justify-content: center;
  position: absolute;
  right: -1px;
  width: 7px;
`;

function LinkOverlay() {
  return (
    <LinkOverlayFrame>
      <IconLink
        aria-hidden
        color={THEME_LIGHT.font.color.secondary}
        size={7}
        stroke={THEME_LIGHT.icon.stroke.sm}
      />
    </LinkOverlayFrame>
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
        $color={THEME_LIGHT.font.color.secondary}
        $pulse={pulse}
      >
        {icon.brand === 'twenty' ? (
          // The official mark is a component — never a raster copy.
          <TwentyLogo sizePx={14} />
        ) : (
          <FaviconLogo
            domain={icon.domain}
            label={icon.brand}
            size={icon.imageSrc ? 14 : 16}
            src={icon.imageSrc}
          />
        )}
        {icon.overlay === 'link' ? <LinkOverlay /> : null}
      </SidebarIconSurface>
    );
  }
  if (icon.kind === 'avatar') {
    const tone =
      APP_PREVIEW_TONES.sidebar[icon.tone] ?? APP_PREVIEW_TONES.sidebar.gray;
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
  const tone =
    APP_PREVIEW_TONES.sidebar[icon.tone] ?? APP_PREVIEW_TONES.sidebar.gray;
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
          stroke={THEME_LIGHT.icon.stroke.md}
        />
      ) : null}
      {icon.overlay === 'link' ? <LinkOverlay /> : null}
    </SidebarIconSurface>
  );
}
