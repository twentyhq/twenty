'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import {
  IconBox,
  IconCalendarClock,
  IconCalendarEvent,
  IconCalendarPlus,
  IconChevronDown,
  IconChevronUp,
  IconDotsVertical,
  IconFlag,
  IconHeart,
  IconPlayerPause,
  IconPlus,
  IconRepeat,
  IconRocket,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';

import type { NavbarAction, SidebarItemDef } from '../types';
import { OBJECT_PINNED_ACTIONS } from '../Data/object-pinned-actions';
import { renderPreviewIcon } from '../Shared/components/PreviewIcon';
import {
  APP_FONT,
  COLORS,
  NAVBAR_ACTION_TABLER_STROKE,
} from '../Shared/utils/app-preview-theme';
import { VISUAL_TOKENS } from '../Shared/utils/app-preview-tokens';

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

const PinnedActionButton = styled(NavbarActionButton)<{
  $pinnedActionIndex: number;
}>`
  animation: pinnedActionIn 340ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(
    ${({ $pinnedActionIndex }) => $pinnedActionIndex} * 90ms
  );
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

function getNavbarActionToneColor(tone: NavbarAction['labelTone']): string {
  if (tone === 'primary') {
    return VISUAL_TOKENS.font.color.primary;
  }

  if (tone === 'tertiary') {
    return VISUAL_TOKENS.font.color.light;
  }

  return VISUAL_TOKENS.font.color.secondary;
}

function renderNavbarAction(action: NavbarAction, index: number): ReactNode {
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

function renderPinnedAction(
  action: NavbarAction,
  index: number,
  activeItemId: string | undefined,
) {
  const Icon = NAVBAR_ACTION_ICON_MAP[action.icon] ?? IconPlus;

  return (
    <PinnedActionButton
      $pinnedActionIndex={index}
      key={`pinned-${activeItemId}-${action.label}-${index}`}
    >
      <NavbarActionIconWrap>
        <Icon
          aria-hidden
          size={VISUAL_TOKENS.icon.size.sm}
          stroke={NAVBAR_ACTION_TABLER_STROKE}
        />
      </NavbarActionIconWrap>
      <NavbarActionLabel>{action.label}</NavbarActionLabel>
    </PinnedActionButton>
  );
}

function renderDefaultActions(
  activeItem: SidebarItemDef | undefined,
  revealedObjectIds: string[],
) {
  const pinnedActions =
    activeItem && revealedObjectIds.includes(activeItem.id)
      ? OBJECT_PINNED_ACTIONS[activeItem.id]
      : undefined;

  return (
    <>
      {pinnedActions?.map((action, index) =>
        renderPinnedAction(action, index, activeItem?.id),
      )}
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
          <NavbarActionLabel $color={VISUAL_TOKENS.font.color.light}>
            ⌘K
          </NavbarActionLabel>
        </DesktopOnlyNavbarTrailing>
      </NavbarActionButton>
    </>
  );
}

type AppPreviewNavbarProps = {
  activeItem?: SidebarItemDef;
  activeLabel: string;
  navbarActions?: NavbarAction[];
  revealedObjectIds: string[];
};

export function AppPreviewNavbar({
  activeItem,
  activeLabel,
  navbarActions,
  revealedObjectIds,
}: AppPreviewNavbarProps) {
  return (
    <NavbarBar>
      <Breadcrumb>
        <BreadcrumbTag>
          {activeItem ? renderPreviewIcon(activeItem.icon) : null}
          <CrumbLabel>{activeLabel}</CrumbLabel>
        </BreadcrumbTag>
      </Breadcrumb>

      <NavbarActions aria-hidden>
        {navbarActions
          ? navbarActions.map(renderNavbarAction)
          : renderDefaultActions(activeItem, revealedObjectIds)}
      </NavbarActions>
    </NavbarBar>
  );
}
