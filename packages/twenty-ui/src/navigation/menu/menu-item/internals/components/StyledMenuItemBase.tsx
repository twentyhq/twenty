import { styled } from '@linaria/react';

import { isUndefined } from '@sniptt/guards';

import { IconCheck } from '@ui/display';
import { themeVar } from '@ui/theme';
import { type MenuItemAccent } from '../../types/MenuItemAccent';

export type MenuItemBaseProps = {
  accent?: MenuItemAccent;
  isKeySelected?: boolean;
  isHoverBackgroundDisabled?: boolean;
  hovered?: boolean;
  disabled?: boolean;
  focused?: boolean;
};

export const StyledMenuItemBase = styled.div<MenuItemBaseProps>`
  --horizontal-padding: ${themeVar.spacing[1]};
  --vertical-padding: ${themeVar.spacing[2]};
  align-items: center;

  border-radius: ${themeVar.border.radius.sm};
  cursor: pointer;

  display: flex;

  flex-direction: row;

  font-size: ${themeVar.font.size.sm};

  gap: ${themeVar.spacing[2]};

  height: calc(32px - 2 * var(--vertical-padding));
  justify-content: space-between;

  padding: var(--vertical-padding) var(--horizontal-padding);

  background: ${({ isKeySelected, focused }) =>
    isKeySelected || focused ? themeVar.background.transparent.light : ''};

  transition: ${({ isHoverBackgroundDisabled, disabled }) =>
    disabled || isHoverBackgroundDisabled ? 'none' : 'background 0.1s ease'};

  color: ${({ accent, disabled }) => {
    if (!isUndefined(disabled) && disabled !== false) {
      return themeVar.font.color.tertiary;
    }
    switch (accent) {
      case 'danger':
        return themeVar.font.color.danger;
      case 'placeholder':
        return themeVar.font.color.tertiary;
      case 'default':
      default:
        return themeVar.font.color.secondary;
    }
  }};

  &:hover {
    background: ${({ accent, disabled, isHoverBackgroundDisabled }) => {
      if (disabled === true || isHoverBackgroundDisabled === true)
        return 'transparent';
      if (accent === 'danger') return themeVar.background.transparent.danger;
      return themeVar.background.transparent.light;
    }};
  }

  position: relative;
  user-select: none;

  width: calc(100% - 2 * var(--horizontal-padding));
`;

export const StyledMenuItemLabel = styled.div`
  display: flex;
  flex-direction: row;
  font-size: ${themeVar.font.size.md};
  font-weight: ${themeVar.font.weight.regular};

  overflow: hidden;

  white-space: nowrap;
`;

export const StyledMenuItemLabelLight = styled(StyledMenuItemLabel)`
  color: ${themeVar.font.color.light};
`;

export const StyledNoIconFiller = styled.div`
  width: ${themeVar.spacing[1]};
`;

export const StyledMenuItemLeftContent = styled.div`
  align-items: center;
  display: flex;

  flex-direction: row;

  gap: ${themeVar.spacing[2]};
  min-width: 0;
  width: 100%;

  & svg {
    flex-shrink: 0;
  }
`;

export const StyledMenuItemRightContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${themeVar.spacing[2]};

  & svg {
    flex-shrink: 0;
  }
`;

export const StyledDraggableItem = styled.div`
  cursor: grab;

  align-items: center;
  display: flex;
`;

type HoverableMenuItemBaseProps = {
  isIconDisplayedOnHoverOnly?: boolean;
  cursor?: 'drag' | 'default';
} & MenuItemBaseProps;

export const StyledHoverableMenuItemBase = styled(
  StyledMenuItemBase,
)<HoverableMenuItemBaseProps>`
  & .hoverable-buttons {
    opacity: ${({ isIconDisplayedOnHoverOnly }) =>
      isIconDisplayedOnHoverOnly === true ? '0' : '1'};
    right: ${({ isIconDisplayedOnHoverOnly }) =>
      isIconDisplayedOnHoverOnly === true ? themeVar.spacing[2] : 'auto'};
    transition: opacity ${themeVar.animation.duration.instant}s ease;
  }

  &:hover {
    & .hoverable-buttons {
      opacity: 1;
    }
    & .grip-swap-default-icon {
      opacity: 0;
    }
    & .grip-swap-hover-icon {
      opacity: 1;
    }
  }

  cursor: ${({ cursor, disabled }) => {
    if (!isUndefined(disabled) && disabled !== false) {
      return 'default';
    }

    switch (cursor) {
      case 'drag':
        return 'grab';
      default:
        return 'pointer';
    }
  }};
`;

export const StyledMenuItemIconCheck = styled(IconCheck)`
  flex-shrink: 0;
  margin-right: ${themeVar.spacing[1]};
`;

export const StyledMenuItemContextualText = styled.div`
  color: ${themeVar.font.color.light};
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  padding-left: ${themeVar.spacing[1]};
  flex-shrink: 1;
  overflow: hidden;
`;

export const StyledRightMenuItemContextualText = styled(
  StyledMenuItemContextualText,
)`
  text-align: right;
`;
