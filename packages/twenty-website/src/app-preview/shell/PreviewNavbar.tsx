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

// twenty-ui sizes a labelled button's start icon at icon.size.sm, and an
// icon-only button's at icon.size.md.
const LABELLED_ACTION_ICON_SIZE_PX = THEME_LIGHT.icon.size.sm;
const ICON_ONLY_ACTION_ICON_SIZE_PX = THEME_LIGHT.icon.size.md;

const NavbarBar = styled.div`
  align-items: center;
  background: ${THEME_LIGHT.background.secondary};
  border-bottom: 1px solid ${THEME_LIGHT.border.color.light};
  box-sizing: border-box;
  display: grid;
  flex-shrink: 0;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  height: ${APP_PREVIEW_CHROME.appHeaderHeightPx}px;
  min-width: 0;
  padding: 0 12px;
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
  font-family: var(--font-product), sans-serif;
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

const DesktopOnlyActions = styled.div`
  display: none;
  flex: 0 1 auto;
  gap: 8px;
  min-width: 0;

  ${mediaUp('md')} {
    display: flex;
  }
`;

const ActionButton = styled.div<{ $iconOnly?: boolean }>`
  align-items: center;
  background: ${THEME_LIGHT.background.transparent.lighter};
  border: 1px solid ${THEME_LIGHT.background.transparent.medium};
  border-radius: ${THEME_LIGHT.border.radius.md};
  color: ${THEME_LIGHT.font.color.secondary};
  display: inline-flex;
  flex: 0 1 auto;
  font-family: var(--font-product), sans-serif;
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

const PrimaryActionButton = styled(ActionButton)`
  background: ${THEME_LIGHT.color.blue};
  border-color: ${THEME_LIGHT.background.transparent.light};
  color: ${THEME_LIGHT.font.color.inverted};
`;

const ActionIconWrap = styled.span`
  align-items: center;
  color: inherit;
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
`;

const ActionLabel = styled.span`
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  const iconOnly = action.variant === 'icon' || !action.label;
  return (
    <ActionButton $iconOnly={iconOnly} key={`${action.icon}-${index}`}>
      {Icon ? (
        <ActionIconWrap>
          <Icon
            aria-hidden
            size={
              iconOnly
                ? ICON_ONLY_ACTION_ICON_SIZE_PX
                : LABELLED_ACTION_ICON_SIZE_PX
            }
            stroke={THEME_LIGHT.icon.stroke.md}
          />
        </ActionIconWrap>
      ) : null}
      {action.label ? <ActionLabel>{action.label}</ActionLabel> : null}
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
            size={LABELLED_ACTION_ICON_SIZE_PX}
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
      <DesktopOnlyActions>
        <PrimaryActionButton>
          <ActionIconWrap>
            <IconPlus
              aria-hidden
              size={LABELLED_ACTION_ICON_SIZE_PX}
              stroke={THEME_LIGHT.icon.stroke.md}
            />
          </ActionIconWrap>
          <ActionLabel>New Record</ActionLabel>
        </PrimaryActionButton>
        <ActionButton $iconOnly>
          <ActionIconWrap>
            <IconChevronUp
              aria-hidden
              size={ICON_ONLY_ACTION_ICON_SIZE_PX}
              stroke={THEME_LIGHT.icon.stroke.md}
            />
          </ActionIconWrap>
        </ActionButton>
        <ActionButton $iconOnly>
          <ActionIconWrap>
            <IconChevronDown
              aria-hidden
              size={ICON_ONLY_ACTION_ICON_SIZE_PX}
              stroke={THEME_LIGHT.icon.stroke.md}
            />
          </ActionIconWrap>
        </ActionButton>
      </DesktopOnlyActions>
      <ActionButton $iconOnly>
        <ActionIconWrap>
          <IconDotsVertical
            aria-hidden
            size={ICON_ONLY_ACTION_ICON_SIZE_PX}
            stroke={THEME_LIGHT.icon.stroke.md}
          />
        </ActionIconWrap>
      </ActionButton>
    </>
  );
}
