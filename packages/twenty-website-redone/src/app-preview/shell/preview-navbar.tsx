import { styled } from '@linaria/react';
import {
  IconChevronDown,
  IconChevronUp,
  IconDotsVertical,
  IconHeart,
  IconPlayerPause,
  IconPlus,
  IconRepeat,
} from '@tabler/icons-react';

import { mediaUp } from '@/tokens';
import { APP_PREVIEW_THEME } from '@/tokens/app-preview/app-preview-theme';

import { renderPreviewIcon } from '../primitives/preview-icon';
import { PREVIEW_COLORS } from '../preview-colors';
import { type NavbarAction, type SidebarItemDef } from '../types';

const NAVBAR_ACTION_ICON_MAP: Record<string, typeof IconPlus> = {
  chevronDown: IconChevronDown,
  chevronUp: IconChevronUp,
  dotsVertical: IconDotsVertical,
  heart: IconHeart,
  playerPause: IconPlayerPause,
  plus: IconPlus,
  repeat: IconRepeat,
};

const theme = APP_PREVIEW_THEME;

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
  color: ${PREVIEW_COLORS.text};
  font-family: ${theme.font.family};
  font-size: ${theme.font.sizePx.md}px;
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
  border: 1px solid ${theme.background.transparent.medium};
  border-radius: ${theme.border.radius.sm};
  display: inline-flex;
  flex: 0 1 auto;
  font-family: ${theme.font.family};
  font-size: ${theme.font.sizePx.md}px;
  font-weight: ${theme.font.weight.medium};
  gap: ${theme.spacingBasePx}px;
  height: 24px;
  justify-content: center;
  min-width: ${({ $iconOnly }) => ($iconOnly ? '24px' : '0')};
  max-width: 100%;
  padding: ${({ $iconOnly }) =>
    $iconOnly ? '0' : `0 ${theme.spacingBasePx * 2}px`};
  white-space: nowrap;
`;

const ActionIconWrap = styled.span`
  align-items: center;
  color: ${PREVIEW_COLORS.textSecondary};
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
`;

const ActionLabel = styled.span<{ $light?: boolean }>`
  color: ${({ $light }) =>
    $light ? PREVIEW_COLORS.textLight : PREVIEW_COLORS.textSecondary};
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
  gap: ${theme.spacingBasePx}px;
  height: 100%;

  ${mediaUp('md')} {
    display: inline-flex;
  }
`;

const ActionSeparator = styled.div`
  background: ${theme.background.transparent.medium};
  border-radius: 56px;
  height: 100%;
  width: 1px;
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
            size={theme.icon.size.sm}
            stroke={theme.icon.stroke.md}
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

export function PreviewNavbar({
  activeItem,
  activeItemLabel,
  navbarActions,
}: {
  activeItem?: SidebarItemDef;
  activeItemLabel: string;
  navbarActions?: NavbarAction[];
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
          <DefaultActions />
        )}
      </NavbarActions>
    </NavbarBar>
  );
}

function DefaultActions() {
  return (
    <>
      <DesktopOnlyAction>
        <ActionButton>
          <ActionIconWrap>
            <IconPlus
              aria-hidden
              size={theme.icon.size.sm}
              stroke={theme.icon.stroke.md}
            />
          </ActionIconWrap>
          <ActionLabel>New</ActionLabel>
        </ActionButton>
      </DesktopOnlyAction>
      <ActionButton>
        <ActionIconWrap>
          <IconDotsVertical
            aria-hidden
            size={theme.icon.size.sm}
            stroke={theme.icon.stroke.md}
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
