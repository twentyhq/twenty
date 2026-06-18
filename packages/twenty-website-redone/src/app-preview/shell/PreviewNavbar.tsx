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

import { EASING, mediaUp } from '@/tokens';
import { THEME_LIGHT } from 'twenty-ui/theme';
import { previewFontSize } from '@/app-preview/preview-font-size';
import { APP_PREVIEW_CHROME } from '@/app-preview/app-preview-chrome';

import { OBJECT_PINNED_ACTIONS } from '../data/object-pinned-actions';
import { renderPreviewIcon } from '../primitives/PreviewIcon';
import { type NavbarAction, type SidebarItemDef } from '../types';

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

const BreadcrumbIconSlot = styled.span`
  align-items: center;
  display: flex;
  flex: 0 0 16px;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const CrumbLabel = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-family: ${THEME_LIGHT.font.family};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
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

const DesktopOnlyAction = styled.div`
  display: none;
  flex: 0 1 auto;
  min-width: 0;

  ${mediaUp('md')} {
    display: block;
  }
`;

const ActionButton = styled.div<{ $iconOnly?: boolean }>`
  align-items: center;
  background: transparent;
  border: 1px solid ${THEME_LIGHT.background.transparent.medium};
  border-radius: ${THEME_LIGHT.border.radius.sm};
  display: inline-flex;
  flex: 0 1 auto;
  font-family: ${THEME_LIGHT.font.family};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
  gap: ${APP_PREVIEW_CHROME.spacingBasePx}px;
  height: 24px;
  justify-content: center;
  min-width: ${({ $iconOnly }) => ($iconOnly ? '24px' : '0')};
  max-width: 100%;
  padding: ${({ $iconOnly }) =>
    $iconOnly ? '0' : `0 ${APP_PREVIEW_CHROME.spacingBasePx * 2}px`};
  white-space: nowrap;
`;

const ActionIconWrap = styled.span`
  align-items: center;
  color: ${THEME_LIGHT.font.color.secondary};
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
`;

const ActionLabel = styled.span<{ $light?: boolean }>`
  color: ${({ $light }) =>
    $light ? THEME_LIGHT.font.color.light : THEME_LIGHT.font.color.secondary};
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DesktopOnlyTrailing = styled.div`
  align-items: center;
  display: none;
  gap: ${APP_PREVIEW_CHROME.spacingBasePx}px;
  height: 100%;

  ${mediaUp('md')} {
    display: inline-flex;
  }
`;

const ActionSeparator = styled.div`
  background: ${THEME_LIGHT.background.transparent.medium};
  border-radius: 56px;
  height: 100%;
  width: 1px;
`;

const PinnedActionButton = styled(ActionButton)<{
  $pinnedActionIndex: number;
}>`
  animation: pinnedActionIn 340ms ${EASING.standard} both;
  animation-delay: calc(
    ${({ $pinnedActionIndex }) => $pinnedActionIndex} * 90ms
  );
  display: none;
  gap: 4px;
  padding: 0 6px;

  ${mediaUp('md')} {
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

function renderProvidedAction(action: NavbarAction, index: number) {
  const Icon = NAVBAR_ACTION_ICON_MAP[action.icon];
  return (
    <ActionButton
      $iconOnly={action.variant === 'icon' || !action.label}
      key={`${action.icon}-${index}`}
    >
      {Icon ? (
        <ActionIconWrap>
          <Icon
            aria-hidden
            size={THEME_LIGHT.icon.size.sm}
            stroke={THEME_LIGHT.icon.stroke.md}
          />
        </ActionIconWrap>
      ) : null}
      {action.label ? <ActionLabel>{action.label}</ActionLabel> : null}
      {action.trailingLabel ? (
        <DesktopOnlyTrailing>
          <ActionSeparator />
          <ActionLabel $light>{action.trailingLabel}</ActionLabel>
        </DesktopOnlyTrailing>
      ) : null}
    </ActionButton>
  );
}

function renderPinnedAction(
  action: NavbarAction,
  index: number,
  activeItemId: string | undefined,
) {
  const Icon = NAVBAR_ACTION_ICON_MAP[action.icon];

  return (
    <PinnedActionButton
      $pinnedActionIndex={index}
      key={`pinned-${activeItemId}-${action.label}-${index}`}
    >
      {Icon ? (
        <ActionIconWrap>
          <Icon
            aria-hidden
            size={THEME_LIGHT.icon.size.sm}
            stroke={THEME_LIGHT.icon.stroke.md}
          />
        </ActionIconWrap>
      ) : null}
      <ActionLabel>{action.label}</ActionLabel>
    </PinnedActionButton>
  );
}

export function PreviewNavbar({
  activeItem,
  activeItemLabel,
  navbarActions,
  revealedObjectIds = [],
}: {
  activeItem?: SidebarItemDef;
  activeItemLabel: string;
  navbarActions?: NavbarAction[];
  revealedObjectIds?: string[];
}) {
  return (
    <NavbarBar>
      <Breadcrumb>
        <BreadcrumbTag>
          {activeItem ? (
            <BreadcrumbIconSlot>
              {renderPreviewIcon(activeItem.icon)}
            </BreadcrumbIconSlot>
          ) : null}
          <CrumbLabel>{activeItemLabel}</CrumbLabel>
        </BreadcrumbTag>
      </Breadcrumb>
      <NavbarActions aria-hidden>
        {navbarActions ? (
          navbarActions.map(renderProvidedAction)
        ) : (
          <DefaultActions
            activeItem={activeItem}
            revealedObjectIds={revealedObjectIds}
          />
        )}
      </NavbarActions>
    </NavbarBar>
  );
}

function DefaultActions({
  activeItem,
  revealedObjectIds,
}: {
  activeItem?: SidebarItemDef;
  revealedObjectIds: string[];
}) {
  const pinnedActions =
    activeItem && revealedObjectIds.includes(activeItem.id)
      ? OBJECT_PINNED_ACTIONS[activeItem.id]
      : undefined;

  return (
    <>
      {pinnedActions?.map((action, index) =>
        renderPinnedAction(action, index, activeItem?.id),
      )}
      <DesktopOnlyAction>
        <ActionButton>
          <ActionIconWrap>
            <IconPlus
              aria-hidden
              size={THEME_LIGHT.icon.size.sm}
              stroke={THEME_LIGHT.icon.stroke.md}
            />
          </ActionIconWrap>
          <ActionLabel>New</ActionLabel>
        </ActionButton>
      </DesktopOnlyAction>
      <ActionButton>
        <ActionIconWrap>
          <IconDotsVertical
            aria-hidden
            size={THEME_LIGHT.icon.size.sm}
            stroke={THEME_LIGHT.icon.stroke.md}
          />
        </ActionIconWrap>
        <DesktopOnlyTrailing>
          <ActionSeparator />
          <ActionLabel $light>⌘K</ActionLabel>
        </DesktopOnlyTrailing>
      </ActionButton>
    </>
  );
}
